'use client'

import { useState } from 'react'
import AppImage from '@/components/AppImage'
import RuleHeading from '@/components/editorial/RuleHeading'
import ResourceDownloadGate from '@/components/ResourceDownloadGate'
import { DOWNLOADS } from '@/lib/downloadables'

interface Resource {
  slug: string
  title: string
  desc: string
  tag: string
  division: string
  fileUrl: string
  imageSrc: string
}

const pcTanksResources: Resource[] = [
  {
    slug: 'tank-maintenance-checklist',
    title: 'Tank Maintenance Checklist',
    desc: 'Practical asset owner checklist for assessing tank condition and prioritising maintenance needs.',
    tag: 'Maintenance',
    division: 'PC Tanks',
    fileUrl: DOWNLOADS.maintenanceChecklist,
    imageSrc: '/heroes/tank-maintenance-upgrades.jpg',
  },
  {
    slug: 'tank-upgrade-decision-guide',
    title: 'Tank Upgrade Decision Guide',
    desc: 'When to reline, repair, or replace — practical guidance for asset managers navigating the options.',
    tag: 'Asset Management',
    division: 'PC Tanks',
    fileUrl: DOWNLOADS.tankUpgradeGuide,
    imageSrc: '/posts/corrosion-rpvc-liner.jpg',
  },
  {
    slug: 'fire-water-compliance-guide',
    title: 'Fire Water Compliance Guide',
    desc: 'Understanding AS2304 and AS1851 requirements for fire water storage — what engineers and operators need to know.',
    tag: 'Compliance',
    division: 'PC Tanks',
    fileUrl: DOWNLOADS.fireWaterGuide,
    imageSrc: '/heroes/fire-water-tanks.jpg',
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
    imageSrc: '/water/water-16.jpg',
  },
  {
    slug: 'wtp-operator-checklist',
    title: 'WTP Operator Checklist',
    desc: 'Day-to-day operational checklist for water treatment plant operators — inspection, monitoring, and recordkeeping.',
    tag: 'Operations',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.wtpOperatorChecklist,
    imageSrc: '/water/water-03.jpg',
  },
  {
    slug: 'wtp-disinfection-compliance-primer',
    title: 'WTP Disinfection Compliance Primer',
    desc: 'Core principles and compliance requirements for disinfection in Australian water treatment systems.',
    tag: 'Compliance',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.wtpDisinfectionCompliancePrimer,
    imageSrc: '/water/water-18.jpg',
  },
  {
    slug: 'remote-wtp-construction-commissioning',
    title: 'Remote WTP Construction & Commissioning',
    desc: 'What it takes to deliver and commission a water treatment plant in remote Australia — logistics, constraints, and solutions.',
    tag: 'Remote Projects',
    division: 'PC Water Solutions',
    fileUrl: DOWNLOADS.remoteProjectGuide,
    imageSrc: '/heroes/remote-area-delivery.jpg',
  },
]

function DownloadIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-[#3e91ce]/60 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#162538]">
        <AppImage
          src={resource.imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/55 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#2a72ad]">
          {resource.tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-[#30505b] transition-colors group-hover:text-[#2a72ad]">
          {resource.title}
        </h3>
        <p className="mb-4 flex-1 text-[13px] leading-relaxed text-gray-500">{resource.desc}</p>
        <button
          onClick={() => onDownload(resource)}
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2a72ad] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#3e91ce]"
        >
          Download Free
          <DownloadIcon />
        </button>
      </div>
    </div>
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pcTanksResources.map((r) => (
            <ResourceCard key={r.slug} resource={r} onDownload={handleDownload} />
          ))}
        </div>
      </div>

      {/* PC Water Solutions Resources */}
      <div>
        <RuleHeading meta="Division One · PC Water Solutions">Water Treatment Guides</RuleHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pcWaterSolutionsResources.map((r) => (
            <ResourceCard key={r.slug} resource={r} onDownload={handleDownload} />
          ))}
        </div>
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
