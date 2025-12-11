# ♟️ ChessMate AI - Frontend

This directory contains the client-side **Single Page Application (SPA)** for ChessMate AI. It is built with vanilla JavaScript (ES6+), adopting a modern modular architecture without the complexity of frameworks like React or Vue. It handles the UI, Game Logic, and ONNX Model inference directly in the browser.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)
![ONNX Runtime](https://img.shields.io/badge/AI-ONNX%20Runtime%20Web-blue)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen)

## 📂 Directory Structure

```text
frontend/
├── assets/
│   ├── audio/            # Game sound effects (move, capture, check, etc.)
│   ├── img/
│   │   └── pieces/       # SVG chess pieces (Wikipedia theme)
│   ├── js/
│   │   ├── components/   # UI Classes (Board, StatsTable)
│   │   ├── lib/          # Third-party local libraries (chess.js)
│   │   ├── services/     # Logic Layers (API, AI Model, Router)
│   │   └── app.js        # Main entry point & initialization
│   └── chess_model.onnx  # The ML Brain (Pre-trained Neural Network)
├── index.html            # Main HTML structure
├── style.css             # Dark mode responsive styles
└── README.md             # This file
```

---

## 🏗️ Architecture

The frontend follows a **Component-Service** pattern:

### 1. Services (`assets/js/services/`)
- **`ModelService.js`**: Handles the Machine Learning logic. It loads the `.onnx` file using `onnxruntime-web`, converts FEN positions to Tensors, and runs the Minimax algorithm to determine the AI's moves.
- **`ApiService.js`**: Manages communication with the Backend API. It includes intelligent retry logic and data formatting for the Opening Explorer.
- **`RouterService.js`**: Manages SPA routing (Hash-based), switching between "Home", "Explorer", and "Play vs Bot" views dynamically without page reloads.

### 2. Components (`assets/js/components/`)
- **`BoardComponent.js`**: Wraps `chessboard.js` and `chess.js`. Handles drag-and-drop, move validation, sound effects, and board state updates.
- **`StatsTableComponent.js`**: Renders the PGN-style opening statistics table with visual win-rate bars.

---

## 🚀 How to Run Locally

Since this is a static site, you need a simple HTTP server to serve the files (especially to load the `.onnx` model correctly due to CORS policies).

### Method 1: Python (Recommended)
If you have Python installed:

```bash
cd frontend
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Method 2: Node.js (http-server)
If you have Node.js installed:

```bash
npx http-server ./frontend
```

---

## 🧩 Dependencies

We use a mix of local and CDN libraries to keep the repository lightweight yet robust:

- **Chessboard.js**: For the visual board interface.
- **Chess.js**: For move generation and validation.
- **jQuery**: For DOM manipulation.
- **ONNX Runtime Web**: For running the PyTorch-exported AI model in the browser via WebAssembly (WASM).

---

## 🔧 Configuration

### API Endpoint
To change the backend server URL, edit `assets/js/services/ApiService.js`:
```javascript
const API_BASE_URL = "https://your-backend-url.com/api";
```

### AI Model Path
To update the model, replace `assets/chess_model.onnx` and ensure the path in `assets/js/services/ModelService.js` matches:
```javascript
const MODEL_PATH = "assets/chess_model.onnx";
```

---

## ⚠️ Troubleshooting

**1. "Model Failed to Load" / 404 Error:**
- Ensure `chess_model.onnx` is present in `frontend/assets/`.
- Verify that your local server is running from the correct directory.

**2. Pieces not showing:**
- Ensure the `assets/img/pieces/` folder contains all 12 SVG files (wP.svg, bK.svg, etc.).
- Check the browser console for specific 404 errors.

---

## 📄 License
This frontend is part of the ChessMate AI project and is licensed under **CC BY-NC 4.0**.
