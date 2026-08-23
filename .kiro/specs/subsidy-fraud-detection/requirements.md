# Requirements Document: AI-Based Subsidy Leakage Detection and Monitoring System

## Introduction

This system provides government agencies with automated fraud detection and monitoring capabilities for subsidy programs. The system analyzes beneficiary data to identify duplicate records, verify eligibility, detect fraudulent patterns using machine learning, and provide actionable insights through visual analytics. The goal is to reduce subsidy leakage, prevent fraud, and ensure subsidies reach legitimate beneficiaries.

## Glossary

- **System**: The AI-Based Subsidy Leakage Detection and Monitoring System
- **Beneficiary**: An individual who receives or applies for government subsidies
- **Beneficiary_Record**: A data structure containing all information about a beneficiary including personal details, financial information, and subsidy history
- **Admin**: A system user with authentication credentials and assigned role-based permissions
- **Fraud_Score**: A numerical value (0-100) indicating the likelihood that a beneficiary record is fraudulent
- **Risk_Classification**: A categorical label (Low, Medium, High) assigned based on fraud probability
- **Duplicate_Record**: A beneficiary record that shares identifying information with another record
- **Eligibility_Criteria**: A set of rules based on income threshold and scheme-specific requirements
- **Subsidy_Leakage**: The percentage of subsidy funds distributed to fraudulent or ineligible beneficiaries
- **ML_Model**: A machine learning algorithm (Logistic Regression, Random Forest, or Isolation Forest) trained to detect fraud patterns
- **Dashboard**: The visual interface displaying analytics, statistics, and fraud detection results
- **Aadhaar_Number**: A unique 12-digit identification number issued by the Indian government (stored in masked format)
- **Claim_Frequency**: The number of times a beneficiary has claimed subsidies within a time period
- **Scheme_Type**: The category of government subsidy program (e.g., agricultural, housing, education)

## Requirements

### Requirement 1: Admin Authentication and Authorization

**User Story:** As a government administrator, I want to securely authenticate and access system features based on my role, so that sensitive beneficiary data is protected and access is controlled.

#### Acceptance Criteria

1. WHEN an admin provides valid credentials, THE System SHALL authenticate the admin and create a session
2. WHEN an admin provides invalid credentials, THE System SHALL reject authentication and return an error message
3. WHEN an authenticated admin attempts to access a feature, THE System SHALL verify the admin's role permissions before granting access
4. WHEN an admin session expires, THE System SHALL require re-authentication before allowing further access
5. THE System SHALL encrypt admin credentials during transmission and storage

### Requirement 2: Beneficiary Data Management

**User Story:** As an admin, I want to create, read, update, and delete beneficiary records, so that I can maintain accurate beneficiary information.

#### Acceptance Criteria

1. WHEN an admin creates a new beneficiary record with valid data, THE System SHALL store the record and assign a unique Beneficiary_ID
2. WHEN an admin creates a beneficiary record with invalid data, THE System SHALL reject the record and return validation errors
3. WHEN an admin requests a beneficiary record by Beneficiary_ID, THE System SHALL return the complete record with masked Aadhaar_Number
4. WHEN an admin updates a beneficiary record with valid changes, THE System SHALL persist the changes and update the modification timestamp
5. WHEN an admin deletes a beneficiary record, THE System SHALL remove the record from active data while maintaining audit logs
6. THE System SHALL validate all input fields against defined data types and constraints before persistence

### Requirement 3: Bulk Data Upload and Processing

**User Story:** As an admin, I want to upload beneficiary data in CSV format, so that I can efficiently process large volumes of records.

#### Acceptance Criteria

1. WHEN an admin uploads a valid CSV file, THE System SHALL parse all records and store them in the database
2. WHEN an admin uploads a CSV file with invalid format, THE System SHALL reject the upload and return format errors
3. WHEN processing CSV records, THE System SHALL validate each record and report validation failures with row numbers
4. WHEN a CSV upload completes, THE System SHALL return a summary showing total records processed, successful imports, and failed records
5. THE System SHALL support CSV files containing all required beneficiary fields (Beneficiary_ID, Name, Aadhaar_Number, Age, Gender, Address, District, Income, Family_Size, Scheme_Type, Bank_Account, IFSC, Subsidy_Amount, Claim_Frequency, Registration_Date, Last_Claim_Date, Eligibility_Status, Fraud_Label)

### Requirement 4: Duplicate Detection

**User Story:** As an admin, I want the system to automatically detect duplicate beneficiaries, so that I can prevent multiple subsidy claims by the same individual.

#### Acceptance Criteria

1. WHEN a new beneficiary record is added, THE System SHALL check for existing records with matching Aadhaar_Number
2. WHEN a new beneficiary record is added, THE System SHALL check for existing records with matching Bank_Account and IFSC combination
3. WHEN a new beneficiary record is added, THE System SHALL check for existing records with matching mobile number
4. WHEN duplicate records are detected, THE System SHALL flag all matching records as Duplicate_Record
5. WHEN duplicate records are detected, THE System SHALL increase the Fraud_Score for all involved records
6. THE System SHALL maintain a list of all detected duplicate record groups with their matching criteria

