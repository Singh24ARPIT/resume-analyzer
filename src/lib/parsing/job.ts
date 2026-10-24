import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { load } from "cheerio";

export class JobImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JobImportError";
  }
}

const MAX_HTML_BYTES = 2_000_000;
const MAX_TEXT_CHARS = 20_000;

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateIp(address: string) {
  const family = isIP(address);
  if (family === 4) return isPrivateIpv4(address);
  if (family === 6) {
    const normalized = address.toLowerCase();
    if (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }
    if (normalized.startsWith("::ffff:")) {
      return isPrivateIpv4(normalized.replace("::ffff:", ""));
    }
    return false;
  }
  return true;
}

async function assertPublicUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new JobImportError("That doesn't look like a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new JobImportError("Only http and https URLs can be imported.");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost")
  ) {
    throw new JobImportError("That host isn't allowed.");
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new JobImportError("That host isn't allowed.");
    }
    return url;
  }

  let records;
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new JobImportError("We couldn't resolve that URL's host.");
  }

  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new JobImportError("That host isn't allowed.");
  }

  return url;
}

async function safeFetch(startUrl: URL) {
  let current = await assertPublicUrl(startUrl.toString());

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(9_000),
        headers: {
          "user-agent":
            "RolefitJobImporter/1.0 (+https://github.com/Singh24ARPIT; job description reader)",
          accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
          "accept-language": "en-US,en;q=0.8",
        },
      });
    } catch {
      throw new JobImportError(
        "We couldn't reach that page. Check the URL or paste the description instead.",
      );
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new JobImportError("That page redirected without a destination.");
      }
      current = await assertPublicUrl(new URL(location, current).toString());
      continue;
    }

    if (!response.ok) {
      throw new JobImportError(
        `That page returned ${response.status}. Some job boards block automated readers — paste the description instead.`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml") &&
      !contentType.includes("text/plain")
    ) {
      throw new JobImportError(
        "That URL isn't a readable job page. Paste the description instead.",
      );
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_HTML_BYTES) {
      throw new JobImportError("That page is too large to import.");
    }

    const html = await response.text();
    if (html.length > MAX_HTML_BYTES) {
      throw new JobImportError("That page is too large to import.");
    }

    return { html, finalUrl: current.toString() };
  }

  throw new JobImportError("That page redirected too many times.");
}

function findJobPosting(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }

  const record = node as Record<string, unknown>;
  const type = record["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((value) => value === "JobPosting")) return record;

  if (record["@graph"]) return findJobPosting(record["@graph"]);
  return null;
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtml(html: string) {
  const $ = load(html);
  $("script, style, noscript, svg").remove();
  return normalizeText($.root().text());
}

function firstString(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") return record.name;
  }
  return "";
}

export async function fetchJobFromUrl(value: string): Promise<{
  text: string;
  title: string;
  company: string;
  sourceUrl: string;
}> {
  const url = await assertPublicUrl(value.trim());
  const { html, finalUrl } = await safeFetch(url);
  const $ = load(html);

  let jsonLdTitle = "";
  let jsonLdCompany = "";
  let jsonLdDescription = "";

  $('script[type="application/ld+json"]').each((_, element) => {
    if (jsonLdDescription) return;
    const raw = $(element).text().trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as unknown;
      const posting = findJobPosting(parsed);
      if (!posting) return;

      jsonLdTitle = firstString(posting.title);
      jsonLdCompany = firstString(posting.hiringOrganization);
      const description = firstString(posting.description);
      if (description) jsonLdDescription = stripHtml(description);
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  });

  const pageTitle =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("h1").first().text().trim() ||
    $("title").first().text().trim();

  const siteName =
    $('meta[property="og:site_name"]').attr("content")?.trim() ||
    $('meta[name="application-name"]').attr("content")?.trim() ||
    "";

  let bodyText = jsonLdDescription;

  if (!bodyText) {
    $("script, style, noscript, svg, header, footer, nav, form, button, iframe").remove();
    const root = $("main").length
      ? $("main")
      : $("article").length
        ? $("article")
        : $("[class*='job'], [id*='job'], [class*='description']").length
          ? $("[class*='job'], [id*='job'], [class*='description']").first()
          : $("body");
    bodyText = normalizeText(root.text());
  }

  if (!bodyText || bodyText.length < 180) {
    throw new JobImportError(
      "We couldn't find enough readable text on that page. Paste the description instead.",
    );
  }

  const title = normalizeText(
    (jsonLdTitle || pageTitle || "Target role")
      .replace(/^job application for\s+/i, "")
      .replace(/\s*[|–—]\s*[^|–—]{2,40}$/g, "")
      .slice(0, 160),
  );

  const company = normalizeText((jsonLdCompany || siteName || "").slice(0, 120));

  return {
    text: bodyText.slice(0, MAX_TEXT_CHARS),
    title: title || "Target role",
    company: company || "Company not specified",
    sourceUrl: finalUrl,
  };
}
