export const STAGE1_QUESTIONS = [
  {
    id: "tripType",
    title: "What type of trip are you looking for?",
    subtitle: "Select the primary focus of your journey.",
    options: [
      { value: "Relaxation", label: "Relaxation", emoji: "💆", description: "Unwind, de-stress, and rest" },
      { value: "Adventure", label: "Adventure", emoji: "🏔", description: "Thrills, outdoors, and adrenaline" },
      { value: "Culture", label: "Culture", emoji: "🏯", description: "History, art, and traditions" },
      { value: "Nature", label: "Nature", emoji: "🌿", description: "Scenic landscapes and wildlife" },
      { value: "Luxury", label: "Luxury", emoji: "✨", description: "Premium comforts and services" },
      { value: "Food", label: "Food", emoji: "🍜", description: "Taste tests and culinary discoveries" },
      { value: "Shopping", label: "Shopping", emoji: "🛍", description: "Markets, boutiques, and malls" }
    ]
  },
  {
    id: "companions",
    title: "Who are you travelling with?",
    subtitle: "We will tailor group options and recommendations.",
    options: [
      { value: "Solo", label: "Solo", emoji: "🎒", description: "Independent exploration" },
      { value: "Partner", label: "Partner", emoji: "👩‍❤️‍👨", description: "Couple or romantic getaway" },
      { value: "Friends", label: "Friends", emoji: "👥", description: "Social trip with companions" },
      { value: "Family", label: "Family", emoji: "👨‍👩‍👧‍👦", description: "Kid-friendly or multigenerational" }
    ]
  },
  {
    id: "budget",
    title: "Approximate budget?",
    subtitle: "Choose the pricing range for flights and stays.",
    options: [
      { value: "Budget", label: "Budget", emoji: "🪙", description: "Smart spending, local stays" },
      { value: "Comfort", label: "Comfort", emoji: "💳", description: "Boutique hotels, mid-tier dining" },
      { value: "Luxury", label: "Luxury", emoji: "💎", description: "5-star luxury, exclusive travel" }
    ]
  },
  {
    id: "season",
    title: "Preferred season?",
    subtitle: "When do you plan to travel?",
    options: [
      { value: "Spring", label: "Spring", emoji: "🌸", description: "Mild weather and blossoms" },
      { value: "Summer", label: "Summer", emoji: "☀️", description: "Warm sun and beach weather" },
      { value: "Autumn", label: "Autumn", emoji: "🍂", description: "Cool air and colorful foliage" },
      { value: "Winter", label: "Winter", emoji: "❄️", description: "Snowy vistas and winter sports" }
    ]
  },
  {
    id: "duration",
    title: "How many days?",
    subtitle: "The overall length of your journey.",
    options: [
      { value: "Weekend", label: "Weekend (2-4 Days)", emoji: "🗓", description: "Quick short trip" },
      { value: "5-7 Days", label: "5-7 Days", emoji: "📅", description: "Standard week long getaway" },
      { value: "1-2 Weeks", label: "1-2 Weeks", emoji: "🗺", description: "Deep dive or road trip" },
      { value: "Longer", label: "Longer", emoji: "🛫", description: "Extended exploration" }
    ]
  }
];

