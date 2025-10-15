// src/components/LoadingSpinner.jsx - BEAUTIFUL LOADING ANIMATION WITH GLASSMORPHISM
import React from 'react';
import { motion } from 'framer-motion';

// Optionally, add 'condition' prop to theme the center icon (sun, rain, snow, etc)
export default function LoadingSpinner({ condition = "sunny" }) {
  // Choose emoji/icon based on condition
  const conditionIcons = {
    sunny: "🌤️",
    rain: "🌧️",
    snow: "❄️",
    thunder: "⛈️",
    fog: "🌫️",
    cloud: "☁️"
  };
  const icon = conditionIcons[condition] || "🌤️";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center py-16 relative"
    >
      {/* Glassmorphism blurred overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl z-0 pointer-events-none" />

      {/* Main Loading Container */}
      <div className="relative z-10">
        {/* Outer rotating ring */}
        <motion.div
          className="w-20 h-20 border-4 border-white/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner rotating ring */}
        <motion.div
          className="absolute inset-2 w-16 h-16 border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        {/* Center weather icon (animated) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <div className="text-3xl">{icon}</div>
        </motion.div>
        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400/20 blur-md"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Loading text */}
      <motion.div
        className="mt-6 text-center z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.h3 
          className="text-xl font-semibold text-white mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Fetching Weather Data
        </motion.h3>
        <motion.p 
          className="text-blue-200"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Getting the latest forecast from satellites...
        </motion.p>
        {/* Animated loading dots */}
        <div className="flex justify-center gap-1 mt-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Background particles (floating glass dots) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
