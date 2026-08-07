// main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { TravelProvider } from "./context/TravelContext";
import { TravelSessionProvider } from "./context/TravelSessionContext";
import { WishlistProvider } from "./context/WishlistContext";

import "./styles/variables.css";
import "./styles/global.css";
import "./styles/animations.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TravelProvider>
          <TravelSessionProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </TravelSessionProvider>
        </TravelProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
