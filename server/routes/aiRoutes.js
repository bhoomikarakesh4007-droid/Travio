import express from "express";

import { 
    generateTrip, 
    chatWithAssistant, 
    generateSmartRoute,
    getDestinationDetails,
    generateItinerary
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", generateTrip);
router.post("/route", generateSmartRoute);
router.post("/chat", chatWithAssistant);
router.get("/destination-details/:id", getDestinationDetails);
router.post("/itinerary", generateItinerary);

export default router;
