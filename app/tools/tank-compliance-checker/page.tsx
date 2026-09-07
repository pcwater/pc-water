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
  title: 'Water Tank Compliance Checker',
  description:
    'Free tank compliance checker for Australian water tanks. Answer questions on type, age, inspection history, and condition to get a compliance-risk indication.',
  keywords: [
    'water tank compliance check',
    'fire water tank compliance australia',
    'AS2304 compliance',
    'AS1851 inspection',
    'tank inspection checklist',
    'water tank compliance risk',
    'is my water tank compliant',
  ],
  alternates: { canonical: '/tools/tank-compliance-checker' },
  openGraph: {
    title: 'Water Tank Compliance Checker',
    description:
      'Answer a few questions and get a fast indication of your water tank’s likely compliance risk, plus a clear next step.',
    url: `${siteUrl}/tools/tank-compliance-checker`,
    type: 'website',
    images: [{ url: '/hero.png', width: 1200, height: 630, alt: 'PC Water Infrastructure — Engineered Water Asset Solutions' }],
  },
  twitter: { card: 'summary_large_image' as const, images: ['/hero.png'] },
}

const faqs = [
  {
    question: 'Is the Tank Compliance Checker a legal compliance certificate?',
    answer:
      'No. It is a free guidance tool that gives a fast indication of likely compliance risk based on your answers. It is not a legal compliance certificate or a substitute for a formal inspection. For a definitive position, request a compliance review from PC Water Infrastructure.',
  },
  {
    question: 'Which standards apply to my water tank?',
    answer:
      'Fire water tanks are governed by AS2304 for design and AS1851 for ongoing maintenance and inspection. Potable (drinking) water tanks must meet AS4020 material requirements and ADWG hygiene expectations. The right combination depends on how the tank is used.',
  },
  {
    question: 'How accurate is the result?',
    answer:
      'The result is a rule-based indicator designed to flag uncertainty as risk. It is intentionally conservative. The only way to confirm true compliance and condition is a formal inspection, which can assess internal corrosion, liner integrity, and structural soundness that are not visible from the outside.',
  },
  {
    question: 'What happens after I get my result?',
    answer:
      'You can review your recommended next step, follow the relevant service links, or request a compliance review. If you enter your email, a PC Water specialist can send a tailored summary and help you plan an inspection or remediation.',
  },
  {
    question: 'How often should a water tank be inspected?',
    answer:
      'Fire protection water tanks require annual inspection and maintenance under AS1851. For other tanks, a documented inspection cycle — typically every one to three years depending on age, environment, and use — is the most reliable way to keep compliance risk low.',
  },
]

const audience = [
  'Facility and asset managers',
  'Local councils and water authorities',
  'Commercial property operators',
  'Mining and industrial asset managers',
  'Fire compliance stakeholders',
  'Building owners and operators',
]

const steps = [
  { step: '01', label: 'Answer eight questions', desc: 'Tank type, material, age, inspection history, visible issues, environment, maintenance, and documentation.' },
  { step: '02', label: 'Get an instant risk indication', desc: 'A clear result from low apparent risk through to urgent review recommended.' },
  { step: '03', label: 'See your recommended next step', desc: 'Plain-language guidance plus the most relevant PC Water services.' },
  { step: '04', label: 'Request a review', desc: 'Book an inspection or compliance review, or get a tailored summary by email.' },
]

export default function TankComplianceCheckerPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Tools', url: `${siteUrl}/tools` },
          { name: 'Tank Compliance Checker', url: `${siteUrl}/tools/tank-compliance-checker` },
        ]}
      />

      {/* Hero — asset-free gradient */}
      <SoftHero
        kicker="Free Tool"
        title="Tank Compliance Checker"
        lead="Not sure whether your water tank is compliant, at risk, or overdue for review? Answer a few quick questions and get a fast, plain-language indication of your likely compliance risk — and exactly what to do next."
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: "Tank Compliance Checker" },
        ]}
        primaryCta={{ label: 'Start the Compliance Check', href: '#assessment' }}
        secondaryCta={{ label: 'All Free Tools', href: '/tools' }}
      />

      {/* The tool */}
      <div id="assessment" className="scroll-mt-20" />
      <AssessmentTool slug="tank-compliance-checker" />

      {/* How it works */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d1b2a] via-[#17334b] to-[#30505b] py-12 sm:rounded-[3rem] sm:py-16">
        <div className="pointer-events-none absolute -top-28 right-[-8%] h-[22rem] w-[22rem] rounded-full bg-[#3e91ce]/20 blur-[110px]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <h2 className="mb-10 text-center text-[1.7rem] font-bold tracking-tight text-white sm:text-[2.1rem]">How the Compliance Checker Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <p className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#3e91ce]/20 text-[14px] font-bold text-[#7fc2f0]">{s.step}</p>
                <h3 className="font-bold text-white mb-2">{s.label}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3e91ce]">Who this is for</p>
          <h2 className="mb-8 text-[1.6rem] font-bold tracking-tight text-[#0d1b2a] sm:text-[2rem]">
            Built for the people responsible for tank assets
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

      {/* Related next steps */}
      <section className="bg-gradient-to-b from-[#f7fafc] to-white py-12 sm:py-16">
        <div className={`${SHELL} grid grid-cols-1 md:grid-cols-3 gap-6`}>
          {[
            { title: 'Tank Inspection Technology', description: 'ROV and UAV inspection methods that assess condition with less disruption — often without dewatering.', href: '/services/tank-inspection-technology' },
            { title: 'Fire Water Tank Solutions', description: 'AS2304 design and AS1851 maintenance for compliant, insurance-ready fire water storage.', href: '/services/fire-water-tanks' },
            { title: 'Repair vs Reline vs Replace tool', description: 'If your tank is aging, find out whether to repair, reline, or replace it.', href: '/tools/repair-reline-replace' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[1.5rem] border border-[#e6ecf2] bg-white p-6 shadow-[0_1px_2px_rgba(13,27,42,0.03),0_10px_28px_-18px_rgba(13,27,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e91ce]/35 hover:shadow-[0_2px_4px_rgba(13,27,42,0.04),0_18px_38px_-18px_rgba(62,145,206,0.4)]">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3e91ce]">Next step</p>
              <h2 className="mb-3 text-[1.15rem] font-bold tracking-tight text-[#0d1b2a]">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <DetailFooterBand family="tools" currentHref="/tools/tank-compliance-checker" />

      <FAQBlock faqs={faqs} heading="Tank Compliance Checker — FAQs" />
      <CTABanner
        heading="WANT A DEFINITIVE COMPLIANCE POSITION?"
        subheading="A quick check is a starting point. Request a formal inspection and compliance review from PC Water Infrastructure."
        primaryCTA={{ label: 'Request a Compliance Review', href: '/contact' }}
        secondaryCTA={{ label: 'Explore Inspection Technology', href: '/services/tank-inspection-technology' }}
      />
    </>
  )
}
