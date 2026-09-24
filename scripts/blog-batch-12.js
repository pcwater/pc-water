/**
 * blog-batch-12.js - authors + integrates 50 new city/region-targeted blog
 * posts, extending the regional series (batches 1-11, now 126 cities) to a
 * further round of genuine Australian towns that had no dedicated article:
 * smaller agricultural service towns, mining towns and remote centres
 * across all seven states/territories.
 *
 * Content is generated from a structured per-city data table + a shared
 * template function (not hand-duplicated prose per post), but every city's
 * facts (region, water feature, dominant industry, climate classification)
 * are genuine and specific to that place - no invented company case
 * studies or fabricated numeric claims, per the batch process rules in
 * scripts/HOW_TO_CREATE_BLOGS.txt. Numeric "stat" callouts are drawn from a
 * small pool of universal, verifiable engineering/regulatory constants
 * (AS/NZS 1170.2 wind regions, hydrostatic head, Legionella growth range,
 * standard Defects Liability Period, etc.), rotated by climate category -
 * never a city-specific number that can't be verified.
 *
 * Two modes:
 *   node scripts/blog-batch-12.js static   -> prints TS entries for
 *                                              lib/cms/static-content.ts
 *   node scripts/blog-batch-12.js          -> uploads images + upserts to Supabase
 *
 * Dates: fit between the last existing post (2026-09-18) and today
 * (2026-09-24) - 6 days, ~8-9 posts/day at 3-hour intervals - never
 * scheduled into the future, per the correction made to batch 11.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const BASE = 'https://mhggidgfivmdgkjerejn.supabase.co/storage/v1/object/public/cms-media/posts'

// -- DATE SPREAD ----------------------------------------------------------
// Fits between the last existing post (2026-09-18) and today (2026-09-24) -
// 6 days, ~8-9 posts/day at 3-hour intervals - never in the future.
const DAY0 = new Date('2026-09-19T00:00:00.000Z')
const NUM_DAYS = 6
const dayCounts = new Array(NUM_DAYS).fill(0)
function d(i) {
  const dayIdx = i % NUM_DAYS
  const slot = dayCounts[dayIdx]++
  const hours = slot * 2 // 2-hour spacing, max 12 slots/day (50/6 days needs up to 9/day)
  return new Date(DAY0.getTime() + dayIdx * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000).toISOString()
}

// -- IMAGES (reused generic imagery - no new city photos in this batch) ---
const GENERIC_IMAGES = [
  'sector-hero.jpg',
  'sector-inspection.jpg',
  'harsh-env-hero.jpg',
  'harsh-env-drone.jpg',
  'corrosion-hero.jpg',
  'corrosion-rov-inspection.jpg',
  'cleaning-inspection-hero.jpg',
  'fire-tank-hero.jpg',
  'fire-tank-inspection.jpg',
  'ticking-hero.jpg',
  'ticking-inspection.jpg',
  'sediment-tank-hero.jpg',
  'water-food-hero.jpg',
  'water-food-hatch.jpg',
  'rpvc-hero.jpg',
  'rpvc-inline.jpg',
]

// -- UNIVERSAL, VERIFIABLE ENGINEERING/REGULATORY CONSTANTS (stat pool) ---
const STATS = {
  cyclonicC: { num: 'Region C', label: (city) => `AS/NZS 1170.2 cyclonic wind classification covering ${city} — tank structural design here carries a materially higher wind loading requirement than non-cyclonic regions further south` },
  cyclonicD: { num: 'Region D', label: (city) => `AS/NZS 1170.2 severe cyclonic wind classification covering ${city} — the highest wind loading category in the Australian structural design standard` },
  hydro: { num: '9.81 kPa', label: () => 'Hydrostatic pressure added at the base of a water tank for every metre of head — the constant every tank foundation and shell design has to be checked against' },
  dlp: { num: '12 mths', label: () => 'Standard Defects Liability Period reflected in most Australian water infrastructure procurement contracts' },
  legionella: { num: '20-45°C', label: () => 'The water temperature range in which Legionella bacteria multiply most readily in stored water — the reason temperature control matters as much as disinfectant residual' },
  as4020: { num: 'AS4020', label: () => 'The Australian Standard certifying that a product or material is safe for use in contact with drinking water' },
  windAS: { num: 'AS1170', label: () => 'The Australian Standard series governing structural design actions, including the wind and seismic loads every water tank has to be engineered against' },
  as2419: { num: 'AS2419', label: () => 'The Australian Standard governing fire hydrant installations, including the static water supply a fire tank has to reliably deliver' },
  confinedO2: { num: '19.5-23.5%', label: () => 'The safe oxygen concentration range for confined space entry into a water tank — outside this band, entry requires additional controls before anyone goes in' },
  freeboard: { num: '150mm+', label: () => 'A typical minimum freeboard allowance built into tank design so storm inflow and wave action do not push water over the roofline' },
}
const CYCLONIC_STATS = ['cyclonicC', 'cyclonicD']
const GENERAL_STATS = ['hydro', 'dlp', 'legionella', 'as4020', 'windAS', 'as2419', 'confinedO2', 'freeboard']

// -- CITY DATA --------------------------------------------------------------
// climate: 'cyclonic' (QLD/WA/NT coastal, wind region C/D) | 'tropical' |
//          'subtropical' | 'temperate-cold' | 'semi-arid' | 'arid' |
//          'temperate-coastal' | 'mediterranean'
const CITIES = [
  // QLD (10)
  { city: 'Ipswich', state: 'QLD', region: 'the West Moreton corridor', water: 'on the Bremer River', industry: 'residential growth and light industry', climate: 'subtropical', note: "one of South East Queensland's fastest-growing outer corridors, with a well-documented flood history on the Bremer" },
  { city: 'Beaudesert', state: 'QLD', region: 'the Scenic Rim', water: 'on the Logan River', industry: 'dairy and beef grazing', climate: 'subtropical', note: 'a Scenic Rim agricultural service town on a river with a genuine flood record' },
  { city: 'Sarina', state: 'QLD', region: 'the Mackay sugar belt', water: 'on the Coral Sea coast', industry: 'sugar cane growing and milling', climate: 'cyclonic', note: 'a sugar milling town directly in the North Queensland cyclone corridor' },
  { city: 'Proserpine', state: 'QLD', region: 'the Whitsunday hinterland', water: 'on the Proserpine River', industry: 'sugar cane growing', climate: 'cyclonic', note: 'the agricultural service centre for the Whitsunday region, on a cyclone-exposed coastal plain' },
  { city: 'Cooktown', state: 'QLD', region: 'Cape York', water: 'on the Endeavour River', industry: 'tourism and fishing', climate: 'tropical', note: 'one of the most remote gazetted towns in Queensland, at the southern gateway to Cape York' },
  { city: 'Winton', state: 'QLD', region: 'Central West Queensland', water: 'on the Western River floodplain', industry: 'grazing and outback tourism', climate: 'arid', note: 'a remote outback town reliant on the Great Artesian Basin for bore water' },
  { city: 'Blackall', state: 'QLD', region: 'Central West Queensland', water: 'on the Barcoo River', industry: 'wool and grazing', climate: 'arid', note: 'historically known for its artesian bore, one of the first tapped on the Great Artesian Basin' },
  { city: 'St George', state: 'QLD', region: 'the Western Downs (Balonne)', water: 'on the Balonne River', industry: 'cotton growing and irrigated agriculture', climate: 'semi-arid', note: 'an irrigation town on a river with a well-documented flood history' },
  { city: 'Goondiwindi', state: 'QLD', region: 'the Border Rivers region', water: 'on the Macintyre River', industry: 'cotton and grain growing', climate: 'semi-arid', note: 'a border-region agricultural centre on a river shared with New South Wales' },
  { city: 'Cloncurry', state: 'QLD', region: 'North West Queensland', water: 'on the Cloncurry River', industry: 'copper mining and grazing', climate: 'arid', note: 'historically recorded as one of the hottest towns in Australia during summer' },

  // NSW (12)
  { city: 'Deniliquin', state: 'NSW', region: 'the Riverina', water: 'on the Edward River', industry: 'irrigated agriculture and rice growing', climate: 'semi-arid', note: 'a Riverina irrigation town on a Murray River anabranch' },
  { city: 'Leeton', state: 'NSW', region: 'the Riverina (Murrumbidgee Irrigation Area)', water: 'within the Murrumbidgee Irrigation Area', industry: 'rice growing and food processing', climate: 'semi-arid', note: 'a planned irrigation town built specifically around the Murrumbidgee scheme' },
  { city: 'Hay', state: 'NSW', region: 'the Riverina', water: 'on the Murrumbidgee River', industry: 'grazing and irrigated agriculture', climate: 'semi-arid', note: 'a flat, low-rainfall Riverina plains town on a major inland river' },
  { city: 'Cobar', state: 'NSW', region: 'the far west', water: 'far from reliable natural surface water, reliant on the Great Cobar Water Scheme', industry: 'copper and gold mining', climate: 'arid', note: 'a genuinely water-stressed mining town historically dependent on pipeline supply' },
  { city: 'Bourke', state: 'NSW', region: 'the far north west', water: 'on the Darling River (Barwon)', industry: 'irrigated agriculture and grazing', climate: 'arid', note: "one of the most water-security-tested towns in New South Wales, on the Darling-Baaka system" },
  { city: 'Glen Innes', state: 'NSW', region: 'the New England Tablelands', water: 'on the Beardy Waters catchment', industry: 'grazing and wool', climate: 'temperate-cold', note: 'a high-elevation New England town with genuine winter snow risk' },
  { city: 'Inverell', state: 'NSW', region: 'the New England Tablelands', water: 'near Copeton Dam', industry: 'agriculture and sapphire mining heritage', climate: 'temperate-cold', note: "sits near one of inland New South Wales' largest water storage dams" },
  { city: 'Casino', state: 'NSW', region: 'the Northern Rivers', water: 'on the Richmond River', industry: 'beef processing and dairy', climate: 'subtropical', note: 'a Northern Rivers beef processing centre with a documented flood history' },
  { city: 'Muswellbrook', state: 'NSW', region: 'the Upper Hunter Valley', water: 'on the Hunter River', industry: 'coal mining and viticulture', climate: 'temperate-cold', note: 'an Upper Hunter town where coal mining and cool-climate viticulture sit side by side' },
  { city: 'Batemans Bay', state: 'NSW', region: 'the South Coast', water: 'on the Clyde River', industry: 'tourism and fishing', climate: 'temperate-coastal', note: 'a South Coast tourism town with a documented bushfire and flood history' },
  { city: 'Cowra', state: 'NSW', region: 'the Central West', water: 'on the Lachlan River', industry: 'agriculture and viticulture', climate: 'temperate-cold', note: 'a Central West town on the Lachlan with a mix of grazing and emerging cool-climate wine production' },
  { city: 'Yass', state: 'NSW', region: 'the Southern Tablelands', water: 'on the Yass River', industry: 'grazing and agriculture', climate: 'temperate-cold', note: 'a Southern Tablelands service town near the Canberra-Sydney freight corridor' },

  // VIC (8)
  { city: 'Kyneton', state: 'VIC', region: 'the Macedon Ranges', water: 'on the Campaspe River', industry: 'agriculture and cool-climate tourism', climate: 'temperate-cold', note: 'a Macedon Ranges town at genuine elevation, with cold winters' },
  { city: 'Castlemaine', state: 'VIC', region: 'Central Victoria', water: 'on the Forest Creek catchment', industry: 'historic goldfields heritage and light manufacturing', climate: 'temperate-cold', note: "a former goldfields town in one of Victoria's drier central districts" },
  { city: 'Hamilton', state: 'VIC', region: 'the Western District', water: 'on the Grange Burn', industry: 'wool and beef grazing', climate: 'temperate-cold', note: 'known as the wool capital of Australia, at the centre of the Western District grazing country' },
  { city: 'Leongatha', state: 'VIC', region: 'South Gippsland', water: 'on the Leongatha catchment', industry: 'dairy processing', climate: 'temperate-coastal', note: "a South Gippsland dairy processing town in one of Victoria's wetter districts" },
  { city: 'Warragul', state: 'VIC', region: 'West Gippsland', water: 'on the Moe River catchment', industry: 'dairy and agriculture', climate: 'temperate-coastal', note: 'a West Gippsland dairy service town with reliable but seasonally variable rainfall' },
  { city: 'Morwell', state: 'VIC', region: 'the Latrobe Valley', water: 'on the Morwell River', industry: 'energy generation and manufacturing', climate: 'temperate-cold', note: 'a Latrobe Valley energy-sector town undergoing significant industrial transition' },
  { city: 'Seymour', state: 'VIC', region: 'North Central Victoria', water: 'on the Goulburn River', industry: 'defence (Puckapunyal) and agriculture', climate: 'temperate-cold', note: "home to one of the Australian Army's largest training bases, alongside a farming district" },
  { city: 'Bacchus Marsh', state: 'VIC', region: 'the Moorabool Valley', water: 'on the Werribee River', industry: 'horticulture and residential growth', climate: 'temperate-cold', note: 'a fast-growing outer-Melbourne town with a historic orcharding district' },

  // SA (6)
  { city: 'Naracoorte', state: 'SA', region: 'the Limestone Coast', water: 'on a karst limestone aquifer', industry: 'grazing and viticulture', climate: 'temperate-coastal', note: 'a Limestone Coast town sitting on the same karst groundwater system as Mount Gambier' },
  { city: 'Clare', state: 'SA', region: 'the Clare Valley', water: 'on the Hutt River catchment', industry: 'viticulture', climate: 'mediterranean', note: "one of South Australia's best-known cool-climate wine regions" },
  { city: 'Tanunda', state: 'SA', region: 'the Barossa Valley', water: 'on the North Para River', industry: 'viticulture and wine tourism', climate: 'mediterranean', note: "at the centre of Australia's best-known wine region" },
  { city: 'Strathalbyn', state: 'SA', region: 'the Fleurieu Peninsula', water: 'on the Angas River', industry: 'agriculture and heritage tourism', climate: 'mediterranean', note: 'a historic Fleurieu Peninsula town near Lake Alexandrina' },
  { city: 'Loxton', state: 'SA', region: 'the Riverland', water: 'on the Murray River', industry: 'irrigated citrus and viticulture', climate: 'semi-arid', note: 'a Riverland irrigation town on the Murray with a strong horticultural base' },
  { city: 'Coober Pedy', state: 'SA', region: 'the far north', water: 'in the desert, reliant on a desalination bore plant', industry: 'opal mining and tourism', climate: 'arid', note: 'one of the most extreme desert climates of any Australian town, with underground housing built partly to escape the heat' },

  // WA (8)
  { city: 'Margaret River', state: 'WA', region: 'the South West', water: 'on the Margaret River', industry: 'viticulture and tourism', climate: 'mediterranean', note: "one of Australia's best-known premium wine and tourism regions" },
  { city: 'Denmark', state: 'WA', region: 'the Great Southern', water: 'on the Denmark River', industry: 'agriculture and tourism', climate: 'temperate-coastal', note: 'a Great Southern town in one of the wettest parts of south-west Western Australia' },
  { city: 'Narrogin', state: 'WA', region: 'the Great Southern Wheatbelt', water: 'on the Hotham River catchment', industry: 'grain growing and agribusiness', climate: 'mediterranean', note: 'a Wheatbelt service centre for the surrounding grain-growing district' },
  { city: 'Newman', state: 'WA', region: 'the Pilbara', water: 'inland, on the Fortescue River headwaters', industry: 'iron ore mining', climate: 'arid', note: "a purpose-built Pilbara mining town founded around one of the region's largest iron ore deposits" },
  { city: 'Tom Price', state: 'WA', region: 'the Pilbara', water: 'in the Hamersley Range', industry: 'iron ore mining', climate: 'arid', note: "Western Australia's highest-elevation town, built around Pilbara iron ore mining" },
  { city: 'Exmouth', state: 'WA', region: 'the North West Cape', water: 'on the Ningaloo coast', industry: 'tourism and defence', climate: 'cyclonic', note: 'a North West Cape town directly exposed to the cyclone season, adjoining the Ningaloo Reef' },
  { city: 'Derby', state: 'WA', region: 'the West Kimberley', water: 'on King Sound', industry: 'agriculture and pastoral grazing', climate: 'tropical', note: 'home to some of the largest tidal ranges in the world, with an extreme wet-dry tropical climate' },
  { city: 'Halls Creek', state: 'WA', region: 'the East Kimberley', water: 'on the Black Elvire River catchment', industry: 'pastoral grazing and mining', climate: 'tropical', note: 'a remote East Kimberley town with an extreme monsoon wet season and long freight distances' },

  // NT (3)
  { city: 'Jabiru', state: 'NT', region: 'Kakadu', water: 'near the East Alligator River', industry: 'tourism and former uranium mining', climate: 'tropical', note: 'a Top End town inside the Kakadu World Heritage area, with an extreme monsoon climate' },
  { city: 'Yulara', state: 'NT', region: 'Central Australia', water: 'near Uluru-Kata Tjuta', industry: 'tourism', climate: 'arid', note: 'a purpose-built desert tourism town serving Uluru, with genuinely limited local water sources' },
  { city: 'Adelaide River', state: 'NT', region: 'the Top End', water: 'on the Adelaide River', industry: 'agriculture and defence-adjacent services', climate: 'tropical', note: 'a Top End rural town on a river known for extreme wet-season flow variation' },

  // TAS (3)
  { city: 'New Norfolk', state: 'TAS', region: 'the Derwent Valley', water: 'on the Derwent River', industry: 'agriculture and forestry', climate: 'temperate-coastal', note: 'a Derwent Valley town with a genuine flood history on a major Tasmanian river' },
  { city: 'George Town', state: 'TAS', region: 'the Tamar Valley', water: 'on the Tamar River estuary', industry: 'industrial port operations', climate: 'temperate-coastal', note: "a Tamar Valley industrial port town at the mouth of one of Tasmania's major rivers" },
  { city: 'St Helens', state: 'TAS', region: 'the East Coast', water: 'on Georges Bay', industry: 'fishing and tourism', climate: 'temperate-coastal', note: "Tasmania's largest east coast fishing town, in one of the state's driest micro-climates" },
]

if (CITIES.length !== 50) {
  throw new Error(`Expected 50 cities, got ${CITIES.length}`)
}

// -- HELPERS ----------------------------------------------------------------
function kebab(s) {
  return s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
function titleCase(s) {
  return s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1))
}
function industryShort(industry) {
  return industry.split('(')[0].split(',')[0].split(' and ')[0].trim()
}

const STATE_NAME = {
  QLD: 'Queensland',
  NSW: 'New South Wales',
  VIC: 'Victoria',
  SA: 'South Australia',
  WA: 'Western Australia',
  NT: 'the Northern Territory',
  TAS: 'Tasmania',
}

const CLIMATE_LABEL = {
  cyclonic: 'Cyclone-Region',
  tropical: 'Tropical',
  subtropical: 'Subtropical',
  'temperate-cold': 'Cool-Climate',
  'semi-arid': 'Dry-Climate',
  arid: 'Outback',
  'temperate-coastal': 'Coastal',
  mediterranean: 'Mediterranean-Climate',
}

const GEO_HEADINGS = {
  cyclonic: ['A cyclone-exposed coastal economy', 'A city built for cyclone-season resilience', 'Coastal, humid and squarely in the cyclone belt'],
  tropical: ['An extreme wet-dry tropical climate', 'A monsoon-driven seasonal water cycle', 'Life either side of the wet season'],
  subtropical: ['A subtropical river-catchment town', 'A humid subtropical climate with a real flood history', 'Warm, wet summers and a documented flood record'],
  'temperate-cold': ['A cool-climate inland centre', 'Genuine winter cold and frost risk', 'An elevated, frost-prone regional city'],
  'semi-arid': ['A semi-arid agricultural district', 'Variable rainfall and irrigation-dependent agriculture', 'A dry-climate agricultural service centre'],
  arid: ['A genuinely arid, remote setting', 'One of the driest inhabited parts of the country', 'Low, unreliable rainfall and long freight distances'],
  'temperate-coastal': ['A cool, wet coastal climate', 'A temperate coastal economy', 'Reliable rainfall alongside real seasonal industry demand'],
  mediterranean: ['A dry-summer Mediterranean climate', 'Hot, dry summers and mild, wetter winters', 'A Mediterranean climate with a clearly defined dry season'],
}

const CLIMATE_CHECK_ROWS = {
  cyclonic: [['Structural wind rating against AS/NZS 1170.2', 'Tanks here are designed for a materially higher wind loading category than non-cyclonic regions']],
  tropical: [['Roof and vent design for monsoon-intensity rainfall', 'Wet-season inflow rates are far higher than a temperate-climate design assumption']],
  subtropical: [['Flood-level clearance for inlet and access fittings', 'The region\'s documented flood history makes this a real planning factor, not a formality']],
  'temperate-cold': [['Frost protection on exposed pipework and fittings', 'Genuine sub-zero nights create freeze risk this region\'s design has to account for']],
  'semi-arid': [['Tank sizing against realistic dry-period duration', 'Irrigation-dependent local demand makes storage margin a genuine planning factor']],
  arid: [['Freight and access planning for remote delivery', 'Long distances from a supply base change what "urgent repair" can realistically mean']],
  'temperate-coastal': [['Salt-air corrosion allowance on external steelwork', 'Coastal exposure accelerates external corrosion beyond a standard inland specification']],
  mediterranean: [['Storage margin through the extended dry season', 'A long rainless summer period puts real pressure on supplementary storage sizing']],
}

const UNIVERSAL_CHECK_ROWS = [
  ['Inspection schedule matched to actual duty cycle', 'A tank drawn down hard needs a tighter inspection interval than a lightly used backup'],
  ['Fire compliance volume isolated from general draw', 'Fire water reserve has to be protected from being quietly consumed by everyday demand'],
]

function ctaFor(entry) {
  const ind = entry.industry.toLowerCase()
  if (entry.climate === 'cyclonic' || entry.climate === 'tropical') {
    return { href: '/services/foundation-civil-integration', label: 'Discuss Cyclone-Region Tank Design' }
  }
  if (entry.climate === 'arid' || entry.state === 'NT') {
    return { href: '/services/remote-area-delivery', label: 'Discuss Remote Water Storage Delivery' }
  }
  if (/mining|smelt|lng|steel|process|coal|gas/.test(ind)) {
    return { href: '/services/tank-maintenance-upgrades', label: 'Discuss Industrial Tank Maintenance' }
  }
  return { href: '/services/custom-tank-design', label: 'Discuss Your Water Storage Requirements' }
}

function buildPost(entry, i) {
  const angleCore = titleCase(industryShort(entry.industry))
  const climateLabel = CLIMATE_LABEL[entry.climate]
  const angle = `${angleCore} & ${climateLabel} Water Security`
  const title = `Water Storage and Tank Services in ${entry.city}: ${angle}`
  const slug = `water-storage-and-tank-services-in-${kebab(entry.city)}-${kebab(angle)}`
  const excerpt = `${entry.city} is ${entry.water}, in ${entry.region}, ${entry.note}. Here is what that means for water storage tank sizing, compliance and maintenance in the region.`

  const geoHeadings = GEO_HEADINGS[entry.climate]
  const geoHeading = geoHeadings[i % geoHeadings.length]

  const imgA = GENERIC_IMAGES[i % GENERIC_IMAGES.length]
  const imgB = GENERIC_IMAGES[(i + 7) % GENERIC_IMAGES.length]

  const statKey = entry.climate === 'cyclonic'
    ? CYCLONIC_STATS[i % CYCLONIC_STATS.length]
    : GENERAL_STATS[i % GENERAL_STATS.length]
  const stat = STATS[statKey]

  const checkRows = [...UNIVERSAL_CHECK_ROWS, ...CLIMATE_CHECK_ROWS[entry.climate]]

  const cta = ctaFor(entry)

  const content = `<p class="article-lead">
  ${entry.city} sits ${entry.water}, in ${entry.region} of ${STATE_NAME[entry.state]}. The town's economy is built substantially around ${entry.industry}, and it is ${entry.note} - both facts that shape what "adequate" water storage actually looks like for a property or business here, rather than a generic national default.
</p>

<p>Water storage decisions made without accounting for local climate and demand context tend to under-perform exactly when they are needed most. For ${entry.city}, that means sizing, siting and maintaining tank infrastructure against the conditions the region actually produces, not the conditions a standard specification assumes.</p>

<div class="article-divider"><span>Why ${entry.city}'s water context is distinctive</span></div>

<h3>${geoHeading}</h3>
<p>${entry.city} is ${entry.water}, and that geography carries real consequences for water storage: ${entry.note}. Any tank specification for the area needs to start from these conditions, not from a metro assumption carried across without adjustment.</p>

<h3>Demand from ${industryShort(entry.industry)}</h3>
<p>${titleCase(entry.industry)} is a defining part of ${entry.city}'s economy, and it places its own demands on local water infrastructure alongside ordinary potable and fire storage needs. A tank owner or facility manager here is rarely dealing with a single, simple demand profile - process, fire and potable requirements typically sit on the same site and can compete for the same storage margin if it isn't planned for properly.</p>

<figure>
  <img src="${BASE}/${imgA}" alt="Water storage tank installation serving a regional Australian property"/>
  <figcaption><strong>Specified for the conditions on site, not a generic default.</strong> Tank sizing and structural design in ${entry.region} account for the region's real climate and demand profile.</figcaption>
</figure>

<div class="article-divider"><span>What this means for tank owners in ${entry.region}</span></div>

<p>For a property in or around ${entry.city}, the practical takeaway is that water storage deserves the same rigour a metro site would apply to networked backup infrastructure - arguably more, given ${entry.note}. That means sizing storage against realistic local demand and dry-period duration, keeping a maintained inspection schedule so the tank delivers its full rated capacity when drawn down hard, and treating fire compliance storage as a protected reserve rather than a shared pool with everyday use.</p>

<figure>
  <img src="${BASE}/${imgB}" alt="Water storage and tank inspection work at a regional Australian site"/>
  <figcaption><strong>Local conditions, checked against the actual design.</strong> A tank built for ${entry.region} is only as reliable as the maintenance and inspection regime behind it.</figcaption>
</figure>

<blockquote class="article-quotable">
  <p>${entry.city}'s water infrastructure has to work with a specific set of local conditions, not around them. Storage that is sized and maintained for those conditions is what actually performs when it is tested.</p>
</blockquote>

<div class="article-pull-stat">
  <span class="stat-num">${stat.num}</span>
  <span class="stat-label">${stat.label(entry.city)}</span>
</div>

<div class="article-divider"><span>What to check on a ${entry.city} property</span></div>

<table class="checklist-table">
  <thead>
    <tr><th>Check</th><th>Why it matters locally</th></tr>
  </thead>
  <tbody>
${checkRows.map(([a, b]) => `    <tr><td>${a}</td><td>${b}</td></tr>`).join('\n')}
  </tbody>
</table>

<div class="article-faq-item">
  <p class="faq-q">What makes water storage in ${entry.city} different from a metro specification?</p>
  <p class="faq-a">Mainly the local climate and demand profile - ${entry.city} is ${entry.note}, which changes sizing, structural design and maintenance priorities compared with a standard city default.</p>
</div>

<div class="article-faq-item">
  <p class="faq-q">Does ${industryShort(entry.industry)} affect water storage requirements for other properties in ${entry.city}?</p>
  <p class="faq-a">Indirectly, yes. A local economy built around ${entry.industry} shapes regional water infrastructure priorities and available contractor expertise, even for a property with a straightforward potable or fire storage need.</p>
</div>

<div class="article-faq-item">
  <p class="faq-q">How often should a tank in ${entry.region} be inspected?</p>
  <p class="faq-a">It depends on duty cycle and local conditions rather than a fixed national interval - a tank drawn down hard through ${entry.city}'s climate pattern generally needs a tighter inspection schedule than a lightly used backup elsewhere.</p>
</div>

<div class="article-cta">
  <p>Own or manage water storage infrastructure in or around ${entry.city}? PC Water Infrastructure delivers tank design, installation and maintenance suited to ${entry.region}'s real conditions.</p>
  <a href="${cta.href}" class="cta-btn">${cta.label}</a>
</div>`

  const seoTitle = `Water Tank Services in ${entry.city} | PC Water`
  const seoDescription = `${entry.city} (${entry.region}) tank storage: ${industryShort(entry.industry)} demand and ${climateLabel.toLowerCase()} conditions shape sizing, compliance and maintenance. A practical regional guide.`

  return {
    slug,
    title,
    excerpt,
    coverImage: imgA,
    readTime: '5 min read',
    publishedAt: d(i),
    seoTitle,
    seoDescription,
    tags: [
      [`tag-regional-${kebab(entry.city)}`, 'Regional', 'regional'],
      [`tag-remote-community-${kebab(entry.city)}`, 'Remote Community', 'remote-community'],
    ],
    content,
  }
}

const posts = CITIES.map((entry, i) => buildPost(entry, i))

// -- STATIC MODE: print TS entries for lib/cms/static-content.ts -----------
function staticId(prefix, seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return `${prefix}-${h.toString(36)}`
}

function toStatic() {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{(?!BASE\})/g, '\\${')
  const out = posts
    .map((p) => {
      const content = esc(p.content).split(BASE + '/').join('${BASE}/')
      const tags = p.tags.map(([id, name, slug]) => `      { id: '${id}', name: '${name}', slug: '${slug}' },`).join('\n')
      return `  {
    id: staticId('post', '${p.title.replace(/'/g, "\\'").slice(0, 60)}'),
    title: ${JSON.stringify(p.title)},
    slug: '${p.slug}',
    excerpt:
      ${JSON.stringify(p.excerpt)},
    content: \`${content}\`,
    coverImageUrl: \`\${BASE}/${p.coverImage}\`,
    readTime: '${p.readTime}',
    status: 'published',
    seoTitle: ${JSON.stringify(p.seoTitle)},
    seoDescription:
      ${JSON.stringify(p.seoDescription)},
    publishedAt: '${p.publishedAt}',
    createdAt: '${p.publishedAt}',
    updatedAt: '${p.publishedAt}',
    tags: [
${tags}
    ],
  },`
    })
    .join('\n')
  process.stdout.write(out + '\n')
}

async function ensureTags(sb, tagTriples) {
  const tags = tagTriples.map(([, name, slug]) => ({ name, slug }))
  if (!tags.length) return []

  const { data, error } = await sb
    .from('cms_tags')
    .upsert(tags, { onConflict: 'slug' })
    .select('id,name,slug')

  if (error) throw new Error(`Tag upsert failed: ${error.message}`)
  return data || []
}

async function syncPostTags(sb, postId, tagTriples) {
  const tags = await ensureTags(sb, tagTriples)
  const { error: deleteError } = await sb.from('cms_post_tags').delete().eq('post_id', postId)
  if (deleteError) throw new Error(`Tag cleanup failed: ${deleteError.message}`)
  if (!tags.length) return

  const { error: insertError } = await sb
    .from('cms_post_tags')
    .insert(tags.map((tag) => ({ post_id: postId, tag_id: tag.id })))

  if (insertError) throw new Error(`Tag link failed: ${insertError.message}`)
}

// -- INSERT MODE: upload images + upsert posts to Supabase ---------------------
async function insert() {
  const { createClient } = require('@supabase/supabase-js')
  const fs = require('fs')
  const path = require('path')
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SECRET_KEY || '')
  const POSTS_DIR = path.join(process.cwd(), 'public', 'posts')

  console.log('\nUploading images...')
  for (const name of GENERIC_IMAGES) {
    const localPath = path.join(POSTS_DIR, name)
    if (!fs.existsSync(localPath)) {
      console.warn(`  missing ${name}`)
      continue
    }
    const buf = fs.readFileSync(localPath)
    const ct = name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    const { error } = await sb.storage.from('cms-media').upload(`posts/${name}`, buf, { contentType: ct, upsert: true })
    console.log(error ? `  x ${name}: ${error.message}` : `  ok ${name}`)
  }

  console.log('\nUpserting posts...')
  for (const p of posts) {
    const { data, error } = await sb.from('cms_posts').upsert(
      {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        cover_image_url: `${BASE}/${p.coverImage}`,
        content: p.content,
        read_time: p.readTime,
        status: 'published',
        seo_title: p.seoTitle,
        seo_description: p.seoDescription,
        published_at: p.publishedAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' },
    ).select('id').single()

    if (error || !data) {
      console.log(`  x ${p.slug}: ${error?.message || 'No post returned'}`)
      continue
    }

    await syncPostTags(sb, data.id, p.tags)
    console.log(`  ok ${p.slug}`)
  }
  console.log('\nDone.')
}

if (process.argv[2] === 'static') {
  toStatic()
} else if (process.argv[2] === 'check') {
  console.log('posts:', posts.length)
  const slugs = new Set(posts.map((p) => p.slug))
  console.log('unique slugs:', slugs.size)
  console.log(JSON.stringify(posts[0], null, 2).slice(0, 2000))
} else {
  insert().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
