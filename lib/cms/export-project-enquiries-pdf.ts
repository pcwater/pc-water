import type { jsPDF as JsPdfDocument } from 'jspdf'

import type { ProjectEnquiry } from '@/lib/project-enquiries'

const NAVY: [number, number, number] = [31, 58, 98]
const TEXT: [number, number, number] = [30, 34, 41]
const MUTED: [number, number, number] = [132, 137, 145]
const BORDER: [number, number, number] = [187, 194, 203]
const PALE: [number, number, number] = [240, 243, 247]
const WHITE: [number, number, number] = [255, 255, 255]

const PAGE = {
  left: 18,
  right: 18,
  contentWidth: 174,
  top: 25,
  bottom: 279,
}

type AutoTableDocument = JsPdfDocument & {
  lastAutoTable?: { finalY?: number }
}

function value(input: string | number | null | undefined) {
  const text = String(input ?? '').trim()
  return text || '-'
}

function fullName(enquiry: ProjectEnquiry) {
  const firstName = enquiry.firstName.trim()
  const lastName = enquiry.lastName.trim()
  return firstName.localeCompare(lastName, undefined, { sensitivity: 'base' }) === 0
    ? firstName
    : `${firstName} ${lastName}`.trim()
}

function formatDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return value(iso)

  return date.toLocaleString('en-AU', {
    timeZone: 'Australia/Brisbane',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatReportDate(date: Date) {
  return date.toLocaleString('en-AU', {
    timeZone: 'Australia/Brisbane',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}

function formatFileDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function titleCase(input: string) {
  return input
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function addRunningFurniture(doc: JsPdfDocument, pageNumber: number, totalPages: number) {
  const width = doc.internal.pageSize.getWidth()

  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.25)
  doc.line(PAGE.left, 17, width - PAGE.right, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  const suffix = ' | Lead Enquiry Report'
  doc.text(suffix, width - PAGE.right, 14, { align: 'right' })

  const suffixWidth = doc.getTextWidth(suffix)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('PC WATER INFRASTRUCTURE', width - PAGE.right - suffixWidth, 14, { align: 'right' })

  doc.setDrawColor(218, 222, 228)
  doc.line(PAGE.left, 283, width - PAGE.right, 283)
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(`Confidential | PC Water Infrastructure | Page ${pageNumber} of ${totalPages}`, PAGE.left, 288)
}

function addSectionHeading(doc: JsPdfDocument, heading: string, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text(heading, PAGE.left, y)
}

function ensureSpace(doc: JsPdfDocument, y: number, requiredHeight: number) {
  if (y + requiredHeight <= PAGE.bottom) return y
  doc.addPage()
  return PAGE.top + 4
}

function lastTableY(doc: AutoTableDocument, fallback: number) {
  return doc.lastAutoTable?.finalY ?? fallback
}

export interface EnquiryPdfContext {
  search?: string
  status?: string
}

export async function buildProjectEnquiriesPdf(
  enquiries: ProjectEnquiry[],
  context: EnquiryPdfContext = {},
) {
  if (enquiries.length === 0) return null

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const generatedAt = new Date()
  const uniqueContacts = new Set(enquiries.map((item) => item.email.toLowerCase())).size
  const crmSynced = enquiries.filter((item) => Boolean(item.pipedriveLeadId)).length
  const newLeads = enquiries.filter((item) => item.submissionStatus === 'new').length

  doc.setProperties({
    title: `PC Water Project Enquiries - ${formatFileDate(generatedAt)}`,
    subject: 'Confidential project enquiry register and lead detail report',
    author: 'PC Water Infrastructure',
    creator: 'PC Water CMS',
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(...NAVY)
  doc.text('PROJECT ENQUIRY REPORT', 105, 34, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...TEXT)
  doc.text(`Generated ${formatReportDate(generatedAt)}`, 105, 42, { align: 'center' })

  const filterParts = [
    context.status && context.status !== 'All' ? `Status: ${titleCase(context.status)}` : '',
    context.search?.trim() ? `Search: ${context.search.trim()}` : '',
  ].filter(Boolean)

  if (filterParts.length > 0) {
    doc.setTextColor(...MUTED)
    doc.text(`Applied filters - ${filterParts.join(' | ')}`, 105, 47, { align: 'center' })
  }

  const metrics = [
    ['Enquiries', enquiries.length],
    ['Unique contacts', uniqueContacts],
    ['New leads', newLeads],
    ['CRM synced', crmSynced],
  ] as const

  const cardGap = 3
  const cardWidth = (PAGE.contentWidth - cardGap * 3) / 4
  const cardTop = 56

  metrics.forEach(([label, metric], index) => {
    const x = PAGE.left + index * (cardWidth + cardGap)
    doc.setFillColor(...PALE)
    doc.setDrawColor(...BORDER)
    doc.roundedRect(x, cardTop, cardWidth, 19, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...NAVY)
    doc.text(String(metric), x + 4, cardTop + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), x + 4, cardTop + 14)
  })

  addSectionHeading(doc, 'Lead Enquiry Register', 86)

  autoTable(doc, {
    startY: 91,
    margin: { top: PAGE.top, right: PAGE.right, bottom: 20, left: PAGE.left },
    theme: 'grid',
    head: [['Submitted', 'Contact', 'Organisation', 'Service', 'Status']],
    body: enquiries.map((item) => [
      formatDateTime(item.submittedAt),
      `${fullName(item)}\n${item.email}`,
      value(item.company),
      value(item.service),
      titleCase(item.submissionStatus),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.4,
      textColor: TEXT,
      lineColor: BORDER,
      lineWidth: 0.15,
      valign: 'middle',
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: PALE },
    columnStyles: {
      0: { cellWidth: 27 },
      1: { cellWidth: 42 },
      2: { cellWidth: 34 },
      3: { cellWidth: 48 },
      4: { cellWidth: 23, halign: 'center' },
    },
  })

  doc.addPage()

  enquiries.forEach((enquiry, index) => {
    if (index > 0) doc.addPage()

    let y = 31
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...NAVY)
    doc.text(`Enquiry ${String(index + 1).padStart(2, '0')} - ${fullName(enquiry)}`, PAGE.left, y)

    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      `Submitted ${formatDateTime(enquiry.submittedAt)} | Status: ${titleCase(enquiry.submissionStatus)}`,
      PAGE.left,
      y,
    )

    y += 11
    addSectionHeading(doc, 'Contact Snapshot', y)
    autoTable(doc, {
      startY: y + 3,
      margin: { top: PAGE.top, right: PAGE.right, bottom: 20, left: PAGE.left },
      theme: 'grid',
      body: [
        ['Name', fullName(enquiry), 'Organisation', value(enquiry.company)],
        ['Email', enquiry.email, 'Phone', value(enquiry.phone)],
        ['Location', [enquiry.suburbTown, enquiry.state].filter(Boolean).join(', ') || '-', 'Industry', value(enquiry.industry)],
        ['Role', value(enquiry.jobRole), 'Preferred contact', value(enquiry.preferredContactMethod)],
      ],
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, lineColor: BORDER, lineWidth: 0.15, textColor: TEXT },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', textColor: NAVY, fillColor: PALE },
        1: { cellWidth: 62 },
        2: { cellWidth: 25, fontStyle: 'bold', textColor: NAVY, fillColor: PALE },
        3: { cellWidth: 62 },
      },
    })

    y = lastTableY(doc, y + 30) + 10
    y = ensureSpace(doc, y, 52)
    addSectionHeading(doc, 'Project Context', y)
    autoTable(doc, {
      startY: y + 3,
      margin: { top: PAGE.top, right: PAGE.right, bottom: 20, left: PAGE.left },
      theme: 'grid',
      body: [
        ['Service', value(enquiry.service), 'Project stage', value(enquiry.projectStage)],
        ['Timeline', value(enquiry.timeline), 'Budget', value(enquiry.budget)],
        ['Tank type', value(enquiry.tankType), 'Campaign', value(enquiry.campaignId)],
      ],
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, lineColor: BORDER, lineWidth: 0.15, textColor: TEXT },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', textColor: NAVY, fillColor: PALE },
        1: { cellWidth: 62 },
        2: { cellWidth: 25, fontStyle: 'bold', textColor: NAVY, fillColor: PALE },
        3: { cellWidth: 62 },
      },
    })

    y = lastTableY(doc, y + 28) + 10
    y = ensureSpace(doc, y, 35)
    addSectionHeading(doc, 'Project Description', y)
    autoTable(doc, {
      startY: y + 3,
      margin: { top: PAGE.top, right: PAGE.right, bottom: 20, left: PAGE.left },
      theme: 'grid',
      body: [[value(enquiry.message)]],
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 4,
        lineColor: BORDER,
        lineWidth: 0.15,
        textColor: TEXT,
        fillColor: PALE,
        minCellHeight: 18,
      },
    })

    y = lastTableY(doc, y + 25) + 10
    y = ensureSpace(doc, y, 50)
    addSectionHeading(doc, 'Source, Delivery And CRM', y)
    autoTable(doc, {
      startY: y + 3,
      margin: { top: PAGE.top, right: PAGE.right, bottom: 20, left: PAGE.left },
      theme: 'grid',
      body: [
        ['Source', value(enquiry.source), 'Landing page', value(enquiry.attribution?.landingPage)],
        ['UTM source', value(enquiry.attribution?.utmSource), 'UTM campaign', value(enquiry.attribution?.utmCampaign)],
        ['Email delivery', titleCase(enquiry.emailDeliveryStatus), 'CRM sync', enquiry.pipedriveLeadId ? 'Synced' : value(enquiry.pipedriveSyncError || 'Not synced')],
        ['CRM lead ID', value(enquiry.pipedriveLeadId), 'Reviewed', enquiry.reviewedAt ? formatDateTime(enquiry.reviewedAt) : '-'],
      ],
      styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 2.4, lineColor: BORDER, lineWidth: 0.15, textColor: TEXT },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', textColor: NAVY, fillColor: PALE },
        1: { cellWidth: 62 },
        2: { cellWidth: 25, fontStyle: 'bold', textColor: NAVY, fillColor: PALE },
        3: { cellWidth: 62 },
      },
    })
  })

  const totalPages = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber)
    addRunningFurniture(doc, pageNumber, totalPages)
  }

  return doc
}

export async function exportProjectEnquiriesPdf(
  enquiries: ProjectEnquiry[],
  context: EnquiryPdfContext = {},
) {
  const doc = await buildProjectEnquiriesPdf(enquiries, context)
  if (!doc) return

  doc.save(`pc-water-project-enquiries-${formatFileDate(new Date())}.pdf`)
}
