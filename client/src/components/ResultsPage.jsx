import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import { useTravelSession } from "../context/TravelSessionContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { resolveDestination } from "../data/destinationData";
import { calculateBudgetBreakdown } from "../services/travelPlannerService";
import "../styles/ResultsPage.css";

function getMatchExplanation(place, userPrefs) {
  const tripType = userPrefs.tripType || "Relaxation";
  const season = userPrefs.season || "Spring";
  const budget = userPrefs.budget || "Comfort";

  if (userPrefs.crowdLevel && userPrefs.crowdLevel.toLowerCase().includes("quiet") && (tripType.toLowerCase() === "nature" || (userPrefs.interests && userPrefs.interests.includes("Nature")))) {
    return "Recommended because you prefer quiet places with nature.";
  }

  if (tripType.toLowerCase() === "luxury" || budget === "Luxury" || place.budget === "Luxury") {
    return "Recommended because this destination offers luxury experiences.";
  }

  const reasons = [];
  if (tripType) reasons.push(tripType.toLowerCase());
  if (season) reasons.push(`${season.toLowerCase()} travel`);
  if (userPrefs.activityDetail) reasons.push(userPrefs.activityDetail.toLowerCase());

  if (reasons.length > 0) {
    const formatted = reasons.slice(0, 3).join(", ").replace(/,([^,]*)$/, " and$1");
    return `Recommended because you enjoy ${formatted}.`;
  }

  if (userPrefs.duration) {
    return "Recommended because it fits your travel duration.";
  }

  return "Recommended because your budget matches this destination.";
}

export default function ResultsPage(){


const navigate = useNavigate();
const [showAll, setShowAll] = useState(false);


const {
recommendations,
recommendationMessage,
setSelectedDestination,
travelerPersonality
}=useTravelSession();

const { wishlist, addToWishlist }=useWishlist();


const {
currentUser
}=useAuth();

const rawRecommendations = (Array.isArray(recommendations) && recommendations.length > 0)
  ? recommendations
  : Object.values(destinationData);

const validRecommendations = rawRecommendations
  .map((place) => ({ place, destination: resolveDestination(place) }))
  .filter(({ destination }) => Boolean(destination));

const visibleRecommendations = showAll ? validRecommendations : validRecommendations.slice(0, 4);





async function save(place){


if(!currentUser){

alert("Please login first.");

return;

}



const destination =
resolveDestination(place);



if(!destination){

alert("Destination not found");

return;

}



const savedDestination = {
...destination,
...place,
id: destination.id,
slug: destination.slug,
title: destination.title,
country: destination.country
};

if (wishlist.some((item) => item.id === destination.id)) {
alert("Already in your Wishlist.");
return;
}

await addToWishlist(savedDestination);



alert("Added to Wishlist ❤️");


}






function openDetails(place){
const destination = resolveDestination(place);
if(!destination){
  return;
}
setSelectedDestination({
  ...destination,
  ...place,
  id: destination.id,
  slug: destination.slug || destination.id,
  title: destination.title,
  country: destination.country
});
navigate(`/destination/${destination.slug || destination.id}`);
}






if(validRecommendations.length===0){


return(

<div className="results-page">


<Navbar/>


<div className="empty-results">


<h1>
✨ No Recommendations Yet
</h1>


<p>
Generate your trip preferences first.
</p>


<NavLink to="/preferences">
Start Planning
</NavLink>


</div>


</div>

);

}





return(


<div className="results-page">


<Navbar/>




<div className="results-container">

{travelerPersonality && (
  <div className="personality-glass-card">
    <div className="personality-badge">✨ Your Travel Personality</div>
    <div className="personality-main">
      <span className="personality-emoji" role="img" aria-label={travelerPersonality.name}>{travelerPersonality.emoji}</span>
      <h2 className="personality-name">{travelerPersonality.name}</h2>
    </div>
    <p className="personality-description">
      "{travelerPersonality.description}"
    </p>
  </div>
)}

<h1>
✨ AI Recommended Destinations
</h1>



<p>
Personalized destinations based on your preferences.
</p>

{recommendationMessage && <p className="recommendation-fallback" role="status">{recommendationMessage}</p>}





<div className="results-grid">



{
        visibleRecommendations.map(({ place, destination }, index) => {
          const userPrefs = JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
          const budgetLevel = userPrefs.budget || "Comfort";
          const travelers = userPrefs.companions === "Solo" ? 1 : userPrefs.companions === "Partner" ? 2 : 4;
          const duration = userPrefs.duration || "5-7 Days";
          
          const costs = calculateBudgetBreakdown(place.id, budgetLevel, travelers, duration);

          return (
            <div className="premium-card" key={index}>
              <img src={destination?.hero} alt={place.title} className="premium-image" loading="lazy" />
              
              <div className="match-badge">
                {place.match || 90}% Match
              </div>

              <div className="premium-content">
                <p className="card-short-explanation" style={{ margin: "0 0 14px 0", fontSize: "13.5px", color: "#2563EB", fontWeight: "600", lineHeight: "1.45" }}>
                  {getMatchExplanation(place, userPrefs)}
                </p>
                <h2>{place.title}</h2>
                <h4>{place.country}</h4>
                <p>{place.description}</p>

                {place.whyItMatches && (
                  <div className="card-match-reason">
                    <strong>Why it matches you:</strong>
                    <p>{place.whyItMatches}</p>
                  </div>
                )}

                <div className="premium-metrics">
                  <div className="metric-item">
                    <span>✈️ Flight Cost</span>
                    <strong>${costs.flightCost}</strong>
                  </div>
                  <div className="metric-item">
                    <span>🏨 Hotel Cost</span>
                    <strong>${costs.hotelCost}</strong>
                  </div>
                  <div className="metric-item">
                    <span>💳 Daily Budget</span>
                    <strong>{destination?.averageDailyBudget ? destination.averageDailyBudget.split(" ")[0] : "$100"}</strong>
                  </div>
                  <div className="metric-item">
                    <span>⏱️ Trip Length</span>
                    <strong>{duration}</strong>
                  </div>
                </div>

                <div className="premium-info">
                  <div>💰 {place.budget} Tier</div>
                  <div>🌸 {place.bestSeason || "All Year"}</div>
                </div>

                <div className="premium-buttons">
                  <button className="wishlist" onClick={() => save(place)}>
                    ❤️ Save
                  </button>
                  <button className="details" onClick={() => openDetails(place)}>
                    View Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })
      }

      {!showAll && validRecommendations.length > 4 && (
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            onClick={() => setShowAll(true)}
            style={{
              padding: "16px 36px",
              border: "none",
              background: "#2563EB",
              color: "white",
              borderRadius: "16px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "16px",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#1D4ED8";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#2563EB";
              e.target.style.transform = "none";
            }}
          >
            Show More Destinations
          </button>
        </div>
      )}



</div>



</div>



</div>


);


}
