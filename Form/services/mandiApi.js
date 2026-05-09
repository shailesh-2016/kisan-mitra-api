// ── Mandi API — fetches from our own backend (Render) ────────────────────────
// Backend proxies data.gov.in so CORS and API key issues are avoided.

const BACKEND_URL = 'https://kisan-mitra-api-8ski.onrender.com';
const TTL         = 60 * 60 * 1000; // 60 min client-side cache

const _cache    = {};
const _geoCache = {};

// ─────────────────────────────────────────────────────────────────────────────
// Haversine distance (km)
// ─────────────────────────────────────────────────────────────────────────────
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R    = 6371;
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
// Geocode via Nominatim (cached)
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
    if (coords) { _geoCache[key] = coords; return coords; }
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

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch from backend
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromBackend({ state = 'Gujarat', district = '', commodity = '', limit = 500 } = {}) {
  const cacheKey = `${state}|${district}|${commodity}`.toLowerCase();
  if (_cache[cacheKey] && Date.now() - _cache[cacheKey].at < TTL) {
    return { data: _cache[cacheKey].data, source: 'cache' };
  }

  try {
    const params = new URLSearchParams({ state, limit: String(limit) });
    if (district)  params.append('district',  district);
    if (commodity) params.append('commodity', commodity);

    const res  = await fetch(`${BACKEND_URL}/api/mandi?${params.toString()}`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      // Backend returned empty — use fallback
      return { data: FALLBACK, source: 'fallback' };
    }

    // Ensure emoji/category are present (backend may not add them)
    const processed = json.data.map(r => ({
      ...r,
      emoji:    r.emoji    || getEmoji(r.commodity),
      category: r.category || getCategory(r.commodity),
      pricePerKg: r.pricePerKg || parseFloat((r.modalPrice / 100).toFixed(2)),
    }));

    _cache[cacheKey] = { data: processed, at: Date.now() };
    return { data: processed, source: json.source || 'live' };
  } catch (err) {
    console.warn('[MandiApi] Backend fetch failed, using fallback:', err?.message);
    if (_cache[cacheKey]?.data) return { data: _cache[cacheKey].data, source: 'stale-cache' };
    return { data: FALLBACK, source: 'fallback' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — same signatures as before so no screen changes needed
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchStates() {
  try {
    const res  = await fetch(`${BACKEND_URL}/api/mandi/states`);
    const json = await res.json();
    if (json.success && Array.isArray(json.states) && json.states.length > 0) {
      return { data: json.states, source: 'live' };
    }
    return { data: FALLBACK_STATES, source: 'fallback' };
  } catch {
    return { data: FALLBACK_STATES, source: 'fallback' };
  }
}

export async function fetchByState(state) {
  return fetchFromBackend({ state, limit: 500 });
}

export async function fetchByDistrict(state, district) {
  return fetchFromBackend({ state, district, limit: 500 });
}

export async function fetchByMarket(state, district, market) {
  const res = await fetchFromBackend({ state, district, limit: 500 });
  if (!res.data || res.data.length === 0) return res;
  const mandiLower = market.toLowerCase().trim();
  const filtered   = res.data.filter(r => (r.market || '').toLowerCase().trim() === mandiLower);
  return { data: filtered.length > 0 ? filtered : res.data, source: res.source };
}

/** Main entry used by home strip and market screen */
export async function fetchMandiPrices({ state = 'Gujarat', district = '', market = '', limit = 100 } = {}) {
  if (market)   return fetchByMarket(state, district, market);
  if (district) return fetchByDistrict(state, district);
  return fetchByState(state);
}

/**
 * Nearby mandis with distance — fetches all records for state,
 * groups by market, geocodes districts, sorts by distance.
 */
export async function fetchNearbyWithDistance(userLat, userLng, state, district = '') {
  const res = await fetchFromBackend({ state, limit: 500 });
  if (!res.data || res.data.length === 0) {
    return { groups: groupByMarket(FALLBACK, district), source: 'fallback' };
  }

  // Group by market
  const map = {};
  for (const r of res.data) {
    const key = (r.market || 'Unknown').trim();
    if (!map[key]) map[key] = { market: key, district: r.district, state: r.state, prices: [] };
    map[key].prices.push(r);
  }
  const groups = Object.values(map);

  // Geocode unique districts in parallel
  const uniqueDistricts = [...new Set(groups.map(g => g.district).filter(Boolean))];
  const districtCoords  = {};
  await Promise.allSettled(
    uniqueDistricts.map(async (d) => {
      const coords = await geocodePlace(`${d}, ${state}, India`);
      if (coords) districtCoords[d.toLowerCase()] = coords;
    })
  );

  // Attach distance
  for (const g of groups) {
    const coords = districtCoords[(g.district || '').toLowerCase()];
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

  // Sort nearest first
  groups.sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return b.prices.length - a.prices.length;
  });

  return { groups, source: res.source };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function getStates(data)    { return [...new Set(data.map(r => r.state).filter(Boolean))].sort(); }
export function getDistricts(data) { return [...new Set(data.map(r => r.district).filter(Boolean))].sort(); }
export function getMarkets(data)   { return [...new Set(data.map(r => r.market).filter(Boolean))].sort(); }

export function groupByMarket(data, priorityDistrict = '') {
  const map = {};
  (data || []).forEach(r => {
    const key = (r.market || 'Unknown').trim();
    if (!map[key]) map[key] = { market: key, district: r.district, state: r.state, prices: [], distanceKm: null, distanceLabel: null };
    map[key].prices.push(r);
  });
  const groups = Object.values(map);
  if (priorityDistrict) {
    const pLower = priorityDistrict.toLowerCase();
    const score  = (g) => {
      const d = (g.district || '').toLowerCase();
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
// Fallback static data
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
