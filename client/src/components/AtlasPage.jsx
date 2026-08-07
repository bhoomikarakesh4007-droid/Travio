import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, MapPin, Loader2, Compass } from "lucide-react";
import { useTravelSession } from "../context/TravelSessionContext";
import { useWishlist } from "../context/WishlistContext";
import { resolveDestination } from "../data/destinationData";
import { chatWithAssistant } from "../services/aiService.js";
import { useNavigate } from "react-router-dom";
import "../styles/AtlasPage.css";

/* ==========================================
          INTERACTIVE RESPONSE CARDS
========================================== */

const DestinationCard = ({ cityName, country, description, imageUrl, onAddToWishlist, isWishlisted, onViewDetails }) => (
  <div className="atlas-card destination-card">
    {imageUrl && <img src={imageUrl} alt={cityName} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{cityName}, <span className="atlas-card-country">{country}</span></h4>
      <p className="atlas-card-desc">{description}</p>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onViewDetails}>View Details</button>
        <button type="button" className={`atlas-card-btn secondary ${isWishlisted ? "active" : ""}`} onClick={onAddToWishlist}>
          {isWishlisted ? "✓ Wishlisted" : "Save to Wishlist"}
        </button>
      </div>
    </div>
  </div>
);

const HotelCard = ({ name, rating, price, distance, imageUrl, onShowMap, onViewDetails }) => (
  <div className="atlas-card hotel-card">
    {imageUrl && <img src={imageUrl} alt={name} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{name}</h4>
      <div className="atlas-card-meta">
        <span className="atlas-card-rating">⭐ {rating}</span>
        <span className="atlas-card-price">{price}</span>
        <span className="atlas-card-distance">📍 {distance}</span>
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onViewDetails}>View Details</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onShowMap}>Show on Map</button>
      </div>
    </div>
  </div>
);

const RestaurantCard = ({ name, cuisine, rating, hours, imageUrl, onShowMap, onViewDetails }) => (
  <div className="atlas-card restaurant-card">
    {imageUrl && <img src={imageUrl} alt={name} className="atlas-card-img" />}
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">{name}</h4>
      <div className="atlas-card-meta">
        <span className="atlas-card-cuisine">🍲 {cuisine}</span>
        <span className="atlas-card-rating">⭐ {rating}</span>
        <span className="atlas-card-hours">⏰ {hours}</span>
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onViewDetails}>View Details</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onShowMap}>Show on Map</button>
      </div>
    </div>
  </div>
);

const AttractionCard = ({ name, description, imageUrl, onAddToItinerary, isAdded, onShowMap }) => (
  <div className="atlas-card attraction-card">
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
          {isAdded ? "✓ Added to Itinerary" : "Add to Itinerary"}
        </button>
        <button type="button" className="atlas-card-btn secondary" onClick={onShowMap}>View on Map</button>
      </div>
    </div>
  </div>
);

const PackingCard = ({ items, onAddToPacking, onCopy, checkedStates, onToggleItem }) => (
  <div className="atlas-card packing-card">
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">🧳 Smart Packing Checklist</h4>
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
        <button type="button" className="atlas-card-btn primary" onClick={onAddToPacking}>Add to Packing Page</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onCopy}>Copy List</button>
      </div>
    </div>
  </div>
);

const ItineraryCard = ({ timelineItems, onOpenItinerary, onRegenerate, onSave, isSaved }) => (
  <div className="atlas-card itinerary-card">
    <div className="atlas-card-body">
      <h4 className="atlas-card-title">📅 Daily Itinerary Timeline</h4>
      <div className="atlas-itinerary-timeline">
        {timelineItems.map((item, index) => (
          <div className="timeline-day" key={index}>
            <div className="timeline-day-header">{item.day}</div>
            <div className="timeline-day-activity">{item.activity}</div>
          </div>
        ))}
      </div>
      <div className="atlas-card-actions">
        <button type="button" className="atlas-card-btn primary" onClick={onOpenItinerary}>Open Full Itinerary</button>
        <button type="button" className="atlas-card-btn secondary" onClick={onRegenerate}>Regenerate</button>
        <button type="button" className={`atlas-card-btn secondary ${isSaved ? "active" : ""}`} onClick={onSave}>
          {isSaved ? "✓ Saved" : "Save Itinerary"}
        </button>
      </div>
    </div>
  </div>
);

/* ==========================================
          MAIN COMPONENT
========================================== */

