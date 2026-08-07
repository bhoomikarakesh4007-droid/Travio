import { getChatResponse } from "./services/geminiService.js";

const prompt = `Write a morning briefing and travel suggestions for a traveler visiting Kyoto, Japan today.
Current weather: sunny, 22°C.
Planned attractions: Fushimi Inari Shrine.
Tipping custom: No tipping.

Please return EXACTLY in this format (do not use markdown formatting, markdown bullet points, or section headings):
[BRIEFING]
Good morning! (friendly, highly personalized 2-sentence morning briefing referencing the weather if available, and ending with a tip to start early at Fushimi Inari Shrine to avoid crowds).

[SUGGESTIONS]
- (first suggestion for timing or order of stops)
- (second suggestion, like a cafe suggestion or weather-related tips)`;

try {
  const reply = await getChatResponse(prompt, []);
  console.log("REPLY:\n", reply);
} catch (e) {
  console.error("ERROR:\n", e);
}
