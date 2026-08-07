import { useState, useEffect, useRef, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";


import "../styles/Navbar.css";

import travioLogo from "../assets/images/travio-logo.png";
import destinationData, { resolveDestination } from "../data/destinationData";
import { useTravelSession } from "../context/TravelSessionContext";
import { useTravel } from "../context/TravelContext";

const links = [
    {
        name: "Home",
        path: "/home"
    },
    {
        name: "Itinerary",
        path: "/itinerary"
    },
    {
        name: "Packing",
        path: "/packing"
    },
    {
        name: "Atlas",
        path: "/atlas"
    }
];

export default function Navbar(){
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedDestination, setSelectedDestination } = useTravelSession();
    const { departureCity, setShowDepartureModal, checkDepartureCity } = useTravel();
    const destination = selectedDestination ? resolveDestination(selectedDestination) : null;
    const isHomePage = location.pathname === "/home" || location.pathname === "/";
    
    useEffect(() => {
        if (location.pathname !== "/" && location.pathname !== "/login") {
            checkDepartureCity();
        }
    }, [location.pathname, checkDepartureCity]);

    // Search Overlay state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);

    const allDestinations = useMemo(() => {
        return Object.values(destinationData);
    }, []);

    const filteredDestinations = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            return allDestinations;
        }
        return allDestinations.filter(
            (dest) =>
                dest.city.toLowerCase().includes(query) ||
                dest.country.toLowerCase().includes(query)
        );
    }, [searchQuery, allDestinations]);

    // Reset active index when filtered list changes
    useEffect(() => {
        setTimeout(() => {
            setActiveIndex(0);
        }, 0);
    }, [filteredDestinations]);

    // Handle input focus on open
    useEffect(() => {
        if (isSearchOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isSearchOpen]);

    // Keyboard controls inside input
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            setIsSearchOpen(false);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (filteredDestinations.length > 0) {
                setActiveIndex((prev) => (prev + 1) % filteredDestinations.length);
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (filteredDestinations.length > 0) {
                setActiveIndex((prev) => (prev - 1 + filteredDestinations.length) % filteredDestinations.length);
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredDestinations.length > 0 && filteredDestinations[activeIndex]) {
                handleSelect(filteredDestinations[activeIndex]);
            }
        }
    };

    // Close modal on escape globally
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.key === "Escape" && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [isSearchOpen]);

    const handleSelect = (dest) => {
        setSelectedDestination(dest);
        setIsSearchOpen(false);
        setSearchQuery("");
        navigate(`/destination/${dest.slug || dest.id}`);
    };

    const visibleLinks = useMemo(() => {
        if (isHomePage) {
            return links.filter((link) => link.path === "/atlas");
        }
        if (destination !== null) {
            return links;
        }
        return links.filter((link) => link.path === "/atlas");
    }, [isHomePage, destination]);


    return(

        <nav className="navbar">


            <NavLink
                to="/home"
                className="navbar-left"
            >

                <img
                    src={travioLogo}
                    alt="Travio"
                    className="navbar-logo"
                />


                <div className="navbar-brand">

                    <h2>
                        Travio
                    </h2>

                    <p>
                        Travel Your Way
                    </p>

                </div>


            </NavLink>





            <div className="navbar-menu">


                {
                    visibleLinks.map((link)=>(

                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({isActive})=>
                                isActive
                                ?
                                "nav-item active"
                                :
                                "nav-item"
                            }
                        >

                            {link.name}

                        </NavLink>

                    ))
                }




                {destination && !isHomePage && (
                    <div 
                        className="active-destination-indicator" 
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "13px", 
                            fontWeight: "700", 
                            color: "#2563EB", 
                            background: "rgba(37, 99, 235, 0.08)", 
                            padding: "6px 14px", 
                            borderRadius: "20px", 
                            marginRight: "10px",
                            border: "1px solid rgba(37, 99, 235, 0.15)",
                            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.05)"
                        }}
                    >
                        <span>📍</span>
                        <span>{destination.city}</span>
                    </div>
                )}

                {departureCity ? (
                    <div 
                        className="departure-location-indicator" 
                        onClick={() => setShowDepartureModal(true)}
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "13px", 
                            fontWeight: "700", 
                            color: "#059669", 
                            background: "rgba(16, 185, 129, 0.08)", 
                            padding: "6px 14px", 
                            borderRadius: "20px", 
                            marginRight: "10px",
                            border: "1px solid rgba(16, 185, 129, 0.15)",
                            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.05)",
                            cursor: "pointer"
                        }}
                    >
                        <span>🛫</span>
                        <span>From: {departureCity.name}</span>
                    </div>
                ) : (
                    <button 
                        className="set-departure-btn" 
                        onClick={() => setShowDepartureModal(true)}
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "13px", 
                            fontWeight: "700", 
                            color: "#d97706", 
                            background: "rgba(245, 158, 11, 0.08)", 
                            padding: "6px 14px", 
                            borderRadius: "20px", 
                            marginRight: "10px",
                            border: "1px solid rgba(245, 158, 11, 0.15)",
                            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.05)",
                            cursor: "pointer"
                        }}
                    >
                        <span>🛫</span>
                        <span>Set Origin</span>
                    </button>
                )}

                <button
                    className="search-navbar-btn"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Search destinations"
                >
                    🔍
                </button>

                <NavLink
                    to="/profile"
                    className="profile-circle"
                    aria-label="Profile"
                >

                    👤

                </NavLink>


            </div>

            {isSearchOpen && (
                <div 
                    className="search-overlay" 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsSearchOpen(false);
                    }}
                >
                    <div className="search-modal">
                        <div className="search-header">
                            <span className="search-icon-inside">🔍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search by city or country..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button 
                                className="search-close-btn"
                                onClick={() => setIsSearchOpen(false)}
                                aria-label="Close search"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="search-results">
                            {filteredDestinations.length > 0 ? (
                                filteredDestinations.map((dest, index) => (
                                    <div
                                        key={dest.id}
                                        className={`search-result-item ${index === activeIndex ? "active" : ""}`}
                                        onClick={() => handleSelect(dest)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <img src={dest.hero} alt={dest.title} className="result-thumb" />
                                        <div className="result-info">
                                            <span className="result-city">{dest.city}</span>
                                            <span className="result-country">{dest.country}</span>
                                        </div>
                                        <span className="result-arrow">&rarr;</span>
                                    </div>
                                ))
                            ) : (
                                <div className="search-empty">
                                    <p>No destinations found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


        </nav>

    );

}
