import React, { useState } from "react";
import { Star, MapPin, Heart, Wifi, Coffee, Waves, Sparkles, Car, Dumbbell } from "lucide-react";
import { useTravel } from "../../context/TravelContext";
import { getCurrencyCodeFromString, convertUSD, formatPrice } from "../../services/currencyService";

export default function HotelCard({ hotel, destination, onBooking, onViewOnMap, onViewDetails }) {
  const { departureCity } = useTravel();
  if (!hotel) return null;

  const [isSaved, setIsSaved] = useState(false);

  // Currency calculations
  const destCurr = hotel.currency || destination?.currency || "USD";
  const userCurr = departureCity?.currency || "INR";

  const localCode = getCurrencyCodeFromString(destCurr);
  const localVal = convertUSD(hotel.pricePerNight, localCode);
  const localFormatted = formatPrice(localVal, localCode);

  const cleanUserCode = String(userCurr || "INR").toUpperCase();
  const isSameCurrency = localCode === cleanUserCode;

  const userVal = convertUSD(hotel.pricePerNight, cleanUserCode);
  const userFormatted = formatPrice(userVal, cleanUserCode);

  // Determine Category Badge
  let categoryBadge = "Best Value";
  const nameLower = (hotel.name || "").toLowerCase();
  if (hotel.pricePerNight >= 300 || nameLower.includes("resort") || nameLower.includes("spa")) {
    categoryBadge = "Luxury";
  } else if (nameLower.includes("hostel") || nameLower.includes("backpackers")) {
    categoryBadge = "Best Value";
  } else if (nameLower.includes("family") || nameLower.includes("guesthouse")) {
    categoryBadge = "Family Friendly";
  } else {
    categoryBadge = "Couples";
  }

  // Determine Guest Rating Label
  const getGuestRatingLabel = (rating) => {
    if (rating >= 4.8) return "Wonderful";
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    return "Good";
  };

  // Map 2-4 key amenities to clean chips
  const renderAmenities = () => {
    const list = hotel.amenities || [];
    const hasKeyword = (kws) => list.some(a => kws.some(kw => a.toLowerCase().includes(kw)));
    
    const chips = [];
    if (hasKeyword(["wifi", "internet"])) {
      chips.push({ label: "Free WiFi", icon: <Wifi size={14} /> });
    }
    if (hasKeyword(["breakfast", "dining", "resto"])) {
      chips.push({ label: "Breakfast", icon: <Coffee size={14} /> });
    }
    if (hasKeyword(["pool", "pools"])) {
      chips.push({ label: "Pool", icon: <Waves size={14} /> });
    }
    if (hasKeyword(["spa", "wellness", "sanctuary"])) {
      chips.push({ label: "Spa", icon: <Sparkles size={14} /> });
    }
    if (hasKeyword(["parking", "chauffeur", "valet"])) {
      chips.push({ label: "Parking", icon: <Car size={14} /> });
    }
    if (hasKeyword(["gym", "fitness", "center"])) {
      chips.push({ label: "Gym", icon: <Dumbbell size={14} /> });
    }

    if (chips.length < 2) {
      if (!chips.some(c => c.label === "Free WiFi")) chips.push({ label: "Free WiFi", icon: <Wifi size={14} /> });
      if (!chips.some(c => c.label === "Breakfast")) chips.push({ label: "Breakfast", icon: <Coffee size={14} /> });
      if (!chips.some(c => c.label === "Parking")) chips.push({ label: "Parking", icon: <Car size={14} /> });
    }

    return chips.slice(0, 4).map((chip, idx) => (
      <span className="hotel-amenity-chip" key={idx}>
        {chip.icon}
        <span>{chip.label}</span>
      </span>
    ));
  };

  return (
    <div className="hotel-premium-card">
      <div className="hotel-card-image-container">
        <img src={hotel.photo} alt={hotel.name} className="hotel-card-image" loading="lazy" />
        
        {/* Save Hotel (Wishlist Heart Button) */}
        <button 
          className={`hotel-wishlist-heart ${isSaved ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          title={isSaved ? "Hotel Saved" : "Save Hotel"}
          aria-label="Save Hotel"
        >
          <Heart size={18} fill={isSaved ? "#EF4444" : "rgba(0, 0, 0, 0.35)"} color={isSaved ? "#EF4444" : "#FFFFFF"} />
        </button>

        {/* Category Badge overlay */}
        <div className={`hotel-category-badge badge-${categoryBadge.toLowerCase().replace(/\s+/g, "-")}`}>
          {categoryBadge}
        </div>
      </div>

      <div className="hotel-card-info">
        <div className="hotel-card-header-row">
          <h3 className="hotel-name">{hotel.name}</h3>
        </div>

        {/* Rating and Distance */}
        <div className="hotel-card-sub-header">
          <div className="hotel-star-rating">
            <span className="rating-badge-number">★ {Number(hotel.rating || 4.5).toFixed(1)}</span>
            <span className="rating-label-text">{getGuestRatingLabel(hotel.rating || 4.5)}</span>
            <span className="rating-reviews-count">({hotel.ratingsCount || "120+"})</span>
          </div>

          <div className="hotel-distance-label">
            <MapPin size={13} />
            <span>{hotel.distance}</span>
          </div>
        </div>

        {/* 2-4 Main Amenities */}
        <div className="hotel-amenities-container">
          {renderAmenities()}
        </div>

        <div className="hotel-card-divider" />

        {/* Pricing Block */}
        <div className="hotel-card-pricing-block">
          <div className="hotel-local-price-row">
            <span className="price-amount">{localFormatted}</span>
            <span className="price-unit">/ night</span>
          </div>
          {!isSameCurrency && (
            <div className="hotel-converted-price-row">
              <span className="converted-approx-symbol">≈</span>
              <span className="converted-amount">{userFormatted}</span>
              <span className="converted-unit">/ night</span>
            </div>
          )}
        </div>

        {/* Action Buttons Row - ALWAYS below pricing */}
        <div className="hotel-card-actions-row">
          <button 
            className="hotel-details-btn"
            onClick={() => onViewDetails ? onViewDetails(hotel) : onBooking && onBooking("hotel stay", hotel.name)}
          >
            View Details
          </button>
          <button 
            className="hotel-map-btn"
            onClick={() => onViewOnMap ? onViewOnMap("hotel", hotel) : alert(`Map View: Locating "${hotel.name}" on map.`)}
          >
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
}
