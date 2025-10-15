// src/components/HourlyForecast.jsx - HOURLY WEATHER FORECAST
import React from 'react';
import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';

export default function HourlyForecast({ weather }) {
  if (!weather?.hourly) return null;

  // Get next 24 hours of data
  const hourlyData = weather.hourly.time.slice(0, 24).map((time, index) => ({
    time: new Date(time),
    temperature: Math.round(weather.hourly.temperature_2m[index]),
    weathercode: weather.hourly.weathercode[index],
    precipitation: weather.hourly.precipitation ? weather.hourly.precipitation[index] : 0,
    windspeed: weather.hourly.windspeed_10m ? weather.hourly.windspeed_10m[index] : 0
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
    >
      <motion.h3 
        className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <span className="text-3xl">⏰</span>
        24-Hour Forecast
      </motion.h3>

      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {hourlyData.map((hour, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 * index, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] group hover:bg-white/20 transition-all duration-300"
            >
              {/* Time */}
              <div className="text-center mb-3">
                <div className="text-blue-200 text-sm font-medium">
                  {index === 0 ? 'Now' : hour.time.toLocaleTimeString('en-IN', { 
                    hour: 'numeric',
                    hour12: true 
                  })}
                </div>
                {index === 0 && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mt-1" />
                )}
              </div>

              {/* Weather Icon */}
              <div className="flex justify-center mb-3">
                <WeatherIcon 
                  code={hour.weathercode} 
                  size="small" 
                  animated={index < 6} // Only animate first 6 hours for performance
                />
              </div>

              {/* Temperature */}
              <motion.div 
                className="text-center text-white font-bold text-lg mb-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05 * index + 0.2, type: "spring" }}
              >
                {hour.temperature}°
              </motion.div>

              {/* Additional info */}
              <div className="text-center space-y-1">
                {/* Precipitation */}
                {hour.precipitation > 0 && (
                  <motion.div 
                    className="flex items-center justify-center gap-1 text-blue-200 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 * index + 0.3 }}
                  >
                    <span>💧</span>
                    <span>{hour.precipitation.toFixed(1)}mm</span>
                  </motion.div>
                )}

                {/* Wind speed */}
                <motion.div 
                  className="flex items-center justify-center gap-1 text-blue-200 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * index + 0.4 }}
                >
                  <span>💨</span>
                  <span>{Math.round(hour.windspeed)} km/h</span>
                </motion.div>
              </div>

              {/* Highlight current hour */}
              {index === 0 && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-blue-400/50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="flex justify-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 text-blue-200 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span>Scroll to see more hours</span>
        </div>
      </motion.div>
    </motion.div>
  );
}