import React from "react";
import { 
  Plane, 
  Hotel, 
  Utensils, 
  Car, 
  Compass, 
  ShoppingBag, 
  AlertTriangle, 
  Calculator 
} from "lucide-react";
import { useTravel } from "../../context/TravelContext";
import { formatDualPrice } from "../../services/currencyService";

export default function BudgetCard({ budget, days, travelers, destination }) {
  const { departureCity } = useTravel();
  if (!budget) return null;

  const destCurrency = destination?.currency || "USD";
  const userCurrency = departureCity?.currency || "INR";

  // Categories metadata for visual mapping, gradients, and custom descriptions
  const categoryMetadata = {
    Flights: { 
      icon: Plane, 
      label: "Flight", 
      gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)", 
      desc: "Roundtrip airline tickets per person, standard taxes, and airport baggage fees." 
    },
    Stays: { 
      icon: Hotel, 
      label: "Hotel", 
      gradient: "linear-gradient(135deg, #10B981, #059669)", 
      desc: "Overnight lodging reservations, boutique hotel stays, and local resort fees." 
    },
    Dining: { 
      icon: Utensils, 
      label: "Food", 
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)", 
      desc: "Daily restaurant dining, street food treats, traditional meals, and beverages." 
    },
    Transit: { 
      icon: Car, 
      label: "Transport", 
      gradient: "linear-gradient(135deg, #6366F1, #4F46E5)", 
      desc: "Local metro cards, city train transits, ride-shares, and navigation apps." 
    },
    Activities: { 
      icon: Compass, 
      label: "Activities", 
      gradient: "linear-gradient(135deg, #EC4899, #D946EF)", 
      desc: "Guided landmark entry tickets, sightseeing tours, and cultural workshops." 
    },
    Shopping: { 
      icon: ShoppingBag, 
      label: "Shopping", 
      gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)", 
      desc: "Allowance for traditional local souvenirs, artisan crafts, and gifts." 
    },
    "Emergency Buffer": { 
      icon: AlertTriangle, 
      label: "Emergency Buffer", 
      gradient: "linear-gradient(135deg, #EF4444, #DC2626)", 
      desc: "10% safety reserve allocated for unplanned transit shifts or health needs." 
    }
  };

  const dailyTotal = Math.round(
    (budget.hotelCost + budget.foodCost + budget.transportCost + budget.activitiesCost) / (days || 1)
  );

  const formattedTotal = formatDualPrice(budget.totalCost, destCurrency, userCurrency);
  const formattedDaily = formatDualPrice(dailyTotal, destCurrency, userCurrency);

  return (
    <div className="budget-premium-view">
      {/* Centered Circular Budget Summary */}
      <div className="budget-summary-circle-container">
        <div className="budget-summary-circle">
          <span className="summary-label">Estimated Total</span>
          <h2 className="summary-value">{formattedTotal}</h2>
          <span className="summary-subtext">{formattedDaily}/day avg</span>
        </div>
      </div>

      {/* Horizontal Progress Breakdown */}
      <div className="budget-progress-section">
        <div className="budget-progress-bar-container">
          <div className="budget-progress-bar">
            {budget.breakdown.map((item, idx) => {
              const meta = categoryMetadata[item.category] || { gradient: item.color };
              return (
                <div 
                  key={idx} 
                  className="progress-segment" 
                  style={{ 
                    width: `${item.percentage}%`, 
                    background: meta.gradient 
                  }}
                  title={`${item.category}: ${item.percentage}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="budget-progress-legend">
          {budget.breakdown.map((item, idx) => {
            const meta = categoryMetadata[item.category] || { label: item.category };
            return (
              <div className="legend-chip" key={idx}>
                <span className="legend-color-dot" style={{ background: item.color }} />
                <span className="legend-category">{meta.label}</span>
                <span className="legend-percentage">{item.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Budget Cards Grid */}
      <div className="budget-premium-grid">
        {budget.breakdown.map((item) => {
          const meta = categoryMetadata[item.category] || { 
            icon: Calculator, 
            label: item.category, 
            gradient: "linear-gradient(135deg, #64748B, #475569)",
            desc: "Custom spending allowance allocated for your trip."
          };
          const Icon = meta.icon;
          
          let dailyRateLabel = "";
          if (item.category === "Stays") {
            dailyRateLabel = `${formatDualPrice(Math.round(item.value / days), destCurrency, userCurrency)}/night`;
          } else if (["Dining", "Transit", "Activities"].includes(item.category)) {
            dailyRateLabel = `${formatDualPrice(Math.round(item.value / days / travelers), destCurrency, userCurrency)}/day per person`;
          } else if (item.category === "Flights") {
            dailyRateLabel = `${formatDualPrice(Math.round(item.value / travelers), destCurrency, userCurrency)}/ticket`;
          } else {
            dailyRateLabel = "Trip budget";
          }

          const formattedValue = formatDualPrice(item.value, destCurrency, userCurrency);

          return (
            <div className="budget-premium-card" key={item.category}>
              <div className="budget-card-top">
                <div 
                  className="budget-icon-circle-gradient" 
                  style={{ background: meta.gradient }}
                >
                  <Icon size={20} color="#FFFFFF" />
                </div>
                <div className="budget-card-title-block">
                  <h4 className="budget-card-title">{meta.label}</h4>
                  <span className="budget-card-rate">{dailyRateLabel}</span>
                </div>
              </div>
              
              <p className="budget-card-description">{meta.desc}</p>
              
              <div className="budget-card-bottom">
                <strong className="budget-card-value">{formattedValue}</strong>
                <span className="budget-card-percent-badge">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
