import { Clock, Ticket, MapPin, Sparkles, Compass } from "lucide-react";
import { useTravelSession } from "../../context/TravelSessionContext";
import { useTravel } from "../../context/TravelContext";
import { resolveDestination } from "../../data/destinationData";
import { formatDualPrice } from "../../services/currencyService";

export default function AttractionCard({ attraction, destination, onViewOnMap }) {
  const { selectedDestination, addAttractionToItinerary } = useTravelSession();
  const { departureCity } = useTravel();

  if (!attraction) return null;

  const destCurr = destination?.currency || "USD";
  const userCurr = departureCity?.currency || "INR";

  let formattedEntryFee = attraction.entryFee;
  const numbers = attraction.entryFee ? attraction.entryFee.match(/\d+/g) : null;
  if (numbers && numbers.length >= 1 && !attraction.entryFee.toLowerCase().includes("free")) {
    const val = parseInt(numbers[0], 10);
    formattedEntryFee = formatDualPrice(val, destCurr, userCurr);
  } else if (!attraction.entryFee || attraction.entryFee.toLowerCase().includes("free")) {
    formattedEntryFee = "Free Admission";
  }

  const handleAddToItinerary = () => {
    const targetDest = resolveDestination(selectedDestination) || destination;
    if (!targetDest) {
      alert("Please select a destination first!");
      return;
    }

    const added = addAttractionToItinerary(targetDest.id, attraction);
    if (added) {
      alert(`🎉 Itinerary: "${attraction.name}" has been successfully added to your daily itinerary!`);
    } else {
      alert(`ℹ️ "${attraction.name}" is already in your daily itinerary!`);
    }
  };

  // Best time mapping function based on category or name
  const getBestTime = (category, name) => {
    const cat = category.toLowerCase();
    const nm = name.toLowerCase();
    
    if (cat.includes("sacred") || cat.includes("zen") || cat.includes("historical") || cat.includes("temple") || cat.includes("shrine") || cat.includes("palace") || nm.includes("shrine") || nm.includes("temple") || nm.includes("palace")) {
      return "Early Morning (8:00 AM - 10:30 AM)";
    }
    if (cat.includes("nature") || cat.includes("garden") || cat.includes("park") || cat.includes("trail") || nm.includes("bamboo") || nm.includes("garden")) {
      return "Morning / Late Afternoon (9:00 AM or 4:00 PM)";
    }
    if (cat.includes("observatory") || cat.includes("tower") || cat.includes("viewpoint") || nm.includes("tower") || nm.includes("viewpoint") || nm.includes("sunset")) {
      return "Sunset / Golden Hour (5:30 PM - 7:30 PM)";
    }
    return "Mid-day / Afternoon (11:00 AM - 3:00 PM)";
  };

  return (
    <div className="attraction-premium-card">
      <div className="attraction-card-image-container">
        <img src={attraction.image} alt={attraction.name} className="attraction-card-image" loading="lazy" />
        
        {/* Gradient overlay */}
        <div className="attraction-image-overlay" />
        
        {/* Category Badge overlay */}
        <div className="attraction-category-badge">
          <Compass size={11} style={{ marginRight: "4px" }} />
          <span>{attraction.category}</span>
        </div>
      </div>

      <div className="attraction-card-info">
        <div className="attraction-header-row">
          <h3 className="attraction-name">{attraction.name}</h3>
        </div>

        <div className="attraction-meta-row">
          <div className="meta-item attraction-distance">
            <MapPin size={13} />
            <span>{attraction.distance}</span>
          </div>
        </div>

        <p className="attraction-description">{attraction.description}</p>

        {/* Entry fee and estimated duration chips */}
        <div className="attraction-stats-container">
          <div className="attraction-stat-chip">
            <Clock size={12} />
            <span>Duration: <strong>{attraction.duration}</strong></span>
          </div>
          <div className="attraction-stat-chip">
            <Ticket size={12} />
            <span>Entry: <strong>{formattedEntryFee}</strong></span>
          </div>
        </div>

        {/* Best time to visit highlight */}
        <div className="attraction-best-time-box">
          <div className="best-time-title">
            <Sparkles size={12} />
            <span>Best Time to Visit</span>
          </div>
          <p className="best-time-value">{getBestTime(attraction.category, attraction.name)}</p>
        </div>

        <div className="attraction-card-divider" />

        <div className="attraction-card-footer">
          <div className="attraction-actions">
            <button 
              className="attraction-map-btn"
              onClick={() => onViewOnMap ? onViewOnMap("attraction", attraction) : alert(`Map View: Locating "${attraction.name}" on the dynamic map.`)}
            >
              View on Map
            </button>
            <button 
              className="attraction-add-btn"
              onClick={handleAddToItinerary}
            >
              Add to Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
