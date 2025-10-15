// src/components/SearchBar.jsx - FIXED INPUT HOVER OVERLAP ISSUE
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch, loading, onInputChange }) {
  const [q, setQ] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    onSearch(q.trim());
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setQ(value);

    // Debounce suggestions
    if (onInputChange) {
      clearTimeout(handleInputChange.timeoutId);
      handleInputChange.timeoutId = setTimeout(() => {
        onInputChange(value);
      }, 300);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative"
    >
      <motion.form
        onSubmit={submit}
        className="relative"
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative flex items-center">
          {/* Search Input Wrapper */}
          <motion.div
            className="flex-1 relative rounded-2xl overflow-hidden"
            whileFocus={{ scale: 1.01 }}
          >
            {/* Glowing effect inside wrapper to avoid bleed */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20"
              animate={{
                opacity: isFocused ? 1 : 0,
                scale: isFocused ? 1 : 1,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Actual input */}
            <input
              type="text"
              value={q}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search for any city worldwide..."
              disabled={loading}
              className="relative w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              autoComplete="off"
            />
          </motion.div>

          {/* Search Button */}
          <motion.button
            type="submit"
            disabled={loading || !q.trim()}
            className="ml-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </div>
          </motion.button>
        </div>
      </motion.form>

      {/* Helpful hints */}
      <motion.div
        className="mt-3 flex flex-wrap gap-2 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {['Mumbai', 'London', 'New York', 'Tokyo', 'Goa'].map((city, index) => (
          <motion.button
            key={city}
            onClick={() => {
              setQ(city);
              onSearch(city);
            }}
            className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-blue-100 rounded-full transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
          >
            {city}
          </motion.button>
        ))}
      </motion.div>

      {/* Clean tip without icons */}
      <motion.p
        className="text-center text-blue-200 text-sm mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
              </motion.p>
    </motion.div>
  );
}
