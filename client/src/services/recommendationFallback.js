import destinationData from "../data/destinationData";
import { calculateDestinationMatches } from "./matchingService";

export function getLocalRecommendations(preferences = {}) {
  // Map parameters into matchingService compatible profile
  const normalizedProfile = {
    tripType: preferences.travelStyle || preferences.tripType || "Relaxation",
    companions: preferences.companions || "Solo",
    budget: preferences.budget || "Comfort",
    season: preferences.season || "Spring",
    duration: preferences.duration || "5-7 Days",
    activityDetail: preferences.activityDetail || "",
    companionDetail: preferences.companionDetail || "",
    lodgingStyle: preferences.lodgingStyle || "Boutique Hotels",
    crowdLevel: preferences.crowdLevel || preferences.crowd || "Balanced",
    transportPreference: preferences.transportPreference || "Public Transit",
    interests: preferences.interests || []
  };

  // Run dynamic matching engine and return top 4
  return calculateDestinationMatches(normalizedProfile).slice(0, 4);
}

