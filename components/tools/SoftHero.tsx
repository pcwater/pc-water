import Link from 'next/link'
import Breadcrumbs, { type Crumb } from '@/components/resources/Breadcrumbs'
import { SHELL } from '@/lib/shell'

export interface HeroStat {
  label: string
  value: string | number
}

/**
 * The tools hero. Where the editorial Masthead is a hard-edged navy block with
 * a dot grid, this one is a soft blue gradient with diffuse water-like glows
 * and a rounded lower edge — closer to how the brand reads elsewhere.
 */
export default function SoftHero({
  kicker,
  title,
  lead,
  crumbs,
  stats,
  primaryCta,
  secondaryCta,
}: {
  kicker: string
  title: React.ReactNode
  lead?: string
  crumbs?: Crumb[]
  stats?: HeroStat[]
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <section className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-[#0d1b2a] via-[#17334b] to-[#30505b] pt-28 pb-12 sm:rounded-b-[3rem] sm:pt-32 sm:pb-16 lg:pt-36">
      {/* Diffuse glows rather than a hard dot grid. */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-[#3e91ce]/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[22rem] w-[22rem] rounded-full bg-[#7fc2f0]/15 blur-[110px]" />

      <div className={`relative z-10 ${SHELL}`}>
        {crumbs && crumbs.length > 0 && <Breadcrumbs light items={crumbs} />}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:gap-14">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9fd0f5] ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3e91ce]" />
              {kicker}
            </p>
            <h1 className="mb-5 text-[2.1rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.9rem] lg:text-[3.4rem]">
              {title}
            </h1>
            {lead && <p className="max-w-2xl text-[15.5px] leading-relaxed text-gray-300 sm:text-base">{lead}</p>}

            {(primaryCta || secondaryCta) && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2a72ad] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(62,145,206,0.8)] transition-all duration-300 hover:bg-[#3e91ce]"
                  >
                    {primaryCta.label}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white ring-1 ring-white/25 transition-all duration-300 hover:bg-white/10 hover:ring-white/40"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/[0.07] px-3 py-4 text-center ring-1 ring-white/12 sm:px-4"
                >
                  <dd className="text-xl font-bold leading-none text-white sm:text-2xl">{s.value}</dd>
                  <dt className="mt-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-gray-400">
                    {s.label}
                  </dt>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
