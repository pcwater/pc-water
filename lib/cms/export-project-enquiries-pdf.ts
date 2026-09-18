import type { jsPDF as JsPdfDocument } from 'jspdf'

import type { ProjectEnquiry } from '@/lib/project-enquiries'

const NAVY: [number, number, number] = [13, 34, 53]
const BLUE: [number, number, number] = [52, 152, 219]
const LINK_BLUE: [number, number, number] = [36, 120, 181]
const SLATE: [number, number, number] = [70, 81, 92]
const TEXT: [number, number, number] = [35, 49, 61]
const MUTED: [number, number, number] = [104, 119, 130]
const BORDER: [number, number, number] = [215, 226, 232]
const PALE: [number, number, number] = [245, 248, 250]
const PALE_BLUE: [number, number, number] = [234, 245, 251]
const WHITE: [number, number, number] = [255, 255, 255]
const PAGE = { left: 12, right: 12, top: 10, footerY: 196 }
const FIRST_MESSAGE_PAGE_LINES = 17
const CONTINUATION_PAGE_LINES = 29

export interface EnquiryPdfContext {
  search?: string
  status?: string
}

function value(input: string | number | null | undefined, fallback = 'Not specified') {
  const text = String(input ?? '').trim()
  return text || fallback
}

function fullName(enquiry: ProjectEnquiry) {
  const firstName = enquiry.firstName.trim()
  const lastName = enquiry.lastName.trim()
  return firstName.localeCompare(lastName, undefined, { sensitivity: 'base' }) === 0
    ? firstName
    : `${firstName} ${lastName}`.trim()
}

function titleCase(input: string) {
  return input.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatReportDate(date: Date) {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane', day: '2-digit', month: 'short', year: 'numeric',
  }).format(date)
}

function formatFileDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function fitLines(doc: JsPdfDocument, text: string, width: number, maxLines: number) {
  const lines = doc.splitTextToSize(text, width) as string[]
  if (lines.length <= maxLines) return lines
  const clipped = lines.slice(0, maxLines)
  clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/[. ]+$/, '')}...`
  return clipped
}

function addBrandHeader(doc: JsPdfDocument, generatedAt: Date, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - PAGE.left - PAGE.right
  const logoWidth = 25
  const bodyX = PAGE.left + logoWidth

  doc.setFillColor(...BLUE)
  doc.rect(PAGE.left, PAGE.top, logoWidth, 27, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('PC', PAGE.left + logoWidth / 2, PAGE.top + 11, { align: 'center' })
  doc.text('WATER', PAGE.left + logoWidth / 2, PAGE.top + 19, { align: 'center' })

  doc.setFillColor(...NAVY)
  doc.rect(bodyX, PAGE.top, contentWidth - logoWidth, 19, 'F')
  doc.setFontSize(15)
  doc.text('PC WATER INFRASTRUCTURE', bodyX + 3, PAGE.top + 7)
  doc.setFontSize(10)
  doc.setTextColor(191, 215, 229)
  doc.text('PROJECT ENQUIRY PIPELINE', bodyX + 3, PAGE.top + 14)

  doc.setFillColor(...SLATE)
  doc.rect(bodyX, PAGE.top + 19, contentWidth - logoWidth, 8, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...WHITE)
  doc.text(
    `Engineered Water Systems  •  Enquiry snapshot from ${formatReportDate(generatedAt)} export${subtitle ? `  •  ${subtitle}` : ''}  •  pcwater.com.au`,
    bodyX + 3,
    PAGE.top + 24.5,
  )
  doc.setFillColor(...BLUE)
  doc.rect(PAGE.left, PAGE.top + 27, contentWidth, 1.6, 'F')
}

function addFooter(doc: JsPdfDocument, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - PAGE.left - PAGE.right
  doc.setFillColor(...SLATE)
  doc.rect(PAGE.left, PAGE.footerY, contentWidth, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...WHITE)
  doc.text('PC WATER INFRASTRUCTURE  •  Engineered Water Systems  •  pcwater.com.au', pageWidth / 2, PAGE.footerY + 5.2, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.text(`CONFIDENTIAL  •  PAGE ${pageNumber} OF ${totalPages}`, pageWidth - PAGE.right, 208, { align: 'right' })
}

function addSectionBand(doc: JsPdfDocument, label: string, y: number) {
  const width = doc.internal.pageSize.getWidth() - PAGE.left - PAGE.right
  doc.setFillColor(...NAVY)
  doc.rect(PAGE.left, y, width, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...WHITE)
  doc.text(label, PAGE.left + 2.5, y + 5.3)
}

function addMetricCard(doc: JsPdfDocument, x: number, y: number, width: number, label: string, metric: number, note: string) {
  doc.setFillColor(...PALE)
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.25)
  doc.rect(x, y, width, 25, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.setFontSize(7.5)
  doc.text(label, x + width / 2, y + 6, { align: 'center' })
  doc.setTextColor(...NAVY)
  doc.setFontSize(16)
  doc.text(String(metric), x + width / 2, y + 14.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.setFontSize(6.8)
  doc.text(note, x + width / 2, y + 21.2, { align: 'center' })
}

function addLeadSummary(doc: JsPdfDocument, enquiry: ProjectEnquiry, y: number) {
  const width = doc.internal.pageSize.getWidth() - PAGE.left - PAGE.right
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...BORDER)
  doc.rect(PAGE.left, y, width, 22, 'FD')
  doc.setFillColor(...BLUE)
  doc.rect(PAGE.left, y, 3, 22, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text(fullName(enquiry).toUpperCase(), PAGE.left + 6, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(...LINK_BLUE)
  doc.text(enquiry.email, PAGE.left + 6, y + 13)
  doc.setTextColor(...TEXT)
  doc.text(value(enquiry.phone), PAGE.left + 6, y + 18)

  const companyX = PAGE.left + 74
  const scopeX = PAGE.left + 158
  const pipelineX = PAGE.left + 237
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.setFontSize(6.5)
  doc.text('PROJECT / ORGANISATION', companyX, y + 5)
  doc.text('SCOPE', scopeX, y + 5)
  doc.text('PIPELINE', pipelineX, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT)
  doc.setFontSize(7.2)
  doc.text(fitLines(doc, value(enquiry.company, 'Organisation not supplied'), 78, 2), companyX, y + 10)
  doc.text(fitLines(doc, `${value(enquiry.service, 'Service not specified')}\n${value(enquiry.tankType)}`, 73, 2), scopeX, y + 10)
  doc.text(fitLines(doc, `${value(enquiry.projectStage, 'Stage not specified')}\nStatus: ${enquiry.submissionStatus}`, 34, 2), pipelineX, y + 10)
}

function addLeadNameBand(doc: JsPdfDocument, enquiry: ProjectEnquiry, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const width = pageWidth - PAGE.left - PAGE.right
  const locationWidth = 72
  doc.setDrawColor(...BORDER)
  doc.setFillColor(...WHITE)
  doc.rect(PAGE.left, y, width, 12, 'FD')
  doc.setFillColor(...BLUE)
  doc.rect(PAGE.left, y, 4, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text(fullName(enquiry).toUpperCase(), PAGE.left + 7, y + 8)
  doc.setFillColor(...PALE_BLUE)
  doc.rect(pageWidth - PAGE.right - locationWidth, y, locationWidth, 12, 'F')
  doc.setFontSize(8)
  doc.setTextColor(...LINK_BLUE)
  doc.text(
    [enquiry.suburbTown, enquiry.state].filter(Boolean).join(' • ').toUpperCase() || 'LOCATION NOT SUPPLIED',
    pageWidth - PAGE.right - locationWidth / 2,
    y + 7.5,
    { align: 'center' },
  )
}

function addField(doc: JsPdfDocument, x: number, y: number, width: number, label: string, text: string, link = false) {
  doc.setFillColor(...PALE)
  doc.setDrawColor(...BORDER)
  doc.rect(x, y, width, 32, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.8)
  doc.setTextColor(...MUTED)
  doc.text(label, x + 2.5, y + 5.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...(link ? LINK_BLUE : TEXT))
  doc.text(fitLines(doc, text, width - 5, 4), x + 2.5, y + 11, { lineHeightFactor: 1.35 })
}

function addChip(doc: JsPdfDocument, x: number, y: number, width: number, label: string, content: string) {
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...BORDER)
  doc.rect(x, y, width, 11, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.7)
  doc.setTextColor(...SLATE)
  doc.text(`${label}  |`, x + 2.5, y + 6.8)
  const labelWidth = doc.getTextWidth(`${label}  |`)
  doc.setTextColor(...TEXT)
  doc.text(fitLines(doc, content, width - labelWidth - 6, 1), x + labelWidth + 4, y + 6.8)
}

function addMessagePanel(doc: JsPdfDocument, lines: string[], continued = false) {
  const contentWidth = doc.internal.pageSize.getWidth() - PAGE.left - PAGE.right
  const bandY = continued ? 60 : 109
  const bodyY = bandY + 8
  const bodyBottom = PAGE.footerY - 4
  doc.setFillColor(...PALE_BLUE)
  doc.setDrawColor(...BORDER)
  doc.rect(PAGE.left, bandY, contentWidth, 8, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.4)
  doc.setTextColor(...LINK_BLUE)
  doc.text(`PROJECT DESCRIPTION / MESSAGE${continued ? ' (CONTINUED)' : ''}`, PAGE.left + 2.5, bandY + 5.2)
  doc.setFillColor(...WHITE)
  doc.rect(PAGE.left, bodyY, contentWidth, bodyBottom - bodyY, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.2)
  doc.setTextColor(...TEXT)
  doc.text(lines, PAGE.left + 3, bodyY + 6, { lineHeightFactor: 1.35 })
}

function addLeadDetailPages(doc: JsPdfDocument, enquiry: ProjectEnquiry, generatedAt: Date) {
  doc.addPage()
  addBrandHeader(doc, generatedAt)
  addLeadNameBand(doc, enquiry, 45)
  const fieldWidth = (doc.internal.pageSize.getWidth() - PAGE.left - PAGE.right) / 4
  addField(doc, PAGE.left, 59, fieldWidth, 'CONTACT', `${enquiry.email}\n${value(enquiry.phone)}`, true)
  addField(doc, PAGE.left + fieldWidth, 59, fieldWidth, 'PROJECT / ORGANISATION', `${value(enquiry.company, 'Organisation not supplied')}\nSubmitted: ${formatReportDate(new Date(enquiry.submittedAt))}`)
  addField(doc, PAGE.left + fieldWidth * 2, 59, fieldWidth, 'SCOPE', `${value(enquiry.service, 'Service not specified')}\n${value(enquiry.tankType)}`)
  addField(doc, PAGE.left + fieldWidth * 3, 59, fieldWidth, 'PIPELINE', `${value(enquiry.projectStage, 'Stage not specified')}\nStatus: ${enquiry.submissionStatus}`)
  addChip(doc, PAGE.left, 93, fieldWidth, 'INDUSTRY', value(enquiry.industry))
  addChip(doc, PAGE.left + fieldWidth, 93, fieldWidth, 'TIMELINE', value(enquiry.timeline))
  addChip(doc, PAGE.left + fieldWidth * 2, 93, fieldWidth, 'BUDGET', value(enquiry.budget))
  addChip(doc, PAGE.left + fieldWidth * 3, 93, fieldWidth, 'EMAIL', enquiry.emailDeliveryStatus)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.2)
  const allLines = doc.splitTextToSize(value(enquiry.message, 'No project message supplied.'), doc.internal.pageSize.getWidth() - PAGE.left - PAGE.right - 6) as string[]
  addMessagePanel(doc, allLines.splice(0, FIRST_MESSAGE_PAGE_LINES))
  while (allLines.length > 0) {
    doc.addPage()
    addBrandHeader(doc, generatedAt)
    addLeadNameBand(doc, enquiry, 45)
    addMessagePanel(doc, allLines.splice(0, CONTINUATION_PAGE_LINES), true)
  }
}

export async function buildProjectEnquiriesPdf(enquiries: ProjectEnquiry[], context: EnquiryPdfContext = {}) {
  if (enquiries.length === 0) return null
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const generatedAt = new Date()
  const readyToQuote = enquiries.filter((item) => value(item.projectStage, '').toLowerCase().includes('ready to quote')).length
  const emailSent = enquiries.filter((item) => item.emailDeliveryStatus === 'sent').length
  const newLeads = enquiries.filter((item) => item.submissionStatus === 'new').length
  const filterText = [
    context.status && context.status !== 'All' ? `Status: ${titleCase(context.status)}` : '',
    context.search?.trim() ? `Search: ${context.search.trim()}` : '',
  ].filter(Boolean).join('  •  ')

  doc.setProperties({
    title: `PC Water Project Enquiries - ${formatFileDate(generatedAt)}`,
    subject: 'Confidential project enquiry pipeline and lead detail report',
    author: 'PC Water Infrastructure',
    creator: 'PC Water CMS',
  })
  addBrandHeader(doc, generatedAt, filterText)

  const contentWidth = doc.internal.pageSize.getWidth() - PAGE.left - PAGE.right
  const gap = 3
  const cardWidth = (contentWidth - gap * 3) / 4
  addMetricCard(doc, PAGE.left, 45, cardWidth, 'TOTAL ENQUIRIES', enquiries.length, 'Requested project leads')
  addMetricCard(doc, PAGE.left + cardWidth + gap, 45, cardWidth, 'READY TO QUOTE', readyToQuote, 'Commercially advanced')
  addMetricCard(doc, PAGE.left + (cardWidth + gap) * 2, 45, cardWidth, 'EMAIL SENT', emailSent, 'Initial response dispatched')
  addMetricCard(doc, PAGE.left + (cardWidth + gap) * 3, 45, cardWidth, 'NEW STATUS', newLeads, 'Current CRM status')
  addSectionBand(doc, 'ACTIVE PROJECT ENQUIRIES', 77)

  let summaryY = 88
  enquiries.forEach((enquiry) => {
    if (summaryY + 22 > PAGE.footerY - 4) {
      doc.addPage()
      addBrandHeader(doc, generatedAt, filterText)
      addSectionBand(doc, 'ACTIVE PROJECT ENQUIRIES (CONTINUED)', 45)
      summaryY = 56
    }
    addLeadSummary(doc, enquiry, summaryY)
    summaryY += 25
  })
  enquiries.forEach((enquiry) => addLeadDetailPages(doc, enquiry, generatedAt))

  const totalPages = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber)
    addFooter(doc, pageNumber, totalPages)
  }
  return doc
}

export async function exportProjectEnquiriesPdf(enquiries: ProjectEnquiry[], context: EnquiryPdfContext = {}) {
  const doc = await buildProjectEnquiriesPdf(enquiries, context)
  if (doc) doc.save(`pc-water-project-enquiries-${formatFileDate(new Date())}.pdf`)
}
