const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- UPDATE: V2 Database Configuration ---
// নতুন রিপোজিটরি এবং ফাইলের নাম
const DB_URL = "https://huggingface.co/datasets/Rafs-an09002/chessmate-data-v2/resolve/main/chess_stats_v2.db";
// ফাইলটি যেখানে সেভ হবে
const DB_PATH = path.join(__dirname, 'chess_stats_v2.db');

let db = null;

// ডেটাবেস ডাউনলোড এবং কানেক্ট করার ফাংশন
async function initDatabase() {
    try {
        // ফাইল আগে থেকেই আছে কিনা চেক করা
        if (!fs.existsSync(DB_PATH)) {
            console.log("⏳ V2 Database missing. Downloading High-Quality DB (800MB+)...");
            console.log("⚠️ This might take 1-2 minutes on the first run.");

            const writer = fs.createWriteStream(DB_PATH);
            
            const response = await axios({
                url: DB_URL,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log("✅ V2 Database Downloaded Successfully!");
        } else {
            console.log("✅ V2 Database found locally.");
        }

        // SQLite কানেক্ট করা (Read Only Mode for Speed)
        db = new Database(DB_PATH, { readonly: true });
        console.log("🚀 SQLite V2 Connected! Ready to serve Pro Stats.");

    } catch (error) {
        console.error("❌ Database Init Error:", error.message);
    }
}

// হেলথ চেক রুট
app.get('/', (req, res) => {
    res.send("ChessMate AI (Pro V2) is Running! ♟️");
});

// স্ট্যাটস রুট
app.get('/api/stats', (req, res) => {
    if (!db) {
        return res.status(503).json({ error: "Database is initializing, please wait..." });
    }

    const fen = req.query.fen;
    if (!fen) return res.status(400).json({ error: "Missing FEN" });

    // FEN ক্লিন করা (প্রথম ৪ অংশ)
    const cleanFen = fen.split(" ").slice(0, 4).join(" ");

    try {
        // ডেটাবেস কুয়েরি
        const row = db.prepare('SELECT stats FROM positions WHERE fen = ?').get(cleanFen);

        if (row) {
            res.json({
                fen: cleanFen,
                found: true,
                stats: JSON.parse(row.stats)
            });
        } else {
            res.json({
                fen: cleanFen,
                found: false,
                message: "Position not found in V2 database"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database query failed" });
    }
});

// সার্ভার স্টার্ট
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await initDatabase();
});
