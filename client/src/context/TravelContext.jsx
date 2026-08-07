import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getClosestDepartureCity, fetchLiveRates } from "../services/currencyService";

const TravelContext = createContext();

function TravelProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem("travio_theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("travio_theme", theme);
  }, [theme]);

  // Selections state
  const [selections, setSelections] = useState({
    weather: "Cool",
    crowd: "Moderate",
    budget: "₹10k–25k",
    style: "Culture",
    duration: "3–5 Days"
  });

  // Recommendation engine state
  const [bestDest, setBestDest] = useState(null);
  const [comparisonDests, setComparisonDests] = useState([]);
  const [insights, setInsights] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [personality, setPersonality] = useState("");
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("travio_favs")) || []);
  
  // Trip details state
  const [tripId, setTripId] = useState("");
  const [passportStamp, setPassportStamp] = useState("✓ BEST MATCH");
  const [boardingPass, setBoardingPass] = useState({
    seat: "14A",
    time: "08:30 AM",
    gate: "A12",
    flight: "TV104",
    tripId: "TRV-2026-48391"
  });

  // Packing list checklist state
  const [packingList, setPackingList] = useState({ clothing: [], essentials: [], electronics: [], documents: [], health: [] });
  const [packedItems, setPackedItems] = useState({});

  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);

  // Passenger state
  const [passengerName, setPassengerName] = useState(localStorage.getItem("travio_user") || "Bhoomika N");

  // Starting location states
  const [departureCity, setDepartureCity] = useState(() => {
    try {
      const saved = localStorage.getItem("travio_departure_city");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showDepartureModal, setShowDepartureModal] = useState(false);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem("travio_favs", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("travio_user", passengerName);
  }, [passengerName]);

  useEffect(() => {
    if (departureCity) {
      localStorage.setItem("travio_departure_city", JSON.stringify(departureCity));
    } else {
      localStorage.removeItem("travio_departure_city");
    }
  }, [departureCity]);

  useEffect(() => {
    // Fetch live currency rates on startup
    fetchLiveRates().catch(console.error);
  }, []);

  const checkDepartureCity = useCallback((forceModal = false) => {
    if (localStorage.getItem("travio_departure_city") && !forceModal) {
      return;
    }
    
    const asked = localStorage.getItem("travio_location_asked") === "true";
    if (asked && !forceModal) {
      const saved = localStorage.getItem("travio_departure_city");
      if (!saved) {
        setShowDepartureModal(true);
      }
      return;
    }
    
    // Request permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          localStorage.setItem("travio_location_asked", "true");
          const { latitude, longitude } = position.coords;
          const closestCity = getClosestDepartureCity(latitude, longitude);
          setDepartureCity(closestCity);
        },
        (error) => {
          localStorage.setItem("travio_location_asked", "true");
          setShowDepartureModal(true);
        },
        { timeout: 5000 }
      );
    } else {
      localStorage.setItem("travio_location_asked", "true");
      setShowDepartureModal(true);
    }
  }, []);

  return (
    <TravelContext.Provider
      value={{
        theme,
        setTheme,
        selections,
        setSelections,
        bestDest,
        setBestDest,
        comparisonDests,
        setComparisonDests,
        insights,
        setInsights,
        itinerary,
        setItinerary,
        loadingItinerary,
        setLoadingItinerary,
        personality,
        setPersonality,
        favorites,
        setFavorites,
        tripId,
        setTripId,
        passportStamp,
        setPassportStamp,
        boardingPass,
        setBoardingPass,
        packingList,
        setPackingList,
        packedItems,
        setPackedItems,
        chatHistory,
        setChatHistory,
        passengerName,
        setPassengerName,
        departureCity,
        setDepartureCity,
        showDepartureModal,
        setShowDepartureModal,
        checkDepartureCity
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}

export { TravelProvider };

// eslint-disable-next-line react-refresh/only-export-components
export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) {
    let savedCity = null;
    try {
      const saved = localStorage.getItem("travio_departure_city");
      if (saved) savedCity = JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      theme: "light",
      setTheme: () => {},
      selections: {},
      setSelections: () => {},
      bestDest: null,
      setBestDest: () => {},
      departureCity: savedCity,
      setDepartureCity: () => {},
      showDepartureModal: false,
      setShowDepartureModal: () => {},
      checkDepartureCity: () => {}
    };
  }
  return context;
}
