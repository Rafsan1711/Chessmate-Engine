# ♟️ GambitFlow AI

<div align="center">

![GambitFlow Banner](https://capsule-render.vercel.app/api?type=waving&color=0:8e44ad,100:2c3e50&height=220&section=header&text=GambitFlow&fontSize=70&animation=fadeIn&fontAlignY=35&desc=Elite%20Chess%20Intelligence%20%26%20Analysis&descAlignY=55&descAlign=50)

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Engine](https://img.shields.io/badge/Engine-Nexus--Core%20(ResNet)-orange)

[**Live Demo**](https://chessmate-engine.onrender.com) • [**Report Bug**](https://github.com/NeuraxLabs/GambitFlow/issues) • [**Hugging Face**](https://huggingface.co/GambitFlow)

</div>

---

## 📖 Overview

**GambitFlow** is a next-generation chess intelligence platform engineered for players who demand more than just calculation. Unlike traditional engines, GambitFlow uses **Deep Residual Networks (ResNet)** trained on millions of elite-level games to mimic human intuition and positional understanding.

It features a massive **Opening Explorer** (5 Million+ positions) and a robust **AI Opponent** that runs entirely in your browser using WebAssembly.

## ✨ Key Features

### 🧠 Nexus-core Engine
- **Architecture:** Powered by **ResNet-10** (Deep Learning).
- **Elite Training:** Trained exclusively on games with **2000+ ELO** to avoid learning amateur mistakes.
- **Hybrid Search:** Combines Neural Network evaluation with **Alpha-Beta Pruning** and **Piece-Square Tables** for blunder-free gameplay.
- **Performance:** Runs locally via **Web Workers**, ensuring zero UI lag.

### 📚 Deep Opening Explorer
- **Big Data:** Instant access to statistics from **5,000,000+ unique positions**.
- **Real-time Analytics:** Visual win/draw/loss percentages for every move.
- **Pro-Level Data:** Data filtered to show only master-level responses.

### ⚡ Optimized Architecture
- **Backend:** Ultra-low memory usage using **SQLite Streaming** (runs smoothly on free-tier hosting).
- **Frontend:** Modular SPA (Single Page Application) with **ONNX Runtime**.

---

## 🛠️ Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Frontend** | Vanilla JS (ES6+), Web Workers, ONNX Runtime Web |
| **Backend** | Node.js, Express.js, Better-SQLite3 |
| **ML/Training** | PyTorch, Google Colab (GPU), Zstandard |
| **Data Storage**| SQLite (Processed), Hugging Face (Hosting) |

---

## 📂 Project Structure

```bash
GambitFlow/
├── frontend/                   # The Client-Side Application
│   ├── assets/
│   │   ├── audio/              # Sound Effects
│   │   ├── img/pieces/         # SVG Chess Pieces
│   │   ├── js/                 # Logic (Services & Components)
│   │   └── models/             # AI Brains
│   │       ├── nexus-core-ce/  # Main ResNet Model
│   │       └── nexus-nano-ce/  # Lightweight CNN Model
│   ├── index.html
│   └── style.css
├── backend/                    # The API Server
│   ├── chess_stats_v2.db       # 800MB+ SQLite Database (Downloaded)
│   └── server.js
├── ml-training/                # Python Notebooks for Training
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/NeuraxLabs/GambitFlow.git
   cd GambitFlow
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   # Use any HTTP server (e.g., Python or Node http-server)
   python -m http.server 8000
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   *Note: The server will automatically download the 800MB database file from Hugging Face on the first run.*

---

## ⚠️ License

Distributed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** License.

**You are free to:** Share and Adapt for non-commercial purposes.
**You may NOT:** Sell this engine or use it in paid commercial products.

---

