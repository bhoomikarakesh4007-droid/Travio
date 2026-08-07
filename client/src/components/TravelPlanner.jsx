import React, { useState } from "react";
import { 
  Plane, 
  MapPin, 
  Sparkles, 
  Heart, 
  Share2, 
  FileDown, 
  Clock, 
  ArrowRight,
  Info 
} from "lucide-react";

import { useTravel } from "../context/TravelContext";
import { formatDualPrice } from "../services/currencyService";

// Reusable Components
import TripOverviewCard from "./planner/TripOverviewCard";
import HotelCard from "./planner/HotelCard";
import RestaurantCard from "./planner/RestaurantCard";
import BudgetCard from "./planner/BudgetCard";
import AttractionCard from "./planner/AttractionCard";
import TravelTipsCard from "./planner/TravelTipsCard";
import LocalInfoCard from "./planner/LocalInfoCard";

// Mock Services
import { 
  getFlightOptions, 
  getHotelOptions, 
  getRestaurantOptions, 
  calculateBudgetBreakdown,
  getAttractionOptions,
  getDailySchedule,
  getLocalInfo,
  getPersonalizedTips
} from "../services/travelPlannerService";
import "../styles/TravelPlanner.css";

export default function TravelPlanner({ destination }) {
  const [isSaved, setIsSaved] = useState(false);
  const { departureCity } = useTravel();

  if (!destination) return null;

  // 1. Retrieve user profile preferences
  let userPrefs = {};
  try {
    userPrefs = JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
  } catch (e) {
    console.error("Failed to load preferences from sessionStorage", e);
  }

  const budgetLevel = userPrefs.budget || destination.budget || "Comfort";
  const travelers = userPrefs.companions === "Solo" ? 1 : userPrefs.companions === "Partner" ? 2 : 4;
  const durationStr = userPrefs.duration || "5-7 Days";
  const matchScore = userPrefs.tripType ? 96 : 94; // Estimated compatibility rating

  // 2. Fetch dataset from travel planner service
  const flights = getFlightOptions(destination.id, budgetLevel, departureCity);
  const hotels = getHotelOptions(destination.id, budgetLevel);
  const restaurants = getRestaurantOptions(destination.id, budgetLevel);
  const budget = calculateBudgetBreakdown(destination.id, budgetLevel, travelers, durationStr);
  const attractions = getAttractionOptions(destination.id);
  const dailySchedule = getDailySchedule(destination.id, userPrefs.tripType || "Relaxation");
  const localInfo = getLocalInfo(destination.id);
  const travelTips = getPersonalizedTips(destination.id, userPrefs);

  // 3. User Actions handlers
  const handleBooking = (type, name) => {
    alert(`🎉 Booking simulation: Your request for the ${type} "${name}" at ${destination.city} has been logged. In production, this proceeds to checkout.`);
  };

  const handleSaveTrip = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? "Trip removed from saved itineraries." : "❤️ Trip successfully saved! You can access this itinerary anytime under your Profile.");
  };

  const handleShareTrip = () => {
    if (navigator.share) {
      navigator.share({
        title: `My travel plan to ${destination.city} via Travio`,
        text: `Check out my personalized travel plan for Kyoto: ${budget.days} days, estimated budget $${budget.totalCost}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("📋 Link copied to clipboard! Share it with your friends.");
    }
  };

  const handleExportPDF = () => {
    alert("📄 Export PDF: Generating travel overview brochure. Downloading will start shortly...");
  };

  return (
    <div className="travel-planner-board">
      
      {/* SECTION 1: TRIP OVERVIEW */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker"><Sparkles size={15} /> EXPLORE SNAPSHOT</p>
            <h2>Trip Overview</h2>
          </div>
        </div>
        <TripOverviewCard 
          destination={destination}
          matchScore={matchScore}
          budget={budget.totalCost}
          duration={durationStr}
        />
      </section>

      {/* SECTION 2: HOW TO GET THERE (Flights) */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker"><Plane size={15} /> TRANSPORTATION</p>
            <h2>How to Get There</h2>
          </div>
        </div>
        <p className="planner-intro-text">We compared flight options for {travelers} ticket{travelers > 1 ? "s" : ""} from {departureCity ? `${departureCity.name} (${departureCity.code})` : "New York (JFK)"} to {destination.city} Airport.</p>
        <div className="flights-container">
          {flights.map((flight, idx) => (
            <div className="flight-card" key={idx}>
              {flight.badge && (
                <span className={`flight-badge ${flight.badge.toLowerCase().replace(" ", "-")}`}>
                  {flight.badge}
                </span>
              )}
              <div className="flight-carrier">
                <div className="flight-logo-icon">
                  <Plane size={24} />
                </div>
                <div className="flight-carrier-info">
                  <h4>{flight.airline}</h4>
                  <span>Economy class ticket</span>
                </div>
              </div>
              <div className="flight-path-visual">
                <div className="flight-airport">
                  <strong>{departureCity ? departureCity.code : "JFK"}</strong>
                  <span>{departureCity ? departureCity.name : "New York"}</span>
                </div>
                <div className="flight-route-line">
                  <span className="flight-duration">{flight.duration}</span>
                  <div className="flight-line" />
                  <span className={`flight-stops ${flight.stops === "Non-stop" ? "non-stop" : ""}`}>
                    {flight.stops}
                  </span>
                </div>
                <div className="flight-airport">
                  <strong>{flight.arrivalCode || flight.arrival?.match(/\(([A-Z]{3})\)/)?.[1] || "ARR"}</strong>
                  <span>{destination.city}</span>
                </div>
              </div>
              <div className="flight-pricing">
                <span>Est. Ticket Price</span>
                <strong style={{ fontSize: "16px" }}>{formatDualPrice(flight.price, destination.currency, departureCity?.currency || "USD")}</strong>
                <button 
                  className="flight-book-btn"
                  onClick={() => handleBooking("Flight ticket", `${flight.airline} (${departureCity ? departureCity.code : "JFK"} ➔ ${flight.arrivalCode || "ARR"})`)}
                >
                  Select Flight
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: WHERE TO STAY */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker">🏨 ACCOMMODATIONS</p>
            <h2>Where to Stay</h2>
          </div>
        </div>
        <p className="planner-intro-text">Handpicked, high-rated stays matching your comfort level and local convenience.</p>
        <div className="planner-grid">
          {hotels.map((hotel, idx) => (
            <HotelCard 
              key={idx} 
              hotel={hotel} 
              onBooking={handleBooking} 
            />
          ))}
        </div>
      </section>

      {/* SECTION 4: WHERE TO EAT */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker">🍜 DINING OUT</p>
            <h2>Where to Eat</h2>
          </div>
        </div>
        <p className="planner-intro-text">Highly recommended dining venues presenting traditional culinary specialties and authentic bites.</p>
        <div className="planner-grid">
          {restaurants.map((rest, idx) => (
            <RestaurantCard 
              key={idx} 
              restaurant={rest} 
              onBooking={handleBooking} 
            />
          ))}
        </div>
      </section>

      {/* SECTION 5: DAILY BUDGET */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker">💰 BUDGET ESTIMATES</p>
            <h2>Estimated Cost Breakdown</h2>
          </div>
        </div>
        <p className="planner-intro-text">Itemized spending summaries for the entire {durationStr} trip duration.</p>
        <BudgetCard 
          budget={budget} 
          days={budget.days} 
          travelers={travelers} 
          destination={destination}
        />
      </section>

      {/* SECTION 6: MUST VISIT PLACES */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker">🧭 SIGHTSEEING</p>
            <h2>Must Visit Places</h2>
          </div>
        </div>
        <p className="planner-intro-text">The highest rated landmarks, historical temples, and nature routes near {destination.city}.</p>
        <div className="planner-grid">
          {attractions.map((attraction, idx) => (
            <AttractionCard 
              key={idx} 
              attraction={attraction} 
            />
          ))}
        </div>
      </section>

      {/* SECTION 7: BEST TIME SCHEDULE */}
      <section className="planner-section details-reveal">
        <div className="section-heading">
          <div>
            <p className="section-kicker">⏰ DAILY FLOW</p>
            <h2>Recommended Daily Schedule</h2>
          </div>
        </div>
        <p className="planner-intro-text">An ideal hour-by-hour outline to maximize your day without feeling rushed (recommendation only).</p>
        <div className="planner-glass-card daily-timeline-card">
          <div className="timeline-flow">
            {dailySchedule.map((item, idx) => (
              <div className="timeline-node" key={idx}>
                <div className="node-time">
                  <strong>{item.time}</strong>
                </div>
                <div className="node-marker">
                  <div className="marker-dot" />
                  <div className="marker-line" />
                </div>
                <div className="node-body">
                  <h4>{item.activity}</h4>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: LOCAL INFORMATION */}
      <section className="planner-section details-reveal">
        <LocalInfoCard localInfo={localInfo} />
      </section>

      {/* SECTION 9: AI TRAVEL TIPS */}
      <section className="planner-section details-reveal">
        <TravelTipsCard tips={travelTips} />
      </section>

      {/* SECTION 10: ACTION BUTTONS (Save / Share / Export) */}
      <div className="planner-action-footer details-reveal">
        <button 
          className={`action-btn-pill save-btn ${isSaved ? "active" : ""}`}
          onClick={handleSaveTrip}
        >
          <Heart size={16} fill={isSaved ? "#FFF" : "transparent"} />
          {isSaved ? "Saved to Wishlist" : "Save Travel Plan"}
        </button>
        <button 
          className="action-btn-pill share-btn"
          onClick={handleShareTrip}
        >
          <Share2 size={16} /> Share Plan
        </button>
        <button 
          className="action-btn-pill pdf-btn"
          onClick={handleExportPDF}
        >
          <FileDown size={16} /> Export PDF
        </button>
      </div>

    </div>
  );
}
