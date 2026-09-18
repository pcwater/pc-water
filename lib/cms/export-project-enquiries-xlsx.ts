import JSZip from 'jszip'

import type { ProjectEnquiry } from '@/lib/project-enquiries'

const COLUMNS = 'ABCDEFGHIJKLMNOP'.split('')

type CellValue = string | number | null | undefined
type StyleMap = Record<string, string>

export interface EnquiryExportContext {
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
  if (Number.isNaN(date.getTime())) return 'Date not supplied'
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

function excelDate(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value)
  const utcDate = Date.UTC(getPart('year'), getPart('month') - 1, getPart('day'))
  return (utcDate - Date.UTC(1899, 11, 30)) / 86_400_000
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function rowXml(sheetXml: string, rowNumber: number) {
  const match = sheetXml.match(new RegExp(`<x:row r="${rowNumber}"(?: [^>]*)?>[\\s\\S]*?<\\/x:row>`))
  if (!match) throw new Error(`Workbook template row ${rowNumber} is missing.`)
  return match[0]
}

function rowStyles(sheetXml: string, rowNumber: number): StyleMap {
  const styles: StyleMap = {}
  const xml = rowXml(sheetXml, rowNumber)
  for (const match of xml.matchAll(/<x:c r="([A-P])\d+" s="(\d+)"/g)) {
    styles[match[1]] = match[2]
  }
  return styles
}

function makeCell(column: string, rowNumber: number, style: string, input?: CellValue) {
  const ref = `${column}${rowNumber}`
  if (input === null || input === undefined || input === '') {
    return `<x:c r="${ref}" s="${style}" />`
  }
  if (typeof input === 'number') {
    return `<x:c r="${ref}" s="${style}" t="n"><x:v>${input}</x:v></x:c>`
  }
  return `<x:c r="${ref}" s="${style}" t="str"><x:v>${escapeXml(input)}</x:v></x:c>`
}

function makeRow(
  rowNumber: number,
  styles: StyleMap,
  values: Record<string, CellValue> = {},
  height?: number,
) {
  const heightAttrs = height ? ` ht="${height}" customHeight="1"` : ''
  const cells = COLUMNS.map((column) => makeCell(column, rowNumber, styles[column] ?? '0', values[column])).join('')
  return `<x:row r="${rowNumber}"${heightAttrs}>${cells}</x:row>`
}

function replaceCellValue(row: string, address: string, input: CellValue) {
  const style = row.match(new RegExp(`<x:c r="${address}" s="(\\d+)"`))?.[1]
  if (!style) throw new Error(`Workbook template cell ${address} is missing.`)
  const replacement = makeCell(address.replace(/\d+$/, ''), Number(address.match(/\d+$/)?.[0]), style, input)
  const cellPattern = new RegExp(`<x:c r="${address}"[^>]*(?:\\/>|>[\\s\\S]*?<\\/x:c>)`)
  return row.replace(cellPattern, replacement)
}

function mergeXml(ranges: string[]) {
  return `<x:mergeCells>${ranges.map((range) => `<x:mergeCell ref="${range}" />`).join('')}</x:mergeCells>`
}

function rebuildSheet(templateXml: string, rows: string[], merges: string[]) {
  const prefix = templateXml.slice(0, templateXml.indexOf('<x:sheetData>'))
  const pageMargins = templateXml.match(/<x:pageMargins[^>]*\/>/)?.[0]
  if (!pageMargins) throw new Error('Workbook template page margins are missing.')
  return `${prefix}<x:sheetData>${rows.join('')}</x:sheetData>${mergeXml(merges)}${pageMargins}</x:worksheet>`
}

function estimateMessageRows(message: string) {
  const lines = message
    .replace(/\r\n/g, '\n')
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / 145)), 0)
  return Math.max(2, Math.min(8, Math.ceil(lines / 3)))
}

function estimateRegisterHeight(enquiry: ProjectEnquiry) {
  const messageLines = enquiry.message
    .replace(/\r\n/g, '\n')
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / 62)), 0)
  const organisationLines = Math.max(1, Math.ceil(value(enquiry.company, '').length / 31))
  const tankLines = Math.max(1, Math.ceil(value(enquiry.tankType, '').length / 38))
  return Math.max(42, Math.min(250, 12 + Math.max(messageLines, organisationLines, tankLines) * 13))
}

