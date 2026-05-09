const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || 'YOUR_DATA_GOV_API_KEY';
const RESOURCE_ID      = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL         = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// ── In-memory cache per state ─────────────────────────────────────────────────
// { [stateKey]: { data: [], fetchedAt: number } }
const stateCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Commodity → emoji map ─────────────────────────────────────────────────────
const EMOJI_MAP = {
  tomato:'🍅', potato:'🥔', onion:'🧅', wheat:'🌾', rice:'🍚',
  corn:'🌽', mustard:'🌻', gram:'🫘', soyabean:'🟤', cotton:'🌿',
  mango:'🥭', banana:'🍌', carrot:'🥕', groundnut:'🥜', sugarcane:'🎋',
  moong:'🫘', urad:'🫘', arhar:'🫘', maize:'🌽', jowar:'🌾',
  bajra:'🌾', barley:'🌾', lentil:'🫘', peas:'🫛', brinjal:'🍆',
  cabbage:'🥬', cauliflower:'🥦', spinach:'🥬', garlic:'🧄',
  ginger:'🫚', chilli:'🌶️', turmeric:'🟡', coriander:'🌿',
  apple:'🍎', orange:'🍊', grapes:'🍇', pomegranate:'🍎', guava:'🍐',
  papaya:'🍈', watermelon:'🍉', cucumber:'🥒',
};

function getEmoji(commodity) {
  const lower = (commodity || '').toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🌱';
}

function getCategory(commodity) {
  const lower = (commodity || '').toLowerCase();
  if (['wheat','rice','corn','maize','jowar','bajra','barley','mustard','soyabean',
       'cotton','groundnut','sugarcane'].some(g => lower.includes(g))) return 'grains';
  if (['gram','moong','urad','arhar','lentil','peas'].some(p => lower.includes(p))) return 'pulses';
  if (['mango','banana','apple','orange','grapes','pomegranate','guava','papaya',
       'watermelon'].some(f => lower.includes(f))) return 'fruits';
  return 'vegetables';
}

// ── Single page fetch from Data.gov.in ───────────────────────────────────────
function fetchPage(state, limit, offset) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY,
      format:    'json',
      limit:     String(limit),
      offset:    String(offset),
    });
    if (state) params.append('filters[state]', state);

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`[Mandi] GET offset=${offset} state=${state}`);

    const req = https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Fetch ALL pages for a state (paginated) ───────────────────────────────────
async function fetchAllForState(state) {
  const PAGE_SIZE = 500;

  // First page — also tells us total count
  const first = await fetchPage(state, PAGE_SIZE, 0);
  if (!first.records || !Array.isArray(first.records)) {
    throw new Error('No records in response');
  }

  const total      = parseInt(first.total || first.count || '0', 10) || first.records.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  let allRecords   = [...first.records];

  console.log(`[Mandi] Total records for ${state}: ${total}, pages: ${totalPages}`);

  // Fetch remaining pages in batches of 5
  const BATCH = 5;
  for (let start = 1; start < totalPages; start += BATCH) {
    const end     = Math.min(start + BATCH, totalPages);
    const offsets = Array.from({ length: end - start }, (_, i) => (start + i) * PAGE_SIZE);

    const results = await Promise.allSettled(
      offsets.map(o => fetchPage(state, PAGE_SIZE, o))
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.records)) {
        allRecords = allRecords.concat(r.value.records);
      }
    }
  }

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
      const modal    = parseFloat(r.modal_price || r.Modal_Price || 0);
      const priceKg  = parseFloat((modal / 100).toFixed(2));
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
        pricePerKg:  priceKg,
        arrivalDate: (r.arrival_date || r.Arrival_Date || '').trim(),
        emoji:       getEmoji(commodity),
        category:    getCategory(commodity),
      };
    });
}

// ── Get or refresh cache for a state ─────────────────────────────────────────
async function getStateData(state) {
  const key = (state || 'all').toLowerCase();
  const now = Date.now();

  if (stateCache[key] && (now - stateCache[key].fetchedAt) < CACHE_TTL_MS) {
    console.log(`[Mandi] Cache hit for ${state}`);
    return { data: stateCache[key].data, source: 'cache' };
  }

  try {
    const raw       = await fetchAllForState(state);
    const processed = processRecords(raw);

    if (processed.length === 0) {
      console.warn(`[Mandi] 0 records after processing for ${state}`);
      return { data: FALLBACK, source: 'fallback' };
    }

    stateCache[key] = { data: processed, fetchedAt: now };
    console.log(`[Mandi] Cached ${processed.length} records for ${state}`);
    return { data: processed, source: 'live' };
  } catch (err) {
    console.error(`[Mandi] fetchAllForState failed: ${err.message}`);
    // Return stale cache if available
    if (stateCache[key]?.data) {
      return { data: stateCache[key].data, source: 'stale-cache' };
    }
    return { data: FALLBACK, source: 'fallback' };
  }
}

// ── GET /api/mandi ────────────────────────────────────────────────────────────
exports.getMandiPrices = async (req, res) => {
  try {
    const { state = 'Gujarat', district, commodity } = req.query;

    const { data, source } = await getStateData(state);

    let result = data;
    if (district)  result = result.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    if (commodity) result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()));

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
    const { data } = await getStateData(state);
    const districts = [...new Set(data.map(r => r.district).filter(Boolean))].sort();
    res.json({ success: true, districts });
  } catch (err) {
    console.error('[Mandi] getDistricts error:', err.message);
    res.json({ success: true, districts: ['Ahmedabad','Banaskantha','Mehsana','Rajkot','Surat','Vadodara'] });
  }
};

// ── GET /api/mandi/states ─────────────────────────────────────────────────────
exports.getStates = async (req, res) => {
  // Fetch a small sample to get all states
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
