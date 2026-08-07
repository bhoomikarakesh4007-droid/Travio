import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Star, 
  MapPin, 
  X,
  ExternalLink
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import "../styles/TravelMap.css";

// Helper component to adjust map view programmatically
function MapController({ center, zoom, focusItem, markers, onFocusClear, setSelectedMarker }) {
  const map = useMap();

  // Handle center/zoom updates when no focusItem is active
  useEffect(() => {
    if (map && center && !focusItem) {
      map.setView(center, zoom || 12, { animate: true });
    }
  }, [map, center, zoom, focusItem]);

  // Handle card item click centering & marker selection
  useEffect(() => {
    if (map && focusItem && markers.length > 0) {
      if (focusItem.type === "route") {
        const routeStops = focusItem.data.stops;
        if (routeStops && routeStops.length > 0) {
          const coords = routeStops.map(s => s.coordinates).filter(Boolean);
          if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
        if (onFocusClear) onFocusClear();
        return;
      }

      // Match marker by ID or exact/partial Name
      const match = markers.find(m => {
        if (m.type !== focusItem.type && focusItem.type !== "all") return false;
        if (focusItem.data.id && m.originalData?.id && focusItem.data.id === m.originalData.id) return true;
        const targetName = (focusItem.data.name || focusItem.data.title || "").toLowerCase().trim();
        const markerName = (m.name || "").toLowerCase().trim();
        return markerName === targetName || markerName.includes(targetName) || targetName.includes(markerName);
      });

      if (match) {
        map.setView(match.position, 16, { animate: true });
        setSelectedMarker(match);
      } else if (focusItem.data.coordinates && Array.isArray(focusItem.data.coordinates) && focusItem.data.coordinates.length === 2) {
        // Fallback: Use direct coordinates if candidate wasn't in list
        const pos = [parseFloat(focusItem.data.coordinates[0]), parseFloat(focusItem.data.coordinates[1])];
        map.setView(pos, 16, { animate: true });
        const customMarker = {
          id: `custom-focus-${Date.now()}`,
          type: focusItem.type || "destination",
          name: focusItem.data.name || "Selected Location",
          rating: focusItem.data.rating || 4.8,
          distance: focusItem.data.distance || "Target Location",
          description: focusItem.data.description || focusItem.data.address || "Selected place on map.",
          image: focusItem.data.photo || focusItem.data.image,
          position: pos,
          emoji: focusItem.type === "hotel" ? "🏨" : focusItem.type === "restaurant" ? "🍜" : "📍",
          originalData: focusItem.data
        };
        setSelectedMarker(customMarker);
      }

      if (onFocusClear) {
        setTimeout(() => onFocusClear(), 300);
      }
    }
  }, [map, focusItem, markers, onFocusClear, setSelectedMarker]);

  return null;
}

// Helper to track the Leaflet map instance for parent controls
function MapInstanceTracker({ setMapInstance }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);
  return null;
}

