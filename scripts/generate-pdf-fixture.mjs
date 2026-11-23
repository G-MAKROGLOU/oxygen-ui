// Generates the committed Storybook/test fixtures:
//   src/components/core/__fixtures__/pdf-highlight-sample.pdf
//   src/components/core/__fixtures__/pdf-highlight-sample.items.json
//
// A 4-page PDF with a hyphenated line end (page 1), an "fi" ligature glyph
// and a two-column section (page 2), repeated words and a table row (page 3),
// and a sentence that crosses the page 3 -> 4 break. The items JSON holds the
// pdf.js-extracted text items per page, for DOM tests that mock pdf.js.
// Hand-built uncompressed PDF syntax, so no extra dependency is needed.
//
//   node scripts/generate-pdf-fixture.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'src/components/core/__fixtures__')
const outPdf = resolve(outDir, 'pdf-highlight-sample.pdf')
const outItems = resolve(outDir, 'pdf-highlight-sample.items.json')

const page1 = `BT
/F1 24 Tf
72 770 Td
(OxygenUI Highlight Fixture) Tj
/F1 12 Tf
0 -40 Td
(This document exercises the PdfViewer search transfor-) Tj
0 -16 Td
(mation cases: a word is hyphenated across a line end.) Tj
0 -16 Td
(The quick brown fox jumps over the lazy dog on page one.) Tj
ET`

// \310 is byte 200, remapped to the /fi ligature glyph via /Differences.
const page2 = `BT
/F1 14 Tf
72 770 Td
(Ligatures and columns) Tj
/F2 12 Tf
0 -30 Td
(The speci\\310c con\\310guration uses a real \\310 ligature glyph.) Tj
ET
BT
/F1 10 Tf
72 680 Td
(Left column line one) Tj
0 -14 Td
(Left column line two) Tj
0 -14 Td
(Left column line three) Tj
ET
BT
/F1 10 Tf
320 680 Td
(Right column line one) Tj
0 -14 Td
(Right column line two) Tj
0 -14 Td
(Right column line three) Tj
ET`

// A table row: each cell is its own text item at its own x on one line.
const page3 = `BT
/F1 12 Tf
72 770 Td
(Page three closes the running text of the fixture document.) Tj
0 -16 Td
(Search for the word vessel: vessel appears here twice, vessel.) Tj
ET
BT
/F1 10 Tf
72 700 Td
(Vessel) Tj
ET
BT
/F1 10 Tf
250 700 Td
(IMO number) Tj
ET
BT
/F1 10 Tf
420 700 Td
(Status) Tj
ET
BT
/F1 10 Tf
72 684 Td
(MV Aurora) Tj
ET
BT
/F1 10 Tf
250 684 Td
(9876543) Tj
ET
BT
/F1 10 Tf
420 684 Td
(In service) Tj
ET
BT
/F1 12 Tf
72 100 Td
(The final clause of this agreement continues) Tj
ET`

const page4 = `BT
/F1 12 Tf
72 770 Td
(on the following page of the document.) Tj
0 -16 Td
(Page four ends the fixture.) Tj
ET`

const contents = [page1, page2, page3, page4]
const stream = (s) => `<< /Length ${s.length} >>\nstream\n${s}\nendstream`

// Objects: 1 catalog, 2 pages, 3..6 page objects, 7 F1, 8 F2, 9..12 contents.
const pageObj = (contentRef) =>
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> /Contents ${contentRef} 0 R >>`

const objects = [
    /* 1 */ `<< /Type /Catalog /Pages 2 0 R >>`,
    /* 2 */ `<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R 6 0 R] /Count 4 >>`,
    /* 3 */ pageObj(9),
    /* 4 */ pageObj(10),
    /* 5 */ pageObj(11),
    /* 6 */ pageObj(12),
    /* 7 */ `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    /* 8 */ `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [200 /fi] >> >>`,
    /* 9..12 */ ...contents.map(stream),
]

let pdf = '%PDF-1.4\n%âãÏÓ\n'
const offsets = [0]
for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
}
const xrefPos = pdf.length
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`

mkdirSync(outDir, { recursive: true })
writeFileSync(outPdf, Buffer.from(pdf, 'latin1'))
console.log(`Wrote ${outPdf} (${pdf.length} bytes)`)

// Extract the text items with the installed pdf.js legacy build, so DOM tests
// can mock pdf.js with the exact items the real document produces.
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
const task = pdfjs.getDocument({ data: new Uint8Array(readFileSync(outPdf)) })
const doc = await task.promise
const pages = []
for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent()
    pages.push(tc.items.map((it) => ({ str: it.str ?? '', ...(it.hasEOL ? { hasEOL: true } : {}) })))
}
await task.destroy()
writeFileSync(outItems, JSON.stringify(pages, null, 1) + '\n')
console.log(`Wrote ${outItems} (${pages.length} pages)`)
