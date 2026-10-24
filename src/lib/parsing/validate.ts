export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export type ResumeKind = "pdf" | "docx";

export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"];

export function detectResumeKind(
  bytes: Uint8Array,
  fileName: string,
): ResumeKind | null {
  const extension = fileName.split(".").pop()?.toLowerCase();

  // %PDF-
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "pdf";
  }

  // Every DOCX is a ZIP archive. Require the extension too, since .zip is not
  // an accepted resume format.
  if (
    extension === "docx" &&
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return "docx";
  }

  return null;
}

export function humanFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
