import { getWeather } from "../services/weatherService.js";

export async function getCurrentWeather(req, res) {
  const city = req.params.city?.trim();

  if (!city) {
    return res.status(400).json({ error: "A city is required" });
  }

  try {
    const weather = await getWeather(city);
    return res.json(weather);
  } catch (error) {
    console.error("Weather request failed:", error.message);
    const status = error.status === 404 ? 404 : error.status === 503 ? 503 : 502;
    return res.status(status).json({ error: "Unable to fetch weather for this city" });
  }
}
