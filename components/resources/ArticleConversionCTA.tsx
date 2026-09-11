import Link from 'next/link'

import {
  buildArticleEnquiryHref,
  getArticleConversion,
} from '@/lib/article-conversion'
import type { CategorySlug } from '@/lib/cms/taxonomy'

export default function ArticleConversionCTA({
  category,
  articleSlug,
  articleTitle,
}: {
  category: CategorySlug
  articleSlug: string
  articleTitle: string
}) {
  const conversion = getArticleConversion(category)
  const enquiryHref = buildArticleEnquiryHref(conversion, articleSlug, articleTitle)

  return (
    <aside className="relative my-12 overflow-hidden rounded-[1.75rem] bg-[#0d2134] px-6 py-8 text-white shadow-[0_28px_70px_-38px_rgba(13,33,52,0.9)] sm:px-9 sm:py-10">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#53a6dc]/20" />
      <div className="absolute -right-4 -top-6 h-36 w-36 rounded-full bg-[#3e91ce]/10 blur-2xl" />
      <div className="relative">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#69b7e7]">
          {conversion.eyebrow}
        </p>
        <h2 className="max-w-2xl text-2xl font-black leading-tight sm:text-[2rem]">
          {conversion.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-300">
          {conversion.body}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={enquiryHref}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#3e91ce] px-6 text-sm font-bold text-white transition hover:bg-[#2f7fb9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {conversion.enquiryLabel}
            <span className="ml-2" aria-hidden>→</span>
          </Link>
          <Link
            href={conversion.toolHref}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-6 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {conversion.toolLabel}
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">No obligation. Project enquiries are reviewed within one business day.</p>
      </div>
    </aside>
  )
}
