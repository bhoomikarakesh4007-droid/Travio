import axios from "axios";

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

/**
 * Fetches real restaurants in a given city using OpenStreetMap's Nominatim Search API.
 * Maps coordinates, calculates real distances, and overlays visual properties.
 *
 * @param {string} cityName Name of the city to search restaurants for.
 * @param {Array<number>} destinationCoords Coordinates [lat, lon] of the city center.
 * @param {string} budgetLevel Selected budget level ("Budget", "Comfort", "Luxury").
 */
export async function fetchRestaurants(cityName, destinationCoords, budgetLevel = "Comfort") {
  if (!cityName) {
    throw new Error("City name parameter is required");
  }

  // Query Nominatim search API for restaurants (Limit to 6 results)
  const url = `https://nominatim.openstreetmap.org/search?q=restaurant+in+${encodeURIComponent(
    cityName
  )}&format=json&limit=6`;

  // Set User-Agent in headers as mandated by Nominatim's Usage Policy
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "TravioTravelPlanner/1.0 (contact@travio.io)"
    }
  });

  const rawRestaurants = response.data;
  if (!rawRestaurants || !Array.isArray(rawRestaurants) || rawRestaurants.length === 0) {
    return [];
  }

  // Pre-curated high-resolution food images from Unsplash
  const foodImages = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80"
  ];

  const cuisineTypes = [
    "Traditional & Local",
    "Modern Fusion & Bakery",
    "Fine Dining & Seafood",
    "Authentic Grill & Bistro",
    "Continental & Pastry Lounge",
    "Organic Vegan & Bowls"
  ];

  const dishesMap = [
    ["Chef's Signature Platter", "Traditional Stews", "Local House Wine"],
    ["Avocado Smash", "Craft Lattes", "House Pastries"],
    ["Seared Scallops", "Premium Tasting Menu", "Exclusive Cocktail Pairing"],
    ["Flame Grilled Steaks", "Crisp House Salad", "Smoked Craft Ales"],
    ["Artisanal Croissants", "Espresso Macchiato", "Fruit Tarts"],
    ["Quinoa Power Bowl", "Cold Press Juices", "Vegan Matcha Mousse"]
  ];

  // Map OpenStreetMap search results to structured Restaurant card schema
  return rawRestaurants.map((item, idx) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    // Calculate real distance
    let distanceStr = "Near center";
    if (destinationCoords && destinationCoords.length === 2) {
      const dist = calculateDistance(destinationCoords[0], destinationCoords[1], lat, lon);
      distanceStr = `${dist.toFixed(1)} km`; // Matches mock distance string format
    }

    // Determine cost range based on budget level and index
    let costForTwo = "$30 - $55 USD";
    if (budgetLevel.toLowerCase() === "budget") {
      costForTwo = `$${15 + idx * 3} - $${30 + idx * 5} USD`;
    } else if (budgetLevel.toLowerCase() === "luxury") {
      costForTwo = `$${95 + idx * 25} - $${190 + idx * 45} USD`;
    } else {
      costForTwo = `$${35 + idx * 8} - $${65 + idx * 12} USD`;
    }

    // Determine deterministic rating (e.g. 4.2 to 4.9 stars)
    const rating = 4.3 + (idx % 3) * 0.2 + (idx % 2) * 0.1;
    const finalRating = Math.min(5.0, Math.max(3.8, rating));

    // Extract cleaner display name
    const displayName = item.display_name.split(",")[0].trim();

    return {
      name: displayName,
      cuisine: cuisineTypes[idx % cuisineTypes.length],
      rating: finalRating,
      costForTwo: costForTwo,
      hours: "11:30 AM - 10:30 PM",
      distance: distanceStr,
      dishes: dishesMap[idx % dishesMap.length],
      image: foodImages[idx % foodImages.length],
      mapLocation: item.display_name.split(",").slice(1, 3).join(",").trim(),
      coordinates: [lat, lon] // Expose real coordinates
    };
  });
}
