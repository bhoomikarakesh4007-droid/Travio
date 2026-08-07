import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
});

// Load unified destinations catalog
const destinationsPath = path.join(__dirname, "../data/destinations.json");
const destinations = JSON.parse(fs.readFileSync(destinationsPath, "utf-8"));

export async function generateTravelPlan(data) {
  const catalogList = destinations.map(d => `- ${d.id} | ${d.name} | ${d.country}`).join("\n");
  const prompt = `
You are Travio AI.

Generate EXACTLY FOUR destination recommendations.

Choose destinations only from this Travio catalogue. Use the exact ID and title from this list; never invent a destination:

${catalogList}

Return ONLY valid JSON.

Do not write markdown.

Do not explain anything.

Return this structure:

{
  "recommendations":[
    {
      "id":"kyoto",
      "title":"",
      "country":"",
      "match":95,
      "budget":"",
      "bestSeason":"",
      "description":"",
      "highlights":[
        "",
        "",
        ""
      ]
    }
  ]
}

User Preferences

Budget: ${data.budget}

Duration: ${data.duration}

Travel Style: ${data.style}

Season: ${data.season}

Travelers: ${data.travelers}

Interests: ${data.interests}

`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed?.recommendations)) {
    throw new Error("Gemini returned an invalid recommendation payload.");
  }

  return parsed;
}

