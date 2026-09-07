'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import RuleHeading from '@/components/editorial/RuleHeading'
import ResourceDownloadGate from '@/components/ResourceDownloadGate'
import StaggerContainer, { StaggerItem } from '@/components/StaggerContainer'
import { DOWNLOADS } from '@/lib/downloadables'

interface Resource {
  slug: string
  title: string
  desc: string
  tag: string
  division: string
  fileUrl: string
  icon: React.ReactNode
}

/* Icon paths, 24x24 viewBox, stroke-based to match the rest of the kit. */
const ICONS = {
  checklist: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 4.5h6a1.5 1.5 0 011.5 1.5v.75h-9V6A1.5 1.5 0 019 4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7.5 6.75H6A1.5 1.5 0 004.5 8.25v11.25A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5V8.25a1.5 1.5 0 00-1.5-1.5h-1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8.25 12.75l2.25 2.25 5.25-5.25" />
    </>
  ),
  decision: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 0V9a3 3 0 0 0-3-3h-4.5m0 0 3-3m-3 3 3 3M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
    />
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M9 12.75 11.25 15 15 9.75M21 12c0 5.25-3.75 8.25-9 9.75C6.75 20.25 3 17.25 3 12V6.75c3-.375 6-1.5 9-3.375 3 1.875 6 3 9 3.375V12Z"
    />
  ),
  gauge: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.5 15a7.5 7.5 0 1115 0" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15l3.5-4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </>
  ),
  clipboardList: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 4.5h6a1.5 1.5 0 011.5 1.5v.75h-9V6A1.5 1.5 0 019 4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7.5 6.75H6A1.5 1.5 0 004.5 8.25v11.25A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5V8.25a1.5 1.5 0 00-1.5-1.5h-1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8.25 12h7.5M8.25 15.5h7.5M8.25 8.5h7.5" />
    </>
  ),
  droplet: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M12 3c-3.5 4.5-6 8-6 10.5a6 6 0 1012 0C18 11 15.5 7.5 12 3z"
    />
  ),
  mapPin: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 11a2 2 0 100-4 2 2 0 000 4z" />
    </>
  ),
} as const

const pcTanksResources: Resource[] = [
  {
    slug: 'tank-maintenance-checklist',
    title: 'Tank Maintenance Checklist',
    desc: 'Practical asset owner checklist for assessing tank condition and prioritising maintenance needs.',
    tag: 'Maintenance',
    division: 'PC Tanks',
    fileUrl: DOWNLOADS.maintenanceChecklist,
    icon: ICONS.checklist,
  },
  {
    slug: 'tank-upgrade-decision-guide',
    title: 'Tank Upgrade Decision Guide',
    desc: 'When to reline, repair, or replace — practical guidance for asset managers navigating the options.',
    tag: 'Asset Management',
    division: 'PC Tanks',
    fileUrl: DOWNLOADS.tankUpgradeGuide,
    icon: ICONS.decision,
  },
  {
    slug: 'fire-water-compliance-guide',
    title: 'Fire Water Compliance Guide',
    desc: 'Understanding AS2304 and AS1851 requirements for fire water storage — what engineers and operators need to know.',
    tag: 'Compliance',
    division: 'PC Tanks',
    fileUrl: DOWNLOADS.fireWaterGuide,
    icon: ICONS.shield,
  },
]

const pcWaterSolutionsResources: Resource[] = [
  {
    slug: 'wtp-compliance-monitoring-guide',
    title: 'WTP Compliance Monitoring Guide',
    desc: 'A structured guide to monitoring and documenting compliance across water treatment plant operations.',
    tag: 'Water Treatment',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.wtpComplianceMonitoringGuide,
    icon: ICONS.gauge,
  },
  {
    slug: 'wtp-operator-checklist',
    title: 'WTP Operator Checklist',
    desc: 'Day-to-day operational checklist for water treatment plant operators — inspection, monitoring, and recordkeeping.',
    tag: 'Operations',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.wtpOperatorChecklist,
    icon: ICONS.clipboardList,
  },
  {
    slug: 'wtp-disinfection-compliance-primer',
    title: 'WTP Disinfection Compliance Primer',
    desc: 'Core principles and compliance requirements for disinfection in Australian water treatment systems.',
    tag: 'Compliance',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.wtpDisinfectionCompliancePrimer,
    icon: ICONS.droplet,
  },
  {
    slug: 'remote-wtp-construction-commissioning',
    title: 'Remote WTP Construction & Commissioning',
    desc: 'What it takes to deliver and commission a water treatment plant in remote Australia — logistics, constraints, and solutions.',
    tag: 'Remote Projects',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.remoteProjectGuide,
    icon: ICONS.mapPin,
  },
]

function DownloadIcon() {
  return (
    <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  )
}

function ResourceCard({ resource, onDownload }: { resource: Resource; onDownload: (r: Resource) => void }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-[#3e91ce]/50 hover:shadow-lg hover:shadow-[#3e91ce]/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3e91ce]/10 text-[#3e91ce] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#3e91ce] group-hover:text-white">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {resource.icon}
          </svg>
        </span>
        <span className="rounded-full bg-[#f4f6f8] px-2.5 py-1 text-[11px] font-semibold text-[#2a72ad]">{resource.tag}</span>
      </div>
      <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-[#30505b] transition-colors group-hover:text-[#2a72ad]">
        {resource.title}
      </h3>
      <p className="mb-5 flex-1 text-[13px] leading-relaxed text-gray-500">{resource.desc}</p>
      <button
        onClick={() => onDownload(resource)}
        className="group/btn inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2a72ad] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:gap-2.5 hover:bg-[#3e91ce]"
      >
        Download Free
        <DownloadIcon />
      </button>
    </motion.div>
  )
}

export default function ResourcesDownloadSection() {
  const [active, setActive] = useState<Resource | null>(null)

  function handleDownload(resource: Resource) {
    setActive(resource)
  }

  return (
    <>
      {/* PC Tanks Resources */}
      <div className="mb-10">
        <RuleHeading meta="Division Two · PC Tanks">Tank & Storage Guides</RuleHeading>
        <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
          {pcTanksResources.map((r) => (
            <StaggerItem key={r.slug}>
              <ResourceCard resource={r} onDownload={handleDownload} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* PC Water Solutions Resources */}
      <div>
        <RuleHeading meta="Division One · PC Water Solutions">Water Treatment Guides</RuleHeading>
        <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
          {pcWaterSolutionsResources.map((r) => (
            <StaggerItem key={r.slug}>
              <ResourceCard resource={r} onDownload={handleDownload} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Email gate modal */}
      {active && (
        <ResourceDownloadGate
          resourceSlug={active.slug}
          resourceTitle={active.title}
          division={active.division}
          fileUrl={active.fileUrl}
          onClose={() => setActive(null)}
        />
      )}
    </>
  )
}
