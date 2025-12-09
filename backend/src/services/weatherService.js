const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

/**
 * Convert location name to coordinates
 */
async function getCoordinates(location) {
    // Validate location
    if (!location || typeof location !== 'string' || !location.trim()) {
        console.log(`Invalid location "${location}", using Delhi as fallback`);
        return { lat: 28.6139, lon: 77.2090, name: 'Delhi' };
    }

    try {
        // First attempt with full location
        let response = await axios.get(GEO_URL, {
            params: {
                q: `${location},IN`, // Assuming India
                limit: 1,
                appid: WEATHER_API_KEY
            }
        });

        if (response.data.length > 0) {
            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon,
                name: response.data[0].name
            };
        }

        // If full location fails, try simplifying (e.g., "City, District, State" -> "City")
        if (location.includes(',')) {
            const simplifiedLocation = location.split(',')[0].trim();
            console.log(`Full location not found, retrying with simplified: "${simplifiedLocation}"`);

            response = await axios.get(GEO_URL, {
                params: {
                    q: `${simplifiedLocation},IN`,
                    limit: 1,
                    appid: WEATHER_API_KEY
                }
            });

            if (response.data.length > 0) {
                return {
                    lat: response.data[0].lat,
                    lon: response.data[0].lon,
                    name: response.data[0].name
                };
            }
        }

        // Fallback to major city coordinates if location not found
        console.log(`Location "${location}" not found, using Delhi as fallback`);
        return { lat: 28.6139, lon: 77.2090, name: 'Delhi' };
    } catch (error) {
        // If 404 or other error, try simplified location if we haven't already
        if (location.includes(',')) {
            try {
                const simplifiedLocation = location.split(',')[0].trim();
                console.log(`Geocoding error for full location, retrying with: "${simplifiedLocation}"`);

                const response = await axios.get(GEO_URL, {
                    params: {
                        q: `${simplifiedLocation},IN`,
                        limit: 1,
                        appid: WEATHER_API_KEY
                    }
                });

                if (response.data.length > 0) {
                    return {
                        lat: response.data[0].lat,
                        lon: response.data[0].lon,
                        name: response.data[0].name
                    };
                }
            } catch (retryError) {
                console.error('Retry failed:', retryError.message);
            }
        }

        if (error.response && error.response.status === 404) {
            console.log(`Location "${location}" not found (404), using Delhi as fallback`);
        } else {
            console.error('Geocoding error:', error.message);
        }
        return { lat: 28.6139, lon: 77.2090, name: 'Delhi' };
    }
}

/**
 * Get coordinates from IP address
 */
async function getCoordinatesFromIP() {
    try {
        const response = await axios.get('https://ipapi.co/json/');

        // Enforce India-only restriction for this app
        if (response.data.country_code !== 'IN') {
            console.warn(`[Weather] Detected non-Indian IP Location: ${response.data.city}, ${response.data.country_name}. Defaulting to Delhi.`);
            return { lat: 28.6139, lon: 77.2090, name: 'Delhi (Fallback)' };
        }

        return {
            lat: response.data.latitude,
            lon: response.data.longitude,
            name: response.data.city || response.data.region || 'Unknown'
        };
    } catch (error) {
        console.error('IP geolocation error:', error.message);
        // Fallback to Delhi
        return { lat: 28.6139, lon: 77.2090, name: 'Delhi' };
    }
}

/**
 * Fetch weather data using FREE Current Weather API 2.5
 * @param {Object} locationOrCoords - Can be string (location name) or {lat, lon}
 */
