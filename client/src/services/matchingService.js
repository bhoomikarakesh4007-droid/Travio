import destinationData from "../data/destinationData";

// Define structured metadata for each destination to calculate exact matches.
const DESTINATION_PROFILES = {
  kyoto: {
    themes: ["Culture", "Nature", "Food", "Relaxation", "Shopping"],
    budget: ["Comfort", "Luxury"],
    seasons: ["Spring", "Autumn"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Mild & pleasant", "Cool & crisp"],
    crowd: ["Balanced", "Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Solo", "Partner", "Family"],
    lodging: ["Boutique Hotels", "5-Star Resorts", "Cozy Cabins / Villas"],
    activities: ["Ancient temples", "Cafés", "Local cuisine", "Spa & wellness", "Sunset chasing", "Souvenir shopping", "Quiet destinations", "Safety importance"]
  },
  seoul: {
    themes: ["Culture", "Food", "Shopping", "Nightlife"],
    budget: ["Budget", "Comfort"],
    seasons: ["Spring", "Autumn", "Summer"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Mild & pleasant", "Warm & sunny"],
    crowd: ["Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Solo", "Friends", "Partner"],
    lodging: ["Hostels & Homestays", "Boutique Hotels"],
    activities: ["Street food", "Cafés", "Local cuisine", "Designer boutiques", "Souvenir shopping", "Duty-free", "Meeting people", "Nightlife & bars", "Budget stays"]
  },
  bali: {
    themes: ["Relaxation", "Nature", "Adventure", "Luxury", "Food"],
    budget: ["Budget", "Comfort", "Luxury"],
    seasons: ["Summer", "Spring", "Autumn"],
    durations: ["5-7 Days", "1-2 Weeks", "Longer"],
    climate: ["Warm & sunny"],
    crowd: ["Balanced", "Quiet & Secluded"],
    transport: ["Private Driver"],
    companions: ["Solo", "Partner", "Friends", "Family"],
    lodging: ["Hostels & Homestays", "5-Star Resorts", "Cozy Cabins / Villas"],
    activities: ["Scuba diving", "Spa & wellness", "Sunset chasing", "Beach lounging", "Hot springs", "Street food", "Seafood", "Beach resorts", "Private villas", "Romantic dinners", "Couple spas", "Child-friendly attractions"]
  },
  rome: {
    themes: ["Culture", "Food", "Shopping"],
    budget: ["Comfort", "Luxury"],
    seasons: ["Spring", "Autumn", "Summer"],
    durations: ["Weekend", "5-7 Days", "1-2 Weeks"],
    climate: ["Mild & pleasant", "Warm & sunny"],
    crowd: ["Vibrant & Bustling", "Balanced"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Solo", "Partner", "Family", "Friends"],
    lodging: ["Boutique Hotels", "Hostels & Homestays"],
    activities: ["Ancient temples", "Museums", "Art galleries", "Fine dining", "Local cuisine", "Street food", "Romantic dinners", "Sunset views", "Safety importance"]
  },
  paris: {
    themes: ["Culture", "Food", "Shopping", "Luxury"],
    budget: ["Luxury", "Comfort"],
    seasons: ["Spring", "Autumn"],
    durations: ["Weekend", "5-7 Days", "1-2 Weeks"],
    climate: ["Mild & pleasant"],
    crowd: ["Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Partner", "Solo", "Friends"],
    lodging: ["Boutique Hotels", "5-Star Resorts"],
    activities: ["Museums", "Art galleries", "Fine dining", "Cafés", "Michelin restaurants", "Designer boutiques", "Duty-free", "Romantic dinners", "Boutique stays", "Couple spas"]
  },
  banff: {
    themes: ["Nature", "Adventure", "Relaxation"],
    budget: ["Comfort", "Luxury"],
    seasons: ["Summer", "Winter"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Cool & crisp", "Snowy & wintery"],
    crowd: ["Quiet & Secluded", "Balanced"],
    transport: ["Private Driver"],
    companions: ["Friends", "Family", "Partner", "Solo"],
    lodging: ["Cozy Cabins / Villas", "Boutique Hotels"],
    activities: ["Hiking", "Skiing", "Safari", "National parks", "Waterfalls", "Glaciers", "Spa & wellness", "Sunset chasing", "Group activities", "Child-friendly attractions"]
  },
  reykjavik: {
    themes: ["Nature", "Adventure", "Relaxation"],
    budget: ["Luxury"],
    seasons: ["Summer", "Winter", "Autumn"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Cool & crisp", "Snowy & wintery"],
    crowd: ["Quiet & Secluded"],
    transport: ["Private Driver"],
    companions: ["Solo", "Partner", "Friends"],
    lodging: ["Cozy Cabins / Villas", "Boutique Hotels"],
    activities: ["Hiking", "Safari", "Glaciers", "Hot springs", "Spa & wellness", "Sunset chasing", "Seafood", "Safety importance", "Quiet destinations"]
  },
  bergen: {
    themes: ["Nature", "Culture", "Relaxation"],
    budget: ["Comfort"],
    seasons: ["Summer", "Spring"],
    durations: ["Weekend", "5-7 Days"],
    climate: ["Cool & crisp", "Mild & pleasant"],
    crowd: ["Balanced", "Quiet & Secluded"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Solo", "Partner", "Family"],
    lodging: ["Boutique Hotels", "Hostels & Homestays"],
    activities: ["Hiking", "National parks", "Waterfalls", "Seafood", "Local cuisine", "Sunset chasing", "Quiet destinations", "Safety importance"]
  },
  interlaken: {
    themes: ["Adventure", "Nature", "Luxury"],
    budget: ["Luxury", "Comfort"],
    seasons: ["Summer", "Winter"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Cool & crisp", "Snowy & wintery"],
    crowd: ["Balanced", "Quiet & Secluded"],
    transport: ["Public Transit"],
    companions: ["Friends", "Partner", "Family"],
    lodging: ["Cozy Cabins / Villas", "5-Star Resorts"],
    activities: ["Hiking", "Skiing", "Volcanoes", "National parks", "Glaciers", "Fine dining", "Michelin restaurants", "Group activities", "Theme parks", "Boutique stays"]
  },
  auckland: {
    themes: ["Nature", "Adventure", "Food", "Relaxation"],
    budget: ["Comfort", "Medium"],
    seasons: ["Summer", "Autumn", "Spring"],
    durations: ["5-7 Days", "1-2 Weeks", "Longer"],
    climate: ["Mild & pleasant", "Warm & sunny"],
    crowd: ["Balanced"],
    transport: ["Public Transit", "Private Driver"],
    companions: ["Solo", "Family", "Friends", "Partner"],
    lodging: ["Boutique Hotels", "Cozy Cabins / Villas"],
    activities: ["Hiking", "Scuba diving", "Seafood", "Cafés", "National parks", "Waterfalls", "Sunset chasing", "Group activities", "Child-friendly attractions"]
  },
  tokyo: {
    themes: ["Culture", "Food", "Shopping", "Adventure", "Nightlife"],
    budget: ["Comfort", "Luxury", "High"],
    seasons: ["Spring", "Autumn"],
    durations: ["5-7 Days", "1-2 Weeks", "Longer"],
    climate: ["Mild & pleasant", "Warm & sunny"],
    crowd: ["Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Solo", "Friends", "Partner"],
    lodging: ["Boutique Hotels", "5-Star Resorts"],
    activities: ["Museums", "Art galleries", "Fine dining", "Cafés", "Michelin restaurants", "Designer boutiques", "Duty-free", "Romantic dinners", "Boutique stays", "Street food", "Local cuisine"]
  },
  jeju: {
    themes: ["Nature", "Relaxation", "Food"],
    budget: ["Comfort", "Budget", "Medium"],
    seasons: ["Spring", "Summer", "Autumn"],
    durations: ["5-7 Days", "Weekend"],
    climate: ["Warm & sunny", "Mild & pleasant"],
    crowd: ["Balanced", "Quiet & Secluded"],
    transport: ["Private Driver"],
    companions: ["Family", "Partner", "Solo"],
    lodging: ["Cozy Cabins / Villas", "Boutique Hotels"],
    activities: ["Volcanoes", "National parks", "Waterfalls", "Seafood", "Local cuisine", "Sunset chasing", "Beach lounging", "Spa & wellness", "Child-friendly attractions"]
  },
  venice: {
    themes: ["Culture", "Relaxation", "Food", "Luxury"],
    budget: ["Luxury", "Comfort", "High"],
    seasons: ["Spring", "Autumn", "Summer"],
    durations: ["Weekend", "5-7 Days"],
    climate: ["Mild & pleasant", "Warm & sunny"],
    crowd: ["Vibrant & Bustling", "Balanced"],
    transport: ["Walkable"],
    companions: ["Partner", "Solo"],
    lodging: ["Boutique Hotels", "5-Star Resorts"],
    activities: ["Museums", "Art galleries", "Fine dining", "Local cuisine", "Seafood", "Romantic dinners", "Sunset views", "Safety importance"]
  },
  nice: {
    themes: ["Relaxation", "Food", "Nature", "Luxury"],
    budget: ["Luxury", "Comfort", "High"],
    seasons: ["Summer", "Spring"],
    durations: ["Weekend", "5-7 Days"],
    climate: ["Warm & sunny", "Mild & pleasant"],
    crowd: ["Balanced", "Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Partner", "Friends", "Solo"],
    lodging: ["Boutique Hotels", "5-Star Resorts"],
    activities: ["Beach lounging", "Fine dining", "Seafood", "Local cuisine", "Sunset chasing", "Romantic dinners", "Couple spas", "Beach resorts", "Private villas"]
  },
  zermatt: {
    themes: ["Nature", "Adventure", "Relaxation", "Luxury"],
    budget: ["Luxury", "Comfort", "High"],
    seasons: ["Winter", "Summer"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Cool & crisp", "Snowy & wintery"],
    crowd: ["Quiet & Secluded", "Balanced"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Partner", "Solo", "Family"],
    lodging: ["Cozy Cabins / Villas", "5-Star Resorts"],
    activities: ["Hiking", "Skiing", "National parks", "Glaciers", "Spa & wellness", "Sunset chasing", "Fine dining", "Michelin restaurants", "Boutique stays"]
  },
  tromso: {
    themes: ["Nature", "Adventure", "Culture"],
    budget: ["Comfort", "Luxury", "High"],
    seasons: ["Winter", "Autumn"],
    durations: ["5-7 Days", "Weekend"],
    climate: ["Cool & crisp", "Snowy & wintery"],
    crowd: ["Quiet & Secluded"],
    transport: ["Public Transit", "Private Driver"],
    companions: ["Solo", "Partner", "Friends"],
    lodging: ["Cozy Cabins / Villas", "Boutique Hotels"],
    activities: ["Hiking", "Safari", "Glaciers", "Hot springs", "Spa & wellness", "Sunset chasing", "Seafood", "Safety importance", "Quiet destinations"]
  },
  sydney: {
    themes: ["Relaxation", "Nature", "Food", "Shopping"],
    budget: ["Comfort", "Luxury", "High"],
    seasons: ["Spring", "Autumn", "Summer"],
    durations: ["5-7 Days", "1-2 Weeks", "Longer"],
    climate: ["Warm & sunny", "Mild & pleasant"],
    crowd: ["Vibrant & Bustling", "Balanced"],
    transport: ["Public Transit", "Private Driver"],
    companions: ["Friends", "Family", "Partner", "Solo"],
    lodging: ["Boutique Hotels", "5-Star Resorts", "Hostels & Homestays"],
    activities: ["Hiking", "Scuba diving", "Beach lounging", "Seafood", "Cafés", "National parks", "Waterfalls", "Sunset chasing", "Group activities", "Child-friendly attractions"]
  },
  queenstown: {
    themes: ["Adventure", "Nature", "Food", "Relaxation"],
    budget: ["Comfort", "Luxury", "High"],
    seasons: ["Autumn", "Spring", "Summer", "Winter"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Mild & pleasant", "Cool & crisp", "Snowy & wintery"],
    crowd: ["Balanced", "Quiet & Secluded"],
    transport: ["Private Driver", "Public Transit"],
    companions: ["Friends", "Partner", "Solo", "Family"],
    lodging: ["Cozy Cabins / Villas", "Boutique Hotels"],
    activities: ["Hiking", "Skiing", "National parks", "Waterfalls", "Glaciers", "Spa & wellness", "Sunset chasing", "Group activities", "Child-friendly attractions"]
  },
  bangkok: {
    themes: ["Food", "Culture", "Shopping", "Nightlife"],
    budget: ["Budget", "Comfort", "Low"],
    seasons: ["Winter", "Autumn", "Spring"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Warm & sunny"],
    crowd: ["Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Friends", "Solo", "Partner"],
    lodging: ["Hostels & Homestays", "Boutique Hotels"],
    activities: ["Street food", "Cafés", "Local cuisine", "Designer boutiques", "Souvenir shopping", "Duty-free", "Meeting people", "Nightlife & bars", "Budget stays"]
  },
  phuket: {
    themes: ["Relaxation", "Nature", "Food", "Adventure"],
    budget: ["Budget", "Comfort", "Low"],
    seasons: ["Winter", "Spring", "Autumn"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Warm & sunny"],
    crowd: ["Vibrant & Bustling", "Balanced"],
    transport: ["Private Driver"],
    companions: ["Friends", "Partner", "Solo", "Family"],
    lodging: ["Hostels & Homestays", "Boutique Hotels", "5-Star Resorts"],
    activities: ["Scuba diving", "Beach lounging", "Spa & wellness", "Sunset chasing", "Street food", "Seafood", "Beach resorts", "Private villas", "Romantic dinners", "Couple spas", "Child-friendly attractions"]
  },
  singapore: {
    themes: ["Food", "Nature", "Relaxation", "Shopping", "Luxury"],
    budget: ["Luxury", "Comfort", "High"],
    seasons: ["Spring", "Summer", "Autumn", "Winter"],
    durations: ["Weekend", "5-7 Days"],
    climate: ["Warm & sunny", "Mild & pleasant"],
    crowd: ["Vibrant & Bustling"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Family", "Partner", "Solo", "Friends"],
    lodging: ["Boutique Hotels", "5-Star Resorts"],
    activities: ["Fine dining", "Cafés", "Michelin restaurants", "Designer boutiques", "Duty-free", "Romantic dinners", "Safety importance", "Theme parks", "Child-friendly attractions"]
  },
  dubai: {
    themes: ["Adventure", "Relaxation", "Culture", "Shopping", "Luxury"],
    budget: ["Luxury", "Comfort", "High"],
    seasons: ["Winter", "Spring", "Autumn"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Warm & sunny"],
    crowd: ["Vibrant & Bustling", "Balanced"],
    transport: ["Private Driver", "Public Transit"],
    companions: ["Partner", "Family", "Solo", "Friends"],
    lodging: ["5-Star Resorts", "Boutique Hotels"],
    activities: ["Safari", "Fine dining", "Michelin restaurants", "Designer boutiques", "Duty-free", "Romantic dinners", "Boutique stays", "Theme parks", "Child-friendly attractions"]
  },
  barcelona: {
    themes: ["Culture", "Food", "Relaxation", "Shopping", "Nightlife"],
    budget: ["Comfort", "Budget", "Medium"],
    seasons: ["Spring", "Autumn", "Summer"],
    durations: ["5-7 Days", "1-2 Weeks"],
    climate: ["Warm & sunny", "Mild & pleasant"],
    crowd: ["Vibrant & Bustling", "Balanced"],
    transport: ["Public Transit", "Walkable"],
    companions: ["Friends", "Partner", "Solo"],
    lodging: ["Boutique Hotels", "Hostels & Homestays"],
    activities: ["Museums", "Art galleries", "Fine dining", "Local cuisine", "Street food", "Romantic dinners", "Sunset views", "Beach lounging", "Nightlife & bars"]
  }
};

export function calculateDestinationMatches(userProfile = {}) {
  const matchesWithRaw = [];

  const tripType = userProfile.tripType || "Relaxation";
  const season = userProfile.season || "Spring";
  const companions = userProfile.companions || "Solo";
  const lodgingStyle = userProfile.lodgingStyle || "Boutique Hotels";
  const transportPreference = userProfile.transportPreference || "Public Transit";
  const budgetVal = userProfile.budget || "Comfort";
  const crowdPref = userProfile.crowdLevel || "Balanced";
  const duration = userProfile.duration || "5-7 Days";

  for (const [destId, dest] of Object.entries(destinationData)) {
    let profile = DESTINATION_PROFILES[destId];
    if (!profile) {
      profile = {
        themes: dest.travelStyle || ["Explore"],
        budget: [dest.budget || "Comfort"],
        seasons: [dest.bestSeason || "All Year"],
        durations: dest.duration || ["5-7 Days"],
        climate: [dest.weather || "Mild & pleasant"],
        crowd: [dest.crowd || "Balanced"],
        transport: ["Public Transit", "Walkable"],
        companions: ["Solo", "Partner", "Friends", "Family"],
        lodging: ["Boutique Hotels"],
        activities: dest.highlights || [dest.city]
      };
    }

    let score = 0;
    let totalWeight = 0;

    // 1. Budget Match (Weight: 8)
    totalWeight += 8;
    const destBudget = dest.budget || profile.budget[0];
    if (budgetVal === destBudget) {
      score += 8;
    } else if (profile.budget.includes(budgetVal)) {
      score += 8;
    } else if (budgetVal === "Comfort" || destBudget === "Medium" || destBudget === "Comfort") {
      score += 4; // partial match
    }

    // 2. Trip Type / Theme Match (Weight: 8)
    totalWeight += 8;
    if (profile.themes.includes(tripType)) {
      score += 8;
    }

    // 3. Season Match (Weight: 8)
    totalWeight += 8;
    if (profile.seasons.includes(season)) {
      score += 8;
    }

    // 4. Weather Preference Match (Weight: 8)
    totalWeight += 8;
    const weatherKeywords = [];
    if (season === "Summer") weatherKeywords.push("warm", "sunny", "hot");
    if (season === "Winter") weatherKeywords.push("snow", "cold", "wintery");
    if (season === "Spring") weatherKeywords.push("mild", "pleasant", "sunny");
    if (season === "Autumn") weatherKeywords.push("cool", "crisp", "windy");

    const matchesWeather = profile.climate.some(c => 
      weatherKeywords.some(keyword => c.toLowerCase().includes(keyword))
    );
    if (matchesWeather) {
      score += 8;
    } else {
      score += 2;
    }

    // 5. Travel Duration Match (Weight: 8)
    totalWeight += 8;
    if (profile.durations.includes(duration)) {
      score += 8;
    }

    // 6. Crowd Preference Match (Weight: 8)
    totalWeight += 8;
    if (profile.crowd.includes(crowdPref)) {
      score += 8;
    }

    // 7. Activities Match (Weight: 8)
    totalWeight += 8;
    if (userProfile.activityDetail && profile.activities.includes(userProfile.activityDetail)) {
      score += 8;
    } else if (profile.activities.some(act => act.toLowerCase().includes(tripType.toLowerCase()))) {
      score += 4;
    }

    // 8. Nature Vibe (Weight: 6)
    totalWeight += 6;
    const wantsNature = tripType === "Nature" || (userProfile.interests && userProfile.interests.includes("Nature"));
    const hasNature = profile.themes.includes("Nature");
    if (wantsNature === hasNature) {
      score += 6;
    } else if (hasNature) {
      score += 3;
    }

    // 9. Culture Vibe (Weight: 6)
    totalWeight += 6;
    const wantsCulture = tripType === "Culture" || (userProfile.interests && userProfile.interests.includes("Culture"));
    const hasCulture = profile.themes.includes("Culture");
    if (wantsCulture === hasCulture) {
      score += 6;
    } else if (hasCulture) {
      score += 3;
    }

    // 10. Adventure Vibe (Weight: 6)
    totalWeight += 6;
    const wantsAdventure = tripType === "Adventure" || (userProfile.interests && userProfile.interests.includes("Adventure"));
    const hasAdventure = profile.themes.includes("Adventure");
    if (wantsAdventure === hasAdventure) {
      score += 6;
    } else if (hasAdventure) {
      score += 3;
    }

    // 11. Shopping Vibe (Weight: 6)
    totalWeight += 6;
    const wantsShopping = tripType === "Shopping" || (userProfile.interests && userProfile.interests.includes("Shopping"));
    const hasShopping = profile.themes.includes("Shopping");
    if (wantsShopping === hasShopping) {
      score += 6;
    } else if (hasShopping) {
      score += 3;
    }

    // 12. Photography Vibe (Weight: 6)
    totalWeight += 6;
    const wantsPhoto = tripType === "Relaxation" || tripType === "Nature" || (userProfile.interests && userProfile.interests.includes("Photography"));
    const hasPhoto = profile.activities.includes("Photography") || profile.activities.includes("Sunset chasing") || profile.activities.includes("Sunset views");
    if (wantsPhoto === hasPhoto) {
      score += 6;
    } else if (hasPhoto) {
      score += 3;
    }

    // 13. Food Vibe (Weight: 6)
    totalWeight += 6;
    const wantsFood = tripType === "Food" || (userProfile.interests && userProfile.interests.includes("Food"));
    const hasFood = profile.themes.includes("Food");
    if (wantsFood === hasFood) {
      score += 6;
    } else if (hasFood) {
      score += 3;
    }

    // 14. Luxury Vibe (Weight: 6)
    totalWeight += 6;
    const wantsLuxury = tripType === "Luxury" || (userProfile.interests && userProfile.interests.includes("Luxury")) || budgetVal === "Luxury";
    const hasLuxury = profile.themes.includes("Luxury");
    if (wantsLuxury === hasLuxury) {
      score += 6;
    } else if (hasLuxury) {
      score += 3;
    }

    // 15. Nightlife Vibe (Weight: 6)
    totalWeight += 6;
    const wantsNightlife = tripType === "Food" || tripType === "Shopping" || (userProfile.interests && userProfile.interests.includes("Nightlife"));
    const hasNightlife = profile.themes.includes("Nightlife");
    if (wantsNightlife === hasNightlife) {
      score += 6;
    } else if (hasNightlife) {
      score += 3;
    }

    // 16. Location Influence (Weight: 10)
    if (userProfile.userLocationCountry) {
      totalWeight += 10;
      const isDomestic = dest.country.toLowerCase() === userProfile.userLocationCountry.toLowerCase() ||
        (userProfile.userLocationCountry.toLowerCase() === "europe" && ["france", "germany", "italy", "spain", "switzerland", "netherlands", "greece", "norway", "iceland"].includes(dest.country.toLowerCase()));
      
      if (isDomestic) {
        if (budgetVal === "Budget" || budgetVal === "Low" || duration === "Weekend" || duration === "3-5 Days") {
          score += 10; // full domestic boost
        } else if (budgetVal === "Luxury" || budgetVal === "High" || duration === "1-2 Weeks" || duration === "Longer") {
          score += 3; // minimal domestic boost (lets international win)
        } else {
          score += 7; // standard moderate domestic boost
        }
      } else {
        // International destination
        if (budgetVal === "Luxury" || budgetVal === "High" || duration === "1-2 Weeks" || duration === "Longer") {
          score += 8; // high score for international under luxury/long
        } else {
          score += 2; // low score for international under budget/short
        }
      }
    }

    // Calculate dynamic final match percentage
    const finalScore = Math.round((score / totalWeight) * 100);

    // Generate Personalized Match Explanation
    const highlightsText = dest.highlights[0] || "signature sights";
    const foodText = dest.famousFoods[0] || "local cuisine";
    
    let whyItMatches = `Matches your style because you are looking for a ${tripType.toLowerCase()} trip in ${season}. `;
    whyItMatches += `Since you are traveling ${companions === "Solo" ? "solo" : `with ${companions.toLowerCase()}`}, you'll appreciate the local ${profile.crowd[0].toLowerCase()} atmosphere. `;
    whyItMatches += `Your preference for ${lodgingStyle.toLowerCase()} and ${transportPreference.toLowerCase()} aligns nicely with the infrastructure in ${dest.city}. `;
    whyItMatches += `Must-do highlights include visiting the ${highlightsText} and trying local ${foodText}.`;

    matchesWithRaw.push({
      dest,
      profile,
      rawScore: finalScore,
      whyItMatches
    });
  }

  const rawScores = matchesWithRaw.map(m => m.rawScore);
  const minRaw = Math.min(...rawScores);
  const maxRaw = Math.max(...rawScores);
  const rawRange = maxRaw - minRaw;

  const recommendations = matchesWithRaw.map(({ dest, profile, rawScore, whyItMatches }) => {
    let finalScore = 90;
    if (rawRange > 0) {
      finalScore = Math.round(72 + ((rawScore - minRaw) / rawRange) * (98 - 72));
    } else {
      finalScore = 98;
    }

    return {
      id: dest.id,
      title: dest.title,
      country: dest.country,
      match: finalScore,
      budget: dest.budget,
      bestSeason: dest.bestSeason,
      description: dest.description,
      whyItMatches,
      recommendedTripLength: duration
    };
  });

  // Sort descending by match score, and name as tie-breaker
  return recommendations.sort((a, b) => b.match - a.match || a.title.localeCompare(b.title));
}
