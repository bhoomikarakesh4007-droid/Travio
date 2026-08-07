import { generateTravelPlan, getChatResponse, optimizeRoutePlan, generateDestinationDetails, generateItineraryPlan } from "../services/geminiService.js";
import { getFallbackRecommendations } from "../services/recommendationFallback.js";
import { getKnowledgeAnswer } from "../services/atlasKnowledgeService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destinationsPath = path.join(__dirname, "../data/destinations.json");
const cacheItineraryPath = path.join(__dirname, "../data/cache_itinerary.json");
const destinations = JSON.parse(fs.readFileSync(destinationsPath, "utf-8"));

// Request timeout helper: rejects after ms milliseconds
const withTimeout = (promise, ms, name = "AI Service") => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${name} request timed out after ${ms}ms`));
        }, ms);
    });
    return Promise.race([
        promise.then((res) => {
            clearTimeout(timeoutId);
            return res;
        }),
        timeoutPromise
    ]);
};

export async function generateTrip(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: "Request payload is required." });
    }

    try {
        const response = await withTimeout(generateTravelPlan(req.body), 15000, "Travel Plan Generation");

        if (!Array.isArray(response?.recommendations) || response.recommendations.length === 0) {
            throw new Error("The AI response did not contain recommendations.");
        }

        return res.json({ ...response, source: "ai" });
    }
    catch (error) {
        console.error("[Recommendations] AI generation failed; serving local fallback.", error.message || error);

        return res.status(200).json({
            recommendations: getFallbackRecommendations(req.body),
            source: "fallback",
            message: "AI recommendations are temporarily unavailable, so we selected curated destinations for you."
        });
    }
}

export async function chatWithAssistant(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: "Request payload is required." });
    }

    try {
        const { message, history, context } = req.body;

        if (!message || typeof message !== "string" || message.trim() === "") {
            return res.status(400).json({ error: "Message is required." });
        }

        // Check if the query is about Travio and can be answered locally
        const localAnswer = getKnowledgeAnswer(message);
        if (localAnswer !== null) {
            return res.json({ reply: localAnswer });
        }

        const reply = await withTimeout(getChatResponse(message, history, context), 15000, "Chat Response");

        return res.json({ reply });
    }
    catch (error) {
        console.error("[Chat] AI concierge failed:", error.message || error);

        const errorMsg = error.message || String(error);

        if (
            !process.env.GEMINI_API_KEY ||
            process.env.GEMINI_API_KEY.trim() === "" ||
            errorMsg.includes("API key") ||
            errorMsg.includes("API_KEY") ||
            errorMsg.includes("not valid") ||
            errorMsg.toLowerCase().includes("key")
        ) {
            return res.json({
                reply: `Atlas configuration error: ${errorMsg || "GEMINI_API_KEY is missing or invalid in server .env"}. Please verify your setup.`
            });
        }

        return res.json({
            reply: "I'm having trouble reaching my travel knowledge right now. Please try again in a moment."
        });
    }
}

function getRouteFallback(candidates) {
    const score = (candidate) => Number(candidate.rating) || 0;
    const meals = candidates.filter((candidate) => candidate.type === "restaurant").sort((a, b) => score(b) - score(a));
    const sights = candidates.filter((candidate) => candidate.type === "attraction").sort((a, b) => score(b) - score(a));
    const others = candidates.filter((candidate) => !["restaurant", "attraction"].includes(candidate.type));
    const ordered = [...others, ...sights.slice(0, 1), ...meals.slice(0, 1), ...sights.slice(1), ...meals.slice(1)];

    return {
        orderedStops: ordered.map((candidate, index) => ({
            id: candidate.id,
            time: "",
            reason: index === 0 ? "A convenient first stop for the day." : "Ordered to keep the day efficient and preference-aware."
        })),
        explanation: "Stops are grouped by type and rating to keep the day practical while Gemini is unavailable."
    };
}

export async function generateSmartRoute(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: "Request payload is required." });
    }

    const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates : [];

    if (candidates.length === 0) {
        return res.status(400).json({ error: "Route candidates are required." });
    }

    try {
        const route = await withTimeout(optimizeRoutePlan(req.body), 15000, "Route Optimization");
        return res.json({ ...route, source: "ai" });
    } catch (error) {
        console.error("[Route planner] Gemini route optimization failed; serving local fallback.", error.message || error);
        return res.json({ ...getRouteFallback(candidates), source: "fallback" });
    }
}

export async function getDestinationDetails(req, res) {
    const destinationId = req.params.id;

    if (!destinationId || typeof destinationId !== "string" || destinationId.trim() === "") {
        return res.status(400).json({ error: "Destination ID is required." });
    }

    try {
        const details = await withTimeout(generateDestinationDetails(destinationId), 15000, "Destination Details");
        return res.json({ success: true, details });
    } catch (error) {
        console.error(`[Destination Details] Gemini details generation failed for ${destinationId}; serving local fallback.`, error.message || error);

        const dest = destinations.find(d => d.id === destinationId);
        if (!dest) {
            return res.status(404).json({ error: "Destination not found" });
        }

        const budgetLevel = dest.budget || "Comfort";
        const budgetMap = { High: "$120 - $220 USD per day", Medium: "$70 - $140 USD per day", Low: "$35 - $70 USD per day" };
        const transportMap = {
            Japan: "Extensive train networks, clean subways, and walking are primary.",
            SouthKorea: "Extensive clean subways and city buses using T-money cards.",
            Italy: "City buses, walking historic cobblestone streets, and regional trains.",
            France: "Dense Métro networks, local tram lines, and public bike systems.",
            Switzerland: "Extensive scenic Swiss rail networks and city walking.",
            Norway: "Reliable city light rails, buses, or private vehicle rental.",
            Iceland: "Private vehicle rental or guided tours, limited public buses.",
            Canada: "Local municipal transit networks or car rental for national parks.",
            Australia: "Clean city trains, light rail, buses, and harbor ferries.",
            NewZealand: "City bus systems and walking; car rental is common.",
            Thailand: "Skytrain (BTS), subway (MRT), local tuk-tuks, and taxis.",
            Singapore: "Ultra-modern, fast MRT subways and city double-decker buses.",
            UAE: "Driver apps like Careem, city Metro systems, and taxis."
        };
        const transport = transportMap[dest.country.replace(/\s/g, "")] || "Local city buses and walking.";

        const emergencyMap = {
            Japan: "119 / 110",
            SouthKorea: "119 / 112",
            Australia: "000",
            NewZealand: "111",
            Thailand: "191 / 1155 (Tourist)",
            USA: "911",
            Canada: "911",
            Singapore: "995 / 999"
        };
        const emergencyNumber = emergencyMap[dest.country.replace(/\s/g, "")] || "112";

        const timezoneMap = {
            Japan: "JST (UTC+9)",
            SouthKorea: "KST (UTC+9)",
            Australia: "AEST (UTC+10)",
            NewZealand: "NZST (UTC+12)",
            Thailand: "ICT (UTC+7)",
            Singapore: "SGT (UTC+8)",
            UAE: "GST (UTC+4)",
            Spain: "CET (UTC+1)",
            Italy: "CET (UTC+1)",
            France: "CET (UTC+1)",
            Switzerland: "CET (UTC+1)",
            Norway: "CET (UTC+1)",
            Iceland: "GMT (UTC+0)",
            Canada: "MST (UTC-7)"
        };
        const timezone = timezoneMap[dest.country.replace(/\s/g, "")] || "UTC+1";

        const fallbackDetails = {
            about: [
                `Welcome to ${dest.name}, a premier destination located in ${dest.country}. Known for its unique ${dest.vibe.toLowerCase()} atmosphere, it offers an incredible mix of sightseeing and rich experiences.`,
                `The local history and heritage are visible in iconic landmarks like ${dest.highlights.slice(0, 2).join(" and ")}. Visitors can immerse themselves in the local culture, tradition, and custom etiquette during their stay.`,
                `Explore signature highlights, enjoy delicious dining options, and connect with the welcoming local community. With scenic viewpoints and highly rated activities, ${dest.name} promises an unforgettable travel adventure.`
            ],
            bestTimeToVisit: dest.bestSeason || "Spring and Autumn months",
            averageDailyBudget: budgetMap[budgetLevel] || "$80 - $150 USD per day",
            localTransport: transport,
            safetyLevel: "High (Safe for solo and family travelers, standard precautions apply)",
            emergencyNumber: emergencyNumber,
            famousFoods: dest.famousFoods || dest.food || ["Local Specialities"],
            travelTips: [
                `Carry a mix of cards and local cash for small purchases or vendors.`,
                `Plan to visit top sights like ${dest.highlights[0]} early to beat the crowds.`,
                `Download local offline maps to navigate transit routes seamlessly.`,
                `Dress respectfully and observe local etiquette when visiting sacred or historic sites.`,
                `Ask restaurant staff for recommendation specials to try local cuisine.`
            ],
            timezone: timezone
        };

        return res.json({ success: true, details: fallbackDetails, source: "fallback" });
    }
}

export async function generateItinerary(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: "Request payload is required." });
    }

    const data = req.body || {};
    const destination = data.destination || {};
    const preferences = data.preferences || {};
    const hotels = data.hotels || [];
    const restaurants = data.restaurants || [];
    const attractions = data.candidates || [];

    const destName = destination.name || destination.city || "Destination";
    const durationStr = preferences.duration || "5-7 Days";
    const budget = preferences.budget || "Comfort";
    const tripType = preferences.tripType || "Relaxation";
    const companions = preferences.companions || "Solo";
    const season = preferences.season || "Spring";

    const days = parseDurationDaysFallback(durationStr);

    const cacheKey = `${destName.toLowerCase()}_${days}_${budget.toLowerCase()}_${tripType.toLowerCase()}_${companions.toLowerCase()}_${season.toLowerCase()}`.replace(/\s+/g, "_");

    // 1. Try to read from cache
    let cache = {};
    try {
        if (fs.existsSync(cacheItineraryPath)) {
            cache = JSON.parse(fs.readFileSync(cacheItineraryPath, "utf-8"));
        }
    } catch (e) {
        console.error("Itinerary cache read failed:", e);
    }

    if (cache[cacheKey]) {
        console.log(`[Cache Hit] Itinerary for ${cacheKey}`);
        return res.json({ success: true, itinerary: cache[cacheKey], source: "cache" });
    }

    try {
        const itinerary = await withTimeout(generateItineraryPlan(data), 20000, "Itinerary Generation");

        // 2. Write to cache
        cache[cacheKey] = itinerary;
        try {
            fs.writeFileSync(cacheItineraryPath, JSON.stringify(cache, null, 2), "utf-8");
        } catch (e) {
            console.error("Itinerary cache write failed:", e);
        }

        return res.json({ success: true, itinerary, source: "ai" });
    } catch (error) {
        console.error("[Itinerary Details] Gemini itinerary generation failed; serving fallback.", error.message || error);

        const hotelName = hotels[0]?.name || `${destName} Grand Stay`;
        const restaurantName = restaurants[0]?.name || "Local Pizzeria / Diner";
        const highlights = attractions.filter(c => c.type === "attraction").map(c => c.name) || ["local sights"];
        const famousFoods = destination.famousFoods || destination.food || ["local dishes"];

        const itineraryList = [];
        for (let i = 1; i <= days; i++) {
            let title = "";
            let description = "";
            let time = "09:00 AM";
            let icon = "📍";

            if (i === 1) {
                title = `Arrival & Check-in at ${hotelName}`;
                time = "10:30 AM";
                description = `Arrive at the destination. Unpack and check in to your hotel at ${hotelName}. Spend your first afternoon walking around local streets and getting acclimated.`;
                icon = "✈️";
            } else if (i === days) {
                title = `Departure from ${destName}`;
                time = "10:00 AM";
                description = `Pack your bags, check out of ${hotelName}. Grab a final souvenir or coffee in the central plaza, and head back to the airport.`;
                icon = "🛫";
            } else {
                const highlight = highlights[(i - 2) % highlights.length] || "the main square";
                const food = famousFoods[(i - 2) % famousFoods.length] || "traditional food";

                if (i % 2 === 0) {
                    title = `Exploring ${highlight}`;
                    time = "09:30 AM";
                    description = `Spend your day visiting ${highlight}, one of the top attractions. Later, enjoy a traditional lunch at ${restaurantName} and try some authentic ${food}.`;
                    icon = "🏰";
                } else {
                    title = `Local Sights & Vibe`;
                    time = "10:00 AM";
                    description = `Walk through local scenic viewpoints or parks. Immerse yourself in the local atmosphere and try some signature ${food} for dinner.`;
                    icon = "🌳";
                }
            }

            itineraryList.push({
                day: `Day ${i}`,
                title,
                time,
                description,
                icon
            });
        }

        return res.json({ success: true, itinerary: itineraryList, source: "fallback" });
    }
}

function parseDurationDaysFallback(durationStr = "5-7 Days") {
    const lowercase = durationStr.toLowerCase();
    if (lowercase.includes("weekend")) return 3;
    if (lowercase.includes("5-7")) return 6;
    if (lowercase.includes("1-2") || lowercase.includes("week")) return 10;
    if (lowercase.includes("longer")) return 15;
    return 6;
}
