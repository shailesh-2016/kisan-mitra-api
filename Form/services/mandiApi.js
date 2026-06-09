import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Data.gov.in Mandi Price API ───────────────────────────────────────────────
const API_KEY     = '579b464db66ec23bdd000001052c14f0ffe34a0078f211bcb66705d8';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE        = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const TTL         = 60 * 60 * 1000; // 60 min cache

const _cache     = {};
const _geoCache  = {}; // district/market → { lat, lng }

// ─────────────────────────────────────────────────────────────────────────────
// String Normalization Helper
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeText(val) {
  if (!val) return '';
  return String(val)
    .toLowerCase()
    .replace(/\(apmc\)/g, '')
    .replace(/apmc/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Normalization Helper
// ─────────────────────────────────────────────────────────────────────────────
export function normalizeDate(apiDate) {
  if (!apiDate) return new Date(1970, 0, 1);
  const clean = String(apiDate).trim();
  
  // Try split by '/' or '-'
  const parts = clean.split(/[\/\-]/);
  if (parts.length === 3) {
    let day = 1, month = 1, year = 1970;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }
  
  // Try native parsing as fallback
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  
  return new Date(1970, 0, 1);
}

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
    const res  = await fetch(url, { headers: { 'User-Agent': 'KisanPlusApp/1.0' } });
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
async function fetchPage({ state = '', district = '', market = '', limit = 100, offset = 0 } = {}, retries = 3) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Fetch Latest Available Mandi Data Helper
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchLatestAvailableMandiData({ state = '', district = '', market = '' } = {}) {
  console.log(`[Mandi Fetch] Fetching large dataset for state="${state}", district="${district}", market="${market}"...`);

  let allRecords = [];
  try {
    const limit = 100;
    let offset = 0;

    // Fetch complete district/state data via offset loop
    while (true) {
      console.log(`[Mandi Fetch] Fetching page with offset ${offset}...`);
      const res = await fetchPage({ state, district, limit, offset });
      if (!res || !res.records || !Array.isArray(res.records) || res.records.length === 0) {
        break;
      }
      allRecords = allRecords.concat(res.records);
      if (res.records.length < limit) {
        break;
      }
      offset += limit;
    }
  } catch (err) {
    console.warn(`[Mandi Fetch] API fetch failed:`, err.message);
  }

  console.log(`[Mandi Fetch] Total raw records fetched: ${allRecords.length}`);
  if (allRecords.length === 0) {
    return null;
  }

  // Debug: Log unique market names
  const uniqueMarkets = [...new Set(allRecords.map(r => r.market || r.Market).filter(Boolean))];
  console.log(`[Mandi Fetch] Unique markets in dataset:`, uniqueMarkets);

  // If a specific market is selected, let's filter to that market first to ensure we get its latest available date!
  let targetRecords = allRecords;
  if (market) {
    const normTargetMarket = normalizeText(market);
    const filteredByMarket = allRecords.filter(r => normalizeText(r.market || r.Market) === normTargetMarket);
    if (filteredByMarket.length > 0) {
      targetRecords = filteredByMarket;
      console.log(`[Mandi Fetch] Filtered to target market "${market}" (${filteredByMarket.length} records)`);
    } else {
      console.log(`[Mandi Fetch] No exact match for market "${market}". Using full district/state dataset.`);
    }
  }

  // Filter for last 7 days and keep latest price per commodity per market
  const today = new Date();
  today.setHours(0,0,0,0);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const bestRecordMap = new Map(); // key -> record
  
  targetRecords.forEach(r => {
    const arrivalDateStr = r.arrival_date || r.Arrival_Date || '';
    if (!arrivalDateStr) return;
    const parsedDate = normalizeDate(arrivalDateStr);
    
    // Ignore data older than 7 days
    if (parsedDate < sevenDaysAgo) return; 
    
    const key = `${normalizeText(r.market || r.Market)}|${normalizeText(r.commodity || r.Commodity)}`;
    const existing = bestRecordMap.get(key);
    
    if (!existing) {
      bestRecordMap.set(key, { record: r, date: parsedDate });
    } else if (parsedDate > existing.date) {
      bestRecordMap.set(key, { record: r, date: parsedDate });
    }
  });

  const finalRecords = Array.from(bestRecordMap.values()).map(x => x.record);

  if (finalRecords.length === 0) {
    console.log(`[Mandi Fetch] No valid dates found in target dataset within 7 days.`);
    return null;
  }

  return {
    records: finalRecords,
    dateLabel: "Recent Data (Last 7 Days)",
    arrivalDate: "Last 7 Days"
  };
}

async function fetchAllPages({ state = '', district = '', market = '' } = {}) {
  const cacheKey = `${state}|${district}|${market}`.toLowerCase();
  const storageKey = `@mandi_${cacheKey}`;

  // 1. In-memory cache (fastest)
  if (_cache[cacheKey] && Date.now() - _cache[cacheKey].at < TTL) {
    return { data: _cache[cacheKey].data, dateLabel: _cache[cacheKey].dateLabel, source: 'cache' };
  }

  try {
    const result = await fetchLatestAvailableMandiData({ state, district, market });
    
    if (result && result.records.length > 0) {
      const processed = result.records
        .filter(r => (r.commodity || r.Commodity || '').trim().length > 0)
        .map(mapRecord)
        .filter((r, idx, arr) => {
          const key = `${r.commodity}|${r.market}|${r.variety}`.toLowerCase();
          return arr.findIndex(x => `${x.commodity}|${x.market}|${x.variety}`.toLowerCase() === key) === idx;
        });

      console.log(`[Mandi] Fetched ${result.records.length} raw → ${processed.length} unique records for ${cacheKey}`);

      _cache[cacheKey] = { data: processed, dateLabel: result.dateLabel, at: Date.now() };
      AsyncStorage.setItem(storageKey, JSON.stringify({ data: processed, dateLabel: result.dateLabel, savedAt: Date.now() })).catch(() => {});

      return { data: processed, dateLabel: result.dateLabel, source: 'live' };
    }

    // Try persistent storage
    const stored = await AsyncStorage.getItem(storageKey).catch(() => null);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.data?.length > 0) {
        console.log(`[Mandi] Using stored data for ${cacheKey} (${parsed.data.length} records)`);
        _cache[cacheKey] = { data: parsed.data, dateLabel: parsed.dateLabel || "Latest Available Data", at: Date.now() - TTL + 5 * 60 * 1000 };
        return { data: parsed.data, dateLabel: parsed.dateLabel || "Latest Available Data", source: 'stored' };
      }
    }
    
    return { data: [], dateLabel: "No data found", source: 'empty' };
  } catch (err) {
    console.warn(`[Mandi] fetchAllPages error for ${cacheKey}:`, err?.message);
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.data?.length > 0) {
          console.log(`[Mandi] Using stored data after error for ${cacheKey}`);
          _cache[cacheKey] = { data: parsed.data, dateLabel: parsed.dateLabel || "Latest Available Data", at: Date.now() - TTL + 5 * 60 * 1000 };
          return { data: parsed.data, dateLabel: parsed.dateLabel || "Latest Available Data", source: 'stored' };
        }
      }
    } catch {}

    if (_cache[cacheKey]?.data) return { data: _cache[cacheKey].data, dateLabel: _cache[cacheKey].dateLabel, source: 'stale-cache' };
    return { data: [], dateLabel: "Error loading data", source: 'error' };
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

