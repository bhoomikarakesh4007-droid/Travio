import React from "react";
import { 
  Languages, 
  CircleDollarSign, 
  Clock, 
  Plane, 
  Wallet, 
  Bus, 
  ShieldCheck, 
  Phone, 
  CalendarDays, 
  Utensils, 
  Lightbulb,
  Sparkles
} from "lucide-react";
import "../styles/DestinationInfo.css";

export default function DestinationInfo({ destination }) {
  if (!destination) return null;

  const {
    city,
    about,
    bestTimeToVisit,
    language,
    currency,
    timezone,
    airport,
    averageDailyBudget,
    localTransport,
    safetyLevel,
    emergencyNumber,
    famousFoods = [],
    travelTips = []
  } = destination;

  return (
    <section className="destination-info-section details-reveal" aria-labelledby="dest-info-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">
            <Sparkles size={15} /> EXPLORE INTELLIGENCE
          </p>
          <h2 id="dest-info-title">Destination Information</h2>
        </div>
      </div>

      <div className="dest-info-grid">
        {/* Left Column: Narrative, Famous Foods, and Travel Tips */}
        <div className="dest-info-main-col">
          {/* About Section */}
          <div className="info-card glass about-card">
            <h3 className="card-title">About {city}</h3>
            <div className="about-text-content">
              {about && about.map((paragraph, index) => (
                <p key={index} className="about-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Famous Foods Section */}
          {famousFoods.length > 0 && (
            <div className="info-card glass food-card">
              <h3 className="card-title-with-icon">
                <Utensils size={18} className="title-icon-inline" />
                Famous Local Foods
              </h3>
              <p className="card-subtitle">Must-try culinary delights when visiting {city}:</p>
              <div className="food-chips-container">
                {famousFoods.map((food) => (
                  <div key={food} className="food-chip glass">
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips Section */}
          {travelTips.length > 0 && (
            <div className="info-card glass tips-card">
              <h3 className="card-title-with-icon">
                <Lightbulb size={18} className="title-icon-inline text-yellow" />
                Local Travel Tips
              </h3>
              <ul className="tips-list">
                {travelTips.map((tip, index) => (
                  <li key={index} className="tip-item">
                    <span className="tip-number">0{index + 1}</span>
                    <span className="tip-text">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Essential Travel Details Sidebar */}
        <div className="dest-info-sidebar-col">
          <div className="info-card glass sidebar-card">
            <h3 className="card-title">Essential Stats</h3>
            
            <div className="sidebar-stats-list">
              
              {/* Best Time to Visit */}
              {bestTimeToVisit && (
                <div className="stat-row">
                  <div className="stat-icon-wrapper">
                    <CalendarDays size={20} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Best Time to Visit</span>
                    <p className="stat-val">{bestTimeToVisit}</p>
                  </div>
                </div>
              )}

              {/* Language and Currency Grid */}
              {(language || currency) && (
                <div className="stat-row-half-grid">
                  {language && (
                    <div className="stat-row">
                      <div className="stat-icon-wrapper">
                        <Languages size={20} />
                      </div>
                      <div className="stat-data">
                        <span className="stat-label">Language</span>
                        <p className="stat-val">{language}</p>
                      </div>
                    </div>
                  )}

                  {currency && (
                    <div className="stat-row">
                      <div className="stat-icon-wrapper">
                        <CircleDollarSign size={20} />
                      </div>
                      <div className="stat-data">
                        <span className="stat-label">Currency</span>
                        <p className="stat-val">{currency}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Time Zone and Airport */}
              {(timezone || airport) && (
                <div className="stat-row-half-grid">
                  {timezone && (
                    <div className="stat-row">
                      <div className="stat-icon-wrapper">
                        <Clock size={20} />
                      </div>
                      <div className="stat-data">
                        <span className="stat-label">Time Zone</span>
                        <p className="stat-val">{timezone}</p>
                      </div>
                    </div>
                  )}

                  {airport && (
                    <div className="stat-row">
                      <div className="stat-icon-wrapper">
                        <Plane size={20} />
                      </div>
                      <div className="stat-data">
                        <span className="stat-label">Airport</span>
                        <p className="stat-val">{airport}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Average Daily Budget */}
              {averageDailyBudget && (
                <div className="stat-row">
                  <div className="stat-icon-wrapper">
                    <Wallet size={20} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Average Daily Budget</span>
                    <p className="stat-val">{averageDailyBudget}</p>
                  </div>
                </div>
              )}

              {/* Local Transport */}
              {localTransport && (
                <div className="stat-row">
                  <div className="stat-icon-wrapper">
                    <Bus size={20} />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Local Transport</span>
                    <p className="stat-val">{localTransport}</p>
                  </div>
                </div>
              )}

              {/* Safety Level */}
              {safetyLevel && (
                <div className="stat-row">
                  <div className="stat-icon-wrapper">
                    <ShieldCheck size={20} className="text-green" />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Safety Level</span>
                    <p className="stat-val">{safetyLevel}</p>
                  </div>
                </div>
              )}

              {/* Emergency Number */}
              {emergencyNumber && (
                <div className="stat-row">
                  <div className="stat-icon-wrapper">
                    <Phone size={20} className="text-red" />
                  </div>
                  <div className="stat-data">
                    <span className="stat-label">Emergency Numbers</span>
                    <p className="stat-val emergency-val">{emergencyNumber}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
