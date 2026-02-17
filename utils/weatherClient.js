const axios = require('axios');
const { DateTime } = require('luxon');

const API_KEY = process.env.OPENWEATHER_KEY;
const CACHE_TTL = 60 * 1000; // 60 seconds
const cache = new Map();

// Runtime sanity check (do not log the key itself)
if (!API_KEY) {
  console.warn('OPENWEATHER_KEY not set in environment — /weather and /time will fail.');
} else {
  console.debug('OPENWEATHER_KEY is present');
}

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function fToC(f) {
  return ((f - 32) * 5) / 9;
}

function formatOffset(seconds) {
  const sign = seconds >= 0 ? '+' : '-';
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function fetchWeather(query, units = 'imperial') {
  if (!API_KEY) {
    const err = new Error('OPENWEATHER_KEY is not set in environment');
    err.code = 'NO_API_KEY';
    throw err;
  }

  // Detect lat,lon input (e.g. "40.71,-74.01")
  const coordsMatch = query && query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  let url;
  if (coordsMatch) {
    const lat = coordsMatch[1];
    const lon = coordsMatch[2];
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  } else {
    // city name or zip
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=${units}`;
  }

  try {
    const res = await axios.get(url, { timeout: 7000 });
    return res.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const statusText = err.response.statusText || '';
      const details = err.response.data || {};
      const e = new Error(`OpenWeather API error: ${status} ${statusText}`);
      e.code = status;
      e.details = details;
      throw e;
    }
    throw err;
  }
}

async function getWeather(location, units = 'imperial') {
  const key = `${String(location).toLowerCase()}|${units}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const data = await fetchWeather(location, units);
  cache.set(key, { ts: Date.now(), data });
  return data;
}

function formatLocalTimeFromOffset(offsetSeconds) {
  // offsetSeconds = seconds from UTC for the target location
  return DateTime.utc().plus({ seconds: offsetSeconds }).toFormat('EEE, LLL dd yyyy • HH:mm');
}

module.exports = {
  getWeather,
  cToF,
  fToC,
  formatOffset,
  formatLocalTimeFromOffset,
};