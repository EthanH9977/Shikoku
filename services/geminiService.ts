export interface WeatherResult {
  temperature: string;
  condition: string;
  advice: string;
  location: string;
  source: 'forecast' | 'historical' | 'error';
}

// Shikoku Coordinates for Weather API
const COORDINATES: Record<string, { lat: number; lng: number }> = {
  "高松": { lat: 34.3428, lng: 134.0466 }, // Takamatsu
  "鳴門": { lat: 34.1725, lng: 134.6115 }, // Naruto (Tokushima)
  "祖谷": { lat: 33.8767, lng: 133.8378 }, // Iya Valley (Miyoshi - approximate mountain area)
  "高知": { lat: 33.5588, lng: 133.5312 }, // Kochi
  "宇和島": { lat: 33.2233, lng: 132.5606 }, // Uwajima
  "道後溫泉": { lat: 33.8517, lng: 132.7856 }, // Dogo Onsen (Matsuyama)
  "松山": { lat: 33.8392, lng: 132.7656 }, // Matsuyama
  "觀音寺": { lat: 34.1284, lng: 133.6626 }, // Kanonji
  "丸龜": { lat: 34.2894, lng: 133.7977 }, // Marugame
  "琴平": { lat: 34.1914, lng: 133.8184 }, // Kotohira
  "返程": { lat: 34.2140, lng: 134.0195 }, // Takamatsu Airport approx
};

// Default historical data for February in Shikoku
const HISTORICAL_DATA: Record<string, { temp: string; cond: string; advice: string }> = {
  "default": { temp: "8°C", cond: "晴時多雲", advice: "二月四國仍有寒意，請準備保暖大衣。" },
  "高松": { temp: "9°C", cond: "晴朗", advice: "瀨戶內海氣候相對溫暖，海風稍大。" },
  "鳴門": { temp: "8°C", cond: "多雲", advice: "海邊風大，觀賞漩渦時請戴帽子。" },
  "祖谷": { temp: "4°C", cond: "陰有雪", advice: "山區氣溫極低，可能積雪，務必穿著羽絨衣。" },
  "高知": { temp: "11°C", cond: "晴朗", advice: "太平洋側陽光充足，白天舒適但早晚溫差大。" },
  "宇和島": { temp: "10°C", cond: "多雲", advice: "南部較為溫暖，適合散步。" },
  "道後溫泉": { temp: "8°C", cond: "多雲", advice: "泡湯後請注意別著涼。" },
  "松山": { temp: "9°C", cond: "晴時多雲", advice: "市區觀光建議洋蔥式穿搭。" },
  "丸龜": { temp: "9°C", cond: "晴朗", advice: "登丸龜城風大，請注意保暖。" },
};

// WMO Weather interpretation codes
const getWeatherDescription = (code: number): string => {
  if (code === 0) return "晴朗";
  if (code >= 1 && code <= 3) return "多雲";
  if (code >= 45 && code <= 48) return "有霧";
  if (code >= 51 && code <= 67) return "細雨";
  if (code >= 71 && code <= 77) return "降雪";
  if (code >= 80 && code <= 82) return "陣雨";
  if (code >= 95) return "雷雨";
  return "陰天";
};

export const fetchWeatherForLocation = async (location: string, dateStr: string): Promise<WeatherResult> => {
  // 1. Identify Location Key
  // Extract the Japanese part or key part of the location string (e.g. "高松 Takamatsu" -> "高松")
  let locKey = "default";
  for (const key of Object.keys(COORDINATES)) {
    if (location.includes(key)) {
      locKey = key;
      break;
    }
  }

  // 2. Calculate Date Difference
  const targetDate = new Date(dateStr);
  const today = new Date();
  
  // Reset hours to compare dates only
  targetDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  console.log(`Weather query: ${location} (${locKey}), Days diff: ${diffDays}`);

  // 3. Logic Branch
  
  // Branch A: Historical Data (Future > 10 days or Past)
  // Open-Meteo free tier provides forecast for up to ~14 days usually, but let's stick to 10 for safety.
  // It doesn't support easy "historical for this specific day next year" without paid archive API usually,
  // so we use static data for long-term planning.
  if (diffDays > 10 || diffDays < -2) {
     const data = HISTORICAL_DATA[locKey] || HISTORICAL_DATA["default"];
     return {
       location: location.split(' ')[0],
       temperature: data.temp,
       condition: data.cond,
       advice: data.advice,
       source: 'historical'
     };
  }

  // Branch B: Live Forecast (Within 10 days)
  try {
    const coords = COORDINATES[locKey] || COORDINATES["高松"];
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;
    
    const res = await fetch(apiUrl);
    const json = await res.json();
    
    // Find index for the target date
    // Open-Meteo returns daily arrays. We need to match the date string YYYY-MM-DD.
    const timeArray = json.daily.time as string[]; // ["2024-03-01", "2024-03-02", ...]
    const index = timeArray.findIndex(d => d === dateStr);

    if (index === -1) {
       // Date not covered by forecast (might be edge case), fallback to historical
       throw new Error("Date out of range for forecast");
    }

    const minT = Math.round(json.daily.temperature_2m_min[index]);
    const maxT = Math.round(json.daily.temperature_2m_max[index]);
    const wCode = json.daily.weather_code[index];
    const condText = getWeatherDescription(wCode);

    return {
      location: location.split(' ')[0],
      temperature: `${minT}°-${maxT}°`,
      condition: condText,
      advice: `即時預報：最高 ${maxT}°C，請依天氣調整行程。`,
      source: 'forecast'
    };

  } catch (error) {
    console.warn("Forecast API failed, falling back to historical", error);
    // Fallback logic identical to Branch A
    const data = HISTORICAL_DATA[locKey] || HISTORICAL_DATA["default"];
    return {
       location: location.split(' ')[0],
       temperature: data.temp,
       condition: data.cond,
       advice: data.advice,
       source: 'historical'
     };
  }
};