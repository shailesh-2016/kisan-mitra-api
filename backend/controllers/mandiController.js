const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || 'YOUR_DATA_GOV_API_KEY';
const RESOURCE_ID      = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL         = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// ── Cache: in-memory + disk persistence ──────────────────────────────────────
const stateCache   = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in-memory TTL
const DISK_DIR     = path.join('/tmp', 'mandi_cache');

// Ensure cache dir exists
try { fs.mkdirSync(DISK_DIR, { recursive: true }); } catch {}

function diskPath(key) {
  return path.join(DISK_DIR, `${key.replace(/[^a-z0-9]/gi, '_')}.json`);
}

function saveToDisk(key, data) {
  try {
    fs.writeFileSync(diskPath(key), JSON.stringify({ data, savedAt: Date.now() }));
  } catch (e) {
    console.warn('[Mandi] Disk save failed:', e.message);
  }
}

function loadFromDisk(key) {
  try {
    const raw = fs.readFileSync(diskPath(key), 'utf8');
    const obj = JSON.parse(raw);
    if (obj?.data?.length > 0) return obj.data;
  } catch {}
  return null;
}

// ── Emoji map ─────────────────────────────────────────────────────────────────
const EMOJI_MAP = {
  tomato:'🍅', potato:'🥔', onion:'🧅', wheat:'🌾', rice:'🍚', corn:'🌽',
  mustard:'🌻', gram:'🫘', soyabean:'🟤', cotton:'🌿', mango:'🥭',
  banana:'🍌', carrot:'🥕', groundnut:'🥜', sugarcane:'🎋', moong:'🫘',
  urad:'🫘', arhar:'🫘', maize:'🌽', jowar:'🌾', bajra:'🌾', barley:'🌾',
  lentil:'🫘', peas:'🫛', brinjal:'🍆', cabbage:'🥬', cauliflower:'🥦',
  spinach:'🥬', garlic:'🧄', ginger:'🫚', chilli:'🌶️', turmeric:'🟡',
  coriander:'🌿', apple:'🍎', orange:'🍊', grapes:'🍇', guava:'🍐',
  papaya:'🍈', watermelon:'🍉', cucumber:'🥒',
};

function getEmoji(commodity) {
  const l = (commodity || '').toLowerCase();
  for (const [k, v] of Object.entries(EMOJI_MAP)) if (l.includes(k)) return v;
  return '🌱';
}

function getCategory(commodity) {
  const l = (commodity || '').toLowerCase();
  if (['wheat','rice','corn','maize','jowar','bajra','barley','mustard','soyabean',
       'cotton','groundnut','sugarcane'].some(k => l.includes(k))) return 'grains';
  if (['gram','moong','urad','arhar','lentil','peas'].some(k => l.includes(k))) return 'pulses';
  if (['mango','banana','apple','orange','grapes','pomegranate','guava','papaya',
       'watermelon'].some(k => l.includes(k))) return 'fruits';
  return 'vegetables';
}

// ── Single page fetch ─────────────────────────────────────────────────────────
function fetchPage(state, limit, offset, district = '', market = '') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY,
      format:    'json',
      limit:     String(limit),
      offset:    String(offset),
    });
    if (state)    params.append('filters[state]',    state);
    if (district) params.append('filters[district]', district);
    if (market)   params.append('filters[market]',   market);

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`[Mandi] GET state=${state} district=${district} market=${market} limit=${limit} offset=${offset}`);

    const req = https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Fetch ALL pages for given filters ─────────────────────────────────────────
async function fetchAllPages(state, district = '', market = '') {
  const PAGE_SIZE = 500;

  const first = await fetchPage(state, PAGE_SIZE, 0, district, market);
  if (!first.records || !Array.isArray(first.records) || first.records.length === 0) {
    throw new Error(`No records returned from API for state=${state} district=${district}`);
  }

  const total      = parseInt(first.total || first.count || '0', 10) || first.records.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  let allRecords   = [...first.records];

  console.log(`[Mandi] state=${state} district=${district} total=${total} pages=${totalPages}`);

  // Fetch remaining pages in batches of 4
  const BATCH = 4;
  for (let start = 1; start < totalPages; start += BATCH) {
    const end     = Math.min(start + BATCH, totalPages);
    const offsets = Array.from({ length: end - start }, (_, i) => (start + i) * PAGE_SIZE);

    const results = await Promise.allSettled(
      offsets.map(o => fetchPage(state, PAGE_SIZE, o, district, market))
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.records)) {
        allRecords = allRecords.concat(r.value.records);
      }
    }
  }

  console.log(`[Mandi] Fetched ${allRecords.length} total records`);
  return allRecords;
}

