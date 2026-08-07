import destinationsList from "./destinations.json";

// Glob all images eagerly from the assets folder.
// The glob will match paths like '../assets/images/Japan/Kyoto/hero.jpg'
const allImages = import.meta.glob("../assets/images/**/*.jpg", { eager: true, import: "default" });

function resolveDestinationImages(country, city, imageFolder) {
  const clean = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  const targetCountry = clean(country);
  const targetCity = clean(city || imageFolder || "");

  // Find all keys that match this country and city
  const keys = Object.keys(allImages);

  // Helper to extract matches
  const cityKeys = keys.filter(k => {
    const parts = k.toLowerCase().split("/");
    return parts.some(p => clean(p) === targetCountry) && parts.some(p => clean(p) === targetCity);
  });

  let hero = null;
  let gallery = [];

  if (cityKeys.length > 0) {
    const heroKey = cityKeys.find(k => k.toLowerCase().endsWith("hero.jpg"));
    const galleryKeys = cityKeys.filter(k => k.toLowerCase().includes("gallery")).sort();
    
    if (heroKey) hero = allImages[heroKey];
    if (galleryKeys.length > 0) gallery = galleryKeys.map(k => allImages[k]);
  }

  // If no city-specific match, try country-level match (e.g. Norway, Iceland)
  if (!hero) {
    const countryKeys = keys.filter(k => {
      const parts = k.toLowerCase().split("/");
      // Country directory itself, and not inside a city subdirectory
      // e.g. ../assets/images/Norway/hero.jpg -> parts are ["..", "assets", "images", "Norway", "hero.jpg"]
      return parts.some(p => clean(p) === targetCountry) && parts.length === 5;
    });

    if (countryKeys.length > 0) {
      const heroKey = countryKeys.find(k => k.toLowerCase().endsWith("hero.jpg"));
      const galleryKeys = countryKeys.filter(k => k.toLowerCase().includes("gallery")).sort();
      
      if (heroKey) hero = allImages[heroKey];
      if (galleryKeys.length > 0) gallery = galleryKeys.map(k => allImages[k]);
    }
  }

  // If still not found (e.g. Singapore, Dubai, Zermatt), fallback to a sibling or generic image
  if (!hero) {
    // Let's define specific fallbacks
    let fallbackCountry = "Japan";
    let fallbackCity = "Tokyo";
    if (targetCountry === "singapore") {
      fallbackCountry = "Malaysia";
      fallbackCity = "Kuala Lumpur";
    } else if (targetCountry === "uae" || targetCity === "dubai") {
      fallbackCountry = "Egypt";
      fallbackCity = "Cairo";
    } else if (targetCity === "zermatt") {
      fallbackCountry = "Switzerland";
      fallbackCity = "nterlaken"; // Interlaken images
    }

    const fallbackKeys = keys.filter(k => {
      const parts = k.toLowerCase().split("/");
      return parts.some(p => clean(p) === clean(fallbackCountry)) && parts.some(p => clean(p) === clean(fallbackCity));
    });

    if (fallbackKeys.length > 0) {
      const heroKey = fallbackKeys.find(k => k.toLowerCase().endsWith("hero.jpg"));
      const galleryKeys = fallbackKeys.filter(k => k.toLowerCase().includes("gallery")).sort();
      
      if (heroKey) hero = allImages[heroKey];
      if (galleryKeys.length > 0) gallery = galleryKeys.map(k => allImages[k]);
    }
  }

  // Final fallback to any valid image if all else fails
  if (!hero) {
    const firstHeroKey = keys.find(k => k.endsWith("hero.jpg"));
    if (firstHeroKey) hero = allImages[firstHeroKey];
    gallery = keys.filter(k => k.includes("gallery")).slice(0, 3).map(k => allImages[k]);
  }

  return { hero, gallery };
}

const destinationData = {};

destinationsList.forEach((dest) => {
  const images = resolveDestinationImages(dest.country, dest.city || dest.name, dest.imageFolder);
  
  // Backward compatibility: add title, city, rating, aiRating
  destinationData[dest.id] = {
    ...dest,
    slug: dest.slug || dest.id,
    title: dest.city || dest.name,
    city: dest.city || dest.name,
    hero: images.hero,
    image: images.hero,
    gallery: images.gallery,
    aiRating: dest.aiRating || 4.8,
    rating: dest.rating || 4.8,
    challengeTitle: dest.challengeTitle || `${dest.city || dest.name} Explorer Challenge`,
    challengeDescription: dest.challengeDescription || `Discover the culture of ${dest.city || dest.name}.`,
    rewardName: dest.rewardName || "Local Explorer",
    rewardEmoji: dest.rewardEmoji || "🧭"
  };
});

