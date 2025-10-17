// src/App.jsx - COMPLETE WITH SEARCH HISTORY + KEEPING ORIGINAL CODE INTACT
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./components/SearchBar";
import SatelliteMapBackground from "./components/SatelliteMapBackground";
import LoadingSpinner from "./components/LoadingSpinner";
import LocationSuggestions from "./components/LocationSuggestions";
import CurrentWeather from "./components/CurrentWeather";
import HourlyForecast from "./components/HourlyForecast";
import WeeklyForecast from "./components/WeeklyForecast";
import WeatherDetails from "./components/WeatherDetails";
import SearchHistory from "./components/SearchHistory";

// Backend API base URL
const API_BASE_URL = "http://localhost:4000/api";

export default function App() {
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherCondition, setWeatherCondition] = useState('clear');
  const [locationPermission, setLocationPermission] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const hasRequestedLocation = useRef(false);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Request geolocation on first mount
  useEffect(() => {
    if (!hasRequestedLocation.current) {
      hasRequestedLocation.current = true;
      requestUserLocation();
    }
  }, []);

  // Update weather condition for background
  useEffect(() => {
    if (weather?.current_weather) {
      const code = weather.current_weather.weathercode;
      setWeatherCondition(getWeatherCondition(code));
    }
  }, [weather]);

  function getWeatherCondition(code) {
    if (code === 0) return 'clear';
    if (code === 1 || code === 2) return 'partly-cloudy';
    if (code === 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 95) return 'thunder';
    return 'cloudy';
  }

  // Add location to search history
  function addToSearchHistory(location, weatherData) {
    if (!location || !weatherData) return;

    const historyItem = {
      id: `${location.latitude}-${location.longitude}-${Date.now()}`,
      name: location.name,
      admin1: location.admin1,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      temperature: Math.round(weatherData.current_weather?.temperature || 0),
      weathercode: weatherData.current_weather?.weathercode || 0,
      timestamp: new Date().toISOString()
    };

    setSearchHistory(prevHistory => {
      // Remove duplicate locations (same coordinates)
      const filtered = prevHistory.filter(
        item => !(item.latitude === location.latitude && item.longitude === location.longitude)
      );
      
      // Add new item at the beginning and limit to 10 items
      const newHistory = [historyItem, ...filtered].slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('weatherSearchHistory', JSON.stringify(newHistory));
      
      return newHistory;
    });
  }

  // Clear search history
  function clearSearchHistory() {
    setSearchHistory([]);
    localStorage.removeItem('weatherSearchHistory');
  }

  // Handle selecting location from history
  function handleHistorySelect(historyItem) {
    const location = {
      name: historyItem.name,
      admin1: historyItem.admin1,
      country: historyItem.country,
      latitude: historyItem.latitude,
      longitude: historyItem.longitude
    };
    
    setPlace(location);
    setLoading(true);
    fetchWeatherData(location).finally(() => setLoading(false));
  }

  // Request user's current location
  async function requestUserLocation() {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      setShowLocationPrompt(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationPermission('granted');
        setShowLocationPrompt(false);
        
        try {
          // Get location name from coordinates using reverse geocoding
          const geoRes = await axios.get(`${API_BASE_URL}/reverse-geocode`, {
            params: { lat: latitude, lon: longitude }
          });
          
          if (geoRes.data?.location) {
            const locationData = {
              name: geoRes.data.location.name || "Your Location",
              admin1: geoRes.data.location.admin1,
              country: geoRes.data.location.country,
              latitude: latitude,
              longitude: longitude
            };
            setPlace(locationData);
            await fetchWeatherData(locationData);
          } else {
            const locationData = {
              name: "Your Location",
              latitude: latitude,
              longitude: longitude
            };
            setPlace(locationData);
            await fetchWeatherData(locationData);
          }
        } catch (err) {
          console.error("Error fetching location data:", err);
          setErrorMsg("Could not fetch weather for your location");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setLocationPermission('denied');
        setShowLocationPrompt(false);
        console.error("Geolocation error:", error);
        
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("Location access denied. Please search for a city manually.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMsg("Location information unavailable. Please search manually.");
        } else if (error.code === error.TIMEOUT) {
          setErrorMsg("Location request timed out. Please search manually.");
        } else {
          setErrorMsg("An error occurred while getting your location. Please search manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // Get location suggestions
  async function getSuggestions(query) {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/locations`, {
        params: { q: query }
      });

      if (response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Suggestions error:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  // Check if input is coordinates (e.g., "40.7128, -74.0060" or "40.7128,-74.0060")
  function parseCoordinates(input) {
    const coordPattern = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
    const match = input.trim().match(coordPattern);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      
      // Validate coordinates
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return { latitude: lat, longitude: lon };
      }
    }
    return null;
  }

  // Main search function
  async function handleSearch(q) {
    setErrorMsg("");
    setWeather(null);
    setPlace(null);
    setShowSuggestions(false);

    try {
      if (!q) return;

      setLoading(true);

      // Check if input is coordinates
      const coords = parseCoordinates(q);
      
      if (coords) {
        // Search by coordinates
        console.log("Searching by coordinates:", coords);
        
        try {
          // Get location name from coordinates
          const geoRes = await axios.get(`${API_BASE_URL}/reverse-geocode`, {
            params: { lat: coords.latitude, lon: coords.longitude }
          });
          
          const locationData = {
            name: geoRes.data?.location?.name || "Custom Location",
            admin1: geoRes.data?.location?.admin1,
            country: geoRes.data?.location?.country,
            latitude: coords.latitude,
            longitude: coords.longitude
          };
          
          setPlace(locationData);
          await fetchWeatherData(locationData);
        } catch (err) {
          // If reverse geocoding fails, still show weather
          const locationData = {
            name: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
            latitude: coords.latitude,
            longitude: coords.longitude
          };
          
          setPlace(locationData);
          await fetchWeatherData(locationData);
        }
      } else {
        // Search by city name
        const geoRes = await axios.get(`${API_BASE_URL}/geocode`, {
          params: { q }
        });

        if (!geoRes.data?.results?.length) {
          setErrorMsg("Location not found. Try a different city name or use coordinates (e.g., 19.0760, 72.8777)");
          return;
        }

        const first = geoRes.data.results[0];
        setPlace(first);
        await fetchWeatherData(first);
      }
    } catch (err) {
      console.error("handleSearch error:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch weather data for location
  async function fetchWeatherData(location) {
    try {
      const wRes = await axios.get(`${API_BASE_URL}/weather`, {
        params: {
          lat: location.latitude,
          lon: location.longitude
        }
      });
      console.log("Weather data:", wRes.data);
      setWeather(wRes.data);
      
      // Add to search history after successful fetch
      addToSearchHistory(location, wRes.data);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setErrorMsg("Failed to fetch weather data: " + err.message);
    }
  }

  // Handle suggestion selection
  function handleSuggestionSelect(suggestion) {
    setPlace(suggestion);
    setShowSuggestions(false);
    setLoading(true);
    fetchWeatherData(suggestion).finally(() => setLoading(false));
  }

  // Error handler
  function handleError(err) {
    if (err?.code === 'ERR_NETWORK') {
      setErrorMsg("Cannot connect to backend server. Make sure your backend is running on port 4000.");
    } else if (err?.response) {
      setErrorMsg(`API Error: ${err.response.status} ${err.response.statusText}`);
    } else if (err?.request) {
      setErrorMsg("Network error: request failed or blocked (check CORS/backend).");
    } else {
      setErrorMsg("Unexpected error: " + err.message);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Satellite Map Background with Weather Environment */}
      <SatelliteMapBackground 
        location={place} 
        weatherCondition={weatherCondition}
      />

      {/* Search History - Top Left */}
      {!showLocationPrompt && (
        <SearchHistory
          history={searchHistory}
          onSelect={handleHistorySelect}
          onClear={clearSearchHistory}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-20 sm:pb-16">
        {/* Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 sm:top-8 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 max-w-lg mx-auto"
            >
              <div className="bg-red-500/90 backdrop-blur-xl text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl border border-red-400/50">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="text-xl sm:text-2xl">⚠️</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">Connection Error</h3>
                    <p className="text-xs sm:text-sm break-words">{errorMsg}</p>
                  </div>
                  <button
                    onClick={() => setErrorMsg("")}
                    className="text-white hover:text-red-100 text-xl font-bold flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Permission Prompt */}
        <AnimatePresence>
          {showLocationPrompt && !weather && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md mx-auto"
            >
              <div className="bg-white/20 backdrop-blur-2xl text-white px-6 sm:px-8 py-5 sm:py-6 rounded-3xl shadow-2xl border border-white/30">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📍</div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-3">Enable Location Access</h3>
                  <p className="text-blue-100 text-sm sm:text-base mb-5 sm:mb-6">
                    Allow us to access your location for automatic weather updates, or search for a city manually.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={requestUserLocation}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
                    >
                      Allow Location
                    </button>
                    <button
                      onClick={() => setShowLocationPrompt(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
                    >
                      Search Manually
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Container */}
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Header - Fully Responsive */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
              TenWeather
            </h1>
            <p className="text-blue-100 text-sm sm:text-base md:text-lg drop-shadow-lg px-4">
              Real-time weather with satellite tracking
            </p>
          </motion.div>

          {/* Search Bar with Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-6 sm:mb-8 relative z-30"
          >
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              onInputChange={getSuggestions}
            />
            
            {/* Location Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <LocationSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </motion.div>

          {/* Loading Spinner - Original Style */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex justify-center items-center py-12 sm:py-16"
              >
                <div className="text-center">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-200/30 border-t-blue-500 rounded-full mx-auto mb-4"
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-2xl">🌤️</div>
                    </div>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/90 text-lg font-medium mt-4 drop-shadow-lg"
                  >
                    Fetching Weather Data
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-200/80 text-sm mt-2 drop-shadow"
                  >
                    Getting the latest forecast from satellite...
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Weather Display - Original Layout */}
          <AnimatePresence mode="wait">
            {!loading && weather && place && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6 relative z-10"
              >
                <CurrentWeather weather={weather} location={place} />
                <HourlyForecast weather={weather} />
                <WeeklyForecast weather={weather} />
                <WeatherDetails weather={weather} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State - Original Style */}
          {!loading && !weather && !showLocationPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-12 sm:mt-20 px-4"
            >
              <div className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6">🌤️</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                Welcome to TenWeather
              </h2>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 drop-shadow max-w-md mx-auto">
                Search for any city to get started • Indian locations prioritized
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-md mx-auto border border-white/20">
                <p className="text-blue-200 text-sm font-medium mb-2">
                  💡 <span className="font-semibold">New:</span> Try coordinate search!
                </p>
                <p className="text-blue-100 text-xs">
                  Examples: "Mumbai" or "19.0760, 72.8777"
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer - Original Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10 py-2 sm:py-3 z-20"
        >
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <p className="text-white/80 text-xs sm:text-sm">
              Built by <span className="font-semibold text-white">Prashant</span> • MERN Stack Developer
            </p>
            <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
              Internship Project at TEN - The Entrepreneurship Network
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}