import { useEffect, useMemo, useState } from "react";
import { 
  AlertCircle, 
  CalendarDays, 
  CircleDollarSign, 
  Clock, 
  Globe, 
  Languages, 
  Lightbulb, 
  MapPin, 
  Plane, 
  Sparkles,
  Heart,
  Share2,
  FileDown,
  Utensils,
  ShieldCheck,
  Phone,
  CloudSun,
  Wallet,
  Hotel,
  Compass,
  Users
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import GalleryCarousel from "./GalleryCarousel";
import HeroSection from "./HeroSection";
import TravelMap from "./TravelMap";
import RoutePlanner from "./RoutePlanner";
import WeatherCard from "./WeatherCard";
import TravelChallenge from "./TravelChallenge";
import { useTravelSession } from "../context/TravelSessionContext";
import { useWishlist } from "../context/WishlistContext";
import { calculateDestinationMatches } from "../services/matchingService";
import { resolveDestination } from "../data/destinationData";
import { fetchWeather } from "../services/weatherService";
import { fetchHotels } from "../services/hotelService";
import { fetchRestaurants } from "../services/restaurantService";
import { fetchFlights } from "../services/flightService";
import { useTravel } from "../context/TravelContext";
import { formatPrice, formatDualPrice, getCurrencyCodeFromString, convertUSD } from "../services/currencyService";
import "../styles/DetailsPage.css";

// Planner Subcomponents
import TripOverviewCard from "./planner/TripOverviewCard";
import HotelCard from "./planner/HotelCard";
import RestaurantCard from "./planner/RestaurantCard";
import BudgetCard from "./planner/BudgetCard";
import AttractionCard from "./planner/AttractionCard";
import TravelTipsCard from "./planner/TravelTipsCard";
import LocalInfoCard from "./planner/LocalInfoCard";
import HotelDetailsModal from "./planner/HotelDetailsModal";

// Planner Services
import { 
  getFlightOptions, 
  getHotelOptions, 
  getRestaurantOptions, 
  calculateBudgetBreakdown,
  getAttractionOptions,
  getDailySchedule,
  getLocalInfo,
  getPersonalizedTips
} from "../services/travelPlannerService";

// Helper for dynamic highlights detail icons and description sentences
const getHighlightDetail = (name, city) => {
  const lower = name.toLowerCase();
  let icon = "📍";
  if (lower.includes("temple") || lower.includes("shrine") || lower.includes("pagoda") || lower.includes("mosque") || lower.includes("basilica") || lower.includes("cathedral") || lower.includes("church") || lower.includes("vatican")) {
    icon = "⛩️";
  } else if (lower.includes("palace") || lower.includes("castle") || lower.includes("fort")) {
    icon = "🏰";
  } else if (lower.includes("crossing") || lower.includes("square") || lower.includes("street") || lower.includes("market") || lower.includes("plaza")) {
    icon = "🛍️";
  } else if (lower.includes("park") || lower.includes("grove") || lower.includes("forest") || lower.includes("garden") || lower.includes("mountain") || lower.includes("cliff") || lower.includes("basalt") || lower.includes("valley") || lower.includes("beach") || lower.includes("lake") || lower.includes("cave") || lower.includes("nature")) {
    icon = "🌲";
  } else if (lower.includes("tower") || lower.includes("skytree") || lower.includes("building") || lower.includes("monument") || lower.includes("statue") || lower.includes("opera") || lower.includes("bridge") || lower.includes("louvre") || lower.includes("museum")) {
    icon = "🏛️";
  } else if (lower.includes("river") || lower.includes("water") || lower.includes("lake") || lower.includes("bay") || lower.includes("canal") || lower.includes("cruise") || lower.includes("falls")) {
    icon = "🌊";
  } else if (lower.includes("food") || lower.includes("cuisine") || lower.includes("cafe") || lower.includes("bistro")) {
    icon = "🥐";
  } else if (lower.includes("show") || lower.includes("theater") || lower.includes("disney") || lower.includes("studio") || lower.includes("aquarium")) {
    icon = "🎭";
  }

  let sentence = `Explore the iconic ${name}, a must-visit landmark showcasing the unique charm of ${city}.`;
  
  if (lower.includes("fushimi inari")) {
    sentence = "Walk through the mesmerizing path of thousands of vibrant red torii gates winding up the sacred mountain.";
  } else if (lower.includes("arashiyama")) {
    sentence = "Stroll along the towering stalks of green bamboo that whisper and sway gently with the wind.";
  } else if (lower.includes("kinkaku-ji") || lower.includes("golden pavilion")) {
    sentence = "Admire the breathtaking Zen temple covered in brilliant gold leaf, reflecting beautifully on the mirror pond.";
  } else if (lower.includes("shibuya crossing")) {
    sentence = "Experience the legendary heartbeat of Tokyo as hundreds of pedestrians cross the world's busiest intersection.";
  } else if (lower.includes("senso-ji")) {
    sentence = "Step back in time at Tokyo's oldest and most iconic Buddhist temple, filled with historic charm.";
  } else if (lower.includes("skytree")) {
    sentence = "Take in the ultimate panoramic view of the vast Tokyo metropolis from one of the tallest structures in the world.";
  } else if (lower.includes("gyeongbokgung")) {
    sentence = "Wander through the grand royal palace of the Joseon Dynasty, featuring majestic pavilions and gardens.";
  } else if (lower.includes("n seoul tower")) {
    sentence = "Enjoy panoramic city views and lock your love at this iconic tower atop Namsan Mountain.";
  } else if (lower.includes("myeongdong")) {
    sentence = "Explore the bustling shopping district famous for popular cosmetic shops, fashion boutiques, and street food.";
  } else if (lower.includes("hallasan")) {
    sentence = "Hike up the majestic shield volcano at the center of Jeju Island, offering incredible mountain panoramas.";
  } else if (lower.includes("manjanggul")) {
    sentence = "Venture into one of the finest lava tunnels in the world, featuring fascinating rock structures.";
  } else if (lower.includes("seongsan ilchulbong") || lower.includes("sunrise peak")) {
    sentence = "Climb the magnificent volcanic tuff cone to witness a spectacular sunrise over the ocean.";
  } else if (lower.includes("colosseum")) {
    sentence = "Stand in awe of the world's largest ancient amphitheater, where gladiators once fought for glory.";
  } else if (lower.includes("trevi fountain")) {
    sentence = "Toss a coin into the stunning Baroque masterpiece to ensure your return to the Eternal City.";
  } else if (lower.includes("pantheon")) {
    sentence = "Marvel at the architectural genius of the ancient temple, boasting the world's largest unreinforced concrete dome.";
  } else if (lower.includes("eiffel tower")) {
    sentence = "Ascend the iconic wrought-iron symbol of Paris for romantic views over the Seine River.";
  } else if (lower.includes("louvre")) {
    sentence = "Explore the world's largest art museum, home to the Mona Lisa and thousands of historic masterpieces.";
  } else if (lower.includes("notre-dame") || lower.includes("seine")) {
    sentence = "Take a romantic stroll along the scenic banks of the river and admire the Gothic grandeur of the cathedral.";
  } else if (lower.includes("matterhorn") || lower.includes("gornergrat")) {
    sentence = "Gaze at the legendary pyramid-shaped mountain peak from Zermatt's historic scenic viewpoint railways.";
  } else if (lower.includes("chillon") || lower.includes("geneva")) {
    sentence = "Visit the stunning medieval island fortress on the shores of Lake Geneva, steeped in history.";
  } else if (lower.includes("lucerne") || lower.includes("chapel bridge")) {
    sentence = "Stroll across the iconic wooden covered footbridge decorated with centuries-old paintings.";
  } else if (lower.includes("opera house")) {
    sentence = "Marvel at the world-famous sail-shaped architectural marvel gracing the waters of Sydney Harbour.";
  } else if (lower.includes("harbour bridge")) {
    sentence = "Walk across or climb the majestic steel arch bridge for unmatched views of the harbor skyline.";
  } else if (lower.includes("bondi beach")) {
    sentence = "Soak up the sun and watch surfers catch waves along the sweeping golden sands of this famous beach.";
  } else if (lower.includes("fiordland") || lower.includes("milford sound")) {
    sentence = "Cruise through dramatic fiords carved by glaciers, surrounded by sheer cliffs and waterfalls.";
  } else if (lower.includes("queenstown") || lower.includes("wakatipu")) {
    sentence = "Explore the adventure capital of the world, nested on the crystal-clear shores of Lake Wakatipu.";
  } else if (lower.includes("grand canal")) {
    sentence = "Glide past historic palaces in a traditional gondola along Venice's ultimate aquatic main street.";
  } else if (lower.includes("st. mark's") || lower.includes("san marco")) {
    sentence = "Admire the dazzling Byzantine mosaics and grand architecture of Venice's iconic public square.";
  } else if (lower.includes("burano")) {
    sentence = "Explore the vibrant island famous for its brightly colored houses and traditional lace-making.";
  } else if (lower.includes("sagrada familia")) {
    sentence = "Admire Gaudí's unfinished cathedral masterpiece, featuring forest-like columns and colorful stained glass.";
  } else if (lower.includes("park guell")) {
    sentence = "Wander through Gaudí's whimsical park filled with mosaic-covered terraces and colorful sculptures.";
  } else if (lower.includes("las ramblas")) {
    sentence = "Stroll down the lively tree-lined pedestrian avenue filled with street performers, cafés, and markets.";
  } else if (lower.includes("louvre abu dhabi")) {
    sentence = "Marvel at the stunning floating dome architecture and cross-cultural masterpieces at this premier art museum.";
  } else if (lower.includes("sheikh zayed grand mosque")) {
    sentence = "Behold one of the world's largest and most breathtaking mosques, showcasing marble domes and gold chandeliers.";
  } else if (lower.includes("yas island")) {
    sentence = "Experience high-speed thrill rides and luxury entertainment at Abu Dhabi's premier leisure destination.";
  } else if (lower.includes("burj khalifa")) {
    sentence = "Stand on top of the world at the observation deck of the tallest building ever constructed.";
  } else if (lower.includes("dubai mall") || lower.includes("dubai fountain")) {
    sentence = "Watch the spectacular choreographed water show and shop at the world's largest shopping mall.";
  } else if (lower.includes("palm jumeirah")) {
    sentence = "Explore the luxurious man-made archipelago shaped like a palm tree, featuring high-end beach resorts.";
  } else if (lower.includes("wat arun") || lower.includes("temple of dawn")) {
    sentence = "Gaze at the majestic porcelain-encrusted spires reflecting the morning sunlight on the riverbanks.";
  } else if (lower.includes("grand palace")) {
    sentence = "Admire the glittering spectacular architecture that served as the official royal residence of Thailand.";
  } else if (lower.includes("chatuchak")) {
    sentence = "Shop for unique local goods and taste street foods at one of the world's largest weekend markets.";
  } else if (lower.includes("taj mahal")) {
    sentence = "Gaze at the legendary white marble monument of love, representing the pinnacle of Mughal architecture.";
  } else if (lower.includes("agra fort")) {
    sentence = "Explore the massive red sandstone walled city containing royal palaces and historic halls.";
  } else if (lower.includes("mehtab bagh")) {
    sentence = "Enjoy the ultimate sunset view of the Taj Mahal from the botanical garden across the Yamuna River.";
  } else if (lower.includes("hawa mahal")) {
    sentence = "Admire the unique honeycombed pink sandstone facade designed for royal women to observe street festivals.";
  } else if (lower.includes("amber fort") || lower.includes("amer fort")) {
    sentence = "Ride up to the hilltop fortress showcasing artistic Hindu elements and scenic lake views.";
  } else if (lower.includes("city palace")) {
    sentence = "Explore the majestic royal courtyard complex filled with museums and colorful mosaic courtyards.";
  } else if (lower.includes("shanghai") || lower.includes("bund")) {
    sentence = "Stroll along the historic waterfront boulevard showcasing classic colonial European architecture.";
  } else if (lower.includes("yu garden")) {
    sentence = "Wander through the tranquil classical Chinese garden filled with rockeries, ponds, and bridges.";
  } else if (lower.includes("oriental pearl")) {
    sentence = "Behold the futuristic architectural icon gracing the skyline of Shanghai's Pudong district.";
  } else if (lower.includes("gardens by the bay")) {
    sentence = "Marvel at the giant futuristic Supertrees and the world's largest glass greenhouse dome.";
  } else if (lower.includes("marina bay sands")) {
    sentence = "View Singapore's iconic skyline from the spectacular infinity pool and rooftop sky park.";
  } else if (lower.includes("sentosa")) {
    sentence = "Relax at the vibrant island resort destination featuring sandy beaches, theme parks, and golf courses.";
  } else if (lower.includes("table mountain")) {
    sentence = "Take the cableway to the flat-topped mountain peak offering panoramic views of Cape Town and the ocean.";
  } else if (lower.includes("cape of good hope")) {
    sentence = "Stand at the dramatic southwestern tip of the African continent, where rugged cliffs meet the sea.";
  } else if (lower.includes("robben island")) {
    sentence = "Visit the historic prison site where Nelson Mandela was incarcerated, now a powerful museum of freedom.";
  } else if (lower.includes("petra")) {
    sentence = "Walk through the narrow Siq gorge to behold the breathtaking Treasury building carved directly into red rock cliffs.";
  } else if (lower.includes("wadi rum")) {
    sentence = "Explore the majestic desert wilderness featuring dramatic red sandstone mountains and ancient canyons.";
  } else if (lower.includes("dead sea")) {
    sentence = "Float effortlessly in the hyper-saline waters of the lowest land elevation point on Earth.";
  } else if (lower.includes("pyramids") || lower.includes("giza")) {
    sentence = "Behold the sole surviving wonder of the ancient world, standing tall in the desert sands for over 4,500 years.";
  } else if (lower.includes("sphinx")) {
    sentence = "Admire the mythical limestone statue featuring the body of a lion and the head of a pharaoh.";
  } else if (lower.includes("khan el-khalili")) {
    sentence = "Lose yourself in the historic colorful bazaar filled with spices, jewelry, and local handicraft souvenirs.";
  } else if (lower.includes("machu picchu")) {
    sentence = "Discover the legendary Incan citadel set high in the Andes Mountains, surrounded by mist and mystery.";
  } else if (lower.includes("sacred valley")) {
    sentence = "Explore the fertile valley dotted with colonial towns, weaving villages, and impressive ruins.";
  } else if (lower.includes("cusco cathedral")) {
    sentence = "Admire the beautiful colonial cathedral built on Incan palace foundations at the Plaza de Armas.";
  } else if (lower.includes("christ the redeemer")) {
    sentence = "Stand beneath the colossal statue of Jesus Christ overlooking Rio de Janeiro from Mount Corcovado.";
  } else if (lower.includes("sugarloaf mountain")) {
    sentence = "Ride the glass-walled cableway to the peak of the monolith rising dramatically from Guanabara Bay.";
  } else if (lower.includes("copacabana")) {
    sentence = "Stroll along the world-famous wave-patterned promenade of Rio's legendary crescent beach.";
  } else if (lower.includes("acropolis") || lower.includes("parthenon")) {
    sentence = "Ascend the sacred hilltop citadel to stand in the shadow of the ancient temple of Athena.";
  } else if (lower.includes("plaka")) {
    sentence = "Wander through the historic neighborhood nestled under the Acropolis, filled with colorful cafes and neoclassical houses.";
  } else if (lower.includes("temple of Olympian Zeus")) {
    sentence = "Gaze at the colossal ruined columns of the ancient temple dedicated to the king of Olympian gods.";
  } else if (lower.includes("blue lagoon")) {
    sentence = "Soak in the mineral-rich geothermal waters surrounded by spectacular volcanic lava fields.";
  } else if (lower.includes("golden circle") || lower.includes("geysir")) {
    sentence = "Witness explosive geysers, tectonic rifts, and majestic cascading waterfalls along Iceland's premier route.";
  } else if (lower.includes("gullfoss")) {
    sentence = "Stand in awe of the double-cascading glacial waterfall plunging into a rugged canyon.";
  } else if (lower.includes("banff") || lower.includes("lake louise")) {
    sentence = "Gaze at the turquoise glacial waters reflecting the towering snow-capped peaks of the Canadian Rockies.";
  } else if (lower.includes("moraine lake")) {
    sentence = "Admire the surreal blue waters surrounded by the Valley of the Ten Peaks.";
  } else if (lower.includes("columbia icefield")) {
    sentence = "Walk upon the massive ancient glacier forming the largest ice field in the Rocky Mountains.";
  } else if (lower.includes("geirangerfjord")) {
    sentence = "Cruise through Norway's spectacular UNESCO-listed deep blue fiord surrounded by towering waterfalls.";
  } else if (lower.includes("lofoten")) {
    sentence = "Explore traditional red fishing cabins nestled under dramatic mountain peaks rising directly from the sea.";
  } else if (lower.includes("flam railway")) {
    sentence = "Ride one of the world's steepest and most spectacular railway lines, offering vistas of deep ravines.";
  }

  return { icon, sentence };
};

// Helper for dynamic experiences list
const getRecommendedExperiences = (destination) => {
  const city = destination.city || destination.title;
  const country = destination.country;
  const food = (destination.famousFoods && destination.famousFoods[0]) || "local specialities";
  const landmark = (destination.highlights && destination.highlights[0]) || "iconic landmarks";
  const secondLandmark = (destination.highlights && destination.highlights[1]) || "scenic spots";

  const defaultExperiences = [
    {
      id: 1,
      icon: "☕",
      title: "Enjoy Local Cafe Culture",
      desc: `Relax at a charming neighborhood café and watch the local life pass by in ${city}.`
    },
    {
      id: 2,
      icon: "🚶",
      title: "Walk Through Historic Streets",
      desc: `Stroll along scenic pathways and historical architecture that tell the story of ${city}.`
    },
    {
      id: 3,
      icon: "📸",
      title: "Visit Famous Landmarks",
      desc: `Capture beautiful photos at famous sites like ${landmark} during your exploration.`
    },
    {
      id: 4,
      icon: "🍽️",
      title: `Taste Authentic ${country} Cuisine`,
      desc: `Indulge in delicious local delicacies, especially fresh ${food} at authentic eateries.`
    }
  ];

  const categoryExperiences = {
    kyoto: [
      { id: 1, icon: "🍵", title: "Attend a Traditional Tea Ceremony", desc: "Experience the mindful zen art of preparing and drinking powdered matcha green tea." },
      { id: 2, icon: "🚶", title: "Stroll Through Gion District", desc: "Walk down historic streets lined with wooden machiya houses, hoping to catch a glimpse of a geisha." },
      { id: 3, icon: "🎋", title: "Listen to the Bamboo Forest", desc: "Enjoy a peaceful morning walk through the towering bamboo groves of Arashiyama." },
      { id: 4, icon: "⛩️", title: "Hike Through Fushimi Inari", desc: "Climb the scenic trails beneath thousands of bright orange-red wooden torii gates." }
    ],
    tokyo: [
      { id: 1, icon: "🏙️", title: "Cross Shibuya Intersection", desc: "Experience the energetic crosswalk where thousands cross in synchronization under glowing billboards." },
      { id: 2, icon: "⛩️", title: "Explore Historic Senso-ji", desc: "Walk down Nakamise Street to purchase traditional snacks and visit Tokyo's oldest temple." },
      { id: 3, icon: "🍣", title: "Dine at Tsukiji Outer Market", desc: "Savor the freshest sushi, grilled seafood, and sweet tamagoyaki from local vendor stalls." },
      { id: 4, icon: "🔮", title: "Visit a Futuristic Digital Art Museum", desc: "Immerse yourself in dazzling, borderless digital light projection installations at TeamLab." }
    ],
    seoul: [
      { id: 1, icon: "🏰", title: "Tour Gyeongbokgung Palace", desc: "Rent a traditional Hanbok dress to gain free admission and explore royal palace courtyards." },
      { id: 2, icon: "🍢", title: "Feast on Street Food at Gwangjang", desc: "Try famous mungbean pancakes, spicy tteokbokki, and handmade knife noodles at lively stalls." },
      { id: 3, icon: "🎨", title: "Wander Through Bukchon Hanok", desc: "Walk quietly through a preserved historic village showcasing centuries-old traditional homes." },
      { id: 4, icon: "🌃", title: "Admire Seoul from Namsan Tower", desc: "Ride the cable car to the peak at sunset for panoramic skyline views of the metropolis." }
    ],
    rome: [
      { id: 1, icon: "🏛️", title: "Walk Through the Colosseum", desc: "Stand in the ancient amphitheater and learn about the historic gladiator battles." },
      { id: 2, icon: "⛲", title: "Toss a Coin in Trevi Fountain", desc: "Join the tradition by tossing a coin over your left shoulder to guarantee your return to Rome." },
      { id: 3, icon: "🍝", title: "Savor Carbonara in Trastevere", desc: "Wander through winding cobblestone streets and dine at an authentic family-run trattoria." },
      { id: 4, icon: "⛪", title: "Visit Vatican Museums & Chapel", desc: "Admire Michelangelo's breathtaking ceiling frescoes inside the Sistine Chapel." }
    ],
    paris: [
      { id: 1, icon: "🗼", title: "Picnic at Champ de Mars", desc: "Grab fresh baguettes and cheese to enjoy a picnic with direct views of the Eiffel Tower." },
      { id: 2, icon: "🎨", title: "View Masterpieces at the Louvre", desc: "Explore the vast historic galleries to see iconic art like the Mona Lisa and Venus de Milo." },
      { id: 3, icon: "🌅", title: "Take a Cruise on the Seine River", desc: "Enjoy a scenic boat cruise at sunset to see Paris landmarks illuminate one by one." },
      { id: 4, icon: "🥐", title: "Enjoy Cafe & Croissant in Marais", desc: "Sit at a cozy sidewalk bistro table in the historic Marais district for espresso and pastries." }
    ]
  };

  if (categoryExperiences[destination.id]) {
    return categoryExperiences[destination.id];
  }

  const result = [...defaultExperiences];
  if (destination.travelStyle?.includes("Nature") || destination.vibe === "Peaceful" || destination.vibe === "Relaxed") {
    result[1] = {
      id: 2,
      icon: "🌲",
      title: "Immerse Yourself in Nature",
      desc: `Explore the tranquil pathways, fresh air, and scenic beauty surrounding ${city}.`
    };
  }
  if (destination.travelStyle?.includes("Adventure")) {
    result[0] = {
      id: 1,
      icon: "🧗",
      title: "Seek Outdoor Thrills",
      desc: `Engage in exciting outdoor activities and explore rugged viewpoints around ${city}.`
    };
  }
  if (destination.highlights && destination.highlights.length > 1) {
    result[2] = {
      id: 3,
      icon: "📸",
      title: `Visit ${secondLandmark}`,
      desc: `Spend a morning exploring the historic grounds and scenic vistas at ${secondLandmark}.`
    };
  }
  return result;
};

// Helper for dynamic population metrics
const getPopulation = (city) => {
  const c = String(city || "").toLowerCase();
  if (c.includes("kyoto")) return "1.46 Million";
  if (c.includes("tokyo")) return "14 Million";
  if (c.includes("seoul")) return "9.7 Million";
  if (c.includes("jeju")) return "670,000";
  if (c.includes("rome")) return "2.8 Million";
  if (c.includes("paris")) return "2.1 Million";
  if (c.includes("barcelona")) return "1.6 Million";
  if (c.includes("singapore")) return "5.9 Million";
  if (c.includes("dubai")) return "3.3 Million";
  if (c.includes("zermatt")) return "5,800";
  if (c.includes("interlaken")) return "5,700";
  if (c.includes("geneva")) return "200,000";
  if (c.includes("lucerne")) return "82,000";
  if (c.includes("sydney")) return "5.3 Million";
  if (c.includes("melbourne")) return "5.0 Million";
  if (c.includes("queenstown")) return "16,000";
  if (c.includes("auckland")) return "1.6 Million";
  if (c.includes("venice")) return "260,000";
  if (c.includes("abu dhabi")) return "1.5 Million";
  if (c.includes("bangkok")) return "8.3 Million";
  if (c.includes("agra")) return "1.6 Million";
  if (c.includes("jaipur")) return "3.1 Million";
  if (c.includes("shanghai")) return "26 Million";
  if (c.includes("cape town")) return "4.6 Million";
  if (c.includes("petra")) return "Wadi Musa (~25,000)";
  if (c.includes("giza")) return "8.9 Million";
  if (c.includes("cusco")) return "430,000";
  if (c.includes("rio de janeiro")) return "6.7 Million";
  if (c.includes("athens")) return "660,000";
  if (c.includes("reykjavik")) return "130,000";
  if (c.includes("banff")) return "7,800";
  if (c.includes("geiranger")) return "~250";
  if (c.includes("lofoten")) return "24,000";
  return "N/A";
};

// Rich destination About content data helper
const getDetailedAboutContent = (id, city, country) => {
  const cId = String(id || "").toLowerCase();
  const cName = String(city || "").toLowerCase();
  
  const content = {
    kyoto: [
      "Kyoto, the cultural heart of Japan, is a city where the past lives on in stunning harmony with the present. Known for its thousand-year-old Buddhist temples, sublime gardens, and traditional wooden machiya houses, Kyoto offers an intimate glimpse into Japan's ancient soul.",
      "The atmosphere here is one of peaceful reflection. Walking through the towering stalks of the Arashiyama Bamboo Grove or standing before the brilliant gold leaf of the Kinkaku-ji temple transport you to another era.",
      "Local culture is deeply revered, from tea ceremonies to the silent steps of geishas in the historic Gion district. Travelers leave Kyoto with a sense of tranquility and a deep appreciation for Japanese heritage."
    ],
    tokyo: [
      "Tokyo is a dazzling, high-octane metropolis where neon skyscrapers coexist with centuries-old shrines. As the capital of Japan, it is a global hub of innovation, fashion, pop culture, and world-class culinary arts.",
      "The city's atmosphere is electric and incredibly alive, from the organized chaos of Shibuya Crossing to the historic serenity of Senso-ji temple in Asakusa. There is a sense of infinite discovery around every street corner.",
      "From luxury shopping in Ginza to the futuristic tech of Akihabara, Tokyo caters to every interest. It is a memorable destination that challenges your senses and redefines what a modern city can be."
    ],
    seoul: [
      "Seoul, the dynamic capital of South Korea, is a fascinating blend of historical grandeur and state-of-the-art technology. Centuries-old royal palaces sit side-by-side with futuristic architectural landmarks, lively street markets, and K-pop culture hotspots.",
      "The city is characterized by its infectious energy and welcoming spirit. Visitors can hike the ancient fortress walls of Namsan mountain, shop in Myeongdong, or experience the traditional charm of Bukchon Hanok Village.",
      "Food is a vital part of the local character, with street food stalls serving spicy tteokbokki alongside premium Korean BBQ houses. Seoul leaves visitors with memories of vibrant flavors and endless neon nights."
    ],
    jeju: [
      "Jeju Island is a stunning volcanic escape located off the southern coast of the Korean Peninsula. Famous for its black sand beaches, towering basalt cliffs, volcanic craters, and lush tangerine orchards, Jeju is South Korea's favorite holiday destination.",
      "The island vibe is relaxed and close to nature. Visitors enjoy hiking Hallasan Mountain (the highest peak in the country), exploring the mysterious lava tubes of Manjanggul Cave, and watching the sunrise over Seongsan Ilchulbong.",
      "Jeju is also renowned for its unique local culture, particularly the Haenyeo—female divers who harvest seafood without breathing apparatus. It is a peaceful sanctuary that rejuvenates the body and soul."
    ],
    rome: [
      "Rome, the \"Eternal City,\" is a living museum boasting nearly three millennia of globally influential art, architecture, and history. Walking through its ancient streets feels like stepping back in time to the height of the Roman Empire.",
      "The atmosphere is romantic, lively, and filled with the scent of fresh espresso and basil. Iconic landmarks like the Colosseum, the Pantheon, and the Trevi Fountain stand as monuments to human engineering and artistic genius.",
      "Local culture is centered on savoring the moment, whether chatting in a bustling piazza or enjoying authentic Carbonara. Rome is a legendary destination that captures the heart of every traveler."
    ],
    venice: [
      "Venice, the famous floating city of canals, is a masterpiece of architectural beauty and romance. Built on a lagoon in the Adriatic Sea, this car-free city is defined by its maze of narrow alleys, historic palaces, and iconic bridges.",
      "The atmosphere in Venice is dreamlike and unique. The gentle lap of water against gondolas and the spectacular vistas of the Grand Canal create an unparalleled sense of wonder and escape.",
      "Visitors love exploring the majestic St. Mark's Basilica, crossing the Rialto Bridge, and enjoying local cicchetti in quiet neighborhood osterias. Venice is a magical destination that feels like a fantasy brought to life."
    ],
    paris: [
      "Paris, the \"City of Light,\" is a global center for art, fashion, gastronomy, and romance. Located along the banks of the Seine, its elegant avenues, historic monuments, and bohemian quarters have inspired artists and travelers for centuries.",
      "The atmosphere is sophisticated yet relaxed, characterized by the culture of cafe terrace sitting and leisurely strolls through manicured parks. Iconic symbols like the Eiffel Tower and Notre-Dame Cathedral dominate the skyline.",
      "World-renowned museums like the Louvre house priceless masterpieces, while local bakeries fill the air with the smell of buttery croissants. Paris is a timeless destination that stays with you forever."
    ],
    nice: [
      "Nice, the crown jewel of the French Riviera, combines the sun-drenched glamour of Mediterranean resort life with rich historic charm. Situated along the turquoise waters of the Baie des Anges, it features palm-fringed promenades and colorful baroque streets.",
      "The atmosphere is breezy, vibrant, and effortlessly chic. Walking the Promenade des Anglais or exploring the sensory delights of the Cours Saleya flower market offers an authentic taste of coastal French living.",
      "Nice boasts a unique culture influenced by its proximity to Italy, reflected in its local cuisine, language, and art. It is a sun-kissed haven perfect for relaxation and culture alike."
    ],
    zermatt: [
      "Zermatt is a postcard-perfect alpine village nestled at the foot of the iconic, pyramid-shaped Matterhorn peak in Switzerland. This car-free mountain resort is a world-renowned sanctuary for skiers, mountaineers, and outdoor enthusiasts.",
      "The air is crisp and clean, and the village atmosphere is cozy, charming, and filled with wooden chalets and luxury boutique hotels. The majestic Matterhorn dominates every viewpoint, inspiring awe in all who visit.",
      "Visitors enjoy world-class skiing, hiking panoramic trails, and indulging in rich Swiss cheese fondue in alpine huts. Zermatt offers an unforgettable mountain getaway of pure natural grandeur."
    ],
    tromso: [
      "Tromso, located high above the Arctic Circle in northern Norway, is a vibrant polar city famous for its breathtaking fjord scenery and historic wooden houses. It is widely considered one of the best places in the world to view the Northern Lights.",
      "The atmosphere is cozy, rugged, and defined by the wonders of the Arctic, from the midnight sun in summer to the polar nights of winter. The iconic Arctic Cathedral stands proud against a backdrop of snow-dusted mountains.",
      "Travelers come here to go husky sledding, seek out the Aurora Borealis, and experience the warmth of northern Norwegian hospitality. Tromso is a memorable frontier destination for true explorers."
    ],
    reykjavik: [
      "Reykjavik, the capital of Iceland, is a colorful coastal city known for its creative culture, friendly locals, and proximity to geothermal wonders. It serves as the gateway to Iceland's dramatic volcanic landscapes, geysers, and waterfalls.",
      "The city has a quirky, laid-back, yet artistic atmosphere. Colorful corrugated iron buildings line the streets, leading to striking modern designs like the Harpa Concert Hall and the soaring Hallgrimskirkja church.",
      "Visitors love soaking in nearby geothermal lagoons, exploring the Golden Circle routes, and enjoying the city's legendary nightlife. Reykjavik is a cozy basecamp for exploring the raw forces of Icelandic nature."
    ],
    banff: [
      "Banff is a breathtaking mountain resort town located inside Canada's oldest national park in Alberta. Surrounded by the towering peaks of the Canadian Rockies, it is famous for its vibrant turquoise lakes, hot springs, and abundant wildlife.",
      "The atmosphere is rustic, scenic, and adventurous. Rocky Mountain peaks frame the main street, while nearby gems like Lake Louise and Moraine Lake offer some of the most famous natural views in the world.",
      "From skiing in the winter to canoeing and hiking in the summer, Banff is an outdoor lover's paradise. It is a majestic mountain haven that showcases the pure, untamed beauty of the Canadian wilderness."
    ],
    sydney: [
      "Sydney, Australia's largest city, is a sun-drenched coastal metropolis defined by its spectacular harbor, pristine beaches, and relaxed, outdoor-focused lifestyle. It is a diverse cultural hub that combines urban sophistication with beachside vibes.",
      "The harbor atmosphere is iconic and jaw-dropping, anchored by the architectural marvel of the Sydney Opera House and the majestic Harbour Bridge. Nearby, beaches like Bondi and Manly offer world-class surfing and coastal walks.",
      "Boasting a vibrant culinary scene and a rich Indigenous heritage, Sydney offers a friendly and relaxed experience. It is a memorable gateway to Australia that perfectly blends city excitement and coastal bliss."
    ],
    queenstown: [
      "Queenstown, situated on the shores of Lake Wakatipu against the dramatic Southern Alps of New Zealand, is the adventure capital of the world. It is legendary for pioneering commercial bungy jumping, jet boating, and skydiving.",
      "The atmosphere is energetic, stunningly beautiful, and filled with travelers seeking adrenaline or majestic nature. The sheer mountain range of The Remarkables frames the deep blue lake, creating stunning views.",
      "In winter, Queenstown becomes a premium snow resort, while summer brings hiking, vineyard tours, and lake cruises. It is an exhilarating destination that leaves visitors inspired and amazed."
    ],
    bali: [
      "Bali, the \"Island of the Gods,\" is a tropical paradise in Indonesia renowned for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. It is a sanctuary of spirituality, art, and wellness.",
      "The atmosphere is deeply spiritual and calming, filled with the scent of incense and temple offerings. From the cultural heart of Ubud with its sacred temples to the beachside energy of Seminyak, Bali offers a rich variety of experiences.",
      "Visitors enjoy surfing, hiking active volcanoes, practicing yoga, and exploring historic sea temples like Tanah Lot. Bali is a magical island that heals the spirit and captivates the senses."
    ],
    bangkok: [
      "Bangkok, the vibrant capital of Thailand, is an energetic sensory explosion where ornate Buddhist shrines meet bustling canal life, modern skyscrapers, and legendary street food markets.",
      "The city's character is lively, chaotic, and deeply cultural. The magnificent Grand Palace and the sacred temple of Wat Arun stand proudly along the Chao Phraya River, showcasing stunning gilded craftsmanship.",
      "Bangkok is world-famous for its culinary scene, offering everything from roadside Pad Thai to Michelin-starred dining. It is a memorable city of contrasts that captures the warm and welcoming spirit of Thailand."
    ],
    phuket: [
      "Phuket, Thailand's largest island, is a tropical paradise located in the Andaman Sea. It is famous for its white sand beaches, towering limestone karsts rising from emerald waters, and vibrant nightlife.",
      "The atmosphere is sun-soaked, lively, and tropical. Visitors flock to the crystal-clear waters of Patong and Karon beaches or take boat excursions to the stunning Phi Phi Islands and Phang Nga Bay.",
      "Phuket's Old Town showcases historical Sino-Portuguese architecture, while local night markets offer a feast for the senses. It is a diverse island destination that offers both high-energy entertainment and secluded luxury."
    ],
    singapore: [
      "Singapore is a futuristic city-state that blends colonial heritage with hyper-modern innovation, green architecture, and multicultural diversity. Known as a \"Garden in a City,\" it is one of the cleanest and safest destinations in the world.",
      "The atmosphere is orderly, advanced, and spectacularly green, highlighted by the alien-like Supertrees of Gardens by the Bay and the stunning indoor waterfall at Jewel Changi.",
      "A true melting pot of Chinese, Malay, Indian, and Eurasian cultures, Singapore offers unparalleled culinary choices, historic shop houses, and premium shopping. It is a visionary metropolis that feels like a glimpse into tomorrow."
    ],
    dubai: [
      "Dubai, located in the UAE, is a glittering oasis of luxury, modern architecture, and desert adventure. Rising dramatically from the sands, it is home to record-breaking wonders like the Burj Khalifa—the tallest building in the world.",
      "The atmosphere is opulent, ambitious, and visionary. Visitors can ski indoors, shop in the world's largest mall, or relax at luxury beach clubs on the man-made Palm Jumeirah archipelago.",
      "Beyond the skyscrapers, Dubai maintains its heritage in the historic Al Fahidi neighborhood and gold souks along the Creek. It is a spectacular destination that proves nothing is impossible."
    ],
    barcelona: [
      "Barcelona, the cosmopolitan capital of Spain's Catalonia region, is celebrated for its whimsical art, Mediterranean beach lifestyle, and unique Gothic architecture. It is the playground of legendary architect Antoni Gaudí.",
      "The atmosphere is sunny, creative, and relaxed. Walking along La Rambla, exploring the Gothic Quarter, or gazing at the unfinished masterpiece of the Sagrada Família cathedral inspires artistic wonder.",
      "Catalonian culture is passionate and festive, best experienced through late-night tapas crawls and sunbathed beach strolls. Barcelona is a vibrant city of design and coastal joy."
    ],
    bergen: [
      "Bergen, the gateway to the world-famous Norwegian fjords, is a picturesque coastal city surrounded by seven mountains and deep blue waters. It is celebrated for its historic Bryggen wharf—a UNESCO World Heritage site of colorful wooden warehouses.",
      "The atmosphere is historic, maritime, and cozy. The smell of fresh seafood from the Fish Market and the spectacular views from Mount Fløyen create a romantic, coastal Scandinavian charm.",
      "Bergen is the perfect starting point for cruises into the deep, dramatic fjords of Norway. It is a scenic haven where historic sea history meets majestic mountain nature."
    ],
    interlaken: [
      "Interlaken is a scenic resort town nestled in the heart of Switzerland between the brilliant blue waters of Lake Thun and Lake Brienz. Surrounded by the majestic peaks of the Jungfrau region, it is a prime adventure hub of Europe.",
      "The alpine atmosphere is clean, spectacular, and filled with the ringing of cowbells and sight of paragliders floating down from alpine meadows. The snow-capped peaks of Eiger, Mönch, and Jungfrau dominate the skyline.",
      "Whether taking a cogwheel train to the \"Top of Europe\" at Jungfraujoch or hiking alpine trails, Interlaken offers pure mountain magic. It is an unforgettable gateway to the Swiss Alps."
    ],
    auckland: [
      "Auckland, New Zealand's largest city, is a volcanic metropolis built around two beautiful harbors. Known as the \"City of Sails,\" it is defined by its sailing culture, rich Māori heritage, and proximity to black-sand beaches and islands.",
      "The atmosphere is relaxed, maritime, and green. The city skyline is dominated by the Sky Tower, offering panoramic views of the harbor and nearby volcanic cones like Mount Eden.",
      "Visitors enjoy sailing in the harbor, taking ferries to the volcanic vineyards of Waiheke Island, and exploring local parks. Auckland is a friendly and diverse city that perfectly blends urban sophistication and dramatic nature."
    ]
  };

  const key = cId || cName.replace(/[^a-z0-9]/g, "");
  if (content[key]) {
    return content[key];
  }

  // General fallback
  const cityStr = city || id || "this city";
  const countryStr = country || "this region";
  return [
    `Explore the vibrant streets and beautiful sights of ${cityStr}, a top destination in ${countryStr}. What makes this city unique is its captivating mix of local history, welcoming residents, and distinct regional atmosphere that instantly charms visitors.`,
    `The character of ${cityStr} is warm and inviting, offering a wonderful blend of scenic viewpoints, local landmarks, and lively neighborhood streets. There are endless opportunities to discover hidden gems and immerse yourself in the local rhythm of life.`,
    `Travelers enjoy visiting for the rich cultural experiences, beautiful surroundings, and the memorable stories they gather. Whether you are exploring historical sites or enjoying the local cuisine, this destination is bound to leave a lasting impression.`
  ];
};

export default function DetailsPage() {
  const navigate = useNavigate();
  const { destinationId } = useParams();
  const { selectedDestination, setSelectedDestination } = useTravelSession();
  const { departureCity } = useTravel();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [mapFocusItem, setMapFocusItem] = useState(null);

  // Smart Hotel System State
  const [hotelSortBy, setHotelSortBy] = useState("recommended");
  const [hotelTierFilter, setHotelTierFilter] = useState("all");
  const [hotelAmenityFilters, setHotelAmenityFilters] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [compareHotels, setCompareHotels] = useState([]);

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState(null);

  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState(null);

  // State for dynamic weather summary
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [aiDetails, setAiDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const processedHotels = useMemo(() => {
    if (!hotels || !Array.isArray(hotels)) return [];
    let list = [...hotels];

    if (hotelTierFilter !== "all") {
      list = list.filter((h) => {
        const p = h.pricePerNight || 0;
        if (hotelTierFilter === "budget") return p < 80 || (h.priceLevel && h.priceLevel === "$");
        if (hotelTierFilter === "comfort") return (p >= 80 && p <= 250) || (h.priceLevel && h.priceLevel === "$$");
        if (hotelTierFilter === "luxury") return p > 250 || (h.priceLevel && h.priceLevel === "$$$");
        return true;
      });
    }

    if (hotelAmenityFilters.length > 0) {
      list = list.filter((h) => {
        const amList = (h.amenities || []).map((a) => a.toLowerCase());
        return hotelAmenityFilters.every((req) => {
          const r = req.toLowerCase();
          if (r === "wifi") return amList.some((a) => a.includes("wifi") || a.includes("internet"));
          if (r === "breakfast") return amList.some((a) => a.includes("breakfast") || a.includes("dining"));
          if (r === "pool") return amList.some((a) => a.includes("pool"));
          if (r === "parking") return amList.some((a) => a.includes("parking") || a.includes("car"));
          if (r === "family") return (h.name || "").toLowerCase().includes("family") || amList.some((a) => a.includes("family") || a.includes("lounge"));
          return true;
        });
      });
    }

    if (hotelSortBy === "price_asc") {
      list.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    } else if (hotelSortBy === "price_desc") {
      list.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
    } else if (hotelSortBy === "rating_desc") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (hotelSortBy === "distance_asc") {
      const getDist = (d) => parseFloat((d.distance || "").match(/[\d.]+/)?.[0] || 99);
      list.sort((a, b) => getDist(a) - getDist(b));
    } else if (hotelSortBy === "recommended") {
      list.sort((a, b) => (b.matchScore || 85) - (a.matchScore || 85));
    }

    return list;
  }, [hotels, hotelSortBy, hotelTierFilter, hotelAmenityFilters]);

  const tabs = [
    { label: "About", id: "about" },
    { label: "Highlights", id: "highlights" },
    { label: "Experiences", id: "experiences" },
    { label: "Essentials", id: "essentials" },
    { label: "Gallery", id: "gallery" },
    { label: "Weather", id: "weather" },
    { label: "Map", id: "map" },
    { label: "Hotels", id: "hotels" },
    { label: "Restaurants", id: "restaurants" },
    { label: "Flights", id: "flights" },
    { label: "Travel Guide", id: "travel-guide" }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    
    // Auto-scroll active tab button into view inside the horizontally scrollable bar
    setTimeout(() => {
      const navEl = document.querySelector(".details-tabs-nav");
      if (navEl) {
        const rect = navEl.getBoundingClientRect();
        if (rect.top < 0) {
          window.scrollTo({
            top: window.pageYOffset + rect.top - 80,
            behavior: "smooth"
          });
        }
        
        const activeBtn = Array.from(navEl.querySelectorAll(".tab-btn")).find(
          (btn) => btn.className.includes("active")
        );
        if (activeBtn) {
          const btnRect = activeBtn.getBoundingClientRect();
          const navRect = navEl.getBoundingClientRect();
          if (btnRect.left < navRect.left) {
            navEl.scrollBy({ left: btnRect.left - navRect.left - 24, behavior: "smooth" });
          } else if (btnRect.right > navRect.right) {
            navEl.scrollBy({ left: btnRect.right - navRect.right + 24, behavior: "smooth" });
          }
        }
      }
    }, 100);
  };

  useEffect(() => {
    sessionStorage.setItem("travio_active_details_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) {
        const detailStr = String(e.detail).toLowerCase();
        const found = tabs.find(t => t.id === detailStr || t.label.toLowerCase() === detailStr);
        if (found) {
          setActiveTab(found.id);
        }
      }
    };
    window.addEventListener("travio_active_tab_change", handleTabChange);
    return () => window.removeEventListener("travio_active_tab_change", handleTabChange);
  }, []);

  const handleViewOnMap = (type, item) => {
    setMapFocusItem({ type, data: item });
    setActiveTab("map");
    setTimeout(() => {
      const mapEl = document.getElementById("maps");
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 350, behavior: "smooth" });
      }
    }, 80);
  };

  const handleToggleCompare = (hotel) => {
    setCompareHotels((prev) => {
      const exists = prev.find((h) => h.name === hotel.name);
      if (exists) {
        return prev.filter((h) => h.name !== hotel.name);
      }
      if (prev.length >= 3) {
        alert("You can compare a maximum of 3 hotels.");
        return prev;
      }
      return [...prev, hotel];
    });
  };

  // Derive user preferences
  const userPrefs = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("travio_user_preferences") || "{}");
    } catch (e) {
      console.error("Failed to load preferences from sessionStorage", e);
      return {};
    }
  }, []);

  const baseDestination = useMemo(() => {
    if (destinationId && destinationId !== "undefined") {
      const resolved = resolveDestination(destinationId);
      if (resolved) return resolved;
      // Parameter was provided in URL but destination was not found
      return null;
    }
    if (selectedDestination) {
      return resolveDestination(selectedDestination);
    }
    return resolveDestination("kyoto") || Object.values(destinationData)[0];
  }, [destinationId, selectedDestination]);

  useEffect(() => {
    if (baseDestination?.id) {
      setDetailsLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";
      fetch(`${apiBaseUrl}/ai/destination-details/${baseDestination.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.details) {
            setAiDetails(data.details);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch destination details from AI:", err);
        })
        .finally(() => {
          setDetailsLoading(false);
        });
    } else {
      setAiDetails(null);
    }
  }, [baseDestination?.id]);

  useEffect(() => {
    if (baseDestination?.id) {
      try {
        const recent = JSON.parse(localStorage.getItem("travio_recently_viewed") || "[]");
        const filtered = recent.filter(id => id !== baseDestination.id);
        const updated = [baseDestination.id, ...filtered].slice(0, 5);
        localStorage.setItem("travio_recently_viewed", JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to update recently viewed destinations:", err);
      }
    }
  }, [baseDestination?.id]);

  const destination = useMemo(() => {
    if (!baseDestination) return null;
    
    const budgetLevel = userPrefs.budget || baseDestination.budget || "Comfort";
    const destCode = getCurrencyCodeFromString(baseDestination.currency);
    const formatDailyBudgetRange = (lowUsd, highUsd) => {
      const lowVal = convertUSD(lowUsd, destCode);
      const highVal = convertUSD(highUsd, destCode);
      return `${formatPrice(lowVal, destCode)} - ${formatPrice(highVal, destCode)} per day`;
    };
    const budgetMap = { 
      High: formatDailyBudgetRange(120, 220), 
      Medium: formatDailyBudgetRange(70, 140), 
      Low: formatDailyBudgetRange(35, 70) 
    };
    const transportMap = {
      Japan: "Extensive train networks, clean subways, and walking are primary.",
      SouthKorea: "Extensive clean subways and city buses using T-money cards.",
      Italy: "City buses, walking historic cobblestone streets, and regional trains.",
      France: "Dense Métro networks, local tram lines, and public bike systems.",
      Switzerland: "Extensive scenic Swiss rail networks and city walking.",
      Norway: "Reliable city light rails, buses, or private vehicle rental.",
      Iceland: "Private vehicle rental or guided tours, limited public buses.",
      Canada: "Local municipal transit networks or car rental for national parks.",
      Australia: "Clean city trains, light rail, buses, and harbor ferries.",
      NewZealand: "City bus systems and walking; car rental is common.",
      Thailand: "Skytrain (BTS), subway (MRT), local tuk-tuks, and taxis.",
      Singapore: "Ultra-modern, fast MRT subways and city double-decker buses.",
      UAE: "Driver apps like Careem, city Metro systems, and taxis."
    };
    const countryKey = (baseDestination.country || "").replace(/\s/g, "");
    const transport = transportMap[countryKey] || "Local city buses and walking.";

    const emergencyMap = {
      Japan: "119 / 110",
      SouthKorea: "119 / 112",
      Australia: "000",
      NewZealand: "111",
      Thailand: "191 / 1155 (Tourist)",
      USA: "911",
      Canada: "911",
      Singapore: "995 / 999"
    };
    const emergencyNumber = emergencyMap[countryKey] || "112";

    const timezoneMap = {
      Japan: "JST (UTC+9)",
      SouthKorea: "KST (UTC+9)",
      Australia: "AEST (UTC+10)",
      NewZealand: "NZST (UTC+12)",
      Thailand: "ICT (UTC+7)",
      Singapore: "SGT (UTC+8)",
      UAE: "GST (UTC+4)",
      Spain: "CET (UTC+1)",
      Italy: "CET (UTC+1)",
      France: "CET (UTC+1)",
      Switzerland: "CET (UTC+1)",
      Norway: "CET (UTC+1)",
      Iceland: "GMT (UTC+0)",
      Canada: "MST (UTC-7)"
    };
    const timezone = timezoneMap[countryKey] || "UTC+1";

    const highlights = baseDestination.highlights || [baseDestination.city || "local landmarks"];
    const vibe = baseDestination.vibe || "wonderful";

    const fallbackDetails = {
      about: baseDestination.about || [
        `Welcome to ${baseDestination.city}, a premier destination located in ${baseDestination.country}. Known for its unique ${vibe.toLowerCase()} atmosphere, it offers an incredible mix of sightseeing and rich experiences.`,
        `The local history and heritage are visible in iconic landmarks like ${highlights.slice(0, 2).join(" and ")}. Visitors can immerse themselves in the local culture, tradition, and custom etiquette during their stay.`,
        `Explore signature highlights, enjoy delicious dining options, and connect with the welcoming local community. With scenic viewpoints and highly rated activities, ${baseDestination.city} promises an unforgettable travel adventure.`
      ],
      bestTimeToVisit: baseDestination.bestTimeToVisit || baseDestination.bestSeason || "Spring and Autumn months",
      averageDailyBudget: baseDestination.averageDailyBudget || budgetMap[budgetLevel] || "$80 - $150 USD per day",
      localTransport: baseDestination.localTransport || transport,
      safetyLevel: baseDestination.safetyLevel || "High (Safe for solo and family travelers, standard precautions apply)",
      emergencyNumber: baseDestination.emergencyNumber || emergencyNumber,
      famousFoods: baseDestination.famousFoods || baseDestination.food || ["Local Specialities"],
      travelTips: baseDestination.travelTips || [
        `Carry a mix of cards and local cash for small purchases or vendors.`,
        `Plan to visit top sights like ${highlights[0]} early to beat the crowds.`,
        `Download local offline maps to navigate transit routes seamlessly.`,
        `Dress respectfully and observe local etiquette when visiting sacred or historic sites.`,
        `Ask restaurant staff for recommendation specials to try local cuisine.`
      ],
      timezone: baseDestination.timezone || timezone
    };

    return {
      ...baseDestination,
      ...fallbackDetails,
      ...aiDetails,
      currency: baseDestination.currency
    };
  }, [baseDestination, aiDetails, userPrefs]);

  const isSaved = destination?.id ? isWishlisted(destination.id) : false;

  useEffect(() => {
    if (destination && (!selectedDestination || selectedDestination.id !== destination.id)) {
      setSelectedDestination(destination);
    }
  }, [destination, selectedDestination, setSelectedDestination]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoading(false));
    return () => cancelAnimationFrame(frame);
  }, [destinationId, selectedDestination]);

  // Fetch weather summary
  useEffect(() => {
    if (destination?.weatherCity) {
      setWeatherLoading(true);
      fetchWeather(destination.weatherCity)
        .then((data) => {
          setWeatherData(data);
          setWeatherLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load weather summary:", err);
          setWeatherLoading(false);
        });
    }
  }, [destination]);

  const budgetLevel = userPrefs.budget || destination?.budget || "Comfort";
  const travelers = userPrefs.companions === "Solo" ? 1 : userPrefs.companions === "Partner" ? 2 : 4;
  const durationStr = userPrefs.duration || "5-7 Days";
  
  // Calculate dynamic match score using the quiz matching algorithm
  const matchScore = useMemo(() => {
    if (!destination) return 96;
    const matches = calculateDestinationMatches(userPrefs);
    const matchObj = matches.find(m => m.id === destination.id);
    return matchObj ? matchObj.match : 96;
  }, [destination, userPrefs]);

  // Fetch planner datasets
  const budget = useMemo(() => destination ? calculateBudgetBreakdown(destination.id, budgetLevel, travelers, durationStr) : null, [destination, budgetLevel, travelers, durationStr]);
  const attractions = useMemo(() => destination ? getAttractionOptions(destination.id) : [], [destination]);
  const dailySchedule = useMemo(() => destination ? getDailySchedule(destination.id, userPrefs.tripType || "Relaxation") : [], [destination, userPrefs.tripType]);
  const localInfo = useMemo(() => destination ? getLocalInfo(destination.id) : null, [destination]);
  const travelTips = useMemo(() => destination ? getPersonalizedTips(destination.id, userPrefs) : [], [destination, userPrefs]);

  const aboutParagraphs = useMemo(() => {
    if (!destination) return [];
    return getDetailedAboutContent(destination.id, destination.city, destination.country);
  }, [destination]);

  useEffect(() => {
    if (destination) {
      setHotelsLoading(true);
      setHotelsError(null);
      fetchHotels(destination.city, destination.coordinates, budgetLevel)
        .then((data) => {
          setHotels(data);
          setHotelsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch hotels from API:", err);
          setHotelsError("Unable to load live hotel options. Please try again later.");
          setHotelsLoading(false);
        });
    }
  }, [destination, budgetLevel]);

  useEffect(() => {
    if (destination) {
      setRestaurantsLoading(true);
      setRestaurantsError(null);
      fetchRestaurants(destination.city, destination.coordinates, budgetLevel)
        .then((data) => {
          setRestaurants(data);
          setRestaurantsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch restaurants from API:", err);
          setRestaurantsError("Unable to load live dining options. Please try again later.");
          setRestaurantsLoading(false);
        });
    }
  }, [destination, budgetLevel]);

  useEffect(() => {
    if (destination) {
      setFlightsLoading(true);
      setFlightsError(null);
      fetchFlights(destination.city, destination.airport, budgetLevel, departureCity)
        .then((data) => {
          setFlights(data);
          setFlightsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch flights:", err);
          setFlightsError("Unable to retrieve real-time flight fares. Please try again.");
          setFlightsLoading(false);
        });
    }
  }, [destination, budgetLevel, departureCity]);

  // Weather summary string
  const weatherSummary = useMemo(() => {
    if (weatherLoading) return "Loading...";
    if (weatherData) {
      const desc = weatherData.description || "";
      const capitalized = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "Mild conditions";
      return `${capitalized}, ${Math.round(weatherData.temperature)}°C`;
    }
    return "Mild & Sunny"; // Fallback default
  }, [weatherData, weatherLoading]);

  // Action handlers
  const handleBooking = (type, name) => {
    alert(`🎉 Booking simulation: Your request for the ${type} "${name}" at ${destination?.city} has been logged. In production, this proceeds to checkout.`);
  };

  const handleSaveTrip = () => {
    if (!destination) return;
    if (isSaved) {
      removeFromWishlist(destination.id);
      alert("Trip removed from wishlist.");
    } else {
      addToWishlist(destination);
      alert("❤️ Trip successfully saved! You can access this itinerary anytime under your Profile.");
    }
  };

  const handleShareTrip = () => {
    if (navigator.share) {
      navigator.share({
        title: `My travel plan to ${destination?.city} via Travio`,
        text: `Check out my personalized travel plan for ${destination?.city}: ${budget?.days} days, estimated budget $${budget?.totalCost}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("📋 Link copied to clipboard! Share it with your friends.");
    }
  };

  const handleExportPDF = () => {
    alert("📄 Export PDF: Generating travel overview brochure. Downloading will start shortly...");
  };

  if (isLoading) {
    return (
      <div className="details-page details-status-page">
        <Navbar />
        <main className="details-skeleton-container" aria-live="polite">
          {/* Skeleton Hero Section */}
          <div className="skeleton-hero shimmer-bg" />
          
          {/* Skeleton Title block */}
          <div className="skeleton-title-container">
            <div className="skeleton-line title shimmer-bg" />
            <div className="skeleton-line subtitle shimmer-bg" />
          </div>

          {/* Skeleton Grid Details */}
          <div className="skeleton-grid">
            <div className="skeleton-card shimmer-bg" />
            <div className="skeleton-card shimmer-bg" />
          </div>

          {/* Skeleton Tabs Bar */}
          <div className="skeleton-tabs-nav">
            <div className="skeleton-tab-pill shimmer-bg" />
            <div className="skeleton-tab-pill shimmer-bg" />
            <div className="skeleton-tab-pill shimmer-bg" />
            <div className="skeleton-tab-pill shimmer-bg" />
          </div>

          {/* Skeleton Content Grid */}
          <div className="skeleton-content-grid">
            <div className="skeleton-content-card shimmer-bg" />
            <div className="skeleton-content-card shimmer-bg" />
            <div className="skeleton-content-card shimmer-bg" />
          </div>
        </main>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="details-page details-status-page">
        <Navbar />
        <main className="details-error" role="alert" style={{ textAlign: "center", padding: "100px 20px" }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: "1.8rem", color: "#1e293b", fontWeight: "800" }}>Destination Not Found</h1>
          <p style={{ color: "#64748b", fontSize: "1rem", marginTop: "8px", marginBottom: "24px" }}>
            We couldn't find a destination matching "{destinationId || "your selection"}". Explore our featured travel destinations around the world.
          </p>
          <button 
            onClick={() => navigate("/results")}
            style={{
              padding: "12px 28px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer"
            }}
          >
            Explore All Destinations
          </button>
        </main>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <section id="about" className="details-panel about-panel details-reveal" style={{ maxWidth: "1160px", margin: "40px auto 24px", padding: "28px" }}>
            <p className="section-kicker">THE FEELING</p>
            <h2 style={{ fontSize: "2rem", fontWeight: "750", color: "#172033", marginTop: "10px" }}>About {destination.city}</h2>
            {aboutParagraphs.map((para, idx) => (
              <p key={idx} style={{ marginTop: idx === 0 ? "18px" : "16px", color: "#617089", lineHeight: "1.75", fontSize: "1.08rem" }}>
                {para}
              </p>
            ))}
            <div className="details-rating" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", maxWidth: "200px" }} aria-label={`AI rating ${destination.aiRating} out of 5`}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#bac4dc", textTransform: "uppercase" }}>AI Rating</span>
                <strong style={{ fontSize: "1.3rem", color: "#ffcc64", display: "block", marginTop: "2px" }}>★ {destination.aiRating.toFixed(1)}</strong>
              </div>
            </div>
          </section>
        );
      case "highlights":
        return (
          <section id="highlights" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto" }}>
            <div className="section-heading">
              <div>
                <p className="section-kicker">DON'T MISS</p>
                <h2>Signature Highlights</h2>
              </div>
            </div>
            <div className="highlights-grid">
              {(destination.highlights || []).map((highlight, idx) => {
                const { icon, sentence } = getHighlightDetail(highlight, destination.city);
                return (
                  <div key={idx} className="highlight-card">
                    <div className="highlight-icon">{icon}</div>
                    <div className="highlight-info">
                      <h4 className="highlight-title">{highlight}</h4>
                      <p className="highlight-desc">{sentence}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {attractions && attractions.length > 0 && (
              <div style={{ marginTop: "40px" }}>
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">🧭 SIGHTSEEING</p>
                    <h2>Must Visit Places</h2>
                  </div>
                </div>
                <p className="planner-intro-text">The highest rated landmarks, historical temples, and nature routes near {destination.city}.</p>
                <div className="attractions-grid">
                  {attractions.map((attraction, idx) => (
                    <AttractionCard 
                      key={idx} 
                      attraction={attraction} 
                      onViewOnMap={handleViewOnMap}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      case "experiences":
        return (
          <section id="experiences" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto" }}>
            <div className="section-heading">
              <div>
                <p className="section-kicker">RECOMMENDED ACTIVITIES</p>
                <h2>What to Experience</h2>
              </div>
            </div>
            <div className="experiences-grid">
              {getRecommendedExperiences(destination).map((exp) => (
                <div key={exp.id} className="experience-card">
                  <div className="experience-icon-box">
                    <span className="experience-emoji">{exp.icon}</span>
                  </div>
                  <h4 className="experience-title">{exp.title}</h4>
                  <p className="experience-desc">{exp.desc}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case "essentials":
        return (
          <section id="essentials" className="details-panel essentials-panel details-reveal" style={{ maxWidth: "1160px", margin: "40px auto", background: "white", padding: "28px" }}>
            <p className="section-kicker">AT A GLANCE</p>
            <h2 style={{ fontSize: "2rem", fontWeight: "750", color: "#172033", marginTop: "10px", marginBottom: "20px" }}>Travel Essentials</h2>
            
            <div className="quick-facts-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", marginBottom: "40px" }}>
              {/* Currency */}
              <div className="fact-card" style={{ background: "rgba(16, 185, 129, 0.03)" }}>
                <div className="fact-card-header">
                  <div className="fact-icon-box" style={{ background: "rgba(16, 185, 129, 0.08)", color: "#10b981" }}>
                    <CircleDollarSign size={18} />
                  </div>
                  <span className="fact-label">Currency</span>
                </div>
                <strong className="fact-value">{destination.currency}</strong>
              </div>

              {/* Language */}
              <div className="fact-card" style={{ background: "rgba(59, 130, 246, 0.03)" }}>
                <div className="fact-card-header">
                  <div className="fact-icon-box" style={{ background: "rgba(59, 130, 246, 0.08)", color: "#3b82f6" }}>
                    <Languages size={18} />
                  </div>
                  <span className="fact-label">Language</span>
                </div>
                <strong className="fact-value">{destination.language}</strong>
              </div>

              {/* Time Zone */}
              <div className="fact-card" style={{ background: "rgba(99, 102, 241, 0.03)" }}>
                <div className="fact-card-header">
                  <div className="fact-icon-box" style={{ background: "rgba(99, 102, 241, 0.08)", color: "#6366f1" }}>
                    <Clock size={18} />
                  </div>
                  <span className="fact-label">Time Zone</span>
                </div>
                <strong className="fact-value">{destination.timezone}</strong>
              </div>

              {/* Population */}
              <div className="fact-card" style={{ background: "rgba(245, 158, 11, 0.03)" }}>
                <div className="fact-card-header">
                  <div className="fact-icon-box" style={{ background: "rgba(245, 158, 11, 0.08)", color: "#f59e0b" }}>
                    <Users size={18} />
                  </div>
                  <span className="fact-label">Population</span>
                </div>
                <strong className="fact-value">{getPopulation(destination.city)}</strong>
              </div>

              {/* Airport */}
              <div className="fact-card" style={{ background: "rgba(6, 182, 212, 0.03)" }}>
                <div className="fact-card-header">
                  <div className="fact-icon-box" style={{ background: "rgba(6, 182, 212, 0.08)", color: "#06b6d4" }}>
                    <Plane size={18} />
                  </div>
                  <span className="fact-label">Airport</span>
                </div>
                <strong className="fact-value" style={{ fontSize: "0.85rem" }}>{destination.airport}</strong>
              </div>

              {/* Best Travel Months */}
              <div className="fact-card" style={{ background: "rgba(236, 72, 153, 0.03)" }}>
                <div className="fact-card-header">
                  <div className="fact-icon-box" style={{ background: "rgba(236, 72, 153, 0.08)", color: "#ec4899" }}>
                    <CalendarDays size={18} />
                  </div>
                  <span className="fact-label">Best Visit</span>
                </div>
                <strong className="fact-value" style={{ fontSize: "0.85rem" }}>{destination.bestTimeToVisit || destination.bestSeason}</strong>
              </div>
            </div>

            {/* Budget Breakdown */}
            {budget && (
              <div>
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">💰 BUDGET ESTIMATES</p>
                    <h2>Estimated Cost Breakdown</h2>
                  </div>
                </div>
                <p className="planner-intro-text">Itemized spending summaries for the entire {durationStr} trip duration.</p>
                <BudgetCard 
                  budget={budget} 
                  days={budget.days} 
                  travelers={travelers} 
                />
              </div>
            )}
          </section>
        );
      case "gallery": {
        const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
        const galleryPhotos = destination.gallery || [];
        const heroPhoto = destination.hero || PLACEHOLDER_IMAGE;
        const totalPhotosCount = galleryPhotos.length + (destination.hero ? 1 : 0);
        return (
          <section id="gallery" className="details-gallery-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto" }}>
            <div className="section-heading">
              <div>
                <p className="section-kicker">A CLOSER LOOK</p>
                <h2>Scenes from {destination.city}</h2>
              </div>
              <span>{totalPhotosCount} photos</span>
            </div>
            <GalleryCarousel images={[heroPhoto, ...galleryPhotos].filter(Boolean)} destinationName={destination.city} />
          </section>
        );
      }
      case "weather":
        return (
          <section id="weather" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="section-heading">
              <div>
                <p className="section-kicker"><CloudSun size={15} /> METEOROLOGY</p>
                <h2>Weather &amp; Forecast</h2>
              </div>
            </div>
            <WeatherCard key={destination.id} city={destination.weatherCity} destinationName={destination.city} />

            <article className="details-panel climate-panel" style={{ background: "white", padding: "28px" }}>
              <p className="section-kicker"><CalendarDays size={15} /> CLIMATE &amp; SEASONS</p>
              <h2>Best Time to Visit</h2>
              <p className="climate-text" style={{ fontSize: "1.05rem", lineHeight: "1.7", color: "#617089", marginTop: "14px" }}>
                {destination.bestTimeToVisit || destination.bestSeason}
              </p>
            </article>
          </section>
        );
      case "map":
        return (
          <section id="maps" className="planner-section details-reveal" style={{ padding: 0, margin: "40px auto", width: "100%", maxWidth: "1160px" }}>
            <div className="section-heading" style={{ marginBottom: "20px", padding: "0 10px" }}>
              <div>
                <p className="section-kicker">🗺️ INTERACTIVE ATLAS</p>
                <h2>Explore the Area</h2>
              </div>
            </div>
            <TravelMap 
              coordinates={destination.coordinates} 
              destination={destination}
              hotels={hotels}
              restaurants={restaurants}
              attractions={attractions}
              interactive={true}
              focusItem={mapFocusItem}
              onFocusClear={() => setMapFocusItem(null)}
            />

            {/* Route Planner itinerary */}
            <div style={{ marginTop: "40px", padding: "0 10px" }}>
              <div className="section-heading">
                <div>
                  <p className="section-kicker">📅 ITINERARY PLANNER</p>
                  <h2>Recommended Route &amp; Daily Schedule</h2>
                </div>
              </div>
              <RoutePlanner
                destination={destination}
                hotels={hotels}
                restaurants={restaurants}
                attractions={attractions}
                onViewOnMap={handleViewOnMap}
              />
            </div>
          </section>
        );
      case "hotels":
        return (
          <section id="hotels" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto" }}>
            <div className="section-heading" style={{ marginBottom: "16px" }}>
              <div>
                <p className="section-kicker">🏨 SMART HOTEL SYSTEM</p>
                <h2>Where to Stay in {destination?.city || "Destination"}</h2>
              </div>
            </div>
            <p className="planner-intro-text" style={{ fontSize: "1.05rem", color: "#64748b", margin: "0 0 20px", lineHeight: "1.5" }}>
              Find comfortable stays near your destination, from budget hotels to luxury accommodations.
            </p>
            
            {/* Smart Hotel Filter & Sort Toolbar */}
            <div className="hotel-toolbar-container" style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "20px",
              border: "1px solid #edf0f5",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              marginBottom: "28px"
            }}>
              {/* Tiers & Amenities Filter Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "750", color: "#64748b", marginRight: "2px" }}>Filter:</span>
                
                {["all", "budget", "comfort", "luxury"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setHotelTierFilter(tier)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "0.82rem",
                      fontWeight: "650",
                      border: hotelTierFilter === tier ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: hotelTierFilter === tier ? "#eff6ff" : "#ffffff",
                      color: hotelTierFilter === tier ? "#2563eb" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {tier === "all" ? "All Prices" : tier === "budget" ? "Budget ($)" : tier === "comfort" ? "Mid-range ($$)" : "Luxury ($$$)"}
                  </button>
                ))}

                <span style={{ width: "1px", height: "20px", background: "#cbd5e1", margin: "0 4px" }} />

                {[
                  { label: "Free WiFi", id: "WiFi" },
                  { label: "Breakfast Included", id: "Breakfast" },
                  { label: "Swimming Pool", id: "Pool" },
                  { label: "Parking", id: "Parking" },
                  { label: "Family Friendly", id: "Family" }
                ].map((item) => {
                  const isActive = hotelAmenityFilters.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setHotelAmenityFilters((prev) =>
                          isActive ? prev.filter((a) => a !== item.id) : [...prev, item.id]
                        );
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: "650",
                        border: isActive ? "1px solid #10b981" : "1px solid #e2e8f0",
                        background: isActive ? "#ecfdf5" : "#ffffff",
                        color: isActive ? "#047857" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isActive ? "✓ " : "+ "} {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Smart Sorting Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "750", color: "#64748b" }}>Sort by:</span>
                <select
                  value={hotelSortBy}
                  onChange={(e) => setHotelSortBy(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#1e293b",
                    fontSize: "0.85rem",
                    fontWeight: "650",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  <option value="recommended">⭐ Recommended (Atlas Match)</option>
                  <option value="price_asc">💵 Price: Low to High</option>
                  <option value="price_desc">💎 Price: High to Low</option>
                  <option value="rating_desc">★ Rating: Highest First</option>
                  <option value="distance_asc">📍 Distance: Closest First</option>
                </select>
              </div>
            </div>

            {hotelsLoading ? (
              <div className="hotels-grid">
                {[1, 2, 3].map((sk) => (
                  <div key={sk} className="hotel-premium-card" style={{ height: "420px", animation: "pulse 1.5s infinite" }}>
                    <div style={{ width: "100%", height: "200px", background: "#f1f5f9" }} />
                    <div style={{ padding: "20px" }}>
                      <div style={{ width: "70%", height: "20px", background: "#e2e8f0", borderRadius: "6px", marginBottom: "12px" }} />
                      <div style={{ width: "40%", height: "14px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "16px" }} />
                      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                        <div style={{ width: "60px", height: "24px", background: "#f1f5f9", borderRadius: "12px" }} />
                        <div style={{ width: "60px", height: "24px", background: "#f1f5f9", borderRadius: "12px" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hotelsError ? (
              <div className="premium-empty-state-card" style={{ border: "1px solid #fee2e2", background: "#fff5f5", padding: "40px 20px" }}>
                <AlertCircle size={40} color="#ef4444" className="empty-icon" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ color: "#991b1b" }}>Failed to Load Hotels</h3>
                <p style={{ color: "#b91c1c", marginTop: "4px" }}>{hotelsError}</p>
                <button 
                  onClick={() => {
                    setHotelsLoading(true);
                    setHotelsError(null);
                    fetchHotels(destination.city, destination.coordinates, budgetLevel)
                      .then((data) => {
                        setHotels(data);
                        setHotelsLoading(false);
                      })
                      .catch((err) => {
                        setHotelsError("Unable to load live hotel options. Please try again later.");
                        setHotelsLoading(false);
                      });
                  }}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Retry Search
                </button>
              </div>
            ) : processedHotels.length === 0 ? (
              <div className="premium-empty-state-card">
                <Hotel size={40} className="empty-icon" />
                <h3>No Hotels Match Your Filters</h3>
                <p>Try clearing some filters or changing your price tier.</p>
                <button
                  onClick={() => {
                    setHotelTierFilter("all");
                    setHotelAmenityFilters([]);
                  }}
                  style={{
                    marginTop: "16px",
                    padding: "8px 18px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="hotels-grid">
                {processedHotels.map((hotel, idx) => (
                  <HotelCard 
                    key={hotel.id || idx} 
                    hotel={hotel} 
                    destination={destination}
                    onBooking={handleBooking} 
                    onViewOnMap={handleViewOnMap}
                    onViewDetails={setSelectedHotel}
                    isComparing={compareHotels.some(ch => ch.name === hotel.name)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            )}
          </section>
        );
      case "restaurants":
        return (
          <section id="restaurants" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto" }}>
            <div className="section-heading" style={{ marginBottom: "16px" }}>
              <div>
                <p className="section-kicker">🍜 DINING OUT</p>
                <h2>Where to Eat</h2>
              </div>
            </div>
            <p className="planner-intro-text" style={{ fontSize: "1.05rem", color: "#64748b", margin: "0 0 28px", lineHeight: "1.5" }}>
              Discover top-rated dining spots, authentic local flavors, and memorable culinary experiences.
            </p>
            
            {restaurantsLoading ? (
              <div className="premium-empty-state-card" style={{ padding: "60px 20px" }}>
                <div className="shimmer-bg" style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "0 auto 20px", background: "rgba(37, 99, 235, 0.08)" }} />
                <h3>Fetching Live Restaurants...</h3>
                <p>Querying real-time dining venues for {destination.city}.</p>
              </div>
            ) : restaurantsError ? (
              <div className="premium-empty-state-card" style={{ border: "1px solid #fee2e2", background: "#fff5f5", padding: "40px 20px" }}>
                <AlertCircle size={40} color="#ef4444" className="empty-icon" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ color: "#991b1b" }}>Failed to Load Restaurants</h3>
                <p style={{ color: "#b91c1c", marginTop: "4px" }}>{restaurantsError}</p>
                <button 
                  onClick={() => {
                    setRestaurantsLoading(true);
                    setRestaurantsError(null);
                    fetchRestaurants(destination.city, destination.coordinates, budgetLevel)
                      .then((data) => {
                        setRestaurants(data);
                        setRestaurantsLoading(false);
                      })
                      .catch((err) => {
                        setRestaurantsError("Unable to load live dining options. Please try again later.");
                        setRestaurantsLoading(false);
                      });
                  }}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Retry Search
                </button>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="premium-empty-state-card">
                <Utensils size={40} className="empty-icon" />
                <h3>No Restaurants Found</h3>
                <p>We couldn't locate any dining options nearby for {destination.city} at this time.</p>
              </div>
            ) : (
              <div className="restaurants-grid">
                {restaurants.map((rest, idx) => (
                  <RestaurantCard 
                    key={idx} 
                    restaurant={rest} 
                    destination={destination}
                    onBooking={handleBooking} 
                    onViewOnMap={handleViewOnMap}
                    onViewDetails={setSelectedHotel}
                  />
                ))}
              </div>
            )}
          </section>
        );
      case "flights":
        return (
          <section id="flights" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto" }}>
            <div className="section-heading">
              <div>
                <p className="section-kicker"><Plane size={15} /> TRANSPORTATION</p>
                <h2>How to Get There</h2>
              </div>
            </div>
            <p className="planner-intro-text">We compared flight options for {travelers} ticket{travelers > 1 ? "s" : ""} from {departureCity ? `${departureCity.name} (${departureCity.code})` : "Bengaluru (BLR)"} to {destination.city} Airport.</p>
            
            {flightsLoading ? (
              <div className="premium-empty-state-card" style={{ padding: "60px 20px", marginBottom: "40px" }}>
                <div className="shimmer-bg" style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "0 auto 20px", background: "rgba(37, 99, 235, 0.08)" }} />
                <h3>Finding Live Flight Deals...</h3>
                <p>Comparing routes from {departureCity ? departureCity.name : "Bengaluru"} to {destination.city} Airport.</p>
              </div>
            ) : flightsError ? (
              <div className="premium-empty-state-card" style={{ border: "1px solid #fee2e2", background: "#fff5f5", padding: "40px 20px", marginBottom: "40px" }}>
                <AlertCircle size={40} color="#ef4444" className="empty-icon" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ color: "#991b1b" }}>Failed to Load Flights</h3>
                <p style={{ color: "#b91c1c", marginTop: "4px" }}>{flightsError}</p>
                <button 
                  onClick={() => {
                    setFlightsLoading(true);
                    setFlightsError(null);
                    fetchFlights(destination.city, destination.airport, budgetLevel, departureCity)
                      .then((data) => {
                        setFlights(data);
                        setFlightsLoading(false);
                      })
                      .catch((err) => {
                        setFlightsError("Unable to retrieve real-time flight fares. Please try again.");
                        setFlightsLoading(false);
                      });
                  }}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Retry Search
                </button>
              </div>
            ) : (
              <div className="flights-list-wrapper">
                {flights.map((flight, idx) => (
                  <div className="premium-flight-card" key={idx}>
                    {flight.badge && (
                      <span className={`flight-card-badge badge-${flight.badge.toLowerCase().replace(" ", "-")}`}>
                        {flight.badge}
                      </span>
                    )}
                    
                    <div className="flight-carrier-info">
                      <div className="flight-carrier-logo">
                        {flight.logo}
                      </div>
                      <div className="flight-carrier-text">
                        <h4>{flight.airline}</h4>
                        <span>Flight {flight.flightNumber}</span>
                      </div>
                    </div>

                    <div className="flight-route-details">
                      <div className="flight-station origin">
                        <span className="station-time">{flight.departureTime}</span>
                        <span className="station-code">{flight.departureCode}</span>
                        <span className="station-city">{departureCity ? departureCity.name : "Bengaluru"}</span>
                      </div>

                      <div className="flight-path-indicator">
                        <span className="flight-path-duration">{flight.duration}</span>
                        <div className="flight-path-line-wrapper">
                          <div className="flight-path-dot" />
                          <div className="flight-path-line" />
                          <Plane size={14} className="plane-icon" style={{ transform: "rotate(90deg)" }} />
                          <div className="flight-path-dot" />
                        </div>
                        <span className={`flight-path-stops ${flight.stops === "Non-stop" ? "non-stop" : ""}`}>
                          {flight.stops}
                        </span>
                      </div>

                      <div className="flight-station destination">
                        <span className="station-time">{flight.arrivalTime}</span>
                        <span className="station-code">{flight.arrivalCode}</span>
                        <span className="station-city">{destination.city}</span>
                      </div>
                    </div>

                    <div className="flight-booking-pane">
                      <div>
                        <span className="flight-cabin-label">{flight.cabinClass}</span>
                        <div className="flight-price-amount">
                          <strong>{formatDualPrice(flight.price, destination.currency, departureCity?.currency || "INR")}</strong>
                          <span>/ person</span>
                        </div>
                      </div>
                      <button 
                        className="flight-select-btn"
                        onClick={() => handleBooking("Flight ticket", `${flight.airline} (${flight.flightNumber} ${departureCity ? departureCity.code : "JFK"} ➔ ${flight.arrivalCode})`)}
                      >
                        Book Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      case "travel-guide":
        return (
          <section id="travel-guide" className="planner-section details-reveal" style={{ maxWidth: "1160px", margin: "40px auto 120px" }}>
            <div className="section-heading">
              <div>
                <p className="section-kicker"><Globe size={15} /> VISITOR HANDBOOK</p>
                <h2>Travel Guide &amp; Directory</h2>
              </div>
            </div>
            
            {localInfo && <LocalInfoCard localInfo={localInfo} destination={destination} />}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="details-page">
      <Navbar />
      <main>
        <HeroSection destination={destination} />

        {/* Tab System Sticky Navigation */}
        <nav className="details-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Active Tab Viewport */}
        <div className="tab-content-container" style={{ minHeight: "400px" }}>
          {renderTabContent()}
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky-action-bar">
          <button 
            className={`action-btn-pill save-btn ${isSaved ? "active" : ""}`}
            onClick={handleSaveTrip}
          >
            <Heart size={16} fill={isSaved ? "#FFF" : "transparent"} />
            {isSaved ? "Saved" : "Save Trip"}
          </button>
          <button 
            className="action-btn-pill share-btn"
            onClick={handleShareTrip}
          >
            <Share2 size={16} /> Share
          </button>
          <button 
            className="action-btn-pill pdf-btn"
            onClick={handleExportPDF}
          >
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </main>
      {selectedHotel && (
        <HotelDetailsModal
          hotel={selectedHotel}
          destination={destination}
          onClose={() => setSelectedHotel(null)}
          onReserve={() => handleBooking("hotel stay", selectedHotel.name)}
          onViewOnMap={() => handleViewOnMap("hotel", selectedHotel)}
          matchScore={matchScore}
        />
      )}
    </div>
  );
}
