const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function getWeather(city) {
  if (!process.env.OPENWEATHER_API_KEY) {
    const error = new Error("Weather service is not configured");
    error.status = 503;
    throw error;
  }

  const params = new URLSearchParams({
    q: city,
    appid: process.env.OPENWEATHER_API_KEY,
    units: "metric",
  });
  const response = await fetch(`${WEATHER_API_URL}?${params}`);

  if (!response.ok) {
    const error = new Error("Weather provider request failed");
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const condition = data.weather?.[0];

  if (!data.main || !data.wind || !condition) {
    const error = new Error("Weather provider returned incomplete data");
    error.status = 502;
    throw error;
  }

  return {
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    description: condition.description,
    icon: condition.icon,
  };
}
