import { useNavigate } from "react-router-dom";
import { useTravelSession } from "../context/TravelSessionContext";
import { getDestinationsById } from "../data/destinationData";
import "../styles/TrendingSection.css";

export default function TrendingSection({ section }) {
  const navigate = useNavigate();
  const { setSelectedDestination } = useTravelSession();
  const destinations = getDestinationsById(section.destinationIds);

  function openDestination(destination) {
    setSelectedDestination(destination);
    navigate(`/destination/${destination.slug || destination.id}`);
  }

  return (
    <section className="trending-section" aria-labelledby={`${section.id}-heading`}>
      <div className="section-heading">
        <h2 id={`${section.id}-heading`}>{section.title}</h2>
        <p>{section.description}</p>
      </div>

      <div className="destination-grid">
        {destinations.map((destination) => (
          <article className="destination-card" key={destination.id}>
            <div className="image-wrapper">
              <img src={destination.hero} alt={destination.title} loading="lazy" />
              <div className="rating">Rating {destination.rating}</div>
              <div className="country-tag">{destination.country}</div>
            </div>

            <div className="destination-content">
              <h3>{destination.title}</h3>
              <p className="country">{destination.country}</p>
              <div className="bottom-row">
                <span>{destination.budget} budget</span>
                <button onClick={() => openDestination(destination)}>Explore</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
