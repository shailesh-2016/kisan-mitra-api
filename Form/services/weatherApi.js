// ── OpenWeather API Service ───────────────────────────────────────────────────
const API_KEY      = 'c2c81b18fdba28136e8d2c099ea806b8';
const BASE         = 'https://api.openweathermap.org/data/2.5';
const DEFAULT_CITY = 'Ahmedabad';

// ── Icon → Ionicons ───────────────────────────────────────────────────────────
export function owmIconToIonicons(iconCode) {
  const map = {
    '01d': 'sunny',         '01n': 'moon',
    '02d': 'partly-sunny',  '02n': 'cloudy-night',
    '03d': 'cloud',         '03n': 'cloud',
    '04d': 'cloudy',        '04n': 'cloudy',
    '09d': 'rainy',         '09n': 'rainy',
    '10d': 'rainy',         '10n': 'rainy',
    '11d': 'thunderstorm',  '11n': 'thunderstorm',
    '13d': 'snow',          '13n': 'snow',
    '50d': 'partly-sunny',  '50n': 'cloudy-night',
  };
  return map[iconCode] || 'cloud';
}

// ── Icon → color ──────────────────────────────────────────────────────────────
export function owmIconToColor(iconCode) {
  if (iconCode.startsWith('01')) return '#F9A825';
  if (iconCode.startsWith('02')) return '#FB8C00';
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return '#78909C';
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return '#1565C0';
  if (iconCode.startsWith('11')) return '#4527A0';
  if (iconCode.startsWith('13')) return '#90CAF9';
  return '#78909C';
}

// ── Hero gradient ─────────────────────────────────────────────────────────────
export function conditionToGradient(iconCode) {
  if (iconCode.startsWith('01')) return ['#0D47A1', '#1565C0', '#1976D2', '#42A5F5'];
  if (iconCode.startsWith('02')) return ['#1565C0', '#1976D2', '#42A5F5', '#90CAF9'];
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return ['#37474F', '#455A64', '#607D8B', '#90A4AE'];
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return ['#1A237E', '#283593', '#3949AB', '#5C6BC0'];
  if (iconCode.startsWith('11')) return ['#1A237E', '#311B92', '#4527A0', '#7B1FA2'];
  if (iconCode.startsWith('13')) return ['#546E7A', '#607D8B', '#78909C', '#B0BEC5'];
  return ['#0D47A1', '#1565C0', '#1976D2', '#42A5F5'];
}

// ── Condition → i18n key ──────────────────────────────────────────────────────
export function conditionToI18nKey(iconCode) {
  if (iconCode.startsWith('01')) return 'sunny';
  if (iconCode.startsWith('02')) return 'partlyCloudy';
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return 'cloudy';
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'rainy';
  if (iconCode.startsWith('11')) return 'thunderstorm';
  return 'cloudy';
}

