// ── Data.gov.in Mandi Price API ───────────────────────────────────────────────
const API_KEY     = '579b464db66ec23bdd000001052c14f0ffe34a0078f211bcb66705d8';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE        = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const TTL         = 60 * 60 * 1000; // 60 min cache

const _cache     = {};
const _geoCache  = {}; // district/market → { lat, lng }

// ─────────────────────────────────────────────────────────────────────────────
// PART 4: Haversine distance formula (km)
// ─────────────────────────────────────────────────────────────────────────────
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R    = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km == null) return null;
  if (km < 1)    return `${Math.round(km * 1000)} m away`;
  if (km < 10)   return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Geocode a place name → { lat, lng } via Nominatim (cached)
// ─────────────────────────────────────────────────────────────────────────────
async function geocodePlace(query) {
  const key = query.toLowerCase().trim();
  if (_geoCache[key]) return _geoCache[key];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
    const res  = await fetch(url, { headers: { 'User-Agent': 'KisanMitraApp/1.0' } });
    const json = await res.json();
    if (json[0]) {
      const coords = { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
      _geoCache[key] = coords;
      return coords;
    }
  } catch {}
  return null;
}

// Geocode a mandi market name — tries "Market, District, State, India"
// then falls back to "District, State, India"
export async function geocodeMandi(market, district, state) {
  const key = `${market}|${district}|${state}`.toLowerCase();
  if (_geoCache[key]) return _geoCache[key];

  const queries = [
    `${market}, ${district}, ${state}, India`,
    `${district}, ${state}, India`,
    `${state}, India`,
  ];
  for (const q of queries) {
    const coords = await geocodePlace(q);
    if (coords) {
      _geoCache[key] = coords;
      return coords;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Emoji / category helpers
// ─────────────────────────────────────────────────────────────────────────────
const EMOJI_MAP = {
  tomato:'🍅', potato:'🥔', onion:'🧅', wheat:'🌾', rice:'🍚', corn:'🌽',
  maize:'🌽', mustard:'🌻', gram:'🫘', soyabean:'🟤', cotton:'🌿', mango:'🥭',
  banana:'🍌', carrot:'🥕', groundnut:'🥜', sugarcane:'🎋', moong:'🫘',
  urad:'🫘', arhar:'🫘', jowar:'🌾', bajra:'🌾', barley:'🌾', lentil:'🫘',
  peas:'🫛', brinjal:'🍆', cabbage:'🥬', cauliflower:'🥦', spinach:'🥬',
  garlic:'🧄', ginger:'🫚', chilli:'🌶️', turmeric:'🟡', coriander:'🌿',
  apple:'🍎', orange:'🍊', grapes:'🍇', pomegranate:'🍎', guava:'🍐',
  papaya:'🍈', watermelon:'🍉', cucumber:'🥒', ladyfinger:'🌿',
};

export function getEmoji(name) {
  const l = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(EMOJI_MAP)) if (l.includes(k)) return v;
  return '🌱';
}

export function getCategory(name) {
  const l = (name || '').toLowerCase();
  if (['wheat','rice','corn','maize','jowar','bajra','barley','mustard','soyabean',
       'cotton','groundnut','sugarcane','sesame','linseed','safflower'].some(k => l.includes(k))) return 'grains';
  if (['gram','moong','urad','arhar','lentil','peas','rajma','masoor'].some(k => l.includes(k))) return 'pulses';
  if (['mango','banana','apple','orange','grapes','pomegranate','guava','papaya',
       'watermelon','melon','litchi','pineapple','coconut'].some(k => l.includes(k))) return 'fruits';
  return 'vegetables';
}

function mapRecord(r) {
  const modal = parseFloat(r.modal_price || r.Modal_Price || 0);
  return {
    commodity:   (r.commodity   || r.Commodity   || '').trim(),
    variety:     (r.variety     || r.Variety     || '').trim(),
    market:      (r.market      || r.Market      || '').trim(),
    district:    (r.district    || r.District    || '').trim(),
    state:       (r.state       || r.State       || '').trim(),
    minPrice:    parseFloat(r.min_price  || 0),
    maxPrice:    parseFloat(r.max_price  || 0),
    modalPrice:  modal,
    pricePerKg:  parseFloat((modal / 100).toFixed(2)),
    arrivalDate: (r.arrival_date || r.Arrival_Date || '').trim(),
    emoji:       getEmoji(r.commodity),
    category:    getCategory(r.commodity),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch with retry
// ─────────────────────────────────────────────────────────────────────────────
async function fetchPage({ state = '', district = '', market = '', limit = 500, offset = 0 } = {}, retries = 3) {
  const params = new URLSearchParams({ 'api-key': API_KEY, format: 'json', limit: String(limit), offset: String(offset) });
  if (state)    params.append('filters[state]',    state);
  if (district) params.append('filters[district]', district);
  if (market)   params.append('filters[market]',   market);

  const url = `${BASE}?${params.toString()}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

async function fetchAllPages({ state = '', district = '', market = '' } = {}) {
  const cacheKey = `${state}|${district}|${market}`.toLowerCase();
  if (_cache[cacheKey] && Date.now() - _cache[cacheKey].at < TTL) {
    return { data: _cache[cacheKey].data, source: 'cache' };
  }
  try {
    const first = await fetchPage({ state, district, market, limit: 500, offset: 0 });
    if (!first.records || !Array.isArray(first.records) || first.records.length === 0) {
      return { data: [], source: 'empty' };
    }
    const total      = parseInt(first.total || first.count || '0', 10) || first.records.length;
    const pageSize   = 500;
    const totalPages = Math.ceil(total / pageSize);
    let all = [...first.records];

    const BATCH = 6;
    for (let start = 1; start < totalPages; start += BATCH) {
      const end     = Math.min(start + BATCH, totalPages);
      const offsets = Array.from({ length: end - start }, (_, i) => (start + i) * pageSize);
      const results = await Promise.allSettled(offsets.map(o => fetchPage({ state, district, market, limit: pageSize, offset: o })));
      for (const r of results) {
        if (r.status === 'fulfilled' && Array.isArray(r.value?.records)) all = all.concat(r.value.records);
      }
    }

    const processed = all.filter(r => (r.commodity || r.Commodity || '').trim().length > 0).map(mapRecord);
    _cache[cacheKey] = { data: processed, at: Date.now() };
    return { data: processed, source: 'live' };
  } catch (err) {
    if (_cache[cacheKey]?.data) return { data: _cache[cacheKey].data, source: 'stale-cache' };
    return { data: [], source: 'error' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchStates() {
  const cacheKey = '__states__';
  if (_cache[cacheKey] && Date.now() - _cache[cacheKey].at < TTL) {
    return { data: _cache[cacheKey].data, source: 'cache' };
  }
  try {
    const pages = await Promise.allSettled([
      fetchPage({ limit: 500, offset: 0 }),
      fetchPage({ limit: 500, offset: 500 }),
      fetchPage({ limit: 500, offset: 1000 }),
    ]);
    const allRecords = pages.flatMap(p =>
      p.status === 'fulfilled' && Array.isArray(p.value.records) ? p.value.records : []
    );
    const states = [...new Set(allRecords.map(r => (r.state || r.State || '').trim()).filter(Boolean))].sort();
    const result = states.length > 0 ? states : FALLBACK_STATES;
    _cache[cacheKey] = { data: result, at: Date.now() };
    return { data: result, source: states.length > 0 ? 'live' : 'fallback' };
  } catch {
    return { data: FALLBACK_STATES, source: 'fallback' };
  }
}

export async function fetchByState(state)                  { return fetchAllPages({ state }); }
export async function fetchByDistrict(state, district)     { return fetchAllPages({ state, district }); }

/** Fetch ALL crops for a specific mandi — no record cap, strict market filter */
export async function fetchByMarket(state, district, market) {
  const cacheKey = `mkt|${state}|${district}|${market}`.toLowerCase();
  if (_cache[cacheKey] && Date.now() - _cache[cacheKey].at < TTL) {
    return { data: _cache[cacheKey].data, source: 'cache' };
  }
  try {
    const first = await fetchPage({ state, district, market, limit: 500, offset: 0 });
    if (!first.records || !Array.isArray(first.records)) return { data: [], source: 'empty' };

    const total      = parseInt(first.total || first.count || '0', 10) || first.records.length;
    const totalPages = Math.ceil(total / 500);
    let all = [...first.records];

    const BATCH = 8;
    for (let start = 1; start < totalPages; start += BATCH) {
      const end     = Math.min(start + BATCH, totalPages);
      const offsets = Array.from({ length: end - start }, (_, i) => (start + i) * 500);
      const results = await Promise.allSettled(offsets.map(o => fetchPage({ state, district, market, limit: 500, offset: o })));
      for (const r of results) {
        if (r.status === 'fulfilled' && Array.isArray(r.value?.records)) all = all.concat(r.value.records);
      }
    }

    const mandiLower = market.toLowerCase().trim();
    const processed  = all.filter(r => (r.commodity || r.Commodity || '').trim().length > 0).map(mapRecord);
    const strict     = processed.filter(r => r.market.toLowerCase().trim() === mandiLower);
    const final      = strict.length > 0 ? strict : processed;

    _cache[cacheKey] = { data: final, at: Date.now() };
    return { data: final, source: 'live' };
  } catch (err) {
    if (_cache[cacheKey]?.data) return { data: _cache[cacheKey].data, source: 'stale-cache' };
    return { data: [], source: 'error' };
  }
}

/**
 * NEARBY: Fetch all mandis in user's state, geocode each unique market,
 * calculate Haversine distance from user, sort nearest → farthest.
 *
 * Returns MarketGroup[] with `distanceKm` and `distanceLabel` attached.
 */
export async function fetchNearbyWithDistance(userLat, userLng, state, district = '') {
  // 1. Fetch all records for the state
  const res = await fetchAllPages({ state });
  if (!res.data || res.data.length === 0) return { groups: [], source: res.source };

  // 2. Group by market
  const map = {};
  for (const r of res.data) {
    const key = r.market.trim();
    if (!map[key]) map[key] = { market: key, district: r.district, state: r.state, prices: [] };
    map[key].prices.push(r);
  }
  const groups = Object.values(map);

  // 3. Geocode each unique district in parallel (not each market — too many requests)
  //    Markets in the same district share the district's coordinates
  const uniqueDistricts = [...new Set(groups.map(g => g.district).filter(Boolean))];
  const districtCoords  = {};

  await Promise.allSettled(
    uniqueDistricts.map(async (d) => {
      const coords = await geocodePlace(`${d}, ${state}, India`);
      if (coords) districtCoords[d.toLowerCase()] = coords;
    })
  );

  // 4. Attach distance to each group
  for (const g of groups) {
    const coords = districtCoords[g.district.toLowerCase()];
    if (coords && userLat != null && userLng != null) {
      g.distanceKm    = haversineDistance(userLat, userLng, coords.lat, coords.lng);
      g.distanceLabel = formatDistance(g.distanceKm);
      g.coords        = coords;
    } else {
      g.distanceKm    = null;
      g.distanceLabel = null;
      g.coords        = null;
    }
  }

  // 5. Sort: mandis with known distance first (nearest → farthest),
  //    then mandis without distance (sorted by crop count)
  groups.sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return b.prices.length - a.prices.length;
  });

  return { groups, source: res.source };
}

/** Backward-compat alias */
export async function fetchMandiPrices({ state = '', district = '', market = '' } = {}) {
  if (market)   return fetchByMarket(state, district, market);
  if (district) return fetchByDistrict(state, district);
  if (state)    return fetchByState(state);
  return fetchAllPages({});
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function getStates(data)    { return [...new Set(data.map(r => r.state).filter(Boolean))].sort(); }
export function getDistricts(data) { return [...new Set(data.map(r => r.district).filter(Boolean))].sort(); }
export function getMarkets(data)   { return [...new Set(data.map(r => r.market).filter(Boolean))].sort(); }

export function groupByMarket(data, priorityDistrict = '') {
  const map = {};
  data.forEach(r => {
    const key = (r.market || 'Unknown').trim();
    if (!map[key]) map[key] = { market: key, district: r.district, state: r.state, prices: [], distanceKm: null, distanceLabel: null };
    map[key].prices.push(r);
  });
  const groups = Object.values(map);
  if (priorityDistrict) {
    const pLower = priorityDistrict.toLowerCase();
    const score  = (g) => {
      const d = g.district.toLowerCase();
      if (d === pLower) return 0;
      if (d.includes(pLower) || pLower.includes(d)) return 1;
      return 2;
    };
    groups.sort((a, b) => score(a) - score(b) || b.prices.length - a.prices.length);
  } else {
    groups.sort((a, b) => b.prices.length - a.prices.length);
  }
  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reverse geocode: lat/lng → { district, state }
// ─────────────────────────────────────────────────────────────────────────────
export async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=8&addressdetails=1`,
      { headers: { 'User-Agent': 'KisanMitraApp/1.0' } }
    );
    const json = await res.json();
    const addr = json.address || {};

    let state = (addr.state || '').trim();
    const stateNorm = {
      'uttarakhand': 'Uttarakhand', 'uttar pradesh': 'Uttar Pradesh',
      'madhya pradesh': 'Madhya Pradesh', 'himachal pradesh': 'Himachal Pradesh',
      'andhra pradesh': 'Andhra Pradesh', 'west bengal': 'West Bengal',
      'tamil nadu': 'Tamil Nadu', 'arunachal pradesh': 'Arunachal Pradesh',
    };
    for (const [k, v] of Object.entries(stateNorm)) {
      if (state.toLowerCase().includes(k)) { state = v; break; }
    }

    const raw      = (addr.county || addr.state_district || addr.district || addr.city || addr.town || '').trim();
    const district = raw.replace(/\s*(district|zila|jila|taluka|tehsil|municipal corporation|mc)\s*/gi, '').trim();

    return { district, state };
  } catch {
    return { district: '', state: 'Gujarat' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback data
// ─────────────────────────────────────────────────────────────────────────────
export const FALLBACK_STATES = [
  'Andhra Pradesh','Bihar','Chhattisgarh','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu',
  'Telangana','Uttar Pradesh','Uttarakhand','West Bengal',
];

export const FALLBACK = [
  { commodity:'Tomato',    variety:'Local',   market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:1500, maxPrice:3500, modalPrice:2500, pricePerKg:25,   arrivalDate:'', emoji:'🍅', category:'vegetables', distanceKm:null, distanceLabel:null },
  { commodity:'Potato',    variety:'Local',   market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:1200, maxPrice:1800, modalPrice:1500, pricePerKg:15,   arrivalDate:'', emoji:'🥔', category:'vegetables', distanceKm:null, distanceLabel:null },
  { commodity:'Onion',     variety:'Local',   market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:1800, maxPrice:2800, modalPrice:2200, pricePerKg:22,   arrivalDate:'', emoji:'🧅', category:'vegetables', distanceKm:null, distanceLabel:null },
  { commodity:'Wheat',     variety:'Lokwan',  market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:2100, maxPrice:2200, modalPrice:2150, pricePerKg:21.5, arrivalDate:'', emoji:'🌾', category:'grains',     distanceKm:null, distanceLabel:null },
  { commodity:'Rice',      variety:'Common',  market:'Ahmedabad APMC',   district:'Ahmedabad',   state:'Gujarat', minPrice:3100, maxPrice:3300, modalPrice:3200, pricePerKg:32,   arrivalDate:'', emoji:'🍚', category:'grains',     distanceKm:null, distanceLabel:null },
  { commodity:'Gram',      variety:'Local',   market:'Mehsana APMC',     district:'Mehsana',     state:'Gujarat', minPrice:4700, maxPrice:4900, modalPrice:4800, pricePerKg:48,   arrivalDate:'', emoji:'🫘', category:'pulses',     distanceKm:null, distanceLabel:null },
  { commodity:'Mustard',   variety:'Local',   market:'Banaskantha APMC', district:'Banaskantha', state:'Gujarat', minPrice:5000, maxPrice:5400, modalPrice:5200, pricePerKg:52,   arrivalDate:'', emoji:'🌻', category:'grains',     distanceKm:null, distanceLabel:null },
  { commodity:'Groundnut', variety:'Bold',    market:'Rajkot APMC',      district:'Rajkot',      state:'Gujarat', minPrice:5500, maxPrice:6000, modalPrice:5750, pricePerKg:57.5, arrivalDate:'', emoji:'🥜', category:'grains',     distanceKm:null, distanceLabel:null },
  { commodity:'Cotton',    variety:'Shankar', market:'Rajkot APMC',      district:'Rajkot',      state:'Gujarat', minPrice:6200, maxPrice:6800, modalPrice:6500, pricePerKg:65,   arrivalDate:'', emoji:'🌿', category:'grains',     distanceKm:null, distanceLabel:null },
  { commodity:'Banana',    variety:'Robusta', market:'Surat APMC',       district:'Surat',       state:'Gujarat', minPrice:1200, maxPrice:2000, modalPrice:1600, pricePerKg:16,   arrivalDate:'', emoji:'🍌', category:'fruits',     distanceKm:null, distanceLabel:null },
];