// Centralized defaults for new dynamically discovered countries
const countryDefaults = {
  india: { currency: "Indian Rupee (INR)", language: "Hindi / English", airportSuffix: "Airport" },
  japan: { currency: "Japanese Yen (JPY)", language: "Japanese", airportSuffix: "Airport" },
  australia: { currency: "Australian Dollar (AUD)", language: "English", airportSuffix: "Airport" },
  brazil: { currency: "Brazilian Real (BRL)", language: "Portuguese", airportSuffix: "Airport" },
  canada: { currency: "Canadian Dollar (CAD)", language: "English / French", airportSuffix: "Airport" },
  egypt: { currency: "Egyptian Pound (EGP)", language: "Arabic", airportSuffix: "Airport" },
  france: { currency: "Euro (EUR)", language: "French", airportSuffix: "Airport" },
  germany: { currency: "Euro (EUR)", language: "German", airportSuffix: "Airport" },
  greece: { currency: "Euro (EUR)", language: "Greek", airportSuffix: "Airport" },
  indonesia: { currency: "Indonesian Rupiah (IDR)", language: "Indonesian", airportSuffix: "Airport" },
  italy: { currency: "Euro (EUR)", language: "Italian", airportSuffix: "Airport" },
  malaysia: { currency: "Malaysian Ringgit (MYR)", language: "Malay", airportSuffix: "Airport" },
  mexico: { currency: "Mexican Peso (MXN)", language: "Spanish", airportSuffix: "Airport" },
  nepal: { currency: "Nepalese Rupee (NPR)", language: "Nepali", airportSuffix: "Airport" },
  netherlands: { currency: "Euro (EUR)", language: "Dutch", airportSuffix: "Airport" },
  newzealand: { currency: "New Zealand Dollar (NZD)", language: "English", airportSuffix: "Airport" },
  southkorea: { currency: "South Korean Won (KRW)", language: "Korean", airportSuffix: "Airport" },
  spain: { currency: "Euro (EUR)", language: "Spanish", airportSuffix: "Airport" },
  srilanka: { currency: "Sri Lankan Rupee (LKR)", language: "Sinhala / Tamil", airportSuffix: "Airport" },
  switzerland: { currency: "Swiss Franc (CHF)", language: "German / French / Italian", airportSuffix: "Airport" },
  thailand: { currency: "Thai Baht (THB)", language: "Thai", airportSuffix: "Airport" },
  unitedkingdom: { currency: "Pound Sterling (GBP)", language: "English", airportSuffix: "Airport" },
  unitedstates: { currency: "US Dollar (USD)", language: "English", airportSuffix: "Airport" }
};

const cityCoordinates = {
  bengaluru: [12.9716, 77.5946],
  mysuru: [12.2958, 76.6394],
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  jaipur: [26.9124, 75.7873],
  goa: [15.2993, 74.1240],
  kochi: [9.9312, 76.2673],
  agra: [27.1767, 78.0081],
  varanasi: [25.3176, 82.9739],
  udaipur: [24.5854, 73.7125],
  osaka: [34.6937, 135.5023],
  hiroshima: [34.3853, 132.4553],
  hakone: [35.2324, 139.1069],
  yokohama: [35.4437, 139.6380],
  nara: [34.6851, 135.8048],
  nikko: [36.7199, 139.6982],
  okinawa: [26.2124, 127.6809],
  sapporo: [43.0618, 141.3545],
  melbourne: [-37.8136, 144.9631],
  brisbane: [-27.4698, 153.0251],
  perth: [-31.9505, 115.8605],
  cairns: [-16.9186, 145.7781],
  hobart: [-42.8821, 147.3272],
  canberra: [-35.2809, 149.1300],
  darwin: [-12.4634, 130.8456]
};

