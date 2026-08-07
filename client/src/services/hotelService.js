import axios from "axios";

// Session-level cache for hotels
const hotelSessionCache = new Map();

// Helper: Calculates distance between two points in km (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateFallbackHotels(cityName, destinationCoords, budgetLevel) {
  const lat = destinationCoords && destinationCoords.length === 2 ? parseFloat(destinationCoords[0]) : 12.9716;
  const lon = destinationCoords && destinationCoords.length === 2 ? parseFloat(destinationCoords[1]) : 77.5946;
  const tier = (budgetLevel || "Comfort").toLowerCase();

  const hotelTemplates = [
    { prefix: "The Grand", suffix: "Palace & Resort", tier: "luxury", price: 340, rating: 4.9, dist: 1.2 },
    { prefix: "Boutique", suffix: "Suites", tier: "comfort", price: 145, rating: 4.7, dist: 0.8 },
    { prefix: "Central", suffix: "Residency", tier: "comfort", price: 110, rating: 4.5, dist: 2.1 },
    { prefix: "Heritage", suffix: "Haven", tier: "comfort", price: 160, rating: 4.8, dist: 1.5 },
    { prefix: "Backpackers", suffix: "Lounge", tier: "budget", price: 45, rating: 4.3, dist: 2.8 },
    { prefix: "Crown Plaza", suffix: cityName, tier: "luxury", price: 290, rating: 4.6, dist: 3.4 }
  ];

  const images = {
    budget: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80"
    ],
    comfort: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80"
    ],
    luxury: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80"
    ]
  };

  const amenities = {
    budget: ["Free WiFi", "Shared Kitchen", "Bicycle Rental", "Social Lounge"],
    comfort: ["Free WiFi", "Buffet Breakfast", "Fitness Center", "Co-working Space"],
    luxury: ["Free WiFi", "Infinity Pool", "Luxury Spa", "24/7 Butler Service"]
  };

  return hotelTemplates.map((tpl, idx) => {
    const name = tpl.prefix.includes(cityName) ? tpl.prefix : `${tpl.prefix} ${cityName} ${tpl.suffix}`;
    const offsetLat = lat + (idx % 2 === 0 ? 0.008 * (idx + 1) : -0.008 * idx);
    const offsetLon = lon + (idx % 2 === 1 ? 0.008 * (idx + 1) : -0.008 * idx);
    const imgList = images[tpl.tier] || images.comfort;
    const amList = amenities[tpl.tier] || amenities.comfort;

    return {
      id: `fallback-h-${cityName.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
      name,
      rating: tpl.rating,
      ratingsCount: 140 + idx * 35,
      address: `Central District, ${cityName}`,
      distance: `${tpl.dist} km from center`,
      priceLevel: tpl.tier === "budget" ? "$" : tpl.tier === "luxury" ? "$$$" : "$$",
      openingStatus: "Open Now",
      phone: "+1 (555) 234-5678",
      website: "https://travio.app",
      businessStatus: "Operational",
      googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ", " + cityName)}`,
      pricePerNight: tpl.price,
      attractions: `Enjoy a premium stay at ${name}. Conveniently located near central sightseeing spots in ${cityName}.`,
      amenities: amList,
      photo: imgList[idx % imgList.length],
      coordinates: [offsetLat, offsetLon],
      checkIn: "From 3:00 PM",
      checkOut: "Until 11:00 AM",
      matchScore: 92 - idx * 2,
      atlasExplanation: `Recommended because it is centrally located in ${cityName} and offers high-rated amenities matching your travel preferences.`,
      whyAtlasRecommends: [
        `Highly rated by travelers (${tpl.rating}/5.0)`,
        `Convenient distance from center (${tpl.dist} km)`,
        "High-speed WiFi included in room rate",
        "Complimentary breakfast option available"
      ],
      isAtlasPick: idx === 0
    };
  });
}

/**
 * Fetches real hotels in a given city using OpenStreetMap's Nominatim Search API.
 * Maps coordinates, calculates real distances, and overlays visual properties matching the budget.
 *
 * @param {string} cityName Name of the city to search hotels for.
 * @param {Array<number>} destinationCoords Coordinates [lat, lon] of the city center.
 * @param {string} budgetLevel Selected budget level ("Budget", "Comfort", "Luxury").
 */
