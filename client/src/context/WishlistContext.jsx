import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addWishlist, removeWishlist } from "../services/wishlistService";

const WishlistContext = createContext();

const normalizeId = (val) => {
    if (val === undefined || val === null || val === "") return "";
    if (typeof val === "object") {
        return String(val.id || val.slug || val.city || val.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    return String(val).toLowerCase().replace(/[^a-z0-9]/g, "");
};

const matchesWishlistItem = (item, target) => {
    if (!item || !target) return false;
    const targetKey = normalizeId(target);
    if (!targetKey) return false;

    const itemIdKey = normalizeId(item.id);
    const itemSlugKey = normalizeId(item.slug);
    const itemCityKey = normalizeId(item.city || item.name || item.title);

    return itemIdKey === targetKey || itemSlugKey === targetKey || itemCityKey === targetKey || item.id === target;
};

function WishlistProvider({ children }) {
    const { currentUser, profile } = useAuth();

    const [localWishlist, setLocalWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem("wishlist");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Optimistic active wishlist state for instant UI re-renders
    const [wishlistState, setWishlistState] = useState(() => {
        if (currentUser && profile && Array.isArray(profile.wishlist)) {
            return profile.wishlist;
        }
        try {
            const saved = localStorage.getItem("wishlist");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Keep active state synchronized with Firestore profile when updated
    useEffect(() => {
        if (currentUser && profile && Array.isArray(profile.wishlist)) {
            setWishlistState(profile.wishlist);
        } else {
            setWishlistState(localWishlist);
        }
    }, [currentUser, profile?.wishlist, localWishlist]);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(localWishlist));
    }, [localWishlist]);

    async function addToWishlist(destination) {
        if (!destination) return;
        const destId = destination.id || destination.slug || destination.city;
        if (!destId) return;

        const exists = wishlistState.some(item => matchesWishlistItem(item, destination));
        if (exists) return;

        setWishlistState(prev => [...prev, destination]);
        setLocalWishlist(prev => [...prev, destination]);

        if (currentUser?.uid) {
            try {
                await addWishlist(currentUser.uid, destination);
            } catch (err) {
                console.error("Error syncing addWishlist to Firestore:", err);
            }
        }
    }

    async function removeFromWishlist(id) {
        if (!id) return;

        // Immediately update React state for instant UI update
        setWishlistState(prev => prev.filter(item => !matchesWishlistItem(item, id)));
        setLocalWishlist(prev => prev.filter(item => !matchesWishlistItem(item, id)));

        if (currentUser?.uid) {
            try {
                const itemToRemove = wishlistState.find(item => matchesWishlistItem(item, id)) || (typeof id === "object" ? id : { id });
                await removeWishlist(currentUser.uid, itemToRemove);
            } catch (err) {
                console.error("Error syncing removeWishlist from Firestore:", err);
            }
        }
    }

    function isWishlisted(id) {
        return wishlistState.some(item => matchesWishlistItem(item, id));
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlist: wishlistState,
                addToWishlist,
                removeFromWishlist,
                isWishlisted
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export { WishlistProvider };

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
    return useContext(WishlistContext);
}


