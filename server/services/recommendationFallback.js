const catalogue = [
  { id: "kyoto", title: "Kyoto", country: "Japan", budget: "Medium", bestSeason: "Spring or Autumn", description: "Ancient temples, cherry blossoms and traditional Japanese culture." },
  { id: "seoul", title: "Seoul", country: "South Korea", budget: "Medium", bestSeason: "Spring or Autumn", description: "A vibrant mix of palaces, food markets and modern city life." },
  { id: "bali", title: "Bali", country: "Indonesia", budget: "Budget", bestSeason: "April to October", description: "Tropical beaches, waterfalls and a relaxed island pace." },
  { id: "rome", title: "Rome", country: "Italy", budget: "Medium", bestSeason: "Spring or Autumn", description: "Historic landmarks, art and memorable Italian cuisine." },
  { id: "paris", title: "Paris", country: "France", budget: "Luxury", bestSeason: "Spring or Autumn", description: "Art, fashion and classic city experiences." },
  { id: "banff", title: "Banff", country: "Canada", budget: "Medium", bestSeason: "Summer or Winter", description: "Mountain lakes, scenic hikes and alpine adventures." },
  { id: "reykjavik", title: "Reykjavik", country: "Iceland", budget: "Luxury", bestSeason: "Summer or Winter", description: "Northern lights, geothermal landscapes and Nordic culture." },
  { id: "bergen", title: "Bergen", country: "Norway", budget: "Medium", bestSeason: "May to September", description: "Fjords, mountains and colourful waterfront views." },
  { id: "interlaken", title: "Interlaken", country: "Switzerland", budget: "Luxury", bestSeason: "Summer or Winter", description: "Alpine activities and spectacular lake-and-mountain scenery." },
  { id: "auckland", title: "Auckland", country: "New Zealand", budget: "Medium", bestSeason: "December to March", description: "Harbours, island day trips and outdoor adventures." },
  { id: "tokyo", title: "Tokyo", country: "Japan", budget: "Medium", bestSeason: "Spring or Autumn", description: "Vibrant neighborhoods, tech, shopping and world-class sushi." },
  { id: "jeju", title: "Jeju Island", country: "South Korea", budget: "Medium", bestSeason: "Spring or Summer", description: "Volcanic craters, beautiful beaches, and peaceful nature walks." },
  { id: "venice", title: "Venice", country: "Italy", budget: "Luxury", bestSeason: "Spring or Summer", description: "Romantic gondolas, historic canals, and Italian seafood delicacies." },
  { id: "nice", title: "Nice", country: "France", budget: "Luxury", bestSeason: "Summer or Spring", description: "Sun-soaked French Riviera beaches and Mediterranean old town vibes." },
  { id: "zermatt", title: "Zermatt", country: "Switzerland", budget: "Luxury", bestSeason: "Winter or Summer", description: "Scenic Matterhorn alpine views, ski resorts, and alpine fresh air." },
  { id: "tromso", title: "Tromsø", country: "Norway", budget: "Luxury", bestSeason: "Winter or Autumn", description: "Northern lights exploration, Arctic cathedral, and winter adventures." },
  { id: "sydney", title: "Sydney", country: "Australia", budget: "Luxury", bestSeason: "Spring or Summer", description: "Opera House landmarks, harbor views, and sandy beaches." },
  { id: "queenstown", title: "Queenstown", country: "New Zealand", budget: "Luxury", bestSeason: "Autumn or Winter", description: "Scenic mountain range hikes and extreme adventure sports." },
  { id: "bangkok", title: "Bangkok", country: "Thailand", budget: "Budget", bestSeason: "Cool Season", description: "Ornate temples, busy night markets, and delicious street foods." },
  { id: "phuket", title: "Phuket", country: "Thailand", budget: "Budget", bestSeason: "Winter or Spring", description: "Tropical beaches, limestone caves, and resort islands." },
  { id: "singapore", title: "Singapore City", country: "Singapore", budget: "Luxury", bestSeason: "Spring or Summer", description: "Clean cityscapes, supertree gardens, and diverse dining cultures." },
  { id: "dubai", title: "Dubai", country: "UAE", budget: "Luxury", bestSeason: "Winter or Spring", description: "Luxury malls, desert dunes safaris, and skyline architectural marvels." },
  { id: "barcelona", title: "Barcelona", country: "Spain", budget: "Medium", bestSeason: "Spring or Summer", description: "Whimsical architectural parks, beaches, and rich tapas walks." }
];

export function getFallbackRecommendations(preferences = {}) {
  const budget = preferences.budget || "Comfort";
  const tripType = preferences.tripType || "Relaxation";
  const season = preferences.season || "Spring";
  const duration = preferences.duration || "5-7 Days";
  
  // Calculate dynamic scores for each catalogue item
  const scoredItems = catalogue.map((dest) => {
    let score = 0;
    let totalWeight = 0;

    // 1. Budget match (Weight 10)
    totalWeight += 10;
    if (budget === "Budget" && dest.budget === "Budget") score += 10;
    else if (budget === "Luxury" && dest.budget === "Luxury") score += 10;
    else if (budget === "Comfort" && dest.budget === "Medium") score += 10;
    else score += 4; // partial match

    // 2. Trip Type / Vibe match (Weight 10)
    totalWeight += 10;
    const destThemes = dest.description.toLowerCase();
    if (destThemes.includes(tripType.toLowerCase())) {
      score += 10;
    } else {
      score += 3;
    }

    // 3. Season match (Weight 10)
    totalWeight += 10;
    if (dest.bestSeason.toLowerCase().includes(season.toLowerCase())) {
      score += 10;
    } else {
      score += 3;
    }

    // 4. Duration match (Weight 5)
    totalWeight += 5;
    const durationLower = duration.toLowerCase();
    if (durationLower.includes("weekend") && dest.description.toLowerCase().includes("compact")) {
      score += 5;
    } else {
      score += 3;
    }

    const finalMatch = Math.round((score / totalWeight) * 100);

    return {
      ...dest,
      match: finalMatch
    };
  });

  // Sort descending by score
  scoredItems.sort((a, b) => b.match - a.match);

  // Take top 4 recommendations
  return scoredItems.slice(0, 4);
}


