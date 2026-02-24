# Comprehensive Testing Guide: AI-Powered Support Assistant

This guide provides step-by-step instructions on how to fully test every component of the AI-Powered Support Assistant, including the frontend UI, all backend API endpoints, and the SQLite database.

---

## 🏗️ 1. Environment Setup

Before testing, ensure both servers are running.

### Start the Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd "D:\projects\ai powered support assistent\backend"
   ```
2. Verify your `.env` file has a valid `GEMINI_API_KEY`.
3. Start the backend server:
   ```bash
   npm start
   ```
   *(Or `npm run dev` if you prefer nodemon)*

### Start the Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd "D:\projects\ai powered support assistent\frontend"
   ```
2. Start the Vite server:
   ```bash
   npm run dev
   ```

---

## 🖥️ 2. Testing the Frontend UI

1. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173` or `http://localhost:5174`).
2. **Basic Chat Flow:** Type "Hello, how do I reset my password?" and press Enter. Ensure the AI responds with the information strictly from `docs.json`.
3. **Out of Scope Handling:** Type "What is the largest animal in the world?". The AI **MUST** respond exactly with: "Sorry, I don't have information about that."
4. **Session Persistence:** Refresh the browser. Your chat history should reload automatically.
5. **New Chat Instance:** Click the "New Chat" button on the top right. The chat interface should clear, and a new unique session should begin.

---

## 🔌 3. Testing Backend API Endpoints (via cURL or Postman)

You can test the raw HTTP endpoints using standard tools like `curl`, Postman, or PowerShell's `Invoke-RestMethod`.

### A. Test Chat Generation (`POST /api/chat`)
This tests the LLM integration and message saving.

**Command (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method Post -ContentType "application/json" -Body '{"sessionId":"test-session-999", "message":"What are the subscription plans?"}'
```

**Expected Response:** A JSON object containing `reply` and `tokensUsed`.

### B. Test Conversation Retrieval (`GET /api/conversations/:sessionId`)
This fetches all messages tied to a specific session ID.

**Command (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/conversations/test-session-999"
```

**Expected Response:** An array of objects showing `role` (user/assistant), `content`, and chronological timestamps.

### C. Test Active Sessions (`GET /api/sessions`)
This fetches all active session UUIDs in the database.

**Command (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/sessions"
```

**Expected Response:** An array of objects with `id` and `updated_at` properties.

### D. Test Rate Limiting
The app is configured to allow a maximum of 20 requests per minute from a single IP.
To test this, rapidly execute the `Invoke-RestMethod` from step A about 21 times in a row.
**Expected Response:** You should eventually receive an HTTP 429 Error: "Too many requests from this IP..."

---

## 🗃️ 4. Testing the SQLite Database

You can manually inspect the SQLite database to ensure data is persisting correctly.

### Prerequisites (If you don't have sqlite3 installed)
If you don't have the `sqlite3` CLI installed on Windows, you can install it or use a GUI tool like [DB Browser for SQLite](https://sqlitebrowser.org/). We will use a quick Node.js test script to verify it without needing external tools.

### Querying the Database Using Node.js
If you want to quickly check the database contents directly from your terminal:

1. In the `backend` folder, run the interactive Node.js REPL:
   ```bash
   node
   ```
2. Paste the following commands to check the **Sessions** table:
   ```javascript
   const sqlite3 = require('sqlite3').verbose();
   const db = new sqlite3.Database('./database.sqlite');
   
   db.all("SELECT * FROM sessions LIMIT 5;", [], (err, rows) => {
       console.log("SESSIONS:\n", rows);
   });
   ```
3. Paste the following commands to check the **Messages** table:
   ```javascript
   db.all("SELECT * FROM messages LIMIT 10;", [], (err, rows) => {
       console.log("MESSAGES:\n", rows);
   });
   ```
4. Press `Ctrl + C` twice to exit Node REPL. 

**Expected Result:** You should see multiple rows printed showing the UUIDs of your testing sessions, as well as the text history of both `user` and `assistant` interactions.
