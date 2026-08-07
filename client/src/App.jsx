import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import SplashScreen from "./components/SplashScreen";
import LoginWelcomePage from "./components/LoginWelcomePage";
import HomePage from "./components/HomePage";
import PreferencesPage from "./components/PreferencesPage";
import ResultsPage from "./components/ResultsPage";
import DetailsPage from "./components/DetailsPage";
import ItineraryPage from "./components/ItineraryPage";
import PackingPage from "./components/PackingPage";
import ProfilePage from "./components/ProfilePage";
import WishlistPage from "./components/WishlistPage";
import SharePage from "./components/SharePage";
import LoadingPage from "./components/LoadingPage";
import { useAuth } from "./context/AuthContext";
import Atlas from "./components/Atlas";
import AtlasPage from "./components/AtlasPage";
import DepartureCityModal from "./components/planner/DepartureCityModal";

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const publicPaths = ["/", "/login"];

  if (loading) {
    return <LoadingPage />;
  }

  if (!currentUser && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser && location.pathname === "/login") {
    return <Navigate to="/home" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginWelcomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/preferences" element={<PreferencesPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/explore" element={<ResultsPage />} />
      <Route path="/explore/:destinationId" element={<DetailsPage />} />
      <Route path="/details" element={<DetailsPage />} />
      <Route path="/details/:destinationId" element={<DetailsPage />} />
      <Route path="/destination" element={<DetailsPage />} />
      <Route path="/destination/:destinationId" element={<DetailsPage />} />
      <Route path="/itinerary" element={<ItineraryPage />} />
      <Route path="/packing" element={<PackingPage />} />
      <Route path="/concierge" element={<Navigate to="/atlas" replace />} />
      <Route path="/assistant" element={<Navigate to="/atlas" replace />} />
      <Route path="/atlas" element={<AtlasPage />} />
      <Route path="/share" element={<SharePage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/history" element={<Navigate to="/itinerary" replace />} />
      <Route path="/settings" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <AppRoutes />
      <Atlas />
      <DepartureCityModal />
    </>
  );
}
