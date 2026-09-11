'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { fetchAdminPosts, fetchAdminProjects } from '@/lib/cms/browser-admin'
import type { CmsPost, CmsProject } from '@/lib/cms/types'
import type { ProjectEnquiry } from '@/lib/project-enquiries'
import { fetchProjectEnquiries } from '@/lib/supabase/project-enquiries'
import { fetchResourceLeads, type ResourceLead } from '@/lib/supabase/resources'
import { fetchToolLeads, type ToolLead } from '@/lib/supabase/tool-leads'

type LeadActivity = {
  id: string
  kind: 'Enquiry' | 'Tool lead' | 'Tool intent' | 'Download'
  name: string
  detail: string
  date: string
  href: string
  priority: 'High' | 'Warm' | 'Early'
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 60) return minutes <= 1 ? 'Just now' : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

function LeadMetric({ label, value, detail, href, accent }: { label: string; value: number | string; detail: string; href: string; accent: string }) {
  return (
    <Link href={href} className="cms-stat-card group p-5">
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </span>
        <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#3e91ce]">→</span>
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </Link>
  )
}

function PriorityPill({ value }: { value: LeadActivity['priority'] }) {
  const style = value === 'High'
    ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
    : value === 'Warm'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
      : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300'
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${style}`}>{value}</span>
}

export default function CmsDashboardPage() {
  const [currentTime] = useState(() => Date.now())
  const [posts, setPosts] = useState<CmsPost[]>([])
  const [projects, setProjects] = useState<CmsProject[]>([])
  const [enquiries, setEnquiries] = useState<ProjectEnquiry[]>([])
  const [resources, setResources] = useState<ResourceLead[]>([])
  const [tools, setTools] = useState<ToolLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchAdminPosts(), fetchAdminProjects(), fetchProjectEnquiries(), fetchResourceLeads(), fetchToolLeads(),
    ]).then(([postRows, projectRows, enquiryRows, resourceRows, toolRows]) => {
      setPosts(postRows)
      setProjects(projectRows)
      setEnquiries(enquiryRows)
      setResources(resourceRows)
      setTools(toolRows)
      setLoading(false)
    })
  }, [])

  const identifiedToolLeads = tools.filter((lead) => lead.event_type === 'assessment_email')
  const toolStarts = tools.filter((lead) => lead.event_type === 'project_start')
  const totalIdentifiedLeads = enquiries.length + resources.length + identifiedToolLeads.length
  const lastSevenDays = [...enquiries.map((item) => item.submittedAt), ...resources.map((item) => item.downloaded_at), ...tools.map((item) => item.submitted_at)]
    .filter((date) => currentTime - new Date(date).getTime() <= 7 * 86400000).length

  const activity = useMemo<LeadActivity[]>(() => [
    ...enquiries.map((lead) => ({
      id: lead.id, kind: 'Enquiry' as const,
      name: `${lead.firstName} ${lead.lastName}`.trim() || lead.email,
      detail: lead.service || lead.company || lead.email,
      date: lead.submittedAt, href: '/cms/enquiries', priority: 'High' as const,
    })),
    ...tools.map((lead) => ({
      id: lead.id,
      kind: lead.event_type === 'project_start' ? 'Tool intent' as const : 'Tool lead' as const,
      name: lead.email || 'Anonymous project start',
      detail: `${lead.tool_title}${lead.result_level ? ` · ${lead.result_level}` : ''}`,
      date: lead.submitted_at, href: '/cms/tool-leads',
      priority: lead.event_type === 'project_start' ? 'High' as const : 'Warm' as const,
    })),
    ...resources.map((lead) => ({
      id: lead.id, kind: 'Download' as const, name: lead.email,
      detail: lead.resource_title || lead.resource_slug,
      date: lead.downloaded_at, href: '/cms/leads', priority: 'Early' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10), [enquiries, resources, tools])

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="cms-kicker">Commercial overview</p>
          <h1 className="cms-page-title">Lead Command Center</h1>
          <p className="cms-page-subtitle">The highest-intent activity across enquiries, assessment tools and resources.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/cms/enquiries" className="cms-button-primary">Open lead inbox</Link>
          <Link href="/" target="_blank" className="cms-button-secondary">View website ↗</Link>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[1.4rem] bg-[#071827] p-6 text-white shadow-[0_30px_80px_-45px_rgba(7,24,39,0.95)] sm:p-8">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#55a9dd]/15" />
        <div className="absolute right-10 top-0 h-48 w-48 rounded-full bg-[#3e91ce]/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#62b1e1]">Total identified leads</p>
            <div className="mt-3 flex items-end gap-4">
              <p className="text-6xl font-black tracking-[-0.06em] sm:text-7xl">{loading ? '—' : totalIdentifiedLeads}</p>
              <div className="pb-2"><p className="font-bold text-slate-200">{lastSevenDays} activities</p><p className="text-xs text-slate-400">recorded in the last 7 days</p></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"><p className="text-2xl font-black">{enquiries.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enquiries</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"><p className="text-2xl font-black">{identifiedToolLeads.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tool leads</p></div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"><p className="text-2xl font-black">{resources.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Downloads</p></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <LeadMetric label="Project enquiries" value={loading ? '—' : enquiries.length} detail="direct contact submissions" href="/cms/enquiries" accent="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300" />
        <LeadMetric label="Tool project starts" value={loading ? '—' : toolStarts.length} detail="highest tool intent" href="/cms/tool-leads" accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <LeadMetric label="Assessment leads" value={loading ? '—' : identifiedToolLeads.length} detail="emailed tool results" href="/cms/tool-leads" accent="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" />
        <LeadMetric label="Resource leads" value={loading ? '—' : resources.length} detail="gated downloads" href="/cms/leads" accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="cms-card">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/[0.06]">
            <div><p className="text-sm font-black text-slate-950 dark:text-white">Latest lead activity</p><p className="mt-0.5 text-xs text-slate-400">Newest activity across every capture point</p></div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">Priority view</span>
          </div>
          {loading ? (
            <div className="grid min-h-72 place-items-center text-sm text-slate-400">Loading lead activity…</div>
          ) : activity.length === 0 ? (
            <div className="grid min-h-72 place-items-center text-sm text-slate-400">No lead activity yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {activity.map((item) => (
                <Link key={`${item.kind}-${item.id}`} href={item.href} className="grid gap-3 px-5 py-4 transition hover:bg-slate-50/80 sm:grid-cols-[110px_minmax(0,1fr)_auto_auto] sm:items-center dark:hover:bg-white/[0.025]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2f7fb9]">{item.kind}</span>
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950 dark:text-white">{item.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.detail}</p></div>
                  <PriorityPill value={item.priority} />
                  <span className="whitespace-nowrap text-xs text-slate-400">{relativeTime(item.date)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="cms-card p-5">
            <p className="cms-kicker">Fast actions</p>
            <div className="mt-4 space-y-2">
              {[
                ['/cms/enquiries', 'Review project enquiries'],
                ['/cms/tool-leads', 'Inspect tool intent'],
                ['/cms/posts/new', 'Publish an article'],
                ['/cms/projects/new', 'Add a project'],
              ].map(([href, label]) => <Link key={href} href={href} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#3e91ce] hover:text-[#2f7fb9] dark:border-white/[0.07] dark:text-slate-200"><span>{label}</span><span>→</span></Link>)}
            </div>
          </div>
          <div className="cms-card p-5">
            <p className="cms-kicker">Content operations</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]"><p className="text-2xl font-black text-slate-950 dark:text-white">{posts.length}</p><p className="text-xs text-slate-500">Articles</p></div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]"><p className="text-2xl font-black text-slate-950 dark:text-white">{projects.length}</p><p className="text-xs text-slate-500">Projects</p></div>
              <div className="col-span-2 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]"><p className="text-2xl font-black text-slate-950 dark:text-white">{posts.filter((post) => post.status === 'published').length + projects.filter((project) => project.status === 'published').length}</p><p className="text-xs text-slate-500">Published entries</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
