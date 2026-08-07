import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/SplashScreen.css";

import travioLogo from "../assets/images/travio-logo.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen-bg">
      <div className="splash-floating-circle circle-1" />
      <div className="splash-floating-circle circle-2" />
      <div className="splash-floating-circle circle-3" />
      <div className="splash-floating-circle circle-4" />

      <div className="splash-bg-decorations">
        <span className="plane plane-1">✈️</span>
        <span className="plane plane-2">✈️</span>
        <span className="globe globe-1">🌍</span>
        <span className="globe globe-2">🌎</span>
      </div>

      <div className="splash-glass-card">
        <div className="splash-brand">
          <div className="logo-glass">
            <img className="splash-logo-img" src={travioLogo} alt="Travio" />
          </div>

          <h1 className="splash-title">Travio</h1>
          <p className="splash-subtitle">Travel Your Way 🌍</p>
          <div className="splash-loading" />
        </div>
      </div>
    </div>
  );
}