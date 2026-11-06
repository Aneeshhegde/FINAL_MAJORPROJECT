# 📦 PROJECT INVENTORY REPORT
**Project Name:** GovGuard AI / Subsidy Fraud Detection  
**Paper Title:** Anomaly Detection in AI-Driven Welfare Schemes: A Scalable Framework for Developing Countries with Integration of Machine Learning and Statutory Compliances  
**Audit Date:** 2026-09-29  
**Auditor Role:** Research Reproducibility Engineer & ML Research Auditor  

---

## 1. Executive Summary of Project Artifacts

This inventory represents an exhaustive catalog of all code, datasets, machine learning artifacts, configuration files, APIs, user interfaces, experiment scripts, documentation, and research specifications discovered in the project workspace (`c:\Users\anees\Desktop\Major project`).

---

## 2. Exhaustive Itemized Inventory

### 2.1 Research Paper & Specification Documents
| # | File Path | Type | Description |
| :--- | :--- | :--- | :--- |
| 1 | [WORKFLOW_AND_RESEARCH_SPECIFICATION.md](file:///c:/Users/anees/Desktop/Major%20project/WORKFLOW_AND_RESEARCH_SPECIFICATION.md) | Markdown / Spec | Primary academic research specification containing abstract, mathematical formulation, 3-stage performance tables, and prompt blueprints. |
| 2 | [MODEL_EVALUATION_REPORT.md](file:///c:/Users/anees/Desktop/Major%20project/MODEL_EVALUATION_REPORT.md) | Markdown / Report | Empirical evaluation report documenting 378,540 verified records, confusion matrices, and multi-scheme capabilities. |
| 3 | [PROJECT_EXPLANATION_GUIDE.md](file:///c:/Users/anees/Desktop/Major%20project/PROJECT_EXPLANATION_GUIDE.md) | Markdown / Guide | Complete technical viva and architectural guide explaining the GovGuard AI system. |
| 4 | [IMPLEMENTATION_STATUS.md](file:///c:/Users/anees/Desktop/Major%20project/IMPLEMENTATION_STATUS.md) | Markdown / Status | System milestone status tracking frontend, backend, and machine learning components. |
| 5 | [README.md](file:///c:/Users/anees/Desktop/Major%20project/README.md) | Markdown / Docs | Project overview and quickstart guide. |
| 6 | [.kiro/specs/subsidy-fraud-detection/design.md](file:///c:/Users/anees/Desktop/Major%20project/.kiro/specs/subsidy-fraud-detection/design.md) | Markdown / Spec | Architectural design document covering system architecture, data models, and API interfaces. |
| 7 | [.kiro/specs/subsidy-fraud-detection/requirements.md](file:///c:/Users/anees/Desktop/Major%20project/.kiro/specs/subsidy-fraud-detection/requirements.md) | Markdown / Spec | Functional and non-functional requirements specification. |
| 8 | [.kiro/specs/subsidy-fraud-detection/tasks.md](file:///c:/Users/anees/Desktop/Major%20project/.kiro/specs/subsidy-fraud-detection/tasks.md) | Markdown / Spec | Implementation task breakdown and tracking. |

---

### 2.2 Datasets & Data Artifacts
| # | File Path | File Size | Description |
| :--- | :--- | :--- | :--- |
| 1 | [backend/data/mgnrega.csv](file:///c:/Users/anees/Desktop/Major%20project/backend/data/mgnrega.csv) | 93.73 MB | Primary raw dataset containing **389,831 rows** and **36 columns** covering All-India MGNREGA monthly filings (2018–2026 across 34 States/UTs). |

---

### 2.3 Machine Learning Model & Preprocessing Artifacts
| # | File Path | Size | Description |
| :--- | :--- | :--- | :--- |
| 1 | [backend/ml/isolation_forest.pkl](file:///c:/Users/anees/Desktop/Major%20project/backend/ml/isolation_forest.pkl) | 296.49 KB | Serialized `sklearn.ensemble.IsolationForest` model (100 estimators, contamination=0.07, random_state=42). |
| 2 | [backend/ml/scaler.pkl](file:///c:/Users/anees/Desktop/Major%20project/backend/ml/scaler.pkl) | 1.01 KB | Serialized `sklearn.preprocessing.StandardScaler` fitted on 4 statutory ratio features. |

---

### 2.4 Backend Application & API Code (FastAPI / Python)
| # | File Path | Description |
| :--- | :--- | :--- |
| 1 | [backend/app/main.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/main.py) | FastAPI application entry point, CORS configuration, and route registration. |
| 2 | [backend/app/config.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/config.py) | Global application settings, statutory threshold constants, and artifact paths. |
| 3 | [backend/app/routes/analysis.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/routes/analysis.py) | API endpoints for CSV upload analysis, live data sync, and district anomaly rankings. |
| 4 | [backend/app/services/model_service.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/services/model_service.py) | Feature engineering, scaling, calibrated decision boundary ($\tau = -0.0150$), and 0–100 risk scoring. |
| 5 | [backend/app/services/rules_service.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/services/rules_service.py) | Statutory MGNREGA rule evaluations (60:40 norm, 10% admin ceiling, unit cost benchmark). |
| 6 | [backend/app/services/explanation_service.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/services/explanation_service.py) | Z-score feature variance calculations and natural-language audit justification generator. |
| 7 | [backend/app/services/data_service.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/services/data_service.py) | Dataset caching, filtering, and summary metrics computation. |
| 8 | [backend/app/services/scheme_service.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/services/scheme_service.py) | Modular multi-scheme registry supporting PM-KISAN, PMAY, PDS, NSP, and MGNREGA. |
| 9 | [backend/app/services/live_api_service.py](file:///c:/Users/anees/Desktop/Major%20project/backend/app/services/live_api_service.py) | Integration client for live data ingestion from data.gov.in APIs. |

---

### 2.5 Microservice Code (Secondary ML Service)
| # | File Path | Description |
| :--- | :--- | :--- |
| 1 | [ml-service/main.py](file:///c:/Users/anees/Desktop/Major%20project/ml-service/main.py) | Standalone FastAPI microservice providing isolated inference endpoints. |
| 2 | [ml-service/requirements.txt](file:///c:/Users/anees/Desktop/Major%20project/ml-service/requirements.txt) | Python dependencies for ML microservice. |

---

### 2.6 Frontend Application (React + Vite + TypeScript + Tailwind CSS)
| # | File Path | Description |
| :--- | :--- | :--- |
| 1 | [frontend/src/App.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/App.tsx) | React root application component with client-side routing. |
| 2 | [frontend/src/pages/LandingPage.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/pages/LandingPage.tsx) | Executive portal and architecture overview. |
| 3 | [frontend/src/pages/AnalysisPage.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/pages/AnalysisPage.tsx) | Interactive CSV audit analysis with live risk gauges and anomaly filtering. |
| 4 | [frontend/src/pages/DistrictRankingPage.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/pages/DistrictRankingPage.tsx) | Geospatial risk ranking across 700+ districts with exportable audit logs. |
| 5 | [frontend/src/pages/AboutPage.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/pages/AboutPage.tsx) | Methodology, ethics disclaimer, and algorithmic transparency documentation. |
| 6 | [frontend/src/components/RiskGauge.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/components/RiskGauge.tsx) | Visual risk dial (0–100 composite risk score). |
| 7 | [frontend/src/components/SuspiciousRecordsTable.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/components/SuspiciousRecordsTable.tsx) | Data table displaying flagged anomalies, Z-scores, and statutory breaches. |
| 8 | [frontend/src/components/AnomalyCharts.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/components/AnomalyCharts.tsx) | Recharts data visualizer for expenditure ratios and score distributions. |
| 9 | [frontend/src/components/ResponsibleAIDisclaimer.tsx](file:///c:/Users/anees/Desktop/Major%20project/frontend/src/components/ResponsibleAIDisclaimer.tsx) | Ethical AI compliance and auditor-in-the-loop notice. |

---

### 2.7 Experiment & Audit Scripts
| # | File Path | Description |
| :--- | :--- | :--- |
| 1 | [run_experiment.py](file:///c:/Users/anees/Desktop/Major%20project/run_experiment.py) | Master automated reproducibility runner reproducing all stages, baselines, ablations, and figures. |
| 2 | [evaluate_model_accuracy.py](file:///c:/Users/anees/Desktop/Major%20project/evaluate_model_accuracy.py) | Pre-existing evaluation script checking Stage 3 metrics against the full dataset. |
| 3 | [test_precision_90.py](file:///c:/Users/anees/Desktop/Major%20project/test_precision_90.py) | Threshold search script testing precision across multiple $\tau$ values. |
| 4 | [find_90_plus.py](file:///c:/Users/anees/Desktop/Major%20project/find_90_plus.py) | Fine-grained sweep over decision thresholds and confirmation filters. |
| 5 | [optimize_threshold.py](file:///c:/Users/anees/Desktop/Major%20project/optimize_threshold.py) | Script exploring threshold optimization on raw decision functions. |
| 6 | [inspect_model.py](file:///c:/Users/anees/Desktop/Major%20project/inspect_model.py) | Inspects serialization parameters of saved Isolation Forest and StandardScaler. |
| 7 | [test_mgnrega_pipeline.py](file:///c:/Users/anees/Desktop/Major%20project/test_mgnrega_pipeline.py) | End-to-end integration test verifying backend model and rule service integration. |
| 8 | [verify_all_schemes.py](file:///c:/Users/anees/Desktop/Major%20project/verify_all_schemes.py) | Verification test for multi-scheme registry pipelines. |

---

### 2.8 Generated Results & Figures
| # | File Path | Description |
| :--- | :--- | :--- |
| 1 | [TABLE_I_VERIFICATION.csv](file:///c:/Users/anees/Desktop/Major%20project/TABLE_I_VERIFICATION.csv) | Full verification table comparing Paper claims vs. Actual runs for Stages 1, 2, and 3. |
| 2 | [TABLE_II_VERIFICATION.csv](file:///c:/Users/anees/Desktop/Major%20project/TABLE_II_VERIFICATION.csv) | Verification table for all 5 synthetic fraud stress tests. |
| 3 | [BASELINE_RESULTS.csv](file:///c:/Users/anees/Desktop/Major%20project/BASELINE_RESULTS.csv) | Comparative benchmark across Rule-Based, Isolation Forest, LOF, OC-SVM, and GovGuard AI. |
| 4 | [ABLATION_RESULTS.csv](file:///c:/Users/anees/Desktop/Major%20project/ABLATION_RESULTS.csv) | Component-wise ablation study isolating boundary tuning, confirmation filter, and safety nets. |
| 5 | [figures/](file:///c:/Users/anees/Desktop/Major%20project/figures) | 9 high-resolution (300 DPI) publication-quality figures: Architecture, Preprocessing Flow, Confusion Matrix, Model Comparison, ROC Curves, PR Curves, Ablation Study, Score Distribution, and State Anomaly Distribution. |
