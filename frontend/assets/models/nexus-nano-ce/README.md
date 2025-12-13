# ⚡ Nexus-nano CE (Chess Engine)

<div align="center">

![Type](https://img.shields.io/badge/Type-Lightweight%20CNN-blue)
![Size](https://img.shields.io/badge/Size-~16.5MB-green)
![Target](https://img.shields.io/badge/Target-Speed%20%2F%20Mobile-orange)
![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)

</div>

## 📖 Model Overview

**Nexus-nano CE** is the lightweight, high-velocity variant of the GambitFlow AI series. It is designed specifically for scenarios where inference speed is critical, such as running on older mobile devices or low-power environments.

Unlike its larger sibling (Nexus-core), Nano focuses on **tactical sharpness** rather than deep positional understanding. It is excellent for Blitz or Bullet style calculations where a "good enough" move is needed instantly.

## 🧠 Architecture & Specs

| Feature | Specification |
| :--- | :--- |
| **Architecture** | Standard CNN (3 Convolutional Layers) |
| **Input Shape** | `(1, 12, 8, 8)` Tensor (One-Hot Encoded Board) |
| **Activation** | ReLU (Rectified Linear Unit) |
| **Output** | Scalar Evaluation Score (`-1.0` to `+1.0`) |
| **Inference Time** | < 5ms (on average CPU) |

## 📊 Training Data

This model was trained on a curated subset of the Lichess database to learn fundamental chess rules and basic tactics.

- **Source:** Lichess Standard Rated Games (2016).
- **Dataset Size:** ~100,000 Games.
- **Positions:** Approx. 200,000 - 300,000 unique positions.
- **Focus:** Material balance and immediate tactical threats.

## 🚀 Use Cases

- **Mobile Browsers:** Runs flawlessly without draining battery.
- **Rapid Analysis:** Quickly scanning a game for major blunders.
- **Tutorial Mode:** Playing against beginners/intermediates (~400-800 ELO equivalent).

---
<div align="center">
  <p>Part of the <b>GambitFlow</b> 
</div>
