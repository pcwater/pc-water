'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

function getSessionId() {
  const key = 'pcw_tool_session'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const value = crypto.randomUUID()
  window.localStorage.setItem(key, value)
  return value
}

export default function TrackedProjectLink({
  href,
  toolSlug,
  toolTitle,
  division,
  resultKey,
  resultLevel,
  answers,
  className,
  children,
}: {
  href: string
  toolSlug: string
  toolTitle: string
  division: string
  resultKey: string
  resultLevel: string
  answers: Record<string, string>
  className?: string
  children: ReactNode
}) {
  function trackProjectStart() {
    const payload = JSON.stringify({
      eventType: 'project_start',
      toolSlug,
      toolTitle,
      division,
      resultKey,
      resultLevel,
      answers,
      sessionId: getSessionId(),
      sourceUrl: window.location.href,
      destinationUrl: href,
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/tool-leads', new Blob([payload], { type: 'application/json' }))
      return
    }

    void fetch('/api/tool-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  }

  return (
    <Link href={href} onClick={trackProjectStart} className={className}>
      {children}
    </Link>
  )
}
