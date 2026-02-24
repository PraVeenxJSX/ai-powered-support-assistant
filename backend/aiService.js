const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Load Knowledge Base
const docsPath = path.resolve(__dirname, 'docs.json');
const knowledgeBase = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

// Format Knowledge Base for the Prompt
const kbText = knowledgeBase.map(doc => `Title: ${doc.title}\nContent: ${doc.content}`).join('\n\n');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateSupportResponse = async (userMessage, recentHistory) => {
    try {
        const systemPrompt = `You are a helpful customer support assistant for a software product.
Your PRIMARY and FOREMOST directive is to answer user queries STRICTLY based on the provided Knowledge Base.
If the answer to the user's question cannot be found or fully inferred from the Knowledge Base, you MUST reply exactly with: "Sorry, I don't have information about that."
Do not attempt to answer questions using outside knowledge. Do not apologize profusely. Do not add conversational filler if the answer isn't there.

=== KNOWLEDGE BASE ===
${kbText}
======================

Here is the recent conversation history for context:
${recentHistory.length > 0 ? recentHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n') : "(No prior history)"}
`;

        const prompt = `${systemPrompt}\n\nUser Question: ${userMessage}\nAssistant Response:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Keep it grounded and deterministic
            }
        });

        // genai sdk response contains token counts in response.usageMetadata
        const reply = response.text;
        const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

        return { reply, tokensUsed };

    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
};

module.exports = {
    generateSupportResponse
};
