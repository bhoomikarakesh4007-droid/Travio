import "../styles/LoadingPage.css";
import travioLogo from "../assets/images/travio-logo.png";

export default function LoadingPage() {

return(

<div className="loading-page">

<img
src={travioLogo}
alt="Travio"
className="loading-logo"
/>

<h2>

Preparing your journey...

</h2>

<div className="loading-bar">

<div className="loading-progress"></div>

</div>

</div>

);

}