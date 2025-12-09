const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// মিডলওয়্যার (সিকিউরিটি এবং ডেটা প্রসেসিং)
app.use(cors());
app.use(express.json());

// আপনার Hugging Face এর ডেটা ফাইলের লিংক
// লক্ষ্য করুন: আমরা 'resolve/main' ব্যবহার করছি যাতে Raw ফাইল পাওয়া যায়
const DATA_URL = "https://huggingface.co/datasets/Rafs-an09002/chessmate-opening-stats/resolve/main/opening_stats.json";

// ভেরিয়েবল যেখানে আমরা পুরো ডেটা লোড করে রাখব
let openingStats = null;

// সার্ভার চালু হওয়ার সময় ডেটা ডাউনলোড করার ফাংশন
async function loadData() {
    try {
        console.log("⏳ Downloading opening stats from Hugging Face... (Might take a few seconds)");
        const response = await axios.get(DATA_URL);
        openingStats = response.data;
        console.log("✅ Data Loaded Successfully!");
        console.log(`📊 Total Positions Loaded: ${Object.keys(openingStats).length}`);
    } catch (error) {
        console.error("❌ Error loading data:", error.message);
    }
}

// রুট ১: হেলথ চেক (সার্ভার বেঁচে আছে কিনা দেখার জন্য)
app.get('/', (req, res) => {
    res.send("Chessmate API is Running! ♟️");
});

// রুট ২: নির্দিষ্ট পজিশনের স্ট্যাটাস পাওয়ার জন্য
// ব্যবহারবিধি: /api/stats?fen=rnbqk...
app.get('/api/stats', (req, res) => {
    // ১. সার্ভার ডেটা লোড করেছে কিনা চেক করা
    if (!openingStats) {
        return res.status(503).json({ error: "Server is still loading data, please wait..." });
    }

    // ২. ইউজার থেকে FEN (পজিশন) নেওয়া
    const fen = req.query.fen;
    if (!fen) {
        return res.status(400).json({ error: "Missing FEN parameter" });
    }

    // ৩. FEN ক্লিন করা (আমাদের ডেটাবেসের মতো ফরম্যাটে আনা)
    // উদাহরণ: "rnbqk... 0 1" -> "rnbqk..." (প্রথম ৪ অংশ নিব)
    const cleanFen = fen.split(" ").slice(0, 4).join(" ");

    // ৪. ডেটাবেসে খোঁজা
    const stats = openingStats[cleanFen];

    if (stats) {
        res.json({
            fen: cleanFen,
            found: true,
            stats: stats
        });
    } else {
        res.json({
            fen: cleanFen,
            found: false,
            message: "No games found for this position in our database."
        });
    }
});

// সার্ভার স্টার্ট করা
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // সার্ভার চালুর সাথে সাথেই ডেটা লোড শুরু হবে
    await loadData();
});