export async function downloadCoverLetterDocx({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const blocks = body.split(/\n{2,}/).filter(Boolean);

  const paragraphs = blocks.map(
    (block) =>
      new Paragraph({
        spacing: { after: 240 },
        children: block.split("\n").map(
          (line) =>
            new TextRun({
              text: line,
              size: 23,
              font: "Calibri",
            }),
        ),
      }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            spacing: { after: 320 },
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 28,
                font: "Calibri",
              }),
            ],
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${title.replace(/[^\w\- ]+/g, "").trim() || "cover-letter"}.docx`;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadTextFile({
  fileName,
  text,
}: {
  fileName: string;
  text: string;
}) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
