// src/components/WeeklyForecast.jsx - FULLY RESPONSIVE 7-DAY FORECAST
import React from 'react';
import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';

export default function WeeklyForecast({ weather }) {
  if (!weather?.daily) return null;

  // Get next 7 days of data
  const weeklyData = weather.daily.time.slice(0, 7).map((date, index) => ({
    date: new Date(date),
    maxTemp: Math.round(weather.daily.temperature_2m_max[index]),
    minTemp: Math.round(weather.daily.temperature_2m_min[index]),
    weathercode: weather.daily.weathercode[index]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 text-center sm:text-left">
        7-Day Forecast
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {weeklyData.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
          >
            {/* Day - Responsive sizing */}
            <div className="flex-shrink-0 w-16 sm:w-20 md:w-24">
              <p className="text-xs sm:text-sm md:text-base font-semibold text-white">
                {index === 0 ? 'Today' : day.date.toLocaleDateString('en-IN', { weekday: 'short' })}
              </p>
              <p className="text-[10px] sm:text-xs text-blue-200">
                {day.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            {/* Weather Icon - Responsive sizing */}
            <div className="flex-shrink-0">
              <WeatherIcon 
                code={day.weathercode} 
                size={window.innerWidth < 640 ? 28 : window.innerWidth < 768 ? 36 : 44} 
                animated={true}
              />
            </div>

            {/* Weather condition - Hide on very small screens */}
            <div className="hidden xs:block flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-blue-100 truncate">
                {getWeatherDescription(day.weathercode)}
              </p>
            </div>

            {/* Temperature Range - Responsive layout */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Temperature bar - Responsive sizing */}
              <div className="hidden sm:block w-16 md:w-24 h-1.5 md:h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((day.maxTemp - day.minTemp) / 30) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                />
              </div>

              {/* Min/Max temperatures - Responsive text */}
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[70px] md:min-w-[80px]">
                <span className="text-xs sm:text-sm md:text-base text-blue-200 font-medium w-7 sm:w-8 text-right">
                  {day.minTemp}°
                </span>
                <span className="text-sm sm:text-base md:text-lg text-white font-bold w-7 sm:w-9 text-right">
                  {day.maxTemp}°
                </span>
              </div>

              {/* Arrow indicator - Responsive sizing */}
              <div className="hidden md:block text-white/60 text-xs">
                {day.maxTemp > 25 ? '↑' : day.maxTemp < 15 ? '↓' : '→'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary - Responsive text */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
        <p className="text-xs sm:text-sm text-blue-100 text-center">
          Weekly outlook: {getWeeklyTrend(weeklyData)} • Forecast confidence: High
        </p>
      </div>
    </motion.div>
  );
}

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

function getWeeklyTrend(data) {
  const avgTemp = data.reduce((sum, day) => sum + ((day.maxTemp + day.minTemp) / 2), 0) / data.length;
  const rainDays = data.filter(day => day.weathercode >= 51 && day.weathercode <= 67).length;

  if (rainDays >= 4) return 'Rainy week ahead';
  if (avgTemp > 25) return 'Warm temperatures expected';
  if (avgTemp < 15) return 'Cool weather continuing';
  return 'Pleasant conditions expected';
}
