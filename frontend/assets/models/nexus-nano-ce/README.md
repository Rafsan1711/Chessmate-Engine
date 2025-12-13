
# ⚡ Nexus-nano CE (Chess Engine)

<div align="center">

![Type](https://img.shields.io/badge/Type-Lightweight%20CNN-blue)
![Params](https://img.shields.io/badge/Parameters-~4.3%20Million-orange)
![Size](https://img.shields.io/badge/Size-~16.5MB-green)
![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)

</div>

## 📖 Model Overview

**Nexus-nano CE** is the lightweight, high-velocity variant of the GambitFlow AI series. It is designed specifically for scenarios where inference speed is critical, such as running on older mobile devices or low-power environments without GPU acceleration.

Unlike its larger sibling (Nexus-core), Nano focuses on **material advantage** and **immediate tactics** rather than deep positional understanding.

## 🧠 Technical Architecture

- **Architecture Type:** Standard CNN (Convolutional Neural Network)
- **Depth:** 3 Convolutional Layers + 3 Fully Connected Layers.
- **Parameter Count:** **~4.3 Million** (Mostly in the fully connected output layer).
- **Input Shape:** `(1, 12, 8, 8)` Tensor (One-Hot Encoded Board).
- **Activation Function:** ReLU (Rectified Linear Unit).
- **Output:** Scalar Evaluation Score (`-1.0` to `+1.0`).

## 📊 Training Data & Methodology

The training data for Nexus-nano was curated to teach the engine the "rules of thumb" of chess.

- **Source:** Lichess Standard Rated Games (February 2016).
- **Dataset Size:** ~100,000 Games (Approx. 200k unique positions).
- **Player Rating:** Mixed (1200 - 2000+ ELO).
- **Learning Objective:** The model learned to penalize blunders (hanging pieces) and reward material gain. It does not understand complex long-term sacrifices.

## 🚀 Performance Profile

| Metric | Rating |
| :--- | :--- |
| **Speed** | ⭐⭐⭐⭐⭐ (Instant) |
| **Tactics** | ⭐⭐⭐ (Good at spotting hanging pieces) |
| **Positioning** | ⭐ (Weak, prefers material over position) |
| **Endgame** | ⭐⭐ (Basic checkmating patterns) |

## 🎯 Ideal Use Case
- Mobile Browsers.
- Rapid/Bullet Analysis.
- Tutorial Mode for Beginners.

---
<div align="center">
  <p>Part of the <b>GambitFlow</b> Project by
</div>
