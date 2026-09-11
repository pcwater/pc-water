import type { CategorySlug } from '@/lib/cms/taxonomy'

export interface ArticleConversion {
  eyebrow: string
  heading: string
  body: string
  service: string
  enquiryLabel: string
  toolLabel: string
  toolHref: string
}

const conversions: Record<CategorySlug, ArticleConversion> = {
  'corrosion-coatings': {
    eyebrow: 'Move from symptoms to a scoped solution',
    heading: 'Seeing corrosion, coating failure or active deterioration?',
    body: 'Share the asset condition, location and operating constraints. PC Water can help define whether inspection, repair, relining or replacement is the practical next move.',
    service: 'RPVC Liner Systems',
    enquiryLabel: 'Discuss Tank Remediation',
    toolLabel: 'Compare Repair, Reline or Replace',
    toolHref: '/tools/repair-reline-replace',
  },
  'inspection-testing': {
    eyebrow: 'Turn uncertainty into evidence',
    heading: 'Need a defensible picture of the tank condition?',
    body: 'Tell us what is known about the asset and the decision the inspection needs to support. We can scope the right inspection pathway around access, downtime and risk.',
    service: 'Tank Inspection Technology',
    enquiryLabel: 'Request an Inspection Scope',
    toolLabel: 'Check Apparent Compliance Risk',
    toolHref: '/tools/tank-compliance-checker',
  },
  'cleaning-sediment': {
    eyebrow: 'Plan the intervention',
    heading: 'Sediment, contamination or cleaning work on the horizon?',
    body: 'Share the tank use, approximate capacity and operating constraints. We can help scope cleaning, inspection and any repair work discovered along the way.',
    service: 'Tank Maintenance & Upgrades',
    enquiryLabel: 'Scope Tank Cleaning Work',
    toolLabel: 'Check Apparent Compliance Risk',
    toolHref: '/tools/tank-compliance-checker',
  },
  'water-quality': {
    eyebrow: 'Protect stored water quality',
    heading: 'Investigating a water quality or contamination risk?',
    body: 'Describe the symptoms, tank application and site context. PC Water can help connect the storage condition, treatment requirements and practical corrective work.',
    service: 'Water Treatment Solutions',
    enquiryLabel: 'Discuss Water Quality Risk',
    toolLabel: 'Check Apparent Compliance Risk',
    toolHref: '/tools/tank-compliance-checker',
  },
  'fire-water': {
    eyebrow: 'Reduce compliance exposure',
    heading: 'Need confidence in a fire water storage asset?',
    body: 'Share the system type, known defects and inspection history. We can help scope the inspection, remediation or replacement work needed to support compliance.',
    service: 'Fire Water Tank Solutions',
    enquiryLabel: 'Discuss Fire Water Compliance',
    toolLabel: 'Run the Tank Compliance Checker',
    toolHref: '/tools/tank-compliance-checker',
  },
  'tank-design': {
    eyebrow: 'Start with the right design basis',
    heading: 'Planning a new or replacement storage asset?',
    body: 'Send the intended use, capacity, location and site constraints. PC Water can help shape the design, civil interface, installation and commissioning pathway.',
    service: 'Custom Tank Design & Engineering',
    enquiryLabel: 'Scope a Tank Project',
    toolLabel: 'Check an Existing Tank First',
    toolHref: '/tools/tank-compliance-checker',
  },
  'repair-lifecycle': {
    eyebrow: 'Choose the right lifecycle pathway',
    heading: 'Deciding whether to repair, reline or replace?',
    body: 'Share the tank condition, application and downtime limits. We can help turn the available evidence into a practical remediation scope and delivery plan.',
    service: 'Tank Maintenance & Upgrades',
    enquiryLabel: 'Request a Remediation Scope',
    toolLabel: 'Compare Repair, Reline or Replace',
    toolHref: '/tools/repair-reline-replace',
  },
  'project-delivery': {
    eyebrow: 'De-risk project delivery',
    heading: 'Need one accountable team around the water package?',
    body: 'Tell us where the project sits, what is already designed and where delivery risk remains. We can help coordinate the storage, treatment, civil and installation scope.',
    service: 'Project Managed Water Infrastructure',
    enquiryLabel: 'Discuss Project Delivery',
    toolLabel: 'Assess an Existing Asset',
    toolHref: '/tools/tank-compliance-checker',
  },
  'asset-management': {
    eyebrow: 'Turn asset data into action',
    heading: 'Building a maintenance, renewal or risk programme?',
    body: 'Share the asset portfolio, known condition data and planning horizon. PC Water can help prioritise inspections, remediation and capital work around operational risk.',
    service: 'Tank Maintenance & Upgrades',
    enquiryLabel: 'Discuss Asset Planning',
    toolLabel: 'Check Apparent Compliance Risk',
    toolHref: '/tools/tank-compliance-checker',
  },
  regional: {
    eyebrow: 'Plan for the site, not just the tank',
    heading: 'Delivering water infrastructure in a regional or remote location?',
    body: 'Share the location, intended use and access constraints. We can help plan the storage, treatment, logistics, installation and commissioning as one coordinated package.',
    service: 'Remote Area Project Delivery',
    enquiryLabel: 'Discuss a Regional Project',
    toolLabel: 'Check an Existing Tank',
    toolHref: '/tools/tank-compliance-checker',
  },
}

export function getArticleConversion(category: CategorySlug) {
  return conversions[category]
}

export function buildArticleEnquiryHref(
  conversion: ArticleConversion,
  articleSlug: string,
  articleTitle: string,
) {
  const params = new URLSearchParams({
    source: 'article',
    campaignId: articleSlug,
    service: conversion.service,
    message: `I read "${articleTitle}" and would like to discuss a relevant project or asset issue.`,
  })
  return `/contact?${params.toString()}#project-enquiry`
}