async function getWeatherData(locationOrCoords) {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key') {
        console.warn('Weather API key not configured, using mock data');
        return getMockWeatherData();
    }

    try {
        let coords;

        // Check if coordinates provided directly
        if (typeof locationOrCoords === 'object' && locationOrCoords.lat && locationOrCoords.lon) {
            coords = {
                lat: locationOrCoords.lat,
                lon: locationOrCoords.lon,
                name: locationOrCoords.name || 'User Location'
            };
            console.log('Using provided coordinates:', coords);
        } else {
            // Location name provided - geocode it
            coords = await getCoordinates(locationOrCoords);
        }

        // Use FREE Current Weather API 2.5 (no subscription needed!)
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat: coords.lat,
                lon: coords.lon,
                units: 'metric',
                appid: WEATHER_API_KEY
            }
        });

        const data = response.data;
        console.log('✅ Real weather fetched for:', coords.name || data.name);

        // Calculate rain probability from available data
        let rainProbability = 0;
        if (data.rain && data.rain['1h']) {
            // If raining, probability is high
            rainProbability = 80;
        } else if (data.clouds && data.clouds.all) {
            // Estimate from cloud coverage (rough approximation)
            rainProbability = Math.min(data.clouds.all * 0.6, 60);
        }

        return {
            location: coords.name || data.name,
            coordinates: { lat: coords.lat, lon: coords.lon },
            current: {
                temp: Math.round(data.main.temp),
                humidity: data.main.humidity,
                weather: data.weather[0].description,
                weatherMain: data.weather[0].main,
                windSpeed: data.wind.speed,
                rainProbability: Math.round(rainProbability)
            },
            // Simplified forecast (free API doesn't provide forecast, so use current as estimate)
            forecast: Array(7).fill(null).map((_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
                tempMin: Math.round(data.main.temp_min),
                tempMax: Math.round(data.main.temp_max),
                rainProbability: Math.round(rainProbability),
                weather: data.weather[0].description,
                weatherMain: data.weather[0].main
            })),
            alerts: [] // Free API doesn't provide alerts
        };
    } catch (error) {
        console.error('Weather API error:', error.message);
        // Return mock data on error
        return getMockWeatherData();
    }
}

/**
 * Mock weather data (fallback when API unavailable)
 */
function getMockWeatherData() {
    return {
        location: 'Demo Location',
        current: {
            temp: 28,
            humidity: 65,
            weather: 'partly cloudy',
            weatherMain: 'Clouds',
            windSpeed: 3.5,
            rainProbability: 20
        },
        forecast: Array(7).fill(null).map((_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
            tempMin: 20 + i,
            tempMax: 30 + i,
            rainProbability: 20,
            weather: 'clear sky',
            weatherMain: 'Clear'
        })),
        alerts: []
    };
}

/**
 * Get weather summary formatted for AI
 */
function getWeatherSummary(weatherData) {
    const { current, forecast, alerts } = weatherData;

    let summary = `Current weather: ${current.temp}°C, ${current.humidity}% humidity, ${current.weather}. `;
    summary += `Wind: ${current.windSpeed} m/s. `;
    summary += `Rain probability: ${current.rainProbability.toFixed(0)}%. `;

    // Next 3 days forecast estimate
    const next3Days = forecast.slice(0, 3);
    summary += `Forecast estimate for next 3 days: `;
    next3Days.forEach((day, i) => {
        const date = new Date(day.date);
        summary += `Day ${i + 1}: ${day.tempMin}-${day.tempMax}°C, ${day.weather}. `;
    });

    // Weather alerts
    if (alerts.length > 0) {
        summary += `⚠️ WEATHER ALERTS: `;
        alerts.forEach(alert => {
            summary += `${alert.event} - ${alert.description}. `;
        });
    }

    return summary;
}

/**
 * Determine if weather requires special mission type
 */
function getWeatherBasedMissionType(weatherData) {
    const { current, alerts, forecast } = weatherData;

    // Critical weather alerts
    if (alerts.length > 0) {
        return {
            type: 'WEATHER_ALERT',
            urgency: 'CRITICAL',
            suggestion: `Weather alert: ${alerts[0].event}`,
            details: alerts[0].description
        };
    }

    // Extreme heat
    if (current.temp > 35) {
        return {
            type: 'HEAT_PROTECTION',
            urgency: 'HIGH',
            suggestion: 'Extreme heat - protect crops with shade/mulching'
        };
    }

    // Heavy rain expected (>70% in next day)
    if (forecast[0].rainProbability > 70) {
        return {
            type: 'RAIN_PREPARATION',
            urgency: 'HIGH',
            suggestion: 'Heavy rain expected - prepare drainage and cover'
        };
    }

    // Low humidity (drought risk)
    if (current.humidity < 30) {
        return {
            type: 'IRRIGATION_URGENT',
            urgency: 'MEDIUM',
            suggestion: 'Low humidity - increase irrigation'
        };
    }

    // High humidity (disease risk)
    if (current.humidity > 85) {
        return {
            type: 'DISEASE_PREVENTION',
            urgency: 'MEDIUM',
            suggestion: 'High humidity - monitor for fungal diseases'
        };
    }

    return null;
}

module.exports = {
    getWeatherData,
    getWeatherSummary,
    getCoordinates,
    getCoordinatesFromIP,
    getWeatherBasedMissionType
};
