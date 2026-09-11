import { NextResponse } from 'next/server'

import { requireCmsAdmin } from '@/lib/cms/admin'
import { syncToolLeadToPipedrive } from '@/lib/pipedrive'
import { validateEmailLocally } from '@/lib/email-validation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

type ToolLeadInsert = {
  email: string | null
  tool_slug: string
  tool_title: string
  division: string
  result_key: string
  result_level: string
  answers: Record<string, unknown>
  event_type: 'assessment_email' | 'project_start'
  session_id: string | null
  source_url: string | null
  destination_url: string | null
  submitted_at: string
}

type ToolLeadInsertTable = {
  insert: (values: ToolLeadInsert) => PromiseLike<{ error: unknown }>
}

export async function GET() {
  const auth = await requireCmsAdmin()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.error }, { status: auth.status })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: 'Lead storage is not configured.' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('tool_leads')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('[tool_leads] fetch error', error)
    return NextResponse.json({ ok: false, reason: 'Could not load tool leads.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, leads: data ?? [] })
}

export async function DELETE(request: Request) {
  const auth = await requireCmsAdmin()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.error }, { status: auth.status })
  }

  const id = new URL(request.url).searchParams.get('id')?.trim()
  if (!id) {
    return NextResponse.json({ ok: false, reason: 'Missing lead id.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: 'Lead storage is not configured.' }, { status: 503 })
  }

  const { error } = await supabase.from('tool_leads').delete().eq('id', id)
  if (error) {
    console.error('[tool_leads] delete error', error)
    return NextResponse.json({ ok: false, reason: 'Could not delete tool lead.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, reason: 'Invalid request body.' }, { status: 400 })
  }

  const email = getText(body.email)
  const eventType = getText(body.eventType) === 'project_start' ? 'project_start' : 'assessment_email'
  const toolSlug = getText(body.toolSlug)
  const toolTitle = getText(body.toolTitle)
  const division = getText(body.division)
  const resultKey = getText(body.resultKey)
  const resultLevel = getText(body.resultLevel)
  const answers =
    body.answers && typeof body.answers === 'object' ? (body.answers as Record<string, unknown>) : {}

  if (!toolSlug || !toolTitle || (eventType === 'assessment_email' && !email)) {
    return NextResponse.json({ ok: false, reason: 'Missing required fields.' }, { status: 400 })
  }

  const emailValidation = email ? validateEmailLocally(email) : null
  if (emailValidation && !emailValidation.ok) {
    return NextResponse.json({ ok: false, reason: emailValidation.reason }, { status: 400 })
  }

  const submittedAt = new Date().toISOString()

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: 'Lead storage is not configured.' }, { status: 503 })
  }

  const toolLeads = supabase.from('tool_leads') as unknown as ToolLeadInsertTable
  const { error } = await toolLeads.insert({
    email: emailValidation?.ok ? emailValidation.email : null,
    tool_slug: toolSlug,
    tool_title: toolTitle,
    division,
    result_key: resultKey,
    result_level: resultLevel,
    answers,
    event_type: eventType,
    session_id: getText(body.sessionId).slice(0, 100) || null,
    source_url: getText(body.sourceUrl).slice(0, 2000) || null,
    destination_url: getText(body.destinationUrl).slice(0, 2000) || null,
    submitted_at: submittedAt,
  })

  if (error) {
    console.error('[tool_leads] insert error', error)
    return NextResponse.json({ ok: false, reason: 'Could not save this tool activity.' }, { status: 500 })
  }

  if (eventType === 'project_start') {
    return NextResponse.json({ ok: true, stored: true, pipedriveSynced: false })
  }

  const syncResult = await syncToolLeadToPipedrive({
    email: emailValidation?.ok ? emailValidation.email : email,
    toolSlug,
    toolTitle,
    division,
    resultLevel,
    answers,
    submittedAt,
  })

  if (!syncResult.ok) {
    console.error('[pipedrive] tool lead sync error', syncResult.error)
  }

  return NextResponse.json({ ok: true, stored: true, pipedriveSynced: syncResult.ok })
}
