// src/components/WeatherIcon.jsx - REALISTIC ICONS WITH ENVIRONMENT INTERACTION
import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  Wind,
  Cloudy,
  CloudSun
} from 'lucide-react';

export default function WeatherIcon({ code = 0, size = 48, animated = true, className = "" }) {
  const iconData = getIconData(Number(code));
  
  const Icon = iconData.component;
  
  const iconStyle = {
    width: size,
    height: size,
    color: iconData.color,
    filter: `drop-shadow(0 2px 8px ${iconData.color}40)`,
    // Add environment glow effect
    ...(iconData.glow && {
      filter: `drop-shadow(0 0 ${size * 0.3}px ${iconData.color}) drop-shadow(0 2px 8px ${iconData.color}40)`
    })
  };

  if (!animated) {
    return <Icon style={iconStyle} className={className} strokeWidth={1.5} />;
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        opacity: 1
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={`relative ${className}`}
    >
      {/* Animated glow/pulse effect for weather environment */}
      {iconData.glow && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, ${iconData.color}30 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'scale(1.8)'
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1.6, 2, 1.6]
          }}
          transition={{
            duration: iconData.glowDuration || 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Main icon with animation */}
      <motion.div
        animate={iconData.animation}
        transition={{
          duration: iconData.duration || 2,
          repeat: Infinity,
          repeatType: iconData.repeatType || "reverse",
          ease: "easeInOut"
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Icon style={iconStyle} strokeWidth={1.5} />
      </motion.div>

      {/* Additional particles/effects for environmental interaction */}
      {iconData.particles && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: iconData.particleCount || 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: size * 0.1,
                height: size * 0.1,
                background: iconData.particleColor,
                borderRadius: '50%',
                left: `${20 + i * 25}%`,
                top: `${10 + i * 15}%`
              }}
              animate={{
                y: [0, size * 0.5, 0],
                opacity: [0.8, 0.2, 0.8],
                scale: [1, 0.5, 1]
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function getIconData(code) {
  const iconMap = {
    0: {
      // Clear Sky - with sun glow
      component: Sun,
      color: '#FDB813',
      animation: { rotate: [0, 360] },
      duration: 30,
      repeatType: "loop",
      glow: true,
      glowDuration: 4
    },
    1: {
      // Mainly Clear
      component: CloudSun,
      color: '#FDB813',
      animation: { x: [0, 8, 0], y: [0, -3, 0] },
      duration: 5,
      glow: true,
      glowDuration: 5
    },
    2: {
      // Partly Cloudy
      component: Cloudy,
      color: '#87CEEB',
      animation: { x: [0, 15, 0] },
      duration: 6
    },
    3: {
      // Overcast
      component: Cloud,
      color: '#9CA3AF',
      animation: { x: [0, 10, 0], opacity: [0.8, 1, 0.8] },
      duration: 5
    },
    45: {
      // Fog
      component: CloudFog,
      color: '#B0B0B0',
      animation: { opacity: [0.4, 0.8, 0.4], x: [0, 5, 0] },
      duration: 4,
      particles: true,
      particleCount: 4,
      particleColor: 'rgba(176, 176, 176, 0.3)'
    },
    48: {
      // Depositing Rime Fog
      component: CloudFog,
      color: '#C0C0C0',
      animation: { opacity: [0.5, 1, 0.5] },
      duration: 3
    },
    51: {
      // Light Drizzle
      component: CloudDrizzle,
      color: '#60A5FA',
      animation: { y: [0, 4, 0] },
      duration: 2,
      particles: true,
      particleCount: 3,
      particleColor: 'rgba(96, 165, 250, 0.5)'
    },
    53: {
      // Moderate Drizzle
      component: CloudDrizzle,
      color: '#3B82F6',
      animation: { y: [0, 5, 0] },
      duration: 1.8,
      particles: true,
      particleCount: 4,
      particleColor: 'rgba(59, 130, 246, 0.6)'
    },
    55: {
      // Dense Drizzle
      component: CloudDrizzle,
      color: '#2563EB',
      animation: { y: [0, 6, 0] },
      duration: 1.5,
      particles: true,
      particleCount: 5,
      particleColor: 'rgba(37, 99, 235, 0.7)'
    },
    61: {
      // Slight Rain
      component: CloudRain,
      color: '#60A5FA',
      animation: { y: [0, 6, 0] },
      duration: 1.5,
      particles: true,
      particleCount: 5,
      particleColor: 'rgba(96, 165, 250, 0.6)'
    },
    63: {
      // Moderate Rain
      component: CloudRain,
      color: '#3B82F6',
      animation: { y: [0, 8, 0] },
      duration: 1.2,
      particles: true,
      particleCount: 6,
      particleColor: 'rgba(59, 130, 246, 0.7)'
    },
    65: {
      // Heavy Rain
      component: CloudRain,
      color: '#1E40AF',
      animation: { y: [0, 10, 0], x: [0, -2, 0] },
      duration: 1,
      particles: true,
      particleCount: 8,
      particleColor: 'rgba(30, 64, 175, 0.8)'
    },
    66: {
      // Light Freezing Rain
      component: CloudRain,
      color: '#93C5FD',
      animation: { y: [0, 6, 0], rotate: [0, 5, -5, 0] },
      duration: 1.5,
      particles: true,
      particleCount: 4,
      particleColor: 'rgba(147, 197, 253, 0.6)'
    },
    67: {
      // Heavy Freezing Rain
      component: CloudRain,
      color: '#60A5FA',
      animation: { y: [0, 8, 0], rotate: [0, 5, -5, 0] },
      duration: 1.2,
      particles: true,
      particleCount: 6,
      particleColor: 'rgba(96, 165, 250, 0.7)'
    },
    71: {
      // Slight Snow
      component: CloudSnow,
      color: '#E0F2FE',
      animation: { y: [0, 12, 0], rotate: [0, 360] },
      duration: 5,
      repeatType: "loop",
      particles: true,
      particleCount: 4,
      particleColor: 'rgba(224, 242, 254, 0.8)'
    },
    73: {
      // Moderate Snow
      component: CloudSnow,
      color: '#BAE6FD',
      animation: { y: [0, 15, 0], rotate: [0, 360] },
      duration: 4,
      repeatType: "loop",
      particles: true,
      particleCount: 6,
      particleColor: 'rgba(186, 230, 253, 0.9)'
    },
    75: {
      // Heavy Snow
      component: CloudSnow,
      color: '#7DD3FC',
      animation: { y: [0, 18, 0], rotate: [0, 360], x: [0, -3, 0] },
      duration: 3.5,
      repeatType: "loop",
      particles: true,
      particleCount: 8,
      particleColor: 'rgba(125, 211, 252, 1)'
    },
    77: {
      // Snow Grains
      component: CloudSnow,
      color: '#DBEAFE',
      animation: { y: [0, 10, 0], scale: [1, 1.1, 1] },
      duration: 2.5,
      particles: true,
      particleCount: 5,
      particleColor: 'rgba(219, 234, 254, 0.8)'
    },
    80: {
      // Slight Rain Showers
      component: CloudRain,
      color: '#60A5FA',
      animation: { y: [0, 7, 0], scale: [1, 1.05, 1] },
      duration: 1.3,
      particles: true,
      particleCount: 5,
      particleColor: 'rgba(96, 165, 250, 0.6)'
    },
    81: {
      // Moderate Rain Showers
      component: CloudRain,
      color: '#3B82F6',
      animation: { y: [0, 9, 0], scale: [1, 1.08, 1] },
      duration: 1.1,
      particles: true,
      particleCount: 7,
      particleColor: 'rgba(59, 130, 246, 0.7)'
    },
    82: {
      // Violent Rain Showers
      component: CloudRain,
      color: '#1E40AF',
      animation: { y: [0, 12, 0], scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] },
      duration: 0.9,
      particles: true,
      particleCount: 10,
      particleColor: 'rgba(30, 64, 175, 0.9)'
    },
    85: {
      // Slight Snow Showers
      component: CloudSnow,
      color: '#E0F2FE',
      animation: { y: [0, 12, 0], rotate: [0, 180, 360] },
      duration: 4,
      repeatType: "loop",
      particles: true,
      particleCount: 5,
      particleColor: 'rgba(224, 242, 254, 0.8)'
    },
    86: {
      // Heavy Snow Showers
      component: CloudSnow,
      color: '#BAE6FD',
      animation: { y: [0, 18, 0], rotate: [0, 180, 360] },
      duration: 3,
      repeatType: "loop",
      particles: true,
      particleCount: 8,
      particleColor: 'rgba(186, 230, 253, 1)'
    },
    95: {
      // Thunderstorm
      component: CloudLightning,
      color: '#FBBF24',
      animation: { 
        scale: [1, 1.15, 1], 
        opacity: [1, 0.7, 1],
        rotate: [0, -3, 3, 0]
      },
      duration: 0.8,
      glow: true,
      glowDuration: 1
    },
    96: {
      // Thunderstorm with Slight Hail
      component: CloudLightning,
      color: '#F59E0B',
      animation: { 
        scale: [1, 1.2, 1], 
        opacity: [1, 0.6, 1],
        y: [0, -4, 0]
      },
      duration: 0.7,
      glow: true,
      glowDuration: 0.9
    },
    99: {
      // Thunderstorm with Heavy Hail
      component: CloudLightning,
      color: '#D97706',
      animation: { 
        scale: [1, 1.25, 1], 
        opacity: [1, 0.5, 1],
        y: [0, -6, 0],
        rotate: [0, -5, 5, 0]
      },
      duration: 0.6,
      glow: true,
      glowDuration: 0.8
    }
  };

  // Return the icon data or default to clear sky
  return iconMap[code] || iconMap[0];
}

// Helper function to get weather description
export function getWeatherDescription(code) {
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
    66: 'Light Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Slight Hail',
    99: 'Thunderstorm with Heavy Hail'
  };
  
  return descriptions[code] || 'Unknown';
}
