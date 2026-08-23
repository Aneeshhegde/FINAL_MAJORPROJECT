# Implementation Plan: AI-Based Subsidy Leakage Detection and Monitoring System

## Overview

This implementation plan breaks down the subsidy fraud detection system into incremental, testable steps. The approach follows a bottom-up strategy: building core services first, then integrating them into the API layer, and finally connecting the frontend. Each task builds on previous work, ensuring no orphaned code.

The system will be implemented in three main phases:
1. **Backend Core Services** (Authentication, Data Management, Business Logic)
2. **ML Service Integration** (Python-based fraud detection)
3. **Frontend and Integration** (React UI, API integration, reporting)

## Tasks

- [ ] 1. Project setup and infrastructure
  - Initialize Node.js/TypeScript backend project with Express
  - Initialize React/TypeScript frontend project
  - Initialize Python ML service project
  - Set up MongoDB connection and configuration
  - Configure environment variables for all services
  - Set up testing frameworks (Jest for backend, fast-check for property tests, Hypothesis for Python)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 2. Database models and schemas
  - [ ] 2.1 Create MongoDB schemas for Beneficiary, Admin, and AuditLog collections
    - Define Mongoose schemas with validation rules
    - Create indexes for Aadhaar, bank account, mobile, district, scheme type
    - Implement encryption helpers for sensitive fields
    - _Requirements: 9.1, 9.4_
  
  - [ ]* 2.2 Write property test for beneficiary schema validation
    - **Property 7: Invalid beneficiary data is rejected**
    - **Validates: Requirements 2.2, 2.6**
  
  - [ ]* 2.3 Write unit tests for schema edge cases
    - Test boundary values for age, income, family size
    - Test invalid Aadhaar formats
    - _Requirements: 2.2, 2.6_

- [ ] 3. Authentication service implementation
  - [ ] 3.1 Implement authentication service with JWT
    - Create authenticate() method with credential validation
    - Create verifyToken() method for JWT validation
    - Implement password hashing with bcrypt
    - Implement role-based permission checking
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 3.2 Write property test for valid credentials
    - **Property 1: Valid credentials create authenticated sessions**
    - **Validates: Requirements 1.1**
  
  - [ ]* 3.3 Write property test for invalid credentials
    - **Property 2: Invalid credentials are rejected**
    - **Validates: Requirements 1.2**
  
  - [ ]* 3.4 Write property test for role-based access
    - **Property 3: Role-based access control**
    - **Validates: Requirements 1.3**
  
  - [ ]* 3.5 Write property test for password hashing
    - **Property 5: Credentials are hashed, not stored in plaintext**
    - **Validates: Requirements 1.5**
  
  - [ ]* 3.6 Write unit tests for session expiry
    - Test expired token rejection
    - Test token refresh scenarios
    - _Requirements: 1.4_

- [ ] 4. Beneficiary service core CRUD operations
  - [ ] 4.1 Implement beneficiary service with create, read, update, delete methods
    - Implement create() with validation
    - Implement getById() with Aadhaar masking
    - Implement update() with timestamp management
    - Implement delete() with audit logging
    - Implement list() with filtering and pagination
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  
  - [ ]* 4.2 Write property test for beneficiary creation
    - **Property 6: Valid beneficiary creation with unique IDs**
    - **Validates: Requirements 2.1**
  
  - [ ]* 4.3 Write property test for retrieval round-trip
    - **Property 8: Beneficiary retrieval round-trip with Aadhaar masking**
    - **Validates: Requirements 2.3**
  
  - [ ]* 4.4 Write property test for updates
    - **Property 9: Updates persist and update timestamps**
    - **Validates: Requirements 2.4**
  
  - [ ]* 4.5 Write property test for deletion with audit trail
    - **Property 10: Deletion removes from active data but preserves audit trail**
    - **Validates: Requirements 2.5**

- [ ] 5. Data validation and sanitization
  - [ ] 5.1 Implement input validation service
    - Create validation rules for all beneficiary fields
    - Implement sanitization for string inputs
    - Create validation error formatting
    - _Requirements: 2.6, 9.6_
  
  - [ ]* 5.2 Write property test for input sanitization
    - **Property 40: Input sanitization prevents injection**
    - **Validates: Requirements 9.6**

