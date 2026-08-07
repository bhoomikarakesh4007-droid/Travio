import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export async function fetchWeather(city) {
  if (!city) {
    throw new Error("City parameter is required");
  }
  const response = await axios.get(`${apiBaseUrl}/weather/${encodeURIComponent(city)}`);
  return response.data;
}