export function getAdaptiveQuestions(stage1Answers) {
  const tripType = stage1Answers.tripType || "Relaxation";
  const companions = stage1Answers.companions || "Solo";
  
  // Follow-up Q1: Activity detail based on Trip Type
  let q1 = {
    id: "activityDetail",
    title: "Which specific activity matches your style?",
    subtitle: `Customized follow-up for your ${tripType.toLowerCase()} trip.`,
    options: []
  };

  switch (tripType) {
    case "Adventure":
      q1.options = [
        { value: "Hiking", label: "Hiking", emoji: "🥾", description: "Trekking alpine trails" },
        { value: "Scuba diving", label: "Scuba Diving", emoji: "🤿", description: "Exploring marine reef life" },
        { value: "Skiing", label: "Skiing", emoji: "⛷", description: "Slopes and snow sports" },
        { value: "Safari", label: "Safari", emoji: "🦁", description: "Spotting wild exotic animals" },
        { value: "Volcanoes", label: "Volcanoes", emoji: "🌋", description: "Climbing active volcanic paths" }
      ];
      break;
    case "Food":
      q1.options = [
        { value: "Street food", label: "Street Food", emoji: "🍢", description: "Eating at local night markets" },
        { value: "Fine dining", label: "Fine Dining", emoji: "🍽", description: "Michelin stars and tastings" },
        { value: "Cafés", label: "Cafés", emoji: "☕", description: "Coffee shops and pastries" },
        { value: "Local cuisine", label: "Local Cuisine", emoji: "🍲", description: "Traditional authentic dishes" },
        { value: "Seafood", label: "Seafood", emoji: "🦞", description: "Fresh local catches from ocean" }
      ];
      break;
    case "Luxury":
      q1.options = [
        { value: "Beach resorts", label: "Beach Resorts", emoji: "🏖", description: "5-star beachfront resorts" },
        { value: "Private villas", label: "Private Villas", emoji: "🏡", description: "Secluded high-end rental homes" },
        { value: "Luxury shopping", label: "Luxury Shopping", emoji: "👜", description: "Designer brands and boutiques" },
        { value: "Michelin restaurants", label: "Michelin Dining", emoji: "🍷", description: "Top-tier award winning meals" }
      ];
      break;
    case "Culture":
      q1.options = [
        { value: "Ancient temples", label: "Ancient Temples", emoji: "🏯", description: "Historical temples and shrines" },
        { value: "Museums", label: "Museums & Art", emoji: "🏛", description: "Galleries, history, and science" },
        { value: "Local festivals", label: "Local Festivals", emoji: "🏮", description: "Traditional seasonal parades" },
        { value: "Art galleries", label: "Art Galleries", emoji: "🎨", description: "Modern and classic collections" }
      ];
      break;
    case "Nature":
      q1.options = [
        { value: "National parks", label: "National Parks", emoji: "🏞", description: "Lakes, trails, and peaks" },
        { value: "Waterfalls", label: "Waterfalls", emoji: "🌊", description: "Scenic forest waterfall drops" },
        { value: "Glaciers", label: "Glaciers", emoji: "🏔", description: "Frozen ice caps and ice fields" },
        { value: "Rice terraces", label: "Rice Terraces", emoji: "🌾", description: "Lush green agricultural valleys" }
      ];
      break;
    case "Relaxation":
      q1.options = [
        { value: "Spa & wellness", label: "Spa & Wellness", emoji: "🧖", description: "Thermal baths and massages" },
        { value: "Sunset chasing", label: "Sunset Chasing", emoji: "🌅", description: "Scenic viewpoints at dusk" },
        { value: "Beach lounging", label: "Beach Lounging", emoji: "🏖", description: "Sunbathing on quiet shores" },
        { value: "Hot springs", label: "Hot Springs", emoji: "♨️", description: "Natural hot mineral pools" }
      ];
      break;
    default: // Shopping
      q1.options = [
        { value: "Local markets", label: "Local Markets", emoji: "🎪", description: "Flea markets, local souvenirs" },
        { value: "Designer boutiques", label: "Designer Boutiques", emoji: "👠", description: "High-end fashion stores" },
        { value: "Souvenir shopping", label: "Souvenir Shopping", emoji: "🎁", description: "Traditional crafts and gifts" },
        { value: "Duty-free", label: "Duty-Free Malls", emoji: "✈️", description: "Tax-free global luxury goods" }
      ];
  }

  // Follow-up Q2: Focus based on travel companions
  let q2 = {
    id: "companionDetail",
    title: "What is your travel group's main priority?",
    subtitle: `Tailored focus for travelling with ${companions.toLowerCase()}.`,
    options: []
  };

  switch (companions) {
    case "Solo":
      q2.options = [
        { value: "Safety importance", label: "Safety Importance", emoji: "🛡", description: "Highly secure and reliable locales" },
        { value: "Meeting people", label: "Meeting People", emoji: "💬", description: "Social hotspots and hostels" },
        { value: "Quiet destinations", label: "Quiet Destinations", emoji: "🤫", description: "Peace and solo reflection" },
        { value: "Budget stays", label: "Budget Backpacker Stays", emoji: "🛏", description: "Communal or value lodging" }
      ];
      break;
    case "Family":
      q2.options = [
        { value: "Child-friendly attractions", label: "Child-Friendly Sights", emoji: "🧸", description: "Zoos, parks, and museums" },
        { value: "Theme parks", label: "Theme Parks", emoji: "🎢", description: "High-energy rides and family fun" },
        { value: "Relaxed pace", label: "Relaxed Pace", emoji: "🚶", description: "Ample breaks and short walks" },
        { value: "Spacious suites", label: "Spacious Suites", emoji: "🏨", description: "Kitchens or multi-room suites" }
      ];
      break;
    case "Friends":
      q2.options = [
        { value: "Group activities", label: "Group Activities", emoji: "🚴", description: "Kayaking, hiking, and group sports" },
        { value: "Nightlife & bars", label: "Nightlife & Bars", emoji: "🍻", description: "Clubs, bars, and evening music" },
        { value: "Shared villas", label: "Shared Villas/Rentals", emoji: "🏠", description: "Staying in a big group home" },
        { value: "Budget friendly", label: "Budget-Friendly split", emoji: "🏷", description: "Cost sharing and value spots" }
      ];
      break;
    default: // Partner
      q2.options = [
        { value: "Romantic dinners", label: "Romantic Dinners", emoji: "🕯", description: "Candlelit meals and sunsets" },
        { value: "Couple spas", label: "Couple Spas", emoji: "💆‍♀️", description: "Shared massage and hot baths" },
        { value: "Sunset views", label: "Sunset Views", emoji: "🌅", description: "Scenic viewpoints at dusk" },
        { value: "Boutique stays", label: "Boutique Stays", emoji: "🏩", description: "Charming, private hotels" }
      ];
  }

  // Q3: Lodging Style
  const q3 = {
    id: "lodgingStyle",
    title: "What is your preferred lodging style?",
    subtitle: "Your home away from home.",
    options: [
      { value: "Hostels & Homestays", label: "Hostels / Homestays", emoji: "🎒", description: "Social, local, budget friendly" },
      { value: "Boutique Hotels", label: "Boutique Hotels", emoji: "🏨", description: "Charming, local character" },
      { value: "5-Star Resorts", label: "5-Star Resorts", emoji: "💎", description: "Premium services and amenities" },
      { value: "Cozy Cabins / Villas", label: "Cozy Cabins / Villas", emoji: "🏡", description: "Secluded, private space" }
    ]
  };

  // Q4: Crowd Level & Pace
  const q4 = {
    id: "crowdLevel",
    title: "What crowd level and daily pace fits you?",
    subtitle: "Set the rhythm of your exploration.",
    options: [
      { value: "Vibrant & Bustling", label: "Vibrant & Bustling", emoji: "🏙", description: "High energy, fast pace, busy streets" },
      { value: "Quiet & Secluded", label: "Quiet & Secluded", emoji: "🌲", description: "Slow pace, peaceful, uncrowded" },
      { value: "Balanced", label: "Balanced Rhythm", emoji: "⚖️", description: "Mix of active sightseeing and downtime" }
    ]
  };

  // Q5: Transport Preference
  const q5 = {
    id: "transportPreference",
    title: "How do you prefer to get around?",
    subtitle: "Choose your primary mode of transit.",
    options: [
      { value: "Public Transit", label: "Public Transit", emoji: "🚇", description: "Efficient subways, trains, and buses" },
      { value: "Private Driver", label: "Private Driver / Car Rental", emoji: "🚗", description: "Taxis, private rides, or road trip" },
      { value: "Walkable", label: "Walkable Exploration", emoji: "🚶", description: "Exploring by foot" }
    ]
  };

  return [q1, q2, q3, q4, q5];
}
