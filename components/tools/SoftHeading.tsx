/**
 * The tools section's heading. Deliberately softer than the editorial
 * RuleHeading used elsewhere: no heavy navy rule, just a short rounded
 * accent in the brand blue.
 */
export default function SoftHeading({
  kicker,
  children,
  meta,
  light = false,
}: {
  kicker?: string
  children: React.ReactNode
  meta?: string
  light?: boolean
}) {
  return (
    <div className="mb-6">
      {kicker && (
        <p
          className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            light ? 'text-[#7fc2f0]' : 'text-[#3e91ce]'
          }`}
        >
          {kicker}
        </p>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          className={`text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[2rem] ${
            light ? 'text-white' : 'text-[#0d1b2a]'
          }`}
        >
          {children}
        </h2>
        {meta && (
          <span className={`text-[13px] ${light ? 'text-gray-400' : 'text-[#7a8b99]'}`}>{meta}</span>
        )}
      </div>
      <span
        className={`mt-3 block h-1 w-12 rounded-full ${light ? 'bg-[#3e91ce]' : 'bg-[#3e91ce]'}`}
        aria-hidden="true"
      />
    </div>
  )
}
