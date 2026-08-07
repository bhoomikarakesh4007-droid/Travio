import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weatherRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";

import aiRoutes from "./routes/aiRoutes.js";
import { chatWithAssistant } from "./controllers/aiController.js";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/ai", aiRoutes);
app.post("/api/chat", chatWithAssistant);

app.use("/api/weather", weatherRoutes);
app.use("/api/hotels", hotelRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Travio Server Running on Port ${PORT}`);

});