function buildOverviewXml(
  templateXml: string,
  enquiries: ProjectEnquiry[],
  generatedAt: Date,
  context: EnquiryExportContext,
) {
  const reportDate = formatReportDate(generatedAt)
  const readyToQuote = enquiries.filter((item) => value(item.projectStage, '').toLowerCase().includes('ready to quote')).length
  const emailSent = enquiries.filter((item) => item.emailDeliveryStatus === 'sent').length
  const newStatus = enquiries.filter((item) => item.submissionStatus === 'new').length
  const filterText = [
    context.status && context.status !== 'All' ? `Status: ${titleCase(context.status)}` : '',
    context.search?.trim() ? `Search: ${context.search.trim()}` : '',
  ].filter(Boolean)

  const rows = Array.from({ length: 11 }, (_, index) => rowXml(templateXml, index + 1))
  rows[2] = replaceCellValue(rows[2], 'C3', `Engineered Water Systems  •  Enquiry snapshot from ${reportDate} export  •  pcwater.com.au`)
  rows[6] = replaceCellValue(rows[6], 'A7', enquiries.length)
  rows[6] = replaceCellValue(rows[6], 'E7', readyToQuote)
  rows[6] = replaceCellValue(rows[6], 'I7', emailSent)
  rows[6] = replaceCellValue(rows[6], 'M7', newStatus)

  const styles = {
    title: rowStyles(templateXml, 12),
    label: rowStyles(templateXml, 13),
    detailTop: rowStyles(templateXml, 14),
    detailBottom: rowStyles(templateXml, 15),
    chip: rowStyles(templateXml, 16),
    messageLabel: rowStyles(templateXml, 17),
    messageTop: rowStyles(templateXml, 28),
    messageMiddle: rowStyles(templateXml, 30),
    messageBottom: rowStyles(templateXml, 32),
    spacer: rowStyles(templateXml, 20),
    footer: rowStyles(templateXml, 34),
    note: rowStyles(templateXml, 35),
  }

  const merges = [
    'A1:B3', 'C1:P1', 'C2:P2', 'C3:P3', 'A10:P10',
    'A6:D6', 'A7:D7', 'A8:D8', 'E6:H6', 'E7:H7', 'E8:H8',
    'I6:L6', 'I7:L7', 'I8:L8', 'M6:P6', 'M7:P7', 'M8:P8',
  ]

  let cursor = 12
  enquiries.forEach((enquiry, index) => {
    const messageRows = estimateMessageRows(enquiry.message)
    const titleRow = cursor
    const labelRow = titleRow + 1
    const detailTopRow = titleRow + 2
    const detailBottomRow = titleRow + 3
    const chipRow = titleRow + 4
    const messageLabelRow = titleRow + 5
    const messageStartRow = titleRow + 6
    const messageEndRow = messageStartRow + messageRows - 1

    rows.push(makeRow(titleRow, styles.title, {
      B: fullName(enquiry).toUpperCase(),
      L: [enquiry.suburbTown, enquiry.state].filter(Boolean).join(' • ').toUpperCase() || 'LOCATION NOT SUPPLIED',
    }, 30))
    rows.push(makeRow(labelRow, styles.label, { B: 'CONTACT', F: 'PROJECT / ORGANISATION', J: 'SCOPE', N: 'PIPELINE' }, 20))
    rows.push(makeRow(detailTopRow, styles.detailTop, {
      B: `${enquiry.email}\n${value(enquiry.phone)}`,
      F: `${value(enquiry.company, 'Organisation not supplied')}\nSubmitted: ${formatReportDate(new Date(enquiry.submittedAt))}`,
      J: `${value(enquiry.service, 'Service not specified')}\n${value(enquiry.tankType)}`,
      N: `${value(enquiry.projectStage, 'Stage not specified')}\nStatus: ${enquiry.submissionStatus}`,
    }, 28))
    rows.push(makeRow(detailBottomRow, styles.detailBottom, {}, 28))
    rows.push(makeRow(chipRow, styles.chip, {
      B: `INDUSTRY  |  ${value(enquiry.industry)}`,
      F: `TIMELINE  |  ${value(enquiry.timeline)}`,
      J: `BUDGET  |  ${value(enquiry.budget)}`,
      N: `EMAIL  |  ${enquiry.emailDeliveryStatus}`,
    }, 28))
    rows.push(makeRow(messageLabelRow, styles.messageLabel, { B: 'PROJECT DESCRIPTION / MESSAGE' }, 20))
    for (let rowNumber = messageStartRow; rowNumber <= messageEndRow; rowNumber += 1) {
      const style = rowNumber === messageStartRow
        ? styles.messageTop
        : rowNumber === messageEndRow
        ? styles.messageBottom
        : styles.messageMiddle
      rows.push(makeRow(rowNumber, style, rowNumber === messageStartRow ? { B: value(enquiry.message, 'No project message supplied.') } : {}, rowNumber === messageStartRow ? 24 : 44))
    }

    merges.push(
      `B${titleRow}:K${titleRow}`, `L${titleRow}:P${titleRow}`,
      `B${labelRow}:E${labelRow}`, `F${labelRow}:I${labelRow}`, `J${labelRow}:M${labelRow}`, `N${labelRow}:P${labelRow}`,
      `B${detailTopRow}:E${detailBottomRow}`, `F${detailTopRow}:I${detailBottomRow}`,
      `J${detailTopRow}:M${detailBottomRow}`, `N${detailTopRow}:P${detailBottomRow}`,
      `B${chipRow}:E${chipRow}`, `F${chipRow}:I${chipRow}`, `J${chipRow}:M${chipRow}`, `N${chipRow}:P${chipRow}`,
      `B${messageLabelRow}:P${messageLabelRow}`, `B${messageStartRow}:P${messageEndRow}`,
    )

    cursor = messageEndRow + 1
    if (index < enquiries.length - 1) {
      rows.push(makeRow(cursor, styles.spacer))
      rows.push(makeRow(cursor + 1, styles.spacer))
      cursor += 2
    }
  })

  rows.push(makeRow(cursor, styles.spacer))
  cursor += 1
  rows.push(makeRow(cursor, styles.footer, { A: 'PC WATER INFRASTRUCTURE  •  Engineered Water Systems  •  pcwater.com.au' }, 24))
  merges.push(`A${cursor}:P${cursor}`)
  cursor += 1
  rows.push(makeRow(cursor, styles.note, {
    A: `Prepared from the project enquiry export dated ${reportDate}. ${enquiries.length} filtered enquir${enquiries.length === 1 ? 'y is' : 'ies are'} included${filterText.length ? ` (${filterText.join(', ')})` : ''}.`,
  }, 22))
  merges.push(`A${cursor}:P${cursor}`)

  return rebuildSheet(templateXml, rows, merges)
}

