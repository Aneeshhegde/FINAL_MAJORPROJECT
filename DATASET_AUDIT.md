# 🔍 DATASET AUDIT REPORT
**Dataset Evaluated:** Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) Verified Dataset  
**Target File:** `backend/data/mgnrega.csv`  
**Audit Date:** 2026-09-29  
**Auditor Role:** Research Reproducibility Engineer & ML Research Auditor  

---

## 1. Dataset Metadata & Provenance

| Parameter | Value / Finding |
| :--- | :--- |
| **Dataset Name** | National Rural Employment Guarantee Scheme (MGNREGA) Monthly Filings Dataset |
| **Official Source** | Ministry of Rural Development (MoRD) / Open Government Data (OGD) Platform India |
| **URL / API Connector** | `https://data.gov.in/` (Resource ID: `ee960515-ff5d-4f18-8098-9dc2d1b54a2c`) |
| **Financial Year Range** | **8 Financial Years:** `2018–2019`, `2019–2020`, `2020–2021`, `2021–2022`, `2022–2023`, `2023–2024`, `2024–2025`, `2025–2026` |
| **Total Ingested Raw Rows** | **389,831 rows** |
| **Total Ingested Columns** | **36 columns** |
| **Geographical Scope** | **34 Indian States & Union Territories**, **700+ Rural Districts** |
| **Duplicate Rows (Exact)** | **47 rows** (0.0121% of raw dataset) |

---

## 2. Schema, Columns & Data Types

The raw CSV contains 36 administrative and financial columns:

| Column Name | Inferred Data Type | Semantic Description / Role |
| :--- | :--- | :--- |
| `fin_year` | `string` | Financial Year of reporting (e.g. `2024-2025`) |
| `month` | `string` | Calendar month of reporting (e.g. `April`, `Dec`) |
| `state_code` | `float64` | Census / MoRD State Identification Code |
| `state_name` | `string` | Name of State / UT (34 distinct administrative territories) |
| `district_code` | `float64` | District Identification Code |
| `district_name` | `string` | Name of District |
| `Approved_Labour_Budget` | `float64` | Approved labour allocation (Persondays) |
| `Average_Wage_rate_per_day_per_person` | `float64` | Statutory average daily wage rate recorded (₹) |
| `Average_days_of_employment_provided_per_Household` | `float64` | Average work days provided per rural household |
| `Differently_abled_persons_worked` | `float64` | Number of differently abled workers engaged |
| `Material_and_skilled_Wages` | `float64` | **Key Feature:** Expenditure on materials and skilled labor (₹ in Lakhs) |
| `Number_of_Completed_Works` | `float64` | Total completed civil and rural infrastructure works |
| `Number_of_GPs_with_NIL_exp` | `float64` | Number of Gram Panchayats with zero expenditure |
| `Number_of_Ongoing_Works` | `float64` | Total active ongoing civil works |
| `Persondays_of_Central_Liability_so_far` | `float64` | **Key Feature:** Total cumulative persondays generated |
| `SC_persondays` | `float64` | Persondays generated for Scheduled Caste beneficiaries |
| `SC_workers_against_active_workers` | `float64` | SC worker participation ratio |
| `ST_persondays` | `float64` | Persondays generated for Scheduled Tribe beneficiaries |
| `ST_workers_against_active_workers` | `float64` | ST worker participation ratio |
| `Total_Adm_Expenditure` | `float64` | **Key Feature:** Administrative overheads and supervisory expenses (₹ in Lakhs) |
| `Total_Exp` | `float64` | **Key Feature:** Total cumulative financial outlay (₹ in Lakhs) |
| `Total_Households_Worked` | `float64` | Cumulative households provided wage employment |
| `Total_Individuals_Worked` | `float64` | Cumulative individuals provided wage employment |
| `Total_No_of_Active_Job_Cards` | `float64` | Total active registered job cards |
| `Total_No_of_Active_Workers` | `float64` | Total active workers in database |
| `Total_No_of_HHs_completed_100_Days_of_Wage_Employment` | `float64` | Households completing full 100-day statutory guarantee |
| `Total_No_of_JobCards_issued` | `float64` | Cumulative job cards issued |
| `Total_No_of_Workers` | `float64` | Total registered workers |
| `Total_No_of_Works_Takenup` | `float64` | Cumulative works initiated |
| `Wages` | `float64` | **Key Feature:** Direct wage disbursements (₹ in Lakhs) |
| `Women_Persondays` | `float64` | Persondays generated for women workers |
| `percent_of_Category_B_Works` | `float64` | Percentage of individual asset works |
| `percent_of_Expenditure_on_Agriculture_Allied_Works` | `float64` | Percentage allocation on agriculture/allied works |
| `percent_of_NRM_Expenditure` | `float64` | Percentage allocation on natural resource management |
| `percentage_payments_gererated_within_15_days` | `float64` | Statutory wage payment timeliness (%) |
| `Remarks` | `string` | Administrative audit notes and filing comments |

---

## 3. Dataset Preprocessing & Filter Reconciliation

### Exact Reconciliation Formula:
$$\text{Raw Ingested Records } (389,831) - \text{Invalid Records Removed } (11,291) = \text{Final Usable Analysis Cohort } (378,540)$$

### Itemized Record Invalidation Table:

| Reason for Record Exclusion | Number of Records | Percentage of Raw Data (%) | Preprocessing Rule / Criterion |
| :--- | :--- | :--- | :--- |
| **Total Expenditure $\le 0$ Only** (Zero or negative outlay with valid positive persondays) | **195** | $0.0500\%$ | `Total_Exp <= 0.0` or `Total_Exp.isna()` |
| **Persondays $\le 0$ Only** (Zero or negative persondays with valid positive expenditure) | **9,890** | $2.5370\%$ | `Persondays <= 0.0` or `Persondays.isna()` |
| **Both Total Expenditure $\le 0$ AND Persondays $\le 0$** (Completely uninstantiated or zero-activity filings) | **1,206** | $0.3094\%$ | `(Total_Exp <= 0) & (Persondays <= 0)` |
| **Total Invalidation Union ($\text{Total\_Exp} \le 0 \lor \text{Persondays} \le 0$)** | **11,291** | **$2.8964\%$** | Primary valid cohort filter |
| **Final Verified Usable Records** | **378,540** | **$97.1036\%$** | Usable analysis dataset |

---

## 4. Paper Claims vs. Actual Dataset Verification

| Parameter | Paper Claim | Actual Dataset Result | Discrepancy | Scientific / Reproducibility Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Raw Records Ingested** | 389,831 | 389,831 | **0** | **EXACT MATCH** ✅ |
| **Final Usable Cohort** | 378,540 | 378,540 | **0** | **EXACT MATCH** ✅ |
| **Number of Indian States/UTs** | 34 | 34 | **0** | **EXACT MATCH** ✅ |
| **Number of Districts** | 700+ | 734 unique districts | **0** | **EXACT MATCH** ✅ |
| **Temporal Range** | 2018–2026 (8 FYs) | 2018–2019 to 2025–2026 | **0** | **EXACT MATCH** ✅ |

### Audit Findings:
1. The paper's claim of **389,831 raw records** and **378,540 preprocessed records** is **100% mathematically verified** directly against `backend/data/mgnrega.csv`.
2. The exclusion criteria are strictly grounded in numerical validity: records with $\text{Total\_Exp} \le 0$ or $\text{Persondays} \le 0$ cannot support division-based statutory ratios ($x_{i,1}, x_{i,2}, x_{i,3}, x_{i,4}$) without generating infinite or undefined mathematical singularities.
