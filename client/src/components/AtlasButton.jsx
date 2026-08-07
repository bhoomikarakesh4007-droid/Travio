import React from "react";
import "../styles/AtlasButton.css";

export default function AtlasButton({ isOpen, position, onMouseDown }) {
  const style = {
    left: position.x,
    top: position.y,
    position: "fixed",
    bottom: "auto",
    right: "auto"
  };

  return (
    <div 
      className={`atlas-button-container ${isOpen ? "hidden" : "visible"}`}
      style={style}
      onMouseDown={onMouseDown}
    >
      <span className="atlas-tooltip">Ask Atlas AI</span>
      <button 
        className="atlas-floating-button" 
        aria-label="Open Atlas Travel Assistant"
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="atlas-companion-svg"
        >
          <defs>
            {/* Soft backdrop blur and premium gradient overlays */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
              <stop offset="35%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
            </linearGradient>
            <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
            {/* Filters for premium drop shadow & glow */}
            <filter id="premiumShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1E3A8A" floodOpacity="0.25" />
            </filter>
            <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient Outer Glow */}
          <circle cx="50" cy="45" r="32" fill="url(#ambientGlow)" className="companion-ambient-glow" />

          {/* Drifting Robot Companion Group */}
          <g className="companion-robot" filter="url(#premiumShadow)">
            {/* Thruster Jet Flame / Energy Particle */}
            <g className="companion-thruster">
              <path d="M43 75 Q50 90 57 75 Z" fill="url(#glowGrad)" opacity="0.85" className="companion-thruster-fire" />
              <circle cx="50" cy="81" r="2.5" fill="#93C5FD" className="companion-thruster-particle" />
            </g>

            {/* Futuristic floating body armor */}
            <path d="M32 64 C32 58, 68 58, 68 64 C68 70, 32 70, 32 64 Z" fill="url(#bodyGrad)" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.2" />
            <rect x="42" y="60" width="16" height="5" rx="2.5" fill="url(#primaryGrad)" />
            
            {/* Head Group */}
            <g className="companion-head">
              {/* Antenna with pulsing light */}
              <line x1="50" y1="21" x2="50" y2="10" stroke="url(#primaryGrad)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="8" r="4.5" fill="#60A5FA" filter="url(#eyeGlow)" className="companion-antenna-orb" />

              {/* Side Ears / Head Connectors */}
              <rect x="17" y="32" width="6" height="15" rx="3" fill="url(#primaryGrad)" />
              <rect x="77" y="32" width="6" height="15" rx="3" fill="url(#primaryGrad)" />

              {/* Polished Glassmorphic Head Shape */}
              <rect x="21" y="18" width="58" height="44" rx="22" fill="url(#bodyGrad)" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="1.5" />
              
              {/* Visor / Screen */}
              <rect x="27" y="25" width="46" height="28" rx="14" fill="url(#visorGrad)" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1.2" />
              
              {/* Sleek Visor Reflection Line */}
              <path d="M33 29 C40 27, 60 27, 67 29" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="2.2" strokeLinecap="round" />

              {/* Glowing Interactive Eyes */}
              <g className="companion-eyes" filter="url(#eyeGlow)">
                <ellipse cx="39" cy="38" rx="4.5" ry="7" fill="#60A5FA" className="companion-eye eye-left" />
                <ellipse cx="61" cy="38" rx="4.5" ry="7" fill="#60A5FA" className="companion-eye eye-right" />
              </g>
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}
