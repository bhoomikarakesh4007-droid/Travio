import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const TravelSessionContext = createContext();

function TravelSessionProvider({ children }) {
    const { currentUser, profile } = useAuth();

    const [recommendations, setRecommendations] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("travio_recommendations")) || [];
        } catch {
            return [];
        }
    });

    const [recommendationMessage, setRecommendationMessage] = useState("");

    const [selectedDestination, setSelectedDestination] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("travio_selected_destination")) || null;
        } catch {
            return null;
        }
    });

    const [travelerPersonality, setTravelerPersonality] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("travio_personality")) || null;
        } catch {
            return null;
        }
    });

    // The profile is kept current by a Firestore listener in AuthContext.
    // Deriving the list here makes wishlist changes live across pages and tabs.
    const wishlist = currentUser && Array.isArray(profile?.wishlist) ? profile.wishlist : [];

    useEffect(() => {
        sessionStorage.setItem("travio_recommendations", JSON.stringify(recommendations));
    }, [recommendations]);

    useEffect(() => {
        if (selectedDestination) {
            sessionStorage.setItem("travio_selected_destination", JSON.stringify(selectedDestination));
        } else {
            sessionStorage.removeItem("travio_selected_destination");
        }
    }, [selectedDestination]);

    useEffect(() => {
        if (travelerPersonality) {
            sessionStorage.setItem("travio_personality", JSON.stringify(travelerPersonality));
        } else {
            sessionStorage.removeItem("travio_personality");
        }
    }, [travelerPersonality]);

    const [localCustomAttractions, setLocalCustomAttractions] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("travio_custom_attractions")) || {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        sessionStorage.setItem("travio_custom_attractions", JSON.stringify(localCustomAttractions));
    }, [localCustomAttractions]);

    const customAttractions = currentUser && profile?.customAttractions && typeof profile.customAttractions === "object"
        ? profile.customAttractions
        : localCustomAttractions;

    const addAttractionToItinerary = (destinationId, attraction) => {
        if (!destinationId || !attraction || !attraction.name) return false;

        const existingList = customAttractions[destinationId] || [];
        if (existingList.some(item => item.name === attraction.name)) {
            return false;
        }

        setLocalCustomAttractions(prev => {
            const currentList = prev[destinationId] || [];
            if (currentList.some(item => item.name === attraction.name)) {
                return prev;
            }
            return {
                ...prev,
                [destinationId]: [...currentList, attraction]
            };
        });

        if (currentUser?.uid) {
            import("../services/itineraryService").then(({ addCustomAttraction }) => {
                addCustomAttraction(currentUser.uid, destinationId, attraction)
                    .catch(err => console.error("Firestore sync error:", err));
            });
        }

        return true;
    };

    const removeAttractionFromItinerary = (destinationId, attractionName) => {
        if (!destinationId || !attractionName) return false;

        setLocalCustomAttractions(prev => {
            const currentList = prev[destinationId] || [];
            return {
                ...prev,
                [destinationId]: currentList.filter(item => item.name !== attractionName)
            };
        });

        return true;
    };

    return (

        <TravelSessionContext.Provider
            value={{
                recommendations,
                setRecommendations,

                recommendationMessage,
                setRecommendationMessage,

                selectedDestination,
                setSelectedDestination,

                wishlist,

                travelerPersonality,
                setTravelerPersonality,

                customAttractions,
                addAttractionToItinerary,
                removeAttractionFromItinerary
            }}
        >

            {children}

        </TravelSessionContext.Provider>

    );

}

export { TravelSessionProvider };

// eslint-disable-next-line react-refresh/only-export-components
export function useTravelSession(){

    return useContext(TravelSessionContext);

}