- [ ] 6. Duplicate detection service
  - [ ] 6.1 Implement duplicate detection service
    - Create checkAadhaarDuplicate() method
    - Create checkBankAccountDuplicate() method
    - Create checkMobileDuplicate() method
    - Create detectDuplicates() orchestration method
    - Implement fraud score adjustment for duplicates
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 6.2 Write property test for duplicate detection
    - **Property 15: Duplicate detection across all identifier types**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [ ]* 6.3 Write property test for duplicate flagging
    - **Property 16: All duplicate records are flagged**
    - **Validates: Requirements 4.4**
  
  - [ ]* 6.4 Write property test for fraud score increase
    - **Property 17: Duplicates increase fraud scores**
    - **Validates: Requirements 4.5**
  
  - [ ]* 6.5 Write unit tests for duplicate edge cases
    - Test partial matches
    - Test case sensitivity
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Eligibility verification service
  - [ ] 7.1 Implement eligibility verification service
    - Create verifyEligibility() method
    - Implement income threshold comparison
    - Create configurable scheme criteria checker
    - Implement eligibility reason tracking
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 7.2 Write property test for income threshold
    - **Property 19: Income threshold comparison**
    - **Validates: Requirements 5.1**
  
  - [ ]* 7.3 Write property test for ineligibility marking
    - **Property 20: Income exceeding threshold marks ineligible**
    - **Validates: Requirements 5.2**
  
  - [ ]* 7.4 Write property test for criteria evaluation
    - **Property 21: All eligibility criteria are evaluated**
    - **Validates: Requirements 5.3**
  
  - [ ]* 7.5 Write unit tests for scheme-specific criteria
    - Test different scheme types
    - Test threshold edge cases
    - _Requirements: 5.5_

- [ ] 8. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. CSV upload and processing service
  - [ ] 9.1 Implement CSV upload service
    - Create CSV parser with validation
    - Implement batch record processing
    - Create upload summary generation
    - Integrate with beneficiary service for storage
    - Integrate with duplicate detection
    - Integrate with eligibility verification
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 9.2 Write property test for valid CSV processing
    - **Property 11: Valid CSV files are fully processed**
    - **Validates: Requirements 3.1, 3.5**
  
  - [ ]* 9.3 Write property test for invalid CSV rejection
    - **Property 12: Invalid CSV format is rejected**
    - **Validates: Requirements 3.2**
  
  - [ ]* 9.4 Write property test for row validation reporting
    - **Property 13: CSV validation reports specific row failures**
    - **Validates: Requirements 3.3**
  
  - [ ]* 9.5 Write property test for upload summary accuracy
    - **Property 14: Upload summary accuracy**
    - **Validates: Requirements 3.4**

- [ ] 10. Python ML service implementation
  - [ ] 10.1 Create ML fraud detection service
    - Implement feature extraction from beneficiary data
    - Load pre-trained Logistic Regression model
    - Load pre-trained Random Forest model
    - Load pre-trained Isolation Forest model
    - Implement ensemble prediction with weighted averaging
    - Create fraud score calculation (0-100 scale)
    - Implement risk classification logic
    - Create Flask/FastAPI endpoint for predictions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 10.2 Write property test for fraud score range
    - **Property 25: Fraud scores are in valid range**
    - **Validates: Requirements 6.2**
  
  - [ ]* 10.3 Write property test for risk classification
    - **Property 26: Risk classification matches fraud score thresholds**
    - **Validates: Requirements 6.3, 6.5, 6.6, 6.7**
  
  - [ ]* 10.4 Write property test for feature extraction
    - **Property 27: Required features are extracted**
    - **Validates: Requirements 6.4**
  
  - [ ]* 10.5 Write unit tests for model predictions
    - Test known fraud patterns
    - Test known legitimate patterns
    - _Requirements: 6.1_

- [ ] 11. ML service client for Node.js backend
  - [ ] 11.1 Implement ML service client
    - Create HTTP client for Python ML service
    - Implement analyzeFraud() method
    - Implement batchAnalyze() method
    - Add error handling for ML service unavailability
    - Add retry logic with exponential backoff
    - _Requirements: 6.1_
  
  - [ ]* 11.2 Write property test for ML model execution
    - **Property 24: All ML models generate predictions**
    - **Validates: Requirements 6.1**
  
  - [ ]* 11.3 Write integration tests for ML service communication
    - Test successful predictions
    - Test error handling
    - _Requirements: 6.1_

- [ ] 12. Dashboard service implementation
  - [ ] 12.1 Implement dashboard service
    - Create getStatistics() with aggregation queries
    - Implement getSchemeWiseAnalysis() with grouping
    - Implement getDistrictWiseAnalysis() with grouping
    - Create getFraudTrends() with time-series aggregation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 12.2 Write property test for dashboard metrics accuracy
    - **Property 28: Dashboard metrics match database state**
    - **Validates: Requirements 7.1, 7.2, 7.7**
  
  - [ ]* 12.3 Write property test for leakage calculation
    - **Property 29: Leakage percentage calculation accuracy**
    - **Validates: Requirements 7.3**
  
  - [ ]* 12.4 Write property test for scheme-wise aggregation
    - **Property 30: Scheme-wise aggregation accuracy**
    - **Validates: Requirements 7.4**
  
  - [ ]* 12.5 Write property test for district-wise aggregation
    - **Property 31: District-wise aggregation accuracy**
    - **Validates: Requirements 7.5**
  
  - [ ]* 12.6 Write property test for fraud trends
    - **Property 32: Fraud trend accuracy over time**
    - **Validates: Requirements 7.6**

