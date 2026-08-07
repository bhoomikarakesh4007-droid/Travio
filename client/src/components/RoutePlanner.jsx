import React, { useEffect, useMemo, useState } from "react";
import { Star, MapPin, Footprints, Car, Navigation, Plane, Map as MapIcon, Utensils, Hotel, Compass } from "lucide-react";

import { generateSmartRoute } from "../services/aiService";
import "../styles/RoutePlanner.css";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getPreferences() {
  try {
    return JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
  } catch {
    return {};
  }
}

export default function RoutePlanner({ destination, hotels = [], restaurants = [], attractions = [], onViewOnMap }) {
  const [routePlan, setRoutePlan] = useState(null);
  const [planning, setPlanning] = useState(false);

  const routeCandidates = useMemo(() => {
    if (!destination?.coordinates) return [];
    const [lat, lng] = destination.coordinates;
    const restaurantFallbacks = [
      { name: `${destination.city} Old Town Kitchen`, cuisine: "Traditional & Local", rating: 4.7, hours: "11:30 AM - 10:30 PM", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", coordinates: [lat - 0.0028, lng - 0.0032] },
      { name: "Breezes Dining & Café", cuisine: "Modern Fusion & Bakery", rating: 4.6, hours: "8:00 AM - 9:00 PM", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", coordinates: [lat + 0.0058, lng - 0.0058] },
      { name: "L'Etoile Golden Table", cuisine: "Fine Dining & Seafood", rating: 4.9, hours: "6:00 PM - 11:30 PM", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80", coordinates: [lat - 0.0045, lng + 0.0038] }
    ];
    const attractionFallbacks = [
      { name: `${destination.city} Imperial Garden`, category: "Nature & History", duration: "2 Hours", entryFee: "Free Admission", description: "Gorgeous gardens filled with local heritage and paths.", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80", coordinates: [lat + 0.0062, lng + 0.0025] },
      { name: `${destination.city} Panoramic Overlook`, category: "Scenic Viewpoint", duration: "1.5 Hours", entryFee: "Free", description: "A gorgeous viewpoint looking over the valley, waterways, and city.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", coordinates: [lat - 0.0065, lng - 0.0062] }
    ];

    const dining = (restaurants.length ? restaurants : restaurantFallbacks).slice(0, 3).map((item, index) => ({
      ...item, id: `restaurant-${index}`, type: "restaurant", openingHours: item.hours || "Not provided", cost: item.costForTwo || "Not provided",
      coordinates: item.coordinates || restaurantFallbacks[index]?.coordinates || [lat, lng]
    }));
    const sights = (attractions.length ? attractions : attractionFallbacks).slice(0, 3).map((item, index) => ({
      ...item, id: `attraction-${index}`, type: "attraction", rating: item.rating || 4.7, openingHours: item.hours || "Opening hours not provided", cost: item.entryFee || "Not provided",
      coordinates: item.coordinates || attractionFallbacks[index]?.coordinates || [lat, lng]
    }));
    return [...dining, ...sights];
  }, [destination, restaurants, attractions]);

  useEffect(() => {
    if (!destination || routeCandidates.length === 0) return;
    let active = true;
    setPlanning(true);
    setRoutePlan(null);

    generateSmartRoute({
      destination: { name: destination.city, country: destination.country, coordinates: destination.coordinates },
      preferences: getPreferences(),
      candidates: routeCandidates.map(({ id, name, type, rating, openingHours, cost, coordinates, category, cuisine, duration }) => ({ id, name, type, rating, openingHours, cost, coordinates, category, cuisine, duration }))
    })
      .then((plan) => active && setRoutePlan(plan))
      .catch((error) => console.error("Unable to generate smart route:", error))
      .finally(() => active && setPlanning(false));

    return () => { active = false; };
  }, [destination, routeCandidates]);

  const routeStops = useMemo(() => {
    if (!destination?.coordinates) return [];
    const [lat, lng] = destination.coordinates;
    const hotel = hotels[0] || { name: `${destination.city} Grand Plaza`, rating: 4.8, photo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80", coordinates: [lat + 0.0035, lng - 0.0055], attractions: "Convenient stay in central city." };
    const candidateMap = new Map(routeCandidates.map((candidate) => [candidate.id, candidate]));
    const order = routePlan?.orderedStops?.length ? routePlan.orderedStops : routeCandidates.map((candidate, index) => ({ id: candidate.id, time: ["12:30 PM", "04:30 PM", "07:30 PM", "02:00 PM", "06:00 PM"][index] || "03:30 PM", reason: "Selected for a balanced day." }));
    const activities = order.map((planned, index) => {
      const item = candidateMap.get(planned.id);
      if (!item) return null;
      const isDining = item.type === "restaurant";
      return {
        ...item,
        id: `stop-${item.id}`,
        time: planned.time || "Flexible",
        subtitle: isDining ? `${index > 0 ? "Dining" : "Meal stop"} • ${item.cuisine || "Local dining"}` : `Exploration • ${item.category || "Attraction"}`,
        description: planned.reason || item.description || "Selected to suit your day.",
        image: item.image,
        icon: isDining ? <Utensils size={18} color="#f59e0b" /> : <Compass size={18} color="#ec4899" />
      };
    }).filter(Boolean);
    const stops = [
      { id: "stop-arrival", type: "destination", time: "09:00 AM", name: "Flight Arrival", subtitle: destination.airport, description: `Land at ${destination.airport} and begin your ${destination.city} day.`, image: destination.hero || destination.image, rating: destination.aiRating, coordinates: [lat + 0.02, lng - 0.02], icon: <Plane size={18} color="#2563eb" /> },
      { id: "stop-hotel", type: "hotel", time: "10:30 AM", name: hotel.name, subtitle: "Hotel Check-in & Unpack", description: hotel.attractions || "Drop your bags and freshen up before heading out.", image: hotel.photo, rating: hotel.rating, coordinates: hotel.coordinates || [lat + 0.0035, lng - 0.0055], icon: <Hotel size={18} color="#10b981" /> },
      ...activities,
      { id: "stop-hotel-return", type: "hotel", time: "09:30 PM", name: `Return to ${hotel.name.split(" ")[0]}`, subtitle: "Night Rest", description: "Head back to the hotel after an eventful day.", image: hotel.photo, rating: hotel.rating, coordinates: hotel.coordinates || [lat + 0.0035, lng - 0.0055], icon: <Hotel size={18} color="#10b981" /> }
    ];
    stops.forEach((stop, index) => {
      const next = stops[index + 1];
      if (!next) return;
      const distance = calculateDistance(stop.coordinates[0], stop.coordinates[1], next.coordinates[0], next.coordinates[1]);
      const mode = distance < 1.5 ? "walking" : "driving";
      stop.transit = { distance: distance.toFixed(1), mode, time: Math.max(3, Math.round(distance * (mode === "walking" ? 12 : 2))) };
    });
    return stops;
  }, [destination, hotels, routeCandidates, routePlan]);

  const handleStopMapFocus = (stop) => onViewOnMap?.(stop.type, { name: stop.name, coordinates: stop.coordinates });
  const handleFullRouteMapFocus = () => onViewOnMap?.("route", { name: "Day Route Path", stops: routeStops });

  if (!destination || !destination.coordinates || routeStops.length === 0) {
    return (
      <div className="route-planner-section details-reveal">
        <div className="premium-empty-state-card" style={{ padding: "80px 24px", textAlign: "center", background: "white", borderRadius: "24px", border: "1px solid #edf0f5", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <MapPin size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.25rem", color: "#1e293b", fontWeight: 750 }}>Route planning is currently unavailable.</h3>
          <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: "8px" }}>Map coordinates are required to calculate route transits and stop optimization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-planner-section details-reveal">
      <div className="section-heading" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="section-kicker">🗺️ OPTIMIZED ROUTE</p>
          <h2>Smart Day Itinerary</h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "4px" }}>
            {planning ? "Gemini is optimizing your itinerary…" : routePlan?.explanation || "Stops are ordered using location, ratings, opening hours, and your travel preferences."}
          </p>
        </div>
        <button className="stop-action-btn" onClick={handleFullRouteMapFocus} style={{ background: "#2563eb", color: "#ffffff", padding: "12px 20px", borderRadius: "12px", boxShadow: "0 4px 14px rgba(37,99,235,0.2)" }}>
          <MapIcon size={15} /><span>View Full Route</span>
        </button>
      </div>
      <div className="timeline-container">
        <div className="timeline-track-line" />
        {routeStops.map((stop) => (
          <div key={stop.id} className="timeline-stop-node-wrapper">
            <div className={`timeline-stop-node node-${stop.type}`}>
              <div className="timeline-stop-icon-wrapper">{stop.icon}</div>
              <div className="timeline-stop-card">
                <div className="stop-card-image-box"><img src={stop.image} alt={stop.name} className="stop-card-image" loading="lazy" /></div>
                <div className="stop-card-details">
                  <div>
                    <div className="stop-card-header"><span className="stop-time-label">{stop.time}</span>{stop.rating && <div className="stop-rating-box"><Star size={13} fill="#F59E0B" color="#F59E0B" /><span>{Number(stop.rating).toFixed(1)}</span></div>}</div>
                    <div className="stop-card-title-row"><h3 className="stop-card-title">{stop.name}</h3><span className="stop-card-subtitle">{stop.subtitle}</span></div>
                    <p className="stop-card-desc">{stop.description}</p>
                  </div>
                  <div className="stop-card-footer"><div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.78rem", color: "#64748b" }}><MapPin size={12} /><span>{stop.type.toUpperCase()}</span></div><button className="stop-action-btn" onClick={() => handleStopMapFocus(stop)}><Navigation size={12} style={{ transform: "rotate(45deg)" }} /><span>Locate on Map</span></button></div>
                </div>
              </div>
            </div>
            {stop.transit && <div className="timeline-transit-connector"><div className="transit-pill">{stop.transit.mode === "walking" ? <Footprints size={12} /> : <Car size={12} />}<span>Transit: <strong>{stop.transit.distance} km</strong> • <strong>{stop.transit.time} mins</strong> by {stop.transit.mode}</span></div></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
