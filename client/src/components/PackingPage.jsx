import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { useTravelSession } from "../context/TravelSessionContext";
import { resolveDestination } from "../data/destinationData";
import { FileText, Shirt, Smartphone, HeartPulse, Package, Sparkles } from "lucide-react";
import "../styles/PackingPage.css";

const packingListsByDestination = {
  kyoto: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "T-Shirts",
      "Jeans",
      "Light jacket",
      "Comfortable walking shoes"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Universal Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Sunscreen",
      "Umbrella"
    ]
  },
  seoul: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "T-Shirts",
      "Jeans",
      "Light coat",
      "Comfortable walking shoes"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Universal Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Face mask",
      "Umbrella"
    ]
  },
  bali: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "T-Shirts",
      "Shorts",
      "Swimsuit",
      "Sandals"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Waterproof Case"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Sunscreen",
      "Insect Repellent"
    ]
  },
  rome: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "T-Shirts",
      "Shorts/Jeans",
      "Light jacket",
      "Comfortable shoes"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Power Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Sunscreen",
      "Refillable water bottle"
    ]
  },
  paris: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "T-Shirts",
      "Jeans",
      "Light trench coat",
      "Comfortable walking shoes"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Power Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Lip balm",
      "Compact umbrella"
    ]
  },
  banff: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "Winter jacket",
      "Jeans",
      "Thermals",
      "Hiking boots"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Camera"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Lip balm",
      "Bear Spray"
    ]
  },
  reykjavik: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "Windproof jacket",
      "Thermal base layers",
      "Waterproof pants",
      "Hiking boots"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Power Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Swimwear",
      "Moisturizer"
    ]
  },
  bergen: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "High-quality rain jacket",
      "Jeans",
      "Layering sweaters",
      "Waterproof shoes"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Power Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Sturdy umbrella",
      "Waterproof backpack cover"
    ]
  },
  interlaken: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "Windbreaker",
      "Activewear",
      "Warm layers",
      "Hiking boots"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Camera"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Sun protection",
      "Sunglasses"
    ]
  },
  auckland: {
    "Documents": [
      "Passport",
      "Visa",
      "Travel Insurance",
      "Flight Tickets"
    ],
    "Clothing": [
      "Layered clothing",
      "Light rain jacket",
      "Jeans",
      "Walking shoes"
    ],
    "Electronics": [
      "Phone",
      "Charger",
      "Power Bank",
      "Universal Adapter"
    ],
    "Essentials": [
      "Toothbrush",
      "Medicines",
      "Sunscreen",
      "Sunglasses"
    ]
  }
};

const aiSuggestionsByDestination = {
  kyoto: "Kyoto in spring can be cool during mornings and evenings. Pack a light jacket, comfortable walking shoes, a portable umbrella, and a universal power adapter.",
  seoul: "Seoul has distinct seasons and involves plenty of walking. Pack stylish layering clothes, comfortable walking shoes for palace tours, and an umbrella.",
  bali: "Bali is tropical and warm year-round. Pack lightweight clothing, a swimsuit, plenty of sunscreen, sandals, and insect repellent.",
  rome: "Rome involves lots of walking on cobblestones. Pack comfortable shoes, a refillable water bottle, a light jacket, and modest clothing for visiting churches.",
  paris: "Paris weather can be unpredictable. Pack a chic light trench coat, comfortable stylish walking shoes, an umbrella, and a power adapter.",
  banff: "Banff can be cold even in summer, especially in the mountains. Pack a warm winter jacket, thermals, sturdy hiking boots, and skin moisturizer.",
  reykjavik: "Iceland weather changes rapidly. Pack windproof and waterproof layers, sturdy hiking boots, swimwear for geothermal pools, and thermal base layers.",
  bergen: "Bergen is one of the rainiest cities in Europe. Pack a high-quality waterproof rain jacket, waterproof shoes, a sturdy umbrella, and layers.",
  interlaken: "Alpine weather changes fast. Pack active clothing layers, a windbreaker jacket, sturdy hiking boots, sunglasses, and sun protection.",
  auckland: "Auckland can experience 'four seasons in one day'. Pack layering clothing, a light rain jacket, comfortable walking shoes, and sun protection."
};

