import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firebase";

function existingCustomAttractions(data) {
  return data?.customAttractions && typeof data.customAttractions === "object"
    ? data.customAttractions
    : {};
}

export async function addCustomAttraction(uid, destinationId, attraction) {
  if (!uid) throw new Error("You must be signed in to save attractions.");
  if (!destinationId) throw new Error("Destination ID is required.");
  if (!attraction?.name) throw new Error("Attraction name is required.");

  const ref = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error("Your traveler profile is not ready yet.");
    
    const customAttractions = existingCustomAttractions(snapshot.data());
    const destAttractions = Array.isArray(customAttractions[destinationId])
      ? customAttractions[destinationId]
      : [];

    if (destAttractions.some((item) => item.name === attraction.name)) return;

    const updatedDestAttractions = [...destAttractions, attraction];
    const updatedCustomAttractions = {
      ...customAttractions,
      [destinationId]: updatedDestAttractions
    };

    transaction.update(ref, {
      customAttractions: updatedCustomAttractions
    });
  });
}
