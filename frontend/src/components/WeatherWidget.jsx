import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ latitude = 18.5204, longitude = 73.8567 }) => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch weather data');
                }

                const data = await response.json();
                setWeatherData(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [latitude, longitude]);

    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 3) return '⛅';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 57) return '🌧️';
        if (code >= 61 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 80 && code <= 82) return '🌦️';
        if (code >= 85 && code <= 86) return '🌨️';
        if (code >= 95 && code <= 99) return '⛈️';
        return '🌤️';
    };

    const getWeatherDescription = (code) => {
        if (code === 0) return 'Clear';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 45 && code <= 48) return 'Foggy';
        if (code >= 51 && code <= 57) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Showers';
        if (code >= 85 && code <= 86) return 'Snow Showers';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Cloudy';
    };

    const getDayName = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>🌾 7-Day Farm Forecast</h2>
                    <p style={styles.subtitle}>Planning ahead for better yields</p>
                </div>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading weather data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>🌾 7-Day Farm Forecast</h2>
                </div>
                <div style={styles.errorContainer}>
                    <span style={styles.errorIcon}>⚠️</span>
                    <p style={styles.errorText}>Unable to load weather data</p>
                    <p style={styles.errorSubtext}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🌾 7-Day Farm Forecast</h2>
                <p style={styles.subtitle}>Planning ahead for better yields</p>
            </div>

            <div style={styles.forecastGrid}>
                {weatherData.daily.time.map((date, index) => (
                    <div key={index} style={styles.dayCard}>
                        <div style={styles.dayName}>{getDayName(date)}</div>
                        <div style={styles.weatherIcon}>
                            {getWeatherIcon(weatherData.daily.weathercode[index])}
                        </div>
                        <div style={styles.weatherDesc}>
                            {getWeatherDescription(weatherData.daily.weathercode[index])}
                        </div>
                        <div style={styles.tempContainer}>
                            <div style={styles.tempMax}>
                                <span style={styles.tempLabel}>High</span>
                                <span style={styles.tempValue}>
                                    {Math.round(weatherData.daily.temperature_2m_max[index])}°
                                </span>
                            </div>
                            <div style={styles.tempMin}>
                                <span style={styles.tempLabel}>Low</span>
                                <span style={styles.tempValue}>
                                    {Math.round(weatherData.daily.temperature_2m_min[index])}°
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
        maxWidth: '100%',
        margin: '0 auto',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    header: {
        marginBottom: '24px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '16px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '0 0 8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#666',
        margin: 0,
        fontWeight: '400',
    },
    forecastGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
    },
    dayCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid #e9ecef',
    },
    dayName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '12px',
        textTransform: 'capitalize',
    },
    weatherIcon: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    weatherDesc: {
        fontSize: '13px',
        color: '#718096',
        marginBottom: '12px',
        fontWeight: '500',
    },
    tempContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid #e2e8f0',
    },
    tempMax: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    tempMin: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    tempLabel: {
        fontSize: '11px',
        color: '#a0aec0',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tempValue: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#2d3748',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f0f0f0',
        borderTop: '4px solid #4CAF50',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: '#666',
        fontSize: '14px',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
    },
    errorIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 8px 0',
    },
    errorSubtext: {
        color: '#666',
        fontSize: '14px',
        margin: 0,
    },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .weather-widget-container {
      padding: 16px;
    }
  }
  
  @media (hover: hover) {
    .day-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      background-color: #ffffff !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default WeatherWidget;
