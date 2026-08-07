export const PERSONALITIES = [
  {
    id: "cultural_explorer",
    name: "Cultural Explorer",
    emoji: "🌸",
    description: "You enjoy history, traditions, architecture, local culture and meaningful travel experiences."
  },
  {
    id: "adventure_seeker",
    name: "Adventure Seeker",
    emoji: "🏔",
    description: "You crave adrenaline, outdoor activities, hiking, and exploring the path less traveled."
  },
  {
    id: "food_lover",
    name: "Food Lover",
    emoji: "🍜",
    description: "You travel with your taste buds, seeking out local delicacies, street food, and fine dining."
  },
  {
    id: "photography_enthusiast",
    name: "Photography Enthusiast",
    emoji: "📷",
    description: "You have a keen eye for beauty, capturing breathtaking landscapes and vibrant city scenes."
  },
  {
    id: "beach_escapist",
    name: "Beach Escapist",
    emoji: "🏖",
    description: "You look for sun, sand, and relaxing vibes by the ocean to recharge your batteries."
  },
  {
    id: "luxury_traveler",
    name: "Luxury Traveler",
    emoji: "💎",
    description: "You appreciate the finer things in life, seeking premium accommodation, top-tier service, and exclusive experiences."
  },
  {
    id: "night_owl",
    name: "Night Owl",
    emoji: "🌃",
    description: "You thrive when the sun goes down, exploring city nightlife, clubs, bars, and late-night spots."
  },
  {
    id: "family_planner",
    name: "Family Planner",
    emoji: "👨👩👧",
    description: "You focus on creating lasting memories for the whole family, prioritizing comfort, safety, and kid-friendly activities."
  },
  {
    id: "nature_explorer",
    name: "Nature Explorer",
    emoji: "🌿",
    description: "You find peace in natural landscapes, from lush forests and majestic mountains to calm lakes."
  },
  {
    id: "backpacker",
    name: "Backpacker",
    emoji: "🎒",
    description: "You are a budget-conscious, independent traveler looking for authentic, long-term exploration."
  }
];

export function calculatePersonality(preferences) {
  if (!preferences || (!preferences.budget && !preferences.duration && !preferences.style && !preferences.interests)) {
    return null;
  }

  const scores = {
    cultural_explorer: 0,
    adventure_seeker: 0,
    food_lover: 0,
    photography_enthusiast: 0,
    beach_escapist: 0,
    luxury_traveler: 0,
    night_owl: 0,
    family_planner: 0,
    nature_explorer: 0,
    backpacker: 0
  };

  const interestsStr = (preferences.interests || "").toLowerCase();
  const budget = (preferences.budget || "").toLowerCase();
  const style = (preferences.style || "").toLowerCase();
  const season = (preferences.season || "").toLowerCase();
  const duration = (preferences.duration || "").toLowerCase();
  const travelers = Number(preferences.travelers) || 0;

  // 1. Scoring by Interests
  if (interestsStr.includes("culture")) {
    scores.cultural_explorer += 3;
    scores.photography_enthusiast += 1;
    scores.food_lover += 1;
  }
  if (interestsStr.includes("adventure")) {
    scores.adventure_seeker += 3;
    scores.nature_explorer += 1;
    scores.backpacker += 1;
  }
  if (interestsStr.includes("food")) {
    scores.food_lover += 3;
    scores.cultural_explorer += 1;
  }
  if (interestsStr.includes("photography")) {
    scores.photography_enthusiast += 3;
    scores.nature_explorer += 1;
    scores.cultural_explorer += 1;
  }
  if (interestsStr.includes("nightlife")) {
    scores.night_owl += 3;
    scores.adventure_seeker += 1;
  }
  if (interestsStr.includes("nature")) {
    scores.nature_explorer += 3;
    scores.adventure_seeker += 1;
    scores.beach_escapist += 1;
  }
  if (interestsStr.includes("luxury")) {
    scores.luxury_traveler += 3;
  }
  if (interestsStr.includes("shopping")) {
    scores.luxury_traveler += 2;
    scores.night_owl += 1;
  }

  // 2. Scoring by Budget
  if (budget === "luxury") {
    scores.luxury_traveler += 4;
    scores.cultural_explorer += 1;
  } else if (budget === "budget") {
    scores.backpacker += 4;
  } else if (budget === "comfort") {
    scores.family_planner += 1;
    scores.food_lover += 1;
  }

  // 3. Scoring by Travel Style & Travelers Count
  if (style === "family" || travelers >= 3) {
    scores.family_planner += 4;
  }
  if (style === "solo") {
    scores.backpacker += 2;
    scores.adventure_seeker += 1;
    scores.night_owl += 1;
  }
  if (style === "couple") {
    scores.beach_escapist += 2;
    scores.luxury_traveler += 1;
  }

  // 4. Scoring by Season
  if (season === "summer") {
    scores.beach_escapist += 3;
    scores.adventure_seeker += 1;
  } else if (season === "winter") {
    scores.adventure_seeker += 2;
  }

  // 5. Scoring by Duration
  if (duration.includes("10 day") || duration.includes("14 day")) {
    scores.backpacker += 2;
    scores.cultural_explorer += 1;
  } else if (duration.includes("3 day")) {
    scores.night_owl += 1;
  }

  // Determine highest scoring personality
  let maxScore = -1;
  let chosenId = null;

  for (const p of PERSONALITIES) {
    if (scores[p.id] > maxScore) {
      maxScore = scores[p.id];
      chosenId = p.id;
    }
  }

  return PERSONALITIES.find(p => p.id === chosenId) || null;
}
