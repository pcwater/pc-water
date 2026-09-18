import type { EnquiryExportContext } from '@/lib/cms/export-project-enquiries-xlsx'
import type { ProjectEnquiry } from '@/lib/project-enquiries'

function fileNameFromHeader(header: string | null) {
  const match = header?.match(/filename="([^"]+)"/i)
  return match?.[1] || `pc-water-project-enquiries-${new Date().toISOString().slice(0, 10)}.xlsx`
}

export async function downloadProjectEnquiriesXlsx(
  enquiries: ProjectEnquiry[],
  context: EnquiryExportContext = {},
) {
  const response = await fetch('/api/cms/project-enquiries/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enquiries, context }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.reason || `Excel export failed (${response.status}).`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileNameFromHeader(response.headers.get('content-disposition'))
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
