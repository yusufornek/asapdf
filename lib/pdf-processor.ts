import { PDFDocument } from "pdf-lib"
import { marked } from "marked"
import puppeteer from "puppeteer"

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return await mergedPdf.save()
}

export async function markdownToPDF(files: File[]): Promise<Uint8Array> {
  let combinedMarkdown = ""

  for (const file of files) {
    const text = await file.text()
    combinedMarkdown += text + "\n\n---\n\n"
  }

  const html = marked(combinedMarkdown)

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #2c3e50;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        code {
          background: #f4f4f4;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Monaco', 'Consolas', monospace;
        }
        pre {
          background: #f4f4f4;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
        }
        blockquote {
          border-left: 4px solid #ddd;
          margin: 0;
          padding-left: 16px;
          color: #666;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `

  await page.setContent(fullHtml)

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
    printBackground: true,
  })

  await browser.close()

  return new Uint8Array(pdfBuffer)
}

export async function pptxToPDF(files: File[]): Promise<Uint8Array> {
  // For PPTX conversion, you would typically use a service like:
  // - LibreOffice headless
  // - Microsoft Graph API
  // - CloudConvert API
  // - Aspose API

  // For now, we'll create a placeholder PDF with file information
  const pdf = await PDFDocument.create()

  for (const file of files) {
    const page = pdf.addPage([595.28, 841.89]) // A4 size

    page.drawText(`PowerPoint File: ${file.name}`, {
      x: 50,
      y: 750,
      size: 16,
    })

    page.drawText(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`, {
      x: 50,
      y: 720,
      size: 12,
    })

    page.drawText("This is a placeholder conversion.", {
      x: 50,
      y: 680,
      size: 12,
    })

    page.drawText("In production, this would be converted using:", {
      x: 50,
      y: 650,
      size: 12,
    })

    page.drawText("• LibreOffice headless conversion", {
      x: 70,
      y: 620,
      size: 10,
    })

    page.drawText("• Microsoft Graph API", {
      x: 70,
      y: 600,
      size: 10,
    })

    page.drawText("• CloudConvert or similar service", {
      x: 70,
      y: 580,
      size: 10,
    })
  }

  return await pdf.save()
}
