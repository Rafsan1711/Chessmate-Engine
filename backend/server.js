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

// Hugging Face থেকে .db ফাইলের লিংক
const DB_URL = "https://huggingface.co/datasets/Rafs-an09002/chessmate-opening-stats/resolve/main/chess_stats.db";
// ফাইলটি যেখানে সেভ হবে
const DB_PATH = path.join(__dirname, 'chess_stats.db');

let db = null;

// ১. ডেটাবেস ডাউনলোড এবং কানেক্ট করার ফাংশন
async function initDatabase() {
    try {
        // যদি ফাইল না থাকে, তাহলে ডাউনলোড করো
        if (!fs.existsSync(DB_PATH)) {
            console.log("⏳ Database file missing. Downloading from Hugging Face...");
            console.log("This may take 10-20 seconds...");

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
            console.log("✅ Download finished!");
        } else {
            console.log("✅ Database file found locally.");
        }

        // ২. SQLite কানেক্ট করা
        // 'readonly: true' দিচ্ছি যাতে পারফর্মেন্স ভালো হয় এবং ভুলে ডেটা এডিট না হয়
        db = new Database(DB_PATH, { readonly: true });
        console.log("🚀 SQLite Database Connected Successfully!");

    } catch (error) {
        console.error("❌ Database Init Error:", error);
    }
}

// হেলথ চেক রুট
app.get('/', (req, res) => {
    res.send("Chessmate API (SQLite Version) is Running! ♟️");
});

// মেইন স্ট্যাটস রুট
app.get('/api/stats', (req, res) => {
    // যদি ডেটাবেস রেডি না থাকে
    if (!db) {
        return res.status(503).json({ error: "Database is initializing, please wait..." });
    }

    const fen = req.query.fen;
    if (!fen) return res.status(400).json({ error: "Missing FEN" });

    // FEN ক্লিন করা (প্রথম ৪ অংশ)
    // rnbqkbnr/pp... 0 1  ---> rnbqkbnr/pp...
    const cleanFen = fen.split(" ").slice(0, 4).join(" ");

    try {
        // ৩. ডেটাবেস থেকে কুয়েরি করা
        // আমরা সরাসরি 'positions' টেবিল থেকে 'stats' কলাম খুঁজছি
        const row = db.prepare('SELECT stats FROM positions WHERE fen = ?').get(cleanFen);

        if (row) {
            // ডেটা পাওয়া গেলে JSON এ কনভার্ট করে পাঠানো
            res.json({
                fen: cleanFen,
                found: true,
                stats: JSON.parse(row.stats)
            });
        } else {
            res.json({
                fen: cleanFen,
                found: false,
                message: "Position not found in database"
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
    // সার্ভার চালুর সাথে সাথে ডেটাবেস সেটআপ শুরু হবে
    await initDatabase();
});