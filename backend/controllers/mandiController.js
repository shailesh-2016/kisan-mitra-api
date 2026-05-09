const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY || 'YOUR_DATA_GOV_API_KEY';
const RESOURCE_ID      = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL         = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// ── In-memory cache ───────────────────────────────────────────────────────────
let cache = { data: null, fetchedAt: null };
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ── Commodity → emoji map ─────────────────────────────────────────────────────
const EMOJI_MAP = {
  tomato: '🍅', potato: '🥔', onion: '🧅', wheat: '🌾', rice: '🍚',
  corn: '🌽', mustard: '🌻', gram: '🫘', soyabean: '🟤', cotton: '🌿',
  mango: '🥭', banana: '🍌', carrot: '🥕', groundnut: '🥜', sugarcane: '🎋',
  moong: '🫘', urad: '🫘', arhar: '🫘', maize: '🌽', jowar: '🌾',
  bajra: '🌾', barley: '🌾', lentil: '🫘', peas: '🫛', brinjal: '🍆',
  cabbage: '🥬', cauliflower: '🥦', spinach: '🥬', garlic: '🧄',
  ginger: '🫚', chilli: '🌶️', turmeric: '🟡', coriander: '🌿',
};

function getEmoji(commodity) {
  const lower = commodity.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🌱';
}

// ── Category classifier ───────────────────────────────────────────────────────
function getCategory(commodity) {
  const lower = commodity.toLowerCase();
  const grains = ['wheat', 'rice', 'corn', 'maize', 'jowar', 'bajra', 'barley', 'mustard', 'soyabean', 'cotton', 'groundnut', 'sugarcane'];
  const pulses = ['gram', 'moong', 'urad', 'arhar', 'lentil', 'peas'];
  const fruits = ['mango', 'banana', 'apple', 'orange', 'grapes', 'pomegranate', 'guava', 'papaya'];
  if (grains.some(g => lower.includes(g))) return 'grains';
  if (pulses.some(p => lower.includes(p))) return 'pulses';
  if (fruits.some(f => lower.includes(f))) return 'fruits';
  return 'vegetables';
}

// ── Fetch from Data.gov.in ────────────────────────────────────────────────────
function fetchFromGov(state = 'Gujarat', limit = 100) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY,
      format: 'json',
      limit: String(limit),
      'filters[state]': state,
    });
    const url = `${BASE_URL}?${params.toString()}`;
    console.log('[Mandi] Fetching:', url);

    https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          resolve(json);
        } catch (e) {
          reject(new Error('Invalid JSON from Data.gov.in'));
        }
      });
    }).on('error', reject);
  });
}

// ── Process raw records ───────────────────────────────────────────────────────
function processRecords(records) {
  return records
    .filter(r => r.modal_price && parseFloat(r.modal_price) > 0)
    .map(r => {
      const modalPricePerQuintal = parseFloat(r.modal_price) || 0;
      const pricePerKg = parseFloat((modalPricePerQuintal / 100).toFixed(2));
      return {
        commodity:    r.commodity || r.Commodity || '',
        variety:      r.variety   || r.Variety   || '',
        market:       r.market    || r.Market    || '',
        district:     r.district  || r.District  || '',
        state:        r.state     || r.State     || '',
        minPrice:     parseFloat(r.min_price)   || 0,
        maxPrice:     parseFloat(r.max_price)   || 0,
        modalPrice:   modalPricePerQuintal,
        pricePerKg,
        arrivalDate:  r.arrival_date || r.Arrival_Date || '',
        emoji:        getEmoji(r.commodity || ''),
        category:     getCategory(r.commodity || ''),
      };
    });
}

// ── GET /api/mandi ────────────────────────────────────────────────────────────
exports.getMandiPrices = async (req, res) => {
  try {
    const { state = 'Gujarat', district, commodity, limit = 100 } = req.query;

    // Serve from cache if fresh
    const now = Date.now();
    if (cache.data && cache.fetchedAt && (now - cache.fetchedAt) < CACHE_TTL_MS) {
      console.log('[Mandi] Serving from cache');
      let result = cache.data;
      if (district) result = result.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
      if (commodity) result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()));
      return res.json({ success: true, source: 'cache', count: result.length, data: result });
    }

    // Fetch fresh data
    const json = await fetchFromGov(state, parseInt(limit));

    if (!json.records || !Array.isArray(json.records)) {
      // API key not set or quota exceeded — return fallback
      console.warn('[Mandi] No records from API, using fallback');
      return res.json({ success: true, source: 'fallback', count: FALLBACK.length, data: FALLBACK });
    }

    const processed = processRecords(json.records);
    cache = { data: processed, fetchedAt: now };

    let result = processed;
    if (district)   result = result.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    if (commodity)  result = result.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()));

    res.json({ success: true, source: 'live', count: result.length, data: result });
  } catch (err) {
    console.error('[Mandi] Error:', err.message);
    // Return fallback on any error
    res.json({ success: true, source: 'fallback', count: FALLBACK.length, data: FALLBACK });
  }
};

