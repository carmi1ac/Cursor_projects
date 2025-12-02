import { jsPDF } from "jspdf"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
}

export async function exportNoteAsText(note: Note) {
  const content = `${note.title}\n\n${note.content}\n\nCreated: ${new Date(note.createdAt).toLocaleString()}\nUpdated: ${new Date(note.updatedAt).toLocaleString()}`
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  saveAs(blob, `${note.title.replace(/[^a-z0-9]/gi, "_")}.txt`)
}

export async function exportNoteAsPDF(note: Note) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - margin * 2
  let yPosition = margin

  // Title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  const titleLines = doc.splitTextToSize(note.title, maxWidth)
  doc.text(titleLines, margin, yPosition)
  yPosition += titleLines.length * 7 + 10

  // Content
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  const contentLines = doc.splitTextToSize(note.content, maxWidth)
  
  contentLines.forEach((line: string) => {
    if (yPosition > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      yPosition = margin
    }
    doc.text(line, margin, yPosition)
    yPosition += 7
  })

  yPosition += 10

  // Metadata
  doc.setFontSize(10)
  doc.setTextColor(128, 128, 128)
  const createdText = `Created: ${new Date(note.createdAt).toLocaleString()}`
  const updatedText = `Updated: ${new Date(note.updatedAt).toLocaleString()}`
  
  if (yPosition > doc.internal.pageSize.getHeight() - margin - 10) {
    doc.addPage()
    yPosition = margin
  }
  doc.text(createdText, margin, yPosition)
  yPosition += 5
  doc.text(updatedText, margin, yPosition)

  doc.save(`${note.title.replace(/[^a-z0-9]/gi, "_")}.pdf`)
}

export async function exportNoteAsDOCX(note: Note) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: note.title,
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: note.content,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created: ${new Date(note.createdAt).toLocaleString()}`,
                size: 20,
                color: "808080",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Updated: ${new Date(note.updatedAt).toLocaleString()}`,
                size: 20,
                color: "808080",
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${note.title.replace(/[^a-z0-9]/gi, "_")}.docx`)
}