export async function fetchByMarket(state, district, market) {
  const cacheKey = `mkt|${state}|${district}|${market}`.toLowerCase();
  if (_cache[cacheKey] && Date.now() - _cache[cacheKey].at < TTL) {
    return { data: _cache[cacheKey].data, dateLabel: _cache[cacheKey].dateLabel, source: 'cache' };
  }
  try {
    const result = await fetchLatestAvailableMandiData({ state, district, market });
    
    if (result && result.records.length > 0) {
      const mandiLower = normalizeText(market);
      const processed = result.records.filter(r => (r.commodity || r.Commodity || '').trim().length > 0).map(mapRecord);
      const strict = processed.filter(r => normalizeText(r.market) === mandiLower);
      const final = strict.length > 0 ? strict : processed;

      _cache[cacheKey] = { data: final, dateLabel: result.dateLabel, at: Date.now() };
      
      const storageKey = `@mandi_${cacheKey}`;
      AsyncStorage.setItem(storageKey, JSON.stringify({ data: final, dateLabel: result.dateLabel, savedAt: Date.now() })).catch(() => {});
      
      return { data: final, dateLabel: result.dateLabel, source: 'live' };
    }
    
    const storageKey = `@mandi_${cacheKey}`;
    const stored = await AsyncStorage.getItem(storageKey).catch(() => null);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.data?.length > 0) {
        console.log(`[Mandi Fallback] Using offline stored data for ${cacheKey}`);
        return { data: parsed.data, dateLabel: parsed.dateLabel || "Latest Available Data", source: 'stored' };
      }
    }
    
    if (normalizeText(market).includes('ahmedabad')) {
      const ahmedabadFallback = FALLBACK.filter(r => normalizeText(r.market).includes('ahmedabad'));
      if (ahmedabadFallback.length > 0) {
        return { data: ahmedabadFallback, dateLabel: "Latest Available Data", source: 'fallback' };
      }
    }
    
    return { data: [], dateLabel: "No data found", source: 'empty' };
  } catch (err) {
    console.error(`[Mandi Fallback] fetchByMarket error:`, err);
    if (_cache[cacheKey]?.data) return { data: _cache[cacheKey].data, dateLabel: _cache[cacheKey].dateLabel, source: 'stale-cache' };
    return { data: [], dateLabel: "Error loading data", source: 'error' };
  }
}

