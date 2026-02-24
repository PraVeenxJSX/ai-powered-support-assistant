const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const {
    db,
    touchSession,
    saveMessage,
    getRecentMessages,
    getAllMessagesForSession,
    getSessions
} = require('./database');
const { generateSupportResponse } = require('./aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }));
app.use(express.json());

// Rate Limiter: maximum of 20 requests per minute per IP to specific endpoints
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    message: { error: 'Too many requests from this IP, please try again after a minute.' },
});

// API Endpoints

// GET /api/sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await getSessions();
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ error: "Failed to fetch sessions." });
    }
});


// GET /api/conversations/:sessionId
app.get('/api/conversations/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) {
        return res.status(400).json({ error: "sessionId parameter is required." });
    }

    try {
        const messages = await getAllMessagesForSession(sessionId);
        res.json(messages);
    } catch (error) {
        console.error(`Error fetching conversation for ${sessionId}:`, error);
        res.status(500).json({ error: "Failed to fetch conversation history." });
    }
});


// POST /api/chat
app.post('/api/chat', limiter, async (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: "Both sessionId and message are required." });
    }

    try {
        // 1. Ensure session exists and update timestamp
        await touchSession(sessionId);

        // 2. Save User Message
        await saveMessage(sessionId, 'user', message);

        // 3. Get recent history (limit 10 = last 5 pairs)
        const recentHistory = await getRecentMessages(sessionId, 10);

        // 4. Call AI Generation
        let aiResult = {};
        try {
            aiResult = await generateSupportResponse(message, recentHistory);
        } catch (llmError) {
            console.error("LLM Error:", llmError);
            return res.status(502).json({ error: "AI service temporarily unavailable." });
        }

        // 5. Save AI Response
        await saveMessage(sessionId, 'assistant', aiResult.reply);

        // 6. Return response
        res.json({
            reply: aiResult.reply,
            tokensUsed: aiResult.tokensUsed
        });

    } catch (error) {
        console.error("Database or Server Error:", error);
        res.status(500).json({ error: "Internal Server Error while processing chat." });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Support Assistant Backend running on http://localhost:${PORT}`);
});
