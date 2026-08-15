import { buildMergeJobs } from './merge.js'
import { scaleForWidth, textStyleFromField } from './fieldStyle.js'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load the certificate template.'))
    image.src = src
  })
}

function paintCertificate(ctx, image, texts) {
  const scale = scaleForWidth(image.naturalWidth)
  ctx.clearRect(0, 0, image.naturalWidth, image.naturalHeight)
  ctx.drawImage(image, 0, 0)
  texts.forEach((text) => {
    const style = textStyleFromField(text)
    const fontSize = Math.max(8, style.fontSize * scale)
    const letterSpacing = style.letterSpacing * scale
    const x = text.x * image.naturalWidth
    const y = text.y * image.naturalHeight
    const weight = style.bold ? 'bold' : 'normal'
    const italic = style.italic ? 'italic' : 'normal'
    ctx.save()
    ctx.fillStyle = style.color
    ctx.textAlign = style.textAlign
    ctx.textBaseline = 'top'
    ctx.font = `${italic} ${weight} ${fontSize}px "${style.fontFamily}", Arial, sans-serif`
    if (ctx.letterSpacing !== undefined) {
      ctx.letterSpacing = `${letterSpacing}px`
    }
    ctx.translate(x, y)
    ctx.rotate((style.rotate * Math.PI) / 180)
    ctx.fillText(text.value, 0, 0)
    ctx.restore()
  })
}

export async function downloadMergedPdf({ templateDataUrl, rows, fields }) {
  const image = await loadImage(templateDataUrl)
  const jobs = buildMergeJobs(rows, fields)
  if (jobs.length === 0) {
    throw new Error('No recipients to merge.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not draw certificates.')
  }

  const { jsPDF } = await import('jspdf')
  const landscape = image.naturalWidth >= image.naturalHeight
  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  jobs.forEach((job, index) => {
    paintCertificate(ctx, image, job.texts)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    if (index > 0) {
      pdf.addPage('a4', landscape ? 'landscape' : 'portrait')
    }
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH)
  })

  pdf.save('certimagic-certificates.pdf')
}

export function createSampleCertificateDataUrl() {
  const canvas = document.createElement('canvas')
  canvas.width = 1400
  canvas.height = 990
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f4ecd4'
  ctx.fillRect(0, 0, 1400, 990)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 16
  ctx.strokeRect(48, 48, 1304, 894)
  ctx.lineWidth = 3
  ctx.strokeRect(68, 68, 1264, 854)
  ctx.fillStyle = '#6b4f1d'
  ctx.textAlign = 'center'
  ctx.font = 'italic 42px Georgia, serif'
  ctx.fillText('Certificate of Achievement', 700, 240)
  ctx.fillStyle = '#7a6a4a'
  ctx.font = '22px Georgia, serif'
  ctx.fillText('This is to certify that', 700, 360)
  ctx.fillText('has successfully completed the programme.', 700, 560)
  ctx.font = '16px Georgia, serif'
  ctx.fillText('Drop Name and IC onto the blank lines.', 700, 820)
  return canvas.toDataURL('image/png')
}
