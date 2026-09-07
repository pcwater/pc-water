import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CTABanner from '@/components/CTABanner'
import CrossLinks from '@/components/editorial/CrossLinks'
import SoftHeading from '@/components/tools/SoftHeading'
import SoftHero from '@/components/tools/SoftHero'
import {
  SoftArticles,
  SoftChips,
  SoftContact,
  SoftDownload,
  SoftLinks,
  SoftPanel,
  SoftRail,
} from '@/components/tools/SoftRail'
import ToolCard, { PathwayCard } from '@/components/tools/ToolCard'
import { getPublicPosts, getPublicProjects } from '@/lib/cms/queries'
import { enrichArticles, sortByNewest } from '@/lib/cms/taxonomy'
import { SHELL } from '@/lib/shell'
import { PATHWAYS, TOOLS } from '@/lib/tools/directory'

export const dynamic = 'force-static'

const siteUrl = process.env.SITE_URL || 'https://pcwater.com.au'

export const metadata: Metadata = {
  title: 'Free Water Infrastructure Tools',
  description:
    'Free online tools: check your water tank compliance risk, and decide whether to repair, reline, or replace an aging tank. Built for asset owners.',
  keywords: [
    'water tank tools',
    'tank compliance checker',
    'repair reline replace water tank',
    'water tank risk assessment',
    'water tank decision tool',
  ],
  alternates: { canonical: '/tools' },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'PC Water Infrastructure',
    title: 'Free Water Infrastructure Tools',
    description: 'Free online tools: check your water tank compliance risk and decide whether to repair, reline, or replace an aging tank. Built for asset owners.',
    url: 'https://pcwater.com.au/tools',
    images: [{ url: '/hero.png', width: 1200, height: 630, alt: 'PC Water Infrastructure — Engineered Water Asset Solutions' }],
  },
  twitter: { card: 'summary_large_image' as const, images: ['/hero.png'] },
}

const howItWorks = [
  {
    step: 1,
    title: 'Answer the questions',
    body: 'Eight multiple-choice questions about the asset. No account, no email required to see your result.',
  },
  {
    step: 2,
    title: 'Get a reasoned result',
    body: 'A rule-based verdict with the reasoning behind it — deliberately conservative, so uncertainty is flagged as risk.',
  },
  {
    step: 3,
    title: 'Take the next step',
    body: 'Every result links to the relevant service and, if you want it, a specialist summary sent to your inbox.',
  },
]

const standards = ['AS2304', 'AS1851', 'AS4020', 'AS/NZS 3500', 'ADWG']

