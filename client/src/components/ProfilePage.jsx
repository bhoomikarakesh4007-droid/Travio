import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTravelSession } from "../context/TravelSessionContext";
import { useWishlist } from "../context/WishlistContext";
import { removeWishlist } from "../services/wishlistService";
import { resolveDestination } from "../data/destinationData";
import Navbar from "./Navbar";
import "../styles/ProfilePage.css";
import {
  Heart,
  Globe,
  Calendar,
  MessageSquare,
  Compass,
  Mail,
  CheckCircle,
  LogOut,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

// Premium animated count helper
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const duration = 800; // Animation length: 0.8 seconds
    const frameRate = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress); // Ease out
      const current = Math.round(easeProgress * end);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="stat-number">{count}</span>;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { selectedDestination } = useTravelSession();
  const { wishlist } = useWishlist();

  // Local state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Derive account details
  const traveler = profile || {};
  const name = traveler.name || user?.displayName || "Traveler";
  const email = traveler.email || user?.email || "";
  const photo = traveler.photo || user?.photoURL;

  // Format creation year: defaults to "2026"
  const travelerSinceYear = useMemo(() => {
    let rawDate = null;
    if (traveler.createdAt) {
      rawDate = traveler.createdAt.toDate ? traveler.createdAt.toDate() : new Date(traveler.createdAt.seconds * 1000 || traveler.createdAt);
    } else if (user?.metadata?.creationTime) {
      rawDate = new Date(user.metadata.creationTime);
    }

    if (rawDate && !isNaN(rawDate.getTime())) {
      return rawDate.getFullYear().toString();
    }
    return "2026";
  }, [traveler.createdAt, user?.metadata?.creationTime]);

  // Slice wishlist for preview (up to 4 items)
  const wishlistPreview = useMemo(() => {
    return wishlist.slice(0, 4);
  }, [wishlist]);

  // Planned Trips count
  const plannedTripsCount = useMemo(() => {
    const plannedIds = [];

    // Scan localStorage keys for custom itineraries
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("travio_itinerary_")) {
          const id = key.replace("travio_itinerary_", "");
          if (id && id !== "undefined" && !plannedIds.includes(id)) {
            plannedIds.push(id);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }

    // Add Firestore-synced planned trips if available
    if (Array.isArray(traveler.plannedTrips)) {
      traveler.plannedTrips.forEach(trip => {
        const id = typeof trip === "string" ? trip : trip.id;
        if (id && !plannedIds.includes(id)) {
          plannedIds.push(id);
        }
      });
    }

    return plannedIds.length;
  }, [traveler.plannedTrips]);

  // Destinations explored count
  const destinationsExplored = useMemo(() => {
    try {
      const recent = JSON.parse(localStorage.getItem("travio_recently_viewed") || "[]");
      return Array.isArray(recent) ? recent.length : 0;
    } catch {
      return 0;
    }
  }, []);

  // Atlas conversations statistic count
  const atlasConversationsCount = useMemo(() => {
    try {
      const historyKey = `travio_atlas_history_${user?.uid}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
      const activeMsg = JSON.parse(sessionStorage.getItem("travio_atlas_messages") || "[]");
      const hasActive = activeMsg.length > 1 ? 1 : 0;
      return history.length + hasActive;
    } catch (e) {
      return 0;
    }
  }, [user?.uid]);

  // Active Trip resolution
  const activeDestination = useMemo(() => {
    if (!selectedDestination) return null;
    return resolveDestination(selectedDestination);
  }, [selectedDestination]);

  // Handlers
  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  }

  // If auth is not ready
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card" style={{ maxWidth: "450px", margin: "0 auto", textAlign: "center" }}>
          <Compass size={40} className="stat-icon" style={{ color: "var(--primary)", margin: "0 auto 15px" }} />
          <h2 style={{ color: "var(--primary-dark)", marginBottom: "10px" }}>Welcome Traveler</h2>
          <p style={{ color: "var(--text-light)", fontSize: "14px", marginBottom: "20px" }}>
            Please sign in to access your digital travel profile.
          </p>
          <button
            className="wishlist-empty-btn"
            style={{ width: "100%", padding: "10px" }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">

          {/* ==========================================
                      1. HERO PROFILE CARD
          ========================================== */}
          <div className="profile-card hero-profile-card">
            <div className="hero-avatar">
              {photo ? (
                <img src={photo} alt={`${name}'s avatar`} referrerPolicy="no-referrer" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hero-info">
              <div className="hero-name-row">
                <h1 className="hero-name">{name}</h1>
                <span className="verified-icon" title="Google Verified Account">
                  <CheckCircle size={16} fill="var(--primary)" stroke="white" />
                </span>
              </div>
              <p className="hero-email">{email}</p>
              <div className="hero-since">
                Traveler Since {travelerSinceYear}
              </div>
            </div>
          </div>

          {/* ==========================================
                      2. TRAVEL STATISTICS
          ========================================== */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Heart size={20} fill="var(--primary-light)" stroke="var(--primary-light)" />
              </div>
              <AnimatedCounter value={wishlist.length} />
              <div className="stat-label">Wishlist</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Globe size={20} />
              </div>
              <AnimatedCounter value={destinationsExplored} />
              <div className="stat-label">Destinations Explored</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={20} />
              </div>
              <AnimatedCounter value={plannedTripsCount} />
              <div className="stat-label">Trips Planned</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <MessageSquare size={20} />
              </div>
              <AnimatedCounter value={atlasConversationsCount} />
              <div className="stat-label">Atlas Chats</div>
            </div>
          </div>

          {/* ==========================================
                      3. CONTINUE YOUR JOURNEY
          ========================================== */}
          <div>
            <h4 className="journey-section-title">Current Journey</h4>
            {activeDestination ? (
              <div className="journey-card" onClick={() => navigate(`/destination/${activeDestination.slug || activeDestination.id}`)}>
                <div className="journey-left">
                  <div className="journey-icon-box">
                    <Compass size={22} />
                  </div>
                  <div className="journey-info">
                    <span className="journey-subtitle">Continue Your Journey</span>
                    <span className="journey-title">📍 {activeDestination.city || activeDestination.name}, {activeDestination.country}</span>
                  </div>
                </div>
                <div className="journey-right">
                  Resume Planning <ArrowRight size={16} />
                </div>
              </div>
            ) : (
              <div className="journey-card" onClick={() => navigate("/home")}>
                <div className="journey-left">
                  <div className="journey-icon-box">
                    <Compass size={22} />
                  </div>
                  <div className="journey-info">
                    <span className="journey-subtitle">Start Planning Your Next Adventure</span>
                    <span className="journey-title">Discover and plan new travel spots</span>
                  </div>
                </div>
                <div className="journey-right">
                  Explore Destinations <ArrowRight size={16} />
                </div>
              </div>
            )}
          </div>

          {/* ==========================================
                      4. WISHLIST PREVIEW
          ========================================== */}
          <div className="profile-card">
            <div className="wishlist-preview-header">
              <h3 className="wishlist-preview-title">❤️ Saved Destinations</h3>
              {wishlist.length > 0 && (
                <button className="wishlist-view-all-btn" onClick={() => navigate("/wishlist")}>
                  View All ({wishlist.length})
                </button>
              )}
            </div>

            {wishlistPreview.length === 0 ? (
              <div className="wishlist-empty-box">
                <p className="wishlist-empty-text">No destinations saved yet. Build your dream passport collection by adding destinations from our explore map.</p>
                <button className="wishlist-empty-btn" onClick={() => navigate("/home")}>
                  Browse Destinations
                </button>
              </div>
            ) : (
              <div className="wishlist-preview-grid">
                {wishlistPreview.map(item => (
                  <div key={item.id} className="wishlist-preview-item" onClick={() => navigate(`/destination/${item.slug || item.id}`)}>
                    <div className="wishlist-item-img-box">
                      <img src={item.hero || item.image || item.cover} alt={item.title || item.name} className="wishlist-item-img" loading="lazy" />
                    </div>
                    <div className="wishlist-item-info">
                      <div className="wishlist-item-title">{item.title || item.name}</div>
                      <div className="wishlist-item-country">
                        <Globe size={11} /> {item.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==========================================
                      5. ACCOUNT SECTION
          ========================================== */}
          <div className="profile-card">
            <h3 className="account-card-title">Passport Account Settings</h3>

            <div className="account-detail-row">
              <div className="account-small-avatar">
                {photo ? (
                  <img src={photo} alt={`${name}'s credentials`} referrerPolicy="no-referrer" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="account-credential-box">
                <div className="account-display-name">{name}</div>
                <div className="account-email-text">{email}</div>
              </div>
            </div>

            <div className="account-provider-info">
              <span className="account-provider-label">Authentication Provider</span>
              <span className="account-provider-value">
                <ShieldCheck size={16} style={{ color: "var(--primary)" }} /> Google Sign-In
              </span>
            </div>

            <div className="logout-btn-container">
              <button className="logout-outline-button" onClick={() => setShowLogoutModal(true)}>
                <LogOut size={14} /> Logout Session
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
              LOGOUT DIALOG OVERLAY
      ========================================== */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h4 className="logout-modal-title">Confirm Logout</h4>
            <p className="logout-modal-text">
              Are you sure you want to end your current travel session? You can sign back in at any time to resume planning.
            </p>
            <div className="modal-btn-row">
              <button className="modal-button modal-button-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="modal-button modal-button-confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
