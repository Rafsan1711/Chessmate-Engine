# ♟️ GambitFlow - Frontend

The client-side interface for GambitFlow. It is a highly optimized **Single Page Application (SPA)** that handles game logic, UI rendering, and AI inference directly in the browser.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)
![ONNX Runtime](https://img.shields.io/badge/AI-ONNX%20Runtime%20Web-blue)
![Web Workers](https://img.shields.io/badge/Performance-Web%20Workers-orange)

## 📂 Directory & Assets

```text
frontend/
├── assets/
│   ├── audio/            # Move, Capture, Check sounds
│   ├── img/pieces/       # SVG Chess Sets
│   ├── models/           # AI Models Folder
│   │   └── nexus-core-ce/
│   │       └── model.onnx  # The 16.5MB ResNet Brain
│   └── js/
│       ├── components/   # UI Logic (Board, Tables)
│       ├── services/     # Core Logic (AI Worker, API, Router)
│       └── lib/          # Dependencies (chess.js)
```

## 🏗️ Technical Architecture

### 1. Multi-Threaded AI (`engine.worker.js`)
To prevent the UI from freezing during deep calculations, the AI logic is isolated in a **Web Worker**.
- **Input:** FEN string, Search Depth.
- **Process:** Alpha-Beta Pruning + ResNet Inference (ONNX).
- **Output:** Best Move.

### 2. Modular Services
- **`ModelService.js`**: Bridges the UI and the Web Worker. Manages model loading and fallbacks.
- **`ApiService.js`**: Handles communication with the Backend for opening statistics with auto-retry logic.
- **`RouterService.js`**: Handles SPA navigation (Home / Explorer / Play).

## 🚀 How to Run

Because this project uses **WebAssembly (WASM)** and **Web Workers**, it must be served via a local web server (opening `index.html` directly won't work due to CORS).

**Using Python:**
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🔧 Configuration

To switch between models (e.g., from Core to Nano), update the path in `assets/js/services/engine.worker.js`:

```javascript
// engine.worker.js
const MODEL_PATH = "../../models/nexus-nano-ce/model.onnx";
```

## 📄 License
Part of the GambitFlow project. Licensed under **CC BY-NC 4.0**.