export async function fetchHotels(cityName, destinationCoords, budgetLevel = "Comfort") {
  if (!cityName) {
    throw new Error("City name parameter is required");
  }

  // Construct a cache key
  const cacheKey = `${cityName.toLowerCase()}_${budgetLevel.toLowerCase()}`;
  if (hotelSessionCache.has(cacheKey)) {
    console.log(`[HotelService] Returning cached hotels for key: ${cacheKey}`);
    return hotelSessionCache.get(cacheKey);
  }

  // 1. Attempt to fetch from Travio Backend API
  try {
    const lat = destinationCoords && destinationCoords.length === 2 ? destinationCoords[0] : "";
    const lng = destinationCoords && destinationCoords.length === 2 ? destinationCoords[1] : "";
    const backendUrl = `http://localhost:5000/api/hotels?city=${encodeURIComponent(cityName)}&budget=${encodeURIComponent(budgetLevel)}&lat=${lat}&lng=${lng}`;
    const res = await axios.get(backendUrl, { timeout: 4000 });
    if (res.data && res.data.success && Array.isArray(res.data.hotels) && res.data.hotels.length > 0) {
      console.log(`[HotelService] Successfully fetched ${res.data.hotels.length} hotels from backend API`);
      hotelSessionCache.set(cacheKey, res.data.hotels);
      return res.data.hotels;
    }
  } catch (backendErr) {
    console.warn("[HotelService] Backend API unavailable or timed out, falling back to direct OSM service", backendErr.message);
  }

  let rawHotels = [];

  // Query Nominatim API with coordinates bounding box if coordinates are available
  if (destinationCoords && Array.isArray(destinationCoords) && destinationCoords.length === 2) {
    const lat = parseFloat(destinationCoords[0]);
    const lon = parseFloat(destinationCoords[1]);
    
    // 8 km radius in degrees (~0.072 degrees)
    const delta = 0.072;
    const minLat = lat - delta;
    const maxLat = lat + delta;
    const minLon = lon - delta / Math.cos((lat * Math.PI) / 180);
    const maxLon = lon + delta / Math.cos((lat * Math.PI) / 180);

    const url = `https://nominatim.openstreetmap.org/search?q=hotel&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&format=json&limit=10&extratags=1&addressdetails=1`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "TravioTravelPlanner/1.0 (contact@travio.io)"
        }
      });
      rawHotels = response.data;
    } catch (err) {
      console.warn("[HotelService] Bounding box search failed, trying fallback search", err);
    }
  }

  // Fallback to text search if no results found or coordinates missing
  if (!rawHotels || !Array.isArray(rawHotels) || rawHotels.length === 0) {
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=hotel+in+${encodeURIComponent(
      cityName
    )}&format=json&limit=10&extratags=1&addressdetails=1`;

    try {
      const response = await axios.get(fallbackUrl, {
        headers: {
          "User-Agent": "TravioTravelPlanner/1.0 (contact@travio.io)"
        }
      });
      rawHotels = response.data;
    } catch (err) {
      console.error("[HotelService] Text fallback search failed", err);
    }
  }

  if (!rawHotels || !Array.isArray(rawHotels) || rawHotels.length === 0) {
    return generateFallbackHotels(cityName, destinationCoords, budgetLevel);
  }

  // Pre-curated premium images from Unsplash matching budget levels
  const hotelImages = {
    budget: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80"
    ],
    comfort: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80"
    ],
    luxury: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80"
    ]
  };

  // Standard hotel amenities matching budget tier
  const amenitiesList = {
    budget: ["Free WiFi", "Shared Kitchen", "Bicycle Rental", "Laundry Services", "Social Lounge", "Lockers"],
    comfort: ["Free WiFi", "Buffet Breakfast", "Fitness Center", "Co-working Space", "Rooftop Lounge", "Room Service"],
    luxury: ["Free WiFi", "Infinity Pool", "Luxury Spa", "24/7 Butler Service", "Michelin Dining", "Chauffeur Service"]
  };

  const tier = budgetLevel.toLowerCase();
  const images = hotelImages[tier] || hotelImages.comfort;
  const amenities = amenitiesList[tier] || amenitiesList.comfort;

  // Retrieve user quiz preferences from SessionStorage
  let quizAnswers = null;
  try {
    const stored = sessionStorage.getItem("travio_user_preferences");
    if (stored) {
      quizAnswers = JSON.parse(stored);
    }
  } catch (e) {
    console.error("[HotelService] Error parsing user preferences", e);
  }

  const userBudget = quizAnswers?.budget || budgetLevel || "Comfort";
  const userTripType = quizAnswers?.tripType || "Relaxation";
  const userCompanions = quizAnswers?.companions || "Solo";
  const userSeason = quizAnswers?.season || "Spring";

  // Map Nominatim search results to structured Travio UI schema
  const mappedHotels = rawHotels.map((item, idx) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    // Calculate physical distance from destination center coordinates
    let distanceValue = 2.5; // default fallback km
    let distanceStr = "Near center";
    if (destinationCoords && destinationCoords.length === 2) {
      const dist = calculateDistance(destinationCoords[0], destinationCoords[1], lat, lon);
      distanceValue = dist;
      distanceStr = `${dist.toFixed(1)} km from center`;
    }

    // Deterministic price based on index & budget tier
    let pricePerNight = 120;
    if (tier === "budget") {
      pricePerNight = 35 + idx * 8;
    } else if (tier === "luxury") {
      pricePerNight = 380 + idx * 75;
    } else {
      pricePerNight = 115 + idx * 18;
    }

    // Deterministic rating from OSM id
    const baseRating = 4.0 + ((item.osm_id % 10) / 10);
    const rating = Math.min(5.0, Math.max(3.8, baseRating));

    // Ratings Count
    const ratingsCount = (item.osm_id % 480) + 12;

    // Cleaner display name
    const displayName = item.display_name.split(",")[0].trim();

    // Address mapping
    let finalAddress = "Not Available";
    if (item.address) {
      const addrParts = [];
      if (item.address.house_number) addrParts.push(item.address.house_number);
      if (item.address.road) addrParts.push(item.address.road);
      if (item.address.suburb) addrParts.push(item.address.suburb);
      if (item.address.city || item.address.town || item.address.village) {
        addrParts.push(item.address.city || item.address.town || item.address.village);
      }
      if (addrParts.length > 0) {
        finalAddress = addrParts.join(", ");
      } else {
        finalAddress = item.display_name.split(",").slice(0, 3).join(", ").trim();
      }
    }

    // Price Level Tag
    const priceLevelMap = { budget: "$", comfort: "$$", luxury: "$$$" };
    const priceLevel = priceLevelMap[tier] || "$$";

    // Opening Hours and status
    const openingStatus = item.extratags?.opening_hours ? "Open Now" : "Not Available";

    // Phone & Website
    const phone = item.extratags?.phone || item.extratags?.["contact:phone"] || "Not Available";
    const website = item.extratags?.website || item.extratags?.["contact:website"] || "Not Available";

    // Business Status
    const businessStatus = "Operational";

    // Google Maps Search Link
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      displayName + ", " + cityName
    )}`;

    // Select dynamic amenities & image
    const photo = images[idx % images.length];
    const hotelAmenities = [
      ...amenities.slice(0, 3),
      amenities[3 + (idx % (amenities.length - 3))]
    ];

    // ==========================================
    // ATLAS AI COMPATIBILITY CALCULATOR
    // ==========================================
    let matchScore = 75; // Base compatibility baseline

    // 1. Rating influence (+12 max)
    matchScore += Math.round((rating - 3.8) * 10);

    // 2. Distance influence (+7 max)
    matchScore += Math.round(Math.max(0, 7 - distanceValue));

    // 3. Review Count density influence (+5 max)
    matchScore += Math.round(Math.min(5, ratingsCount / 90));

    // 4. Budget personalization match (+5 max)
    if (userBudget.toLowerCase() === tier) {
      matchScore += 5;
    }

    // 5. Trip type / travel style alignment (+5 max)
    const normalizedName = displayName.toLowerCase();
    const hasSpa = hotelAmenities.includes("Spa") || hotelAmenities.includes("Luxury Spa");
    const hasPool = hotelAmenities.includes("Pool") || hotelAmenities.includes("Infinity Pool");
    const hasGym = hotelAmenities.includes("Gym") || hotelAmenities.includes("Fitness Center");

    if (userTripType.toLowerCase() === "relaxation" && (hasSpa || hasPool)) {
      matchScore += 5;
    } else if (userTripType.toLowerCase() === "luxury" && tier === "luxury") {
      matchScore += 5;
    } else if (userTripType.toLowerCase() === "adventure" && normalizedName.includes("lodge") || normalizedName.includes("cabin")) {
      matchScore += 5;
    } else if (userTripType.toLowerCase() === "food" && hotelAmenities.includes("Breakfast")) {
      matchScore += 3;
    } else if (userCompanions === "Family" && (hasPool || normalizedName.includes("suite") || normalizedName.includes("plaza"))) {
      matchScore += 5;
    } else if (userCompanions === "Solo" && (normalizedName.includes("hostel") || normalizedName.includes("boutique") || pricePerNight < 100)) {
      matchScore += 5;
    }

    const finalMatchScore = Math.min(99, Math.max(76, matchScore));

    // ==========================================
    // ATLAS NATURAL LANGUAGE EXPLANATION GENERATION
    // ==========================================
    let sentence1 = `Recommended because it is ${distanceValue < 2 ? "located extremely close" : "conveniently placed"} to the city center and matches your ${userBudget} budget.`;
    let sentence2 = `Perfect for ${userCompanions.toLowerCase()} travelers looking for a stay focusing on ${userTripType.toLowerCase()} during the ${userSeason.toLowerCase()} season.`;
    
    if (hasSpa && userTripType.toLowerCase() === "relaxation") {
      sentence2 = `Excellent for wellness retreats as it provides on-site spa and steam facilities matching your relaxation goals.`;
    } else if (userCompanions === "Family") {
      sentence2 = `Great choice for families due to the child-friendly options and spacious room selections.`;
    } else if (userCompanions === "Solo") {
      sentence2 = `Highly suitable for solo adventures due to its highly walkable surroundings and robust local transit access.`;
    } else if (userCompanions === "Partner" || userTripType.toLowerCase() === "romantic") {
      sentence2 = `Excellent for couples seeking a quiet, high-comfort location with premium dining features.`;
    }

    const sentence3 = ratingsCount > 250 
      ? `Highly recommended with over ${ratingsCount} guest ratings praising the cleanliness and general staff service.`
      : `Provides a highly rated local stay option with standard modern conveniences included.`;

    const atlasExplanation = `${sentence1} ${sentence2} ${sentence3}`;

    // ==========================================
    // WHY ATLAS RECOMMENDS THIS (4-6 Specific Factual points)
    // ==========================================
    const whyAtlasRecommends = [];
    if (rating >= 4.4) {
      whyAtlasRecommends.push(`Highly rated by travelers (${rating.toFixed(1)}/5.0)`);
    } else {
      whyAtlasRecommends.push(`Reliable service score of ${rating.toFixed(1)}/5.0`);
    }

    if (distanceValue <= 2.0) {
      whyAtlasRecommends.push(`Centrally located (${distanceValue.toFixed(1)} km from center)`);
    } else if (distanceValue > 4.0) {
      whyAtlasRecommends.push(`Quiet location outside the busy city core`);
    } else {
      whyAtlasRecommends.push(`Convenient distance from center (${distanceValue.toFixed(1)} km)`);
    }

    if (userBudget.toLowerCase() === tier) {
      whyAtlasRecommends.push(`Fits your preferred ${userBudget} budget level`);
    } else {
      whyAtlasRecommends.push(`Good value pricing at $${pricePerNight}/night`);
    }

    if (hotelAmenities.includes("Free WiFi") || hotelAmenities.includes("WiFi")) {
      whyAtlasRecommends.push("High-speed WiFi included in the room rate");
    }
    if (hasPool) {
      whyAtlasRecommends.push("Premium swimming pool facilities available");
    }
    if (hasSpa) {
      whyAtlasRecommends.push("On-site wellness spa treatments and sauna");
    }
    if (hasGym) {
      whyAtlasRecommends.push("Access to fitness gym equipment on-site");
    }
    if (hotelAmenities.includes("Buffet Breakfast") || hotelAmenities.includes("Breakfast")) {
      whyAtlasRecommends.push("Complimentary breakfast option included");
    }

    if (userCompanions === "Family") {
      whyAtlasRecommends.push("Spacious configurations suitable for family groups");
    } else if (userCompanions === "Solo") {
      whyAtlasRecommends.push("Safe and secure facilities ideal for independent stays");
    }

    // Limit to exactly 4-6 items
    const finalReasons = whyAtlasRecommends.slice(0, 6);

    return {
      id: item.place_id ? `p-${item.place_id}` : `h-${idx}`,
      name: displayName,
      rating,
      ratingsCount,
      address: finalAddress,
      distance: distanceStr,
      priceLevel,
      openingStatus,
      phone,
      website,
      businessStatus,
      googleMapsLink,
      pricePerNight,
      attractions: `Enjoy a premium stay at ${displayName}. Located convenient to local sightseeing spots, cultural venues, and transport options.`,
      amenities: hotelAmenities,
      photo: photo,
      coordinates: [lat, lon],
      
      // AI Recommendation parameters
      matchScore: finalMatchScore,
      atlasExplanation,
      whyAtlasRecommends: finalReasons,
      isAtlasPick: false // Will be determined on sorted list
    };
  });

  // Designate the single overall highest-scored hotel as the Top Pick
  if (mappedHotels.length > 0) {
    let topPickIdx = 0;
    let highestScore = -1;
    for (let i = 0; i < mappedHotels.length; i++) {
      if (mappedHotels[i].matchScore > highestScore) {
        highestScore = mappedHotels[i].matchScore;
        topPickIdx = i;
      }
    }
    mappedHotels[topPickIdx].isAtlasPick = true;
  }

  // Save to Cache
  hotelSessionCache.set(cacheKey, mappedHotels);

  return mappedHotels;
}
