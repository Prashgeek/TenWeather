// src/components/WeatherBackground.jsx - 3D ANIMATED BACKGROUND
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WeatherBackground({ condition = 'clear' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Particle system for different weather conditions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor(x, y, dx, dy, size, color, opacity = 1) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
        this.opacity = opacity;
        this.maxOpacity = opacity;
      }

      update() {
        this.x += this.dx;
        this.y += this.dy;

        // Boundary checks
        if (this.x < 0 || this.x > canvas.width) this.dx = -this.dx;
        if (this.y < 0 || this.y > canvas.height) this.dy = -this.dy;

        // Fade in/out effect
        this.opacity = this.maxOpacity * (0.5 + 0.5 * Math.sin(Date.now() * 0.001 + this.x * 0.01));
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Raindrop class
    class Raindrop {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.speed = Math.random() * 10 + 5;
        this.length = Math.random() * 20 + 10;
        this.opacity = Math.random() * 0.5 + 0.5;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Snowflake class
    class Snowflake {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 4 + 2;
        this.speed = Math.random() * 2 + 1;
        this.drift = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.8 + 0.2;
      }

      update() {
        this.y += this.speed;
        this.x += this.drift;
        if (this.y > canvas.height) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles based on weather condition
    const initParticles = () => {
      particles.length = 0;
      
      switch (condition) {
        case 'rain':
          for (let i = 0; i < 100; i++) {
            particles.push(new Raindrop());
          }
          break;
        case 'snow':
          for (let i = 0; i < 50; i++) {
            particles.push(new Snowflake());
          }
          break;
        case 'cloudy':
        case 'partly-cloudy':
          for (let i = 0; i < 30; i++) {
            particles.push(new Particle(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5,
              Math.random() * 3 + 1,
              `rgba(255, 255, 255, 0.3)`,
              0.3
            ));
          }
          break;
        case 'clear':
        default:
          for (let i = 0; i < 20; i++) {
            particles.push(new Particle(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              Math.random() * 2 + 0.5,
              `rgba(255, 255, 255, 0.4)`,
              0.4
            ));
          }
          break;
      }
    };

    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [condition]);

  // Get background gradient based on weather condition
  const getBackgroundGradient = () => {
    switch (condition) {
      case 'clear':
        return 'from-blue-400 via-blue-500 to-blue-600';
      case 'partly-cloudy':
        return 'from-blue-400 via-blue-500 to-gray-500';
      case 'cloudy':
        return 'from-gray-400 via-gray-500 to-gray-600';
      case 'rain':
        return 'from-gray-600 via-gray-700 to-gray-800';
      case 'snow':
        return 'from-gray-300 via-gray-400 to-gray-500';
      case 'fog':
        return 'from-gray-400 via-gray-500 to-gray-600';
      case 'thunder':
        return 'from-gray-800 via-purple-900 to-gray-900';
      default:
        return 'from-blue-400 via-blue-500 to-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 -z-10">
      {/* Gradient Background */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      
      {/* Animated Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full border border-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.1, 0.9, 1],
              opacity: [0.1, 0.2, 0.1, 0.1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
} 