import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import Navbar from "./Navbar";
import "../styles/WishlistPage.css";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState(null);
  const [message, setMessage] = useState("");

  async function remove(item) {
    const targetId = item.id || item.slug || item;
    if (!targetId || removingId === targetId) return;

    setRemovingId(targetId);
    setMessage("");
    try {
      await removeFromWishlist(targetId);
    } catch {
      setMessage("We couldn't remove this destination. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="wishlist-page">
      <Navbar />
      <div className="wishlist-container">
        <h1>❤️ My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div>
            <p>No destinations saved yet.</p>
            <button onClick={() => navigate("/results")}>Back to Explore</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <article className="wishlist-card" key={item.id}>
                <img src={item.hero || item.image || item.cover} alt={item.title || item.name} loading="lazy" />
                <h3>{item.title || item.name}</h3>
                <p>{item.country}</p>
                <button
                  className="remove-wishlist"
                  onClick={() => remove(item)}
                  disabled={removingId === item.id}
                >
                  {removingId === item.id ? "Removing…" : "Remove"}
                </button>
              </article>
            ))}
          </div>
        )}

        {message && <p className="wishlist-message" role="status">{message}</p>}
      </div>
    </div>
  );
}
