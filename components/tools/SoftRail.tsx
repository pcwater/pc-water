import Link from 'next/link'

/** A soft white card panel for the tools rail. */
export function SoftPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e6ecf2] bg-white p-5 shadow-[0_1px_2px_rgba(13,27,42,0.03),0_8px_24px_-18px_rgba(13,27,42,0.18)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a9aa8]">{title}</h3>
      {children}
    </section>
  )
}

export function SoftChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className="rounded-full bg-[#f4f7fa] px-3 py-1.5 text-[12px] font-medium text-[#41576a]">
          {s}
        </span>
      ))}
    </div>
  )
}

export function SoftLinks({ links }: { links: Array<{ label: string; href: string; meta?: string }> }) {
  return (
    <ul className="space-y-1">
      {links.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className="group -mx-2 flex items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-[13.5px] transition-colors hover:bg-[#f4f7fa]"
          >
            <span className="font-medium text-[#41576a] transition-colors group-hover:text-[#2a72ad]">
              {l.label}
            </span>
            <svg
              className="h-3.5 w-3.5 flex-shrink-0 text-[#c3cfd9] transition-colors group-hover:text-[#3e91ce]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function SoftArticles({
  articles,
}: {
  articles: Array<{ id: string; slug: string; title: string; readTime?: string | null; kicker?: string }>
}) {
  if (articles.length === 0) return null
  return (
    <SoftPanel title="Related reading">
      <div className="space-y-3.5">
        {articles.map((a) => (
          <Link key={a.id} href={`/resources/${a.slug}`} className="group block">
            {a.kicker && (
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#3e91ce]">
                {a.kicker}
              </span>
            )}
            <p className="mt-0.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-[#2c3f4f] transition-colors group-hover:text-[#2a72ad]">
              {a.title}
            </p>
            {a.readTime && <p className="mt-0.5 text-[11.5px] text-[#93a3b1]">{a.readTime}</p>}
          </Link>
        ))}
      </div>
      <Link
        href="/resources"
        className="mt-4 inline-flex items-center gap-1.5 py-1 text-[13px] font-semibold text-[#2a72ad] transition-colors hover:text-[#3e91ce]"
      >
        Browse the library
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </SoftPanel>
  )
}

export function SoftDownload({
  kicker,
  heading,
  body,
  href,
  label,
}: {
  kicker: string
  heading: string
  body: string
  href: string
  label: string
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1b2a] to-[#30505b] p-5">
      <div className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[#3e91ce]/25 blur-[60px]" />
      <div className="relative z-10">
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#7fc2f0]">{kicker}</p>
        <h3 className="mb-2 text-[15px] font-bold leading-snug text-white">{heading}</h3>
        <p className="mb-4 text-[13px] leading-relaxed text-gray-400">{body}</p>
        <a
          href={href}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#2a72ad] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#3e91ce]"
        >
          {label}
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>
      </div>
    </section>
  )
}

export function SoftContact({ heading, body, label, href }: { heading: string; body: string; label: string; href: string }) {
  return (
    <section className="rounded-2xl bg-[#f2f6fa] p-5 ring-1 ring-[#dde6ee]">
      <h3 className="mb-1.5 text-[14.5px] font-bold leading-snug text-[#2c3f4f]">{heading}</h3>
      <p className="mb-3.5 text-[12.5px] leading-relaxed text-[#5b7183]">{body}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 py-1 text-[13px] font-semibold text-[#2a72ad] transition-colors hover:text-[#3e91ce]"
      >
        {label}
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </section>
  )
}

export function SoftRail({ children }: { children: React.ReactNode }) {
  return (
    <aside className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1 lg:thin-scroll">
      {children}
    </aside>
  )
}
