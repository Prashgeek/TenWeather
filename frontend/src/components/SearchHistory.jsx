// src/components/SearchHistory.jsx - SEARCH HISTORY DROPDOWN (OPTIMIZED FOR ALL DEVICES)

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeatherIcon from './WeatherIcon';

export default function SearchHistory({ history, onSelect, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (history.length === 0) return null;

  function getWeatherDescription(code) {
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  }

  function formatLocationName(item) {
    if (item.admin1 && item.country) {
      return `${item.name}, ${item.admin1}`;
    } else if (item.country) {
      return `${item.name}, ${item.country}`;
    }
    return item.name;
  }

  return (
    <div ref={dropdownRef} className="fixed top-3 sm:top-4 left-3 sm:left-4 z-40">
      {/* Toggle Button - Responsive */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-xl text-white shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span className="text-xs sm:text-sm font-medium hidden xs:inline">Recent</span>
        <motion.svg
          className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </motion.button>

      {/* Dropdown Menu - Fully Responsive */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-[calc(100vw-1.5rem)] xs:w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header - Responsive */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10">
              <h3 className="text-xs sm:text-sm font-semibold text-white">Search History</h3>
              {history.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="text-[10px] sm:text-xs text-blue-200 hover:text-white transition-colors duration-200 flex-shrink-0"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* History List - Responsive with optimized scroll */}
            <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
              {history.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/10 active:bg-white/15 transition-all duration-200 flex items-center gap-2 sm:gap-3 border-b border-white/5 last:border-b-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Weather Icon - Responsive size */}
                  <div className="flex-shrink-0">
                    <WeatherIcon code={item.weathercode} size={28} className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" />
                  </div>

                  {/* Location and Weather Info - Responsive with overflow handling */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">
                      {formatLocationName(item)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-200 truncate">
                      {getWeatherDescription(item.weathercode)}
                    </p>
                  </div>

                  {/* Temperature - Responsive size */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {item.temperature}°
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer Note - Responsive */}
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border-t border-white/10">
              <p className="text-[9px] xs:text-[10px] sm:text-2xs text-blue-200/70 text-center">
                Click any location to view weather
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles - Enhanced for mobile */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Mobile touch scrolling */
        .custom-scrollbar {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}