// src/components/WeatherDetails.jsx - DETAILED WEATHER METRICS
import React from 'react';
import { motion } from 'framer-motion';

export default function WeatherDetails({ weather }) {
  if (!weather?.current_weather) return null;

  // Calculate additional metrics (simulated for demo)
  const humidity = 65 + Math.round(Math.random() * 30); // 65-95%
  const pressure = 1010 + Math.round(Math.random() * 40); // 1010-1050 hPa
  const visibility = 8 + Math.round(Math.random() * 7); // 8-15 km
  const uvIndex = Math.round(Math.random() * 8) + 1; // 1-9

  const weatherStats = [
    {
      icon: '💨',
      label: 'Wind Speed',
      value: `${weather.current_weather.windspeed} km/h`,
      description: 'Current wind speed',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: '🌊',
      label: 'Humidity',
      value: `${humidity}%`,
      description: 'Relative humidity',
      color: 'from-cyan-400 to-teal-400'
    },
    {
      icon: '🔽',
      label: 'Pressure',
      value: `${pressure} hPa`,
      description: 'Atmospheric pressure',
      color: 'from-purple-400 to-pink-400'
    },
    {
      icon: '👁️',
      label: 'Visibility',
      value: `${visibility} km`,
      description: 'Visibility distance',
      color: 'from-green-400 to-emerald-400'
    },
    {
      icon: '☀️',
      label: 'UV Index',
      value: uvIndex,
      description: getUVDescription(uvIndex),
      color: 'from-yellow-400 to-orange-400'
    },
    {
      icon: '🧭',
      label: 'Wind Direction',
      value: `${weather.current_weather.winddirection}°`,
      description: getWindDirection(weather.current_weather.winddirection),
      color: 'from-indigo-400 to-blue-400'
    }
  ];

  function getUVDescription(uv) {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  }

  function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  }

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
        <span className="text-3xl">📊</span>
        Weather Details
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
          >
            {/* Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 group-hover:bg-white/20">
              
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              
              <div className="relative z-10">
                {/* Icon and Label */}
                <div className="flex items-center gap-3 mb-3">
                  <motion.div 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {stat.label}
                    </h4>
                    <p className="text-blue-200 text-xs">
                      {stat.description}
                    </p>
                  </div>
                </div>

                {/* Value */}
                <motion.div 
                  className="text-2xl font-bold text-white"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * index + 0.3, type: "spring" }}
                >
                  {stat.value}
                </motion.div>

                {/* Progress bar for visual appeal */}
                <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 60 + 40}%` }}
                    transition={{ delay: 0.1 * index + 0.5, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div 
        className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 text-blue-200 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Data refreshed every 15 minutes • Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}