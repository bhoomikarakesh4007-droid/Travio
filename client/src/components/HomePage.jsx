import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  ArrowRight, 
  Search, 
  X, 
  Navigation,
  Globe,
  Sliders,
  DollarSign,
  Calendar,
  Star,
  Zap,
  Bookmark
} from "lucide-react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import destinationData, { resolveDestination, getDestinationsById } from "../data/destinationData";
import { useTravelSession } from "../context/TravelSessionContext";
import { useTravel } from "../context/TravelContext";
import { fetchWeather } from "../services/weatherService";

import "../styles/HomePage.css";

const LOCATION_COORDINATES = {
  // India
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
  ooty: [11.4102, 76.6950],
  shimla: [31.1048, 77.1734],
  manali: [32.2396, 77.1887],
  srinagar: [34.0837, 74.7973],
  
  // Japan
  tokyo: [35.6762, 139.6503],
  kyoto: [35.0116, 135.7681],
  osaka: [34.6937, 135.5023],
  hiroshima: [34.3853, 132.4553],
  hakone: [35.2324, 139.1069],
  yokohama: [35.4437, 139.6380],
  nara: [34.6851, 135.8048],
  nikko: [36.7199, 139.6982],
  okinawa: [26.2124, 127.6809],
  sapporo: [43.0618, 141.3545],

  // South Korea
  seoul: [37.5665, 126.9780],
  jejuisland: [33.4996, 126.5312],
  busan: [35.1796, 129.0756],
  incheon: [37.4563, 126.7052],

  // Italy
  rome: [41.9028, 12.4964],
  venice: [45.4408, 12.3155],
  florence: [43.7696, 11.2558],
  milan: [45.4642, 9.1900],
  naples: [40.8518, 14.2681],
  pisa: [43.7228, 10.4017],

  // France
  paris: [48.8566, 2.3522],
  nice: [43.7102, 7.2620],
  mountsaintmichel: [48.6360, -1.5114],
  lyon: [45.7640, 4.8357],
  marseille: [43.2965, 5.3698],

  // Switzerland
  interlaken: [46.6863, 7.8632],
  nterlaken: [46.6863, 7.8632],
  zurich: [47.3769, 8.5417],
  zermatt: [46.0207, 7.7491],
  geneva: [46.2044, 6.1432],

  // Norway
  tromso: [69.6492, 18.9553],
  bergen: [60.3913, 5.3221],

  // Iceland
  reykjavik: [64.1466, -21.9426],

  // Canada
  banff: [51.1784, -115.5708],
  vancouver: [49.2827, -123.1207],
  toronto: [43.6532, -79.3832],

  // Australia
  sydney: [-33.8688, 151.2093],
  melbourne: [-37.8136, 144.9631],
  brisbane: [-27.4698, 153.0251],
  perth: [-31.9505, 115.8605],
  cairns: [-16.9186, 145.7781],
  hobart: [-42.8821, 147.3272],
  canberra: [-35.2809, 149.1300],
  darwin: [-12.4634, 130.8456],

  // New Zealand
  queenstown: [-45.0312, 168.6626],
  auckland: [-36.8485, 174.7633],
  christchurch: [-43.5321, 172.6362],

  // Indonesia
  bali: [-8.4095, 115.1889],
  ubud: [-8.5069, 115.2625],
  jakarta: [-6.2088, 106.8456],

  // Thailand
  bangkok: [13.7563, 100.5018],
  phuket: [7.8804, 98.3922],
  krabi: [8.0863, 98.9063],

  // Singapore
  singaporecity: [1.3521, 103.8198],

  // UAE
  dubai: [25.2048, 55.2708],

  // Spain
  barcelona: [41.3851, 2.1734],
  madrid: [40.4168, -3.7037],

  // Brazil
  riodejaneiro: [-22.9068, -43.1729],
  saopaulo: [-23.5505, -46.6333],

  // USA
  newyorkcity: [40.7128, -74.0060],
  losangeles: [34.0522, -118.2437],
  sanfrancisco: [37.7749, -122.4194],
  miami: [25.7617, -80.1918],

  // Egypt
  cairo: [30.0444, 31.2357],

  // UK
  london: [51.5074, -0.1278]
};