// ─────────────────────────────────────────────────────────────────────────────
// getFarmerInsight — core logic function
// Returns: { insights[], alerts[] }
// Each insight: { key, icon, color, bg, border, priority }
// Each alert:   { key, titleKey, descKey, icon, colors, severity }
// ─────────────────────────────────────────────────────────────────────────────
export function getFarmerInsight(weatherData) {
  const { temp, humidity, windSpeed, rainChance, iconCode } = weatherData;
  const insights = [];
  const alerts   = [];

  const isRainy       = iconCode.startsWith('09') || iconCode.startsWith('10');
  const isThunder     = iconCode.startsWith('11');
  const isClear       = iconCode.startsWith('01');
  const isPartlyClear = iconCode.startsWith('02');

  // ── INSIGHTS (priority: high / medium / low) ─────────────────────────────
  if (isThunder) {
    insights.push({ key: 'thunderStay', icon: 'thunderstorm-outline', color: '#4527A0', bg: '#EDE7F6', border: '#B39DDB', priority: 'high' });
  }
  if (rainChance >= 50 || isRainy) {
    insights.push({ key: 'rainAvoidIrrig', icon: 'rainy-outline', color: '#1565C0', bg: '#E3F2FD', border: '#90CAF9', priority: 'high' });
  }
  if (temp > 38) {
    insights.push({ key: 'highTempIrrig', icon: 'thermometer-outline', color: '#BF360C', bg: '#FBE9E7', border: '#FFAB91', priority: 'high' });
  } else if (temp > 35) {
    insights.push({ key: 'highTempIrrig', icon: 'thermometer-outline', color: '#E65100', bg: '#FFF3E0', border: '#FFCC80', priority: 'medium' });
  }
  if (humidity > 85) {
    insights.push({ key: 'highHumidDisease', icon: 'bug-outline', color: '#6A1B9A', bg: '#F3E5F5', border: '#CE93D8', priority: 'high' });
  } else if (humidity > 70) {
    insights.push({ key: 'highHumidDisease', icon: 'bug-outline', color: '#6A1B9A', bg: '#F3E5F5', border: '#CE93D8', priority: 'medium' });
  }
  if (windSpeed > 40) {
    insights.push({ key: 'strongWind', icon: 'leaf-outline', color: '#C62828', bg: '#FFEBEE', border: '#EF9A9A', priority: 'high' });
  } else if (windSpeed > 20) {
    insights.push({ key: 'strongWind', icon: 'leaf-outline', color: '#C62828', bg: '#FFEBEE', border: '#EF9A9A', priority: 'medium' });
  }
  if (isClear || isPartlyClear) {
    insights.push({ key: 'clearHarvest', icon: 'sunny-outline', color: '#F57F17', bg: '#FFF8E1', border: '#FFE082', priority: 'low' });
  }
  if (humidity < 40 && isClear) {
    insights.push({ key: 'lowHumidSpray', icon: 'flask-outline', color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7', priority: 'low' });
  }

  // Sort: high → medium → low
  const ORDER = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => (ORDER[a.priority] ?? 2) - (ORDER[b.priority] ?? 2));

  // Fallback — always show at least 2
  if (insights.length === 0) {
    insights.push(
      { key: 'clearHarvest',  icon: 'sunny-outline',       color: '#F57F17', bg: '#FFF8E1', border: '#FFE082', priority: 'low' },
      { key: 'highTempIrrig', icon: 'thermometer-outline', color: '#E65100', bg: '#FFF3E0', border: '#FFCC80', priority: 'medium' },
    );
  } else if (insights.length === 1) {
    insights.push({ key: 'highTempIrrig', icon: 'thermometer-outline', color: '#E65100', bg: '#FFF3E0', border: '#FFCC80', priority: 'medium' });
  }

  // ── ALERTS ──────────────────────────────────────────────────────────────────
  if (isThunder) {
    alerts.push({ key: 'thunder', titleKey: 'alertThunder', descKey: 'alertThunderDesc', icon: 'thunderstorm', colors: ['#311B92', '#4527A0'], severity: 'critical' });
  }
  if (rainChance > 60 || isRainy) {
    alerts.push({ key: 'rain', titleKey: 'alertHeavyRain', descKey: 'alertHeavyRainDesc', icon: 'rainy', colors: ['#1565C0', '#1976D2'], severity: 'high' });
  }
  if (temp > 38) {
    alerts.push({ key: 'heat', titleKey: 'alertHeatwave', descKey: 'alertHeatwaveDesc', icon: 'thermometer', colors: ['#BF360C', '#D84315'], severity: 'high' });
  }
  if (windSpeed > 40) {
    alerts.push({ key: 'wind', titleKey: 'alertStrongWind', descKey: 'alertStrongWindDesc', icon: 'leaf', colors: ['#37474F', '#455A64'], severity: 'medium' });
  }
  if (humidity > 85) {
    alerts.push({ key: 'humidity', titleKey: 'alertHighHumidity', descKey: 'alertHighHumidityDesc', icon: 'water', colors: ['#1B5E20', '#2E7D32'], severity: 'medium' });
  }

  return { insights: insights.slice(0, 5), alerts };
}

// ── Legacy wrapper (keeps existing callers working) ───────────────────────────
export function generateFarmerInsights(current, forecast) {
  const iconCode   = current.weather[0].icon;
  const temp       = current.main.temp;
  const humidity   = current.main.humidity;
  const windSpeed  = current.wind.speed * 3.6;
  const rainChance = Math.round((forecast?.list?.[0]?.pop || 0) * 100);
  const { insights } = getFarmerInsight({ temp, humidity, windSpeed, rainChance, iconCode });
  return insights;
}

// ── Fetch current weather ─────────────────────────────────────────────────────
export async function fetchCurrentWeather(city = DEFAULT_CITY) {
  const url = `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const res  = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`Weather API ${res.status}: ${json.message || 'error'}`);
  return json;
}

// ── Fetch 5-day / 3-hour forecast ────────────────────────────────────────────
export async function fetchForecast(city = DEFAULT_CITY) {
  const url  = `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const res  = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`Forecast API ${res.status}: ${json.message || 'error'}`);
  return json;
}

// ── Map forecast → hourly (next 8 slots = 24h) ────────────────────────────────
export function mapHourly(forecastList) {
  return forecastList.slice(0, 8).map((item, i) => {
    const date  = new Date(item.dt * 1000);
    const hours = date.getHours();
    const ampm  = hours >= 12 ? 'PM' : 'AM';
    const h12   = hours % 12 || 12;
    return {
      time:  i === 0 ? 'Now' : `${h12} ${ampm}`,
      icon:  owmIconToIonicons(item.weather[0].icon),
      temp:  `${Math.round(item.main.temp)}°`,
      color: owmIconToColor(item.weather[0].icon),
    };
  });
}

// ── Map forecast → daily (next 7 days) ───────────────────────────────────────
export function mapDaily(forecastList) {
  const dayMap  = {};
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  forecastList.forEach(item => {
    const date    = new Date(item.dt * 1000);
    const dateStr = date.toDateString();
    if (!dayMap[dateStr]) {
      dayMap[dateStr] = {
        dayKey: `days.${DAY_KEYS[date.getDay()]}`,
        icon:   owmIconToIonicons(item.weather[0].icon),
        color:  owmIconToColor(item.weather[0].icon),
        temps:  [],
        rain:   item.pop || 0,
      };
    }
    dayMap[dateStr].temps.push(item.main.temp_min, item.main.temp_max);
    if ((item.pop || 0) > dayMap[dateStr].rain) dayMap[dateStr].rain = item.pop;
  });
  return Object.values(dayMap).slice(0, 7).map(d => ({
    dayKey:  d.dayKey,
    icon:    d.icon,
    color:   d.color,
    min:     `${Math.round(Math.min(...d.temps))}°`,
    max:     `${Math.round(Math.max(...d.temps))}°`,
    rainPct: `${Math.round(d.rain * 100)}%`,
  }));
}
