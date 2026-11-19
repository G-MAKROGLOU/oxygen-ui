// Generates the committed Storybook fixture
// src/components/core/__fixtures__/pdf-highlight-sample.pdf: a small 3-page
// PDF with a hyphenated line end (page 1), an "fi" ligature glyph and a
// two-column section (page 2), and repeated plain words (page 3). Hand-built
// uncompressed PDF syntax, so no extra dependency is needed.
//
//   node scripts/generate-pdf-fixture.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'src/components/core/__fixtures__')
const outFile = resolve(outDir, 'pdf-highlight-sample.pdf')

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

const page3 = `BT
/F1 12 Tf
72 770 Td
(Page three closes the fixture document.) Tj
0 -16 Td
(Search for the word vessel: vessel appears here twice, vessel.) Tj
ET`

const stream = (s) => `<< /Length ${s.length} >>\nstream\n${s}\nendstream`

const objects = [
    /* 1 */ `<< /Type /Catalog /Pages 2 0 R >>`,
    /* 2 */ `<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>`,
    /* 3 */ `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 8 0 R >>`,
    /* 4 */ `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 9 0 R >>`,
    /* 5 */ `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 10 0 R >>`,
    /* 6 */ `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    /* 7 */ `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [200 /fi] >> >>`,
    /* 8 */ stream(page1),
    /* 9 */ stream(page2),
    /* 10 */ stream(page3),
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
writeFileSync(outFile, Buffer.from(pdf, 'latin1'))
console.log(`Wrote ${outFile} (${pdf.length} bytes)`)