const GLOBE_PINS = [
  { country: "Canada", flag: "🇨🇦", cities: "6 Cities", x: 100, y: 90 },
  { country: "Mexico", flag: "🇲🇽", cities: "6 Cities", x: 85, y: 180 },
  { country: "Brazil", flag: "🇧🇷", cities: "6 Cities", x: 200, y: 260 },
  { country: "France", flag: "🇫🇷", cities: "10 Cities", x: 425, y: 110 },
  { country: "Spain", flag: "🇪🇸", cities: "8 Cities", x: 405, y: 125 },
  { country: "Italy", flag: "🇮🇹", cities: "10 Cities", x: 445, y: 128 },
  { country: "Switzerland", flag: "🇨🇭", cities: "8 Cities", x: 438, y: 118 },
  { country: "Netherlands", flag: "🇳🇱", cities: "6 Cities", x: 430, y: 98 },
  { country: "Greece", flag: "🇬🇷", cities: "6 Cities", x: 460, y: 138 },
  { country: "Egypt", flag: "🇪🇬", cities: "6 Cities", x: 450, y: 190 },
  { country: "India", flag: "🇮🇳", cities: "15 Cities", x: 540, y: 200 },
  { country: "Nepal", flag: "🇳🇵", cities: "4 Cities", x: 560, y: 190 },
  { country: "Sri Lanka", flag: "🇱🇰", cities: "6 Cities", x: 548, y: 230 },
  { country: "Malaysia", flag: "🇲🇾", cities: "6 Cities", x: 610, y: 245 },
  { country: "Indonesia", flag: "🇮🇩", cities: "8 Cities", x: 630, y: 260 },
  { country: "Japan", flag: "🇯🇵", cities: "10 Cities", x: 665, y: 135 },
  { country: "South Korea", flag: "🇰🇷", cities: "8 Cities", x: 645, y: 145 },
  { country: "Australia", flag: "🇦🇺", cities: "8 Cities", x: 680, y: 320 },
  { country: "New Zealand", flag: "🇳🇿", cities: "6 Cities", x: 740, y: 360 }
];

