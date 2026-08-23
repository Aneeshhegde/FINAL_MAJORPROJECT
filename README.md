# AI-Based Government Scheme Fraud & Anomaly Detection Platform

A full-stack, production-grade enterprise intelligence application for detecting suspicious expenditure patterns, statutory compliance breaches, and statistical anomalies in Indian Government welfare scheme data.

---

## 🏆 Key Performance Metrics (Tested on 378,540 Real Records)

* **Overall Model Accuracy:** **`92.37%`** (Exceeded $\ge 90\%$ target)
* **Statutory Rule Precision:** **`91.92%`** (High confidence with only 2.0% false alarms)
* **F1-Score (Harmonic Mean):** **`86.04%`**
* **Violation Coverage (Recall):** **`80.86%`**
* **Extreme Attack Stress Test Pass Rate:** **`100.0% (5/5 PASS)`**
* **All-India Coverage:** **389,831 verified records** across **34 Indian States & 700+ Districts**

---

## 🏛️ All 5 Welfare Schemes Operational

| Scheme ID | Full Name | Domain | Anomaly Signals Monitored | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MGNREGA** | Mahatma Gandhi National Rural Employment Guarantee Act | Rural Employment | 60:40 Wage:Material Norm, 10% Admin Overhead Cap, Cost/Day | ✅ **Active** |
| **PM-KISAN** | Pradhan Mantri Kisan Samman Nidhi | Agriculture Support | Ineligible Income-Tax Payers, Duplicate Bank Accounts/Aadhaars | ✅ **Active** |
| **PMAY** | Pradhan Mantri Awas Yojana | Housing Assistance | Milestone Delays, Geo-tagging Skew, Material Cost Inflation | ✅ **Active** |
| **PDS** | Public Distribution System | Food Security | Grain Offtake Diversion, Biometric Bypass, Bogus Ration Cards | ✅ **Active** |
| **SCHOLARSHIPS** | National Scholarship Portal (NSP) | Education Welfare | Ghost AISHE Institutes, Duplicate Student Enrollments | ✅ **Active** |

---

## 🚀 Quick Start & Local Execution

### 1. Backend Server (FastAPI)
```powershell
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* **API Documentation (Swagger):** `http://localhost:8000/docs`

### 2. Frontend Dashboard (React + Vite + Tailwind)
```powershell
cd frontend
npm run dev
```
* **Web Dashboard:** `http://localhost:3000`

### 3. Model Accuracy Verification Script
```powershell
python evaluate_model_accuracy.py
```

---

For full comparative benchmarks, confusion matrices, and viva defense talking points, see [`MODEL_EVALUATION_REPORT.md`](file:///c:/Users/anees/Desktop/Major%20project/MODEL_EVALUATION_REPORT.md).
