// src/components/WeatherCard.jsx
import React from "react";
import WeatherIcon from "./WeatherIcon";

export default function WeatherCard({ weather, loading }) {
  if (loading) return <div className="p-6 bg-white rounded-lg shadow">Loading...</div>;
  if (!weather) return <div className="p-6 bg-white rounded-lg shadow">Search a location to see the weather.</div>;

  const current = weather.current_weather || {};

  return (
    <div className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Now</div>
          <div className="text-3xl font-bold">{current.temperature ?? "--"}°</div>
          <div className="text-sm text-gray-600">Wind {current.windspeed ?? "--"} m/s</div>
        </div>

        <div className="w-24 h-24">
          <WeatherIcon code={current.weathercode ?? 0} />
        </div>
      </div>

      {weather.daily && weather.daily.time && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {weather.daily.time.slice(0, 3).map((d, i) => (
            <div key={d} className="bg-white/70 p-2 rounded">
              <div>{d}</div>
              <div className="text-sm font-semibold">
                {Math.round(weather.daily.temperature_2m_max[i])}° / {Math.round(weather.daily.temperature_2m_min[i])}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