// Helper to normalize strings for slug/destination resolution
const normalizeSlug = (str) => {
  if (str === undefined || str === null) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/gi, "o")
    .replace(/æ/gi, "ae")
    .replace(/å/gi, "a")
    .replace(/ß/gi, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

// Dynamically discover all other countries/cities present in the image assets folder structure
Object.keys(allImages).forEach((key) => {
  const parts = key.split("/");
  if (parts.length === 6) {
    const country = parts[3];
    const city = parts[4];
    
    // Ignore invalid entries or file extensions
    if (!country || !city || city.toLowerCase().endsWith(".jpg")) return;
    
    const cleanId = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const id = cleanId(city);
    const normCity = normalizeSlug(city);
    
    // Check if city is already present in destinationsList or destinationData
    const existing = Object.values(destinationData).find(d => 
      normalizeSlug(d.id) === normCity || 
      normalizeSlug(d.slug) === normCity || 
      normalizeSlug(d.city) === normCity || 
      normalizeSlug(d.name) === normCity
    );
    
    if (!existing && !destinationData[id]) {
      const images = resolveDestinationImages(country, city, id);
      const defaults = countryDefaults[cleanId(country)] || { currency: "Local Currency", language: "Local Language", airportSuffix: "Airport" };
      const coords = cityCoordinates[id] || [0, 0];
      
      destinationData[id] = {
        id,
        numericId: Object.keys(destinationData).length + 100,
        name: city,
        city: city,
        country: country,
        coordinates: coords,
        airport: `${city} ${defaults.airportSuffix}`,
        currency: defaults.currency,
        language: defaults.language,
        weatherCity: city,
        description: `Explore the vibrant streets and beautiful sights of ${city}, a top destination in ${country}.`,
        highlights: [city],
        famousFoods: [],
        bestSeason: "All Year",
        imageFolder: id,
        vibe: "Wonderful",
        weather: "Mild",
        crowd: "Moderate",
        budget: "Medium",
        travelStyle: ["Explore"],
        duration: ["3-5 Days"],
        slug: id,
        title: city,
        hero: images.hero,
        image: images.hero,
        gallery: images.gallery,
        aiRating: 4.8,
        rating: 4.8,
        challengeTitle: `${city} Explorer Challenge`,
        challengeDescription: `Discover the culture of ${city}.`,
        rewardName: "Local Explorer",
        rewardEmoji: "🧭"
      };
    }
  }
});

export const homePageSections = [
  { id: "trending", title: "Trending Destinations", description: "Handpicked places loved by travelers around the world.", destinationIds: ["kyoto", "bali", "rome", "interlaken"] },
  { id: "ai-travel", title: "AI Travel Picks", description: "Inspiration from Travio's supported destination catalogue.", destinationIds: ["seoul", "paris", "banff", "reykjavik"] },
  { id: "explore", title: "Explore More", description: "More places ready to plan in Travio.", destinationIds: ["bergen", "auckland"] }
];

export function getDestinationsById(destinationIds = []) {
  return destinationIds.map((id) => resolveDestination(id)).filter(Boolean);
}

export function resolveDestination(reference) {
  if (!reference) return null;
  
  if (typeof reference === "string" && (reference.toLowerCase() === "undefined" || reference.toLowerCase() === "null")) {
    return null;
  }
  
  const rawRef = typeof reference === "object" 
    ? (reference.slug || reference.id || reference.city || reference.name || reference.title || "")
    : String(reference);

  if (!rawRef || rawRef.toLowerCase() === "undefined") return null;

  let targetKey = normalizeSlug(rawRef);
  if (!targetKey) return null;

  // Handle common city aliases
  const aliasMap = {
    "bangalore": "bengaluru",
    "newyork": "newyorkcity",
    "newyorkcity": "newyorkcity",
    "rio": "riodejaneiro",
    "riodejaneiro": "riodejaneiro",
    "montsaintmichel": "mountsaintmichel",
    "mountsaintmichel": "mountsaintmichel"
  };

  if (aliasMap[targetKey]) {
    targetKey = aliasMap[targetKey];
  }

  const allDestinations = Object.values(destinationData);
  
  // 1. Strict match by normalized ID, slug, city, name, or title across full dataset
  let match = allDestinations.find(d => 
    normalizeSlug(d.id) === targetKey ||
    normalizeSlug(d.slug) === targetKey ||
    normalizeSlug(d.city) === targetKey ||
    normalizeSlug(d.name) === targetKey ||
    normalizeSlug(d.title) === targetKey
  );

  if (match) return match;

  // 2. Partial / Substring match for multi-word city names
  match = allDestinations.find(d => {
    const dId = normalizeSlug(d.id);
    const dCity = normalizeSlug(d.city);
    const dName = normalizeSlug(d.name);
    return (dId.length >= 3 && (dId.includes(targetKey) || targetKey.includes(dId))) ||
           (dCity.length >= 3 && (dCity.includes(targetKey) || targetKey.includes(dCity))) ||
           (dName.length >= 3 && (dName.includes(targetKey) || targetKey.includes(dName)));
  });

  if (match) return match;

  // 3. Match by country if reference object specifies country
  if (typeof reference === "object" && reference.country) {
    const cCountry = normalizeSlug(reference.country);
    match = allDestinations.find(d => normalizeSlug(d.country) === cCountry);
    if (match) return match;
  }

  return null;
}

export default destinationData;

