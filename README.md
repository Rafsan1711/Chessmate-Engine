# ♟️ ChessMate AI (v2.0)

<div align="center">

![ChessMate Banner](https://capsule-render.vercel.app/api?type=waving&color=0:3498db,100:2c3e50&height=220&section=header&text=ChessMate%20AI&fontSize=70&animation=fadeIn&fontAlignY=35&desc=Next-Gen%20ML%20Chess%20Engine%20%26%20Analyzer&descAlignY=55&descAlign=50)

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-2.0.0--dev-orange)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)

[**Live Demo**](https://chessmate-engine.onrender.com) • [**Report Bug**](https://github.com/Rafsan1711/Chessmate-Engine/issues) • [**Request Feature**](https://github.com/Rafsan1711/Chessmate-Engine/issues)

</div>

---

## 📖 Overview

**ChessMate AI** is a cutting-edge, open-source chess analysis tool designed for players who want to understand the "why" behind a move. Unlike traditional engines that purely calculate variations, ChessMate combines **Big Data Analytics** (5 Million+ master games) with **Deep Learning** (ResNet Architecture) to provide human-like intuition and statistical backing.

Whether you are exploring complex opening lines or challenging an AI that plays like a grandmaster, ChessMate provides the tools you need—all within your browser.

## ✨ Key Features

### 🧠 ML-Powered Engine
- **Neural Network:** Uses a custom-trained **ResNet (Residual Network)** model exported to ONNX.
- **Browser Inference:** Runs entirely in the browser using `onnxruntime-web` (No backend lag).
- **Human-like Play:** Trained on 2000+ ELO Lichess games, avoiding "computer-like" dry moves.

### 📚 Deep Opening Explorer
- **Massive Database:** Instant access to statistics from **5,000,000+ unique positions**.
- **Real-time Analytics:** See Win/Draw/Loss percentages for every move.
- **PGN-Style Table:** Professional move-by-move breakdown.

### ⚡ Optimized Architecture
- **SQLite Backend:** Ultra-low memory usage using streaming I/O (Runs smoothly on free-tier hosting).
- **SPA Frontend:** Fast, modular, and responsive Single Page Application without reloading.
- **Cloud Integration:** Models and Datasets hosted on **Hugging Face** for scalability.

---

## 🛠️ Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Frontend** | Vanilla JS (ES6+), CSS3 Variables, Chessboard.js, ONNX Runtime Web |
| **Backend** | Node.js, Express.js, Better-SQLite3, Axios |
| **ML/Training** | Python, PyTorch, Google Colab (GPU), Zstandard |
| **Data Storage**| SQLite (Processed), Hugging Face (Hosting) |
| **Deployment**| Render (Web Service + Static Site) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Rafsan1711/Chessmate-Engine.git
   cd Chessmate-Engine
   ```

2. **Frontend Setup**
   The frontend is a static SPA. You can run it using any simple HTTP server.
   ```bash
   cd frontend
   # Using Python (Example)
   python -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   *The server will automatically download the necessary database files from Hugging Face on the first run.*

---

## 📂 Project Structure

```bash
Chessmate-Engine/
├── frontend/           # The User Interface (SPA)
│   ├── assets/         # Images, Audio, ONNX Model, JS Modules
│   ├── index.html      # Main Entry Point
│   └── style.css       # Dark Mode Styles
├── backend/            # The API Server
│   ├── data/           # Local Database Storage (SQLite)
│   └── server.js       # Express API Logic
├── ml-training/        # Python Notebooks for Training
└── README.md           # This file
```

---

## 🗺️ Roadmap

- [x] **v1.0:** Basic Engine & Explorer (Completed)
- [x] **v1.5:** SQLite Integration & Memory Optimization (Completed)
- [ ] **v2.0:** ResNet Model Integration (In Progress)
- [ ] **v2.5:** Alpha-Beta Pruning & Quiescence Search
- [ ] **v3.0:** User Accounts & Cloud Analysis

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ License & Attribution

Distributed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** License.

**You are free to:**
- **Share:** Copy and redistribute the material in any medium or format.
- **Adapt:** Remix, transform, and build upon the material.

**Under the following terms:**
- **Attribution:** You must give appropriate credit to **Rafsan1711**, provide a link to the license, and indicate if changes were made.
- **Non-Commercial:** You may **NOT** use the material for commercial purposes (Selling the engine, using it in paid products, etc.).

See `LICENSE` file for more information.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Rafsan1711">Rafsan1711</a></p>
</div>
