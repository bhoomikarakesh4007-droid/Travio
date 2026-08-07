import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firebase";

function existingWishlist(data) {
  return Array.isArray(data?.wishlist) ? data.wishlist : [];
}

const normalizeId = (val) => {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "object") {
    return String(val.id || val.slug || val.city || val.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  return String(val).toLowerCase().replace(/[^a-z0-9]/g, "");
};

const matchesItem = (savedItem, target) => {
  if (!savedItem || !target) return false;
  const targetKey = normalizeId(target);
  if (!targetKey) return false;

  const itemIdKey = normalizeId(savedItem.id);
  const itemSlugKey = normalizeId(savedItem.slug);
  const itemCityKey = normalizeId(savedItem.city || savedItem.name || savedItem.title);

  return itemIdKey === targetKey || itemSlugKey === targetKey || itemCityKey === targetKey || savedItem.id === target;
};

export async function addWishlist(uid, destination) {
  if (!uid) throw new Error("You must be signed in to save destinations.");
  if (!destination) return;
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error("Your traveler profile is not ready yet.");
    const wishlist = existingWishlist(snapshot.data());

    if (wishlist.some((savedItem) => matchesItem(savedItem, destination))) return;

    transaction.update(ref, {
      wishlist: [...wishlist, destination],
      wishlistCount: wishlist.length + 1,
    });
  });
}

export async function removeWishlist(uid, destination) {
  if (!uid) throw new Error("You must be signed in to remove destinations.");
  if (!destination) return;
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) return;

    const wishlist = existingWishlist(snapshot.data());
    const updatedWishlist = wishlist.filter((savedItem) => !matchesItem(savedItem, destination));
    transaction.update(ref, {
      wishlist: updatedWishlist,
      wishlistCount: updatedWishlist.length,
    });
  });
}

export async function loadWishlist(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? existingWishlist(snap.data()) : [];
}

export const addToWishlist = addWishlist;
export const removeFromWishlist = removeWishlist;
export const getWishlist = loadWishlist;

