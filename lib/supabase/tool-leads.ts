export type ToolLeadEventType = 'assessment_email' | 'project_start'

export interface ToolLead {
  id: string
  email: string | null
  tool_slug: string
  tool_title: string
  division: string | null
  result_key: string | null
  result_level: string | null
  answers: Record<string, unknown>
  event_type: ToolLeadEventType
  session_id: string | null
  source_url: string | null
  destination_url: string | null
  submitted_at: string
}

export async function fetchToolLeads(): Promise<ToolLead[]> {
  try {
    const response = await fetch('/api/tool-leads', { cache: 'no-store' })
    const data = await response.json().catch(() => null)
    return response.ok && data?.ok && Array.isArray(data.leads) ? data.leads : []
  } catch {
    return []
  }
}

export async function deleteToolLead(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/tool-leads?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    const data = await response.json().catch(() => null)
    return Boolean(response.ok && data?.ok)
  } catch {
    return false
  }
}