// Haversine formula to calculate distance in km safely
function calculateDistance(lat1, lon1, lat2, lon2) {
  try {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return Infinity;
    }
    const parsedLat1 = parseFloat(lat1);
    const parsedLon1 = parseFloat(lon1);
    const parsedLat2 = parseFloat(lat2);
    const parsedLon2 = parseFloat(lon2);
    
    if (isNaN(parsedLat1) || isNaN(parsedLon1) || isNaN(parsedLat2) || isNaN(parsedLon2)) {
      return Infinity;
    }

    const R = 6371; // km
    const dLat = (parsedLat2 - parsedLat1) * Math.PI / 180;
    const dLon = (parsedLon2 - parsedLon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(parsedLat1 * Math.PI / 180) * Math.cos(parsedLat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  } catch (e) {
    console.error("Error calculating distance:", e);
    return Infinity;
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedDestination, setSelectedDestination, travelerPersonality, customAttractions } = useTravelSession();
  const { departureCity } = useTravel();

  // Geolocation state
  const [geoStatus, setGeoStatus] = useState("loading"); // 'loading' | 'granted' | 'denied'
  const [userCoords, setUserCoords] = useState(null);

  // Globe hovered pin tooltips
  const [hoveredPin, setHoveredPin] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, pinHeight: 0 });

  // Category filtering state
  const [activeCategory, setActiveCategory] = useState(null);

  // Country modal state
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Group destinations by country
  const allDestinations = useMemo(() => Object.values(destinationData), []);

  const countriesList = useMemo(() => {
    const map = {};
    allDestinations.forEach(dest => {
      const country = dest.country;
      if (!map[country]) {
        map[country] = {
          name: country,
          cities: [],
          hero: dest.hero || dest.image
        };
      }
      map[country].cities.push(dest);
    });
    return Object.values(map).sort((a, b) => b.cities.length - a.cities.length);
  }, [allDestinations]);

  // Dual-instantiated pins shift dynamically to match seamless map translation width of 800
  const allGlobePins = useMemo(() => {
    return [
      ...GLOBE_PINS.map(p => ({ ...p, keyId: `${p.country}-1` })),
      ...GLOBE_PINS.map(p => ({ ...p, keyId: `${p.country}-2`, x: p.x + 800 }))
    ];
  }, []);

  // Handle Geolocation logic
  const requestLocation = () => {
    setGeoStatus("loading");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGeoStatus("granted");
        },
        (error) => {
          console.warn("Geolocation permission error:", error);
          setGeoStatus("denied");
        },
        { timeout: 8000 }
      );
    } else {
      setGeoStatus("denied");
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Near You calculation
  const nearbyDestinations = useMemo(() => {
    let baseCoords = null;
    
    if (userCoords) {
      baseCoords = [userCoords.lat, userCoords.lng];
    } else if (departureCity && departureCity.coords) {
      baseCoords = departureCity.coords;
    }

    if (!baseCoords) return [];

    const listWithDist = allDestinations.map(dest => {
      const idLower = dest.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const destCoords = LOCATION_COORDINATES[idLower] || dest.coordinates || [0, 0];
      
      if (destCoords[0] === 0 && destCoords[1] === 0) {
        return { ...dest, distance: Infinity };
      }
      
      const distance = calculateDistance(baseCoords[0], baseCoords[1], destCoords[0], destCoords[1]);
      return { ...dest, distance };
    });

    const filtered = listWithDist.filter(dest => {
      // Exclude user's current city
      if (dest.distance < 8) return false;
      if (departureCity && dest.name.toLowerCase() === departureCity.name.toLowerCase()) return false;
      return dest.distance !== Infinity;
    });

    // Sort by distance ascending
    return filtered.sort((a, b) => a.distance - b.distance).slice(0, 6);
  }, [allDestinations, userCoords, departureCity]);

  // Category filtering matching
  const categoryDestinations = useMemo(() => {
    if (!activeCategory) return [];
    const nameLower = activeCategory.toLowerCase();
    
    return allDestinations.filter(dest => {
      const styles = (dest.travelStyle || []).map(s => s.toLowerCase());
      const desc = (dest.description || "").toLowerCase();
      const highlights = (dest.highlights || []).map(h => h.toLowerCase());
      const vibe = (dest.vibe || "").toLowerCase();

      if (nameLower === "beaches") {
        return styles.includes("beach") || desc.includes("beach") || desc.includes("island") || highlights.some(h => h.includes("beach"));
      }
      if (nameLower === "mountains") {
        return styles.includes("nature") && (desc.includes("mountain") || desc.includes("peak") || desc.includes("alpine") || desc.includes("volcano") || desc.includes("hills") || highlights.some(h => h.includes("mountain") || h.includes("peak") || h.includes("summit")));
      }
      if (nameLower === "cities") {
        return vibe === "futuristic" || vibe === "energetic" || vibe === "lively" || desc.includes("metropolis") || desc.includes("capital") || desc.includes("city");
      }
      if (nameLower === "food") {
        return styles.includes("food") || desc.includes("food") || desc.includes("culinary") || desc.includes("cuisine") || dest.famousFoods?.length > 0;
      }
      if (nameLower === "nature") {
        return styles.includes("nature") || desc.includes("nature") || desc.includes("forest") || desc.includes("park") || desc.includes("national park");
      }
      if (nameLower === "history") {
        return styles.includes("history") || styles.includes("culture") || desc.includes("culture") || desc.includes("temple") || desc.includes("historic") || desc.includes("ancient") || desc.includes("history") || highlights.some(h => h.includes("history") || h.includes("ancient") || h.includes("castle") || h.includes("temple"));
      }
      if (nameLower === "nightlife") {
        return styles.includes("nightlife") || vibe === "lively" || vibe === "energetic" || desc.includes("nightlife") || desc.includes("club") || desc.includes("bar");
      }
      if (nameLower === "shopping") {
        return desc.includes("shopping") || desc.includes("shop") || highlights.some(h => h.includes("shopping") || h.includes("market"));
      }
      return false;
    });
  }, [activeCategory, allDestinations]);

  const handleSelectDestination = (dest) => {
    setSelectedDestination(dest);
    navigate(`/destination/${dest.slug || dest.id}`);
  };

  // Curated list of trending destinations
  const trendingDestinations = useMemo(() => {
    return getDestinationsById(["kyoto", "bali", "rome", "interlaken", "tokyo", "paris", "reykjavik", "sydney"]).filter(Boolean);
  }, []);

  // Check if quiz has already been completed
  const isQuizCompleted = useMemo(() => {
    return !!travelerPersonality || !!sessionStorage.getItem("travio_user_preferences");
  }, [travelerPersonality]);

  // Check if active destination / itinerary exists
  const activePlanDestination = useMemo(() => {
    return selectedDestination ? resolveDestination(selectedDestination) : null;
  }, [selectedDestination]);

  // Progress calculator for continue planning
  const planProgress = useMemo(() => {
    if (!activePlanDestination) return 0;
    const destId = activePlanDestination.id;
    let progress = 30; // base progress for selecting a destination
    
    try {
      const cachedItin = localStorage.getItem(`travio_itinerary_${destId}`);
      if (cachedItin) {
        progress += 40;
      }
    } catch (e) {}

    const addedAttractions = (customAttractions && customAttractions[destId]) || [];
    if (addedAttractions.length > 0) {
      progress += 15;
    }

    if (departureCity) {
      progress += 15;
    }

    return Math.min(progress, 100);
  }, [activePlanDestination, customAttractions, departureCity]);

  // Scroll to "Around the World" countries section and open the modal overlay
  const handlePinClick = (pin) => {
    const matchedCountry = countriesList.find(c => c.name.toLowerCase() === pin.country.toLowerCase());
    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
    }
    const element = document.querySelector(".countries-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const categories = [
    { label: "Beaches", emoji: "🏖" },
    { label: "Mountains", emoji: "🏔" },
    { label: "Cities", emoji: "🏙" },
    { label: "Food", emoji: "🍜" },
    { label: "Nature", emoji: "🌸" },
    { label: "History", emoji: "🏛" },
    { label: "Nightlife", emoji: "🎉" },
    { label: "Shopping", emoji: "🛍" }
  ];

  // High-Resolution continent outlines with detailed coastlines and specific island groups
  const renderContinents = () => (
    <>
      {/* North America */}
      <path 
        d="M 50,50 L 70,45 L 85,52 L 95,35 L 120,40 L 140,25 L 165,30 L 155,55 L 175,60 L 185,85 L 170,120 L 195,130 L 210,150 L 180,165 L 160,210 L 145,230 L 152,260 L 140,270 L 120,230 L 105,220 L 98,180 L 80,185 L 75,160 L 85,150 L 65,145 L 60,110 L 45,105 L 50,75 Z"
        className="globe-continent"
      />
      {/* Greenland */}
      <path 
        d="M 180,20 L 210,15 L 225,35 L 205,65 L 175,55 L 170,35 Z"
        className="globe-continent"
      />
      {/* South America */}
      <path 
        d="M 152,272 L 172,272 L 188,285 L 205,295 L 215,315 L 218,340 L 208,365 L 195,390 L 175,425 L 162,435 L 152,435 L 158,400 L 150,375 L 142,350 L 145,320 L 142,295 Z"
        className="globe-continent"
      />
      {/* Africa */}
      <path 
        d="M 330,220 L 350,205 L 385,200 L 400,208 L 408,220 L 398,245 L 415,255 L 422,280 L 418,310 L 405,330 L 392,355 L 375,375 L 360,380 L 355,365 L 350,340 L 348,305 L 332,290 L 325,270 L 322,245 Z"
        className="globe-continent"
      />
      {/* Madagascar */}
      <path 
        d="M 425,320 L 435,315 L 440,330 L 430,345 L 420,335 Z"
        className="globe-continent"
      />
      {/* Eurasia */}
      <path 
        d="M 315,210 L 310,175 L 320,160 L 315,140 L 335,130 L 350,145 L 368,118 L 390,128 L 405,110 L 430,90 L 450,95 L 468,70 L 490,85 L 530,65 L 575,80 L 610,65 L 650,82 L 690,70 L 730,85 L 750,110 L 740,135 L 725,150 L 728,175 L 702,185 L 705,202 L 678,208 L 665,190 L 642,195 L 650,215 L 638,230 L 615,220 L 602,242 L 588,230 L 572,238 L 565,218 L 542,210 L 545,228 L 532,225 L 525,208 L 505,205 L 485,230 L 460,220 L 430,228 L 408,215 Z"
        className="globe-continent"
      />
      {/* Great Britain & Ireland */}
      <path 
        d="M 350,90 L 362,85 L 365,98 L 355,105 Z M 340,98 L 348,95 L 345,102 L 338,102 Z"
        className="globe-continent"
      />
      {/* Japan */}
      <path 
        d="M 725,118 L 732,110 L 738,128 L 730,140 Z M 718,135 L 724,130 L 726,142 L 720,145 Z"
        className="globe-continent"
      />
      {/* Southeast Asia & Indonesia */}
      <path 
        d="M 610,248 L 620,242 L 630,252 L 625,258 Z M 635,255 L 648,250 L 652,260 L 640,265 Z M 658,262 L 672,258 L 678,270 L 662,272 Z M 612,225 L 628,220 L 630,232 L 618,235 Z"
        className="globe-continent"
      />
      {/* Australia */}
      <path 
        d="M 660,325 L 690,318 L 715,328 L 722,350 L 710,380 L 685,392 L 662,380 L 655,352 Z"
        className="globe-continent"
      />
      {/* New Zealand */}
      <path 
        d="M 738,382 L 748,375 L 752,390 Z M 748,395 L 758,388 L 762,405 Z"
        className="globe-continent"
      />
    </>
  );

  // Viewport boundaries handler for fixed-position tooltip
  const renderTooltipOverlay = () => {
    if (!hoveredPin) return null;

    const width = 145;
    const height = 58;

    let left = tooltipPos.x - width / 2;
    let top = tooltipPos.y - height;

    // Boundary check against viewport edges
    if (left < 12) {
      left = 12;
    } else if (left + width > window.innerWidth - 12) {
      left = window.innerWidth - width - 12;
    }

    if (top < 12) {
      // Position below the pin target if it overflows the top edge
      top = tooltipPos.y + (tooltipPos.pinHeight || 24) + 12;
    }

    return (
      <div 
        className="globe-tooltip-card viewport-fixed glass"
        style={{
          position: "fixed",
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          zIndex: 100000,
          pointerEvents: "none",
          transform: "none", // Prevent CSS translation collision
          animation: "none" // Disable automatic SVG position overrides
        }}
      >
        <div className="tooltip-header">
          <span className="tooltip-flag">{hoveredPin.flag}</span>
          <h4>{hoveredPin.country}</h4>
        </div>
        <span className="tooltip-cities-count">{hoveredPin.cities}</span>
      </div>
    );
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* 1. INTERACTIVE HIGH-RESOLUTION WORLD GLOBE HERO */}
      <section className="globe-banner-section">
        
        {/* Drifting Sky Clouds */}
        <div className="sky-cloud cloud-1">☁️</div>
        <div className="sky-cloud cloud-2">☁️</div>
        
        {/* Flapping Birds Flock */}
        <svg className="flying-birds" viewBox="0 0 100 40">
          <path d="M 5,12 Q 12,2 19,12 T 33,12" fill="none" stroke="rgba(3, 105, 161, 0.28)" strokeWidth="1.5" />
          <path d="M 25,22 Q 32,12 39,22 T 53,22" fill="none" stroke="rgba(3, 105, 161, 0.28)" strokeWidth="1.5" />
        </svg>

        {/* Hot Air Balloon */}
        <div className="hot-air-balloon">🎈</div>

        <div className="globe-banner-header">
          <h1>Explore the World</h1>
          <p>Choose your next destination from countries across the globe.</p>
        </div>

        <div className="globe-banner-content">
          <div className="globe-sphere-wrapper">
            
            {/* 3D Sphere Container with overflow hidden */}
            <div className="globe-sphere-container">
              <svg viewBox="0 0 400 400" className="globe-sphere-svg">
                <defs>
                  {/* Rich blue ocean background gradient */}
                  <radialGradient id="ocean-grad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="60%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </radialGradient>

                  {/* 3D Glass Sphere shading layout overlay */}
                  <radialGradient id="sphere-glass-shading" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
                  </radialGradient>

                  {/* Circular mask for coordinates clip path */}
                  <clipPath id="globe-clip">
                    <circle cx="200" cy="200" r="170" />
                  </clipPath>
                </defs>

                {/* Ocean Sphere base */}
                <circle cx="200" cy="200" r="170" fill="url(#ocean-grad)" className="globe-ocean" />

                {/* Masked continents group rotating infinitely */}
                <g clipPath="url(#globe-clip)">
                  <g className="globe-translation-group">
                    {/* First pattern segment */}
                    <g>{renderContinents()}</g>
                    {/* Second repeating pattern segment (shifted by 800px) */}
                    <g transform="translate(800, 0)">{renderContinents()}</g>

                    {/* Flight routes connecting pins */}
                    <path d="M 100,90 Q 92,135 85,180" className="flight-route" />
                    <path d="M 425,110 Q 435,119 445,128" className="flight-route" />
                    <path d="M 540,200 Q 602,140 665,135" className="flight-route" />
                    <path d="M 680,320 Q 710,340 740,360" className="flight-route" />

                    <path d="M 900,90 Q 892,135 885,180" className="flight-route" />
                    <path d="M 1225,110 Q 1235,119 1245,128" className="flight-route" />
                    <path d="M 1340,200 Q 1402,140 1465,135" className="flight-route" />
                    <path d="M 1480,320 Q 1510,340 1540,360" className="flight-route" />

                    {/* Flying airplane animations along routes */}
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 100,90 Q 92,135 85,180" dur="9s" repeatCount="indefinite" rotate="auto" />
                    </g>
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 425,110 Q 435,119 445,128" dur="8s" repeatCount="indefinite" rotate="auto" />
                    </g>
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 540,200 Q 602,140 665,135" dur="10s" repeatCount="indefinite" rotate="auto" />
                    </g>
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 680,320 Q 710,340 740,360" dur="9s" repeatCount="indefinite" rotate="auto" />
                    </g>

                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 900,90 Q 892,135 885,180" dur="9s" repeatCount="indefinite" rotate="auto" />
                    </g>
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 1225,110 Q 1235,119 1245,128" dur="8s" repeatCount="indefinite" rotate="auto" />
                    </g>
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 1340,200 Q 1402,140 1465,135" dur="10s" repeatCount="indefinite" rotate="auto" />
                    </g>
                    <g className="flying-airplane">
                      <path d="M12 2 L2 22 L10 16 L18 22 Z" fill="#ffffff" transform="scale(0.4) rotate(90)" />
                      <animateMotion path="M 1480,320 Q 1510,340 1540,360" dur="9s" repeatCount="indefinite" rotate="auto" />
                    </g>

                    {/* Integrated Rotating Pins */}
                    {allGlobePins.map((pin) => (
                      <g
                        key={pin.keyId}
                        className={`globe-pin-group ${hoveredPin?.keyId === pin.keyId ? "pin-active-glow" : ""}`}
                        transform={`translate(${pin.x}, ${pin.y})`}
                        tabIndex="0"
                        aria-label={`${pin.country}, ${pin.cities}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handlePinClick(pin);
                          }
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPin(pin);
                          setTooltipPos({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 12,
                            pinHeight: rect.height
                          });
                        }}
                        onMouseLeave={() => setHoveredPin(null)}
                        onFocus={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPin(pin);
                          setTooltipPos({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 12,
                            pinHeight: rect.height
                          });
                        }}
                        onBlur={() => setHoveredPin(null)}
                        onClick={() => handlePinClick(pin)}
                      >
                        {/* Soft glow circle directly around country pins on hover */}
                        {hoveredPin?.keyId === pin.keyId && (
                          <circle r="16" className="pin-hover-glow" />
                        )}
                        
                        {/* Premium Map Pin shapes replacing simple dot highlights */}
                        <path 
                          d="M 0,0 C -3.5,-6 -6.5,-9.5 -6.5,-14 C -6.5,-18 -3.5,-21 0,-21 C 3.5,-21 6.5,-18 6.5,-14 C 6.5,-9.5 3.5,-6 0,0 Z" 
                          className="pin-shape" 
                        />
                        <circle cx="0" cy="-14" r="2.2" className="pin-dot" />

                        {/* Expanded invisible hit target overlay to ease mouse triggers selection */}
                        <circle r="18" fill="transparent" style={{ cursor: "pointer" }} />
                      </g>
                    ))}
                  </g>

                  {/* Atmospheric Drifting Clouds overlay */}
                  <g className="globe-clouds-group">
                    <g>
                      <path d="M 120,60 Q 145,45 170,60 T 220,60" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M 300,160 Q 330,145 360,160 T 430,160" fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 500,280 Q 525,265 550,280 T 600,280" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
                    </g>
                    <g transform="translate(800, 0)">
                      <path d="M 120,60 Q 145,45 170,60 T 220,60" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M 300,160 Q 330,145 360,160 T 430,160" fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 500,280 Q 525,265 550,280 T 600,280" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
                    </g>
                  </g>
                </g>

                {/* Spherical Shading Glass Reflections */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="170" 
                  fill="url(#sphere-glass-shading)" 
                  className="globe-shading" 
                  pointerEvents="none" 
                />
              </svg>
            </div>

          </div>
        </div>

        {/* Skyline Silhouettes of major landmarks decoration at bottom */}
        <div className="landmark-silhouettes">
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="silhouettes-svg">
            {/* Torii Gate */}
            <path d="M 80,100 L 80,60 L 60,60 L 60,54 L 80,54 L 80,44 L 50,44 L 50,36 L 110,36 L 110,44 L 88,44 L 88,54 L 108,54 L 108,60 L 88,60 L 88,100 Z" fill="rgba(3, 105, 161, 0.07)" />
            {/* Big Ben */}
            <path d="M 220,100 L 220,40 L 216,40 L 216,36 L 220,36 L 220,15 L 224,10 L 228,15 L 228,36 L 232,36 L 232,40 L 228,40 L 228,100 Z" fill="rgba(3, 105, 161, 0.07)" />
            {/* Taj Mahal */}
            <path d="M 380,100 L 380,80 L 376,80 L 376,60 C 376,50 384,50 384,60 L 384,80 L 396,80 L 396,75 L 404,75 L 404,80 L 416,80 L 416,55 C 416,40 436,40 436,55 L 436,80 L 448,80 L 448,75 L 456,75 L 456,80 L 468,80 L 468,60 C 468,50 476,50 476,60 L 476,80 L 472,80 L 472,100 Z" fill="rgba(3, 105, 161, 0.07)" />
            {/* Eiffel Tower */}
            <path d="M 620,100 L 634,40 L 630,40 L 630,34 L 636,34 L 636,10 L 640,10 L 640,34 L 646,34 L 646,40 L 642,40 L 656,100 L 648,100 L 644,80 C 642,75 634,75 632,80 L 628,100 Z" fill="rgba(3, 105, 161, 0.07)" />
            {/* Sydney Opera House */}
            <path d="M 800,100 C 800,80 810,60 830,60 C 820,80 810,95 810,100 M 825,100 C 825,75 840,55 860,55 C 845,75 835,95 835,100 M 850,100 C 850,70 870,50 890,50 C 875,70 860,95 860,100 Z" stroke="rgba(3, 105, 161, 0.07)" strokeWidth="2" fill="rgba(3, 105, 161, 0.07)" />
          </svg>
        </div>

        {/* Viewport-fixed tooltip overlay rendered at section root to prevent overflow hidden clipping */}
        {renderTooltipOverlay()}

      </section>

      <div className="dashboard-content">
        
        {/* 3. NEAR YOU */}
        <section className="dashboard-section nearby-section">
          <div className="section-header">
            <h2 className="section-title">📍 Near You</h2>
            <p className="section-desc">Suggesting nearby destinations in your country or neighboring regions.</p>
          </div>
          
          {geoStatus === "granted" || (geoStatus === "loading" && nearbyDestinations.length > 0) ? (
            <div className="nearby-grid">
              {nearbyDestinations.map((dest) => (
                <div 
                  key={dest.id} 
                  className="nearby-card premium-card"
                  onClick={() => handleSelectDestination(dest)}
                >
                  <div className="nearby-image-container">
                    <img src={dest.hero || dest.image} alt={dest.city} className="nearby-image" loading="lazy" />
                    {dest.distance !== Infinity && (
                      <span className="distance-badge">
                        <Navigation size={12} fill="white" />
                        {Math.round(dest.distance).toLocaleString()} km away
                      </span>
                    )}
                  </div>
                  <div className="nearby-details">
                    <div className="nearby-header">
                      <h3>{dest.city}</h3>
                      <span className="nearby-rating">⭐ {dest.rating || dest.aiRating || "4.8"}</span>
                    </div>
                    <p className="nearby-desc-short">{dest.description || "A wonderful travel spot to explore."}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : geoStatus === "loading" ? (
            <div className="location-loading-state glass">
              <div className="spinner" />
              <p>Locating closest wonders near you...</p>
            </div>
          ) : (
            <div className="location-permission-card glass">
              <div className="location-alert-icon">📍</div>
              <h3>Personalized Nearby Recommendations</h3>
              <p>Enable browser location services to dynamically discover stunning travel destinations close to you.</p>
              <button className="location-enable-btn" onClick={requestLocation}>
                Enable Location
              </button>
            </div>
          )}
        </section>

        {/* 4. AI TRAVEL QUIZ */}
        <section className="dashboard-section quiz-section">
          <div className="quiz-banner-card glass">
            <div className="quiz-glow-effect" />
            <div className="quiz-card-content">
              <div className="quiz-badge">
                <Sparkles size={16} />
                <span>AI MATCHMAKING</span>
              </div>
              <h2 className="quiz-title">Not sure where to go?</h2>
              <p className="quiz-description">
                Take the AI Travel Quiz for personalized recommendations.
              </p>
              <button className="quiz-action-btn" onClick={() => navigate("/preferences")}>
                {isQuizCompleted ? "Retake Quiz" : "Start Quiz"}
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="quiz-visual-decor">
              <Globe className="spinning-globe" size={120} />
            </div>
          </div>
        </section>

        {/* 5. CONTINUE PLANNING */}
        {activePlanDestination && (
          <section className="dashboard-section continue-planning-section">
            <div className="section-header">
              <h2 className="section-title">Continue Planning</h2>
              <p className="section-desc">Pick up right where you left off on your latest adventure.</p>
            </div>
            
            <div className="continue-planning-card glass">
              <img 
                src={activePlanDestination.hero || activePlanDestination.image} 
                alt={activePlanDestination.city} 
                className="continue-dest-img" 
              />
              <div className="continue-content">
                <span className="continue-tag">RESUME TRIP</span>
                <h2>{activePlanDestination.city}</h2>
                
                {/* Progress Indicator */}
                <div className="continue-progress-wrapper">
                  <div className="progress-info">
                    <span className="progress-label">Planning Progress</span>
                    <span className="progress-value">{planProgress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${planProgress}%` }} />
                  </div>
                </div>

                <button 
                  className="continue-btn"
                  onClick={() => navigate(`/destination/${activePlanDestination.slug || activePlanDestination.id}`)}
                >
                  Continue Planning
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 6. TRENDING DESTINATIONS */}
        <section className="dashboard-section trending-section">
          <div className="section-header">
            <h2 className="section-title">Trending Destinations</h2>
            <p className="section-desc">Globally popular destinations loved by travelers right now.</p>
          </div>
          
          <div className="carousel-container">
            <div className="trending-carousel">
              {trendingDestinations.map((dest) => (
                <div 
                  key={dest.id} 
                  className="carousel-card premium-card"
                  onClick={() => handleSelectDestination(dest)}
                >
                  <img src={dest.hero || dest.image} alt={dest.city} className="carousel-card-image" loading="lazy" />
                  <div className="carousel-card-overlay" />
                  <div className="carousel-card-content">
                    <div className="carousel-card-top">
                      <span className="rating-tag">⭐ {dest.rating || dest.aiRating || "4.8"}</span>
                    </div>
                    <div className="carousel-card-bottom">
                      <h3>{dest.city}</h3>
                      <p className="carousel-country">{dest.country}</p>
                      
                      <div className="carousel-mini-metrics">
                        <span>💰 {dest.budget || "Medium"}</span>
                        <span>🌸 {dest.bestSeason ? dest.bestSeason.split(" (")[0] : "All Year"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. EXPLORE BY TRAVEL STYLE */}
        <section className="dashboard-section style-section">
          <div className="section-header">
            <h2 className="section-title">Explore by Travel Style</h2>
            <p className="section-desc">Filter travel options tailored directly to your preferred adventures.</p>
          </div>
          
          <div className="style-categories">
            {categories.map((cat) => (
              <button 
                key={cat.label} 
                className={`category-btn glass ${activeCategory === cat.label ? "active" : ""}`}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="category-results-wrapper">
              <h3 className="category-results-title">
                Showing {activeCategory} ({categoryDestinations.length} results)
              </h3>
              
              {categoryDestinations.length > 0 ? (
                <div className="category-grid">
                  {categoryDestinations.map((dest) => (
                    <div 
                      key={dest.id}
                      className="category-result-card premium-card"
                      onClick={() => handleSelectDestination(dest)}
                    >
                      <img src={dest.hero || dest.image} alt={dest.city} className="category-result-img" loading="lazy" />
                      <div className="category-result-content">
                        <h4>{dest.city}</h4>
                        <p>{dest.country}</p>
                        <div className="category-result-footer">
                          <span>⭐ {dest.rating || "4.8"}</span>
                          <span>💰 {dest.budget || "Medium"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="category-results-empty">No destinations found matching this style.</p>
              )}
            </div>
          )}
        </section>

        {/* 8. ATLAS PREVIEW */}
        <section className="dashboard-section atlas-preview-section">
          <div className="atlas-preview-card dark-card">
            <div className="atlas-glow-decor" />
            <div className="atlas-preview-content">
              <div className="atlas-ai-badge">
                <Zap size={14} fill="#3B82F6" color="#3B82F6" />
                <span>AI ASSISTANT</span>
              </div>
              <h2>Atlas</h2>
              <p className="atlas-helper-bold">Need help planning your next adventure?</p>
              <p className="atlas-desc">
                Atlas can recommend destinations, create itineraries, suggest hotels, restaurants and answer travel questions.
              </p>
              <button className="atlas-btn" onClick={() => navigate("/atlas")}>
                Open Atlas
                <Sparkles size={16} />
              </button>
            </div>
            <div className="atlas-preview-decor">
              <div className="atlas-chat-bubble glass">
                <span className="avatar">🤖</span>
                <span className="text">"I can plan a perfect week in Kyoto for you! Just say the word."</span>
              </div>
              <div className="atlas-chat-bubble secondary-bubble glass">
                <span className="avatar">✈️</span>
                <span className="text">"Let's bundle flights from New York to Rome..."</span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. AROUND THE WORLD */}
        <section className="dashboard-section countries-section">
          <div className="section-header">
            <h2 className="section-title">Around the World</h2>
            <p className="section-desc">Explore amazing destinations grouped by country catalogued in Travio.</p>
          </div>
          
          <div className="countries-grid">
            {countriesList.map((country) => (
              <div 
                key={country.name}
                className="country-card premium-card"
                onClick={() => setSelectedCountry(country)}
              >
                <img src={country.hero} alt={country.name} className="country-card-img" loading="lazy" />
                <div className="country-card-overlay" />
                <div className="country-card-content">
                  <h3>{country.name}</h3>
                  <span className="country-count">{country.cities.length} {country.cities.length === 1 ? "city" : "cities"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Country Cities Modal Overlay */}
      {selectedCountry && (
        <div 
          className="country-cities-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCountry(null);
          }}
        >
          <div className="country-cities-modal glass">
            <div className="modal-header">
              <div>
                <h2>{selectedCountry.name}</h2>
                <p>Explore {selectedCountry.cities.length} available cities in {selectedCountry.name}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedCountry(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-content-grid">
              {selectedCountry.cities.map((city) => (
                <div 
                  key={city.id}
                  className="modal-city-card premium-card"
                  onClick={() => {
                    setSelectedCountry(null);
                    handleSelectDestination(city);
                  }}
                >
                  <img src={city.hero || city.image} alt={city.city} className="modal-city-img" loading="lazy" />
                  <div className="modal-city-details">
                    <h4>{city.city}</h4>
                    <div className="modal-city-metrics">
                      <span>⭐ {city.rating || "4.8"}</span>
                      <span>💰 {city.budget || "Medium"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
