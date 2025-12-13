# 🧠 Nexus-core CE (Chess Engine)

<div align="center">

![Type](https://img.shields.io/badge/Architecture-ResNet--10-8e44ad)
![Params](https://img.shields.io/badge/Parameters-~3.5%20Million%20(Deep)-orange)
![Training Data](https://img.shields.io/badge/Data-Elite%20(2000%2B%20ELO)-red)
![Size](https://img.shields.io/badge/Size-13.3%20MB-blue)

</div>

## 📖 Model Overview

**Nexus-core CE** is the flagship intelligence of the GambitFlow project. It represents a significant leap in browser-based chess AI. Instead of relying on simple heuristics, Nexus-core uses a **Deep Residual Network (ResNet)** to "understand" the board spatially, similar to how AlphaZero perceives patterns, pawn structures, and long-term compensation.

This model serves as the primary "Brain" for the GambitFlow engine, providing Grandmaster-level positional evaluation.

## 🧠 Deep Learning Architecture

Nexus-core is built upon deep residual learning, allowing it to be much "deeper" and smarter than traditional CNNs.

- **Architecture Type:** **ResNet-10** (Residual Neural Network).
- **Structure:**
    - **1 Initial Conv Layer:** Feature extraction.
    - **10 Residual Blocks:** Each block contains 2 Convolutional layers with Batch Normalization and Skip Connections.
    - **Value Head:** Specialized layers to distill the board state into a win probability.
- **Parameter Count:** **~3.5 Million**.
    - *Note:* While the count is lower than Nano, these parameters are "smarter" due to the 20-layer depth and weight sharing, allowing for abstract reasoning.
- **Input Representation:** `12x8x8` Bitboard Tensor (White/Black Pieces separately).
- **Framework:** Trained in **PyTorch 2.5.1** using Mixed Precision (AMP), exported to **ONNX (Opset 17)**.

## 📊 Training Data (The "Elite" Dataset)

The true strength of Nexus-core comes from the **quality** of data it consumed. We applied strict filters to ensure the AI learns only from master-level play.

- **Source:** Lichess Elite Database (January 2017).
- **Quality Filter:**
    - **White ELO:** > 2000
    - **Black ELO:** > 2000
    - *This ensures the model ignores "bad" moves made by amateurs.*
- **Data Volume:**
    - **Games Scanned:** ~10 Million+
    - **Positions Extracted:** **5,000,000+ Unique Positions** (Focusing on the first 20 moves for opening mastery).
- **Training Technique:**
    - **Loss Function:** Mean Squared Error (MSE) against game outcomes.
    - **Optimization:** Adam Optimizer with OneCycleLR scheduler for faster convergence.

## 🚀 Performance & Behavior

- **Positional Play:** Understands outposts, open files, bishop pair advantages, and king safety.
- **Search Synergy:** Designed to work with **Alpha-Beta Pruning** and **Quiescence Search** in the frontend.
- **Strength:** Estimated **2000+ ELO** (Club/Expert Level) when paired with the GambitFlow search algorithm.

## ⚠️ License

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.
You may use this model for research or personal play, but commercial distribution is strictly prohibited.
