import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import FAQBlock from '@/components/FAQBlock'
import CTABanner from '@/components/CTABanner'
import AssessmentTool from '@/components/tools/AssessmentTool'
import SoftHero from '@/components/tools/SoftHero'
import DetailFooterBand from '@/components/editorial/DetailFooterBand'
import { SHELL } from '@/lib/shell'

const siteUrl = process.env.SITE_URL || 'https://pcwater.com.au'

export const metadata: Metadata = {
  title: 'Repair, Reline or Replace? Tank Tool',
  description:
    'Free decision tool for aging water tanks — answer questions on condition, age, and corrosion to find out whether to repair, reline with RPVC, or replace.',
  keywords: [
    'water tank relining australia',
    'replace or reline water tank',
    'corroded water tank repair',
    'aging tank refurbishment',
    'RPVC tank relining',
    'repair vs replace water tank',
    'water tank refurbishment decision',
  ],
  alternates: { canonical: '/tools/repair-reline-replace' },
  openGraph: {
    title: 'Repair, Reline or Replace? Tank Tool',
    description:
      'Answer a few questions about your aging tank and get a practical guidance path — repair, reline, replace, or inspect first.',
    url: `${siteUrl}/tools/repair-reline-replace`,
    type: 'website',
    images: [{ url: '/hero.png', width: 1200, height: 630, alt: 'PC Water Infrastructure — Engineered Water Asset Solutions' }],
  },
  twitter: { card: 'summary_large_image' as const, images: ['/hero.png'] },
}

const faqs = [
  {
    question: 'When should a water tank be relined instead of replaced?',
    answer:
      'Relining with an RPVC liner system is usually the best option when the tank’s structure (shell, roof, supports) is still serviceable but the internal barrier has deteriorated or failed. It restores a watertight, compliant interior at a fraction of the cost and downtime of full replacement.',
  },
  {
    question: 'When is replacement the better choice?',
    answer:
      'Replacement tends to be the lower-risk choice once the structure itself is compromised — major structural deterioration or severe corrosion of the shell. At that point, repairs and relining often defer rather than solve the problem and can cost more over the asset’s life.',
  },
  {
    question: 'Why does the tool sometimes recommend an inspection first?',
    answer:
      'Internal condition — corrosion, liner integrity, and structural soundness — is the biggest driver of cost and cannot be judged reliably from the outside. If that information is unknown, a scoping inspection is recommended before committing to repair, reline, or replacement.',
  },
  {
    question: 'Can you inspect a tank without taking it out of service?',
    answer:
      'Often, yes. PC Water Infrastructure uses ROV and UAV inspection methods that can assess condition with minimal disruption and frequently without full dewatering, which is valuable where downtime must be minimised.',
  },
  {
    question: 'Is this decision tool a formal engineering assessment?',
    answer:
      'No. It provides general guidance based on your answers to help you understand likely options. A formal engineering assessment or condition inspection is required to confirm the right path before works are scoped.',
  },
]

const audience = [
  'Councils and utilities',
  'Commercial asset owners',
  'Industrial sites',
  'Operations and maintenance teams',
  'Procurement teams scoping major works',
  'Facility managers',
]

const paths = [
  { label: 'Inspect first', desc: 'When internal condition is unknown, a scoping inspection defines the real options.' },
  { label: 'Targeted repair', desc: 'When structure and barrier are broadly intact and issues are localised.' },
  { label: 'RPVC relining', desc: 'When the shell is serviceable but the internal barrier has failed.' },
  { label: 'Replacement', desc: 'When major structural deterioration or severe corrosion make repair uneconomic.' },
]

export default function RepairRelineReplacePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Tools', url: `${siteUrl}/tools` },
          { name: 'Repair vs Reline vs Replace', url: `${siteUrl}/tools/repair-reline-replace` },
        ]}
      />

      <SoftHero
        kicker="Free Tool"
        title="Repair, Reline or Replace?"
        lead="Aging or deteriorating tank? Answer a few questions about its use, age, and condition and get a practical guidance path — repair, reline with RPVC, replace, or inspect first — with the right next step for your asset."
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: "Repair, Reline or Replace?" },
        ]}
        primaryCta={{ label: 'Start the Decision Tool', href: '#assessment' }}
        secondaryCta={{ label: 'All Free Tools', href: '/tools' }}
      />

      <div id="assessment" className="scroll-mt-20" />
      <AssessmentTool slug="repair-reline-replace" />

      {/* The four paths */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d1b2a] via-[#17334b] to-[#30505b] py-12 sm:rounded-[3rem] sm:py-16">
        <div className="pointer-events-none absolute -top-28 right-[-8%] h-[22rem] w-[22rem] rounded-full bg-[#3e91ce]/20 blur-[110px]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <h2 className="mb-10 text-center text-[1.7rem] font-bold tracking-tight text-white sm:text-[2.1rem]">Four Possible Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paths.map((p, i) => (
              <div key={p.label} className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <p className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#3e91ce]/20 text-[14px] font-bold text-[#7fc2f0]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-bold text-white mb-2">{p.label}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3e91ce]">Who this is for</p>
          <h2 className="mb-8 text-[1.6rem] font-bold tracking-tight text-[#0d1b2a] sm:text-[2rem]">
            For the teams making the call on aging tank assets
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {audience.map((a) => (
              <span key={a} className="rounded-full bg-[#f4f7fa] px-5 py-2.5 text-sm font-medium text-[#41576a] ring-1 ring-[#e6ecf2]">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f7fafc] to-white py-12 sm:py-16">
        <div className={`${SHELL} grid grid-cols-1 md:grid-cols-3 gap-6`}>
          {[
            { title: 'RPVC Liner Systems', description: 'Restore an aging tank with a watertight, compliant internal barrier — without full replacement.', href: '/services/rpvc-liner-systems' },
            { title: 'Tank Inspection Technology', description: 'Confirm internal condition with ROV and UAV methods before you commit to works.', href: '/services/tank-inspection-technology' },
            { title: 'Tank Compliance Checker', description: 'Not sure if your tank is compliant? Check your likely compliance risk in a minute.', href: '/tools/tank-compliance-checker' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[1.5rem] border border-[#e6ecf2] bg-white p-6 shadow-[0_1px_2px_rgba(13,27,42,0.03),0_10px_28px_-18px_rgba(13,27,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e91ce]/35 hover:shadow-[0_2px_4px_rgba(13,27,42,0.04),0_18px_38px_-18px_rgba(62,145,206,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3e91ce]">Next step</p>
              <h2 className="mb-3 text-[1.15rem] font-bold tracking-tight text-[#0d1b2a]">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <DetailFooterBand family="tools" currentHref="/tools/repair-reline-replace" />

      <FAQBlock faqs={faqs} heading="Repair vs Reline vs Replace — FAQs" />
      <CTABanner
        heading="READY TO CONFIRM THE RIGHT PATH?"
        subheading="Request a tank assessment and PC Water Infrastructure will validate the recommendation and scope the works."
        primaryCTA={{ label: 'Request an Assessment', href: '/contact' }}
        secondaryCTA={{ label: 'Explore RPVC Relining', href: '/services/rpvc-liner-systems' }}
      />
    </>
  )
}
