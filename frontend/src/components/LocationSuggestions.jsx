// src/components/LocationSuggestions.jsx - SMART LOCATION SUGGESTIONS
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationSuggestions({ suggestions, showSuggestions, onSelect, onClose }) {
  if (!showSuggestions || !suggestions.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-full left-0 right-0 mt-2 z-20"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="p-4 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
              onClick={() => onSelect(suggestion)}
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Location icon */}
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div>
                      <motion.div 
                        className="font-semibold text-gray-800 text-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        {suggestion.name}
                      </motion.div>
                      <div className="text-sm text-gray-600">
                        {suggestion.display}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Priority badge for Indian locations */}
                {suggestion.priority === 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                    className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    <span>🇮🇳</span>
                    <span>India</span>
                  </motion.div>
                )}
                
                {/* Country flag/code */}
                {suggestion.priority !== 1 && suggestion.country && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {suggestion.country}
                  </div>
                )}
              </div>
              
              {/* Coordinates (for debugging/pro users) */}
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-4">
                <span>📍 {suggestion.latitude?.toFixed(2)}°, {suggestion.longitude?.toFixed(2)}°</span>
                <span className="text-blue-600">Click to select</span>
              </div>
            </motion.div>
          ))}
          
          {/* Footer */}
          <motion.div 
            className="p-3 bg-gray-50/80 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-gray-500">
              💡 Indian cities are automatically prioritized in search results
            </p>
          </motion.div>
        </div>
        
        {/* Backdrop to close suggestions */}
        <motion.div
          className="fixed inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      </motion.div>
    </AnimatePresence>
  );
}