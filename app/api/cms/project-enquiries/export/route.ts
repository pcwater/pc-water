import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { NextResponse } from 'next/server'

import { requireCmsAdmin } from '@/lib/cms/admin'
import {
  buildProjectEnquiriesXlsx,
  type EnquiryExportContext,
} from '@/lib/cms/export-project-enquiries-xlsx'
import type { ProjectEnquiry } from '@/lib/project-enquiries'

export const runtime = 'nodejs'

type ExportRequest = {
  enquiries?: ProjectEnquiry[]
  context?: EnquiryExportContext
}

export async function POST(request: Request) {
  const auth = await requireCmsAdmin()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.error }, { status: auth.status })
  }

  let payload: ExportRequest
  try {
    payload = await request.json() as ExportRequest
  } catch {
    return NextResponse.json({ ok: false, reason: 'The Excel export request is invalid.' }, { status: 400 })
  }

  if (!Array.isArray(payload.enquiries) || payload.enquiries.length === 0) {
    return NextResponse.json({ ok: false, reason: 'No project enquiries were selected for export.' }, { status: 400 })
  }

  if (payload.enquiries.length > 500) {
    return NextResponse.json({ ok: false, reason: 'The export is limited to 500 enquiries at a time.' }, { status: 400 })
  }

  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'pc-water-project-enquiries.xlsx')
    const template = await readFile(templatePath)
    const workbook = await buildProjectEnquiriesXlsx(
      payload.enquiries,
      new Uint8Array(template),
      payload.context,
    )

    const body = workbook.bytes.buffer.slice(
      workbook.bytes.byteOffset,
      workbook.bytes.byteOffset + workbook.bytes.byteLength,
    ) as ArrayBuffer

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${workbook.fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[project_enquiries] Excel export generation failed', error)
    return NextResponse.json({ ok: false, reason: 'The Excel workbook could not be generated.' }, { status: 500 })
  }
}
