import destinationData, { resolveDestination } from "../data/destinationData";

// Helper to get number of days from duration text
export function parseDurationDays(durationStr = "5-7 Days") {
  const lowercase = durationStr.toLowerCase();
  if (lowercase.includes("weekend")) return 3;
  if (lowercase.includes("5-7")) return 6;
  if (lowercase.includes("1-2") || lowercase.includes("week")) return 10;
  if (lowercase.includes("longer")) return 15;
  return 6;
}

// Generate Flight Options
export function getFlightOptions(destinationId, budgetLevel = "Comfort", departureCity = null) {
  const dest = destinationData[destinationId] || { airport: "Local Airport", country: "Global" };
  const basePrice = budgetLevel === "Budget" ? 450 : budgetLevel === "Comfort" ? 750 : 1350;

  let activeDepCity = departureCity;
  if (!activeDepCity) {
    try {
      const saved = localStorage.getItem("travio_departure_city");
      if (saved) activeDepCity = JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const depName = activeDepCity ? activeDepCity.name : "Bengaluru";
  const depCode = activeDepCity ? activeDepCity.code : "BLR";

  return [
    {
      airline: budgetLevel === "Budget" ? "FlyCheap Air" : "JetGlobal Airways",
      departure: `${depName} (${depCode})`,
      arrival: dest.airport.split(" (")[0] || dest.airport,
      duration: "13h 40m",
      stops: "1 Stop",
      price: Math.round(basePrice * 0.9),
      badge: "Cheapest",
      isCheapest: true
    },
    {
      airline: budgetLevel === "Luxury" ? "Emirates First Class" : "WorldConnect Airlines",
      departure: `${depName} (${depCode})`,
      arrival: dest.airport.split(" (")[0] || dest.airport,
      duration: "11h 15m",
      stops: "Non-stop",
      price: Math.round(basePrice * 1.3),
      badge: "Fastest",
      isFastest: true
    },
    {
      airline: "National Flag Carrier",
      departure: `${depName} (${depCode})`,
      arrival: dest.airport.split(" (")[0] || dest.airport,
      duration: "11h 35m",
      stops: "Non-stop",
      price: Math.round(basePrice * 1.05),
      badge: "Best Value",
      isBestValue: true
    }
  ];
}

// Generate Hotel Options
export function getHotelOptions(destinationId, budgetLevel = "Comfort") {
  const dest = destinationData[destinationId] || { city: "Destination" };
  
  const hotels = {
    budget: [
      {
        name: `${dest.city} City Hostel & Pods`,
        rating: 4.5,
        pricePerNight: 35,
        distance: "0.8 km from center",
        attractions: "Close to cafes, train station, and street food hubs",
        amenities: ["Free WiFi", "Shared Kitchen", "Bicycle Rental", "Laundry Services"],
        photo: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: `Backpackers Haven ${dest.city}`,
        rating: 4.3,
        pricePerNight: 28,
        distance: "1.5 km from center",
        attractions: "Walking distance to local markets and main sights",
        amenities: ["Free WiFi", "Lockers", "Social Lounge", "Free City Maps"],
        photo: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: `${dest.city} Cozy Guesthouse`,
        rating: 4.6,
        pricePerNight: 42,
        distance: "1.1 km from center",
        attractions: "Quiet residential area with authentic local vibes",
        amenities: ["Free WiFi", "Private Bath", "Air Conditioning", "Breakfast Available"],
        photo: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80"
      }
    ],
    comfort: [
      {
        name: `The ${dest.city} Boutique Inn`,
        rating: 4.7,
        pricePerNight: 120,
        distance: "0.4 km from center",
        attractions: "Near primary shopping strip and top restaurants",
        amenities: ["Free WiFi", "Buffet Breakfast", "Fitness Center", "Co-working Space"],
        photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: `Metropolitan Plaza Hotel`,
        rating: 4.6,
        pricePerNight: 145,
        distance: "0.2 km from center",
        attractions: "Adjacent to central transit station with skyline views",
        amenities: ["Free WiFi", "Rooftop Lounge", "Room Service", "Airport Shuttle"],
        photo: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: `Riverside Green Lodge`,
        rating: 4.8,
        pricePerNight: 135,
        distance: "0.9 km from center",
        attractions: "Overlooking the water, surrounded by botanical gardens",
        amenities: ["Free WiFi", "Breakfast Included", "Bar & Resto", "Free Bike Rental"],
        photo: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80"
      }
    ],
    luxury: [
      {
        name: `The Grand Royal ${dest.city} Resort`,
        rating: 4.9,
        pricePerNight: 420,
        distance: "0.5 km from center",
        attractions: "Stunning private estate near historic landmarks",
        amenities: ["Free WiFi", "Infinity Pool", "Luxury Spa", "24/7 Butler Service"],
        photo: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: `Palazzo Premium & Spa`,
        rating: 4.8,
        pricePerNight: 490,
        distance: "0.1 km from center",
        attractions: "Historical architecture interior, top rated luxury stay",
        amenities: ["Free WiFi", "Michelin Dining", "Wellness Sanctuary", "Chauffeur Service"],
        photo: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: `Spectra Heights Overlook`,
        rating: 4.9,
        pricePerNight: 550,
        distance: "1.2 km from center",
        attractions: "Highest point overlooking the entire area",
        amenities: ["Free WiFi", "Private Balconies", "Heated Pools", "Exclusive Lounge"],
        photo: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80"
      }
    ]
  };

  const tier = budgetLevel.toLowerCase();
  return hotels[tier] || hotels.comfort;
}

// Generate Restaurant Options
export function getRestaurantOptions(destinationId, budgetLevel = "Comfort") {
  const dest = destinationData[destinationId] || { city: "Destination" };

  const restaurants = [
    {
      name: `${dest.city} Old Town Kitchen`,
      cuisine: "Traditional & Local",
      rating: 4.7,
      costForTwo: budgetLevel === "Budget" ? "$25 - $40 USD" : budgetLevel === "Comfort" ? "$40 - $70 USD" : "$90 - $140 USD",
      hours: "11:30 AM - 10:00 PM",
      distance: "0.3 km",
      dishes: ["Chef's Signature Platter", "Traditional Stews", "Local House Wine"],
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
      mapLocation: "Old Town Market Street"
    },
    {
      name: "Breezes Dining & Café",
      cuisine: "Modern Fusion & Bakery",
      rating: 4.6,
      costForTwo: budgetLevel === "Budget" ? "$15 - $30 USD" : budgetLevel === "Comfort" ? "$30 - $55 USD" : "$70 - $110 USD",
      hours: "8:00 AM - 9:00 PM",
      distance: "0.5 km",
      dishes: ["Avocado Smash", "Craft Lattes", "House Pastries"],
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      mapLocation: "Central Garden Boulevard"
    },
    {
      name: "L'Etoile Golden Table",
      cuisine: "Fine Dining & Seafood",
      rating: 4.9,
      costForTwo: budgetLevel === "Budget" ? "$50 - $80 USD" : budgetLevel === "Comfort" ? "$90 - $160 USD" : "$220 - $450 USD",
      hours: "6:00 PM - 11:30 PM",
      distance: "0.8 km",
      dishes: ["Seared Scallops", "Premium Tasting Menu", "Exclusive Cocktail Pairing"],
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      mapLocation: "North Waterfront Promenade"
    }
  ];

  return restaurants;
}

// Generate Detailed Budget Breakdown
export function calculateBudgetBreakdown(destinationId, budgetLevel = "Comfort", travelersCount = 2, durationStr = "5-7 Days") {
  const days = parseDurationDays(durationStr);
  const travelers = Number(travelersCount) || 1;

  // Flight Ticket Price Estimate
  const flightBase = budgetLevel === "Budget" ? 400 : budgetLevel === "Comfort" ? 750 : 1400;
  const flightCost = flightBase * travelers;

  // Hotel Price per Night Estimate
  const hotelBase = budgetLevel === "Budget" ? 35 : budgetLevel === "Comfort" ? 130 : 450;
  // Assume couples and partners share rooms, others get 1 room per traveler (or 2 rooms max)
  const roomsNeeded = travelers > 1 ? Math.ceil(travelers / 2) : 1;
  const hotelCost = hotelBase * days * roomsNeeded;

  // Daily costs per person
  const foodBase = budgetLevel === "Budget" ? 25 : budgetLevel === "Comfort" ? 55 : 120;
  const foodCost = foodBase * days * travelers;

  const transportBase = budgetLevel === "Budget" ? 10 : budgetLevel === "Comfort" ? 25 : 60;
  const transportCost = transportBase * days * travelers;

  const activitiesBase = budgetLevel === "Budget" ? 15 : budgetLevel === "Comfort" ? 35 : 90;
  const activitiesCost = activitiesBase * days * travelers;

  // Shopping allowance (flat total)
  const shoppingCost = budgetLevel === "Budget" ? 50 * travelers : budgetLevel === "Comfort" ? 150 * travelers : 450 * travelers;

  // Subtotal and Emergency Buffer (10%)
  const subtotal = flightCost + hotelCost + foodCost + transportCost + activitiesCost + shoppingCost;
  const emergencyBuffer = Math.round(subtotal * 0.1);
  const totalCost = subtotal + emergencyBuffer;

  return {
    days,
    travelers,
    flightCost,
    hotelCost,
    foodCost,
    transportCost,
    activitiesCost,
    shoppingCost,
    emergencyBuffer,
    totalCost,
    breakdown: [
      { category: "Flights", value: flightCost, percentage: Math.round((flightCost / totalCost) * 100), color: "#3B82F6", icon: "✈️" },
      { category: "Stays", value: hotelCost, percentage: Math.round((hotelCost / totalCost) * 100), color: "#10B981", icon: "🏨" },
      { category: "Dining", value: foodCost, percentage: Math.round((foodCost / totalCost) * 100), color: "#F59E0B", icon: "🍜" },
      { category: "Transit", value: transportCost, percentage: Math.round((transportCost / totalCost) * 100), color: "#6366F1", icon: "🚇" },
      { category: "Activities", value: activitiesCost, percentage: Math.round((activitiesCost / totalCost) * 100), color: "#EC4899", icon: "🎟️" },
      { category: "Shopping", value: shoppingCost, percentage: Math.round((shoppingCost / totalCost) * 100), color: "#8B5CF6", icon: "🛍️" },
      { category: "Emergency Buffer", value: emergencyBuffer, percentage: Math.round((emergencyBuffer / totalCost) * 100), color: "#EF4444", icon: "🛡️" }
    ]
  };
}

// ----------------------------------------------------
// MOCK DATABASE FOR ATTRACTIONS
// ----------------------------------------------------
const ATTRACTIONS_DB = {
  kyoto: [
    {
      name: "Fushimi Inari Shrine",
      category: "Historical & Sacred",
      duration: "2-3 Hours",
      entryFee: "Free Admission",
      distance: "3.5 km from center",
      description: "Hike along paths lined with thousands of brilliant vermilion Shinto torii gates leading up Mount Inari.",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Arashiyama Bamboo Grove",
      category: "Nature & Scenic",
      duration: "1-2 Hours",
      entryFee: "Free Admission",
      distance: "6.2 km from center",
      description: "Stroll along towering green stalks of bamboo that rustle softly in the wind, creating an otherworldly atmosphere.",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Kinkaku-ji (Golden Pavilion)",
      category: "Zen Architecture",
      duration: "1 Hour",
      entryFee: "400 JPY (~$3 USD)",
      distance: "5.0 km from center",
      description: "Marvel at a breathtaking three-story Buddhist temple where the top two floors are completely covered in pure gold leaf.",
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80"
    }
  ],
  seoul: [
    {
      name: "Gyeongbokgung Royal Palace",
      category: "Historical & Palace",
      duration: "2 Hours",
      entryFee: "3,000 KRW (~$2 USD)",
      distance: "1.2 km from center",
      description: "Explore the grandest of Seoul's five Joseon Dynasty palaces. Rent a Hanbok dress to gain free admission.",
      image: "https://images.unsplash.com/photo-1538669715515-5c3794790714?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "N Seoul Tower",
      category: "Landmark & Observatory",
      duration: "1.5 Hours",
      entryFee: "16,000 KRW (~$12 USD)",
      distance: "2.8 km from center",
      description: "Ascend to the top of Namsan Mountain for 360-degree views of the entire Seoul metropolitan skyline.",
      image: "https://images.unsplash.com/photo-1578496781985-45229a93463e?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Bukchon Hanok Village",
      category: "Cultural Neighborhood",
      duration: "1.5 Hours",
      entryFee: "Free Admission",
      distance: "0.8 km from center",
      description: "Walk down narrow cobblestone streets lined with hundreds of preserved traditional Korean wooden courtyard houses.",
      image: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=600&q=80"
    }
  ],
  bali: [
    {
      name: "Sacred Monkey Forest Sanctuary",
      category: "Wildlife & Nature",
      duration: "2 Hours",
      entryFee: "80,000 IDR (~$5 USD)",
      distance: "1.5 km from Ubud center",
      description: "Wander through deep jungle temple ruins housing over a thousand wild, playful Balinese long-tailed macaques.",
      image: "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Uluwatu Temple Cliffside",
      category: "Cultural Temple",
      duration: "2 Hours",
      entryFee: "50,000 IDR (~$3 USD)",
      distance: "22 km from Kuta",
      description: "Stand atop dramatic sea cliffs 70 meters above the roaring waves and visit a sacred Hindu temple at sunset.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Tegallalang Rice Terraces",
      category: "Nature & Agriculture",
      duration: "1.5 Hours",
      entryFee: "20,000 IDR (~$1.5 USD)",
      distance: "8.5 km from Ubud",
      description: "Walk down sloping valleys carved into traditional stepped green paddy fields, operated on ancient cooperative irrigation.",
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=600&q=80"
    }
  ]
};

// Generic attractions generator for destinations not in the hardcoded list
function generateGenericAttractions(city) {
  return [
    {
      name: `${city} Cathedral & Historic Plaza`,
      category: "History & Culture",
      duration: "2 Hours",
      entryFee: "Free Admission",
      distance: "0.5 km from center",
      description: "A gorgeous historic square surrounded by colonial architecture and local artisan workshops.",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: `${city} Botanical Gardens`,
      category: "Nature & Parks",
      duration: "1.5 Hours",
      entryFee: "10 USD",
      distance: "2.1 km from center",
      description: "Lush botanical greenhouses presenting rare global floras and relaxing paved walking trails.",
      image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: `${city} Scenic Overlook Trail`,
      category: "Scenic Viewpoint",
      duration: "3 Hours",
      entryFee: "Free Admission",
      distance: "4.5 km from center",
      description: "A popular panoramic hiking route looking over the valley, mountains, and local waterways.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    }
  ];
}

export function getAttractionOptions(destinationId) {
  const dest = destinationData[destinationId];
  if (!dest) return generateGenericAttractions("Destination");
  
  if (dest.highlights && Array.isArray(dest.highlights) && dest.highlights.length > 0) {
    const fallbackAttractionImages = [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    ];
    const [lat, lng] = dest.coordinates || [0, 0];
    return dest.highlights.map((name, idx) => ({
      name,
      category: ["Sightseeing", "Nature & Parks", "Culture & History", "Landmark"][idx % 4],
      duration: ["1.5 Hours", "2 Hours", "3 Hours"][idx % 3],
      entryFee: idx === 0 ? "Free Admission" : `${10 + idx * 5} USD`,
      distance: `${1.2 + idx * 0.7} km from center`,
      description: `Explore the famous ${name}, a signature landmark in ${dest.city || dest.name}.`,
      image: dest.gallery?.[idx % dest.gallery.length] || fallbackAttractionImages[idx % fallbackAttractionImages.length],
      coordinates: [lat + 0.002 * (idx + 1), lng - 0.002 * (idx + 1)]
    }));
  }
  
  return ATTRACTIONS_DB[destinationId] || generateGenericAttractions(dest.city);
}

// ----------------------------------------------------
// DAILY RECOMMENDATION SCHEDULE
// ----------------------------------------------------
export function getDailySchedule(destinationId, tripType = "Relaxation") {
  const dest = destinationData[destinationId] || { city: "Destination" };
  const foods = dest.famousFoods || ["Local specialities"];
  const attractions = getAttractionOptions(destinationId);

  return [
    { time: "08:00", activity: "Breakfast", detail: `Enjoy fresh pastries and hot coffee at a local sidewalk café in downtown ${dest.city}.` },
    { time: "09:30", activity: "Morning Sightseeing", detail: `Visit the historic ${attractions[0]?.name || "Cultural Plaza"} when crowds are thin.` },
    { time: "12:30", activity: "Lunch Break", detail: `Taste authentic ${foods[0] || "traditional lunches"} at a highly rated local tavern.` },
    { time: "14:00", activity: "Afternoon Exploration", detail: `Walk the scenic gardens of ${attractions[1]?.name || "Scenic Viewpoint"} or visit a local art gallery.` },
    { time: "17:30", activity: "Café & Downtime", detail: `Indulge in sweet treats like ${foods[2] || "local desserts"} and tea at a cozy lounge.` },
    { time: "19:30", activity: "Dinner & Drinks", detail: `Savor premium dining focusing on ${foods[1] || "specialty dishes"} with skyline or waterfront views.` }
  ];
}

// ----------------------------------------------------
// LOCAL DIRECTORY AND INFRASTRUCTURE
// ----------------------------------------------------
const LOCAL_INFO_DB = {
  kyoto: {
    taxiApps: "GO App, Uber, DiDi",
    internet: "High-speed pocket WiFi or local e-SIM highly recommended. Free WiFi at train hubs.",
    payment: "Cash is essential for shrines, small shops, and bus fares. Credit cards in hotels.",
    powerPlug: "Type A & B (100V, 50Hz/60Hz)",
    publicTransit: "Dense local bus network, two subway lines, and regional Japan Rail lines."
  },
  seoul: {
    taxiApps: "Kakao T, UT (Uber Taxi), Tada",
    internet: "Ultra-fast public 5G. e-SIM card or rental pocket router available at Incheon Airport.",
    payment: "Almost 100% cashless. Credit cards, Apple Pay, and local T-money transport cards are key.",
    powerPlug: "Type C & F (220V, 60Hz)",
    publicTransit: "Highly efficient, clean, cheap metro lines and express bus lanes."
  },
  bali: {
    taxiApps: "Grab, Gojek, Bluebird Taxi",
    internet: "Fibre WiFi is standard in cafes and hotels. Purchase local Telkomsel SIM for mobile network.",
    payment: "Cash (IDR) is required for markets and local warungs. Credit cards accepted at beach clubs.",
    powerPlug: "Type C & F (230V, 50Hz)",
    publicTransit: "No major train transit. Best option is renting scooters or hiring private drivers."
  }
};

export function getLocalInfo(destinationId) {
  const dest = resolveDestination(destinationId) || destinationData[destinationId] || {};
  const defaults = {
    taxiApps: "Uber, local taxi operators",
    internet: "WiFi standard in hotels. e-SIM recommended for outdoor roaming data.",
    payment: "Credit cards widely accepted. Keep minor coins for public facilities.",
    powerPlug: "Standard Type C / E / G (230V, 50Hz)",
    publicTransit: "Local municipal bus systems and walking."
  };

  const dbInfo = LOCAL_INFO_DB[destinationId] || defaults;
  return {
    currency: dest.currency || "Local Currency",
    language: dest.language || "Local Language",
    emergencyNumber: dest.emergencyNumber || "112",
    publicTransitDetail: dest.localTransport || dbInfo.publicTransit,
    ...dbInfo
  };
}

// ----------------------------------------------------
// PROFILE-BASED TRAVEL TIPS
// ----------------------------------------------------
export function getPersonalizedTips(destinationId, userProfile = {}) {
  const dest = destinationData[destinationId] || { city: "Destination" };
  const budget = userProfile.budget || "Comfort";
  const companions = userProfile.companions || "Solo";
  const tripType = userProfile.tripType || "Relaxation";

  const tips = [
    `Pack appropriate footwear! ${dest.city} is highly walkable and best explored on foot.`,
    `Avoid peak hours: Visit major landmarks like ${dest.highlights?.[0] || "the center"} before 8:30 AM to beat tour groups.`
  ];

  // Budget tailored tips
  if (budget === "Budget") {
    tips.push(`Grocery run: Grab breakfast, snacks, and drinks at local convenience stores to save on markup costs.`);
  } else if (budget === "Luxury") {
    tips.push(`Book ahead: Ensure private transport and Michelin-starred restaurants are reserved 3-4 weeks in advance.`);
  } else {
    tips.push(`Carry minor change: Local cafes and small transport ticket dispensers may not accept large bills.`);
  }

  // Companions tailored tips
  if (companions === "Solo") {
    tips.push(`Stay connected: Download offline maps and share your live location daily with emergency contacts.`);
  } else if (companions === "Family") {
    tips.push(`Pace check: Schedule a 2-hour afternoon rest window to keep kids energized for evening events.`);
  } else {
    tips.push(`Group checks: Coordinate split-payment apps in advance for shared transport and restaurant tabs.`);
  }

  // Trip type tailored tips
  if (tripType === "Adventure") {
    tips.push(`Gear up: Bring layered waterproof jackets. Mountain climates around ${dest.city} shift quickly.`);
  } else if (tripType === "Food") {
    tips.push(`Culinary etiquette: Research tipping customs. In many countries, tipping is not expected or is considered rude.`);
  } else if (tripType === "Culture") {
    tips.push(`Dress respectfully: Cover your shoulders and knees when visiting historical temples or religious shrines.`);
  } else {
    tips.push(`Hydrate: Carry a refillable thermal flask to stay refreshed under the warm afternoon sun.`);
  }

  return tips;
}

