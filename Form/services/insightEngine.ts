import farmerInsights from '../data/farmerInsights.json';

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  weatherType: string; // e.g., "Clear", "Rain", "Thunderstorm", "Fog"
}

export type Priority = 'high' | 'medium' | 'low';

export interface InsightMessage {
  en: string;
  hi: string;
  gu: string;
}

export interface Condition {
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  windSpeedMin?: number;
  windSpeedMax?: number;
  weather?: string[];
}

export interface Insight {
  id: string;
  condition: Condition;
  priority: Priority;
  messages: InsightMessage;
}

export interface MatchedInsight {
  id: string;
  priority: Priority;
  message: string;
}

/**
 * Checks if current weather matches the insight condition.
 */
function isConditionMet(condition: Condition, weatherData: WeatherData): boolean {
  if (condition.tempMin !== undefined && weatherData.temp < condition.tempMin) return false;
  if (condition.tempMax !== undefined && weatherData.temp > condition.tempMax) return false;
  
  if (condition.humidityMin !== undefined && weatherData.humidity < condition.humidityMin) return false;
  if (condition.humidityMax !== undefined && weatherData.humidity > condition.humidityMax) return false;
  
  if (condition.windSpeedMin !== undefined && weatherData.windSpeed < condition.windSpeedMin) return false;
  if (condition.windSpeedMax !== undefined && weatherData.windSpeed > condition.windSpeedMax) return false;
  
  if (condition.weather !== undefined && !condition.weather.includes(weatherData.weatherType)) return false;
  
  return true;
}

/**
 * Get farmer insights based on current weather data.
 * @param weatherData Current weather observation
 * @param language Preferred language code ('en', 'hi', 'gu')
 * @param limit Maximum number of insights to return
 * @returns Array of matched and localized insights
 */
export function getFarmerInsights(
  weatherData: WeatherData,
  language: 'en' | 'hi' | 'gu' = 'en',
  limit: number = 5
): MatchedInsight[] {
  const matchedInsights: Insight[] = [];

  for (const insight of farmerInsights as Insight[]) {
    if (isConditionMet(insight.condition, weatherData)) {
      matchedInsights.push(insight);
    }
  }

  // Priority mapping for sorting
  const priorityScore = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Sort by priority (high -> low)
  matchedInsights.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

  // Map to the requested output format and limit
  return matchedInsights.slice(0, limit).map((insight) => ({
    id: insight.id,
    priority: insight.priority,
    message: insight.messages[language] || insight.messages['en'], // Fallback to English
  }));
}
