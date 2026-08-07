import React from "react";
import { 
  CircleDollarSign, 
  Languages, 
  Clock, 
  PhoneCall, 
  Zap, 
  Wifi, 
  Bus, 
  Globe,
  ShieldCheck
} from "lucide-react";

export default function LocalInfoCard({ localInfo, destination }) {
  if (!localInfo) return null;

  // Retrieve Timezone and Visa guidelines safely
  const timezoneVal = destination?.timezone || "Local Time Zone";
  const visaText = "Visa rules vary by nationality. Most tourists can enter visa-free or obtain a visa on arrival for stays up to 30 to 90 days. Please check official government portals before departure.";

  // Define the 8 premium cards with category titles, descriptions, icons, gradients, and dynamic values
  const guideCards = [
    {
      icon: CircleDollarSign,
      title: "Currency",
      shortDesc: "Payment & Cash Customs",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      info: (
        <>
          <strong style={{ display: "block", fontSize: "1.05rem", color: "#1E293B", marginBottom: "6px" }}>
            {localInfo.currency}
          </strong>
          <span style={{ fontSize: "0.86rem", color: "#64748B", lineHeight: "1.5" }}>
            {localInfo.payment}
          </span>
        </>
      )
    },
    {
      icon: Languages,
      title: "Language",
      shortDesc: "Communication Standards",
      gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
      info: (
        <>
          <strong style={{ display: "block", fontSize: "1.05rem", color: "#1E293B", marginBottom: "6px" }}>
            {localInfo.language}
          </strong>
          <span style={{ fontSize: "0.86rem", color: "#64748B", lineHeight: "1.5" }}>
            English is widely understood in tourist hubs, hotels, and major transport centers.
          </span>
        </>
      )
    },
    {
      icon: Clock,
      title: "Timezone",
      shortDesc: "Standard Local Time",
      gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
      info: (
        <>
          <strong style={{ display: "block", fontSize: "1.05rem", color: "#1E293B", marginBottom: "6px" }}>
            {timezoneVal}
          </strong>
          <span style={{ fontSize: "0.86rem", color: "#64748B", lineHeight: "1.5" }}>
            Please coordinate your flights, schedules, and hotel check-in times accordingly.
          </span>
        </>
      )
    },
    {
      icon: PhoneCall,
      title: "Emergency Numbers",
      shortDesc: "Local Services Directory",
      gradient: "linear-gradient(135deg, #EF4444, #DC2626)",
      info: (
        <>
          <strong style={{ display: "block", fontSize: "1.05rem", color: "#1E293B", marginBottom: "6px" }}>
            {localInfo.emergencyNumber}
          </strong>
          <span style={{ fontSize: "0.86rem", color: "#64748B", lineHeight: "1.5" }}>
            Dial free from any local phone for police, medical assistance, or fire services.
          </span>
        </>
      )
    },
    {
      icon: Zap,
      title: "Power Plug",
      shortDesc: "Electricity & Voltage",
      gradient: "linear-gradient(135deg, #06B6D4, #0891B2)",
      info: (
        <>
          <strong style={{ display: "block", fontSize: "1.05rem", color: "#1E293B", marginBottom: "6px" }}>
            {localInfo.powerPlug}
          </strong>
          <span style={{ fontSize: "0.86rem", color: "#64748B", lineHeight: "1.5" }}>
            Check plug shapes and pack a universal travel adapter to keep your devices charged.
          </span>
        </>
      )
    },
    {
      icon: Wifi,
      title: "Internet",
      shortDesc: "Network & Connectivity",
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
      info: (
        <>
          <span style={{ fontSize: "0.86rem", color: "#475569", lineHeight: "1.5" }}>
            {localInfo.internet}
          </span>
        </>
      )
    },
    {
      icon: Bus,
      title: "Transport",
      shortDesc: "Public Transit & Taxis",
      gradient: "linear-gradient(135deg, #6366F1, #4F46E5)",
      info: (
        <>
          <span style={{ display: "block", fontSize: "0.86rem", color: "#475569", lineHeight: "1.5", marginBottom: "8px" }}>
            {localInfo.publicTransitDetail}
          </span>
          <span style={{ display: "block", fontSize: "0.82rem", color: "#64748B" }}>
            <strong>Taxi Apps:</strong> {localInfo.taxiApps}
          </span>
        </>
      )
    },
    {
      icon: Globe,
      title: "Visa Guidelines",
      shortDesc: "Entry & Border Regulations",
      gradient: "linear-gradient(135deg, #EC4899, #D946EF)",
      info: (
        <>
          <span style={{ fontSize: "0.86rem", color: "#475569", lineHeight: "1.5" }}>
            {visaText}
          </span>
        </>
      )
    }
  ];

  // Dynamically append Safety Level card if present in destination database
  if (destination?.safetyLevel) {
    guideCards.push({
      icon: ShieldCheck,
      title: "Safety Level",
      shortDesc: "Local Security Index",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      info: (
        <>
          <span style={{ fontSize: "0.86rem", color: "#475569", lineHeight: "1.5" }}>
            {destination.safetyLevel}
          </span>
        </>
      )
    });
  }

  return (
    <div className="travel-guide-grid">
      {guideCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div className="travel-guide-premium-card" key={idx}>
            <div className="guide-card-top">
              <div 
                className="guide-icon-box" 
                style={{ background: card.gradient }}
              >
                <Icon size={20} color="#FFFFFF" />
              </div>
              <div className="guide-card-title-block">
                <h4 className="guide-card-title">{card.title}</h4>
                <span className="guide-card-short-desc">{card.shortDesc}</span>
              </div>
            </div>
            
            <div className="guide-card-info-text">
              {card.info}
            </div>
          </div>
        );
      })}
    </div>
  );
}
