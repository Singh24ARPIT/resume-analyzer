import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import {
  detectResumeKind,
  MAX_RESUME_BYTES,
  type ResumeKind,
} from "@/lib/parsing/validate";

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParseError";
  }
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function extractResumeText(file: File): Promise<{
  text: string;
  fileName: string;
  fileType: ResumeKind;
  fileSize: number;
}> {
  if (file.size === 0) {
    throw new ResumeParseError("That file is empty.");
  }

  if (file.size > MAX_RESUME_BYTES) {
    throw new ResumeParseError("Resumes must be 5 MB or smaller.");
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const kind = detectResumeKind(bytes, file.name);

  if (!kind) {
    throw new ResumeParseError(
      "That doesn't look like a PDF or DOCX. Export your resume as a PDF with a text layer and try again.",
    );
  }

  let raw = "";

  try {
    if (kind === "pdf") {
      const pdf = await getDocumentProxy(bytes);
      const result = await extractText(pdf, { mergePages: true });
      raw = result.text;
    } else {
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(buffer),
      });
      raw = result.value;
    }
  } catch {
    throw new ResumeParseError(
      "We couldn't read that file. Try re-exporting it as a PDF from your editor.",
    );
  }

  const text = cleanExtractedText(raw);

  if (text.length < 80) {
    throw new ResumeParseError(
      "This file has little or no selectable text. It may be a scanned PDF; export a text-based PDF or a DOCX and try again.",
    );
  }

  const meaningfulCharacters = (text.match(/[a-zA-Z]/g) ?? []).length;
  if (meaningfulCharacters < 60 || meaningfulCharacters / text.length < 0.25) {
    throw new ResumeParseError(
      "This file doesn't look like a readable resume. Try a text-based PDF or DOCX.",
    );
  }

  return {
    text,
    fileName: file.name,
    fileType: kind,
    fileSize: file.size,
  };
}
