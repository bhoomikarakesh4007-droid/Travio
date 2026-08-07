import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    timeout: 15000
});

export async function generateTrip(data){
    try {
        if (data) {
            sessionStorage.setItem("travio_user_preferences", JSON.stringify(data));
        }
    } catch (e) {
        console.error("Failed to store preferences in sessionStorage", e);
    }

    const response = await API.post(
        "/ai/generate",
        data
    );

    if (!Array.isArray(response.data?.recommendations)) {
        throw new Error("The recommendation service returned an invalid response.");
    }

    return response.data;
}

export async function generateSmartRoute(data) {
    const response = await API.post("/ai/route", data);

    if (!Array.isArray(response.data?.orderedStops)) {
        throw new Error("The route planner returned an invalid response.");
    }

    return response.data;
}

export async function chatWithAssistant(message, history, context) {
    const response = await API.post(
        "/ai/chat",
        { message, history, context }
    );
    return response.data;
}

export async function chatWithAtlas(message, history, context) {
    const response = await API.post(
        "/chat",
        { message, history, context }
    );
    return response.data;
}