/**
 * NEARBY: Fetch mandis from user's district first (most relevant),
 * then expand to full state if district has no/few results.
 * Sorts strictly by distance using Haversine formula.
 */
export async function fetchNearbyWithDistance(userLat, userLng, state, district = '') {
  // Always fetch full state to ensure we get ALL mandies nearby, not just the user's district.
  // Because the user wants all mandies sorted by distance properly.
  let res = { data: [], source: 'empty' };
  console.log(`[Mandi] Fetching full state for nearby mandies: ${state}`);
  res = await fetchAllPages({ state });
  console.log(`[Mandi] State "${state}" returned ${res.data?.length || 0} records`);

  if (!res.data || res.data.length === 0) return { groups: [], source: res.source, dateLabel: res.dateLabel };

  // Step 3: Remove duplicate records (same commodity + market)
  const seen = new Set();
  const deduped = res.data.filter(r => {
    const key = `${r.commodity}|${r.market}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Step 4: Group by market
  const map = {};
  for (const r of deduped) {
    const key = r.market.trim();
    if (!map[key]) map[key] = { market: key, district: r.district, state: r.state, prices: [] };
    map[key].prices.push(r);
  }
  const groups = Object.values(map);
  console.log(`[Mandi] Total unique markets: ${groups.length}`);

  // Step 5: Geocode all unique districts in parallel
  const uniqueDistricts = [...new Set(groups.map(g => g.district).filter(Boolean))];
  const districtCoords  = {};

  await Promise.allSettled(
    uniqueDistricts.map(async (d) => {
      try {
        const coords = await geocodePlace(`${d}, ${state}, India`);
        if (coords) districtCoords[d.toLowerCase()] = coords;
      } catch {}
    })
  );

  // Step 6: Attach distance using Haversine
  for (const g of groups) {
    const dKey   = (g.district || '').toLowerCase();
    const coords = districtCoords[dKey];
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

  // Step 7: Sort nearest first
  groups.sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return b.prices.length - a.prices.length;
  });

  console.log(`[Mandi] Nearest mandi: ${groups[0]?.market} (${groups[0]?.distanceKm?.toFixed(1)} km)`);
  return { groups, source: res.source, dateLabel: res.dateLabel };
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
      { headers: { 'User-Agent': 'KisanPlusApp/1.0' } }
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
