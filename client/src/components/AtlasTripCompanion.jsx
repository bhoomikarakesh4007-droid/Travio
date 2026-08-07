/* C:\Travio\client\src\components\AtlasTripCompanion.jsx */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageSquare } from "lucide-react";
import "../styles/AtlasTripCompanion.css";

export default function AtlasTripCompanion() {
  const navigate = useNavigate();

  const handleOpenAtlas = () => {
    navigate("/atlas");
  };

  return (
    <div className="atlas-companion-card">
      <div className="atlas-card-left">
        <div className="atlas-avatar-container">
          <svg 
            width="56" 
            height="56" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="atlas-companion-avatar-svg"
          >
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            {/* Robot Head */}
            <circle cx="50" cy="50" r="38" fill="url(#bodyGrad)" stroke="#CBD5E1" strokeWidth="2" />
            {/* Visor */}
            <rect x="25" y="38" width="50" height="24" rx="12" fill="url(#visorGrad)" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1" />
            {/* Glowing Eyes */}
            <circle cx="40" cy="50" r="4.5" fill="#60A5FA" />
            <circle cx="60" cy="50" r="4.5" fill="#60A5FA" />
            {/* Antenna */}
            <line x1="50" y1="12" x2="50" y2="4" stroke="url(#primaryGrad)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="4" r="3.5" fill="#60A5FA" />
          </svg>
          <div className="online-badge"></div>
        </div>
      </div>
      
      <div className="atlas-card-right">
        <div className="atlas-card-badge">
          <Sparkles size={12} className="badge-sparkle" />
          <span>AI Travel Assistant</span>
        </div>
        <h2>Meet Atlas, Your Travel Companion</h2>
        <p>
          Need real-time weather updates, personalized dining recommendations, local transit guides, or packing tips? Ask Atlas AI to customize your itinerary and assist you throughout your journey.
        </p>
        <button className="open-atlas-btn" onClick={handleOpenAtlas}>
          <MessageSquare size={16} />
          <span>Open Atlas AI</span>
        </button>
      </div>
    </div>
  );
}
