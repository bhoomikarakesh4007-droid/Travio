import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AirVent, BedDouble, Building2, Car, Check, ChevronLeft, ChevronRight, Clock3,
  Coffee, Dumbbell, Heart, Languages, MapPin, Maximize2, Navigation, Plane,
  Share2, ShieldCheck, Sparkles, Star, Utensils, Waves, Wifi, X, Phone, Globe, ExternalLink
} from "lucide-react";
import "../../styles/HotelDetailsModal.css";

import { useTravel } from "../../context/TravelContext";
import { formatDualPrice } from "../../services/currencyService";

const galleryFallbacks = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85"
];

const amenityItems = [
  [Wifi, "Free WiFi"], [Waves, "Swimming Pool"], [Sparkles, "Spa"], [Dumbbell, "Gym"],
  [Car, "Parking"], [Utensils, "Restaurant"], [Plane, "Airport Shuttle"], [AirVent, "Air Conditioning"],
  [Building2, "Business Center"], [ShieldCheck, "Laundry Service"]
];

function Stars() {
  return <span className="hotel-modal-stars" aria-label="Five star hotel">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill="currentColor" />)}</span>;
}

export default function HotelDetailsModal({ hotel, destination, onClose, onReserve, onViewOnMap, matchScore = 96 }) {
  const { departureCity } = useTravel();
  const dialogRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  if (!hotel) return null;

  const photos = [hotel.photo, ...galleryFallbacks].filter(Boolean);
  const price = Number(hotel.pricePerNight) || 180;
  const destCurr = hotel.currency || destination?.currency || "USD";
  const userCurr = departureCity?.currency || "INR";
  const priceDisplay = formatDualPrice(price, destCurr, userCurr);
  const taxes = Math.round(price * 0.16);
  const taxesDisplay = formatDualPrice(taxes, destCurr, userCurr);
  const totalDisplay = formatDualPrice(price + taxes, destCurr, userCurr);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 270);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => dialogRef.current?.querySelector(focusableSelector)?.focus();
    const timer = window.setTimeout(focusFirst, 30);
    const onKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll(focusableSelector) || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(closeTimerRef.current);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [requestClose]);

  const roomTypes = [
    { name: "Deluxe King Room", bed: "1 king bed", guests: "2 guests", size: "32 m²", price },
    { name: "City View Twin Room", bed: "2 twin beds", guests: "2 guests", size: "35 m²", price: price + 32 },
    { name: "Signature Suite", bed: "1 king bed + sofa", guests: "3 guests", size: "48 m²", price: price + 86 }
  ];
  const nearby = destination?.highlights || ["Old Town Promenade", "The Garden Table", "Morning Brew Café"];

  const modalContent = (
    <div className={`hotel-modal-overlay ${isClosing ? "is-closing" : ""}`} onMouseDown={(event) => event.target === event.currentTarget && requestClose()}>
      <section className="hotel-details-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="hotel-modal-title">
        <button className="hotel-modal-close" type="button" onClick={requestClose} aria-label="Close hotel details"><X size={22} /></button>
        <header className="hotel-modal-hero">
          <img src={photos[activePhoto]} alt={`${hotel.name} view`} />
          <div className="hotel-modal-hero-shade" />
          <div className="hotel-modal-hero-content">
            <span className="hotel-modal-match"><Sparkles size={14} /> {matchScore}% AI Match</span>
            <Stars />
            <h2 id="hotel-modal-title">{hotel.name}</h2>
            <div className="hotel-modal-hero-meta"><span className="hotel-modal-rating">{Number(hotel.rating || 4.7).toFixed(1)} <small>Guest favorite</small></span><span><MapPin size={15} /> {hotel.distance || "1.2 km from center"}</span><strong>{priceDisplay}<small> / night</small></strong></div>
          </div>
          <div className="hotel-modal-hero-actions"><button type="button" onClick={() => setIsSaved(!isSaved)} aria-label="Save hotel"><Heart size={19} fill={isSaved ? "currentColor" : "none"} /></button><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)} aria-label="Share hotel"><Share2 size={18} /></button></div>
        </header>

        <div className="hotel-modal-body">
          <main className="hotel-modal-content">
            <section className="hotel-modal-gallery" aria-label="Hotel photo gallery">
              <div className="hotel-gallery-main" onClick={() => setIsImageExpanded(true)} role="button" tabIndex="0" onKeyDown={(event) => event.key === "Enter" && setIsImageExpanded(true)}><img src={photos[activePhoto]} alt="Selected hotel gallery view" /><span><Maximize2 size={15} /> Enlarge</span></div>
              <div className="hotel-gallery-thumbnails">{photos.map((photo, index) => <button key={photo} type="button" className={activePhoto === index ? "active" : ""} onClick={() => setActivePhoto(index)}><img src={photo} alt={`Hotel view ${index + 1}`} /></button>)}</div>
            </section>

            <section className="hotel-modal-section"><p className="hotel-modal-eyebrow">ABOUT THE HOTEL</p><h3>Relaxed stays, thoughtfully placed.</h3><p>{hotel.attractions || `${hotel.name} offers a polished base for exploring ${destination?.city || "the city"}, balancing comfortable spaces with an easy-to-reach location.`}</p><div className="hotel-highlights"><span><Check size={15} /> Central location</span><span><Check size={15} /> Flexible check-in</span><span><Check size={15} /> Guest-loved service</span></div></section>

            {hotel.whyAtlasRecommends && hotel.whyAtlasRecommends.length > 0 && (
              <section className="hotel-modal-section" style={{
                background: "rgba(99, 102, 241, 0.03)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                padding: "20px",
                borderRadius: "16px",
                marginTop: "10px"
              }}>
                <p className="hotel-modal-eyebrow" style={{ color: "#6366f1", display: "flex", alignItems: "center", gap: "4px", margin: 0, fontWeight: "750" }}>
                  <Sparkles size={12} fill="currentColor" /> Why Atlas Recommends This
                </p>
                <h3 style={{ color: "#1e1b4b", fontSize: "16px", marginTop: "4px", marginBottom: "12px", fontWeight: "800" }}>Personalized Match Analysis</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 16px" }}>
                  {hotel.whyAtlasRecommends.map((reason, idx) => (
                    <span key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#4f46e5", fontWeight: "600" }}>
                      <Check size={14} strokeWidth={3} style={{ color: "#10b981", flexShrink: 0 }} /> {reason}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="hotel-modal-section"><p className="hotel-modal-eyebrow">ROOM TYPES</p><h3>Find your perfect room</h3><div className="hotel-room-list">{roomTypes.map((room, index) => <article className="hotel-room-card" key={room.name}><img src={photos[(index + 1) % photos.length]} alt={room.name} /><div><h4>{room.name}</h4><p><BedDouble size={15} /> {room.bed} · {room.guests} · {room.size}</p><span className="hotel-room-inclusion">Free cancellation</span><span className="hotel-room-inclusion breakfast"><Coffee size={13} /> Breakfast included</span></div><aside><strong>{formatDualPrice(room.price, destCurr, userCurr)}</strong><small>/ night</small><button type="button" onClick={onReserve}>Reserve</button></aside></article>)}</div></section>

            <section className="hotel-modal-section"><p className="hotel-modal-eyebrow">AMENITIES</p><h3>Everything you need, close at hand</h3><div className="hotel-modal-amenities">{amenityItems.map(([Icon, label]) => <span key={label}><Icon size={16} /> {label}</span>)}</div></section>

             <section className="hotel-modal-section hotel-info-grid"><div><p className="hotel-modal-eyebrow">CHECK-IN</p><h3>Good to know</h3><dl><div><dt><Clock3 size={16} /> Check-in</dt><dd>{hotel.checkIn || "From 3:00 PM"}</dd></div><div><dt><Clock3 size={16} /> Check-out</dt><dd>{hotel.checkOut || "Until 11:00 AM"}</dd></div><div><dt><Phone size={16} /> Phone</dt><dd>{hotel.phone || "Not Available"}</dd></div><div><dt><Globe size={16} /> Website</dt><dd>{hotel.website && hotel.website !== "Not Available" ? <a href={hotel.website} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Visit Site</a> : "Not Available"}</dd></div><div><dt><Building2 size={16} /> Business Status</dt><dd>{hotel.businessStatus || "Not Available"}</dd></div><div><dt><Clock3 size={16} /> Opening Status</dt><dd>{hotel.openingStatus || "Not Available"}</dd></div></dl></div><div className="hotel-location-card"><p className="hotel-modal-eyebrow">LOCATION</p><h3>Close to the best of {destination?.city || "the city"}</h3><p><MapPin size={16} /> {hotel.address || "Not Available"}</p><div className="hotel-mini-map"><MapPin size={24} /><span>{hotel.distance || "Not Available"} to city center<br />18 km to airport · Metro nearby</span></div><div><button type="button" onClick={onViewOnMap}>View on Map</button>{hotel.googleMapsLink && hotel.googleMapsLink !== "Not Available" ? <a href={hotel.googleMapsLink} target="_blank" rel="noreferrer" className="hotel-modal-nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "10px", fontSize: "13px", fontWeight: "600", color: "#2563eb", textDecoration: "underline" }}><Navigation size={15} /> Google Maps</a> : <span style={{ marginLeft: "10px", fontSize: "13px", color: "#94a3b8" }}>Google Maps: Not Available</span>}</div></div></section>

            <section className="hotel-modal-section"><p className="hotel-modal-eyebrow">NEARBY PLACES</p><h3>Just around the corner</h3><div className="hotel-nearby-list">{nearby.map((place, index) => <article key={place}><img src={photos[(index + 1) % photos.length]} alt="" /><div><h4>{place}</h4><p>{["0.4 km", "0.6 km", "0.2 km"][index]} · <Star size={13} fill="currentColor" /> 4.{8 - index}</p></div></article>)}</div></section>

            <section className="hotel-modal-section"><p className="hotel-modal-eyebrow">GUEST REVIEWS</p><div className="hotel-review-heading"><h3>Exceptional stays, according to guests</h3><strong>{Number(hotel.rating || 4.7).toFixed(1)}<small>/ 5</small></strong></div><div className="hotel-review-scores">{[["Cleanliness", 9.4], ["Location", 9.2], ["Service", 9.5], ["Comfort", 9.3], ["Value", 8.9]].map(([label, score]) => <div key={label}><span>{label}</span><i><b style={{ width: `${score * 10}%` }} /></i><strong>{score}</strong></div>)}</div><div className="hotel-review-list">{["Beautiful rooms and incredibly thoughtful service.", "A quiet, elegant spot with everything within easy reach.", "The team made the entire stay feel effortless."].map((review, index) => <article key={review}><Stars /><p>“{review}”</p><small>{["Alex · United Kingdom", "Maya · Singapore", "Jordan · Australia"][index]}</small></article>)}</div></section>
          </main>
          <aside className="hotel-price-summary"><p>YOUR STAY</p><div><span>From</span><strong>{priceDisplay} <small>/ night</small></strong></div><dl><div><dt>Nightly rate</dt><dd>{priceDisplay}</dd></div><div><dt>Taxes & fees</dt><dd>{taxesDisplay}</dd></div><div><dt>Estimated total</dt><dd>{totalDisplay}</dd></div></dl><button type="button" onClick={onReserve}>Reserve room</button><button type="button" className="hotel-summary-secondary" onClick={() => setIsSaved(!isSaved)}><Heart size={16} /> {isSaved ? "Saved hotel" : "Save hotel"}</button><button type="button" className="hotel-summary-link" onClick={() => hotel.website && hotel.website !== "Not Available" ? window.open(hotel.website, "_blank") : alert("Official Website not available for this hotel.")}><ExternalLink size={16} /> Official Website</button></aside>
        </div>
      </section>
      {isImageExpanded && <div className="hotel-image-lightbox" onMouseDown={(event) => event.target === event.currentTarget && setIsImageExpanded(false)}><button type="button" aria-label="Close enlarged image" onClick={() => setIsImageExpanded(false)}><X size={22} /></button><img src={photos[activePhoto]} alt="Enlarged hotel view" /><button type="button" aria-label="Previous image" onClick={() => setActivePhoto((activePhoto + photos.length - 1) % photos.length)}><ChevronLeft /></button><button type="button" aria-label="Next image" onClick={() => setActivePhoto((activePhoto + 1) % photos.length)}><ChevronRight /></button></div>}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
