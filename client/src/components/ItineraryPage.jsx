import { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { useTravelSession } from "../context/TravelSessionContext";
import { useTravel } from "../context/TravelContext";
import { resolveDestination } from "../data/destinationData";
import { calculateDestinationMatches } from "../services/matchingService";
import { getAttractionOptions, calculateBudgetBreakdown } from "../services/travelPlannerService";
import { formatDualPrice } from "../services/currencyService";
import { Clock, Sun, SunDim, Sunset, Moon, MapPin, Compass } from "lucide-react";
import AtlasTripCompanion from "./AtlasTripCompanion";
import "../styles/ItineraryPage.css";


const placeholderItineraries = {
  kyoto: [
    {
      day: "Day 1",
      title: "Arrival in Kyoto",
      time: "09:00 AM",
      description: "Arrive at Kansai Airport, hotel check-in and evening walk through Gion District.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Fushimi Inari Shrine",
      time: "08:00 AM",
      description: "Explore thousands of Torii gates followed by local street food and shopping.",
      icon: "⛩️"
    },
    {
      day: "Day 3",
      title: "Arashiyama",
      time: "09:30 AM",
      description: "Visit Bamboo Forest, Monkey Park and Katsura River.",
      icon: "🎋"
    },
    {
      day: "Day 4",
      title: "Golden Pavilion",
      time: "10:00 AM",
      description: "Visit Kinkaku-ji Temple and traditional tea ceremony.",
      icon: "🏯"
    },
    {
      day: "Day 5",
      title: "Nara Day Trip",
      time: "08:30 AM",
      description: "Meet the famous deer, visit Todai-ji Temple and explore Nara Park.",
      icon: "🦌"
    },
    {
      day: "Day 6",
      title: "Shopping & Food",
      time: "11:00 AM",
      description: "Nishiki Market, Anime Stores, Kyoto Station and Japanese dinner.",
      icon: "🛍️"
    },
    {
      day: "Day 7",
      title: "Departure",
      time: "10:00 AM",
      description: "Hotel checkout and return flight.",
      icon: "🛫"
    }
  ],
  seoul: [
    {
      day: "Day 1",
      title: "Welcome to Seoul",
      time: "10:00 AM",
      description: "Arrive at Incheon International Airport, take the AREX to the city, check in, and explore Myeongdong for food/shopping.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Palace & Hanok Village",
      time: "09:00 AM",
      description: "Rent a Hanbok and explore the grand Gyeongbokgung Palace, followed by Bukchon Hanok Village.",
      icon: "⛩️"
    },
    {
      day: "Day 3",
      title: "N Seoul Tower & Insadong",
      time: "10:00 AM",
      description: "Visit the scenic N Seoul Tower, then shop for traditional crafts in Insadong and enjoy tea.",
      icon: "🗼"
    },
    {
      day: "Day 4",
      title: "Gangnam & Han River",
      time: "11:00 AM",
      description: "Visit the stylish Gangnam district, COEX Starfield Library, and relax with instant ramyeon at Han River Park.",
      icon: "🌊"
    },
    {
      day: "Day 5",
      title: "Departure from Seoul",
      time: "09:00 AM",
      description: "Enjoy a final Korean breakfast, buy souvenirs, and head back to Incheon Airport.",
      icon: "🛫"
    }
  ],
  bali: [
    {
      day: "Day 1",
      title: "Arrival & Seminyak Sunset",
      time: "12:00 PM",
      description: "Arrive at Ngurah Rai Airport, check in to your resort, and enjoy sunset at Seminyak beach.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Ubud Rice Terraces",
      time: "08:30 AM",
      description: "Visit Tegalalang Rice Terraces, the Sacred Monkey Forest Sanctuary, and enjoy Ubud market shopping.",
      icon: "🌴"
    },
    {
      day: "Day 3",
      title: "Uluwatu Temple & Kecak Dance",
      time: "09:00 AM",
      description: "Relax at Melasti Beach, then head to the cliffside Uluwatu Temple for sunset and the fire dance show.",
      icon: "🛕"
    },
    {
      day: "Day 4",
      title: "Nusa Penida Day Trip",
      time: "07:00 AM",
      description: "Take a speedboat to Nusa Penida, visit Kelingking Beach, Broken Beach, and snorkel with manta rays.",
      icon: "🚤"
    },
    {
      day: "Day 5",
      title: "Departure",
      time: "10:00 AM",
      description: "Final massage or beachside brunch before heading back to the airport.",
      icon: "🛫"
    }
  ],
  rome: [
    {
      day: "Day 1",
      title: "Welcome to Rome & Trevi Fountain",
      time: "11:00 AM",
      description: "Arrive at Fiumicino Airport, check in, and visit the Spanish Steps, Pantheon, and throw a coin in Trevi Fountain.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Colosseum & Roman Forum",
      time: "08:30 AM",
      description: "Step back in time with a tour of the mighty Colosseum, Roman Forum, and Palatine Hill.",
      icon: "🏛️"
    },
    {
      day: "Day 3",
      title: "Vatican City Tour",
      time: "09:00 AM",
      description: "Explore St. Peter's Basilica, the Vatican Museums, and admire Michelangelo's masterpiece in the Sistine Chapel.",
      icon: "⛪"
    },
    {
      day: "Day 4",
      title: "Trastevere & Piazza Navona",
      time: "10:00 AM",
      description: "Stroll through Piazza Navona and Castel Sant'Angelo, then spend the evening eating pasta in the charming streets of Trastevere.",
      icon: "🍝"
    },
    {
      day: "Day 5",
      title: "Arrivederci Roma",
      time: "09:30 AM",
      description: "Enjoy espresso and pastries, buy Italian leather goods, and head to the airport.",
      icon: "🛫"
    }
  ],
  paris: [
    {
      day: "Day 1",
      title: "Welcome to Paris & Seine Cruise",
      time: "10:30 AM",
      description: "Arrive at Charles de Gaulle Airport, check in, walk along the Seine, and take a sunset river cruise.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Eiffel Tower & Louvre Museum",
      time: "08:30 AM",
      description: "Climb the Eiffel Tower for panoramic views, stroll through the Tuileries Garden, and visit the Louvre to see the Mona Lisa.",
      icon: "🗼"
    },
    {
      day: "Day 3",
      title: "Montmartre & Sacré-Cœur",
      time: "09:30 AM",
      description: "Explore the artistic streets of Montmartre, visit the Sacré-Cœur Basilica, and see the Moulin Rouge.",
      icon: "🎨"
    },
    {
      day: "Day 4",
      title: "Palace of Versailles Day Trip",
      time: "08:30 AM",
      description: "Take the RER train to Versailles to tour the breathtaking Hall of Mirrors and the expansive royal gardens.",
      icon: "🏰"
    },
    {
      day: "Day 5",
      title: "Farewell Paris",
      time: "10:00 AM",
      description: "Visit Notre-Dame Cathedral and buy delicious macarons from Ladurée before departing.",
      icon: "🛫"
    }
  ],
  banff: [
    {
      day: "Day 1",
      title: "Welcome to Banff & Town Exploration",
      time: "12:00 PM",
      description: "Arrive in Banff from Calgary, check in, walk Banff Avenue, and ride the Banff Gondola to Sulphur Mountain summit.",
      icon: "⛰️"
    },
    {
      day: "Day 2",
      title: "Lake Louise & Moraine Lake",
      time: "06:30 AM",
      description: "Head out early to see the glacier-fed turquoise waters of Moraine Lake and hike around beautiful Lake Louise.",
      icon: "🌲"
    },
    {
      day: "Day 3",
      title: "Icefields Parkway Adventure",
      time: "08:00 AM",
      description: "Drive one of the world's most scenic highways, visiting Bow Lake, Peyto Lake, and the Columbia Icefield.",
      icon: "❄️"
    },
    {
      day: "Day 4",
      title: "Johnston Canyon & Departure",
      time: "09:00 AM",
      description: "Hike along the catwalks of Johnston Canyon to see the waterfalls, then depart for Calgary Airport.",
      icon: "🛫"
    }
  ],
  reykjavik: [
    {
      day: "Day 1",
      title: "Welcome to Iceland & Blue Lagoon",
      time: "10:00 AM",
      description: "Land at Keflavik Airport, take a relaxing soak in the famous geothermal Blue Lagoon, and check in to Reykjavik.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Golden Circle Tour",
      time: "08:30 AM",
      description: "Tour Thingvellir National Park, see the Geysir geothermal area, and stand in awe of the massive Gullfoss Waterfall.",
      icon: "🌋"
    },
    {
      day: "Day 3",
      title: "South Coast Waterfalls & Black Sand Beach",
      time: "08:00 AM",
      description: "Visit Seljalandsfoss and Skógafoss waterfalls, and walk the dramatic Reynisfjara black sand beach near Vik.",
      icon: "🌊"
    },
    {
      day: "Day 4",
      title: "Reykjavik Sightseeing & Departure",
      time: "09:30 AM",
      description: "Visit Hallgrímskirkja church, walk the Harpa concert hall, and head to the airport for your flight home.",
      icon: "🛫"
    }
  ],
  bergen: [
    {
      day: "Day 1",
      title: "Welcome to Bergen & Bryggen Wharf",
      time: "11:30 AM",
      description: "Arrive in Bergen, walk through the historic colorful wooden houses of Bryggen, and visit the lively Fish Market.",
      icon: "🏠"
    },
    {
      day: "Day 2",
      title: "Mount Fløyen & Mount Ulriken",
      time: "09:00 AM",
      description: "Ride the Fløibanen Funicular to Mount Fløyen for city views, then hike the vidden trail to Mount Ulriken.",
      icon: "🚠"
    },
    {
      day: "Day 3",
      title: "Norway in a Nutshell Fjord Tour",
      time: "08:00 AM",
      description: "Experience a cruise through Nærøyfjord, ride the scenic Flåm Railway, and enjoy beautiful waterfalls.",
      icon: "🛳️"
    },
    {
      day: "Day 4",
      title: "KODE Art Museums & Departure",
      time: "10:00 AM",
      description: "Explore Edvard Munch works at the KODE Art Museums, shop for Scandinavian gifts, and head to the airport.",
      icon: "🛫"
    }
  ],
  interlaken: [
    {
      day: "Day 1",
      title: "Welcome to Interlaken & Harder Kulm",
      time: "12:00 PM",
      description: "Arrive in Interlaken, check in, and take the funicular up to Harder Kulm for sunset views over Lake Thun and Lake Brienz.",
      icon: "🏔️"
    },
    {
      day: "Day 2",
      title: "Jungfraujoch - Top of Europe",
      time: "08:00 AM",
      description: "Board the cogwheel train to Jungfraujoch, the highest railway station in Europe, and walk through the Ice Palace.",
      icon: "❄️"
    },
    {
      day: "Day 3",
      title: "Lauterbrunnen & Grindelwald First",
      time: "08:30 AM",
      description: "Visit Lauterbrunnen valley to see Staubbach Falls, then head to Grindelwald First for the Cliff Walk and zip-lining.",
      icon: "🧗"
    },
    {
      day: "Day 4",
      title: "Lake Brienz Cruise & Departure",
      time: "09:30 AM",
      description: "Take a scenic boat cruise on the brilliant turquoise waters of Lake Brienz before departing Swiss Alps.",
      icon: "🛫"
    }
  ],
  auckland: [
    {
      day: "Day 1",
      title: "Welcome to Auckland & Sky Tower",
      time: "11:00 AM",
      description: "Arrive at Auckland Airport, check in, walk around the Viaduct Harbour, and view the sunset from the Sky Tower.",
      icon: "✈️"
    },
    {
      day: "Day 2",
      title: "Waiheke Island Wine Tour",
      time: "09:30 AM",
      description: "Take a 40-minute ferry ride to Waiheke Island to enjoy world-class wine tastings, olive groves, and beautiful beaches.",
      icon: "🍷"
    },
    {
      day: "Day 3",
      title: "Hobbiton & Waitomo Caves Day Trip",
      time: "07:00 AM",
      description: "Visit the movie set of Hobbiton in Matamata, then see the magical glowworms in the subterranean Waitomo Caves.",
      icon: "🧙"
    },
    {
      day: "Day 4",
      title: "Mount Eden & Rangitoto Island",
      time: "08:30 AM",
      description: "Climb Mount Eden for panoramic views, then take a ferry to hike up the volcanic Rangitoto Island.",
      icon: "🌋"
    },
    {
      day: "Day 5",
      title: "Farewell Auckland",
      time: "10:00 AM",
      description: "Walk through Auckland Domain, visit the Museum, buy Māori crafts, and head to the airport.",
      icon: "🛫"
    }
  ]
};

const weatherRanges = {
  kyoto: "18°C - 25°C",
  seoul: "15°C - 23°C",
  bali: "26°C - 31°C",
  rome: "17°C - 26°C",
  paris: "14°C - 22°C",
  banff: "5°C - 15°C",
  reykjavik: "2°C - 11°C",
  bergen: "8°C - 16°C",
  interlaken: "10°C - 20°C",
  auckland: "13°C - 20°C"
};

const budgetMapping = {
  Budget: "₹45,000",
  Medium: "₹90,000",
  Luxury: "₹1,80,000"
};

function generateLocalItinerary(destination, preferences, departureCity = null) {
  const budgetLevel = preferences.budget || destination.budget || "Comfort";
  const duration = preferences.duration || "5-7 Days";
  
  let days = 6;
  const lowercaseDur = duration.toLowerCase();
  if (lowercaseDur.includes("weekend")) days = 3;
  else if (lowercaseDur.includes("5-7")) days = 6;
  else if (lowercaseDur.includes("1-2") || lowercaseDur.includes("week")) days = 10;
  else if (lowercaseDur.includes("longer")) days = 15;

  let activeDep = departureCity;
  if (!activeDep) {
    try {
      const saved = localStorage.getItem("travio_departure_city");
      if (saved) activeDep = JSON.parse(saved);
    } catch {
      // ignore
    }
  }

  const depName = activeDep ? activeDep.name : "Bengaluru";
  const depCode = activeDep ? activeDep.code : "BLR";

  const destName = destination.city || destination.name || "Destination";
  const destAirport = destination.airport ? destination.airport.split(" (")[0] : `${destName} Airport`;
  const hotelName = `${destName} Boutique Retreat`;
  const restaurantName = `${destName} Traditional Bistro`;
  const highlights = destination.highlights || [];
  const famousFoods = destination.famousFoods || ["traditional cuisine"];

  const itinerary = [];
  for (let i = 1; i <= days; i++) {
    let title = "";
    let description = "";
    let time = "09:00 AM";
    let icon = "📍";

    if (i === 1) {
      title = `Departure from ${depName} & Arrival in ${destName}`;
      time = "06:30 AM";
      description = `Morning: Leave home for ${depName} Airport (${depCode}). Flight: ${depName} → ${destName}. Arrival: Land at ${destAirport}. Transfer: Hotel Check-in at ${hotelName}. Afternoon: Lunch. Evening: Local sightseeing.`;
      icon = "✈️";
    } else if (i === days) {
      title = `Return Travel to ${depName}`;
      time = "10:00 AM";
      description = `Check out of ${hotelName}, grab last-minute souvenirs, transfer to ${destAirport} for your return flight ${destName} → ${depName}.`;
      icon = "🛫";
    } else {
      const highlight = highlights[(i - 2) % highlights.length] || "the scenic city center";
      const food = famousFoods[(i - 2) % famousFoods.length] || "local treats";
      
      if (i % 2 === 0) {
        title = `Exploring ${highlight}`;
        time = "09:30 AM";
        description = `Visit the spectacular ${highlight} in the morning. Later, enjoy a lunch featuring ${food} at ${restaurantName}.`;
        icon = "🏰";
      } else {
        title = `Scenic Vibe & Food Walk`;
        time = "10:00 AM";
        description = `Take a leisurely walking tour around local shops and parks. Dine on delicious ${food} at a highly recommended neighborhood spot.`;
        icon = "🌳";
      }
    }

    itinerary.push({
      day: `Day ${i}`,
      title,
      time,
      description,
      icon
    });
  }
  return itinerary;
}

function parseDescription(description) {
  if (!description) return { morning: null, afternoon: null, evening: null, night: null };
  
  let morning = "";
  let afternoon = "";
  let evening = "";
  let night = "";

  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("morning:") || lowerDesc.includes("afternoon:") || lowerDesc.includes("evening:") || lowerDesc.includes("night:")) {
    const morningMatch = description.match(/Morning:\s*(.*?)(?=(?:Afternoon|Evening|Night):|$)/i);
    const afternoonMatch = description.match(/Afternoon:\s*(.*?)(?=(?:Morning|Evening|Night):|$)/i);
    const eveningMatch = description.match(/Evening:\s*(.*?)(?=(?:Morning|Afternoon|Night):|$)/i);
    const nightMatch = description.match(/Night:\s*(.*?)(?=(?:Morning|Afternoon|Evening):|$)/i);

    if (morningMatch) morning = morningMatch[1].trim();
    if (afternoonMatch) afternoon = afternoonMatch[1].trim();
    if (eveningMatch) evening = eveningMatch[1].trim();
    if (nightMatch) night = nightMatch[1].trim();
  }

  if (!morning && !afternoon && !evening && !night) {
    const sentences = description.split(/(?<=\.|\?|\!)\s+/);
    sentences.forEach((sentence, idx) => {
      const sLower = sentence.toLowerCase();
      if (sLower.includes("morning")) {
        morning += (morning ? " " : "") + sentence;
      } else if (sLower.includes("afternoon") || sLower.includes("lunch")) {
        afternoon += (afternoon ? " " : "") + sentence;
      } else if (sLower.includes("evening") || sLower.includes("dinner")) {
        evening += (evening ? " " : "") + sentence;
      } else if (sLower.includes("night") || sLower.includes("sleep")) {
        night += (night ? " " : "") + sentence;
      } else {
        if (sentences.length === 1) {
          morning = sentence;
        } else {
          const ratio = idx / sentences.length;
          if (ratio < 0.3) {
            morning += (morning ? " " : "") + sentence;
          } else if (ratio < 0.6) {
            afternoon += (afternoon ? " " : "") + sentence;
          } else if (ratio < 0.85) {
            evening += (evening ? " " : "") + sentence;
          } else {
            night += (night ? " " : "") + sentence;
          }
        }
      }
    });
  }

  if (!morning && !afternoon && !evening && !night) {
    morning = description;
  }

  return {
    morning: morning || null,
    afternoon: afternoon || null,
    evening: evening || null,
    night: night || null
  };
}

