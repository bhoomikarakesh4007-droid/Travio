import { useState, useEffect, useRef } from "react";
import { X, Minimize2, Maximize2, Send, Sparkles, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTravelSession } from "../context/TravelSessionContext";
import { useWishlist } from "../context/WishlistContext";
import { resolveDestination } from "../data/destinationData";
import "../styles/AtlasChat.css";
import { chatWithAtlas } from "../services/aiService.js";
import { 
  getActiveSessionMessages, 
  saveActiveSessionMessages, 
  saveConversationToHistory, 
  getDefaultWelcomeMessage 
} from "../services/atlasHistoryService";

// Safe dynamic message ID generator
let nextMsgIdVal = 0;
const generateMsgId = () => {
  nextMsgIdVal += 1;
  return `chat-msg-${Date.now()}-${nextMsgIdVal}-${Math.random()}`;
};

// Copy Button
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      className={`atlas-copy-btn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      title="Copy message"
      aria-label="Copy message"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
};

/* ==========================================
          INTERACTIVE RESPONSE CARDS
========================================== */

const DestinationCard = ({ cityName, country, description, imageUrl, onAddToWishlist, isWishlisted, onViewDetails }) => (
  <div className="atlas-chat-card destination-card">
    {imageUrl && <img src={imageUrl} alt={cityName} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{cityName}, <span className="atlas-card-country">{country}</span></h4>
      <p className="atlas-card-desc">{description}</p>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onViewDetails}>Details</button>
        <button type="button" className={`atlas-card-btn secondary ${isWishlisted ? "active" : ""}`} onClick={onAddToWishlist}>
          {isWishlisted ? "✓ Saved" : "Wishlist"}
        </button>
      </div>
    </div>
  </div>
);

const HotelCard = ({ name, rating, price, distance, imageUrl, onShowMap, onViewDetails }) => (
  <div className="atlas-chat-card hotel-card">
    {imageUrl && <img src={imageUrl} alt={name} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{name}</h4>
      <div className="atlas-card-meta">
        <span>⭐ {rating}</span>
        <span>{price}</span>
        <span>📍 {distance}</span>
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onViewDetails}>Details</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onShowMap}>Map</button>
      </div>
    </div>
  </div>
);

const RestaurantCard = ({ name, cuisine, rating, hours, imageUrl, onShowMap, onViewDetails }) => (
  <div className="atlas-chat-card restaurant-card">
    {imageUrl && <img src={imageUrl} alt={name} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{name}</h4>
      <div className="atlas-card-meta">
        <span>🍲 {cuisine}</span>
        <span>⭐ {rating}</span>
        <span>⏰ {hours}</span>
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onViewDetails}>Details</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onShowMap}>Map</button>
      </div>
    </div>
  </div>
);

const AttractionCard = ({ name, description, imageUrl, onAddToItinerary, isAdded, onShowMap }) => (
  <div className="atlas-chat-card attraction-card">
    {imageUrl && <img src={imageUrl} alt={name} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{name}</h4>
      <p className="atlas-card-desc">{description}</p>
      <div className="atlas-card-actions">
        <button 
          type="button" 
          className={`atlas-card-btn primary ${isAdded ? "active" : ""}`} 
          onClick={onAddToItinerary}
          disabled={isAdded}
        >
          {isAdded ? "✓ Added" : "+ Itinerary"}
        </button>
        <button type="button" className="atlas-card-btn secondary" onClick={onShowMap}>Map</button>
      </div>
    </div>
  </div>
);

const PackingCard = ({ items, onAddToPacking, onCopy, checkedStates, onToggleItem }) => (
  <div className="atlas-chat-card packing-card">
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">🧳 Checklist</h4>
      <div className="atlas-packing-checklist">
        {items.map((item, index) => {
          const isChecked = checkedStates[item] || false;
          return (
            <label className="atlas-packing-item" key={index}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleItem(item)}
              />
              <span className={isChecked ? "checked-item" : ""}>{item}</span>
            </label>
          );
        })}
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onAddToPacking}>+ Packing Page</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onCopy}>Copy</button>
      </div>
    </div>
  </div>
);

const ItineraryCard = ({ timelineItems, onOpenItinerary, onRegenerate, onSave, isSaved }) => (
  <div className="atlas-chat-card itinerary-card">
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">📅 Timeline</h4>
      <div className="atlas-itinerary-timeline">
        {timelineItems.map((item, index) => (
          <div className="timeline-day" key={index}>
            <div className="timeline-day-header">{item.day}</div>
            <div className="timeline-day-activity">{item.activity}</div>
          </div>
        ))}
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onOpenItinerary}>Open</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onRegenerate}>Redo</button>
        <button type="button" className={`atlas-card-btn secondary ${isSaved ? "active" : ""}`} onClick={onSave}>
          {isSaved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  </div>
);

/* ==========================================
          MAIN COMPONENT
========================================== */

export default function AtlasChat({ isOpen, onClose, isMinimized, onToggleMinimize, chatPosition }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { selectedDestination, customAttractions, addAttractionToItinerary, removeAttractionFromItinerary } = useTravelSession();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  // Session conversation persistence
  const [messages, setMessages] = useState(() => getActiveSessionMessages());

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  
  // Loading progress message state
  const [loadingText, setLoadingText] = useState("🌍 Understanding your trip...");

  // Toast message
  const [toast, setToast] = useState("");

  const chatRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Extract destination details
  const match = location.pathname.match(/\/details\/([^/]+)/);
  const destinationId = match ? match[1] : null;
  const destId = destinationId || (selectedDestination ? selectedDestination.id : null);
  const destination = destId ? resolveDestination(destId) : null;
  const cityName = destination ? destination.city : null;

  // Sync packing checked state from localStorage
  const [packingChecked, setPackingChecked] = useState({});
  useEffect(() => {
    if (destination) {
      try {
        const saved = localStorage.getItem(`travio_packing_checked_${destination.id}`);
        const parsed = saved ? JSON.parse(saved) : {};
        setTimeout(() => {
          setPackingChecked(parsed);
        }, 0);
      } catch (err) {
        console.error("Failed to load initial checked packing items in chat:", err);
      }
    }
  }, [destination]);

  // Listener to keep packing checks updated in real-time
  useEffect(() => {
    if (!destination) return;
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(`travio_packing_checked_${destination.id}`);
        const parsed = saved ? JSON.parse(saved) : {};
        setPackingChecked(parsed);
      } catch (err) {
        console.error("Failed to sync checked packing items in chat:", err);
      }
    };
    window.addEventListener("travio_packing_update", handleUpdate);
    return () => window.removeEventListener("travio_packing_update", handleUpdate);
  }, [destination]);

  // Cycle loading messages when typing
  useEffect(() => {
    let interval;
    if (isTyping) {
      const loaderMessages = [
        "🌍 Understanding your trip...",
        "📍 Checking destination context...",
        "🧠 Building recommendations...",
        "✈️ Planning your journey..."
      ];
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loaderMessages.length;
        setLoadingText(loaderMessages[index]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  // Determine current page and tab titles/descriptions for context mapping
  const getPageTitle = (pathname) => {
    if (pathname === "/home") return "Homepage";
    if (pathname === "/preferences") return "Preferences Page";
    if (pathname === "/results") return "Results Page";
    if (pathname === "/packing") return "Packing Page";
    if (pathname === "/itinerary") return "Itinerary Page";
    if (pathname === "/profile") return "Profile Page";
    
    if (pathname.startsWith("/details")) {
      const activeTab = sessionStorage.getItem("travio_active_details_tab") || "Overview";
      if (activeTab === "Overview") return "Destination Details Page";
      if (activeTab === "Map") return "Maps Page";
      if (activeTab === "Route Planner") return "Route Planner Page";
      if (activeTab === "Hotels") return "Hotels Page";
      if (activeTab === "Restaurants") return "Restaurants Page";
      if (activeTab === "Weather") return "Weather Page";
      return `${activeTab} Section`;
    }
    return "Travio App";
  };

  const getPageDescription = (pathname, destName) => {
    const citySuffix = destName ? ` in ${destName}` : "";
    if (pathname === "/home") return "User is browsing the home explorer screen.";
    if (pathname === "/preferences") return "User is answering travel preference wizard questions.";
    if (pathname === "/results") return "User is viewing tailored destination recommendations matches.";
    if (pathname === "/packing") return `User is managing smart packing lists${citySuffix}.`;
    if (pathname === "/itinerary") return `User is reviewing daily custom schedules${citySuffix}.`;
    if (pathname === "/profile") return "User is viewing history profile.";
    
    if (pathname.startsWith("/details")) {
      const activeTab = sessionStorage.getItem("travio_active_details_tab") || "Overview";
      if (activeTab === "Overview") return `User is reading destination overview and travel tips${citySuffix}.`;
      if (activeTab === "Map") return `User is looking at the location Map${citySuffix}.`;
      if (activeTab === "Route Planner") return `User is arranging custom route stops${citySuffix}.`;
      if (activeTab === "Hotels") return `User is browsing local hotels lists${citySuffix}.`;
      if (activeTab === "Restaurants") return `User is exploring local restaurants list${citySuffix}.`;
      if (activeTab === "Weather") return `User is inspecting local climate and live weather details${citySuffix}.`;
      return `User is viewing details tab ${activeTab}${citySuffix}.`;
    }
    return `User is on the ${pathname.replace("/", "") || "home"} page.`;
  };

  // Sync conversation history to sessionStorage
  useEffect(() => {
    saveActiveSessionMessages(messages);
  }, [messages]);

  // Click Outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && 
          chatRef.current && 
          !chatRef.current.contains(e.target) && 
          !e.target.closest(".atlas-floating-button")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Autofocus input
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 2800);
  };

  // Actions Executor
  const executeActionsInMessage = (text) => {
    const actionRegex = /\[Action:\s*([^\]]+)\]/gi;
    let match;
    let toastMsg = "";

    while ((match = actionRegex.exec(text)) !== null) {
      const parts = match[1].split("|").map(s => s.trim());
      const actionType = parts[0];

      if (actionType === "add_wishlist") {
        const [, id, city, country, desc, img] = parts;
        if (id) {
          addToWishlist({ id, city, country, description: desc, image: img });
          toastMsg = "✓ Saved to wishlist.";
        }
      } else if (actionType === "remove_wishlist") {
        const [, id] = parts;
        if (id) {
          removeFromWishlist(id);
          toastMsg = "✓ Removed from wishlist.";
        }
      } else if (actionType === "add_attraction") {
        const [, name, desc] = parts;
        if (destination && name) {
          addAttractionToItinerary(destination.id, { name, description: desc });
          toastMsg = "✓ Added to itinerary.";
        }
      } else if (actionType === "remove_attraction") {
        const [, name] = parts;
        if (destination && name) {
          removeAttractionFromItinerary(destination.id, name);
          toastMsg = "✓ Removed from itinerary.";
        }
      } else if (actionType === "add_packing") {
        const [, itemName] = parts;
        if (destination && itemName) {
          try {
            const saved = localStorage.getItem(`travio_packing_custom_${destination.id}`);
            const list = saved ? JSON.parse(saved) : [];
            if (!list.includes(itemName)) {
              const updated = [...list, itemName];
              localStorage.setItem(`travio_packing_custom_${destination.id}`, JSON.stringify(updated));
              window.dispatchEvent(new Event("travio_packing_update"));
              toastMsg = "✓ Packing list updated.";
            }
          } catch (err) {
            console.error("Failed to add custom packing item in chat:", err);
          }
        }
      } else if (actionType === "open_map") {
        if (destination) {
          sessionStorage.setItem("travio_active_details_tab", "Map");
          window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Map" }));
          toastMsg = "✓ Map opened.";
        }
      } else if (actionType === "open_hotels") {
        if (destination) {
          sessionStorage.setItem("travio_active_details_tab", "Hotels");
          window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Hotels" }));
          toastMsg = "✓ Hotels tab opened.";
        }
      } else if (actionType === "open_restaurants") {
        if (destination) {
          sessionStorage.setItem("travio_active_details_tab", "Restaurants");
          window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Restaurants" }));
          toastMsg = "✓ Restaurants tab opened.";
        }
      }
    }
    
    if (toastMsg) {
      showToast(toastMsg);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (typeof textToSend === "string" ? textToSend : inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: generateMsgId(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = [...messages];
    setMessages((prev) => [...prev, userMsg]);
    
    setInputValue("");
    setFollowUpSuggestions([]); // Clear suggestions
    setIsTyping(true);

    // Load and map user travel preferences
    let preferences = null;
    try {
      const prefsJson = sessionStorage.getItem("travio_user_preferences");
      if (prefsJson) {
        const rawPrefs = JSON.parse(prefsJson);
        preferences = {
          budget: rawPrefs.budget || null,
          duration: rawPrefs.duration || null,
          style: rawPrefs.tripType || null,
          season: rawPrefs.season || null,
          travelers: rawPrefs.companions || null,
          interests: rawPrefs.activityDetail || null
        };
      }
    } catch (e) {
      console.error("Failed to fetch preferences in AtlasChat", e);
    }

    const context = {
      currentPage: getPageTitle(location.pathname),
      pageDescription: getPageDescription(location.pathname, cityName),
      destination: destination ? {
        name: destination.city,
        country: destination.country
      } : null,
      preferences: preferences
    };

    try {
      const response = await chatWithAtlas(text, currentHistory, context);
      
      let replyText = response.reply;
      let parsedSuggestions = [];

      // Parse suggestions out from backend reply if present
      const suggestionMatch = replyText.match(/\r?\nSuggestions:\s*(.+)$/i) || replyText.match(/^Suggestions:\s*(.+)$/m);
      if (suggestionMatch) {
        const line = suggestionMatch[1];
        parsedSuggestions = line.split("|").map(s => s.trim()).filter(Boolean);
        // Strip out from bubble text
        replyText = replyText.replace(/\r?\nSuggestions:\s*(.+)$/i, "").replace(/^Suggestions:\s*(.+)$/m, "").trim();
      } else {
        // Fallback suggestions based on current city
        parsedSuggestions = cityName ? [
          `Find restaurants in ${cityName}`,
          `One-day itinerary for ${cityName}`,
          `Estimate trip budget for ${cityName}`
        ] : [
          "Suggest a weekend trip 🧭",
          "Packing checklist 🎒",
          "Visa requirements 📄"
        ];
      }

      // Execute actions if parsed from Gemini response automatically
      executeActionsInMessage(replyText);

      // Clean Action tags from bubble text
      replyText = replyText.replace(/\[Action:\s*[^\]]+\]/gi, "").trim();

      const aiMsg = {
        id: generateMsgId(),
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setFollowUpSuggestions(parsedSuggestions);
    } catch (error) {
      console.error("Atlas chat request failed:", error);
      const errorMsg = {
        id: generateMsgId(),
        sender: "ai",
        text: "I'm having trouble reaching my travel knowledge right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setLoadingText("🌍 Understanding your trip...");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async (e) => {
    e.stopPropagation();
    if (window.confirm("Clear conversation history?")) {
      if (currentUser) {
        await saveConversationToHistory(currentUser.uid, messages);
      }
      const reset = getDefaultWelcomeMessage();
      setMessages(reset);
      setFollowUpSuggestions([]);
    }
  };

  // Card Interactive triggers
  const handleDestinationWishlist = (id, cityName, country, description, imageUrl) => {
    if (isWishlisted(id)) {
      removeFromWishlist(id);
      showToast("✓ Removed from wishlist.");
    } else {
      addToWishlist({ id, city: cityName, country, description, image: imageUrl });
      showToast("✓ Saved to wishlist.");
    }
  };

  const handleNavigateTab = (tabName) => {
    if (destination) {
      sessionStorage.setItem("travio_active_details_tab", tabName);
      window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: tabName }));
      navigate(`/destination/${destination.slug || destination.id}`);
      showToast(`✓ Opened ${tabName}.`);
    }
  };

  const handleShowOnMap = (label) => {
    if (destination) {
      sessionStorage.setItem("travio_active_details_tab", "Map");
      window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Map" }));
      navigate(`/destination/${destination.slug || destination.id}`);
      showToast(`✓ Opened ${label} on map.`);
    }
  };

  const handleAddAttraction = (name, description) => {
    if (destination) {
      const added = addAttractionToItinerary(destination.id, { name, description });
      if (added) {
        showToast("✓ Added to itinerary.");
      } else {
        showToast("✓ Already in itinerary.");
      }
    }
  };

  const handleAddToPackingList = (items) => {
    if (!destination) return;
    try {
      const saved = localStorage.getItem(`travio_packing_custom_${destination.id}`);
      const list = saved ? JSON.parse(saved) : [];
      const newItems = items.filter(item => !list.includes(item));
      if (newItems.length > 0) {
        const updated = [...list, ...newItems];
        localStorage.setItem(`travio_packing_custom_${destination.id}`, JSON.stringify(updated));
        window.dispatchEvent(new Event("travio_packing_update"));
        showToast("✓ Packing list updated.");
      } else {
        showToast("✓ Items already in checklist.");
      }
    } catch (err) {
      console.error("Failed to add items to custom packing list in chat:", err);
    }
  };

  const handleCopyPackingList = (items) => {
    navigator.clipboard.writeText(items.join("\n"));
    showToast("✓ Copied list.");
  };

  const handleTogglePackingItem = (item) => {
    if (!destination) return;
    const updated = {
      ...packingChecked,
      [item]: !packingChecked[item]
    };
    setPackingChecked(updated);
    localStorage.setItem(`travio_packing_checked_${destination.id}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("travio_packing_update"));
  };

  const handleSaveItineraryPlan = (timelineItems) => {
    if (!destination) return;
    try {
      const mappedItinerary = timelineItems.map((item) => ({
        day: item.day,
        title: item.activity.substring(0, 30) + "...",
        description: item.activity,
        time: "Flexible Time",
        icon: "📍"
      }));
      localStorage.setItem(`travio_itinerary_${destination.id}`, JSON.stringify(mappedItinerary));
      window.dispatchEvent(new Event("travio_itinerary_update"));
      showToast("✓ Itinerary saved.");
    } catch (err) {
      console.error("Failed to save itinerary plan in chat:", err);
    }
  };

  // Render cards and text blocks parsed from Gemini
  const renderMessageContent = (text) => {
    const cardRegex = /\[(Destination|Hotel|Restaurant|Attraction|Packing|Itinerary)Card:\s*([^\]]+)\]/gi;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = cardRegex.exec(text)) !== null) {
      const textPart = text.substring(lastIndex, match.index);
      if (textPart.trim()) {
        parts.push({ type: "text", content: textPart });
      }
      
      const cardType = match[1];
      const contentStr = match[2];
      parts.push({ type: "card", cardType, content: contentStr });
      
      lastIndex = cardRegex.lastIndex;
    }
    
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim() || parts.length === 0) {
      parts.push({ type: "text", content: remainingText || text });
    }
    
    return parts.map((part, index) => {
      if (part.type === "text") {
        return <div key={index} className="atlas-chat-text-p">{part.content}</div>;
      }
      
      const cardParams = part.content.split("|").map(s => s.trim());
      
      try {
        if (part.cardType === "Destination") {
          const [id, name, country, desc, img] = cardParams;
          return (
            <DestinationCard
              key={index}
              id={id}
              cityName={name}
              country={country}
              description={desc}
              imageUrl={img}
              isWishlisted={isWishlisted(id)}
              onAddToWishlist={() => handleDestinationWishlist(id, name, country, desc, img)}
              onViewDetails={() => handleNavigateTab("Overview")}
            />
          );
        }
        
        if (part.cardType === "Hotel") {
          const [name, rating, price, distance, img] = cardParams;
          return (
            <HotelCard
              key={index}
              name={name}
              rating={rating}
              price={price}
              distance={distance}
              imageUrl={img}
              onShowMap={() => handleShowOnMap(name)}
              onViewDetails={() => handleNavigateTab("Hotels")}
            />
          );
        }
        
        if (part.cardType === "Restaurant") {
          const [name, cuisine, rating, hours, img] = cardParams;
          return (
            <RestaurantCard
              key={index}
              name={name}
              cuisine={cuisine}
              rating={rating}
              hours={hours}
              imageUrl={img}
              onShowMap={() => handleShowOnMap(name)}
              onViewDetails={() => handleNavigateTab("Restaurants")}
            />
          );
        }
        
        if (part.cardType === "Attraction") {
          const [name, desc, img] = cardParams;
          const isAdded = destination && customAttractions?.[destination.id]?.some(a => a.name === name);
          return (
            <AttractionCard
              key={index}
              name={name}
              description={desc}
              imageUrl={img}
              isAdded={isAdded}
              onAddToItinerary={() => handleAddAttraction(name, desc)}
              onShowMap={() => handleShowOnMap(name)}
            />
          );
        }
        
        if (part.cardType === "Packing") {
          const itemsList = cardParams.filter(Boolean);
          return (
            <PackingCard
              key={index}
              items={itemsList}
              checkedStates={packingChecked}
              onAddToPacking={() => handleAddToPackingList(itemsList)}
              onCopy={() => handleCopyPackingList(itemsList)}
              onToggleItem={handleTogglePackingItem}
            />
          );
        }
        
        if (part.cardType === "Itinerary") {
          const timeline = cardParams.map((dayText, i) => {
            const splitIndex = dayText.indexOf(":");
            const dayLabel = splitIndex !== -1 ? dayText.substring(0, splitIndex).trim() : `Day ${i + 1}`;
            const activityDesc = splitIndex !== -1 ? dayText.substring(splitIndex + 1).trim() : dayText.trim();
            return { day: dayLabel, activity: activityDesc };
          }).filter(t => t.activity);

          let isItinSaved = false;
          if (destination) {
            try {
              isItinSaved = !!localStorage.getItem(`travio_itinerary_${destination.id}`);
            } catch (err) {
              console.error("Failed to check itinerary cache in chat:", err);
            }
          }
          
          return (
            <ItineraryCard
              key={index}
              timelineItems={timeline}
              onOpenItinerary={() => {
                navigate("/itinerary");
                showToast("✓ Opened Itinerary.");
              }}
              onRegenerate={() => handleSend(`Regenerate itinerary for ${cityName || "destination"}`)}
              onSave={() => handleSaveItineraryPlan(timeline)}
              isSaved={isItinSaved}
            />
          );
        }
      } catch (err) {
        console.error("Card parsing error in AtlasChat:", err);
      }
      
      return <div key={index} className="atlas-chat-text-p text-red-500 text-xs">Error parsing card</div>;
    });
  };

  // Drag styles calculation using chatPosition passed from parent
  const dragStyle = window.innerWidth > 480 && chatPosition ? {
    left: chatPosition.x,
    top: chatPosition.y,
    bottom: "auto",
    right: "auto"
  } : undefined;

  return (
    <div 
      ref={chatRef}
      className={`atlas-chat-panel ${isOpen ? "open" : "closed"} ${isMinimized ? "minimized" : ""}`}
      style={dragStyle}
      aria-hidden={!isOpen}
    >
      {/* Toast Confirmation Message */}
      {toast && (
        <div className="atlas-chat-toast animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="atlas-chat-header">
        <div className="atlas-chat-title-area">
          <div className="atlas-chat-icon-wrapper">
            <Sparkles size={18} />
          </div>
          <div className="atlas-chat-title-info">
            <h3>Atlas</h3>
            <p>Your Intelligent Travel Companion</p>
          </div>
        </div>
        <div className="atlas-chat-controls" onClick={(e) => e.stopPropagation()}>
          {!isMinimized && (
            <button 
              className="atlas-chat-btn" 
              onClick={handleClear}
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button 
            className="atlas-chat-btn" 
            onClick={onToggleMinimize}
            title={isMinimized ? "Maximize" : "Minimize"}
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button 
            className="atlas-chat-btn" 
            onClick={onClose}
            title="Close"
            aria-label="Close chat"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="atlas-chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`atlas-message ${msg.sender}`}>
            <div className="atlas-message-bubble-container">
              <div className="atlas-message-bubble">
                {msg.sender === "user" ? (
                  msg.text
                ) : (
                  <div className="atlas-bubble-rich-content">
                    {renderMessageContent(msg.text)}
                  </div>
                )}
              </div>
              <CopyButton text={msg.text} />
            </div>
            <span className="atlas-message-time">{msg.time}</span>
          </div>
        ))}
        {isTyping && (
          <div className="atlas-message ai">
            <div className="atlas-message-bubble typing">
              <div className="cycling-progress-text">{loadingText}</div>
              <div className="atlas-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Dynamic Suggested Follow-up Questions Row */}
      {!isMinimized && !isTyping && messages.length > 1 && followUpSuggestions.length > 0 && (
        <div className="atlas-chat-suggestions animate-fade-in">
          {followUpSuggestions.map((sug, i) => (
            <button 
              key={i} 
              className="atlas-suggestion-pill"
              onClick={() => handleSend(sug)}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Static Welcome Suggestions shown at the very start */}
      {!isMinimized && !isTyping && messages.length <= 1 && (
        <div className="atlas-chat-suggestions">
          <button className="atlas-suggestion-pill" onClick={() => handleSend("Suggest a weekend trip 🧭")}>
            Suggest a weekend trip 🧭
          </button>
          <button className="atlas-suggestion-pill" onClick={() => handleSend("Packing checklist 🎒")}>
            Packing checklist 🎒
          </button>
          <button className="atlas-suggestion-pill" onClick={() => handleSend("Visa requirements 📄")}>
            Visa requirements 📄
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="atlas-chat-input-area">
        <textarea 
          ref={textareaRef}
          placeholder="Ask Atlas..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          rows={1}
        />
        <button 
          className="atlas-chat-send-btn"
          onClick={() => handleSend()}
          disabled={isTyping || !inputValue.trim()}
          aria-label="Send message"
        >
          {isTyping ? <Loader2 size={16} className="atlas-spinner animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
