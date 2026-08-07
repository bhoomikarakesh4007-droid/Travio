import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearActiveSession } from "../services/atlasHistoryService";
import AtlasButton from "./AtlasButton";
import AtlasChat from "./AtlasChat";

const AVATAR_SIZE = 115;

const clampAvatarPosition = (x, y) => {
  const maxX = window.innerWidth - AVATAR_SIZE - 15;
  const maxY = window.innerHeight - AVATAR_SIZE - 15;
  return {
    x: Math.max(15, Math.min(maxX, x)),
    y: Math.max(15, Math.min(maxY, y))
  };
};

export default function Atlas() {
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  
  const [reachedHome, setReachedHome] = useState(() => {
    try {
      return sessionStorage.getItem("travio_atlas_reached_home") === "true";
    } catch {
      return false;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem("travio_atlas_minimized");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Track if we reached the home page during the current session
  useEffect(() => {
    if (location.pathname === "/home" && currentUser) {
      setReachedHome(true);
      try {
        sessionStorage.setItem("travio_atlas_reached_home", "true");
      } catch (e) {
        console.error(e);
      }
    }
  }, [location.pathname, currentUser]);

  // Clear session flag and conversation on logout
  useEffect(() => {
    if (!currentUser) {
      setReachedHome(false);
      try {
        sessionStorage.removeItem("travio_atlas_reached_home");
      } catch (e) {
        console.error(e);
      }
      clearActiveSession();
    }
  }, [currentUser]);

  // Avatar position state
  const [avatarPosition, setAvatarPosition] = useState(() => {
    try {
      const saved = localStorage.getItem("travio_atlas_position");
      if (saved) {
        const parsed = JSON.parse(saved);
        return clampAvatarPosition(parsed.x, parsed.y);
      }
    } catch (e) {
      console.error(e);
    }
    // Default bottom-right corner: right 30px, bottom 30px
    return {
      x: window.innerWidth - AVATAR_SIZE - 30,
      y: window.innerHeight - AVATAR_SIZE - 30
    };
  });

  // Clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setAvatarPosition((prev) => clampAvatarPosition(prev.x, prev.y));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save position when it changes
  useEffect(() => {
    localStorage.setItem("travio_atlas_position", JSON.stringify(avatarPosition));
  }, [avatarPosition]);

  // Dragging state and refs
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleMouseDown = (e) => {
    // Only left click drags
    if (e.button !== 0) return;
    
    // Prevent drag on tooltip or child text
    if (e.target.closest(".atlas-tooltip")) return;

    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...avatarPosition };
    hasMoved.current = false;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault(); // Prevent text selection/drag behaviors
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved.current = true;
    }

    const nextX = initialPos.current.x + dx;
    const nextY = initialPos.current.y + dy;

    setAvatarPosition(clampAvatarPosition(nextX, nextY));
  };

  const handleMouseUp = (e) => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (!hasMoved.current) {
      // Trigger normal click opening
      handleOpen();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    localStorage.setItem("travio_atlas_minimized", JSON.stringify(false));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      localStorage.setItem("travio_atlas_minimized", JSON.stringify(next));
      return next;
    });
  };

  // Calculate intelligent chat panel position
  const getChatPosition = () => {
    const chatW = 380;
    const chatH = isMinimized ? 68 : Math.min(600, window.innerHeight - 160);
    const gap = 15;

    // Check if the center of the avatar is on the right half of the viewport
    const isRightHalf = (avatarPosition.x + AVATAR_SIZE / 2) > (window.innerWidth / 2);

    let chatX = 0;
    if (isRightHalf) {
      // Place chat to the left of the avatar
      chatX = avatarPosition.x - chatW - gap;
    } else {
      // Place chat to the right of the avatar
      chatX = avatarPosition.x + AVATAR_SIZE + gap;
    }

    // Vertically center the chat panel relative to the avatar
    let chatY = avatarPosition.y + (AVATAR_SIZE / 2) - (chatH / 2);

    // Keep chat inside the viewport (leaving at least 15px gap)
    const maxX = window.innerWidth - chatW - 15;
    const maxY = window.innerHeight - chatH - 15;

    chatX = Math.max(15, Math.min(maxX, chatX));
    chatY = Math.max(15, Math.min(maxY, chatY));

    return { x: chatX, y: chatY };
  };

  const chatPosition = getChatPosition();

  const isPublicOrLoadingPage = 
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname === "/loading" || 
    loading;

  if (!currentUser || isPublicOrLoadingPage || !reachedHome) {
    return null;
  }

  return (
    <>
      <AtlasButton 
        isOpen={isOpen} 
        position={avatarPosition}
        onMouseDown={handleMouseDown}
      />
      <AtlasChat
        isOpen={isOpen}
        onClose={handleClose}
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
        chatPosition={chatPosition}
      />
    </>
  );
}
