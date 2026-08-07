import React from "react";
import { Star, MapPin, Clock, Utensils } from "lucide-react";
import { useTravel } from "../../context/TravelContext";
import { formatDualPrice } from "../../services/currencyService";

export default function RestaurantCard({ restaurant, destination, onBooking, onViewOnMap, onViewDetails }) {
  const { departureCity } = useTravel();
  if (!restaurant) return null;

  const destCurr = destination?.currency || "USD";
  const userCurr = departureCity?.currency || "INR";

  let formattedCostForTwo = restaurant.costForTwo;
  const numbers = restaurant.costForTwo ? restaurant.costForTwo.match(/\d+/g) : null;
  if (numbers && numbers.length >= 1) {
    const low = parseInt(numbers[0], 10);
    const high = numbers.length >= 2 ? parseInt(numbers[1], 10) : low;
    if (high > low) {
      formattedCostForTwo = `${formatDualPrice(low, destCurr, userCurr)} - ${formatDualPrice(high, destCurr, userCurr)}`;
    } else {
      formattedCostForTwo = formatDualPrice(low, destCurr, userCurr);
    }
  }

  const starsCount = Math.round(restaurant.rating);
  const mockReviews = Math.round((restaurant.rating * 42) + 36);

  return (
    <div className="restaurant-premium-card">
      <div className="restaurant-card-image-container">
        <img src={restaurant.image} alt={restaurant.name} className="restaurant-card-image" loading="lazy" />
        
        {/* Cuisine Tag */}
        <div className="restaurant-cuisine-tag">
          {restaurant.cuisine || "Local Cuisine"}
        </div>
      </div>

      <div className="restaurant-card-info">
        <div className="restaurant-title-row">
          <h3 className="restaurant-name">{restaurant.name}</h3>
        </div>

        {/* Rating row */}
        <div className="restaurant-rating-row">
          <span className="rating-number">★ {restaurant.rating.toFixed(1)}</span>
          <div className="rating-stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={13} 
                fill={i < starsCount ? "#F59E0B" : "transparent"} 
                color={i < starsCount ? "#F59E0B" : "#CBD5E1"} 
                style={{ marginRight: "1px" }}
              />
            ))}
          </div>
          <span className="rating-reviews">({mockReviews} reviews)</span>
        </div>

        {/* Price Level & Distance */}
        <div className="restaurant-meta-row">
          <div className="meta-item location-distance">
            <MapPin size={13} />
            <span>{restaurant.distance}</span>
          </div>
          <span className="meta-bullet">&bull;</span>
          <div className="meta-item price-range">
            <Utensils size={12} style={{ marginRight: "4px" }} />
            <span>{restaurant.priceLevel ? `Price: ${restaurant.priceLevel}` : formattedCostForTwo}</span>
          </div>
        </div>

        {/* Opening Status */}
        <div className="restaurant-hours-row">
          <Clock size={13} />
          <span className="hours-status">Open Now</span>
          <span className="hours-text">• {restaurant.hours || "07:00 AM - 11:00 PM"}</span>
        </div>

        <div className="restaurant-card-divider" />

        {/* Action Buttons */}
        <div className="restaurant-card-footer">
          <div className="restaurant-actions">
            <button 
              className="restaurant-map-btn"
              onClick={() => onViewOnMap ? onViewOnMap("restaurant", restaurant) : alert(`Map View: Locating "${restaurant.name}" on map.`)}
            >
              View on Map
            </button>
            <button 
              className="restaurant-reserve-btn"
              onClick={() => onViewDetails ? onViewDetails(restaurant) : onBooking && onBooking("restaurant table", restaurant.name)}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
