// Vercel Serverless Function for Weather API using Open-Meteo (Free, No API Key needed)

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { location, dateStr } = req.body;

        if (!location || !dateStr) {
            return res.status(400).json({ error: 'Missing location or dateStr' });
        }

        // Step 1: Geocode the location to get coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=zh&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error('Geocoding failed');
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Location not found');
        }

        const { latitude, longitude } = geoData.results[0];

        // Step 2: Get weather data
        const targetDate = new Date(dateStr);
        const today = new Date();
        const isFuture = targetDate > today;

        let weatherData;

        if (isFuture) {
            // Use forecast API (up to 16 days)
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=16`
            );

            if (!weatherResponse.ok) {
                throw new Error('Weather forecast failed');
            }

            weatherData = await weatherResponse.json();
        } else {
            // Use historical API (past dates)
            const formattedDate = dateStr;
            const weatherResponse = await fetch(
                `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${formattedDate}&end_date=${formattedDate}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
            );

            if (!weatherResponse.ok) {
                throw new Error('Historical weather failed');
            }

            weatherData = await weatherResponse.json();
        }

        // Parse weather data
        const dateIndex = weatherData.daily.time.indexOf(dateStr);

        if (dateIndex === -1) {
            // Date not found, use the first available data
            const tempMax = weatherData.daily.temperature_2m_max[0];
            const tempMin = weatherData.daily.temperature_2m_min[0];
            const weatherCode = weatherData.daily.weathercode[0];

            return res.status(200).json({
                temperature: `${Math.round(tempMin)}°C - ${Math.round(tempMax)}°C`,
                condition: getWeatherCondition(weatherCode),
                advice: getWeatherAdvice(weatherCode, tempMax),
                source: isFuture ? 'forecast' : 'historical'
            });
        }

        const tempMax = weatherData.daily.temperature_2m_max[dateIndex];
        const tempMin = weatherData.daily.temperature_2m_min[dateIndex];
        const weatherCode = weatherData.daily.weathercode[dateIndex];

        return res.status(200).json({
            temperature: `${Math.round(tempMin)}°C - ${Math.round(tempMax)}°C`,
            condition: getWeatherCondition(weatherCode),
            advice: getWeatherAdvice(weatherCode, tempMax),
            source: isFuture ? 'forecast' : 'historical'
        });

    } catch (error) {
        console.error('Weather API error:', error);
        return res.status(200).json({
            temperature: '--',
            condition: '無法取得',
            advice: '',
            source: 'historical'
        });
    }
}

// Helper: Convert WMO weather code to Chinese description
function getWeatherCondition(code) {
    const weatherCodes = {
        0: '晴天',
        1: '大致晴朗',
        2: '部分多雲',
        3: '多雲',
        45: '有霧',
        48: '霧淞',
        51: '小雨',
        53: '中雨',
        55: '大雨',
        61: '小陣雨',
        63: '中陣雨',
        65: '大陣雨',
        71: '小雪',
        73: '中雪',
        75: '大雪',
        77: '雪粒',
        80: '陣雨',
        81: '中陣雨',
        82: '大陣雨',
        85: '陣雪',
        86: '大陣雪',
        95: '雷雨',
        96: '雷雨夾冰雹',
        99: '強雷雨夾冰雹'
    };

    return weatherCodes[code] || '未知';
}

// Helper: Generate travel advice based on weather
function getWeatherAdvice(code, tempMax) {
    if (code >= 95) return '有雷雨風險，注意安全';
    if (code >= 71) return '天氣寒冷，注意保暖';
    if (code >= 61) return '記得攜帶雨具';
    if (tempMax > 30) return '天氣炎熱，注意防曬';
    if (tempMax < 10) return '氣溫較低，多穿衣物';
    if (code <= 1) return '天氣晴朗，適合戶外活動';
    return '天氣穩定，適合旅遊';
}
