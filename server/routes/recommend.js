const express = require("express");
const router = express.Router();
const { calculateMatches } = require("../utils/matcher");

// Travel Personality Helper Resolver using simple rules
function getTravelPersonality(preferences) {
  const { weather = "", crowd = "", budget = "", travelStyle = "" } = preferences;

  const styleLower = travelStyle.toLowerCase();
  const weatherLower = weather.toLowerCase();
  const crowdLower = crowd.toLowerCase();
  const budgetLower = budget.toLowerCase();

  // 1. Quiet + Nature + Windy -> Peace Seeker
  if (crowdLower === "quiet" && styleLower === "nature" && weatherLower === "windy") {
    return "Peace Seeker";
  }

  // 2. Adventure or Cold (Snow) -> Adventure Explorer
  if (styleLower === "adventure" || weatherLower === "snow") {
    return "Adventure Explorer";
  }

  // 3. Culture or Food -> Culture Hunter
  if (styleLower === "culture" || styleLower === "food") {
    return "Culture Hunter";
  }

  // 4. Relax (Beach) -> Sunset Chaser
  if (styleLower === "relax") {
    return "Sunset Chaser";
  }

  // 5. Luxury -> Luxury Traveller
  if (budgetLower === "high" || budgetLower === "₹25k+") {
    return "Luxury Traveller";
  }

  // Default fallback
  return "Vibe Explorer";
}

// POST /api/recommend endpoint
router.post("/recommend", (req, res) => {
  const { weather, crowd, budget, travelStyle, duration } = req.body;

  // Validate that all five fields exist
  if (!weather || !crowd || !budget || !travelStyle || !duration) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields."
    });
  }

  // Normalize budget representation for scoring compatibility
  let normalizedBudget = budget;
  if (budget === "₹5k–10k") {
    normalizedBudget = "Low";
  } else if (budget === "₹10k–25k") {
    normalizedBudget = "Medium";
  } else if (budget === "₹25k+") {
    normalizedBudget = "High";
  }

  const normalizedPrefs = {
    weather,
    crowd,
    budget: normalizedBudget,
    travelStyle,
    duration
  };

  // Run the matching engine
  const matches = calculateMatches(normalizedPrefs);

  // Generate Travel Personality based on preferences
  const personality = getTravelPersonality({
    weather,
    crowd,
    budget,
    travelStyle
  });

  return res.status(200).json({
    success: true,
    recommendations: matches,
    personality: personality
  });
});

module.exports = router;
