# ♟️ GambitFlow - Backend API

The backend for GambitFlow is a high-performance Node.js service designed to serve chess opening data from a massive **Elite Database**.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![SQLite](https://img.shields.io/badge/Database-Better--SQLite3-blue)
![Data](https://img.shields.io/badge/Dataset-5%20Million%2B-red)

## ⚡ Key Capabilities

- **🚀 Disk-Based Streaming:** Uses `better-sqlite3` to query a **882 MB database** instantly without loading it into RAM. Perfect for low-memory environments like Render Free Tier.
- **🔄 Auto-Sync:** On startup, it automatically downloads the latest `chess_stats_v2.db` from Hugging Face if it's missing.
- **🛡️ CORS Enabled:** Securely serves data to the GambitFlow frontend.

## 📂 Structure

```text
backend/
├── chess_stats_v2.db   # The 882MB Database (Downloaded automatically)
├── server.js           # Main Express App
└── README.md           # This file
```

## 🔌 API Reference

### Get Opening Stats
Returns the win/draw/loss statistics for a specific board position.

- **Endpoint:** `GET /api/stats`
- **Query:** `?fen=<FEN_STRING>`
- **Logic:**
    1. Truncates FEN to first 4 parts (Position + Turn + Castling + EnPassant).
    2. Queries the SQLite database in O(1) time.
    3. Returns JSON stats.

**Response Example:**
```json
{
  "fen": "rnbqk...",
  "found": true,
  "stats": {
    "total": 5020,
    "moves": {
      "e4": { "white": 2000, "black": 1800, "draw": 1220 }
    }
  }
}
```

## 🚀 Deployment

This backend is stateless (except for the DB file) and can be deployed easily.

1. **Install:** `npm install`
2. **Start:** `node server.js`
3. **Wait:** Allow 1-2 minutes on first launch for the database download.

---

## 📄 License
Part of the GambitFlow project. Licensed under **CC BY-NC 4.0**.