export default async function ToolsPage() {
  const [projects, posts] = await Promise.all([getPublicProjects(), getPublicPosts()])

  const relatedArticles = sortByNewest(enrichArticles(posts))
    .slice(0, 4)
    .map((a) => ({ id: a.id, slug: a.slug, title: a.title, readTime: a.readTime, kicker: a.category.shortName }))

  const work = projects.slice(0, 3).map((p) => ({
    href: `/projects/${p.slug}`,
    title: p.title,
    blurb: p.scope || p.summary,
    kicker: p.sector,
    imageSrc: p.heroImageUrl,
    meta: p.location,
  }))

  const reading = sortByNewest(enrichArticles(posts))
    .slice(0, 3)
    .map((a) => ({
      href: `/resources/${a.slug}`,
      title: a.title,
      blurb: a.excerpt,
      kicker: a.category.shortName,
      imageSrc: a.coverImageUrl,
      meta: a.readTime ?? undefined,
    }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Water Infrastructure Tools',
    description:
      'Free tools for asset owners: tank compliance risk assessment, and a repair / reline / replace decision guide.',
    url: `${siteUrl}/tools`,
    publisher: { '@type': 'Organization', name: 'PC Water Infrastructure', url: siteUrl },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: TOOLS.length,
      itemListElement: TOOLS.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}${t.href}`,
        name: t.title,
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Tools', url: `${siteUrl}/tools` },
        ]}
      />

      {/* No photography here on purpose — the tools themselves lead. */}
      <SoftHero
        kicker="Free Tools"
        title={
          <>
            Assess your tank
            <br />
            <span className="text-[#7fc2f0]">in two minutes.</span>
          </>
        }
        lead="Two free, rule-based tools that take a few details about your asset and return a reasoned verdict — compliance risk, or whether to repair, reline or replace. Built on the same engineering experience behind our inspection, relining and compliance work."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools' }]}
        stats={[
          { label: 'Tools', value: TOOLS.length },
          { label: 'Questions', value: 8 },
          { label: 'Cost', value: 'Free' },
        ]}
      />

      {/* ── The tools ── */}
      <section id="toolkit" className="scroll-mt-20 bg-gradient-to-b from-[#f7fafc] to-white py-12 sm:py-16">
        <div className={SHELL}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-14">
            <div>
              <SoftHeading kicker="Start here" meta="No signup · Result on screen">
                Pick the question you need answered
              </SoftHeading>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {TOOLS.map((t) => (
                  <ToolCard key={t.href} tool={t} />
                ))}
              </div>

              {/* How it works */}
              <div className="mt-14">
                <SoftHeading kicker="How they work" meta="Same for both tools">
                  Three steps, no sign-up
                </SoftHeading>
                <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {howItWorks.map((s) => (
                    <li
                      key={s.step}
                      className="rounded-2xl border border-[#e6ecf2] bg-white p-5 shadow-[0_1px_2px_rgba(13,27,42,0.03),0_8px_24px_-18px_rgba(13,27,42,0.18)]"
                    >
                      <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#3e91ce]/12 text-[14px] font-bold text-[#2a72ad]">
                        {s.step}
                      </span>
                      <h3 className="mb-1.5 text-[15.5px] font-bold text-[#0d1b2a]">{s.title}</h3>
                      <p className="text-[13.5px] leading-relaxed text-[#5b7183]">{s.body}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 rounded-2xl bg-[#f2f6fa] px-5 py-4 text-[13px] leading-relaxed text-[#5b7183] ring-1 ring-[#dde6ee]">
                  These are guidance tools, not compliance certificates. Confirming true condition and compliance
                  still requires a formal inspection — which is exactly what the result will point you to when it
                  matters.
                </p>
              </div>
            </div>

            <SoftRail>
              <SoftPanel title="What these tools reference">
                <SoftChips items={standards} />
              </SoftPanel>

              <SoftPanel title="Services these lead to">
                <SoftLinks
                  links={[
                    { label: 'Tank Inspection Technology', href: '/services/tank-inspection-technology' },
                    { label: 'RPVC Liner Systems', href: '/services/rpvc-liner-systems' },
                    { label: 'Tank Maintenance & Upgrades', href: '/services/tank-maintenance-upgrades' },
                    { label: 'Fire Water Tank Solutions', href: '/services/fire-water-tanks' },
                  ]}
                />
              </SoftPanel>

              <SoftDownload
                kicker="Free guide"
                heading="Tank Upgrade Decision Guide"
                body="The engineering logic behind repair, reline and replace — in one PDF."
                href="/downloads/tank-upgrade-decision-guide.pdf"
                label="Download PDF"
              />

              <SoftArticles articles={relatedArticles} />

              <SoftContact
                heading="Prefer to talk it through?"
                body="Skip the tools and tell us about your tank — we'll point you to the right next step."
                label="Discuss your asset"
                href="/contact"
              />
            </SoftRail>
          </div>
        </div>
      </section>

      {/* ── Project pathways ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d1b2a] via-[#17334b] to-[#30505b] py-12 sm:rounded-[3rem] sm:py-16">
        <div className="pointer-events-none absolute -top-32 right-[-8%] h-[24rem] w-[24rem] rounded-full bg-[#3e91ce]/20 blur-[110px]" />
        <div className={`relative z-10 ${SHELL}`}>
          <SoftHeading light kicker="Past the assessment stage?" meta="Reply within 1 business day">
            Talk to the engineering team
          </SoftHeading>
          <p className="mb-8 max-w-2xl text-[15px] leading-relaxed text-gray-400">
            These guided pathways take a few details about your asset or project and put it in front of our
            engineering team — with a project-specific proposal or delivery strategy to follow.
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {PATHWAYS.map((p) => (
              <PathwayCard key={p.href} pathway={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivered work ── */}
      {work.length > 0 && (
        <section className="bg-white py-12 sm:py-16">
          <div className={SHELL}>
            <SoftHeading kicker="Proof" meta={`${projects.length} in the portfolio`}>
              The same decisions, delivered
            </SoftHeading>
            <CrossLinks links={work} columns={3} soft />
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f2f6fa] px-5 py-2.5 text-[13.5px] font-semibold text-[#2a72ad] transition-colors hover:bg-[#3e91ce]/12"
            >
              See every project
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ── Further reading ── */}
      {reading.length > 0 && (
        <section className="bg-gradient-to-b from-white to-[#f7fafc] py-12 sm:py-16">
          <div className={SHELL}>
            <SoftHeading kicker="From the library" meta="Written by our engineers">
              Further reading
            </SoftHeading>
            <CrossLinks links={reading} columns={3} soft />
            <Link
              href="/resources"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f2f6fa] px-5 py-2.5 text-[13.5px] font-semibold text-[#2a72ad] transition-colors hover:bg-[#3e91ce]/12"
            >
              Browse the article library
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      <CTABanner
        heading="PREFER TO TALK TO A SPECIALIST?"
        subheading="Skip the tools and tell us about your tank. We'll point you to the right next step."
        primaryCTA={{ label: 'Discuss Your Project', href: '/contact' }}
        secondaryCTA={{ label: 'View Our Services', href: '/services' }}
      />
    </>
  )
}
