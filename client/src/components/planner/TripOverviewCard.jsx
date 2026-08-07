import React from "react";
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Clock, 
  CircleDollarSign, 
  Languages, 
  Sparkles, 
  CloudSun 
} from "lucide-react";
import { useTravel } from "../../context/TravelContext";
import { formatDualPrice } from "../../services/currencyService";

export default function TripOverviewCard({ destination, matchScore, budget, duration }) {
  const { departureCity } = useTravel();
  if (!destination) return null;

  const destCurr = destination.currency || "USD";
  const userCurr = departureCity?.currency || "INR";

  let formattedBudget = "$1,200 USD";
  if (typeof budget === "number") {
    formattedBudget = formatDualPrice(budget, destCurr, userCurr);
  } else if (typeof budget === "string" && budget) {
    const num = parseInt(budget.replace(/\D/g, ""), 10);
    if (!isNaN(num) && num > 0) {
      formattedBudget = formatDualPrice(num, destCurr, userCurr);
    } else {
      formattedBudget = budget;
    }
  } else {
    formattedBudget = formatDualPrice(1200, destCurr, userCurr);
  }

  return (
    <div className="planner-glass-card trip-overview-card">
      <div className="overview-hero">
        <div className="overview-title-block">
          <span className="overview-badge">
            <Sparkles size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
            {matchScore || 95}% Compatibility Match
          </span>
          <h3>{destination.city}</h3>
          <p className="overview-subtitle">{destination.country}</p>
        </div>
        <div className="overview-weather-box">
          <CloudSun size={24} className="weather-icon-pulse" />
          <span>Warm &amp; Sunny</span>
          <strong>24°C / 75°F</strong>
        </div>
      </div>

      <div className="overview-stats-grid">
        <div className="stat-box">
          <Calendar size={18} className="stat-icon" />
          <div className="stat-texts">
            <span>Best Season</span>
            <strong>{destination.bestSeason || "All Year"}</strong>
          </div>
        </div>

        <div className="stat-box">
          <Clock size={18} className="stat-icon" />
          <div className="stat-texts">
            <span>Trip Length</span>
            <strong>{duration || "5-7 Days"}</strong>
          </div>
        </div>

        <div className="stat-box">
          <CircleDollarSign size={18} className="stat-icon" />
          <div className="stat-texts">
            <span>Total Budget</span>
            <strong>{formattedBudget}</strong>
          </div>
        </div>

        <div className="stat-box">
          <Globe size={18} className="stat-icon" />
          <div className="stat-texts">
            <span>Time Zone</span>
            <strong>{destination.timezone || "GMT (UTC+0)"}</strong>
          </div>
        </div>

        <div className="stat-box">
          <Languages size={18} className="stat-icon" />
          <div className="stat-texts">
            <span>Language</span>
            <strong>{destination.language || "English"}</strong>
          </div>
        </div>

        <div className="stat-box">
          <CircleDollarSign size={18} className="stat-icon" />
          <div className="stat-texts">
            <span>Currency</span>
            <strong>{destination.currency || "Local"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