function generatePackingData(destination, preferences = {}) {
  const weather = (destination.weather || "Mild").toLowerCase();
  const season = preferences.season || destination.bestSeason || "Spring";
  const duration = preferences.duration || "5-7 Days";
  const styles = destination.travelStyle || ["Culture", "Nature"];
  const highlights = (destination.highlights || []).join(" ").toLowerCase();

  const clothingItems = [];
  const essentialItems = ["Toothbrush & paste", "Personal medicines"];
  const electronicItems = ["Smartphone", "Chargers", "Power Bank (10,000mAh+)"];

  // 1. Weather & Season based items
  if (weather.includes("snow") || weather.includes("cold") || season.toLowerCase().includes("winter")) {
    clothingItems.push("Heavy winter coat / down jacket", "Thermal base layers / fleece tops", "Warm sweaters & hoodies", "Insulated pants / thermals", "Warm beanie, scarf, & touchscreen gloves", "Waterproof snow boots / insulated shoes");
    essentialItems.push("Heavy skin moisturizer", "Lip balm with SPF", "Hand warmers & thermal socks");
    electronicItems.push("Extra camera batteries (drains fast in cold)");
  } else if (weather.includes("rainy") || weather.includes("wet")) {
    clothingItems.push("High-grade waterproof rain jacket", "Water-resistant pants", "Waterproof shoes / quick-dry sneakers", "Layering cardigans", "Extra dry sock pairs");
    essentialItems.push("Windproof sturdy umbrella", "Waterproof backpack cover / dry bag");
  } else if (weather.includes("cool") || weather.includes("windy") || season.toLowerCase().includes("autumn")) {
    clothingItems.push("Windbreaker / light autumn jacket", "Knit sweaters & long sleeves", "Jeans / tailored trousers", "Comfortable walking sneakers", "Light scarf");
    essentialItems.push("Compact travel umbrella", "Hydrating lotion");
  } else if (weather.includes("hot") || weather.includes("tropical") || weather.includes("warm") || season.toLowerCase().includes("summer")) {
    clothingItems.push("Lightweight breathable T-shirts / linen shirts", "Casual shorts / linen trousers", "Swimsuit / UV rashguard", "Wide-brim sun hat / cap", "Comfortable sandals & flip-flops");
    essentialItems.push("Broad spectrum sunscreen (SPF 50+)", "UV sunglasses", "DEET / Mosquito repellent spray");
    electronicItems.push("Waterproof phone pouch");
  } else {
    clothingItems.push("Versatile T-shirts & tops", "Jeans or casual trousers", "Light sweater for evenings", "Comfortable walking shoes");
    essentialItems.push("Sunscreen", "Refillable thermal flask", "Hand sanitizer");
  }

  // 2. Duration based adjustments
  if (duration.toLowerCase().includes("week") || duration.toLowerCase().includes("longer")) {
    clothingItems.push("Travel laundry detergent sheets", "Additional 3-4 outfit changes");
    essentialItems.push("Travel grooming kit", "First-aid mini pouch");
  }

  // 3. Activity / Vibe specific additions
  if (styles.includes("Adventure") || highlights.includes("hike") || highlights.includes("mountain") || highlights.includes("trail")) {
    clothingItems.push("Moisture-wicking hiking socks", "Trail running / trekking shoes");
    essentialItems.push("Blister plaster bandages", "Mini flashlight / headlamp");
  }
  if (styles.includes("Culture") || highlights.includes("temple") || highlights.includes("shrine") || highlights.includes("palace") || highlights.includes("church")) {
    clothingItems.push("Modest attire for temple/sacred sites (covers shoulders & knees)", "Easy slip-on walking shoes");
  }
  if (styles.includes("Food") || styles.includes("Luxury") || highlights.includes("dining")) {
    clothingItems.push("Smart casual / dinner outfit for fine dining");
  }

  return {
    "Documents": [
      "Passport (valid > 6 mos)",
      `Visa / Entry Permit for ${destination.country || "destination"}`,
      "Travel Insurance Policy",
      "Boarding Passes & Flight Tickets",
      "Hotel / Accommodation Confirmations"
    ],
    "Clothing & Footwear": clothingItems,
    "Electronics & Tech": [...electronicItems, "Universal Plug Adapter"],
    "Health & Essentials": essentialItems
  };
}

function generateAISuggestion(destination, preferences = {}) {
  const city = destination.city || destination.name || "your destination";
  const country = destination.country || "";
  const weather = (destination.weather || "Mild").toLowerCase();
  const season = preferences.season || destination.bestSeason || "Spring";
  const duration = preferences.duration || "5-7 Days";
  const styles = (destination.travelStyle || []).join(", ");
  
  let suggestion = `Smart Packing Recommendation for ${city}${country ? `, ${country}` : ""}: `;
  
  suggestion += `Considering ${city}'s ${weather} climate during ${season} for a ${duration} trip focusing on ${styles || "sightseeing"}, pack accordingly. `;
  
  if (weather.includes("snow") || weather.includes("cold")) {
    suggestion += `Expect freezing alpine temperatures. Bring thermal base layers, an insulated down coat, touchscreen gloves, and waterproof snow boots. Keep tech gear warm in interior pockets.`;
  } else if (weather.includes("rainy") || weather.includes("wet")) {
    suggestion += `Expect frequent showers. A high-quality rain shell jacket, quick-drying footwear, a sturdy compact umbrella, and a waterproof backpack cover are essential.`;
  } else if (weather.includes("cool") || weather.includes("windy")) {
    suggestion += `Expect crisp and breezy weather. Layering is key: pack light sweaters, a windbreaker jacket, tailored trousers, and comfortable walking sneakers for exploring.`;
  } else if (weather.includes("hot") || weather.includes("tropical") || weather.includes("warm")) {
    suggestion += `Expect hot sun and high humidity. Pack lightweight linen or cotton clothing, swimwear, SPF 50+ sunscreen, sunglasses, and DEET insect repellent spray.`;
  } else {
    suggestion += `Expect pleasant, temperate conditions. Pack comfortable day walking shoes, versatile casual wear, a light evening jacket, and a refillable water bottle.`;
  }

  if (styles.includes("Culture")) {
    suggestion += ` Be sure to include modest clothing covering shoulders and knees for temple, shrine, or palace visits.`;
  }

  return suggestion;
}

