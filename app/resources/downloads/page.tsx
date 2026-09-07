import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CTABanner from '@/components/CTABanner'
import FAQBlock from '@/components/FAQBlock'
import ResourcesDownloadSection from '@/components/ResourcesDownloadSection'
import CrossLinks from '@/components/editorial/CrossLinks'
import Masthead from '@/components/editorial/Masthead'
import RuleHeading from '@/components/editorial/RuleHeading'
import { getPublicPosts } from '@/lib/cms/queries'
import { enrichArticles, sortByNewest } from '@/lib/cms/taxonomy'
import { SHELL } from '@/lib/shell'

export const dynamic = 'force-static'

const siteUrl = process.env.SITE_URL || 'https://pcwater.com.au'
const RESOURCE_COUNT = 7

export const metadata: Metadata = {
  title: 'Free Technical Downloads',
  description:
    'Free downloadable guides, checklists, and compliance resources for water storage engineers, asset managers, and operators across Australia.',
  keywords: [
    'free water tank guides australia',
    'tank maintenance checklist download',
    'fire water compliance guide',
    'AS2304 guide download',
    'RPVC liner guide',
    'water treatment resources',
    'tank upgrade decision guide',
  ],
  alternates: { canonical: '/resources/downloads' },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'PC Water Infrastructure',
    title: 'Free Technical Downloads | PC Water',
    description: 'Checklists, compliance guides, and decision frameworks — free to download from PC Water.',
    url: 'https://pcwater.com.au/resources/downloads',
    images: [{ url: '/hero.png', width: 1200, height: 630, alt: 'PC Water Infrastructure Free Downloads' }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero.png'] },
}

const benefits = [
  {
    title: 'Written by Engineers',
    desc: 'Every guide is produced by the same engineers who deliver projects — not marketers. The content is technical, direct, and field-tested.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
  {
    title: 'Genuinely Free',
    desc: 'No credit card, no trial. Enter your email and get instant access. We send one confirmation — you decide if you want to hear more.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
  },
  {
    title: 'Compliance-Ready',
    desc: 'Built around Australian standards — AS2304, AS1851, AS4020. Use them directly in your asset management, procurement, or compliance documentation.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    title: 'Updated Regularly',
    desc: 'Standards and practices evolve. Our guides are reviewed and updated when the underlying standards or common industry practice changes.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    ),
  },
]

const downloadFaqItems = [
  {
    question: 'Do I have to pay for these guides?',
    answer:
      "No. Every guide on this page is genuinely free. You enter your email address, and we send you the download link. That's it. You can opt out of any further communication immediately.",
  },
  {
    question: 'Who are these guides written for?',
    answer:
      'Asset managers, engineers, operators, and owners who work with water storage infrastructure. The language is technical and direct — these are working documents, not marketing brochures.',
  },
  {
    question: 'Are these guides current with Australian standards?',
    answer:
      'Yes. All guides reference current AS2304, AS1851, and AS4020 requirements. We review and update when standards are revised or when industry practice has materially shifted.',
  },
  {
    question: 'What is the difference between PC Tanks and PC Water Solutions resources?',
    answer:
      "PC Tanks is our water storage division — focused on tanks, liners, fire water compliance, and asset maintenance. PC Water Solutions is our water treatment division — focused on WTPs, operations, and remote treatment infrastructure. The guides are divided by division so you can find what's relevant to your project type.",
  },
  {
    question: 'Can I share these guides with my team or clients?',
    answer:
      'Yes, within your organisation. The guides are provided for professional use. If you are distributing broadly or using content in published work, please contact us.',
  },
]

export default async function DownloadsPage() {
  const posts = await getPublicPosts()
  const featuredArticles = sortByNewest(enrichArticles(posts))
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
    name: 'Free Technical Downloads',
    description:
      'Free downloadable guides, checklists, and compliance resources for water storage engineers, asset managers, and operators.',
    url: `${siteUrl}/resources/downloads`,
    isPartOf: { '@type': 'CollectionPage', name: 'Articles & Insights', url: `${siteUrl}/resources` },
    publisher: { '@type': 'Organization', name: 'PC Water Infrastructure', url: siteUrl },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Articles', url: `${siteUrl}/resources` },
          { name: 'Free Downloads', url: `${siteUrl}/resources/downloads` },
        ]}
      />

      <Masthead
        kicker="Free Downloads"
        title={
          <>
            FREE TECHNICAL<br />
            <span className="text-[#3e91ce]">RESOURCES.</span>
          </>
        }
        lead="Checklists, compliance guides, and decision frameworks — built for engineers, asset managers, and operators. Free to download, no strings attached."
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Articles', href: '/resources' },
          { label: 'Free Downloads' },
        ]}
        stats={[
          { label: 'Guides', value: RESOURCE_COUNT },
          { label: 'Divisions', value: 2 },
          { label: 'Cost', value: 'Free' },
        ]}
        secondaryCta={{ label: 'Browse All Articles', href: '/resources' }}
      />

      {/* ── Why these guides ── */}
      <section className="border-b border-gray-100 bg-white py-8 sm:py-10">
        <div className={SHELL}>
          <RuleHeading meta="Why download">What Makes These Different</RuleHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-gray-200 bg-[#f4f6f8] p-5 transition-all hover:border-[#3e91ce]/40 hover:shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#3e91ce]/10 text-[#3e91ce]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {benefit.icon}
                  </svg>
                </div>
                <h3 className="mb-1.5 text-[14px] font-bold text-[#30505b]">{benefit.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Downloads grid ── */}
      <section id="downloads" className="scroll-mt-20 bg-[#f4f6f8] py-8 sm:py-10">
        <div className={SHELL}>
          <RuleHeading meta={`${RESOURCE_COUNT} guides`}>Free Guides &amp; Resources</RuleHeading>
          <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-gray-600">
            Practical technical guides for engineers, asset managers, and operators. Enter your email to access any
            guide instantly.
          </p>
          <ResourcesDownloadSection />
        </div>
      </section>

      <FAQBlock faqs={downloadFaqItems} heading="About These Resources" />

      {/* ── Featured articles (advertise blog) ── */}
      {featuredArticles.length > 0 && (
        <section className="border-t border-gray-200 bg-[#f4f6f8] py-8 sm:py-10">
          <div className={SHELL}>
            <RuleHeading meta="From the library">Technical Articles</RuleHeading>
            <CrossLinks links={featuredArticles} columns={3} />
            <Link
              href="/resources"
              className="mt-5 inline-flex items-center gap-1.5 border-t border-gray-300 pt-4 text-[13px] font-bold text-[#2a72ad] transition-colors hover:text-[#3e91ce]"
            >
              Browse the article library
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      <CTABanner
        heading="NEED SOMETHING MORE SPECIFIC?"
        subheading="If you have a specific compliance, design, or maintenance question, our team can help."
        primaryCTA={{ label: 'Talk to Our Team', href: '/contact' }}
        secondaryCTA={{ label: 'Browse Articles', href: '/resources' }}
        variant="navy"
      />
    </>
  )
}
