import { useEffect, useState } from "react";
import { CloudSun, Droplets, Wind } from "lucide-react";
import { fetchWeather } from "../services/weatherService";
import "../styles/WeatherCard.css";

export default function WeatherCard({ city, destinationName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) {
      const timer = setTimeout(() => {
        setError("No weather city specified for this destination.");
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let active = true;
    // Set loading asynchronously to avoid synchronous setState inside useEffect warning
    const loadTimer = setTimeout(() => {
      setLoading(true);
      setError("");
      setWeather(null);
    }, 0);

    fetchWeather(city)
      .then((data) => {
        if (active) {
          setWeather(data);
        }
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Weather fetch failed:", requestError);
        setError(requestError.response?.data?.error || "Unable to load current weather.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(loadTimer);
    };
  }, [city]);

  if (loading) {
    return (
      <article className="weather-card weather-loading" aria-live="polite">
        <CloudSun size={28} />
        <div>
          <p className="section-kicker">LIVE CONDITIONS</p>
          <h2>Checking the weather...</h2>
        </div>
        <span className="weather-shimmer" />
      </article>
    );
  }

  if (error || !weather) {
    return (
      <article className="weather-card weather-unavailable" role="alert">
        <CloudSun size={30} />
        <div>
          <p className="section-kicker">LIVE CONDITIONS</p>
          <h2>Weather is unavailable</h2>
          <p>{error || `Current conditions for ${destinationName} could not be loaded.`}</p>
        </div>
      </article>
    );
  }

  const temp = typeof weather.temperature === "number" ? Math.round(weather.temperature) : "--";
  const feelsLike = typeof weather.feelsLike === "number" ? Math.round(weather.feelsLike) : "--";
  const humidity = typeof weather.humidity === "number" ? weather.humidity : "--";
  const wind = typeof weather.wind === "number" ? weather.wind : "--";
  const description = weather.description || "No description";
  const iconUrl = weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : "";

  return (
    <article className="weather-card">
      <div className="weather-heading">
        <div>
          <p className="section-kicker">LIVE CONDITIONS</p>
          <h2>Weather in {destinationName}</h2>
        </div>
        {iconUrl && (
          <img
            src={iconUrl}
            alt={`${description} weather icon`}
          />
        )}
      </div>
      <div className="weather-main">
        <strong>{temp}°</strong>
        <div>
          <p>{description}</p>
          <span>Feels like {feelsLike}°</span>
        </div>
      </div>
      <div className="weather-info">
        <div>
          <Droplets size={22} />
          <span>Humidity</span>
          <strong>{humidity}%</strong>
        </div>
        <div>
          <Wind size={22} />
          <span>Wind</span>
          <strong>{wind} m/s</strong>
        </div>
      </div>
    </article>
  );
}