export default function ItineraryPage() {
  const { selectedDestination, customAttractions } = useTravelSession();
  const { departureCity } = useTravel();
  const destination = resolveDestination(selectedDestination) || resolveDestination("kyoto");
  
  const [itinerary, setItinerary] = useState(() => {
    if (!destination) return [];
    try {
      const cached = localStorage.getItem(`travio_itinerary_${destination.id}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  useEffect(() => {
    if (!destination) return;
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem(`travio_itinerary_${destination.id}`);
        if (cached) {
          setItinerary(JSON.parse(cached));
        }
      } catch (err) {
        console.error("Failed to sync itinerary:", err);
      }
    };
    window.addEventListener("travio_itinerary_update", handleUpdate);
    return () => window.removeEventListener("travio_itinerary_update", handleUpdate);
  }, [destination]);

  const displayItinerary = useMemo(() => {
    const destId = destination?.id;
    const added = (customAttractions && destId && customAttractions[destId]) || [];
    
    const formattedAdded = added.map(attr => ({
      day: "Added Attraction",
      title: attr.name,
      time: attr.duration || "Flexible Time",
      description: attr.description,
      icon: "📍"
    }));

    return [...itinerary, ...formattedAdded];
  }, [itinerary, customAttractions, destination]);

  const daysCount = useMemo(() => {
    const days = itinerary.filter(item => item.day && /^Day \d+/.test(item.day));
    return days.length > 0 ? days.length : itinerary.length;
  }, [itinerary]);

  useEffect(() => {
    if (!destination) return;

    // Check if itinerary is already cached
    let initialItin = [];
    try {
      const cached = localStorage.getItem(`travio_itinerary_${destination.id}`);
      initialItin = cached ? JSON.parse(cached) : [];
    } catch (err) {
      console.warn("Failed to check itinerary cache:", err);
    }

    if (initialItin.length > 0) {
      setTimeout(() => {
        setItinerary(initialItin);
        setLoading(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setLoading(true);
      setNoticeMessage("");
    }, 0);

    const userPrefs = JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
    const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";
    
    const attractionsList = getAttractionOptions(destination.id);

    fetch(`${apiBaseUrl}/ai/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: destination,
        preferences: userPrefs,
        departureCity: departureCity,
        hotels: [{ name: `${destination.city} Grand Stay` }],
        restaurants: [{ name: "Authentic Local Cafe" }],
        candidates: attractionsList.map(a => ({ ...a, type: "attraction" }))
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.itinerary)) {
          setItinerary(data.itinerary);
          localStorage.setItem(`travio_itinerary_${destination.id}`, JSON.stringify(data.itinerary));
          if (data.source === "fallback") {
            setNoticeMessage("Atlas is currently offline. Serving local custom itinerary.");
          } else if (data.source === "cache") {
            setNoticeMessage("Itinerary loaded instantly from Travio Cache.");
          } else {
            setNoticeMessage("");
          }
        } else {
          setNoticeMessage("Atlas is currently offline. Serving local custom itinerary.");
          const localItin = generateLocalItinerary(destination, userPrefs, departureCity);
          setItinerary(localItin);
          localStorage.setItem(`travio_itinerary_${destination.id}`, JSON.stringify(localItin));
        }
      })
      .catch(err => {
        console.error("Failed to fetch dynamic itinerary:", err);
        setNoticeMessage("Unable to connect to Atlas. Serving offline custom itinerary.");
        const localItin = generateLocalItinerary(destination, userPrefs, departureCity);
        setItinerary(localItin);
        localStorage.setItem(`travio_itinerary_${destination.id}`, JSON.stringify(localItin));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [destination, departureCity]);

  // Retrieve matching weather or compute dynamic fallback range
  const weatherRange = useMemo(() => {
    if (!destination) return "18°C - 25°C";
    if (weatherRanges[destination.id]) return weatherRanges[destination.id];
    if (destination.weather === "Snow") return "-5°C - 5°C";
    if (destination.weather === "Rainy") return "24°C - 30°C";
    if (destination.weather === "Cool") return "12°C - 20°C";
    if (destination.weather === "Windy") return "5°C - 12°C";
    return "18°C - 26°C";
  }, [destination]);

  // Format budget dynamically using destination & user currency
  const budgetDisplay = useMemo(() => {
    if (!destination) return "₹90,000";
    const userPrefs = JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
    const budgetLevel = userPrefs.budget || destination.budget || "Comfort";
    const userCurr = departureCity?.currency || "INR";
    const breakdown = calculateBudgetBreakdown(destination.id, budgetLevel, userPrefs.companions === "Solo" ? 1 : 2, userPrefs.duration || "5-7 Days", userCurr);
    return formatDualPrice(breakdown.totalCost, destination.currency, userCurr);
  }, [destination, departureCity]);

  // Calculate Match Score dynamically from the quiz answers
  const matchScore = useMemo(() => {
    if (!destination) return "96% Match";
    const userPrefs = JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
    const matches = calculateDestinationMatches(userPrefs);
    const matchObj = matches.find(m => m.id === destination.id);
    return matchObj ? `${matchObj.match}% Match` : "96% Match";
  }, [destination]);

  if (!destination) {
    return (
      <div className="itinerary-page">
        <Navbar />
        <div className="itinerary-header" style={{ padding: "100px 20px" }}>
          <h1>✈️ Explore a Destination First</h1>
          <p style={{ maxWidth: "600px", margin: "20px auto 30px" }}>
            Please select a destination to view its curated itinerary. Start by exploring our top recommendations!
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

  if (loading) {
    return (
      <div className="itinerary-page">
        <Navbar />
        <div className="itinerary-header">
          <h1>📅 Your AI Travel Itinerary</h1>
          <p>Planning your dream trip details...</p>
        </div>
        <div className="timeline" style={{ opacity: 0.6 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="timeline-card shimmer-bg" style={{ height: "120px", margin: "20px auto", borderRadius: "16px", maxWidth: "800px", background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="itinerary-page">
      <Navbar />

      <div className="itinerary-header">
        <h1>📅 Your AI Travel Itinerary</h1>
        <p>A personalized travel schedule created by Travio AI for {destination.city}, {destination.country}.</p>
      </div>

      {noticeMessage && (
        <div style={{
          background: noticeMessage.includes("instantly") ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
          border: noticeMessage.includes("instantly") ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(245, 158, 11, 0.15)",
          color: noticeMessage.includes("instantly") ? "#10B981" : "#F59E0B",
          padding: "12px 20px",
          borderRadius: "12px",
          maxWidth: "800px",
          margin: "-10px auto 25px",
          textAlign: "center",
          fontSize: "14px",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontWeight: "500",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
        }}>
          <span>{noticeMessage.includes("instantly") ? "⚡" : "⚠️"}</span>
          <span>{noticeMessage}</span>
        </div>
      )}

      <div className="itinerary-timeline">
        {displayItinerary.map((item, index) => {
          const parsed = parseDescription(item.description);
          return (
            <div className="itinerary-day-card" key={index}>
              <div className="itinerary-day-header">
                <div className="itinerary-day-badge">
                  <span className="day-icon">{item.icon}</span>
                  <span className="day-text">{item.day}</span>
                </div>
                <div className="itinerary-day-meta">
                  <h3 className="itinerary-day-title">{item.title}</h3>
                  <span className="itinerary-day-time">
                    <Clock size={16} />
                    {item.time}
                  </span>
                </div>
              </div>
              
              <div className="itinerary-day-divider"></div>
              
              <div className="itinerary-day-periods">
                {parsed.morning && (
                  <div className="itinerary-period-section morning">
                    <div className="period-label-row">
                      <Sun className="period-icon" size={18} />
                      <span className="period-name">Morning</span>
                    </div>
                    <p className="period-text">{parsed.morning}</p>
                  </div>
                )}
                
                {parsed.afternoon && (
                  <div className="itinerary-period-section afternoon">
                    <div className="period-label-row">
                      <SunDim className="period-icon" size={18} />
                      <span className="period-name">Afternoon</span>
                    </div>
                    <p className="period-text">{parsed.afternoon}</p>
                  </div>
                )}
                
                {parsed.evening && (
                  <div className="itinerary-period-section evening">
                    <div className="period-label-row">
                      <Sunset className="period-icon" size={18} />
                      <span className="period-name">Evening</span>
                    </div>
                    <p className="period-text">{parsed.evening}</p>
                  </div>
                )}
                
                {parsed.night && (
                  <div className="itinerary-period-section night">
                    <div className="period-label-row">
                      <Moon className="period-icon" size={18} />
                      <span className="period-name">Night</span>
                    </div>
                    <p className="period-text">{parsed.night}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="summary-card">
        <h2>🎯 AI Travel Summary</h2>
        <div className="summary-grid">
          <div>
            <h3>Budget</h3>
            <p>{budgetDisplay}</p>
          </div>
          <div>
            <h3>Duration</h3>
            <p>{daysCount} Days</p>
          </div>
          <div>
            <h3>Weather</h3>
            <p>{weatherRange}</p>
          </div>
          <div>
            <h3>Travel Score</h3>
            <p>{matchScore}</p>
          </div>
        </div>
      </div>

      {/* Atlas AI Travel Companion */}
      <div className="itinerary-companion-container" style={{ width: "min(1160px, calc(100% - 48px))", margin: "0 auto 40px" }}>
        <AtlasTripCompanion />
      </div>
    </div>
  );
}