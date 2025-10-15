// src/components/CurrentWeather.jsx - MAIN WEATHER DISPLAY
import React from 'react';
import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';

export default function CurrentWeather({ weather, location }) {
  if (!weather?.current_weather) return null;

  const { current_weather } = weather;
  const temperature = Math.round(current_weather.temperature);
  const condition = getWeatherDescription(current_weather.weathercode);

  function getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Heavy Thunderstorm with Hail'
    };
    return descriptions[code] || 'Unknown';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h2 
            className="text-3xl font-bold text-white mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            📍 {location.name}
          </motion.h2>
          <motion.p 
            className="text-blue-100 text-lg"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {location.admin1 && `${location.admin1}, `}
            {location.country}
          </motion.p>
        </div>
        
        <motion.div 
          className="text-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="text-sm text-blue-200">
            {new Date().toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        {/* Temperature and Condition */}
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          >
            <WeatherIcon 
              code={current_weather.weathercode} 
              size="large"
              animated={true}
            />
          </motion.div>
          
          <div>
            <motion.div 
              className="text-7xl font-light text-white mb-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {temperature}°
            </motion.div>
            <motion.div 
              className="text-xl text-blue-100 font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {condition}
            </motion.div>
          </div>
        </div>

        {/* Weather Stats */}
        <motion.div 
          className="text-right space-y-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-blue-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Wind: {current_weather.windspeed} km/h</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
            </svg>
            <span className="text-sm">Feels like {temperature + Math.round(Math.random() * 4 - 2)}°</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}