// ── GET /api/mandi/districts ──────────────────────────────────────────────────
exports.getDistricts = async (req, res) => {
  try {
    const { state = 'Gujarat' } = req.query;
    let data = cache.data;
    if (!data) {
      const json = await fetchFromGov(state, 500);
      data = json.records ? processRecords(json.records) : FALLBACK;
      cache = { data, fetchedAt: Date.now() };
    }
    const districts = [...new Set(data.map(r => r.district).filter(Boolean))].sort();
    res.json({ success: true, districts });
  } catch (err) {
    res.json({ success: true, districts: ['Ahmedabad', 'Banaskantha', 'Mehsana', 'Rajkot', 'Surat', 'Vadodara'] });
  }
};

// ── Fallback static data (when API key not configured) ────────────────────────
const FALLBACK = [
  { commodity: 'Tomato',    variety: 'Local',  market: 'Ahmedabad APMC', district: 'Ahmedabad',   state: 'Gujarat', minPrice: 1500, maxPrice: 3500, modalPrice: 2500, pricePerKg: 25,   arrivalDate: '', emoji: '🍅', category: 'vegetables' },
  { commodity: 'Potato',    variety: 'Local',  market: 'Ahmedabad APMC', district: 'Ahmedabad',   state: 'Gujarat', minPrice: 1200, maxPrice: 1800, modalPrice: 1500, pricePerKg: 15,   arrivalDate: '', emoji: '🥔', category: 'vegetables' },
  { commodity: 'Onion',     variety: 'Local',  market: 'Ahmedabad APMC', district: 'Ahmedabad',   state: 'Gujarat', minPrice: 1800, maxPrice: 2800, modalPrice: 2200, pricePerKg: 22,   arrivalDate: '', emoji: '🧅', category: 'vegetables' },
  { commodity: 'Wheat',     variety: 'Lokwan', market: 'Ahmedabad APMC', district: 'Ahmedabad',   state: 'Gujarat', minPrice: 2100, maxPrice: 2200, modalPrice: 2150, pricePerKg: 21.5, arrivalDate: '', emoji: '🌾', category: 'grains'     },
  { commodity: 'Rice',      variety: 'Common', market: 'Ahmedabad APMC', district: 'Ahmedabad',   state: 'Gujarat', minPrice: 3100, maxPrice: 3300, modalPrice: 3200, pricePerKg: 32,   arrivalDate: '', emoji: '🍚', category: 'grains'     },
  { commodity: 'Gram',      variety: 'Local',  market: 'Mehsana APMC',   district: 'Mehsana',     state: 'Gujarat', minPrice: 4700, maxPrice: 4900, modalPrice: 4800, pricePerKg: 48,   arrivalDate: '', emoji: '🫘', category: 'pulses'     },
  { commodity: 'Mustard',   variety: 'Local',  market: 'Banaskantha',    district: 'Banaskantha', state: 'Gujarat', minPrice: 5000, maxPrice: 5400, modalPrice: 5200, pricePerKg: 52,   arrivalDate: '', emoji: '🌻', category: 'grains'     },
  { commodity: 'Groundnut', variety: 'Bold',   market: 'Rajkot APMC',    district: 'Rajkot',      state: 'Gujarat', minPrice: 5500, maxPrice: 6000, modalPrice: 5750, pricePerKg: 57.5, arrivalDate: '', emoji: '🥜', category: 'grains'     },
  { commodity: 'Mango',     variety: 'Kesar',  market: 'Surat APMC',     district: 'Surat',       state: 'Gujarat', minPrice: 4000, maxPrice: 8000, modalPrice: 6000, pricePerKg: 60,   arrivalDate: '', emoji: '🥭', category: 'fruits'     },
  { commodity: 'Cotton',    variety: 'Shankar', market: 'Rajkot APMC',   district: 'Rajkot',      state: 'Gujarat', minPrice: 6200, maxPrice: 6800, modalPrice: 6500, pricePerKg: 65,   arrivalDate: '', emoji: '🌿', category: 'grains'     },
];
