# ♟️ ChessMate AI - Backend API

The backend for ChessMate AI is a lightweight, high-performance Node.js/Express server designed to run on resource-constrained environments (like Render Free Tier). It serves chess opening statistics derived from millions of master-level games.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Express](https://img.shields.io/badge/Express-4.x-white)
![SQLite](https://img.shields.io/badge/Database-Better--SQLite3-blue)
![Status](https://img.shields.io/badge/Status-Live-brightgreen)

## ⚡ Key Features

- **🚀 Ultra-Low Memory Usage:** Uses `better-sqlite3` to query data directly from disk without loading the entire dataset into RAM.
- **🔄 Auto-Sync:** Automatically downloads the latest database file (`chess_stats.db`) from Hugging Face if missing on startup.
- **🛡️ CORS Enabled:** Configured to accept requests from the ChessMate frontend.
- **⚡ Fast Lookup:** Returns opening statistics for any given FEN (Forsyth–Edwards Notation) in milliseconds.

## 📂 Directory Structure

```text
backend/
├── chess_stats.db      # The SQLite database (downloaded automatically)
├── package.json        # Dependencies and scripts
├── server.js           # Main API logic and configuration
└── README.md           # This file
```

---

## 🔌 API Endpoints

### 1. Health Check
Checks if the server is running and the database is connected.

- **URL:** `/`
- **Method:** `GET`
- **Response:** `200 OK`
```text
"ChessMate API (SQLite Version) is Running! ♟️"
```

### 2. Get Opening Statistics
Retrieves win/draw/loss statistics for a specific board position.

- **URL:** `/api/stats`
- **Method:** `GET`
- **Query Params:**
    - `fen` (required): The board position in FEN format.
- **Example Request:**
  ```http
  GET /api/stats?fen=rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq
  ```
- **Success Response (200):**
  ```json
  {
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
    "found": true,
    "stats": {
      "total": 50000,
      "moves": {
        "c5": { "white": 2000, "black": 2100, "draw": 900 },
        "e5": { "white": 3000, "black": 2500, "draw": 1500 }
      }
    }
  }
  ```
- **Error Response (404):**
  ```json
  {
    "fen": "...",
    "found": false,
    "message": "Position not found in database"
  }
  ```

---

## 🛠️ Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- NPM (Node Package Manager)

### Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Server:**
   ```bash
   node server.js
   ```
   *Note: On the first run, the server will attempt to download `chess_stats.db` (approx. 150MB) from the Hugging Face repository. Please wait for the download to complete.*

4. **Verify:**
   Open your browser and visit `http://localhost:3000`.

---

## 💾 Database Architecture

We migrated from a large JSON file to **SQLite** to solve memory issues on free cloud hosting.

- **Source:** Processed Lichess game data.
- **Format:** SQLite 3.
- **Schema:**
  - `fen` (TEXT, Primary Key): The board position key.
  - `stats` (TEXT): JSON string containing move statistics.
- **Hosting:** The database file is hosted on Hugging Face Datasets and streamed to the server container during the build/start process.

---

## 🚀 Deployment (Render.com)

This backend is optimized for Render's **Web Service**.

- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment:** Node.js
- **Memory:** Runs comfortably within 512MB RAM limits due to disk-based querying.

---

## 📄 License
This backend is part of the ChessMate AI project and is licensed under **CC BY-NC 4.0**.