// ── Process raw records ───────────────────────────────────────────────────────
function processRecords(records) {
  return records
    .filter(r => {
      const commodity = (r.commodity || r.Commodity || '').trim();
      const modal     = parseFloat(r.modal_price || r.Modal_Price || 0);
      return commodity.length > 0 && modal > 0;
    })
    .map(r => {
      const modal = parseFloat(r.modal_price || r.Modal_Price || 0);
      const commodity = (r.commodity || r.Commodity || '').trim();
      return {
        commodity,
        variety:     (r.variety     || r.Variety     || '').trim(),
        market:      (r.market      || r.Market      || '').trim(),
        district:    (r.district    || r.District    || '').trim(),
        state:       (r.state       || r.State       || '').trim(),
        minPrice:    parseFloat(r.min_price  || r.Min_Price  || 0),
        maxPrice:    parseFloat(r.max_price  || r.Max_Price  || 0),
        modalPrice:  modal,
        pricePerKg:  parseFloat((modal / 100).toFixed(2)),
        arrivalDate: (r.arrival_date || r.Arrival_Date || '').trim(),
        emoji:       getEmoji(commodity),
        category:    getCategory(commodity),
      };
    });
}

// ── Get or refresh cache for state/district/market ───────────────────────────
async function getCachedData(state, district = '', market = '') {
  const key = `${state}|${district}|${market}`.toLowerCase();
  const now = Date.now();

  // 1. In-memory cache hit
  if (stateCache[key] && (now - stateCache[key].fetchedAt) < CACHE_TTL_MS) {
    console.log(`[Mandi] Memory cache hit: ${key} (${stateCache[key].data.length} records)`);
    return { data: stateCache[key].data, source: 'cache' };
  }

  try {
    const raw       = await fetchAllPages(state, district, market);
    const processed = processRecords(raw);

    if (processed.length === 0) {
      console.warn(`[Mandi] 0 records for ${key}, trying fallbacks`);
      // Try disk cache first
      const disk = loadFromDisk(key);
      if (disk) { console.log(`[Mandi] Disk cache hit: ${key}`); return { data: disk, source: 'cached' }; }
      // Try stale memory
      if (stateCache[key]?.data?.length > 0) return { data: stateCache[key].data, source: 'stale-cache' };
      // Try full state if district was specified
      if (district) {
        console.log(`[Mandi] No district data, falling back to full state: ${state}`);
        return getCachedData(state, '', market);
      }
      return { data: FALLBACK, source: 'fallback' };
    }

    // Save to memory + disk
    stateCache[key] = { data: processed, fetchedAt: now };
    saveToDisk(key, processed);
    console.log(`[Mandi] Cached ${processed.length} records for ${key}`);
    return { data: processed, source: 'live' };

  } catch (err) {
    console.error(`[Mandi] fetchAllPages failed for ${key}: ${err.message}`);

    // Try disk cache (survives server restarts)
    const disk = loadFromDisk(key);
    if (disk) { console.log(`[Mandi] Using disk cache after error: ${key}`); return { data: disk, source: 'cached' }; }

    // Try stale memory
    if (stateCache[key]?.data?.length > 0) return { data: stateCache[key].data, source: 'stale-cache' };

    // Try full state if district was specified
    if (district) {
      console.log(`[Mandi] Error with district, falling back to full state: ${state}`);
      return getCachedData(state, '', market);
    }

    return { data: FALLBACK, source: 'fallback' };
  }
}

// ── GET /api/mandi ────────────────────────────────────────────────────────────
exports.getMandiPrices = async (req, res) => {
  try {
    const { state = 'Gujarat', district = '', commodity = '', market = '' } = req.query;

    // Fetch with API-level filters for efficiency
    const { data, source } = await getCachedData(state, district, market);

    // Apply commodity filter in memory (API doesn't support it well)
    let result = data;
    if (commodity) {
      result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }

    console.log(`[Mandi] Returning ${result.length} records (source: ${source})`);
    res.json({ success: true, source, count: result.length, data: result });
  } catch (err) {
    console.error('[Mandi] getMandiPrices error:', err.message);
    res.json({ success: true, source: 'fallback', count: FALLBACK.length, data: FALLBACK });
  }
};

