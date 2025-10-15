// src/components/SatelliteMapBackground.jsx - SATELLITE VIEW MAP WITH WEATHER ENVIRONMENT
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SatelliteMapBackground({ location, weatherCondition = 'clear' }) {
  const canvasRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const currentZoomRef = useRef(1);
  const targetZoomRef = useRef(1);
  const currentCenterRef = useRef({ x: 0, y: 0 });
  const targetCenterRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // World map data
    const worldMap = drawWorldMap();

    // Animate map
    let animationId;
    const animate = () => {
      // Smooth interpolation for zoom and center
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.05;
      currentCenterRef.current.x += (targetCenterRef.current.x - currentCenterRef.current.x) * 0.05;
      currentCenterRef.current.y += (targetCenterRef.current.y - currentCenterRef.current.y) * 0.05;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background based on weather
      const gradient = getWeatherGradient(ctx, canvas, weatherCondition);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2 + currentCenterRef.current.x, canvas.height / 2 + currentCenterRef.current.y);
      ctx.scale(currentZoomRef.current, currentZoomRef.current);

      // Draw satellite-style world map with weather coloring
      const mapStyle = getWeatherMapStyle(weatherCondition);
      
      ctx.strokeStyle = mapStyle.borderColor;
      ctx.lineWidth = 1.5 / currentZoomRef.current;
      ctx.fillStyle = mapStyle.landColor;
      
      worldMap.forEach(continent => {
        ctx.beginPath();
        continent.forEach((point, index) => {
          const x = (point[0] + 180) * 4 - 360;
          const y = (90 - point[1]) * 4 - 180;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Draw grid lines (satellite coordinate system)
      ctx.strokeStyle = mapStyle.gridColor;
      ctx.lineWidth = 0.5 / currentZoomRef.current;
      ctx.setLineDash([5 / currentZoomRef.current, 5 / currentZoomRef.current]);
      
      // Latitude lines
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        ctx.moveTo(-360, (90 - lat) * 4 - 180);
        ctx.lineTo(360, (90 - lat) * 4 - 180);
        ctx.stroke();
      }
      
      // Longitude lines
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        ctx.moveTo((lon + 180) * 4 - 360, -180);
        ctx.lineTo((lon + 180) * 4 - 360, 180);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw location marker if location exists
      if (location) {
        const markerX = (location.longitude + 180) * 4 - 360;
        const markerY = (90 - location.latitude) * 4 - 180;

        // Pulsing circle with weather-themed color
        const pulseRadius = 10 / currentZoomRef.current * (1 + Math.sin(Date.now() / 300) * 0.3);
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(markerX, markerY, 0, markerX, markerY, pulseRadius * 2.5);
        glowGradient.addColorStop(0, mapStyle.markerColor);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(markerX, markerY, pulseRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Radar ring
        ctx.strokeStyle = mapStyle.markerColor;
        ctx.lineWidth = 2 / currentZoomRef.current;
        ctx.beginPath();
        ctx.arc(markerX, markerY, pulseRadius * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // Inner circle
        ctx.fillStyle = mapStyle.markerColor;
        ctx.beginPath();
        ctx.arc(markerX, markerY, 6 / currentZoomRef.current, 0, Math.PI * 2);
        ctx.fill();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(markerX, markerY, 2 / currentZoomRef.current, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Crosshair
        ctx.strokeStyle = mapStyle.markerColor;
        ctx.lineWidth = 1.5 / currentZoomRef.current;
        const crossSize = 15 / currentZoomRef.current;
        ctx.beginPath();
        ctx.moveTo(markerX - crossSize, markerY);
        ctx.lineTo(markerX + crossSize, markerY);
        ctx.moveTo(markerX, markerY - crossSize);
        ctx.lineTo(markerX, markerY + crossSize);
        ctx.stroke();
      }

      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();
    setMapLoaded(true);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [weatherCondition]);

  // Update zoom and center when location changes
  useEffect(() => {
    if (location) {
      const targetX = -(location.longitude + 180) * 4 + 360;
      const targetY = -(90 - location.latitude) * 4 + 180;
      
      targetCenterRef.current = { x: targetX, y: targetY };
      targetZoomRef.current = 3.5;
    } else {
      targetCenterRef.current = { x: 0, y: 0 };
      targetZoomRef.current = 1;
    }
  }, [location]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ 
          filter: location ? 'blur(2px)' : 'blur(0px)',
          transition: 'filter 1s ease-out',
          opacity: mapLoaded ? 1 : 0
        }}
      />
      
      {/* Weather overlay particles */}
      <WeatherParticles condition={weatherCondition} />
      
      {/* Overlay gradient for depth */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: location ? 0.2 : 0 }}
        transition={{ duration: 1 }}
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />
    </>
  );
}

// Weather-based gradient for background
function getWeatherGradient(ctx, canvas, condition) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  
  switch (condition) {
    case 'clear':
      gradient.addColorStop(0, '#0ea5e9'); // Sky blue
      gradient.addColorStop(0.5, '#0284c7');
      gradient.addColorStop(1, '#0c4a6e'); // Deep blue
      break;
    case 'partly-cloudy':
      gradient.addColorStop(0, '#38bdf8');
      gradient.addColorStop(0.5, '#0284c7');
      gradient.addColorStop(1, '#334155'); // Gray-blue
      break;
    case 'cloudy':
      gradient.addColorStop(0, '#64748b'); // Gray
      gradient.addColorStop(0.5, '#475569');
      gradient.addColorStop(1, '#1e293b');
      break;
    case 'rain':
      gradient.addColorStop(0, '#475569'); // Dark gray
      gradient.addColorStop(0.5, '#334155');
      gradient.addColorStop(1, '#1e293b');
      break;
    case 'snow':
      gradient.addColorStop(0, '#94a3b8'); // Light gray
      gradient.addColorStop(0.5, '#64748b');
      gradient.addColorStop(1, '#334155');
      break;
    case 'fog':
      gradient.addColorStop(0, '#9ca3af');
      gradient.addColorStop(0.5, '#6b7280');
      gradient.addColorStop(1, '#374151');
      break;
    case 'thunder':
      gradient.addColorStop(0, '#4c1d95'); // Purple-black
      gradient.addColorStop(0.5, '#2e1065');
      gradient.addColorStop(1, '#18181b');
      break;
    default:
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(0.5, '#0284c7');
      gradient.addColorStop(1, '#0c4a6e');
  }
  
  return gradient;
}

// Weather-based map styling
function getWeatherMapStyle(condition) {
  const styles = {
    clear: {
      landColor: 'rgba(34, 197, 94, 0.25)', // Green
      borderColor: 'rgba(34, 197, 94, 0.6)',
      gridColor: 'rgba(255, 255, 255, 0.15)',
      markerColor: 'rgba(239, 68, 68, 0.9)' // Red
    },
    'partly-cloudy': {
      landColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      gridColor: 'rgba(255, 255, 255, 0.12)',
      markerColor: 'rgba(251, 146, 60, 0.9)' // Orange
    },
    cloudy: {
      landColor: 'rgba(148, 163, 184, 0.2)',
      borderColor: 'rgba(148, 163, 184, 0.5)',
      gridColor: 'rgba(255, 255, 255, 0.1)',
      markerColor: 'rgba(234, 179, 8, 0.9)' // Yellow
    },
    rain: {
      landColor: 'rgba(71, 85, 105, 0.25)',
      borderColor: 'rgba(71, 85, 105, 0.6)',
      gridColor: 'rgba(147, 197, 253, 0.15)',
      markerColor: 'rgba(96, 165, 250, 0.9)' // Blue
    },
    snow: {
      landColor: 'rgba(226, 232, 240, 0.2)',
      borderColor: 'rgba(203, 213, 225, 0.6)',
      gridColor: 'rgba(255, 255, 255, 0.2)',
      markerColor: 'rgba(147, 197, 253, 0.9)' // Light blue
    },
    fog: {
      landColor: 'rgba(156, 163, 175, 0.15)',
      borderColor: 'rgba(156, 163, 175, 0.4)',
      gridColor: 'rgba(255, 255, 255, 0.08)',
      markerColor: 'rgba(209, 213, 219, 0.9)' // Light gray
    },
    thunder: {
      landColor: 'rgba(124, 58, 237, 0.2)',
      borderColor: 'rgba(124, 58, 237, 0.5)',
      gridColor: 'rgba(196, 181, 253, 0.15)',
      markerColor: 'rgba(251, 191, 36, 0.9)' // Gold
    }
  };
  
  return styles[condition] || styles.clear;
}

// Weather particles overlay
function WeatherParticles({ condition }) {
  if (condition === 'clear' || condition === 'partly-cloudy') {
    return null; // No particles for clear weather
  }

  const getParticleCount = () => {
    switch (condition) {
      case 'rain': return 150;
      case 'snow': return 80;
      case 'thunder': return 100;
      case 'fog': return 40;
      default: return 0;
    }
  };

  const particleCount = getParticleCount();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            width: condition === 'rain' ? '2px' : condition === 'snow' ? '4px' : '8px',
            height: condition === 'rain' ? `${10 + Math.random() * 20}px` : condition === 'snow' ? '4px' : '8px',
            background: condition === 'rain' ? 'rgba(147, 197, 253, 0.6)' : 
                       condition === 'snow' ? 'rgba(255, 255, 255, 0.8)' :
                       condition === 'thunder' ? 'rgba(147, 197, 253, 0.7)' :
                       'rgba(156, 163, 175, 0.4)',
            borderRadius: condition === 'snow' ? '50%' : condition === 'fog' ? '50%' : '0',
            boxShadow: condition === 'snow' ? '0 0 4px rgba(255, 255, 255, 0.8)' : 'none'
          }}
          animate={{
            y: ['0vh', '120vh'],
            x: condition === 'snow' ? [0, Math.random() * 50 - 25] : 
               condition === 'fog' ? [0, Math.random() * 100 - 50] : 0,
            opacity: condition === 'fog' ? [0.2, 0.6, 0.2] : [0.8, 0.4]
          }}
          transition={{
            duration: condition === 'rain' ? 1 + Math.random() : 
                     condition === 'snow' ? 3 + Math.random() * 2 :
                     condition === 'fog' ? 5 + Math.random() * 3 : 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}

// Simplified world map coordinates
function drawWorldMap() {
  return [
    // North America
    [[-170, 70], [-140, 70], [-120, 60], [-100, 50], [-90, 40], [-80, 30], [-85, 25], [-95, 30], [-100, 20], [-110, 30], [-120, 35], [-130, 50], [-150, 60], [-170, 70]],
    // South America
    [[-80, 10], [-75, 5], [-70, -5], [-60, -15], [-55, -30], [-65, -40], [-70, -50], [-75, -55], [-70, -50], [-60, -40], [-50, -25], [-45, -10], [-50, 0], [-60, 5], [-70, 10], [-80, 10]],
    // Europe
    [[-10, 60], [0, 55], [10, 58], [20, 55], [30, 60], [40, 65], [30, 50], [20, 45], [10, 42], [0, 45], [-10, 50], [-10, 60]],
    // Africa
    [[-20, 35], [-10, 32], [10, 30], [30, 25], [40, 15], [50, 10], [40, -5], [35, -20], [30, -30], [20, -35], [15, -30], [10, -20], [0, -10], [-10, 0], [-15, 10], [-18, 20], [-20, 35]],
    // Asia
    [[40, 70], [60, 75], [80, 75], [100, 70], [120, 60], [140, 50], [145, 40], [140, 30], [130, 20], [120, 10], [110, 0], [100, -5], [90, -10], [80, 0], [70, 10], [60, 20], [50, 30], [40, 40], [35, 50], [40, 60], [40, 70]],
    // Australia
    [[115, -10], [125, -12], [135, -15], [145, -20], [150, -30], [145, -38], [135, -40], [125, -38], [115, -35], [110, -25], [115, -15], [115, -10]]
  ];
}
