import AppImage from '@/components/AppImage'

/**
 * A wide supporting photo spanning the two content columns beside the
 * detail-page rail. Gives the main content real visual weight so it isn't
 * dwarfed by the taller sidebar in the shared grid row.
 */
export default function OverviewPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="xl:col-span-2">
      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-[#162538] sm:aspect-[2.4/1]">
        <AppImage src={src} alt={alt} fill className="object-cover object-center" sizes="(max-width: 1280px) 100vw, 66vw" />
      </div>
    </div>
  )
}
