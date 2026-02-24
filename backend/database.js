const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper function to update session `updated_at`
const touchSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO sessions (id, created_at, updated_at) 
       VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
            [sessionId],
            function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

const saveMessage = (sessionId, role, content) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)`,
            [sessionId, role, content],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

const getRecentMessages = (sessionId, limit = 10) => {
    return new Promise((resolve, reject) => {
        // We fetch the last `limit` messages (which means `limit/2` pairs roughly)
        db.all(
            `SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?`,
            [sessionId, limit],
            (err, rows) => {
                if (err) reject(err);
                // Reverse to get chronological order for the prompt
                else resolve(rows.reverse());
            }
        );
    });
};

const getAllMessagesForSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
            [sessionId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

const getSessions = () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, updated_at FROM sessions ORDER BY updated_at DESC`,
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        )
    })
}

module.exports = {
    db,
    touchSession,
    saveMessage,
    getRecentMessages,
    getAllMessagesForSession,
    getSessions
};