// Function to generate custom HTML marker icons using Leaflet's divIcon
const createCustomIcon = (emoji, type, isSelected = false) => {
  let bgColor = "linear-gradient(135deg, #2563EB, #1D4ED8)"; // Destination (Blue)
  if (type === "hotel") {
    bgColor = "linear-gradient(135deg, #10B981, #059669)"; // Hotel (Green)
  } else if (type === "restaurant") {
    bgColor = "linear-gradient(135deg, #F59E0B, #D97706)"; // Restaurant (Orange)
  } else if (type === "attraction") {
    bgColor = "linear-gradient(135deg, #EC4899, #D946EF)"; // Attraction (Pink)
  }

  const size = isSelected ? 48 : 38;
  const border = isSelected ? "3px solid #FFFFFF" : "2px solid #FFFFFF";
  const shadow = isSelected 
    ? "0 0 24px rgba(37, 99, 235, 0.75), 0 6px 18px rgba(0, 0, 0, 0.4)" 
    : "0 4px 12px rgba(0, 0, 0, 0.22)";
  const transform = isSelected ? "scale(1.2)" : "scale(1)";
  const zIndex = isSelected ? 9999 : 1;

  return L.divIcon({
    className: `custom-map-marker ${isSelected ? "marker-selected" : ""}`,
    html: `
      <div style="
        background: ${bgColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${border};
        box-shadow: ${shadow};
        transform: ${transform};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? 22 : 16}px;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: ${zIndex};
      ">
        ${emoji}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export default function TravelMap({ 
  coordinates, 
  destination, 
  hotels = [], 
  restaurants = [], 
  attractions = [],
  interactive = false,
  focusItem = null,
  onFocusClear = null
}) {
  const [map, setMapInstance] = useState(null);
  const [mapTheme, setMapTheme] = useState("light");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [navigationLine, setNavigationLine] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeout = useRef(null);
  const wrapperRef = useRef(null);

  // Auto clean up toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const showToast = (msg) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(msg);
    toastTimeout.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Generate markers with simulated coordinates shifted slightly around destination center
  const markers = useMemo(() => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) return [];
    const [lat, lng] = coordinates;
    const list = [];

    // 1. Destination Center
    list.push({
      id: "destination",
      type: "destination",
      name: destination?.city || "Destination Center",
      rating: destination?.aiRating || 4.8,
      distance: "0 km from center",
      description: destination?.description || "Welcome to your planned destination.",
      image: destination?.hero || destination?.image,
      position: [lat, lng],
      emoji: "📍"
    });

    // 2. Hotels
    hotels.forEach((hotel, idx) => {
      const latOffset = idx === 0 ? 0.0035 : idx === 1 ? -0.0042 : 0.0028;
      const lngOffset = idx === 0 ? -0.0055 : idx === 1 ? 0.0048 : 0.0062;
      const hasCoords = hotel.coordinates && Array.isArray(hotel.coordinates) && hotel.coordinates.length === 2;
      list.push({
        id: `hotel-${idx}`,
        type: "hotel",
        name: hotel.name,
        rating: hotel.rating,
        distance: hotel.distance,
        description: hotel.attractions || "Curated comfortable accommodations.",
        image: hotel.photo,
        position: hasCoords ? hotel.coordinates : [lat + latOffset, lng + lngOffset],
        emoji: "🏨",
        originalData: hotel
      });
    });

    // 3. Restaurants
    restaurants.forEach((rest, idx) => {
      const latOffset = idx === 0 ? -0.0028 : idx === 1 ? 0.0058 : -0.0045;
      const lngOffset = idx === 0 ? -0.0032 : idx === 1 ? -0.0058 : 0.0038;
      const hasCoords = rest.coordinates && Array.isArray(rest.coordinates) && rest.coordinates.length === 2;
      list.push({
        id: `restaurant-${idx}`,
        type: "restaurant",
        name: rest.name,
        rating: rest.rating,
        distance: rest.distance,
        description: `Cuisine: ${rest.cuisine}. Typical hours: ${rest.hours}`,
        image: rest.image,
        position: hasCoords ? rest.coordinates : [lat + latOffset, lng + lngOffset],
        emoji: "🍜",
        originalData: rest
      });
    });

    // 4. Attractions
    attractions.forEach((att, idx) => {
      const latOffset = idx === 0 ? 0.0062 : idx === 1 ? -0.0065 : 0.0048;
      const lngOffset = idx === 0 ? 0.0025 : idx === 1 ? -0.0062 : -0.0072;
      list.push({
        id: `attraction-${idx}`,
        type: "attraction",
        name: att.name,
        rating: 4.8,
        distance: att.distance,
        description: att.description,
        image: att.image,
        position: [lat + latOffset, lng + lngOffset],
        emoji: "🧭",
        originalData: att
      });
    });

    return list;
  }, [coordinates, destination, hotels, restaurants, attractions]);

  // Listen to focusItem changes to center/zoom map & select marker
  useEffect(() => {
    if (focusItem && map) {
      if (focusItem.type === "route") {
        const routeStops = focusItem.data.stops;
        if (routeStops && routeStops.length > 0) {
          const coords = routeStops.map(s => s.coordinates);
          setNavigationLine(coords);
          
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, { padding: [50, 50] });
          showToast("🗺️ Full day itinerary route displayed");
        }
        if (onFocusClear) onFocusClear();
        return;
      }

      if (markers.length > 0) {
        const match = markers.find(
          m => m.type === focusItem.type && 
          m.name.toLowerCase().includes(focusItem.data.name.toLowerCase())
        );
        if (match) {
          map.setView(match.position, 14, { animate: true });
          setSelectedMarker(match);
          if (onFocusClear) onFocusClear();
        }
      }
    }
  }, [focusItem, markers, map, onFocusClear]);

  // Fallback simple preview mode if not interactive
  if (!interactive) {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return <div style={{ padding: "20px", color: "#64748b" }}>Map preview coming soon.</div>;
    }
    return (
      <MapContainer
        center={coordinates}
        zoom={12}
        style={{
          height: "420px",
          borderRadius: "20px",
          zIndex: 1
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker
          position={coordinates}
          icon={createCustomIcon("📍", "destination")}
        />
      </MapContainer>
    );
  }

  // Active Tile Layer URLs for dark/light modes
  const tileUrl = mapTheme === "light"
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Control Actions
  const handleZoomIn = () => map && map.zoomIn();
  const handleZoomOut = () => map && map.zoomOut();
  
  const handleCompass = () => {
    if (map) {
      map.setView(coordinates, 12, { animate: true });
      showToast("🧭 Centered on destination");
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast("❌ Geolocation is not supported by your browser");
      return;
    }

    showToast("📍 Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        if (map) {
          map.setView([latitude, longitude], 14, { animate: true });
        }
        showToast("📍 Location retrieved!");
      },
      (err) => {
        console.error(err);
        showToast("❌ Unable to find your location");
      }
    );
  };

  const handleToggleFullscreen = () => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true); // CSS fallback
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Keep state in sync if fullscreen is exited via Escape key
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleNavigate = (marker) => {
    const startPoint = userLocation || coordinates;
    setNavigationLine([startPoint, marker.position]);
    
    if (map) {
      const bounds = L.latLngBounds([startPoint, marker.position]);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
    showToast(`🗺️ Path drawn to ${marker.name}`);
  };

  const renderStars = (rating) => {
    const stars = Math.round(rating);
    return (
      <div className="card-rating">
        <Star size={13} fill="#F59E0B" color="#F59E0B" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleViewDetails = (marker) => {
    if (marker.type === "destination") {
      alert(`City details: Welcome to ${marker.name}! Ranked ★${marker.rating} in general experience.`);
    } else if (marker.type === "hotel") {
      alert(`Stay Simulation: Direct booking or specific details for "${marker.name}" is logged. Rate: $${marker.originalData?.pricePerNight}/night.`);
    } else if (marker.type === "restaurant") {
      alert(`Culinary Details: "${marker.name}" serves premium local food. Hours: ${marker.originalData?.hours}.`);
    } else if (marker.type === "attraction") {
      alert(`Sightseeing details: "${marker.name}" has an entry fee of ${marker.originalData?.entryFee}. Recommended duration: ${marker.originalData?.duration}.`);
    }
  };

  return (
    <div 
      className={`premium-map-wrapper ${isFullscreen ? "fullscreen-mode" : ""}`} 
      ref={wrapperRef}
    >
      {/* Toast Notice banner */}
      {toastMessage && (
        <div className={`map-toast ${mapTheme === "light" ? "glass-light" : "glass-dark"}`}>
          {toastMessage}
        </div>
      )}

      {/* Floating custom map controls */}
      <div className="map-custom-controls">
        <button 
          className={`map-control-btn ${mapTheme === "light" ? "glass-light" : "glass-dark"}`} 
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          className={`map-control-btn ${mapTheme === "light" ? "glass-light" : "glass-dark"}`} 
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          className={`map-control-btn ${mapTheme === "light" ? "glass-light" : "glass-dark"}`} 
          onClick={handleCompass}
          title="Center on Destination"
        >
          <Compass size={18} />
        </button>
        <button 
          className={`map-control-btn ${mapTheme === "light" ? "glass-light" : "glass-dark"}`} 
          onClick={handleLocateMe}
          title="Locate Me"
        >
          <Navigation size={18} />
        </button>
        <button 
          className={`map-control-btn ${mapTheme === "light" ? "glass-light" : "glass-dark"}`} 
          onClick={handleToggleFullscreen}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button 
          className={`map-control-btn ${mapTheme === "light" ? "glass-light" : "glass-dark"}`} 
          onClick={() => setMapTheme(t => t === "light" ? "dark" : "light")}
          title="Toggle Theme"
        >
          {mapTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Floating Glassmorphism Detail Card */}
      {selectedMarker && (
        <div className={`map-floating-card ${mapTheme === "light" ? "glass-light" : "glass-dark card-dark"}`}>
          <button className="card-close-btn" onClick={() => {
            setSelectedMarker(null);
            setNavigationLine(null);
          }}>
            <X size={12} />
          </button>
          
          <div className="card-image-wrapper">
            <img src={selectedMarker.image} alt={selectedMarker.name} className="card-image" />
          </div>

          <div className="card-details">
            <div className="card-tag-row">
              <span className={`card-badge badge-${selectedMarker.type}`}>
                {selectedMarker.type}
              </span>
              {renderStars(selectedMarker.rating)}
            </div>

            <div>
              <h3 className="card-name">{selectedMarker.name}</h3>
              <p className="card-distance">📍 {selectedMarker.distance}</p>
            </div>

            <p className="card-desc">{selectedMarker.description}</p>

            <div className="card-actions">
              <button 
                className="card-btn card-btn-primary"
                onClick={() => handleNavigate(selectedMarker)}
              >
                <Navigation size={12} style={{ transform: "rotate(45deg)" }} />
                <span>Navigate</span>
              </button>
              <button 
                className="card-btn card-btn-secondary"
                onClick={() => handleViewDetails(selectedMarker)}
              >
                <ExternalLink size={12} />
                <span>Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Component */}
      <MapContainer
        center={coordinates}
        zoom={12}
        className="premium-map-container"
        zoomControl={false}
      >
        <TileLayer url={tileUrl} />
        
        {/* Helper Controller & Tracker */}
        <MapController 
          center={coordinates} 
          zoom={12} 
          focusItem={focusItem} 
          markers={markers}
          onFocusClear={onFocusClear}
          setSelectedMarker={setSelectedMarker}
        />
        <MapInstanceTracker setMapInstance={setMapInstance} />

        {/* User GPS location dot marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "user-gps-marker",
              html: `
                <div class="locate-me-pulse-container">
                  <div class="locate-me-pulse-dot"></div>
                  <div class="locate-me-pulse-ring"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          />
        )}

        {/* Navigation line between start point and marker */}
        {navigationLine && (
          <Polyline 
            positions={navigationLine}
            color={mapTheme === "light" ? "#2563EB" : "#3B82F6"}
            weight={4}
            dashArray="10, 10"
            opacity={0.85}
          />
        )}

        {/* Dynamic Markers */}
        {markers.map((marker) => {
          const isSelected = selectedMarker && (selectedMarker.id === marker.id || selectedMarker.name === marker.name);
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createCustomIcon(marker.emoji, marker.type, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedMarker(marker);
                  setNavigationLine(null); // Clear navigation line when switching markers
                  if (map) {
                    map.setView(marker.position, Math.max(map.getZoom(), 15), { animate: true });
                  }
                }
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}