export default function AtlasPage() {
  const navigate = useNavigate();
  const { selectedDestination, customAttractions, addAttractionToItinerary, removeAttractionFromItinerary } = useTravelSession();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  
  const destination = selectedDestination ? resolveDestination(selectedDestination) : null;
  const cityName = destination ? destination.city : null;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  
  // Loading progress message state
  const [loadingText, setLoadingText] = useState("🌍 Understanding your trip...");

  // Toast alert feedback
  const [toast, setToast] = useState("");

  const chatEndRef = useRef(null);

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
        console.error("Failed to load initial packing checked items:", err);
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
        console.error("Failed to sync checked packing items:", err);
      }
    };
    window.addEventListener("travio_packing_update", handleUpdate);
    return () => window.removeEventListener("travio_packing_update", handleUpdate);
  }, [destination]);

  // Cycle loading messages when generating responses
  useEffect(() => {
    let interval;
    if (isSending) {
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
  }, [isSending]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast("");
    }, 3000);
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
          toastMsg = "✓ Destination saved to wishlist.";
        }
      } else if (actionType === "remove_wishlist") {
        const [, id] = parts;
        if (id) {
          removeFromWishlist(id);
          toastMsg = "✓ Destination removed from wishlist.";
        }
      } else if (actionType === "add_attraction") {
        const [, name, desc] = parts;
        if (destination && name) {
          addAttractionToItinerary(destination.id, { name, description: desc });
          toastMsg = "✓ Added to your itinerary.";
        }
      } else if (actionType === "remove_attraction") {
        const [, name] = parts;
        if (destination && name) {
          removeAttractionFromItinerary(destination.id, name);
          toastMsg = "✓ Removed from your itinerary.";
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
            console.error("Failed to parse or save custom item to packing list:", err);
          }
        }
      } else if (actionType === "open_map") {
        if (destination) {
          sessionStorage.setItem("travio_active_details_tab", "Map");
          window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Map" }));
          toastMsg = "✓ Opened location on map.";
        }
      } else if (actionType === "open_hotels") {
        if (destination) {
          sessionStorage.setItem("travio_active_details_tab", "Hotels");
          window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Hotels" }));
          toastMsg = "✓ Recommending hotels.";
        }
      } else if (actionType === "open_restaurants") {
        if (destination) {
          sessionStorage.setItem("travio_active_details_tab", "Restaurants");
          window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: "Restaurants" }));
          toastMsg = "✓ Recommending restaurants.";
        }
      }
    }
    
    if (toastMsg) {
      showToast(toastMsg);
    }
  };

  const sendMessage = async (textToSend) => {
    const text = (typeof textToSend === "string" ? textToSend : inputValue).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputValue("");
    setFollowUpSuggestions([]); // Clear old suggestions

    const userMessage = {
      sender: "user",
      text: text
    };

    setMessages((prev) => [...prev, userMessage]);

    // Retrieve and map sessionStorage travel preferences
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
    } catch (err) {
      console.error("Failed to load preferences in AtlasPage", err);
    }

    const context = {
      currentPage: "Atlas Page",
      pageDescription: "User is asking questions in the central full-screen Atlas companion page.",
      destination: destination ? {
        name: destination.city,
        country: destination.country
      } : null,
      preferences: preferences
    };

    try {
      const response = await chatWithAssistant(text, [...messages, userMessage], context);
      
      let replyText = response.reply;
      let parsedSuggestions = [];

      // Parse suggestions out from backend reply if present (e.g. Suggestions: A | B | C)
      const suggestionMatch = replyText.match(/\r?\nSuggestions:\s*(.+)$/i) || replyText.match(/^Suggestions:\s*(.+)$/m);
      if (suggestionMatch) {
        const line = suggestionMatch[1];
        parsedSuggestions = line.split("|").map(s => s.trim()).filter(Boolean);
        // Clean the suggestions line out from the bubble text
        replyText = replyText.replace(/\r?\nSuggestions:\s*(.+)$/i, "").replace(/^Suggestions:\s*(.+)$/m, "").trim();
      } else {
        // Fallback suggestions based on context
        parsedSuggestions = cityName ? [
          `Find nearby restaurants in ${cityName}`,
          `Build a one-day itinerary for ${cityName}`,
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

      setMessages((prev) => [...prev, { sender: "ai", text: replyText }]);
      setFollowUpSuggestions(parsedSuggestions);
    } catch (error) {
      console.error("Atlas request failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I'm having trouble reaching my travel knowledge right now. Please try again in a moment."
        }
      ]);
    } finally {
      setIsSending(false);
      setLoadingText("🌍 Understanding your trip...");
    }
  };

  const handleChipClick = (prompt) => {
    sendMessage(prompt);
  };

  // Card Interactive triggers
  const handleDestinationWishlist = (id, cityName, country, description, imageUrl) => {
    if (isWishlisted(id)) {
      removeFromWishlist(id);
      showToast("✓ Destination removed from wishlist.");
    } else {
      addToWishlist({ id, city: cityName, country, description, image: imageUrl });
      showToast("✓ Destination saved to wishlist.");
    }
  };

  const handleNavigateTab = (tabName) => {
    if (destination) {
      sessionStorage.setItem("travio_active_details_tab", tabName);
      window.dispatchEvent(new CustomEvent("travio_active_tab_change", { detail: tabName }));
      navigate(`/destination/${destination.slug || destination.id}`);
      showToast(`✓ Switched to ${tabName} page.`);
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
        showToast("✓ Added to your itinerary.");
      } else {
        showToast("✓ Attraction already in itinerary.");
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
        showToast("✓ Items already in packing list.");
      }
    } catch (err) {
      console.error("Failed to add items to custom packing:", err);
    }
  };

  const handleCopyPackingList = (items) => {
    navigator.clipboard.writeText(items.join("\n"));
    showToast("✓ Copied to clipboard.");
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
      showToast("✓ Saved to your itinerary.");
    } catch (err) {
      console.error("Failed to save custom itinerary plan:", err);
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
        return <div key={index} className="atlas-text-paragraph">{part.content}</div>;
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
              onViewDetails={() => navigate(`/destination/${id}`)}
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
              console.error("Failed to check itinerary cache existence:", err);
            }
          }
          
          return (
            <ItineraryCard
              key={index}
              timelineItems={timeline}
              onOpenItinerary={() => {
                navigate("/itinerary");
                showToast("✓ Opened Itinerary page.");
              }}
              onRegenerate={() => sendMessage(`Regenerate itinerary for ${cityName || "destination"}`)}
              onSave={() => handleSaveItineraryPlan(timeline)}
              isSaved={isItinSaved}
            />
          );
        }
      } catch (err) {
        console.error("Card parsing error:", err);
      }
      
      return <div key={index} className="atlas-text-paragraph font-mono text-xs text-red-500">Error rendering card: {part.content}</div>;
    });
  };

  const initialSuggestions = [
    "✨ Plan my trip",
    "🏨 Recommend hotels",
    "🍜 Recommend restaurants",
    "🎒 Packing list",
    "📸 Hidden gems",
    "🗺 Open Map",
    "📅 Open Itinerary",
    "❤️ View Wishlist"
  ];

  return (
    <div className="atlas-page">
      {/* Toast Confirmation Message */}
      {toast && (
        <div className="atlas-toast">
          {toast}
        </div>
      )}

      <div className="atlas-page-container">
        {/* Top Header */}
        <div className="atlas-header">
          <div className="atlas-header-left">
            <h1 className="atlas-title">
              <Sparkles className="sparkles-icon" size={32} />
              Atlas
            </h1>
            <p className="atlas-subtitle">Your intelligent travel companion.</p>
          </div>
          <div className="atlas-header-right">
            {cityName ? (
              <div className="active-destination-badge">
                <MapPin className="pin-icon" size={16} />
                <span>Current Destination:</span>
                <strong className="badge-city">{cityName}</strong>
              </div>
            ) : (
              <div className="general-assistant-badge">
                <Compass className="compass-icon" size={16} />
                <span>General Travel Assistant</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Conversation Area / Welcome Screen */}
        <div className="atlas-chat-area">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="atlas-welcome-screen">
              <div className="atlas-logo-circle">
                <span>🤖</span>
              </div>
              <h2 className="welcome-title">Hi! I'm Atlas.</h2>
              <p className="welcome-description">
                I can plan itineraries, check packing lists, recommend hotels, restaurants, save to wishlists, and open maps. Ask me anything!
              </p>
              
              <div className="welcome-chips-container">
                <span className="chips-title">Suggested Prompts</span>
                <div className="welcome-chips-grid">
                  {initialSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => handleChipClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat bubbles list */
            <div className="atlas-messages-list">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-bubble-wrapper ${
                    msg.sender === "user" ? "bubble-user" : "bubble-atlas"
                  }`}
                >
                  <div className="chat-bubble">
                    {msg.sender === "user" ? (
                      msg.text
                    ) : (
                      <div className="atlas-bubble-rich-content">
                        {renderMessageContent(msg.text)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isSending && (
                <div className="chat-bubble-wrapper bubble-atlas is-loading">
                  <div className="chat-bubble typing-indicator-container">
                    <div className="cycling-progress-text">{loadingText}</div>
                    <div className="typing-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Dynamic Suggested Follow-up Questions Row */}
        {!isSending && messages.length > 0 && followUpSuggestions.length > 0 && (
          <div className="atlas-followup-container animate-fade-in">
            <div className="followup-chips-grid">
              {followUpSuggestions.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="followup-chip"
                  onClick={() => handleChipClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Input Area at the bottom */}
        <form
          className="atlas-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            className="atlas-input-field"
            placeholder="Ask Atlas anything about your trip..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
          />
          <button
            type="submit"
            className="atlas-send-button"
            disabled={isSending || !inputValue.trim()}
          >
            {isSending ? (
              <Loader2 className="loader-icon animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