function getCategoryIcon(category) {
  const catLower = category.toLowerCase();
  if (catLower.includes("document")) return <FileText size={20} className="category-icon documents-icon" />;
  if (catLower.includes("clothing") || catLower.includes("footwear") || catLower.includes("apparel")) return <Shirt size={20} className="category-icon clothing-icon" />;
  if (catLower.includes("elect") || catLower.includes("tech")) return <Smartphone size={20} className="category-icon electronics-icon" />;
  if (catLower.includes("health") || catLower.includes("essential")) return <HeartPulse size={20} className="category-icon essentials-icon" />;
  return <Package size={20} className="category-icon custom-icon" />;
}

export default function PackingPage() {
  const { selectedDestination } = useTravelSession();
  const destination = resolveDestination(selectedDestination) || resolveDestination("kyoto");

  const [checked, setChecked] = useState(() => {
    if (!destination) return {};
    try {
      const saved = localStorage.getItem(`travio_packing_checked_${destination.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customItems, setCustomItems] = useState(() => {
    if (!destination) return [];
    try {
      const saved = localStorage.getItem(`travio_packing_custom_${destination.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (destination) {
      localStorage.setItem(`travio_packing_checked_${destination.id}`, JSON.stringify(checked));
    }
  }, [checked, destination]);

  useEffect(() => {
    if (!destination) return;
    const handleUpdate = () => {
      try {
        const savedChecked = localStorage.getItem(`travio_packing_checked_${destination.id}`);
        setChecked(savedChecked ? JSON.parse(savedChecked) : {});
        const savedCustom = localStorage.getItem(`travio_packing_custom_${destination.id}`);
        setCustomItems(savedCustom ? JSON.parse(savedCustom) : []);
      } catch (err) {
        console.error("Failed to sync packing checklists:", err);
      }
    };
    window.addEventListener("travio_packing_update", handleUpdate);
    return () => window.removeEventListener("travio_packing_update", handleUpdate);
  }, [destination]);

  if (!destination) {
    return (
      <div className="packing-page">
        <Navbar />
        <div className="packing-header" style={{ padding: "100px 20px", textAlign: "center" }}>
          <h1>🧳 Smart Packing Assistant</h1>
          <p style={{ maxWidth: "600px", margin: "20px auto 30px", color: "#64748B", fontSize: "18px" }}>
            Please select a destination to view its smart packing checklist. Start by exploring our top recommendations!
          </p>
          <NavLink
            to="/home"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#2563EB",
              color: "white",
              borderRadius: "12px",
              fontWeight: "600",
              textDecoration: "none",
              boxShadow: "0 10px 20px rgba(37,99,235,0.2)",
              transition: "0.3s"
            }}
          >
            Explore Destinations
          </NavLink>
        </div>
      </div>
    );
  }

  const userPrefs = JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
  const basePackingData = generatePackingData(destination, userPrefs);
  const packingData = { ...basePackingData };
  if (customItems.length > 0) {
    packingData["Custom Items"] = customItems;
  }

  const aiSuggestion = generateAISuggestion(destination, userPrefs);

  const toggleItem = (item) => {
    const updated = {
      ...checked,
      [item]: !checked[item]
    };
    setChecked(updated);
    localStorage.setItem(`travio_packing_checked_${destination.id}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("travio_packing_update"));
  };

  const totalItems = Object.values(packingData).flat().length;
  const packedItems = Object.values(checked).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="packing-page">
      <Navbar />

      <div className="packing-header">
        <h1>🧳 Smart Packing Assistant</h1>
        <p>Your AI-generated packing checklist based on {destination.city}, {destination.country}.</p>
      </div>

      <div className="packing-progress-container">
        <div className="packing-progress">
          <div
            className="packing-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <h3 className="progress-text">
          {progress}% Packed
        </h3>
      </div>

      <div className="packing-grid">
        {Object.entries(packingData).map(([category, items]) => (
          <div className="packing-card" key={category}>
            <div className="packing-card-header">
              {getCategoryIcon(category)}
              <h2>{category}</h2>
            </div>
            <div className="packing-items-list">
              {items.map((item, index) => {
                const isChecked = checked[item] || false;
                return (
                  <label className={`packing-item ${isChecked ? "checked" : ""}`} key={index}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item)}
                      className="packing-checkbox"
                    />
                    <span className="item-text">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="ai-tip">
        <div className="ai-tip-header">
          <Sparkles size={20} className="ai-tip-icon" />
          <h2>Travio AI Suggestion</h2>
        </div>
        <p>{aiSuggestion}</p>
      </div>
    </div>
  );
}