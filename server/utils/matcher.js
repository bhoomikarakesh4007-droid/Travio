const fs = require("fs");
const path = require("path");

// Read and load destinations from destinations.json
const destinationsPath = path.join(__dirname, "../data/destinations.json");

function getDestinations() {
  try {
    const rawData = fs.readFileSync(destinationsPath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("[Matcher] Error loading destinations database:", error);
    return [];
  }
}

/**
 * Calculates matching scores based on user preferences and returns the top 3 destinations.
 * 
 * Scoring rules:
 * - Weather Match = +30
 * - Crowd Match = +25
 * - Budget Match = +20
 * - Travel Style Match = +20
 * - Duration Match = +5
 */
function calculateMatches(preferences) {
  const destinations = getDestinations();
  const { weather, crowd, budget, travelStyle, duration } = preferences;

  const scoredDestinations = destinations.map((dest) => {
    let score = 0;
    let totalWeight = 0;

    // 1. Budget (Weight 8)
    totalWeight += 8;
    if (budget && dest.budget && dest.budget.toLowerCase() === budget.toLowerCase()) {
      score += 8;
    } else if (budget === "Medium" && dest.budget === "High") {
      score += 4;
    } else if (budget === "Medium" && dest.budget === "Low") {
      score += 4;
    }

    // 2. Trip Type / Travel Style (Weight 8)
    totalWeight += 8;
    if (travelStyle && Array.isArray(dest.travelStyle)) {
      if (dest.travelStyle.some(style => style.toLowerCase() === travelStyle.toLowerCase())) {
        score += 8;
      }
    }

    // 3. Season (Weight 8)
    totalWeight += 8;
    const seasonKeywords = [];
    if (weather && weather.toLowerCase() === "sunny") seasonKeywords.push("summer", "spring");
    if (weather && weather.toLowerCase() === "snow") seasonKeywords.push("winter");
    if (weather && weather.toLowerCase() === "cool") seasonKeywords.push("autumn", "spring");
    if (weather && weather.toLowerCase() === "windy") seasonKeywords.push("autumn", "winter");
    if (weather && weather.toLowerCase() === "rainy") seasonKeywords.push("spring", "summer", "autumn");

    const matchesSeason = dest.bestSeason && seasonKeywords.some(keyword => 
      dest.bestSeason.toLowerCase().includes(keyword)
    );
    if (matchesSeason) {
      score += 8;
    } else {
      score += 2;
    }

    // 4. Weather Preference (Weight 8)
    totalWeight += 8;
    if (weather && dest.weather && dest.weather.toLowerCase() === weather.toLowerCase()) {
      score += 8;
    } else if (weather && dest.bestSeason && dest.bestSeason.toLowerCase().includes(weather.toLowerCase())) {
      score += 6;
    }

    // 5. Travel Duration (Weight 8)
    totalWeight += 8;
    if (duration && Array.isArray(dest.duration)) {
      if (dest.duration.some(dur => dur.toLowerCase() === duration.toLowerCase())) {
        score += 8;
      }
    }

    // 6. Crowd Preference (Weight 8)
    totalWeight += 8;
    if (crowd && dest.crowd && dest.crowd.toLowerCase() === crowd.toLowerCase()) {
      score += 8;
    }

    // 7. Activities (Weight 8)
    totalWeight += 8;
    const themeKeywords = {
      nature: ["national park", "lake", "waterfall", "basalt", "mountain", "forest", "ocean", "valley"],
      culture: ["temple", "shrine", "palace", "cathedral", "museum", "history", "monument"],
      relax: ["beach", "gondola", "spa", "resort", "sunset", "villas", "lounge"],
      adventure: ["skytree", "hike", "climb", "bungee", "luge", "safari", "dunes"],
      food: ["sushi", "ramen", "tapas", "seafood", "market", "dining", "barbecue"]
    };
    const styleKey = travelStyle ? travelStyle.toLowerCase() : "";
    const keywords = themeKeywords[styleKey] || [];
    const matchesActivity = dest.attractions && dest.attractions.some(attr =>
      keywords.some(kw => attr.toLowerCase().includes(kw))
    );
    if (matchesActivity) {
      score += 8;
    } else {
      score += 3;
    }

    // 8. Nature (Weight 6)
    totalWeight += 6;
    const wantsNature = travelStyle && travelStyle.toLowerCase() === "nature";
    const hasNature = dest.travelStyle && dest.travelStyle.some(s => s.toLowerCase() === "nature");
    if (wantsNature === hasNature) {
      score += 6;
    } else if (hasNature) {
      score += 3;
    }

    // 9. Culture (Weight 6)
    totalWeight += 6;
    const wantsCulture = travelStyle && travelStyle.toLowerCase() === "culture";
    const hasCulture = dest.travelStyle && dest.travelStyle.some(s => s.toLowerCase() === "culture");
    if (wantsCulture === hasCulture) {
      score += 6;
    } else if (hasCulture) {
      score += 3;
    }

    // 10. Adventure (Weight 6)
    totalWeight += 6;
    const wantsAdventure = travelStyle && travelStyle.toLowerCase() === "adventure";
    const hasAdventure = dest.travelStyle && dest.travelStyle.some(s => s.toLowerCase() === "adventure");
    if (wantsAdventure === hasAdventure) {
      score += 6;
    } else if (hasAdventure) {
      score += 3;
    }

    // 11. Shopping (Weight 6)
    totalWeight += 6;
    const wantsShopping = travelStyle && travelStyle.toLowerCase() === "shopping";
    const hasShopping = dest.travelStyle && dest.travelStyle.some(s => s.toLowerCase() === "shopping") || (dest.attractions && dest.attractions.some(a => a.toLowerCase().includes("shop") || a.toLowerCase().includes("market")));
    if (wantsShopping === hasShopping) {
      score += 6;
    } else if (hasShopping) {
      score += 3;
    }

    // 12. Photography (Weight 6)
    totalWeight += 6;
    const wantsPhoto = travelStyle && (travelStyle.toLowerCase() === "relax" || travelStyle.toLowerCase() === "nature");
    const hasPhoto = dest.vibe && (dest.vibe.toLowerCase() === "scenic" || dest.vibe.toLowerCase() === "romantic" || dest.vibe.toLowerCase() === "historic");
    if (wantsPhoto === hasPhoto) {
      score += 6;
    } else if (hasPhoto) {
      score += 3;
    }

    // 13. Food (Weight 6)
    totalWeight += 6;
    const wantsFood = travelStyle && travelStyle.toLowerCase() === "food";
    const hasFood = dest.travelStyle && dest.travelStyle.some(s => s.toLowerCase() === "food") || (dest.food && dest.food.length > 0);
    if (wantsFood === hasFood) {
      score += 6;
    } else if (hasFood) {
      score += 3;
    }

    // 14. Luxury (Weight 6)
    totalWeight += 6;
    const wantsLuxury = travelStyle && travelStyle.toLowerCase() === "luxury" || budget === "High";
    const hasLuxury = dest.vibe && dest.vibe.toLowerCase() === "opulent" || dest.budget === "High";
    if (wantsLuxury === hasLuxury) {
      score += 6;
    } else if (hasLuxury) {
      score += 3;
    }

    // 15. Nightlife (Weight 6)
    totalWeight += 6;
    const wantsNightlife = travelStyle && (travelStyle.toLowerCase() === "food" || travelStyle.toLowerCase() === "shopping");
    const hasNightlife = dest.vibe && (dest.vibe.toLowerCase() === "energetic" || dest.vibe.toLowerCase() === "bustling");
    if (wantsNightlife === hasNightlife) {
      score += 6;
    } else if (hasNightlife) {
      score += 3;
    }

    const finalScore = Math.round((score / totalWeight) * 100);

    const confidenceLevel = 
      finalScore >= 90 ? "Excellent Match" :
      finalScore >= 75 ? "Great Match" :
      finalScore >= 60 ? "Good Match" :
      "Fair Match";

    return {
      id: dest.id,
      name: dest.name,
      country: dest.country,
      score: finalScore,
      travelVibeScore: finalScore,
      confidenceLevel: confidenceLevel,
      weather: dest.weather,
      budget: dest.budget,
      crowd: dest.crowd,
      travelStyle: dest.travelStyle,
      bestSeason: dest.bestSeason,
      imageFolder: dest.imageFolder,
      attractions: dest.attractions,
      food: dest.food
    };
  });

  // Sort descending by score, tiebreaker can be name
  scoredDestinations.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  // Take the top 3 matching destinations
  return scoredDestinations.slice(0, 3);
}

module.exports = {
  calculateMatches
};