### Requirement 5: Eligibility Verification

**User Story:** As an admin, I want the system to verify beneficiary eligibility based on income and scheme criteria, so that only qualified individuals receive subsidies.

#### Acceptance Criteria

1. WHEN evaluating a beneficiary record, THE System SHALL compare the beneficiary's income against the scheme-specific income threshold
2. WHEN a beneficiary's income exceeds the threshold, THE System SHALL mark the record as ineligible
3. WHEN evaluating a beneficiary record, THE System SHALL verify all scheme-specific Eligibility_Criteria are met
4. WHEN eligibility criteria are not met, THE System SHALL update the Eligibility_Status field and provide specific reasons
5. THE System SHALL support configurable income thresholds for different Scheme_Type values

### Requirement 6: ML-Based Fraud Detection

**User Story:** As an admin, I want the system to use machine learning models to detect fraudulent patterns, so that I can identify suspicious beneficiaries that may not be caught by rule-based checks.

#### Acceptance Criteria

1. WHEN analyzing a beneficiary record, THE System SHALL apply trained ML_Model algorithms (Logistic Regression, Random Forest, Isolation Forest) to generate fraud predictions
2. WHEN ML_Model analysis completes, THE System SHALL assign a Fraud_Score (0-100) to the beneficiary record
3. WHEN ML_Model analysis completes, THE System SHALL assign a Risk_Classification (Low, Medium, High) based on the Fraud_Score
4. THE System SHALL use features including Income, Claim_Frequency, Subsidy_Amount, Age, Family_Size, and time-based patterns for fraud detection
5. WHEN a beneficiary record has Fraud_Score above 70, THE System SHALL classify it as High risk
6. WHEN a beneficiary record has Fraud_Score between 40 and 70, THE System SHALL classify it as Medium risk
7. WHEN a beneficiary record has Fraud_Score below 40, THE System SHALL classify it as Low risk

### Requirement 7: Analytics Dashboard

**User Story:** As an admin, I want to view visual analytics and statistics, so that I can understand fraud patterns and monitor system effectiveness.

#### Acceptance Criteria

1. THE Dashboard SHALL display the total count of beneficiary records in the system
2. THE Dashboard SHALL display the count of records flagged as fraudulent (High risk)
3. THE Dashboard SHALL calculate and display Subsidy_Leakage percentage as (fraudulent subsidy amount / total subsidy amount) × 100
4. THE Dashboard SHALL display scheme-wise analysis showing beneficiary count and fraud count per Scheme_Type
5. THE Dashboard SHALL display district-wise fraud distribution
6. THE Dashboard SHALL display fraud trend analysis over time using Registration_Date and Last_Claim_Date
7. WHEN Dashboard data is requested, THE System SHALL compute all metrics from current database state
8. THE Dashboard SHALL use Chart.js visualizations for graphical representation of statistics

### Requirement 8: Report Generation and Export

**User Story:** As an admin, I want to generate and export reports in CSV and PDF formats, so that I can share findings with stakeholders and maintain records.

#### Acceptance Criteria

1. WHEN an admin requests a CSV export, THE System SHALL generate a file containing all beneficiary records with fraud detection results
2. WHEN an admin requests a PDF report, THE System SHALL generate a formatted document containing summary statistics and high-risk beneficiaries
3. WHEN generating reports, THE System SHALL include Beneficiary_ID, Name, Fraud_Score, Risk_Classification, and duplicate flags
4. WHEN generating reports, THE System SHALL mask Aadhaar_Number for privacy protection
5. THE System SHALL allow filtering reports by Risk_Classification, Scheme_Type, and District before export

### Requirement 9: Data Security and Privacy

**User Story:** As a system administrator, I want beneficiary data to be encrypted and protected, so that sensitive personal information remains confidential.

#### Acceptance Criteria

1. THE System SHALL encrypt all Aadhaar_Number values before storage in the database
2. THE System SHALL mask Aadhaar_Number in all user interfaces, displaying only the last 4 digits
3. THE System SHALL encrypt data transmission between frontend and backend using HTTPS/TLS
4. THE System SHALL encrypt sensitive fields (Bank_Account, Aadhaar_Number) at rest in the database
5. WHEN storing passwords, THE System SHALL use cryptographic hashing with salt
6. THE System SHALL validate and sanitize all user inputs to prevent injection attacks

### Requirement 10: System Architecture and Integration

**User Story:** As a system architect, I want clear separation between frontend, backend, and ML components, so that the system is maintainable and scalable.

#### Acceptance Criteria

1. THE System SHALL implement a React.js frontend that communicates with the backend via REST API
2. THE System SHALL implement a Node.js + Express backend that handles business logic and data operations
3. THE System SHALL use MongoDB for persistent storage of beneficiary records and system data
4. THE System SHALL implement Python-based ML services that can be invoked by the backend for fraud detection
5. WHEN the frontend is deployed on Vercel, THE System SHALL maintain full functionality
6. WHEN the backend is deployed on Render, THE System SHALL maintain full functionality
7. WHEN the database is hosted on MongoDB Atlas, THE System SHALL maintain data integrity and performance
