# 📐 FEATURE ENGINEERING VERIFICATION REPORT
**Project:** GovGuard AI  
**Audit Date:** 2026-09-29  
**Auditor Role:** Research Reproducibility Engineer & ML Research Auditor  

---

## 1. Mathematical Formulation & Statutory Feature Definitions

GovGuard AI constructs a 4-dimensional feature vector $\mathbf{x}_i \in \mathbb{R}^4$ for each administrative filing record $i$:

$$\mathbf{x}_i = \begin{bmatrix} x_{i,1} & x_{i,2} & x_{i,3} & x_{i,4} \end{bmatrix}^T$$

### Feature 1: Material Expenditure Ratio ($x_{i,1}$)
$$x_{i,1} = \frac{\text{Material\_and\_skilled\_Wages}_i}{\text{Total\_Exp}_i}$$
* **Statutory Role:** Evaluates compliance with the statutory 60:40 wage-to-material norm mandated by Schedule I, Section 16 of the MGNREGA Act.
* **Numerator:** `Material_and_skilled_Wages` (₹ in Lakhs).
* **Denominator:** `Total_Exp` (₹ in Lakhs).
* **Dimensionless Unit:** Ratio $\in [0.0, 1.0]$ under compliant execution.
* **Boundary Handling:** If $\text{Total\_Exp}_i \le 0$, value defaults safely to $0.0$.

---

### Feature 2: Administrative Overhead Ratio ($x_{i,2}$)
$$x_{i,2} = \frac{\text{Total\_Adm\_Expenditure}_i}{\text{Total\_Exp}_i}$$
* **Statutory Role:** Detects disproportionate administrative diversion relative to the legal supervisory cap (statutory ceiling of 6% to 10%).
* **Numerator:** `Total_Adm_Expenditure` (₹ in Lakhs).
* **Denominator:** `Total_Exp` (₹ in Lakhs).
* **Dimensionless Unit:** Ratio $\in [0.0, 1.0]$.
* **Boundary Handling:** If $\text{Total\_Exp}_i \le 0$, value defaults safely to $0.0$.

---

### Feature 3: Labor Wage Ratio ($x_{i,3}$)
$$x_{i,3} = \frac{\text{Wages}_i}{\text{Total\_Exp}_i}$$
* **Statutory Role:** Measures direct economic transfer to unskilled rural laborers (statutory baseline $\ge 60\%$).
* **Numerator:** `Wages` (₹ in Lakhs).
* **Denominator:** `Total_Exp` (₹ in Lakhs).
* **Dimensionless Unit:** Ratio $\in [0.0, 1.0]$.
* **Boundary Handling:** If $\text{Total\_Exp}_i \le 0$, value defaults safely to $0.0$.

---

### Feature 4: Realized Unit Cost per Person-Day ($x_{i,4}$)
$$x_{i,4} = \frac{\text{Total\_Exp}_i \times 10^5}{\text{Persondays}_i}$$
* **Statutory Role:** Captures abnormal financial drainage per realized person-day of labor. Detects zero-labor ghost billing and unit inflation.
* **Numerator:** $\text{Total\_Exp}_i \times 10^5$ (converts ₹ Lakhs into exact ₹ Indian Rupees).
* **Denominator:** $\text{Persondays}_i$ (cumulative person-days of labor generated).
* **Unit:** ₹ per Person-Day ($\text{INR} / \text{day}$).
* **Boundary Handling:** If $\text{Persondays}_i \le 0$, value defaults safely to $0.0$ or is filtered during preprocessing.

---

## 2. Verification of 10 Randomly Sampled Real-World Records

To verify mathematical correctness and implementation fidelity, 10 records were randomly drawn from the verified cohort ($N = 378,540$) using random seed `42`:

