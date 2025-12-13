# 🧠 ChessMate AI v2.0 - The Neural Brain

<div align="center">

![Neural Network](https://img.shields.io/badge/Architecture-ResNet%20(CNN)-blueviolet?style=for-the-badge)
![Framework](https://img.shields.io/badge/Framework-PyTorch%202.5%2B-red?style=for-the-badge)
![Format](https://img.shields.io/badge/Export-ONNX%20Opset%2017-blue?style=for-the-badge)
![Data](https://img.shields.io/badge/Training%20Data-5M%2B%20Positions-green?style=for-the-badge)

</div>

## 📖 System Overview

This directory contains the complete machine learning pipeline for **ChessMate AI v2.0**. Unlike traditional engines that rely solely on brute-force calculation (Alpha-Beta pruning), ChessMate utilizes a **Hybrid Neuro-Symbolic Architecture**.

It combines the intuition of a **Deep Residual Network (ResNet)** trained on 5 million master-level positions with the precision of classical chess heuristics (Piece-Square Tables).

---

## 🏗️ Model Architecture (The Brain)

The core evaluation function is a **Convolutional Neural Network (CNN)** inspired by AlphaZero's simplified architecture.

### 1. Input Layer (The Eyes)
The board state is converted into a **12x8x8 Tensor** using One-Hot Encoding.
- **Channels (12):** 6 White piece types + 6 Black piece types.
- **Grid (8x8):** The chess board squares.
- **Perspective:** Always processed from White's perspective (Black's positions are flipped during inference).

### 2. The Backbone (ResNet)
We utilize a **Residual Network** to capture deep spatial dependencies without the vanishing gradient problem.
- **Initial Block:** Conv2d (12 → 128 filters) + BatchNorm + ReLU.
- **Residual Tower:** **10 Residual Blocks**. Each block consists of:
  - `Conv2d (3x3)` → `BatchNorm` → `ReLU` → `Conv2d (3x3)` → `BatchNorm` → `Skip Connection` → `ReLU`.

### 3. The Head (Value Network)
The network outputs a single scalar value representing the winning probability.
- **Conv2d (1x1):** Reduces filters to 32.
- **Fully Connected:** Flatten → Dense (256) → Dense (1).
- **Activation:** `Tanh` (Output range: `-1.0` to `+1.0`).

---

## 📊 Data Pipeline (v2.0)

We do not train on random games. The dataset is curated for "Pro-Level" play.

| Metric | Details |
|:--- |:--- |
| **Source** | Lichess Standard Rated Database (2017) |
| **Filtering** | **ELO 2000+** (Both players must be masters/experts) |
| **Volume** | **5,000,000** unique training positions |
| **Processing** | Streaming PGN Parser → RAM Optimized Buffer → SQLite Database |
| **Storage** | Hosted on [Hugging Face Datasets](https://huggingface.co/datasets/Rafs-an09002/chessmate-data-v2) |

---

## 🧠 Inference Logic (How it Plays)

The engine in the frontend (`ModelService.js`) uses a **Tri-Layer Decision System**:

1.  **Level 1: The Book (Instant)**
    *   Checks the `SQLite` Opening Database. If a Grandmaster move exists, it plays instantly (0ms latency).
2.  **Level 2: The Brain (Neural Network)**
    *   If out of book, the **ONNX Model** evaluates leaf nodes to judge the position's safety and attacking potential.
3.  **Level 3: The Validator (Alpha-Beta + PST)**
    *   Uses **Minimax with Alpha-Beta Pruning** (Depth 3-4) to calculate future tactical variations.
    *   Applies **Piece-Square Tables (PST)** to guide the Neural Network, preventing positional blunders (like unnecessary rook shuffling).

---

## 💻 Reproducible Notebooks

Below are the exact scripts used to generate the data and train the model.

### 📂 Notebook 1: Data Engineering Pipeline
**Goal:** Download Lichess data, filter for ELO 2000+, and generate the SQLite Database.

<details>
<summary><b>CLICK TO EXPAND: 01_Data_Processing.py</b></summary>

```python
# PASTE YOUR FINAL CELL 3 CODE HERE (From the Data Processing Step)
# The one with SQLite Memory Optimization and Streaming
```

</details>

---

### 📂 Notebook 2: Model Training & Export
**Goal:** Load SQLite data via IterableDataset, Train ResNet (Mixed Precision), and Export to ONNX.

<details>
<summary><b>CLICK TO EXPAND: 02_Model_Training.py</b></summary>

```python
# PASTE YOUR FINAL TRAINING CODE HERE (From Cell 1, 2, 3, and 4)
# Combine the Environment Setup, Model Class, Training Loop, and Export Logic
```

</details>

---

## 🔧 Training Hyperparameters

- **Optimizer:** Adam (`lr=0.0005`, `weight_decay=1e-5`)
- **Loss Function:** MSELoss (Regression target derived from Win/Loss stats)
- **Batch Size:** 512 (Effective 1024 with Gradient Accumulation)
- **Precision:** Mixed Precision (FP16/FP32) via `torch.amp`.
- **Export Config:** Opset 17, `do_constant_folding=True` (Fixed for PyTorch 2.5.1).

---

## 📄 License

The machine learning code and model weights are licensed under **CC BY-NC 4.0**.
