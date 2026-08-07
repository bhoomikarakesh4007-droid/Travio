import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useTravel } from "../../context/TravelContext";
import { DEPARTURE_CITIES } from "../../services/currencyService";
import "../../styles/DepartureCityModal.css";

export default function DepartureCityModal() {
  const { 
    departureCity, 
    setDepartureCity, 
    showDepartureModal, 
    setShowDepartureModal 
  } = useTravel();

  const [selected, setSelected] = useState(departureCity || null);

  if (!showDepartureModal) return null;

  const handleSelect = (city) => {
    setSelected(city);
    setDepartureCity(city);
    setShowDepartureModal(false);
  };

  const handleClose = () => {
    // If no departure city is set, choose the default one (e.g., Bengaluru or New York) so it never fails.
    if (!departureCity) {
      setDepartureCity(DEPARTURE_CITIES[0]); // default to Bengaluru
    }
    setShowDepartureModal(false);
  };

  return (
    <div className="dep-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="dep-modal-card">
        <button 
          className="dep-modal-close" 
          type="button" 
          onClick={handleClose}
          aria-label="Close starting location selector"
        >
          <X size={20} />
        </button>
        
        <div className="dep-modal-header">
          <span className="dep-modal-icon">🌍</span>
          <h2>Select Departure City</h2>
          <p>
            Travio customizes flights, schedules, and currencies based on where your journey begins.
          </p>
        </div>

        <div className="dep-modal-body">
          <div className="dep-cities-list">
            {DEPARTURE_CITIES.map((city) => {
              const isCurrent = selected && selected.name === city.name;
              return (
                <button
                  key={city.name}
                  type="button"
                  className={`dep-city-item ${isCurrent ? "selected" : ""}`}
                  onClick={() => handleSelect(city)}
                >
                  <span className="dep-city-flag">
                    {city.country === "India" && "🇮🇳"}
                    {city.country === "United States" && "🇺🇸"}
                    {city.country === "United Kingdom" && "🇬🇧"}
                    {city.country === "Japan" && "🇯🇵"}
                    {city.country === "France" && "🇫🇷"}
                    {city.country === "Italy" && "🇮🇹"}
                    {city.country === "Australia" && "🇦🇺"}
                    {city.country === "South Korea" && "🇰🇷"}
                    {city.country === "Thailand" && "🇹🇭"}
                    {city.country === "Canada" && "🇨🇦"}
                    {city.country === "Switzerland" && "🇨🇭"}
                    {city.country === "Brazil" && "🇧🇷"}
                    {city.country === "Mexico" && "🇲🇽"}
                  </span>
                  <div className="dep-city-info">
                    <span className="dep-city-name">{city.name}</span>
                    <span className="dep-city-country">{city.country} ({city.code})</span>
                  </div>
                  {isCurrent && <Check className="dep-city-check" size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
