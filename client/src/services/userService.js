import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const USERS_COLLECTION = "users";

function displayNameFor(user, passengerName) {
  return passengerName || user.displayName || user.email?.split("@")[0] || "Traveler";
}

export function normalizeUserProfile(data = {}, user = null) {
  const wishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
  const plannedTrips = Array.isArray(data.plannedTrips) ? data.plannedTrips : [];
  const completedTrips = Array.isArray(data.completedTrips) ? data.completedTrips : [];
  const customAttractions = data.customAttractions && typeof data.customAttractions === "object" ? data.customAttractions : {};

  return {
    name: data.name || displayNameFor(user || {}),
    email: data.email || user?.email || "",
    photo: data.photo || user?.photoURL || "",
    createdAt: data.createdAt || null,
    wishlistCount: Number.isFinite(data.wishlistCount) ? data.wishlistCount : wishlist.length,
    tripsCount: Number.isFinite(data.tripsCount)
      ? data.tripsCount
      : plannedTrips.length + completedTrips.length,
    preferences: data.preferences && typeof data.preferences === "object" ? data.preferences : {},
    wishlist,
    customAttractions,
  };
}

// Creates the canonical profile for new accounts and fills in missing fields for
// older documents without replacing profile data that the user has already saved.
export async function createUserDocument(user, passengerName = "") {
  if (!user?.uid) return null;

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const profile = {
      name: displayNameFor(user, passengerName),
      email: user.email || "",
      photo: user.photoURL || "",
      createdAt: serverTimestamp(),
      wishlistCount: 0,
      tripsCount: 0,
      preferences: {},
      // Kept for the existing wishlist feature; counts are the profile summary.
      wishlist: [],
    };

    await setDoc(userRef, profile);
    return normalizeUserProfile(profile, user);
  }

  const existing = snapshot.data();
  const updates = {};

  if (!existing.name && (passengerName || user.displayName || user.email)) {
    updates.name = displayNameFor(user, passengerName);
  }
  if (user.email && existing.email !== user.email) updates.email = user.email;
  if (!existing.photo && user.photoURL) updates.photo = user.photoURL;
  if (!existing.createdAt) updates.createdAt = serverTimestamp();
  if (!Number.isFinite(existing.wishlistCount)) {
    updates.wishlistCount = Array.isArray(existing.wishlist) ? existing.wishlist.length : 0;
  }
  if (!Number.isFinite(existing.tripsCount)) {
    const planned = Array.isArray(existing.plannedTrips) ? existing.plannedTrips.length : 0;
    const completed = Array.isArray(existing.completedTrips) ? existing.completedTrips.length : 0;
    updates.tripsCount = planned + completed;
  }
  if (!existing.preferences || typeof existing.preferences !== "object") {
    updates.preferences = {};
  }

  if (Object.keys(updates).length) {
    await setDoc(userRef, updates, { merge: true });
  }

  return normalizeUserProfile({ ...existing, ...updates }, user);
}

export async function loadUserProfile(user) {
  if (!user?.uid) return null;

  await createUserDocument(user);
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  return snapshot.exists() ? normalizeUserProfile(snapshot.data(), user) : null;
}

export function subscribeToUserProfile(user, onProfile, onError) {
  if (!user?.uid) return () => {};

  return onSnapshot(
    doc(db, USERS_COLLECTION, user.uid),
    (snapshot) => onProfile(snapshot.exists() ? normalizeUserProfile(snapshot.data(), user) : null),
    onError,
  );
}
