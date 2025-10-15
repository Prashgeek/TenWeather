// src/components/AnimatedMapBackground.jsx - INTERACTIVE WORLD MAP WITH SMOOTH ZOOM
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedMapBackground({ location, isSearching }) {
  const canvasRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const animationRef = useRef(null);
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

    // World map data (simplified continents outline)
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

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2 + currentCenterRef.current.x, canvas.height / 2 + currentCenterRef.current.y);
      ctx.scale(currentZoomRef.current, currentZoomRef.current);

      // Draw world map
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.lineWidth = 1 / currentZoomRef.current;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      
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

      // Draw grid lines
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.lineWidth = 0.5 / currentZoomRef.current;
      
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

      // Draw location marker if location exists
      if (location) {
        const markerX = (location.longitude + 180) * 4 - 360;
        const markerY = (90 - location.latitude) * 4 - 180;

        // Pulsing circle
        const pulseRadius = 8 / currentZoomRef.current * (1 + Math.sin(Date.now() / 300) * 0.3);
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(markerX, markerY, pulseRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(markerX, markerY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fill();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(markerX, markerY, 3 / currentZoomRef.current, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
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
  }, []);

  // Update zoom and center when location changes
  useEffect(() => {
    if (location) {
      // Calculate target position
      const targetX = -(location.longitude + 180) * 4 + 360;
      const targetY = -(90 - location.latitude) * 4 + 180;
      
      targetCenterRef.current = { x: targetX, y: targetY };
      targetZoomRef.current = 3; // Zoom in
    } else {
      targetCenterRef.current = { x: 0, y: 0 };
      targetZoomRef.current = 1; // Zoom out
    }
  }, [location]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ 
          filter: location ? 'blur(3px)' : 'blur(0px)',
          transition: 'filter 0.8s ease-out',
          opacity: mapLoaded ? 1 : 0
        }}
      />
      
      {/* Overlay gradient for blur effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: location ? 0.3 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(15, 23, 42, 0.6) 100%)'
        }}
      />

      {/* Searching animation overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 rounded-full border-4 border-blue-400"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simplified world map coordinates (major continents)
function drawWorldMap() {
  return [
    // North America
    [
      [-170, 70], [-140, 70], [-120, 60], [-100, 50], [-90, 40], 
      [-80, 30], [-85, 25], [-95, 30], [-100, 20], [-110, 30], 
      [-120, 35], [-130, 50], [-150, 60], [-170, 70]
    ],
    // South America
    [
      [-80, 10], [-75, 5], [-70, -5], [-60, -15], [-55, -30],
      [-65, -40], [-70, -50], [-75, -55], [-70, -50], [-60, -40],
      [-50, -25], [-45, -10], [-50, 0], [-60, 5], [-70, 10], [-80, 10]
    ],
    // Europe
    [
      [-10, 60], [0, 55], [10, 58], [20, 55], [30, 60], [40, 65],
      [30, 50], [20, 45], [10, 42], [0, 45], [-10, 50], [-10, 60]
    ],
    // Africa
    [
      [-20, 35], [-10, 32], [10, 30], [30, 25], [40, 15], [50, 10],
      [40, -5], [35, -20], [30, -30], [20, -35], [15, -30], [10, -20],
      [0, -10], [-10, 0], [-15, 10], [-18, 20], [-20, 35]
    ],
    // Asia
    [
      [40, 70], [60, 75], [80, 75], [100, 70], [120, 60], [140, 50],
      [145, 40], [140, 30], [130, 20], [120, 10], [110, 0], [100, -5],
      [90, -10], [80, 0], [70, 10], [60, 20], [50, 30], [40, 40],
      [35, 50], [40, 60], [40, 70]
    ],
    // Australia
    [
      [115, -10], [125, -12], [135, -15], [145, -20], [150, -30],
      [145, -38], [135, -40], [125, -38], [115, -35], [110, -25],
      [115, -15], [115, -10]
    ]
  ];
}
