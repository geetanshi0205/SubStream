"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { WEATHER_API_KEY, WEATHER_BASE_URL } from "@/lib/thirdweb";

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    pressure_mb: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

export function WeatherWidget() {
  const account = useActiveAccount();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("London");

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);

    // Demo mode if API key is not configured
    if (!WEATHER_API_KEY || WEATHER_API_KEY === "your-weather-api-key") {
      setError("Please configure your WeatherAPI.com API key");
      return;
    }

    try {
      const response = await fetch(
        `${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${cityName}&aqi=no`
      );

      if (!response.ok) {
        // If API key is invalid (401/403), show demo data
        if (response.status === 401 || response.status === 403) {
          setError("API key invalid. Showing demo data:");
          // Set demo weather data in WeatherAPI.com format
          setWeatherData({
            location: {
              name: cityName,
              country: "Demo"
            },
            current: {
              temp_c: 22,
              feelslike_c: 24,
              humidity: 65,
              pressure_mb: 1013,
              wind_kph: 12.6,
              condition: {
                text: "Clear",
                icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
              }
            }
          });
          setLoading(false);
          return;
        }
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  // Removed auto-loading - wait for user to search

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name (e.g., London, New York)"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black font-medium placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Loading
            </div>
          ) : (
            "Get Weather"
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">Error</p>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {weatherData && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200/50">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {weatherData.location.name}, {weatherData.location.country}
            </h3>
            <div className="flex items-center justify-center gap-3">
              <img
                src={`https:${weatherData.current.condition.icon}`}
                alt={weatherData.current.condition.text}
                className="w-20 h-20"
              />
              <div>
                <div className="text-4xl font-bold text-gray-800">
                  {Math.round(weatherData.current.temp_c)}°C
                </div>
                <p className="text-gray-600 capitalize font-medium">
                  {weatherData.current.condition.text}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl mb-1">🌡️</div>
              <p className="text-gray-600 text-sm">Feels like</p>
              <p className="font-bold text-gray-800 text-lg">
                {Math.round(weatherData.current.feelslike_c)}°C
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl mb-1">💧</div>
              <p className="text-gray-600 text-sm">Humidity</p>
              <p className="font-bold text-gray-800 text-lg">
                {weatherData.current.humidity}%
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl mb-1">💨</div>
              <p className="text-gray-600 text-sm">Wind Speed</p>
              <p className="font-bold text-gray-800 text-lg">
                {Math.round(weatherData.current.wind_kph)} km/h
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-200/50">
              <div className="text-2xl mb-1">🌡️</div>
              <p className="text-gray-600 text-sm">Pressure</p>
              <p className="font-bold text-gray-800 text-lg">
                {weatherData.current.pressure_mb} mb
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}