```
========================================================================================================================
Record 1 | ANDHRA PRADESH - EAST GODAVARI | FY: 2021-2022, Month: Dec
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹64,989.66 Lakhs
  • Material_and_skilled_Wages = ₹25,138.88 Lakhs
  • Total_Adm_Expenditure = ₹919.19 Lakhs
  • Wages = ₹38,931.59 Lakhs
  • Persondays = 17,235,436 days
Calculated Features:
  1. Material Ratio = 25,138.88 / 64,989.66 = 0.3868 (38.68%)
  2. Admin Ratio    = 919.19 / 64,989.66    = 0.0141 (1.41%)
  3. Wage Ratio     = 38,931.59 / 64,989.66 = 0.5990 (59.90%)
  4. Cost/Personday = (64,989.66 × 100,000) / 17,235,436 = ₹377.07 / day
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 2 | TELANGANA - Nagarkurnool | FY: 2025-2026, Month: April
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹427.24 Lakhs
  • Material_and_skilled_Wages = ₹25.36 Lakhs
  • Total_Adm_Expenditure = ₹0.00 Lakhs
  • Wages = ₹401.88 Lakhs
  • Persondays = 113,638 days
Calculated Features:
  1. Material Ratio = 25.36 / 427.24 = 0.0594 (5.94%)
  2. Admin Ratio    = 0.00 / 427.24   = 0.0000 (0.00%)
  3. Wage Ratio     = 401.88 / 427.24 = 0.9406 (94.06%)
  4. Cost/Personday = (427.24 × 100,000) / 113,638 = ₹375.97 / day
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 3 | UTTAR PRADESH - BARABANKI | FY: 2024-2025, Month: Oct
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹16,418.13 Lakhs
  • Material_and_skilled_Wages = ₹6,136.53 Lakhs
  • Total_Adm_Expenditure = ₹587.50 Lakhs
  • Wages = ₹9,694.10 Lakhs
  • Persondays = 4,004,444 days
Calculated Features:
  1. Material Ratio = 6,136.53 / 16,418.13 = 0.3738 (37.38%)
  2. Admin Ratio    = 587.50 / 16,418.13   = 0.0358 (3.58%)
  3. Wage Ratio     = 9,694.10 / 16,418.13 = 0.5905 (59.05%)
  4. Cost/Personday = (16,418.13 × 100,000) / 4,004,444 = ₹410.00 / day
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 4 | MANIPUR - TAMENGLONG | FY: 2025-2026, Month: Nov
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹4,340.50 Lakhs
  • Material_and_skilled_Wages = ₹1,585.00 Lakhs
  • Total_Adm_Expenditure = ₹22.19 Lakhs
  • Wages = ₹2,733.31 Lakhs
  • Persondays = 1,066,609 days
Calculated Features:
  1. Material Ratio = 1,585.00 / 4,340.50 = 0.3652 (36.52%)
  2. Admin Ratio    = 22.19 / 4,340.50    = 0.0051 (0.51%)
  3. Wage Ratio     = 2,733.31 / 4,340.50 = 0.6297 (62.97%)
  4. Cost/Personday = (4,340.50 × 100,000) / 1,066,609 = ₹406.94 / day
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 5 | HIMACHAL PRADESH - HAMIRPUR | FY: 2025-2026, Month: Dec
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹3,147.76 Lakhs
  • Material_and_skilled_Wages = ₹1,289.01 Lakhs
  • Total_Adm_Expenditure = ₹295.81 Lakhs
  • Wages = ₹1,562.95 Lakhs
  • Persondays = 556,554 days
Calculated Features:
  1. Material Ratio = 1,289.01 / 3,147.76 = 0.4095 (40.95% - Breach > 40%)
  2. Admin Ratio    = 295.81 / 3,147.76   = 0.0940 (9.40%)
  3. Wage Ratio     = 1,562.95 / 3,147.76 = 0.4965 (49.65%)
  4. Cost/Personday = (3,147.76 × 100,000) / 556,554 = ₹565.58 / day (Breach > ₹450)
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 6 | TAMIL NADU - THENI | FY: 2024-2025, Month: March
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹10,395.24 Lakhs
  • Material_and_skilled_Wages = ₹3,707.56 Lakhs
  • Total_Adm_Expenditure = ₹424.91 Lakhs
  • Wages = ₹6,262.77 Lakhs
  • Persondays = 2,206,859 days
Calculated Features:
  1. Material Ratio = 3,707.56 / 10,395.24 = 0.3567 (35.67%)
  2. Admin Ratio    = 424.91 / 10,395.24   = 0.0409 (4.09%)
  3. Wage Ratio     = 6,262.77 / 10,395.24 = 0.6025 (60.25%)
  4. Cost/Personday = (10,395.24 × 100,000) / 2,206,859 = ₹471.04 / day (Breach > ₹450)
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 7 | KERALA - ERNAKULAM | FY: 2024-2025, Month: May
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹1,301.39 Lakhs
  • Material_and_skilled_Wages = ₹590.41 Lakhs
  • Total_Adm_Expenditure = ₹314.60 Lakhs
  • Wages = ₹396.39 Lakhs
  • Persondays = 118,605 days
Calculated Features:
  1. Material Ratio = 590.41 / 1,301.39 = 0.4537 (45.37% - Breach > 40%)
  2. Admin Ratio    = 314.60 / 1,301.39 = 0.2417 (24.17% - Breach > 10%)
  3. Wage Ratio     = 396.39 / 1,301.39 = 0.3046 (30.46%)
  4. Cost/Personday = (1,301.39 × 100,000) / 118,605 = ₹1,097.25 / day (Severe Breach)
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 8 | ODISHA - KENDRAPARA | FY: 2025-2026, Month: May
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹342.96 Lakhs
  • Material_and_skilled_Wages = ₹0.00 Lakhs
  • Total_Adm_Expenditure = ₹0.00 Lakhs
  • Wages = ₹342.96 Lakhs
  • Persondays = 109,506 days
Calculated Features:
  1. Material Ratio = 0.00 / 342.96   = 0.0000 (0.00%)
  2. Admin Ratio    = 0.00 / 342.96   = 0.0000 (0.00%)
  3. Wage Ratio     = 342.96 / 342.96 = 1.0000 (100.00%)
  4. Cost/Personday = (342.96 × 100,000) / 109,506 = ₹313.19 / day
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 9 | TRIPURA - Sepahijala | FY: 2024-2025, Month: Dec
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹8,210.16 Lakhs
  • Material_and_skilled_Wages = ₹2,100.98 Lakhs
  • Total_Adm_Expenditure = ₹682.62 Lakhs
  • Wages = ₹5,426.56 Lakhs
  • Persondays = 2,497,845 days
Calculated Features:
  1. Material Ratio = 2,100.98 / 8,210.16 = 0.2559 (25.59%)
  2. Admin Ratio    = 682.62 / 8,210.16   = 0.0831 (8.31%)
  3. Wage Ratio     = 5,426.56 / 8,210.16 = 0.6610 (66.10%)
  4. Cost/Personday = (8,210.16 × 100,000) / 2,497,845 = ₹328.69 / day
Verification Status: EXACT MATHEMATICAL MATCH ✅
------------------------------------------------------------------------------------------------------------------------

Record 10 | SIKKIM - SORENG | FY: 2024-2025, Month: April
------------------------------------------------------------------------------------------------------------------------
Raw Inputs:
  • Total_Exp = ₹57.42 Lakhs
  • Material_and_skilled_Wages = ₹1.57 Lakhs
  • Total_Adm_Expenditure = ₹0.96 Lakhs
  • Wages = ₹54.89 Lakhs
  • Persondays = 10,284 days
Calculated Features:
  1. Material Ratio = 1.57 / 57.42  = 0.0274 (2.74%)
  2. Admin Ratio    = 0.96 / 57.42  = 0.0167 (1.67%)
  3. Wage Ratio     = 54.89 / 57.42 = 0.9559 (95.59%)
  4. Cost/Personday = (57.42 × 100,000) / 10,284 = ₹558.34 / day (Breach > ₹450)
Verification Status: EXACT MATHEMATICAL MATCH ✅
========================================================================================================================
```

---

## 3. Boundary & Outlier Handling Analysis

1. **Zero Division Protection:** In `model_service.py`, `np.errstate(divide='ignore', invalid='ignore')` and `np.nan_to_num()` protect against runtime exceptions, ensuring infinite values (`inf`, `-inf`) and `NaN` are mapped to compliant defaults ($0.0$ for ratios, $50,000$ ceiling for extreme unit costs).
2. **Consistency of ₹ Lakhs to INR Conversion:** The scaling constant $10^5$ ($100,000$) is mathematically required because `Total_Exp` is recorded in Indian Lakhs while `Persondays` is recorded as absolute integer days.