function buildRegisterXml(templateXml: string, enquiries: ProjectEnquiry[], generatedAt: Date) {
  const rows = Array.from({ length: 6 }, (_, index) => rowXml(templateXml, index + 1))
  rows[2] = replaceCellValue(rows[2], 'C3', `Source: pcwater.com.au project enquiry export  •  ${formatReportDate(generatedAt)}`)
  const odd = rowStyles(templateXml, 7)
  const even = rowStyles(templateXml, 8)
  const blank = rowStyles(templateXml, 9)
  const note = rowStyles(templateXml, 10)
  const footer = rowStyles(templateXml, 11)

  enquiries.forEach((enquiry, index) => {
    const styles = { ...(index % 2 === 0 ? odd : even) }
    if (enquiry.projectStage) styles.J = even.J
    styles.N = index % 2 === 0 ? odd.N : even.N
    styles.O = enquiry.emailDeliveryStatus === 'sent' ? (index % 2 === 0 ? odd.O : even.O) : even.J
    rows.push(makeRow(7 + index, styles, {
      A: excelDate(enquiry.submittedAt),
      B: fullName(enquiry),
      C: value(enquiry.company, ''),
      D: enquiry.email,
      E: value(enquiry.phone, ''),
      F: value(enquiry.state, ''),
      G: value(enquiry.suburbTown, ''),
      H: value(enquiry.industry, ''),
      I: value(enquiry.service, ''),
      J: value(enquiry.projectStage, ''),
      K: value(enquiry.timeline, ''),
      L: value(enquiry.budget, ''),
      M: value(enquiry.tankType, ''),
      N: enquiry.submissionStatus,
      O: enquiry.emailDeliveryStatus,
      P: enquiry.message,
    }, estimateRegisterHeight(enquiry)))
  })

  let cursor = 7 + enquiries.length
  rows.push(makeRow(cursor, blank))
  cursor += 1
  rows.push(makeRow(cursor, note, { A: `${enquiries.length} filtered project enquir${enquiries.length === 1 ? 'y is' : 'ies are'} included in this register.` }, 24))
  const merges = ['A1:B3', 'C1:P1', 'C2:P2', 'C3:P3', `A${cursor}:P${cursor}`]
  cursor += 1
  rows.push(makeRow(cursor, footer, { A: 'PC WATER INFRASTRUCTURE  •  Engineered Water Systems  •  pcwater.com.au' }, 24))
  merges.push(`A${cursor}:P${cursor}`)
  return rebuildSheet(templateXml, rows, merges)
}

export async function buildProjectEnquiriesXlsx(
  enquiries: ProjectEnquiry[],
  templateBytes: Uint8Array,
  context: EnquiryExportContext = {},
) {
  const archive = await JSZip.loadAsync(templateBytes)
  const overviewFile = archive.file('xl/worksheets/sheet1.xml')
  const registerFile = archive.file('xl/worksheets/sheet2.xml')
  if (!overviewFile || !registerFile) throw new Error('The project enquiry workbook template is incomplete.')

  const [overviewTemplate, registerTemplate] = await Promise.all([
    overviewFile.async('string'),
    registerFile.async('string'),
  ])
  const generatedAt = new Date()
  archive.file('xl/worksheets/sheet1.xml', buildOverviewXml(overviewTemplate, enquiries, generatedAt, context))
  archive.file('xl/worksheets/sheet2.xml', buildRegisterXml(registerTemplate, enquiries, generatedAt))

  return {
    bytes: await archive.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }),
    fileName: `pc-water-project-enquiries-${formatFileDate(generatedAt)}.xlsx`,
  }
}
