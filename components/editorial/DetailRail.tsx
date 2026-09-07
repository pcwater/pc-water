import { Rail, RailContact, RailDownload, RailLinks, RailPanel } from '@/components/editorial/RailPanel'
import { allServices, type DirectoryFamily, industries, STANDARDS } from '@/lib/site-directory'

const CROSS_TITLE: Record<DirectoryFamily, string> = {
  services: 'Who we deliver for',
  industries: 'Services behind this',
  tools: 'Where this leads',
}

/**
 * The sticky rail beside the opening content section of every detail page —
 * standards, cross-family links, the capability statement and a contact
 * prompt. Deliberately doesn't repeat sibling pages or articles: those get
 * full image cards further down the page via DetailFooterBand, so listing
 * them again here as bare text would only pad the rail without adding
 * anything a reader can't already see below.
 */
export default function DetailRail({
  family,
  currentHref: _currentHref,
}: {
  family: DirectoryFamily
  currentHref: string
}) {
  /* Services point at the sectors that buy them, sectors point back at the
     services that serve them, and tools point at both. */
  const crossLinks =
    family === 'services'
      ? industries.map((i) => ({ label: i.title, href: i.href }))
      : family === 'industries'
        ? allServices.slice(0, 6).map((s) => ({ label: s.title, href: s.href }))
        : allServices.slice(0, 4).map((s) => ({ label: s.title, href: s.href }))

  return (
    <Rail variant="wrap" className="lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-span-2">
      <RailPanel title="Standards we work to">
        <div className="flex flex-wrap gap-1.5">
          {STANDARDS.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-[#30505b]"
            >
              {s}
            </span>
          ))}
        </div>
      </RailPanel>

      <RailPanel title={CROSS_TITLE[family]}>
        <RailLinks links={crossLinks} />
      </RailPanel>

      <RailDownload />

      <RailContact />
    </Rail>
  )
}
