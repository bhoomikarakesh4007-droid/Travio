import { useState } from "react";
import "../styles/SharePage.css";

export default function SharePage() {

const tripLink = "https://travio.app/mytrip/kyoto";
const [status, setStatus] = useState("");

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(tripLink);
    setStatus("Trip link copied to clipboard.");
  } catch {
    setStatus("Copy failed. Please copy the link manually.");
  }
};

const handleShareAction = (type) => {
  if (type === "email") {
    window.location.href = `mailto:?subject=Travio trip&body=Check out my trip: ${tripLink}`;
    setStatus("Email draft opened.");
    return;
  }

  if (type === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my trip: ${tripLink}`)}`, "_blank", "noopener,noreferrer");
    setStatus("WhatsApp opened.");
    return;
  }

  if (type === "instagram") {
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    setStatus("Instagram opened.");
    return;
  }

  setStatus("More sharing options coming soon.");
};

return(

<div className="share-page">

<div className="share-card">

<h1>

📤 Share Your Journey

</h1>

<p>

Invite your friends or family to view your personalized AI travel itinerary.

</p>

<div className="trip-preview">

<div className="trip-image">

🌸

</div>

<div className="trip-info">

<h2>

Kyoto, Japan

</h2>

<p>

7 Days • AI Generated Itinerary

</p>

<p>

Budget: ₹90,000

</p>

</div>

</div>

<div className="share-link">

<input

type="text"

readOnly

value={tripLink}

/>

<button

onClick={copyLink}

>

Copy Link

</button>
{status ? <p className="share-status">{status}</p> : null}

</div>

<div className="share-buttons">

<button onClick={() => handleShareAction("email")}>

📧 Email

</button>

<button onClick={() => handleShareAction("whatsapp")}>

📱 WhatsApp

</button>

<button onClick={() => handleShareAction("instagram")}>

📷 Instagram

</button>

<button onClick={() => handleShareAction("more")}>

🔗 More

</button>

</div>

<div className="qr-placeholder">

<div className="qr-box">

QR

</div>

<p>

QR Code (Coming Soon)

</p>

</div>

</div>

</div>

);

}