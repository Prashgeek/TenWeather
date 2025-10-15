// routes/weather.js - UPDATED WITH REVERSE GEOCODING FOR AUTO LOCATION
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Open-Meteo endpoints are public and require no API key
// List of common search terms that should prioritize India
const INDIAN_KEYWORDS = [
  'goa', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad',
  'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
  'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara',
  'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan',
  'vasai', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar',
  'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur',
  'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'chandigarh',
  'guwahati', 'solapur', 'hubli', 'bareilly', 'moradabad', 'mysore', 'tiruchirappalli',
  'tiruppur', 'gurgaon', 'aligarh', 'jalandhar', 'bhubaneswar', 'salem',
  'warangal', 'guntur', 'bhiwandi', 'saharanpur', 'gorakhpur', 'bikaner',
  'amravati', 'noida', 'jamshedpur', 'bhilai', 'cuttack', 'firozabad',
  'kochi', 'bhavnagar', 'dehradun', 'durgapur', 'asansol', 'nanded',
  'kolhapur', 'ajmer', 'gulbarga', 'jamnagar', 'ujjain', 'loni', 'siliguri',
  'jhansi', 'ulhasnagar', 'nellore', 'jammu', 'sangli', 'islampur', 'kadapa'
];

// Function to check if search term might be Indian
function shouldPrioritizeIndia(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  return INDIAN_KEYWORDS.some(keyword =>
    term.includes(keyword) || keyword.includes(term)
  );
}

// Function to perform intelligent geocoding with country prioritization
async function smartGeocode(searchTerm) {
  const results = [];
  
  // Always try a general search first
  try {
    const generalUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=10&language=en&format=json`;
    const generalResponse = await axios.get(generalUrl);
    if (generalResponse.data?.results) {
      results.push(...generalResponse.data.results);
    }
  } catch (err) {
    console.error('General geocoding failed:', err.message);
  }

  // If the search term might be Indian, also try India-specific search
  if (shouldPrioritizeIndia(searchTerm)) {
    try {
      const indiaUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=5&language=en&format=json&countryCode=IN`;
      const indiaResponse = await axios.get(indiaUrl);
      if (indiaResponse.data?.results) {
        // Add Indian results at the beginning
        results.unshift(...indiaResponse.data.results);
      }
    } catch (err) {
      console.error('India-specific geocoding failed:', err.message);
    }
  }

  // Remove duplicates (same lat/lon) and keep only unique results
  const uniqueResults = [];
  const seen = new Set();
  
  for (const result of results) {
    const key = `${result.latitude}-${result.longitude}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(result);
    }
  }

  // Prioritize Indian results by moving them to the front
  const indianResults = uniqueResults.filter(r => r.country_code === 'IN' || r.country === 'India');
  const otherResults = uniqueResults.filter(r => r.country_code !== 'IN' && r.country !== 'India');
  
  return [...indianResults, ...otherResults].slice(0, 10); // Limit to 10 results
}

// Geocoding endpoint
router.get('/geocode', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) {
      return res.status(400).json({ error: 'Missing query param q' });
    }

    console.log(`Geocoding request for: ${q}`);
    
    // Use smart geocoding that prioritizes Indian locations
    const results = await smartGeocode(q);
    
    console.log(`Geocoding successful for: ${q} - Found ${results.length} results`);
    if (results.length > 0) {
      console.log(`First result: ${results[0].name}, ${results[0].admin1 || ''} (${results[0].country || results[0].country_code})`);
    }

    return res.json({ results });
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return res.status(500).json({ error: 'Geocode failed', details: err.message });
  }
});

// NEW: Reverse geocoding endpoint for getting location name from coordinates
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing lat or lon parameters' });
    }

    console.log(`Reverse geocoding request for: lat=${lat}, lon=${lon}`);

    // Use Open-Meteo's reverse geocoding
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
    
    // Alternative approach: search for nearby locations
    const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=a&count=10&language=en&format=json`;
    
    try {
      // Try to find the closest location by searching nearby
      const response = await axios.get(searchUrl);
      
      if (response.data?.results && response.data.results.length > 0) {
        // Find the closest result to our coordinates
        const targetLat = parseFloat(lat);
        const targetLon = parseFloat(lon);
        
        let closestLocation = response.data.results[0];
        let minDistance = getDistance(
          targetLat, targetLon, 
          closestLocation.latitude, closestLocation.longitude
        );
        
        for (const location of response.data.results) {
          const distance = getDistance(
            targetLat, targetLon,
            location.latitude, location.longitude
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestLocation = location;
          }
        }
        
        const locationData = {
          name: closestLocation.name,
          admin1: closestLocation.admin1,
          country: closestLocation.country || closestLocation.country_code,
          latitude: targetLat,
          longitude: targetLon
        };
        
        console.log(`Reverse geocoding found: ${locationData.name}, ${locationData.country}`);
        return res.json({ location: locationData });
      }
    } catch (searchErr) {
      console.error('Reverse geocoding search failed:', searchErr.message);
    }
    
    // If reverse geocoding fails, return generic location
    console.log('Reverse geocoding failed, returning generic location');
    return res.json({
      location: {
        name: "Your Location",
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      }
    });
    
  } catch (err) {
    console.error('Reverse geocoding error:', err.message);
    return res.status(500).json({ error: 'Reverse geocoding failed', details: err.message });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Weather endpoint
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Require lat & lon parameters' });
    }

    console.log(`Weather request for: lat=${lat}, lon=${lon}`);

    // Pick fields you need. current_weather + hourly + daily are popular.
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current_weather: 'true',
      hourly: 'temperature_2m,relativehumidity_2m,precipitation,weathercode,windspeed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weathercode',
      timezone: 'auto'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const r = await axios.get(url);

    console.log(`Weather data retrieved successfully`);
    return res.json(r.data);
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    return res.status(500).json({ error: 'Weather fetch failed', details: err.message });
  }
});

// Location suggestions endpoint
router.get('/locations', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) {
      return res.status(400).json({ error: 'Missing query param q' });
    }

    console.log(`Location suggestions request for: ${q}`);
    const results = await smartGeocode(q);

    // Format results for easy display
    const suggestions = results.slice(0, 5).map(result => ({
      name: result.name,
      display: `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}${result.country ? ` (${result.country})` : ''}`,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country || result.country_code,
      priority: result.country_code === 'IN' ? 1 : 0 // Higher priority for Indian locations
    }));

    console.log(`Location suggestions for: ${q} - Found ${suggestions.length} suggestions`);
    return res.json({ suggestions });
  } catch (err) {
    console.error('Location suggestions error:', err.message);
    return res.status(500).json({ error: 'Location suggestions failed', details: err.message });
  }
});

module.exports = router;
