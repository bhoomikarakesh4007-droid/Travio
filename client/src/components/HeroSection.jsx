import { useState } from "react";
import { Heart, MapPin, Share2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import "../styles/HeroSection.css";

export default function HeroSection({ destination }) {
  const [isSaving, setIsSaving] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const { wishlist = [], addToWishlist, removeFromWishlist } = useWishlist();

  if (!destination) return null;

  const saved = wishlist.some((item) => item.id === destination.id);

  const handleWishlist = async () => {
    setIsSaving(true);
    try {
      if (saved) {
        await removeFromWishlist(destination.id);
      } else {
        await addToWishlist(destination);
      }
    } catch {
      setShareMessage("We couldn’t update your wishlist. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const shareDestination = async () => {
    const shareData = {
      title: destination.title,
      text: `Explore ${destination.title} with Travio`,
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Link copied to clipboard.");
        setTimeout(() => setShareMessage(""), 3000);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setShareMessage("Unable to share this destination right now.");
        setTimeout(() => setShareMessage(""), 3000);
      }
    }
  };

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  const heroImage = destination?.hero || PLACEHOLDER_IMAGE;
  const ratingText = typeof destination?.aiRating === "number" ? destination.aiRating.toFixed(1) : "4.8";

  return (
    <section className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="hero-overlay">
        <div className="hero-content">
          <p className="hero-country"><MapPin size={17} /> {destination?.country || "Earth"}</p>
          <h1>{destination?.city || destination?.title || "Destination"}</h1>
          <p className="hero-description">{destination?.description || "A beautiful place to explore."}</p>
          
          <div className="hero-chips" aria-label="Destination overview">
            <div className="hero-chip">⭐ {ratingText} Rating</div>
            <div className="hero-chip">✈️ {destination?.airport || "Nearest Airport"}</div>
            <div className="hero-chip">💶 {destination?.currency}</div>
            <div className="hero-chip">🗣️ {destination?.language}</div>
            <div className="hero-chip">🌤️ Best Time: {destination?.bestTimeToVisit || destination?.bestSeason || "Year-round"}</div>
          </div>

          <div className="hero-buttons">
            <button 
              className={`wishlist-btn ${saved ? "saved" : ""}`} 
              onClick={handleWishlist} 
              disabled={isSaving}
            >
              <Heart size={16} fill={saved ? "white" : "transparent"} />
              {saved ? "Wishlisted" : "Save to Wishlist"}
            </button>
            <button className="share-btn" onClick={shareDestination}>
              <Share2 size={16} /> Share
            </button>
          </div>

          {shareMessage && <p className="hero-message" role="status">{shareMessage}</p>}
        </div>
      </div>
    </section>
  );
}