- [ ] 13. Report generation service
  - [ ] 13.1 Implement report generation service
    - Create CSV export with filtering
    - Create PDF export with formatting
    - Implement report data aggregation
    - Ensure Aadhaar masking in reports
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 13.2 Write property test for CSV export completeness
    - **Property 33: CSV export completeness**
    - **Validates: Requirements 8.1**
  
  - [ ]* 13.3 Write property test for PDF report content
    - **Property 34: PDF report contains required sections**
    - **Validates: Requirements 8.2**
  
  - [ ]* 13.4 Write property test for report content and masking
    - **Property 35: Report content includes required fields with masked Aadhaar**
    - **Validates: Requirements 8.3, 8.4**
  
  - [ ]* 13.5 Write property test for report filtering
    - **Property 36: Report filtering accuracy**
    - **Validates: Requirements 8.5**

- [ ] 14. Checkpoint - All services implemented
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. REST API endpoints implementation
  - [ ] 15.1 Create authentication endpoints
    - POST /api/auth/login - Admin login
    - POST /api/auth/logout - Admin logout
    - GET /api/auth/me - Get current admin info
    - Add authentication middleware
    - Add role-based authorization middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 15.2 Create beneficiary management endpoints
    - POST /api/beneficiaries - Create beneficiary
    - GET /api/beneficiaries/:id - Get beneficiary by ID
    - PUT /api/beneficiaries/:id - Update beneficiary
    - DELETE /api/beneficiaries/:id - Delete beneficiary
    - GET /api/beneficiaries - List beneficiaries with filters
    - POST /api/beneficiaries/upload - CSV upload
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 3.1_
  
  - [ ] 15.3 Create analytics endpoints
    - GET /api/dashboard/statistics - Get dashboard stats
    - GET /api/dashboard/scheme-analysis - Get scheme-wise data
    - GET /api/dashboard/district-analysis - Get district-wise data
    - GET /api/dashboard/trends - Get fraud trends
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 15.4 Create report endpoints
    - GET /api/reports/csv - Generate CSV report
    - GET /api/reports/pdf - Generate PDF report
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 15.5 Write integration tests for API endpoints
    - Test authentication flow
    - Test CRUD operations
    - Test error responses
    - _Requirements: 1.1, 2.1, 2.3, 2.4, 2.5_

- [ ] 16. Data encryption and security implementation
  - [ ] 16.1 Implement encryption for sensitive fields
    - Create encryption service using crypto library
    - Encrypt Aadhaar numbers before storage
    - Encrypt bank account numbers before storage
    - Implement Aadhaar masking utility
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [ ]* 16.2 Write property test for sensitive field encryption
    - **Property 37: Sensitive fields are encrypted at rest**
    - **Validates: Requirements 9.1, 9.4**
  
  - [ ]* 16.3 Write property test for Aadhaar masking
    - **Property 38: Aadhaar masking in all interfaces**
    - **Validates: Requirements 9.2**
  
  - [ ]* 16.4 Write property test for password hashing
    - **Property 39: Password hashing with salt**
    - **Validates: Requirements 9.5**

- [ ] 17. Frontend React application setup
  - [ ] 17.1 Create React app structure
    - Set up routing with React Router
    - Create authentication context
    - Create API client service
    - Set up Chart.js for visualizations
    - _Requirements: 10.1_
  
  - [ ] 17.2 Implement authentication UI
    - Create login page
    - Create protected route component
    - Implement token storage and management
    - _Requirements: 1.1, 1.2_
  
  - [ ] 17.3 Create beneficiary management UI
    - Create beneficiary list page with table
    - Create beneficiary detail page
    - Create beneficiary form for create/edit
    - Create CSV upload page
    - Add filtering and sorting
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 3.1_

- [ ] 18. Dashboard and analytics UI
  - [ ] 18.1 Create dashboard page
    - Implement statistics cards (total, fraud count, leakage %)
    - Create scheme-wise bar chart
    - Create district-wise chart
    - Create fraud trend line chart
    - Add real-time data refresh
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8_
  
  - [ ] 18.2 Create reports page
    - Implement filter panel
    - Add CSV export button
    - Add PDF export button
    - Show export progress
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 19. End-to-end integration and testing
  - [ ] 19.1 Wire all components together
    - Connect frontend to backend API
    - Connect backend to ML service
    - Verify all data flows work correctly
    - Test complete user workflows
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 19.2 Write end-to-end integration tests
    - Test complete CSV upload flow
    - Test fraud detection pipeline
    - Test report generation flow
    - _Requirements: 3.1, 6.1, 8.1_

- [ ] 20. Deployment configuration
  - [ ] 20.1 Configure deployment settings
    - Set up Vercel configuration for frontend
    - Set up Render configuration for backend
    - Configure MongoDB Atlas connection
    - Set up environment variables for production
    - Configure CORS and security headers
    - _Requirements: 9.3, 10.5, 10.6, 10.7_
  
  - [ ] 20.2 Create deployment documentation
    - Document environment variables
    - Document deployment steps
    - Create troubleshooting guide

- [ ] 21. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: services → API → frontend
- All sensitive data (Aadhaar, bank accounts, passwords) must be encrypted/hashed
- ML service runs independently and is called via HTTP from the backend
- Frontend communicates only with the Node.js backend, never directly with ML service or database
