import Link from 'next/link'

export type OutcomeTone = 'low' | 'moderate' | 'high' | 'urgent' | 'info'

/** Softened versions of the tones the assessment itself uses for a result. */
const TONES: Record<OutcomeTone, string> = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  moderate: 'bg-amber-50 text-amber-700 ring-amber-100',
  high: 'bg-orange-50 text-orange-700 ring-orange-100',
  urgent: 'bg-rose-50 text-rose-700 ring-rose-100',
  info: 'bg-[#3e91ce]/10 text-[#2a72ad] ring-[#3e91ce]/15',
}

export type ToolIcon = 'shield' | 'decision'

const ICONS: Record<ToolIcon, React.ReactNode> = {
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M9 12.75 11.25 15 15 9.75M21 12c0 5.25-3.75 8.25-9 9.75C6.75 20.25 3 17.25 3 12V6.75c3-.375 6-1.5 9-3.375 3 1.875 6 3 9 3.375V12Z"
    />
  ),
  decision: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 0V9a3 3 0 0 0-3-3h-4.5m0 0 3-3m-3 3 3 3M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
    />
  ),
}

export interface Tool {
  href: string
  title: string
  blurb: string
  icon: ToolIcon
  /** The dimensions the tool actually asks about. */
  asks: string[]
  /** The results it can return, in escalating order. */
  outcomes: Array<{ label: string; tone: OutcomeTone }>
  questions: number
  minutes: string
  cta: string
}

function Arrow() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a9aa8]">{children}</p>
  )
}

/**
 * A tool is not an article — it takes inputs and returns a verdict. The card
 * shows both up front (what it asks, what it can tell you) and leads with a
 * real button, in the soft rounded style the brand uses elsewhere.
 */
export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="group flex flex-col rounded-[1.75rem] border border-[#e6ecf2] bg-white p-6 shadow-[0_1px_2px_rgba(13,27,42,0.04),0_12px_32px_-16px_rgba(13,27,42,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e91ce]/35 hover:shadow-[0_2px_4px_rgba(13,27,42,0.04),0_20px_44px_-18px_rgba(62,145,206,0.4)] sm:p-7">
      <div className="mb-5 flex items-center gap-4">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3e91ce]/18 to-[#3e91ce]/5 text-[#2a72ad]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS[tool.icon]}
          </svg>
        </span>
        <span className="rounded-full bg-[#f2f6fa] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b7183]">
          Free · {tool.minutes}
        </span>
      </div>

      <h3 className="mb-2.5 text-[1.4rem] font-bold leading-tight tracking-tight text-[#0d1b2a] sm:text-[1.6rem]">
        {tool.title}
      </h3>
      <p className="mb-6 text-[14.5px] leading-relaxed text-[#5b7183]">{tool.blurb}</p>

      <Label>What it asks</Label>
      <div className="mb-6 flex flex-wrap gap-2">
        {tool.asks.map((a) => (
          <span
            key={a}
            className="rounded-full bg-[#f4f7fa] px-3 py-1.5 text-[12.5px] font-medium text-[#41576a]"
          >
            {a}
          </span>
        ))}
      </div>

      <Label>What it can tell you</Label>
      <div className="mb-7 flex flex-wrap gap-2">
        {tool.outcomes.map((o) => (
          <span
            key={o.label}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ring-1 ${TONES[o.tone]}`}
          >
            {o.label}
          </span>
        ))}
      </div>

      <div className="mt-auto">
        <Link
          href={tool.href}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2a72ad] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_6px_18px_-6px_rgba(42,114,173,0.6)] transition-all duration-300 hover:bg-[#3e91ce] hover:shadow-[0_10px_26px_-8px_rgba(62,145,206,0.7)]"
        >
          {tool.cta}
          <Arrow />
        </Link>
        <p className="mt-3 text-center text-[12.5px] text-[#93a3b1]">
          {tool.questions} questions · No signup · Result on screen
        </p>
      </div>
    </div>
  )
}

export interface Pathway {
  href: string
  title: string
  blurb: string
  points: string[]
  cta: string
}

/**
 * The higher-intent enquiry funnels. Styled apart from the tools above them —
 * translucent on navy, no scoring, a person answers at the other end.
 */
export function PathwayCard({ pathway }: { pathway: Pathway }) {
  return (
    <div className="flex flex-col rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#3e91ce]/45 hover:bg-white/[0.1] sm:p-7">
      <span className="mb-4 inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
        <span className="h-1.5 w-1.5 rounded-full bg-[#3e91ce]" />
        Project enquiry
      </span>
      <h3 className="mb-2.5 text-[1.4rem] font-bold leading-tight tracking-tight text-white">{pathway.title}</h3>
      <p className="mb-6 text-[14.5px] leading-relaxed text-gray-400">{pathway.blurb}</p>
      <ul className="mb-7 space-y-2.5">
        {pathway.points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-gray-300">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3e91ce]" />
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={pathway.href}
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-4 text-[15px] font-semibold text-white ring-1 ring-white/20 transition-all duration-300 hover:bg-[#2a72ad] hover:ring-[#2a72ad]"
      >
        {pathway.cta}
        <Arrow />
      </Link>
    </div>
  )
}
