import { useState } from "react";
import "../styles/TravelChallenge.css";

export default function TravelChallenge({ destination }) {
  const [completed, setCompleted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleComplete = () => {
    if (!completed) {
      setCompleted(true);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1500);
    }
  };

  const challengeTitle = destination?.challengeTitle || "Destination Challenge";
  const challengeDescription = destination?.challengeDescription;
  const rewardName = destination?.rewardName;
  const rewardEmoji = destination?.rewardEmoji || "🎖";

  if (!challengeDescription) return null;

  return (
    <section className={`travel-challenge-section details-reveal ${completed ? "completed-state" : ""}`}>
      <div className="challenge-card">
        {showAnimation && (
          <div className="confetti-animation">
            ✨ Success! Challenge Completed! ✨
          </div>
        )}
        
        <div className="challenge-header">
          <span className="challenge-trophy" role="img" aria-label="Trophy">🏆</span>
          <h2>{challengeTitle}</h2>
        </div>

        <p className="challenge-desc">{challengeDescription}</p>

        <div className="reward-container">
          <div className="reward-badge-header">
            <span className="reward-badge-icon" role="img" aria-label="Badge">🎖</span>
            <span>Reward Badge</span>
          </div>
          <div className="reward-display">
            <span className="reward-emoji" role="img" aria-label={rewardName}>{rewardEmoji}</span>
            <span className="reward-name">{rewardName}</span>
          </div>
        </div>

        <button 
          className={`challenge-btn ${completed ? "completed" : ""}`} 
          onClick={handleComplete}
          disabled={completed}
        >
          {completed ? "Completed ✓" : "Mark as Completed"}
        </button>
      </div>
    </section>
  );
}
