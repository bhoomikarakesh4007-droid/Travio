import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import "../styles/GalleryCarousel.css";

export default function GalleryCarousel({ images = [], destinationName = "destination" }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const hasImages = images.length > 0;
  const move = useCallback((direction) => setCurrent((previous) => (previous + direction + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (images.length < 2 || fullscreen) return undefined;
    const timer = window.setInterval(() => move(1), 5000);
    return () => window.clearInterval(timer);
  }, [images.length, fullscreen, move]);
  useEffect(() => {
    if (!fullscreen) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, move]);

  if (!hasImages) return <div className="gallery-empty">Photos for this destination are coming soon.</div>;

  return <>
    <div className="gallery" aria-roledescription="carousel" aria-label={`${destinationName} gallery`}>
      <div className="gallery-main">
        <img src={images[current]} alt={`${destinationName} gallery image ${current + 1}`} />
        <div className="gallery-scrim" />
        {images.length > 1 && <>
          <button className="gallery-btn left" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft size={22} /></button>
          <button className="gallery-btn right" onClick={() => move(1)} aria-label="Next photo"><ChevronRight size={22} /></button>
        </>}
        <button className="gallery-expand" onClick={() => setFullscreen(true)} aria-label="View photo fullscreen"><Expand size={18} /> View</button>
        <span className="gallery-count">{current + 1} / {images.length}</span>
      </div>
      <div className="gallery-thumbnails" role="tablist" aria-label="Choose a gallery photo">
        {images.map((image, index) => <button key={image} className={current === index ? "active" : ""} onClick={() => setCurrent(index)} role="tab" aria-selected={current === index} aria-label={`Show photo ${index + 1}`}><img src={image} alt="" /></button>)}
      </div>
    </div>
    {fullscreen && <div className="fullscreen-gallery" role="dialog" aria-modal="true" aria-label={`${destinationName} photo viewer`}>
      <button className="fullscreen-close" onClick={() => setFullscreen(false)} aria-label="Close fullscreen gallery"><X /></button>
      {images.length > 1 && <button className="fullscreen-nav previous" onClick={() => move(-1)} aria-label="Previous photo"><ChevronLeft /></button>}
      <img src={images[current]} alt={`${destinationName} gallery image ${current + 1}`} />
      {images.length > 1 && <button className="fullscreen-nav next" onClick={() => move(1)} aria-label="Next photo"><ChevronRight /></button>}
    </div>}
  </>;
}
