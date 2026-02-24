import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL;
const baseURL = envUrl
    ? (envUrl.startsWith('http') ? `${envUrl}/api` : `https://${envUrl}/api`)
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const chatAPI = {
    sendMessage: async (sessionId, message) => {
        try {
            const response = await api.post('/chat', { sessionId, message });
            return response.data;
        } catch (error) {
            console.error("API error sending message:", error);
            throw error.response?.data?.error || "Failed to process message";
        }
    },

    getConversation: async (sessionId) => {
        try {
            const response = await api.get(`/conversations/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error("API error fetching conversation:", error);
            throw error.response?.data?.error || "Failed to load conversation history";
        }
    }
};
