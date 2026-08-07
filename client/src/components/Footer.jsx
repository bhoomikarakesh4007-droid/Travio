import { Link } from "react-router-dom";

import "../styles/Footer.css";

import travioLogo from "../assets/images/travio-logo.png";


export default function Footer(){

const year = new Date().getFullYear();


return(

<footer className="footer">


<div className="footer-glass">


<div className="footer-brand">


<img
src={travioLogo}
alt="Travio"
/>


<h2>
Travio
</h2>


<p>
Travel Your Way
</p>


</div>




<div className="footer-links">


<div>

<h4>
Explore
</h4>


<Link to="/preferences">
Destinations
</Link>


<Link to="/itinerary">
Trips
</Link>


<Link to="/packing">
Packing
</Link>


</div>





<div>

<h4>
AI Services
</h4>


<Link to="/atlas">
Atlas
</Link>


<Link to="/preferences">
AI Planner
</Link>


<Link to="/results">
Recommendations
</Link>


</div>





<div>

<h4>
Support
</h4>


<Link to="/profile">
Profile
</Link>


<Link to="/wishlist">
Wishlist
</Link>


<Link to="/home">
Help Center
</Link>


</div>



</div>





<div className="footer-bottom">


<p>
© {year} Travio
</p>


<span>
Built with ❤️ for Travelers Worldwide
</span>


</div>


</div>


</footer>

);

}