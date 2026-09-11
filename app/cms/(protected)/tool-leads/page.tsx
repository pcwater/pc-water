'use client'

import { useEffect, useMemo, useState } from 'react'

import { fetchToolLeads, type ToolLead } from '@/lib/supabase/tool-leads'

function dateTime(value: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(value))
}

function Metric({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: string }) {
  return (
    <div className="cms-stat-card p-5">
      <div className={`mb-5 h-1 w-10 rounded-full ${tone}`} />
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  )
}

function eventLabel(event: ToolLead) {
  return event.event_type === 'project_start' ? 'Started project enquiry' : 'Requested emailed result'
}

export default function ToolLeadsPage() {
  const [currentTime] = useState(() => Date.now())
  const [leads, setLeads] = useState<ToolLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'assessment_email' | 'project_start'>('all')
  const [selected, setSelected] = useState<ToolLead | null>(null)

  async function refresh() {
    setLoading(true)
    setLeads(await fetchToolLeads())
    setLoading(false)
  }

  useEffect(() => {
    let active = true

    fetchToolLeads().then((rows) => {
      if (!active) return
      setLeads(rows)
      setLoading(false)
    })

    return () => { active = false }
  }, [])

  const projectStarts = leads.filter((lead) => lead.event_type === 'project_start')
  const emailLeads = leads.filter((lead) => lead.event_type === 'assessment_email')
  const thisWeek = leads.filter((lead) => currentTime - new Date(lead.submitted_at).getTime() <= 7 * 86400000)
  const uniqueSessions = new Set(leads.map((lead) => lead.session_id).filter(Boolean)).size

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (filter !== 'all' && lead.event_type !== filter) return false
      if (!query) return true
      return [lead.email, lead.tool_title, lead.result_level, lead.division]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [filter, leads, search])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="cms-kicker">Lead intelligence</p>
          <h1 className="cms-page-title">Tool Intent</h1>
          <p className="cms-page-subtitle">Assessment result captures and visitors who move from a tool into a project enquiry.</p>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="cms-button-secondary">
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 004.582 9M20 20v-5h-.581m-15.357-2A8 8 0 0019.418 15" />
          </svg>
          Refresh
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric label="All activity" value={loading ? '—' : leads.length} detail="assessment events" tone="bg-[#3e91ce]" />
        <Metric label="Project starts" value={loading ? '—' : projectStarts.length} detail="high-intent clicks" tone="bg-emerald-500" />
        <Metric label="Email leads" value={loading ? '—' : emailLeads.length} detail="identified contacts" tone="bg-amber-400" />
        <Metric label="Last 7 days" value={loading ? '—' : thisWeek.length} detail={`${uniqueSessions} tracked sessions`} tone="bg-slate-900 dark:bg-slate-200" />
      </section>

      <section className="cms-card">
        <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 sm:flex-row sm:items-center dark:border-white/[0.06]">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search email, tool or result…" className="cms-search-input" />
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/[0.05]">
            {([
              ['all', 'All'],
              ['project_start', 'Project starts'],
              ['assessment_email', 'Email leads'],
            ] as const).map(([value, label]) => (
              <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === value ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center text-sm text-slate-400">Loading tool activity…</div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-6 text-center">
            <div>
              <p className="font-bold text-slate-800 dark:text-white">No tool activity yet</p>
              <p className="mt-1 text-sm text-slate-500">New assessment captures and project starts will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cms-table min-w-full">
              <thead><tr><th>Contact / event</th><th>Tool</th><th>Result</th><th>Recorded</th><th /></tr></thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <p className="font-bold text-slate-900 dark:text-white">{lead.email || eventLabel(lead)}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${lead.event_type === 'project_start' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'}`}>{eventLabel(lead)}</span>
                    </td>
                    <td><p className="font-semibold text-slate-700 dark:text-slate-200">{lead.tool_title}</p><p className="mt-0.5 text-xs text-slate-400">{lead.division || 'PC Water'}</p></td>
                    <td><span className="cms-result-pill">{lead.result_level || 'Completed'}</span></td>
                    <td className="whitespace-nowrap text-xs text-slate-500">{dateTime(lead.submitted_at)}</td>
                    <td><button onClick={() => setSelected(lead)} className="cms-row-action">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06111d]/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}>
          <div className="cms-card max-h-[86vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="cms-kicker">Tool activity detail</p><h2 className="text-2xl font-black text-slate-950 dark:text-white">{selected.tool_title}</h2></div>
              <button onClick={() => setSelected(null)} className="cms-icon-button" aria-label="Close">×</button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['Event', eventLabel(selected)],
                ['Email', selected.email || 'Not supplied'],
                ['Result', selected.result_level || 'Completed'],
                ['Recorded', dateTime(selected.submitted_at)],
              ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>)}
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment answers</p>
              <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-white/[0.06] dark:border-white/[0.07]">
                {Object.entries(selected.answers || {}).map(([question, answer]) => <div key={question} className="flex items-start justify-between gap-5 px-4 py-3"><span className="text-xs font-semibold text-slate-500">{question.replaceAll('-', ' ')}</span><span className="text-right text-sm font-bold text-slate-900 dark:text-white">{String(answer)}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
