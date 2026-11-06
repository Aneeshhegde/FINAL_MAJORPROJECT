/**
 * Fixed deterministic scenario data for Scheme Concepts demo.
 * Purely simulated data - NOT connected to real government records.
 * Uses masked, fictitious identifiers (e.g. B-0042, ACC-XXXX-77, FPS-08, INST-3).
 */

export interface ConceptScenario {
  id: string;
  scheme: string;
  fullName: string;
  title: string;
  subtitle: string;
  signals: string[];
  captions: { step: number; title: string; text: string }[];
  durationSeconds: number;
}

export const CONCEPT_SCENARIOS: Record<string, ConceptScenario> = {
  pmkisan: {
    id: 'pmkisan',
    scheme: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    title: 'Shared Bank Account & Fan-In Clustering',
    subtitle: 'Direct benefit transfer graph anomaly detection',
    signals: [
      'High fan-in: multiple unique beneficiary IDs mapped to one bank account',
      'Rapid disbursement succession to identical IFSC/Account tuple',
      'Geographic divergence of registered land parcels vs bank branch location'
    ],
    durationSeconds: 16,
    captions: [
      {
        step: 1,
        title: 'Batch Disbursement Ingestion',
        text: 'Direct cash transfer batch initialized for 40 beneficiaries in Village V-17 (simulated).'
      },
      {
        step: 2,
        title: 'Account Node Resolution',
        text: 'Mapping layer resolves beneficiary IDs to destination bank accounts.'
      },
      {
        step: 3,
        title: 'Fan-In Cluster Detected',
        text: 'Account ACC-XXXX-77 aggregates 6 distinct landholder IDs (B-0012, B-0015, B-0018, B-0023, B-0027, B-0034).'
      },
      {
        step: 4,
        title: 'Norm Threshold Breach',
        text: 'Statutory single-beneficiary rule violated: Fan-in degree 6 exceeds policy threshold of 1.'
      },
      {
        step: 5,
        title: 'Screening Result',
        text: 'Flag → Reason: 6 landholders linked to single bank account → Human field verification required.'
      }
    ]
  },

  pmay: {
    id: 'pmay',
    scheme: 'PMAY',
    fullName: 'Pradhan Mantri Awas Yojana (Rural / Urban)',
    title: 'Geo-Tag Coordinate Drift & Milestone Stalls',
    subtitle: 'Housing subsidy spatial verification and stage progress auditing',
    signals: [
      'Spatial coordinate drift between stage 1 (foundation) and stage 2 (plinth)',
      'Severe temporal stall: elapsed days between milestones exceeding norm by >300%',
      'Duplicate geo-coordinate reuse across distinct beneficiary sanctions'
    ],
    durationSeconds: 16,
    captions: [
      {
        step: 1,
        title: 'Sanction & Foundation Stage',
        text: 'Beneficiary B-0042 receives Stage 1 sanction; Foundation geo-tagged at (Lat 12.912, Long 77.581).'
      },
      {
        step: 2,
        title: 'Milestone Inspection Trigger',
        text: 'Stage 2 (Plinth level) claim submitted after 340 days of inactivity (norm: 90 days).'
      },
      {
        step: 3,
        title: 'Geo-Tag Coordinate Drift',
        text: 'New inspection photo geo-tagged at (Lat 12.973, Long 77.625) — 8.4 km away from foundation site.'
      },
      {
        step: 4,
        title: 'Spatial Integrity Flag',
        text: 'Spatial tolerance violated (8,400 m drift vs. 50 m max allowed). Photo timestamp mismatch.'
      },
      {
        step: 5,
        title: 'Screening Result',
        text: 'Flag → Reason: 8.4 km geo-tag drift + 340-day milestone stall → Field engineer inspection required.'
      }
    ]
  },

  pds: {
    id: 'pds',
    scheme: 'PDS',
    fullName: 'Targeted Public Distribution System',
    title: 'Off-take Spikes & ePOS Offline Exemption Bypass',
    subtitle: 'Foodgrain quota distribution and biometric authentication auditing',
    signals: [
      'Sudden off-take velocity: >90% of monthly quota distributed within 36 hours',
      'High rate of manual exemption authentication bypassing biometric ePOS scans',
      'Unusual transaction timestamps clustered in late night / non-operational hours'
    ],
    durationSeconds: 16,
    captions: [
      {
        step: 1,
        title: 'Monthly Quota Allocation',
        text: 'Fair Price Shop FPS-08 receives 25 metric tons monthly grain allocation.'
      },
      {
        step: 2,
        title: 'Normal Distribution Baseline',
        text: 'Standard operational baseline: 15–20 transactions/day evenly distributed with biometric OTP.'
      },
      {
        step: 3,
        title: 'Offtake Velocity Surge',
        text: 'Surge event: 98% of total monthly grain disbursed in a single 36-hour weekend window.'
      },
      {
        step: 4,
        title: 'Authentication Anomaly',
        text: '84% of weekend transactions logged as "Manual Exemption Bypass" with no biometric match.'
      },
      {
        step: 5,
        title: 'Screening Result',
        text: 'Flag → Reason: Quota exhausted in 36h + 84% offline bypass → Flying squad verification required.'
      }
    ]
  },

  nsp: {
    id: 'nsp',
    scheme: 'NSP',
    fullName: 'National Scholarship Portal',
    title: 'Dual Enrollment & Unverified Institute Cluster',
    subtitle: 'Higher education stipend deduplication and entity resolution',
    signals: [
      'Identical biometric hash / photo embedding registered in two separate states/institutes',
      'Institute-level applicant concentration: >90% applicants sharing identical bank branch / IP',
      'Institute lacking recognized accreditation registry entry (ghost institution check)'
    ],
    durationSeconds: 16,
    captions: [
      {
        step: 1,
        title: 'Scholarship Application Batch',
        text: 'Portal receives 50 technical education stipend applications across Institute INST-3 and INST-7.'
      },
      {
        step: 2,
        title: 'Cross-State Entity Resolution',
        text: 'Automated deduplication hashes demographic attributes, bank account, and student ID.'
      },
      {
        step: 3,
        title: 'Dual-Enrollment Detected',
        text: 'Applicant B-0104 claimed full stipend simultaneously at INST-3 (State A) and INST-7 (State B).'
      },
      {
        step: 4,
        title: 'Institutional Verification Failure',
        text: 'Audit shows INST-3 has 92% applicants sharing identical IFSC branch code and no faculty roster.'
      },
      {
        step: 5,
        title: 'Screening Result',
        text: 'Flag → Reason: Concurrent multi-college claim + unverified institute → Audit hold applied.'
      }
    ]
  }
};