export async function generateDestinationDetails(destinationId) {
  const cacheFile = path.join(__dirname, "../data/cache_details.json");
  let cache = {};
  try {
    if (fs.existsSync(cacheFile)) {
      cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    }
  } catch (e) {
    console.error("Cache read failed:", e);
  }

  if (cache[destinationId]) {
    console.log(`[Cache Hit] Details for ${destinationId}`);
    return cache[destinationId];
  }

  const dest = destinations.find(d => d.id === destinationId);
  if (!dest) throw new Error(`Destination ${destinationId} not found in catalog`);

  const prompt = `You are a professional travel writer and expert.
Generate detailed tourist information for the destination "${dest.name}" in "${dest.country}".
The description of this place is: "${dest.description}".
It is famous for foods like: ${JSON.stringify(dest.famousFoods || dest.food || [])}.
It has highlights like: ${JSON.stringify(dest.highlights || dest.attractions || [])}.

Return ONLY valid JSON in exactly this structure:
{
  "about": [
    "Three detailed paragraphs about the destination's general overview, geography, and general tourism appeal.",
    "The second paragraph focusing on history, culture, local etiquette, and unique custom details.",
    "The third paragraph highlighting local sightseeing, things to do, vibe, and interesting facts."
  ],
  "bestTimeToVisit": "A concise sentence about the best time to visit based on climate and seasonality.",
  "averageDailyBudget": "Price range in USD (e.g. $120 - $220 USD per day) indicating budget category details.",
  "localTransport": "A concise sentence describing the public transit options, taxis, walkability, etc.",
  "safetyLevel": "Concise safety guidance indicating if it is safe, alert areas, pickpocket warnings, etc.",
  "emergencyNumber": "Local police/medical emergency numbers (e.g. 112 or 119).",
  "famousFoods": ["Food 1", "Food 2", "Food 3", "Food 4", "Food 5"],
  "travelTips": [
    "Tip 1 (local etiquette, currency, or cash info)",
    "Tip 2 (how to beat crowds or best times to visit)",
    "Tip 3 (transport or navigation app tip)",
    "Tip 4 (cultural custom or clothing recommendation)",
    "Tip 5 (any other practical safety or food tip)"
  ],
  "timezone": "Timezone string (e.g. GMT+9, CET, etc.)"
}

Do not include markdown tags or surrounding code blocks. Return only raw JSON.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(text);

  // Write to cache
  cache[destinationId] = parsed;
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf-8");
  } catch (e) {
    console.error("Cache write failed:", e);
  }

  return parsed;
}

export async function generateItineraryPlan(data) {
  const destName = data.destination?.name || "Destination";
  const days = parseDurationDays(data.preferences?.duration || "5-7 Days");
  const depCityName = data.departureCity?.name || "Bengaluru";

  const prompt = `Itinerary for "${destName}", ${data.destination?.country || ""}. Duration: ${days} days. Starting departure location: "${depCityName}".
Preferences: Budget: ${data.preferences?.budget || "Comfort"}, Style: ${data.preferences?.tripType || "Relaxation"}, Companions: ${data.preferences?.companions || "Solo"}, Season: ${data.preferences?.season || "Spring"}.
Hotel: "${data.hotels?.[0]?.name || "local hotel"}", Dining: "${data.restaurants?.[0]?.name || "local cafe"}".

CRITICAL: Day 1 MUST begin with travel departing from the user's starting location "${depCityName}" to "${destName}" (e.g. Leave home for airport, flight ${depCityName} → ${destName}, arrival at destination airport, transfer, hotel check-in, afternoon lunch, evening sightseeing).

Return ONLY raw JSON, no markdown code blocks:
{
  "itinerary": [
    {
      "day": "Day 1",
      "title": "Departure from ${depCityName} & Arrival in ${destName}",
      "time": "06:30 AM",
      "description": "2-3 sentences covering departure from ${depCityName}, flight to ${destName}, airport arrival, transfer to hotel check-in, lunch and evening sightseeing.",
      "icon": "✈️"
    }
  ]
}
Ensure exactly ${days} day items in array. Use relevant emojis for 'icon'.`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed?.itinerary)) {
    throw new Error("Invalid itinerary structure from Gemini");
  }
  return parsed.itinerary;
}

function parseDurationDays(durationStr = "5-7 Days") {
  const lowercase = durationStr.toLowerCase();
  if (lowercase.includes("weekend")) return 3;
  if (lowercase.includes("5-7")) return 6;
  if (lowercase.includes("1-2") || lowercase.includes("week")) return 10;
  if (lowercase.includes("longer")) return 15;
  return 6;
}


export async function optimizeRoutePlan(data) {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  if (candidates.length === 0) throw new Error("At least one route candidate is required.");

  const prompt = `You are Travio's route optimization engine. Build a practical one-day itinerary using ONLY the supplied candidates.

Optimize the order using the traveller's preferences, budget, travel style, opening hours, coordinates, ratings, and likely travel time. Keep meals at sensible times, do not schedule a venue outside its stated hours, cluster nearby places, and favour highly rated options when the trade-off is reasonable. Include every candidate exactly once. Do not invent places, facts, times, or IDs.

Return ONLY valid JSON in exactly this shape:
{
  "orderedStops": [{ "id": "candidate id", "time": "09:30 AM", "reason": "Short practical reason" }],
  "explanation": "One short sentence explaining the overall route choices."
}

Traveller preferences: ${JSON.stringify(data.preferences || {})}
Destination: ${JSON.stringify(data.destination || {})}
Route candidates: ${JSON.stringify(candidates)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(text);
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const orderedStops = parsed?.orderedStops;

  if (!Array.isArray(orderedStops) || orderedStops.length !== candidates.length) throw new Error("Gemini returned an incomplete route plan.");
  const returnedIds = orderedStops.map((stop) => stop?.id);
  if (new Set(returnedIds).size !== candidates.length || returnedIds.some((id) => !candidateIds.has(id))) throw new Error("Gemini returned invalid route candidate IDs.");

  return {
    orderedStops: orderedStops.map((stop) => ({ id: stop.id, time: typeof stop.time === "string" ? stop.time : "", reason: typeof stop.reason === "string" ? stop.reason : "" })),
    explanation: typeof parsed.explanation === "string" ? parsed.explanation : "Stops are grouped to reduce travel and fit the day naturally."
  };
}

export async function getChatResponse(message, chatHistory, context) {

  const systemInstruction = `You are Atlas, a helpful, friendly, natural, and knowledgeable travel companion and the control center of Travio.
Your goal is to answer travel questions and actively perform actions or output interactive cards to manage the user's trip.

CRITICAL RULES:
1. If the user's message is NOT related to travel, or if you cannot answer it, you must respond EXACTLY with this text:
"I'm not sure about that. Try asking another travel-related question."
Do NOT include any other details, conversational filler, or formatting.
2. Keep the conversation focused on travel topics. If the user asks about unrelated topics (such as math, coding, politics, philosophy, general knowledge unrelated to travel, or general assistance), respond with the exact fallback message above.
3. Do NOT build complete itineraries, packing lists, or budget plans. If the user asks for a detailed itinerary, packing list, or budget plan, politely decline by stating you can answer travel questions and recommend destinations, but cannot generate complete plans, itineraries, budget charts, or checklists.
4. Answer in a friendly, natural, informative, and practical tone. Avoid robotic, repetitive, or generic chatbot phrasing. Use headings, short readable paragraphs, and bullet points where appropriate to make the response well-structured.
5. You MUST automatically incorporate the user's active destination and current trip context (Budget, Travelers, Duration, Interests, Season) whenever provided. The user should never need to repeat the destination name. If they ask generic questions (e.g., 'Best restaurants?', 'What should I pack?', 'Hidden gems?'), automatically answer for the active destination.

INTERACTIVE CARDS & ACTION COMMANDS:
You must output specific tags at the end of your response when recommending items or performing actions so the Travio application can render interactive cards and execute actions.
Card Formats (Append at the end of text when recommending items):
- Destination Card: [DestinationCard: ID | CityName | Country | Description | ImageUrl]
  Use existing catalog IDs: kyoto, seoul, bali, rome, paris, banff, reykjavik, bergen, interlaken, auckland (or create a custom ID).
- Hotel Card: [HotelCard: Name | Rating | Price | Distance | ImageUrl]
- Restaurant Card: [RestaurantCard: Name | Cuisine | Rating | OpeningHours | ImageUrl]
- Attraction Card: [AttractionCard: Name | Description | ImageUrl]
- Packing Card: [PackingCard: Item1 | Item2 | Item3 | Item4 | Item5]
- Itinerary Card: [ItineraryCard: Day 1: Activity 1 | Day 2: Activity 2 | Day 3: Activity 3]

Action Formats (Append when user asks you to perform an action):
- Add to wishlist: [Action: add_wishlist | ID | CityName | Country | Description | ImageUrl]
- Remove from wishlist: [Action: remove_wishlist | ID]
- Add attraction to itinerary: [Action: add_attraction | Name | Description]
- Remove attraction: [Action: remove_attraction | Name]
- Add to packing checklist: [Action: add_packing | ItemName]
- Open location Map: [Action: open_map]
- Open Hotels tab: [Action: open_hotels]
- Open Restaurants tab: [Action: open_restaurants]

6. At the end of your response, you MUST generate exactly three suggested follow-up actions/questions that are highly relevant to the current conversation state and the user's context (e.g., 'Find nearby restaurants', 'Build a one-day itinerary', 'Estimate trip budget'). Format the suggestions at the very end of your response on a single line starting with the exact label 'Suggestions: ' followed by the three options separated by '|'. Example: 'Suggestions: Action 1 | Action 2 | Action 3'. Do NOT output suggestions if you are giving the non-travel fallback response.
`;

  let formattedHistory = "";
  if (Array.isArray(chatHistory)) {
    const recentHistory = chatHistory.slice(-10);
    for (const msg of recentHistory) {
      const speaker = msg.sender === "user" ? "User" : "Travio AI";
      formattedHistory += `${speaker}: ${msg.text}\n`;
    }
  }

  let contextPrompt = "";
  if (context) {
    contextPrompt = "\nCURRENT USER CONTEXT:\n";
    if (context.currentPage) {
      contextPrompt += `- Current Page: ${context.currentPage}\n`;
    }
    if (context.pageDescription) {
      contextPrompt += `- Page Description: ${context.pageDescription}\n`;
    }
    if (context.destination) {
      contextPrompt += `- Active Destination: ${context.destination.name} in ${context.destination.country}\n`;
    }
    if (context.preferences) {
      contextPrompt += `- User Travel Preferences:\n`;
      const p = context.preferences;
      if (p.budget) contextPrompt += `  * Budget: ${p.budget}\n`;
      if (p.duration) contextPrompt += `  * Duration: ${p.duration}\n`;
      if (p.style) contextPrompt += `  * Travel Style: ${p.style}\n`;
      if (p.season) contextPrompt += `  * Season: ${p.season}\n`;
      if (p.travelers) contextPrompt += `  * Travelers: ${p.travelers}\n`;
      if (p.interests) contextPrompt += `  * Interests: ${p.interests}\n`;
    }
    contextPrompt += `\nINSTRUCTION: Answer the user's question by prioritizing and incorporating this context (e.g., if the user is on a destination details page, answer specifically for that destination; if they have travel preferences set, tailor recommendations or advice to their preferences). If the user asks about local food, points of interest, weather, or travel details while on a specific destination page, provide answers specific to that destination.\n`;
  }

  const prompt = `${systemInstruction}
${contextPrompt}

Conversation history:
${formattedHistory}
User: ${message}
Travio AI:`;

  const result = await model.generateContent(prompt);
  const reply = result.response.text().trim();
  return reply;

}
