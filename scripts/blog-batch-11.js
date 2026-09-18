/**
 * blog-batch-11.js - authors + integrates 100 new city/region-targeted blog
 * posts, extending the existing 26-city regional series (batches 1-10) to
 * secondary Australian population and industry centres that had no
 * dedicated article: state/territory second-tier cities, agricultural
 * service towns, mining towns and coastal centres across all seven
 * states/territories.
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
 *   node scripts/blog-batch-11.js static   -> prints TS entries for
 *                                              lib/cms/static-content.ts
 *   node scripts/blog-batch-11.js          -> uploads images + upserts to Supabase
 *
 * Dates: 2 posts/day starting 2026-09-19 (the day after "today",
 * 2026-09-18, per the established scheduling convention), running through
 * 100 posts (50 days, ending 2026-11-07).
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const BASE = 'https://mhggidgfivmdgkjerejn.supabase.co/storage/v1/object/public/cms-media/posts'

// -- DATE SPREAD ----------------------------------------------------------
const D0 = new Date('2026-09-19T09:00:00.000Z')
function d(i) {
  const day = Math.floor(i / 2)
  const time = i % 2 === 0 ? 0 : 6 * 60 * 60 * 1000 // 09:00 or 15:00 UTC
  return new Date(D0.getTime() + day * 24 * 60 * 60 * 1000 + time).toISOString()
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
  // QLD (23)
  { city: 'Bundaberg', state: 'QLD', region: 'the Wide Bay–Burnett', water: 'on the Burnett River', industry: 'sugar milling, rum distilling and macadamia processing', climate: 'cyclonic', note: 'a major sugar cane floodplain economy with a long history of seasonal river flooding' },
  { city: 'Hervey Bay', state: 'QLD', region: 'the Fraser Coast', water: 'on the Great Sandy Strait', industry: 'tourism and fishing', climate: 'cyclonic', note: 'a coastal tourism gateway with strong seasonal population swings that spike peak water demand' },
  { city: 'Gympie', state: 'QLD', region: 'the Cooloola Coast hinterland', water: 'on the Mary River', industry: 'timber, agriculture and historic gold mining', climate: 'subtropical', note: 'a Mary River catchment town with a well-documented flood history' },
  { city: 'Warwick', state: 'QLD', region: 'the Southern Downs', water: 'on the Condamine River', industry: 'agriculture, viticulture and rodeo/agribusiness events', climate: 'temperate-cold', note: 'one of the coldest inland towns in Queensland, with genuine winter frost risk' },
  { city: 'Maryborough', state: 'QLD', region: 'the Fraser Coast', water: 'on the Mary River', industry: 'rail heritage, sugar and light manufacturing', climate: 'subtropical', note: 'a historic river port town with a long industrial base' },
  { city: 'Emerald', state: 'QLD', region: 'the Central Highlands', water: 'near Lake Maraboon (Fairbairn Dam)', industry: 'coal mining and irrigated agriculture (cotton, citrus)', climate: 'semi-arid', note: 'a coal and irrigation economy sitting on one of Queensland\'s largest inland reservoirs' },
  { city: 'Roma', state: 'QLD', region: 'the Western Downs', water: 'on the Bungil Creek floodplain', industry: 'gas fields, cattle saleyards and agriculture', climate: 'semi-arid', note: 'a gas and cattle service town with a genuinely variable rainfall pattern' },
  { city: 'Charleville', state: 'QLD', region: 'South West Queensland', water: 'on the Warrego River', industry: 'pastoral grazing and outback tourism', climate: 'arid', note: 'a remote outback service centre where tank storage is frequently the primary, not backup, water source' },
  { city: 'Longreach', state: 'QLD', region: 'Central West Queensland', water: 'on the Thomson River', industry: 'grazing, aviation heritage and outback tourism', climate: 'arid', note: 'a genuinely remote inland centre where freight distance shapes every water infrastructure decision' },
  { city: 'Mount Isa', state: 'QLD', region: 'North West Queensland', water: 'on the Leichhardt River', industry: 'copper, lead, zinc and silver mining', climate: 'arid', note: 'one of Australia\'s major mining cities, with large-scale process and potable water demand side by side' },
  { city: 'Bowen', state: 'QLD', region: 'the Whitsunday region', water: 'on the Coral Sea coast', industry: 'horticulture (tomatoes, mangoes) and tourism', climate: 'cyclonic', note: 'a horticultural centre directly in the path of the North Queensland cyclone season' },
  { city: 'Ayr', state: 'QLD', region: 'the Burdekin', water: 'on the Burdekin River delta', industry: 'sugar cane growing and milling', climate: 'cyclonic', note: 'part of one of Australia\'s most productive sugar districts, on a major cyclone-exposed floodplain' },
  { city: 'Innisfail', state: 'QLD', region: 'the Cassowary Coast', water: 'on the Johnstone River', industry: 'sugar and banana growing', climate: 'tropical', note: 'one of the wettest towns in Australia, with extremely high annual rainfall and cyclone exposure' },
  { city: 'Mareeba', state: 'QLD', region: 'the Atherton Tablelands', water: 'on the Barron River', industry: 'coffee, avocado and mixed tropical agriculture', climate: 'tropical', note: 'a tablelands agricultural centre with a distinct wet-dry tropical seasonal pattern' },
  { city: 'Charters Towers', state: 'QLD', region: 'North Queensland', water: 'on the Burdekin River catchment', industry: 'historic gold mining and cattle grazing', climate: 'semi-arid', note: 'a former gold boomtown now serving as an inland cattle and education centre' },
  { city: 'Yeppoon', state: 'QLD', region: 'the Capricorn Coast', water: 'on the Coral Sea coast', industry: 'tourism and horticulture', climate: 'cyclonic', note: 'a coastal tourism town on the Tropic of Capricorn, within the standard cyclone belt' },
  { city: 'Biloela', state: 'QLD', region: 'the Callide Valley', water: 'near Callide Dam', industry: 'coal-fired power generation and grain growing', climate: 'subtropical', note: 'an energy and grain-growing centre built around one of the region\'s major dams' },
  { city: 'Chinchilla', state: 'QLD', region: 'the Western Downs', water: 'on the Condamine River', industry: 'coal seam gas and melon growing', climate: 'semi-arid', note: 'a gas-field service town with significant construction-camp and process water demand' },
  { city: 'Dalby', state: 'QLD', region: 'the Darling Downs', water: 'on the Condamine River', industry: 'grain growing, feedlots and agribusiness', climate: 'semi-arid', note: 'a major grain and livestock service centre for the wider Darling Downs' },
  { city: 'Kingaroy', state: 'QLD', region: 'the South Burnett', water: 'near Bjelke-Petersen Dam', industry: 'peanut growing and mixed agriculture', climate: 'subtropical', note: 'Australia\'s best-known peanut-growing district, reliant on a mix of dam and bore supply' },
  { city: 'Stanthorpe', state: 'QLD', region: 'the Granite Belt', water: 'on the Severn River headwaters', industry: 'viticulture, stone fruit and cool-climate agriculture', climate: 'temperate-cold', note: 'Queensland\'s coldest town, with recorded sub-zero winter temperatures and genuine frost risk' },
  { city: 'Caboolture', state: 'QLD', region: 'Moreton Bay', water: 'on the Caboolture River', industry: 'residential growth corridor and light industry', climate: 'subtropical', note: 'one of South East Queensland\'s fastest-growing outer suburbs, with new-build demand outpacing established infrastructure' },
  { city: 'Noosa', state: 'QLD', region: 'the Sunshine Coast', water: 'on the Noosa River', industry: 'tourism and hospitality', climate: 'subtropical', note: 'a premium coastal tourism destination with sharp seasonal demand peaks' },

  // NSW (25)
  { city: 'Bathurst', state: 'NSW', region: 'the Central Tablelands', water: 'on the Macquarie River', industry: 'agriculture, education and light manufacturing', climate: 'temperate-cold', note: 'one of the oldest inland cities in Australia, with cold winters and genuine frost risk' },
  { city: 'Orange', state: 'NSW', region: 'the Central West', water: 'near Suma Park Dam', industry: 'orcharding, viticulture and mining services', climate: 'temperate-cold', note: 'a cool-climate agricultural centre at genuine elevation, with a distinct frost season' },
  { city: 'Tamworth', state: 'NSW', region: 'New England', water: 'on the Peel River', industry: 'agribusiness, livestock and equine industries', climate: 'temperate-cold', note: 'a major regional service city with hot summers and cold winters' },
  { city: 'Griffith', state: 'NSW', region: 'the Riverina (Murrumbidgee Irrigation Area)', water: 'within the Murrumbidgee Irrigation Area', industry: 'irrigated agriculture, viticulture and citrus', climate: 'semi-arid', note: 'the centre of one of Australia\'s largest irrigation districts' },
  { city: 'Goulburn', state: 'NSW', region: 'the Southern Tablelands', water: 'on the Wollondilly River', industry: 'wool, agriculture and logistics', climate: 'temperate-cold', note: 'a historic wool town on the exposed Southern Tablelands, with genuine winter cold' },
  { city: 'Nowra', state: 'NSW', region: 'the Shoalhaven', water: 'on the Shoalhaven River', industry: 'dairy, defence (naval air station) and tourism', climate: 'temperate-coastal', note: 'a South Coast centre with a significant defence and agricultural base side by side' },
  { city: 'Lismore', state: 'NSW', region: 'the Northern Rivers', water: 'on the Wilsons River', industry: 'agriculture and regional services', climate: 'subtropical', note: 'a town with one of the most extensively documented flood histories in New South Wales' },
  { city: 'Ballina', state: 'NSW', region: 'the Northern Rivers', water: 'on the Richmond River', industry: 'tourism and macadamia growing', climate: 'subtropical', note: 'a coastal Northern Rivers town balancing tourism demand against agricultural water use' },
  { city: 'Grafton', state: 'NSW', region: 'the Clarence Valley', water: 'on the Clarence River', industry: 'agriculture and forestry', climate: 'subtropical', note: 'a river city with a long and well-documented flood record on the Clarence' },
  { city: 'Coffs Harbour', state: 'NSW', region: 'the Mid North Coast', water: 'on the Coral Sea coast', industry: 'blueberry growing and tourism', climate: 'subtropical', note: 'a coastal horticulture and tourism centre with high seasonal visitor demand' },
  { city: 'Port Macquarie', state: 'NSW', region: 'the Mid North Coast', water: 'on the Hastings River', industry: 'tourism, retirement living and agriculture', climate: 'subtropical', note: 'a fast-growing coastal centre with a significant aged-care and retirement population' },
  { city: 'Albury', state: 'NSW', region: 'the Murray River border region', water: 'on the Murray River', industry: 'food processing, logistics and agriculture', climate: 'temperate-cold', note: 'a twin-city border centre with Wodonga, straddling two states\' regulatory frameworks' },
  { city: 'Armidale', state: 'NSW', region: 'the New England Tablelands', water: 'on the Dumaresq Creek catchment', industry: 'agriculture, wool and education', climate: 'temperate-cold', note: 'one of the highest-elevation regional cities in New South Wales, with genuine winter snow risk' },
  { city: 'Bega', state: 'NSW', region: 'the Sapphire Coast', water: 'on the Bega River', industry: 'dairy processing', climate: 'temperate-coastal', note: 'the centre of one of Australia\'s best-known dairy processing districts' },
  { city: 'Broken Hill', state: 'NSW', region: 'the far west', water: 'far from any major river, reliant on the Menindee Lakes system', industry: 'silver, lead and zinc mining', climate: 'arid', note: 'one of the most water-stressed major towns in New South Wales, historically dependent on a single pipeline' },
  { city: 'Parkes', state: 'NSW', region: 'the Central West', water: 'on the Bogan River', industry: 'agriculture, logistics and the CSIRO radio telescope', climate: 'semi-arid', note: 'a logistics and agricultural hub known internationally for its radio astronomy facility' },
  { city: 'Mudgee', state: 'NSW', region: 'the Central West', water: 'on the Cudgegong River', industry: 'viticulture and coal mining', climate: 'temperate-cold', note: 'a wine region economy with cool-climate viticulture and nearby coal mining side by side' },
  { city: 'Queanbeyan', state: 'NSW', region: 'the ACT border region', water: 'on the Queanbeyan River', industry: 'residential growth adjoining Canberra', climate: 'temperate-cold', note: 'a fast-growing satellite city sharing infrastructure pressure with the national capital' },
  { city: 'Taree', state: 'NSW', region: 'the Manning Valley', water: 'on the Manning River', industry: 'dairy, timber and agriculture', climate: 'subtropical', note: 'a Manning Valley river town with a genuine flood history' },
  { city: 'Moree', state: 'NSW', region: 'north west New South Wales', water: 'on the Mehi River, above the Great Artesian Basin', industry: 'cotton growing and grain', climate: 'semi-arid', note: 'one of the most productive cotton-growing districts in the country, sitting above artesian groundwater' },
  { city: 'Cootamundra', state: 'NSW', region: 'the South West Slopes', water: 'on the Muttama Creek catchment', industry: 'agriculture and rail heritage', climate: 'temperate-cold', note: 'a South West Slopes agricultural service town with cold winters' },
  { city: 'Young', state: 'NSW', region: 'the South West Slopes', water: 'on the Burrangong Creek catchment', industry: 'cherry growing and mixed horticulture', climate: 'temperate-cold', note: 'known nationally as the Cherry Capital, with frost-sensitive horticulture as its core industry' },
  { city: 'Kempsey', state: 'NSW', region: 'the Macleay Valley', water: 'on the Macleay River', industry: 'dairy and agriculture', climate: 'subtropical', note: 'a Macleay Valley town with a well-documented flood plain history' },
  { city: 'Lithgow', state: 'NSW', region: 'the western edge of the Blue Mountains', water: 'on the Coxs River catchment', industry: 'heavy industry, coal and light manufacturing', climate: 'temperate-cold', note: 'a former heavy-industrial city at genuine elevation, with cold, frost-prone winters' },
  { city: 'Narrabri', state: 'NSW', region: 'the Namoi Valley', water: 'on the Namoi River', industry: 'cotton growing and gas exploration', climate: 'semi-arid', note: 'a major cotton-growing centre also hosting significant gas industry activity' },

  // VIC (16)
  { city: 'Shepparton', state: 'VIC', region: 'the Goulburn Valley', water: 'on the Goulburn River', industry: 'fruit and vegetable processing (SPC, canneries)', climate: 'temperate-cold', note: 'the centre of Australia\'s largest fruit and vegetable processing district' },
  { city: 'Mildura', state: 'VIC', region: 'Sunraysia', water: 'on the Murray River', industry: 'irrigated viticulture and citrus', climate: 'semi-arid', note: 'a Murray River irrigation centre in one of Victoria\'s driest climate zones' },
  { city: 'Warrnambool', state: 'VIC', region: 'the South West Coast', water: 'on the Hopkins River and the Southern Ocean', industry: 'dairy processing (Fonterra) and agriculture', climate: 'temperate-coastal', note: 'a major dairy processing city on Victoria\'s south-west coast' },
  { city: 'Horsham', state: 'VIC', region: 'the Wimmera', water: 'on the Wimmera River', industry: 'grain growing and agribusiness', climate: 'semi-arid', note: 'the service centre for one of Victoria\'s most significant grain-growing regions' },
  { city: 'Wodonga', state: 'VIC', region: 'the Murray River border region', water: 'on the Murray River', industry: 'logistics, food processing and defence', climate: 'temperate-cold', note: 'Albury\'s twin city, sharing a river and a freight corridor across the Victoria–NSW border' },
  { city: 'Traralgon', state: 'VIC', region: 'the Latrobe Valley', water: 'on the Traralgon Creek catchment', industry: 'energy generation and manufacturing', climate: 'temperate-cold', note: 'a Latrobe Valley energy-sector town undergoing significant industrial transition' },
  { city: 'Sale', state: 'VIC', region: 'Gippsland', water: 'on the Thomson River, near the Gippsland Lakes', industry: 'oil and gas services, dairy', climate: 'temperate-coastal', note: 'the onshore service base for Gippsland\'s offshore oil and gas industry' },
  { city: 'Bairnsdale', state: 'VIC', region: 'East Gippsland', water: 'on the Mitchell River', industry: 'dairy, timber and tourism', climate: 'temperate-coastal', note: 'the main service centre for East Gippsland, an area with documented bushfire and flood history' },
  { city: 'Wangaratta', state: 'VIC', region: 'North East Victoria', water: 'at the junction of the Ovens and King Rivers', industry: 'agriculture, wool and food processing', climate: 'temperate-cold', note: 'a North East Victorian centre at the confluence of two significant rivers' },
  { city: 'Echuca', state: 'VIC', region: 'the Murray River region', water: 'on the Murray River', industry: 'tourism and agriculture', climate: 'temperate-cold', note: 'a historic river port town and one of Victoria\'s best-known Murray River tourism centres' },
  { city: 'Colac', state: 'VIC', region: 'the Western District', water: 'near Lake Colac', industry: 'dairy processing', climate: 'temperate-cold', note: 'a Western District dairy town built around one of Victoria\'s largest natural lakes' },
  { city: 'Portland', state: 'VIC', region: 'the south-west coast', water: 'on Portland Bay', industry: 'aluminium smelting and port operations', climate: 'temperate-coastal', note: 'Victoria\'s oldest European settlement, now home to a major aluminium smelter and deepwater port' },
  { city: 'Ararat', state: 'VIC', region: 'the Grampians region', water: 'near Lake Bellfield', industry: 'viticulture and agriculture', climate: 'temperate-cold', note: 'a Grampians-region town with cool-climate viticulture as a growing industry' },
  { city: 'Swan Hill', state: 'VIC', region: 'the Murray River region', water: 'on the Murray River', industry: 'irrigated horticulture', climate: 'semi-arid', note: 'a Murray River irrigation centre on the Victoria–NSW border' },
  { city: 'Benalla', state: 'VIC', region: 'North East Victoria', water: 'on the Broken River', industry: 'agriculture and light manufacturing', climate: 'temperate-cold', note: 'a North East Victorian service town with a well-known flood history on the Broken River' },
  { city: 'Maryborough', state: 'VIC', region: 'Central Victoria', water: 'near Bristol Hill Reservoir', industry: 'historic goldfields heritage and light manufacturing', climate: 'temperate-cold', note: 'a former goldfields town in Victoria\'s dry central region, distinct from its Queensland namesake' },

  // SA (11)
  { city: 'Whyalla', state: 'SA', region: 'the Upper Spencer Gulf', water: 'on the Spencer Gulf', industry: 'steelmaking', climate: 'arid', note: 'a steel city in one of South Australia\'s driest and hottest regions, reliant on desalination and pipeline supply' },
  { city: 'Port Lincoln', state: 'SA', region: 'the Eyre Peninsula', water: 'on the Southern Ocean', industry: 'tuna farming and seafood processing', climate: 'semi-arid', note: 'Australia\'s seafood capital, with a fishing and aquaculture economy dependent on reliable process water' },
  { city: 'Port Augusta', state: 'SA', region: 'the Upper Spencer Gulf', water: 'on the Spencer Gulf', industry: 'energy generation and logistics', climate: 'arid', note: 'a gateway city to the outback, in one of the hottest and driest parts of South Australia' },
  { city: 'Mount Gambier', state: 'SA', region: 'the Limestone Coast', water: 'near the Blue Lake', industry: 'forestry and agriculture', climate: 'temperate-coastal', note: 'a Limestone Coast city built on a karst landscape, with unusually reliable groundwater' },
  { city: 'Murray Bridge', state: 'SA', region: 'the Murray River region', water: 'on the Murray River', industry: 'food processing and agriculture', climate: 'semi-arid', note: 'a Murray River town serving as South Australia\'s primary river crossing point' },
  { city: 'Renmark', state: 'SA', region: 'the Riverland', water: 'on the Murray River', industry: 'irrigated viticulture and citrus', climate: 'semi-arid', note: 'the founding town of South Australia\'s Riverland irrigation district' },
  { city: 'Victor Harbor', state: 'SA', region: 'the Fleurieu Peninsula', water: 'on Encounter Bay', industry: 'tourism', climate: 'temperate-coastal', note: 'a coastal tourism centre with sharp seasonal demand swings' },
  { city: 'Berri', state: 'SA', region: 'the Riverland', water: 'on the Murray River', industry: 'citrus and wine processing', climate: 'semi-arid', note: 'a Riverland processing centre for the surrounding irrigation district' },
  { city: 'Gawler', state: 'SA', region: 'the northern Adelaide plains', water: 'on the Gawler River', industry: 'residential growth and light industry', climate: 'mediterranean', note: 'one of South Australia\'s oldest country towns, now a fast-growing outer-Adelaide centre' },
  { city: 'Ceduna', state: 'SA', region: 'the far west coast', water: 'on the Great Australian Bight', industry: 'grain growing, fishing and oyster farming', climate: 'arid', note: 'a remote west coast town with genuinely limited fresh water sources' },
  { city: 'Kadina', state: 'SA', region: 'the Yorke Peninsula (Copper Coast)', water: 'on the Copper Coast', industry: 'grain growing and historic copper mining heritage', climate: 'mediterranean', note: 'the largest town on the Yorke Peninsula\'s Copper Coast' },

  // WA (16)
  { city: 'Geraldton', state: 'WA', region: 'the Mid West (Batavia Coast)', water: 'on the Indian Ocean', industry: 'fishing, mining services and agriculture', climate: 'mediterranean', note: 'a Mid West coastal city and the main port for the wheatbelt hinterland' },
  { city: 'Bunbury', state: 'WA', region: 'the South West', water: 'on Koombana Bay', industry: 'port operations, mining and agriculture', climate: 'mediterranean', note: 'Western Australia\'s second-largest city and a major bulk export port' },
  { city: 'Broome', state: 'WA', region: 'the Kimberley', water: 'on Roebuck Bay', industry: 'tourism and pearling heritage', climate: 'tropical', note: 'a Kimberley tourism town with an extreme wet-dry tropical climate and cyclone exposure' },
  { city: 'Karratha', state: 'WA', region: 'the Pilbara', water: 'on the Indian Ocean', industry: 'iron ore export and LNG processing', climate: 'cyclonic', note: 'one of the Pilbara\'s major resources hubs, directly exposed to the North West cyclone season' },
  { city: 'Port Hedland', state: 'WA', region: 'the Pilbara', water: 'on the Indian Ocean', industry: 'iron ore export', climate: 'cyclonic', note: 'the world\'s largest bulk export port by tonnage, in an officially severe-cyclone wind region' },
  { city: 'Albany', state: 'WA', region: 'the Great Southern', water: 'on King George Sound', industry: 'agriculture, fishing and tourism', climate: 'temperate-coastal', note: 'Western Australia\'s oldest colonial settlement, with a genuinely cool, wet southern climate' },
  { city: 'Esperance', state: 'WA', region: 'the south coast', water: 'on the Southern Ocean', industry: 'grain growing and fishing', climate: 'temperate-coastal', note: 'a south coast grain port with a historically high-wind exposure' },
  { city: 'Busselton', state: 'WA', region: 'the South West', water: 'on Geographe Bay', industry: 'tourism and horticulture', climate: 'mediterranean', note: 'a fast-growing South West tourism town with strong seasonal demand peaks' },
  { city: 'Kununurra', state: 'WA', region: 'the East Kimberley', water: 'on Lake Argyle and the Ord River', industry: 'irrigated agriculture (Ord River Irrigation Scheme)', climate: 'tropical', note: 'built around one of Australia\'s largest man-made reservoirs and its irrigation scheme' },
  { city: 'Carnarvon', state: 'WA', region: 'the Gascoyne', water: 'on the Gascoyne River', industry: 'horticulture (bananas, mangoes)', climate: 'arid', note: 'a horticultural district reliant on an underground river system beneath a usually dry riverbed' },
  { city: 'Northam', state: 'WA', region: 'the Avon Valley (Wheatbelt)', water: 'on the Avon River', industry: 'grain growing and agribusiness', climate: 'mediterranean', note: 'the largest town in the Western Australian Wheatbelt' },
  { city: 'Collie', state: 'WA', region: 'the South West', water: 'on the Collie River', industry: 'coal mining and power generation', climate: 'mediterranean', note: 'Western Australia\'s primary coal-mining town, undergoing significant industry transition' },
  { city: 'Manjimup', state: 'WA', region: 'the South West', water: 'on the Donnelly River catchment', industry: 'timber and horticulture', climate: 'temperate-coastal', note: 'a timber and orchard district in one of the wettest parts of Western Australia' },
  { city: 'Merredin', state: 'WA', region: 'the Central Wheatbelt', water: 'inland, reliant on the Goldfields Water Supply Scheme', industry: 'grain growing', climate: 'semi-arid', note: 'a Wheatbelt centre historically supplied via the Goldfields pipeline built for Kalgoorlie' },
  { city: 'Kalbarri', state: 'WA', region: 'the Mid West coast', water: 'at the mouth of the Murchison River', industry: 'tourism and fishing', climate: 'arid', note: 'a small coastal tourism town at the edge of the arid Mid West' },
  { city: 'York', state: 'WA', region: 'the Avon Valley (Wheatbelt)', water: 'on the Avon River', industry: 'agriculture and heritage tourism', climate: 'mediterranean', note: 'Western Australia\'s oldest inland town, in the historic Avon Valley' },

  // NT (4)
  { city: 'Katherine', state: 'NT', region: 'the Top End', water: 'on the Katherine River', industry: 'defence (RAAF Base Tindal), agriculture and tourism', climate: 'tropical', note: 'a Top End town with an extreme wet-dry monsoon climate and a major defence base' },
  { city: 'Tennant Creek', state: 'NT', region: 'the Barkly region', water: 'on the Barkly Tableland', industry: 'gold mining and pastoral grazing', climate: 'arid', note: 'a remote Barkly region mining town, genuinely dependent on bore and tank storage' },
  { city: 'Nhulunbuy', state: 'NT', region: 'East Arnhem Land', water: 'on the Gove Peninsula', industry: 'bauxite mining', climate: 'tropical', note: 'a remote East Arnhem mining town with extreme freight distance from any major supply chain' },
  { city: 'Palmerston', state: 'NT', region: 'greater Darwin', water: 'near the Elizabeth River', industry: 'residential growth and logistics', climate: 'tropical', note: 'the Northern Territory\'s second-largest city, a fast-growing satellite of Darwin' },

  // TAS (5)
  { city: 'Devonport', state: 'TAS', region: 'the North West Coast', water: 'on the Mersey River', industry: 'port operations (Spirit of Tasmania) and agriculture', climate: 'temperate-coastal', note: 'Tasmania\'s main Bass Strait ferry port and a significant agricultural service centre' },
  { city: 'Burnie', state: 'TAS', region: 'the North West Coast', water: 'on Emu Bay', industry: 'port operations and manufacturing', climate: 'temperate-coastal', note: 'a North West Coast industrial port city with a long paper and manufacturing history' },
  { city: 'Ulverstone', state: 'TAS', region: 'the North West Coast', water: 'on the Leven River', industry: 'vegetable processing and agriculture', climate: 'temperate-coastal', note: 'a North West Coast vegetable-growing and processing town' },
  { city: 'Queenstown', state: 'TAS', region: 'the West Coast', water: 'on the King River', industry: 'historic copper mining heritage', climate: 'temperate-coastal', note: 'one of the wettest towns in Tasmania, in a region with an extreme historic mining-driven landscape' },
  { city: 'Huonville', state: 'TAS', region: 'the Huon Valley', water: 'on the Huon River', industry: 'apple growing and aquaculture', climate: 'temperate-coastal', note: 'the centre of Tasmania\'s historic apple-growing region, now diversifying into aquaculture' },
]

if (CITIES.length !== 100) {
  throw new Error(`Expected 100 cities, got ${CITIES.length}`)
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