// ── GET /api/mandi/districts ──────────────────────────────────────────────────
exports.getDistricts = async (req, res) => {
  try {
    const { state = 'Gujarat' } = req.query;
    const { data } = await getCachedData(state);
    const districts = [...new Set(data.map(r => r.district).filter(Boolean))].sort();
    res.json({ success: true, districts });
  } catch (err) {
    console.error('[Mandi] getDistricts error:', err.message);
    res.json({ success: true, districts: ['Ahmedabad','Banaskantha','Mehsana','Rajkot','Surat','Vadodara'] });
  }
};

// ── GET /api/mandi/states ─────────────────────────────────────────────────────
exports.getStates = async (req, res) => {
  try {
    const first = await fetchPage('', 500, 0);
    if (first.records && Array.isArray(first.records)) {
      const states = [...new Set(
        first.records.map(r => (r.state || r.State || '').trim()).filter(Boolean)
      )].sort();
      return res.json({ success: true, states: states.length > 0 ? states : FALLBACK_STATES });
    }
    res.json({ success: true, states: FALLBACK_STATES });
  } catch {
    res.json({ success: true, states: FALLBACK_STATES });
  }
};

// ── Fallback static data ──────────────────────────────────────────────────────
const FALLBACK_STATES = [
  'Andhra Pradesh','Bihar','Chhattisgarh','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu',
  'Telangana','Uttar Pradesh','Uttarakhand','West Bengal',
];

const FALLBACK = [
  { commodity:'Tomato',    variety:'Local',   market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:1500, maxPrice:3500, modalPrice:2500, pricePerKg:25,   arrivalDate:'', emoji:'🍅', category:'vegetables' },
  { commodity:'Potato',    variety:'Local',   market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:1200, maxPrice:1800, modalPrice:1500, pricePerKg:15,   arrivalDate:'', emoji:'🥔', category:'vegetables' },
  { commodity:'Onion',     variety:'Local',   market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:1800, maxPrice:2800, modalPrice:2200, pricePerKg:22,   arrivalDate:'', emoji:'🧅', category:'vegetables' },
  { commodity:'Wheat',     variety:'Lokwan',  market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:2100, maxPrice:2200, modalPrice:2150, pricePerKg:21.5, arrivalDate:'', emoji:'🌾', category:'grains'     },
  { commodity:'Rice',      variety:'Common',  market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:3100, maxPrice:3300, modalPrice:3200, pricePerKg:32,   arrivalDate:'', emoji:'🍚', category:'grains'     },
  { commodity:'Gram',      variety:'Local',   market:'Mehsana APMC',     district:'Mehsana',     state:'Gujarat', minPrice:4700, maxPrice:4900, modalPrice:4800, pricePerKg:48,   arrivalDate:'', emoji:'🫘', category:'pulses'     },
  { commodity:'Mustard',   variety:'Local',   market:'Banaskantha APMC', district:'Banaskantha', state:'Gujarat', minPrice:5000, maxPrice:5400, modalPrice:5200, pricePerKg:52,   arrivalDate:'', emoji:'🌻', category:'grains'     },
  { commodity:'Groundnut', variety:'Bold',    market:'Rajkot APMC',      district:'Rajkot',      state:'Gujarat', minPrice:5500, maxPrice:6000, modalPrice:5750, pricePerKg:57.5, arrivalDate:'', emoji:'🥜', category:'grains'     },
  { commodity:'Cotton',    variety:'Shankar', market:'Rajkot APMC',      district:'Rajkot',      state:'Gujarat', minPrice:6200, maxPrice:6800, modalPrice:6500, pricePerKg:65,   arrivalDate:'', emoji:'🌿', category:'grains'     },
  { commodity:'Banana',    variety:'Robusta', market:'Surat APMC',       district:'Surat',       state:'Gujarat', minPrice:1200, maxPrice:2000, modalPrice:1600, pricePerKg:16,   arrivalDate:'', emoji:'🍌', category:'fruits'     },
];
