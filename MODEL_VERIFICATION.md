# 🤖 MODEL & STANDARDIZATION VERIFICATION REPORT
**Target Model:** Unsupervised Isolation Forest (`backend/ml/isolation_forest.pkl`)  
**Target Scaler:** Standard Scaler (`backend/ml/scaler.pkl`)  
**Audit Date:** 2026-09-29  
**Auditor Role:** Research Reproducibility Engineer & ML Research Auditor  

---

## 1. Standardization & Data Leakage Audit (Phase 4)

### 1.1 Scaler Parameter Extraction

Inspection of `backend/ml/scaler.pkl` reveals the following pre-fitted population parameters:

| Feature Dimension | Scaler Feature Name | Stored $\mu_{\text{train}}$ (`mean_`) | Stored $\sigma_{\text{train}}$ (`scale_`) | Full Valid Dataset $\mu_{\text{all}}$ ($N=378,540$) | Full Valid Dataset $\sigma_{\text{all}}$ ($N=378,540$) | Absolute Difference ($\Delta \mu$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **$x_1$** | `material_ratio` | `0.220292` | `0.066335` | `0.199532` | `0.170970` | $+0.020760$ |
| **$x_2$** | `admin_ratio` | `0.036942` | `0.016498` | `0.045564` | `0.070842` | $-0.008622$ |
| **$x_3$** | `wage_ratio` | `0.742766` | `0.070507` | `0.754905` | `0.180458` | $-0.012139$ |
| **$x_4$** | `cost_per_day` | `6620.64` | `8339.07` | `9394.27` | `327191.75` | $-2773.63$ |

### 1.2 Data Leakage Audit Finding:
```
DATA LEAKAGE FOUND: NO (in the pre-trained artifacts) / YES (in the evaluation script protocol)
```

**Detailed Scientific Explanation:**
1. **Model/Scaler Training Artifact:** The stored `scaler.pkl` was fitted on an initial training subset/sample rather than the entire 378,540 record set (as evidenced by the mathematical difference $\Delta \mu \ne 0$).
2. **Evaluation Script Protocol:** In `evaluate_model_accuracy.py` and `test_precision_90.py`, the entire 378,540 dataset is evaluated simultaneously without an explicit train/test temporal split. The empirical calibration threshold $\tau = -0.0150$ and the statutory confirmation parameters were tuned using metrics calculated over this entire corpus. 
3. **Recommendation:** A temporal train-test split (e.g. FY 2018–2023 for training/calibration, and FY 2024–2026 for unadulterated out-of-time testing) must be documented to eliminate any potential transductive calibration leakage.

---

## 2. Isolation Forest Parameter Verification (Phase 5)

Direct inspection of `backend/ml/isolation_forest.pkl` using Python reflection:

| Parameter | Paper Specification | Serialized Model Value (`isolation_forest.pkl`) | Verification Status |
| :--- | :--- | :--- | :--- |
| **Model Family** | `sklearn.ensemble.IsolationForest` | `sklearn.ensemble.IsolationForest` | **MATCH** ✅ |
| **`n_estimators` ($T$)** | `100` | `100` | **MATCH** ✅ |
| **`contamination`** | Empirical ($\approx 7\%$) | `0.07` | **MATCH** ✅ |
| **`max_samples`** | `auto` ($\min(256, n)$) | `'auto'` | **MATCH** ✅ |
| **`max_features`** | `1.0` (all 4 features) | `1.0` | **MATCH** ✅ |
| **`bootstrap`** | `False` | `False` | **MATCH** ✅ |
| **`random_state`** | `42` | `42` | **MATCH** ✅ |
| **`n_features_in_`** | `4` | `4` | **MATCH** ✅ |
| **`offset_`** | $-0.5 - \text{margin}$ | `-0.5971778814052037` | **MATCH** ✅ |
| **`scikit-learn` Serialization Version** | `1.6.1` / `1.8.0` compatible | `1.6.1` (Loaded cleanly on `1.8.0`) | **MATCH** ✅ |

---

## 3. Mathematical Mapping of Decision Functions

### Theoretical Formulation (Liu et al. / Paper):
The average path length of an unsuccessful search in a BST of $n$ nodes is:
$$c(n) = 2 \left(\ln(n - 1) + 0.5772156649\right) - \frac{2(n - 1)}{n}$$

The theoretical anomaly score $s(\mathbf{x}, n)$ across $T = 100$ isolation trees:
$$s(\mathbf{x}, n) = 2^{-\frac{\mathbb{E}(h(\mathbf{x}))}{c(n)}}$$
where $s \in [0, 1]$. Values close to $1.0$ indicate anomalies, while values below $0.5$ denote normal instances.

Theoretical raw anomaly offset:
$$d_{\text{theory}}(\mathbf{x}) = 0.5 - s(\mathbf{x}, n)$$

### Scikit-Learn Implementation:
In `scikit-learn`, `model.score_samples(X)` computes:
$$\text{score\_samples}(\mathbf{x}) = - 2^{-\frac{\mathbb{E}(h(\mathbf{x}))}{c(\text{max\_samples})}}$$

The decision function shifts this by the fitted offset $\text{offset\_}$ derived from the `contamination` quantile:
$$\text{decision\_function}(\mathbf{x}) = \text{score\_samples}(\mathbf{x}) - \text{offset\_}$$

* When $\text{decision\_function}(\mathbf{x}) < 0$, `model.predict(X)` outputs $-1$ (outlier).
* When $\text{decision\_function}(\mathbf{x}) \ge 0$, `model.predict(X)` outputs $+1$ (inlier).

### Empirical Calibrated Threshold ($\tau = -0.0150$):
GovGuard AI shifts the operating boundary from $0.0000$ to $\tau = -0.0150$, isolating the top high-confidence statistical outliers and combining them with the two-stage statutory confirmation filter.
