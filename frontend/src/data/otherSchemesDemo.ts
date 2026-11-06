/**
 * Fictitious, deterministic simulated datasets for Cross-Scheme Live Demo:
 * - PM-KISAN (Farmer Direct Benefit Transfers)
 * - PMAY (Housing Subsidies & Geo-tags)
 * - PDS (Public Distribution Foodgrains)
 * - NSP (National Scholarship Portal)
 * 
 * All IDs, accounts, and coordinates are masked and simulated.
 * Clearly watermarked as concept demo data.
 */

export interface SchemeMetadata {
  id: 'MGNREGA' | 'PMKISAN' | 'PMAY' | 'PDS' | 'NSP';
  shortName: string;
  fullName: string;
  badge: string;
  tagline: string;
  auditNorm: string;
  sampleFilename: string;
  expectedColumns: string[];
  keySignals: string[];
}

export const SCHEME_METADATA: Record<string, SchemeMetadata> = {
  MGNREGA: {
    id: 'MGNREGA',
    shortName: 'MGNREGA',
    fullName: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
    badge: 'Real Schema & Synthetic Audit Sets',
    tagline: 'Statutory 60:40 wage-material norm and unit expenditure screening',
    auditNorm: 'Material ratio ≤ 40%, Admin expenditure ≤ 6%, Cost per person-day ≤ ₹450 / ₹500',
    sampleFilename: 'demo_upload_SYNTHETIC_v2.csv',
    expectedColumns: [
      'state_name', 'district_name', 'month', 'Total_Exp', 
      'Material_and_skilled_Wages', 'Total_Adm_Expenditure', 'Wages', 'Persondays_of_Central_Liability_so_far'
    ],
    keySignals: [
      'Statutory 40% material expenditure ceiling breach',
      'Administrative overhead breach (> 14% severe)',
      'Cost per person-day exceeding ₹500 norm'
    ]
  },
  PMKISAN: {
    id: 'PMKISAN',
    shortName: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    badge: 'DBT Fan-In & Bank Account Clustering',
    tagline: 'Direct benefit transfer graph anomaly detection and account deduplication',
    auditNorm: 'Single beneficiary per bank account; Landholding validation; Tax-payer exclusion',
    sampleFilename: 'pmkisan_simulated_audit.csv',
    expectedColumns: [
      'beneficiary_id', 'village_name', 'district_name', 'state_name', 
      'bank_account_no', 'ifsc_code', 'land_holding_ha', 'installment_inr', 'tax_payer_flag'
    ],
    keySignals: [
      'High fan-in: multiple unique beneficiary IDs mapped to a single bank account',
      'Disproportionate institutional land parcel declarations (> 25 ha)',
      'Income-tax payer ineligibility rule violation'
    ]
  },
  PMAY: {
    id: 'PMAY',
    shortName: 'PMAY',
    fullName: 'Pradhan Mantri Awas Yojana (Rural)',
    badge: 'Spatial GPS Drift & Milestone Auditing',
    tagline: 'Housing subsidy milestone tracking and duplicate photo geo-tag verification',
    auditNorm: 'Foundation-to-Plinth GPS drift < 50 meters; Inspection interval ≤ 90 days',
    sampleFilename: 'pmay_simulated_audit.csv',
    expectedColumns: [
      'sanction_id', 'beneficiary_name', 'district_name', 'stage1_lat', 
      'stage1_long', 'stage2_lat', 'stage2_long', 'days_elapsed', 'photo_hash', 'disbursed_lakh'
    ],
    keySignals: [
      'Spatial coordinate drift between stage 1 (foundation) and stage 2 (plinth)',
      'Severe temporal stall: elapsed days between milestones exceeding norm by >300%',
      'Identical roof photo hash reuse across distinct beneficiary IDs'
    ]
  },
  PDS: {
    id: 'PDS',
    shortName: 'PDS',
    fullName: 'Targeted Public Distribution System',
    badge: 'Midnight Offtake & Biometric Bypass Screener',
    tagline: 'Fair Price Shop grain distribution velocity and electronic POS exemption auditing',
    auditNorm: 'Biometric authentication rate ≥ 90%; Distribution velocity evenly spread over month',
    sampleFilename: 'pds_simulated_audit.csv',
    expectedColumns: [
      'fps_id', 'shop_name', 'district_name', 'quota_tonnes', 
      'disbursed_tonnes', 'off_hours_pct', 'manual_bypass_pct', 'depletion_hours'
    ],
    keySignals: [
      'Midnight transaction surge: >80% grain distributed between 1:00 AM and 4:30 AM',
      'High rate of manual exemption authentication bypassing biometric ePOS scans (> 40%)',
      'Complete monthly quota exhaustion in under 36 hours'
    ]
  },
  NSP: {
    id: 'NSP',
    shortName: 'NSP',
    fullName: 'National Scholarship Portal',
    badge: 'Shell Institute & Ghost Student Screener',
    tagline: 'Higher education stipend deduplication and unverified institute cluster detection',
    auditNorm: 'Accredited physical campus; Dispersed contact numbers; Valid student KYC',
    sampleFilename: 'nsp_simulated_audit.csv',
    expectedColumns: [
      'institute_id', 'institute_name', 'district_name', 'student_count', 
      'total_stipend_lakh', 'shared_phone_count', 'campus_accredited', 'avg_claim_inr'
    ],
    keySignals: [
      'Applicant concentration: >80 students registered with identical mobile phone number',
      'Shell institute flag: ₹50+ Lakh claimed from unverified physical address with no faculty',
      'Disproportionate stipend rate vs course norm'
    ]
  }
};

// ======================== PM-KISAN SIMULATED DATA ========================
export interface PMKisanRecord {
  id: string;
  beneficiary_id: string;
  village: string;
  district: string;
  account_no: string;
  ifsc: string;
  land_ha: number;
  installment: number;
  flagged: boolean;
  trigger: string;
  cluster_id?: string;
  cluster_size?: number;
  explanation: string;
}

export const generatePMKisanDemo = () => {
  const records: PMKisanRecord[] = [];
  const villages = ['Village V-17', 'Village V-09', 'Village V-34', 'Village V-52', 'Village V-04', 'Village V-21'];
  const districts = ['DEMO STATE NORTH / Dist 01', 'DEMO STATE EAST / Dist 02', 'DEMO STATE SOUTH / Dist 03'];

  // Planted Fan-In Cluster 1: ACC-XXXX-77 (Village V-17) - 6 landholders
  for (let i = 1; i <= 6; i++) {
    records.push({
      id: `PMK-${1000 + records.length}`,
      beneficiary_id: `B-00${10 + i * 3}`,
      village: 'Village V-17',
      district: 'DEMO STATE NORTH / Dist 01',
      account_no: 'ACC-XXXX-77',
      ifsc: 'SBIN0004128',
      land_ha: 1.4,
      installment: 6000,
      flagged: true,
      trigger: 'DBT Fan-In Cluster (6 landholders / 1 account)',
      cluster_id: 'ACC-XXXX-77',
      cluster_size: 6,
      explanation: '6 distinct landholder IDs routed to identical bank account ACC-XXXX-77. Violates single beneficiary policy.'
    });
  }

  // Planted Fan-In Cluster 2: ACC-XXXX-42 (Village V-09) - 8 landholders
  for (let i = 1; i <= 8; i++) {
    records.push({
      id: `PMK-${1000 + records.length}`,
      beneficiary_id: `B-01${20 + i * 2}`,
      village: 'Village V-09',
      district: 'DEMO STATE EAST / Dist 02',
      account_no: 'ACC-XXXX-42',
      ifsc: 'PUNB0021900',
      land_ha: 1.8,
      installment: 6000,
      flagged: true,
      trigger: 'DBT Fan-In Cluster (8 landholders / 1 account)',
      cluster_id: 'ACC-XXXX-42',
      cluster_size: 8,
      explanation: 'High fan-in syndicate: 8 landholders linked to single bank account in Gramin Bank branch.'
    });
  }

  // Planted Tax Payer Ineligibility Cluster: 5 cases
  for (let i = 1; i <= 5; i++) {
    records.push({
      id: `PMK-${1000 + records.length}`,
      beneficiary_id: `B-03${10 + i}`,
      village: 'Village V-34',
      district: 'DEMO STATE NORTH / Dist 01',
      account_no: `ACC-XXXX-8${i}`,
      ifsc: 'BARB0001099',
      land_ha: 4.5,
      installment: 6000,
      flagged: true,
      trigger: 'Income-Tax Payer Ineligibility',
      explanation: 'ITD database cross-check flagged active income-tax return filing (ineligible under PM-KISAN guidelines).'
    });
  }

  // Planted Excessive Land Declaration: 7 cases
  for (let i = 1; i <= 7; i++) {
    records.push({
      id: `PMK-${1000 + records.length}`,
      beneficiary_id: `B-04${50 + i}`,
      village: 'Village V-52',
      district: 'DEMO STATE SOUTH / Dist 03',
      account_no: `ACC-XXXX-9${i}`,
      ifsc: 'HDFC0000452',
      land_ha: 38.5,
      installment: 6000,
      flagged: true,
      trigger: 'Institutional Land Anomaly (> 25 ha)',
      explanation: 'Declared landholding of 38.5 hectares exceeds small & marginal farmer definition. Likely commercial/institutional parcel.'
    });
  }

  // 374 Clean Beneficiaries
  for (let i = 1; i <= 374; i++) {
    const v = villages[i % villages.length];
    const d = districts[i % districts.length];
    records.push({
      id: `PMK-${1000 + records.length}`,
      beneficiary_id: `B-${2000 + i}`,
      village: v,
      district: d,
      account_no: `ACC-CLEAN-${1000 + i}`,
      ifsc: 'SBIN0001844',
      land_ha: parseFloat((0.8 + (i % 15) * 0.1).toFixed(2)),
      installment: 6000,
      flagged: false,
      trigger: 'Compliant',
      explanation: 'Verified smallholder land parcel and KYC-compliant unique bank account.'
    });
  }

  return {
    records,
    kpis: {
      total_beneficiaries: records.length,
      total_disbursed_lakh: (records.length * 6000) / 100000,
      flagged_records: 26,
      clean_records: records.length - 26,
      flagged_clusters: 4,
      syndicate_accounts: 2
    },
    answer_key: {
      tp: 26,
      fp: 0,
      fn: 6,
      tn: 368,
      precision: 1.0,
      recall: 0.813,
      patterns: {
        fan_in_clustering: { caught: 14, total: 14 },
        tax_payer_ineligible: { caught: 5, total: 5 },
        excessive_land: { caught: 7, total: 7 },
        borderline_smallholder: { caught: 0, total: 6 }
      }
    }
  };
};

// ======================== PMAY SIMULATED DATA ========================
export interface PMAYRecord {
  id: string;
  sanction_id: string;
  beneficiary: string;
  district: string;
  stage1_lat: number;
  stage1_long: number;
  stage2_lat: number;
  stage2_long: number;
  drift_meters: number;
  days_elapsed: number;
  disbursed_lakh: number;
  photo_hash: string;
  flagged: boolean;
  trigger: string;
  explanation: string;
}

export const generatePMAYDemo = () => {
  const records: PMAYRecord[] = [];
  const districts = ['DEMO CENTRAL / Dist 01', 'DEMO WEST / Dist 02', 'DEMO SOUTH / Dist 03'];

  // Planted 8 Geo-drift cases: 8,400 meters drift
  for (let i = 1; i <= 8; i++) {
    records.push({
      id: `PMAY-${100 + records.length}`,
      sanction_id: `SAN-00${40 + i}`,
      beneficiary: `Beneficiary B-00${40 + i}`,
      district: 'DEMO CENTRAL / Dist 01',
      stage1_lat: 12.9124,
      stage1_long: 77.5812,
      stage2_lat: 12.9731,
      stage2_long: 77.6254,
      drift_meters: 8420,
      days_elapsed: 145,
      disbursed_lakh: 1.20,
      photo_hash: `HASH-DRIFT-${i}`,
      flagged: true,
      trigger: 'Spatial Drift (> 8 km vs 50m norm)',
      explanation: 'Plinth stage inspection photo geo-tagged 8.4 km away from sanctioned foundation plot. Spatial collision flag.'
    });
  }

  // Planted 7 Milestone Stall cases: > 340 days elapsed
  for (let i = 1; i <= 7; i++) {
    records.push({
      id: `PMAY-${100 + records.length}`,
      sanction_id: `SAN-01${10 + i}`,
      beneficiary: `Beneficiary B-01${10 + i}`,
      district: 'DEMO WEST / Dist 02',
      stage1_lat: 13.0211,
      stage1_long: 77.4910,
      stage2_lat: 13.0212,
      stage2_long: 77.4912,
      drift_meters: 22,
      days_elapsed: 358,
      disbursed_lakh: 0.60,
      photo_hash: `HASH-STALL-${i}`,
      flagged: true,
      trigger: 'Severe Milestone Stall (358 days vs 90d norm)',
      explanation: '358 days elapsed between foundation disbursement and plinth inspection. High risk of abandoned structure or fund diversion.'
    });
  }

  // Planted 5 Duplicate Photo Hash cases
  for (let i = 1; i <= 5; i++) {
    records.push({
      id: `PMAY-${100 + records.length}`,
      sanction_id: `SAN-02${20 + i}`,
      beneficiary: `Beneficiary B-02${20 + i}`,
      district: 'DEMO SOUTH / Dist 03',
      stage1_lat: 12.8540,
      stage1_long: 77.6710,
      stage2_lat: 12.8541,
      stage2_long: 77.6711,
      drift_meters: 15,
      days_elapsed: 110,
      disbursed_lakh: 1.40,
      photo_hash: 'HASH-REUSE-ROOF-ALPHA',
      flagged: true,
      trigger: 'Duplicate Photo Hash Reuse across Sanctions',
      explanation: 'Identical photo perceptual hash HASH-REUSE-ROOF-ALPHA detected across 5 distinct house sanction IDs.'
    });
  }

  // Planted 4 Rapid Jump cases: completed in 48 hours
  for (let i = 1; i <= 4; i++) {
    records.push({
      id: `PMAY-${100 + records.length}`,
      sanction_id: `SAN-03${30 + i}`,
      beneficiary: `Beneficiary B-03${30 + i}`,
      district: 'DEMO WEST / Dist 02',
      stage1_lat: 13.1102,
      stage1_long: 77.5301,
      stage2_lat: 13.1103,
      stage2_long: 77.5302,
      drift_meters: 12,
      days_elapsed: 2,
      disbursed_lakh: 1.50,
      photo_hash: `HASH-RAPID-${i}`,
      flagged: true,
      trigger: 'Physically Impossible Construction Velocity (48 hours)',
      explanation: 'Disbursement from foundation to completion sanctioned in 48 hours. Impossible physical curing velocity.'
    });
  }

  // 276 Clean Sanctions
  for (let i = 1; i <= 276; i++) {
    const d = districts[i % districts.length];
    const lat = 12.9 + (i % 50) * 0.01;
    const lng = 77.5 + (i % 50) * 0.01;
    const drift = Math.floor(5 + (i % 35));
    const days = Math.floor(65 + (i % 30));

    records.push({
      id: `PMAY-${100 + records.length}`,
      sanction_id: `SAN-${1000 + i}`,
      beneficiary: `Beneficiary B-${1000 + i}`,
      district: d,
      stage1_lat: parseFloat(lat.toFixed(4)),
      stage1_long: parseFloat(lng.toFixed(4)),
      stage2_lat: parseFloat((lat + 0.0001).toFixed(4)),
      stage2_long: parseFloat((lng + 0.0001).toFixed(4)),
      drift_meters: drift,
      days_elapsed: days,
      disbursed_lakh: 1.20,
      photo_hash: `HASH-CLEAN-${1000 + i}`,
      flagged: false,
      trigger: 'Compliant',
      explanation: `GPS drift of ${drift}m is within 50m tolerance; stage progress of ${days} days conforms to construction schedule.`
    });
  }

  return {
    records,
    kpis: {
      total_sanctions: records.length,
      total_disbursed_cr: parseFloat(((records.length * 1.25) / 100).toFixed(2)),
      flagged_records: 24,
      clean_records: records.length - 24,
      geo_drift_flags: 8,
      stalled_flags: 7
    },
    answer_key: {
      tp: 24,
      fp: 0,
      fn: 4,
      tn: 272,
      precision: 1.0,
      recall: 0.857,
      patterns: {
        spatial_drift: { caught: 8, total: 8 },
        milestone_stall: { caught: 7, total: 7 },
        duplicate_photo: { caught: 5, total: 5 },
        rapid_jump: { caught: 4, total: 4 },
        subtle_elevation_drift: { caught: 0, total: 4 }
      }
    }
  };
};

// ======================== PDS SIMULATED DATA ========================
export interface PDSRecord {
  id: string;
  fps_id: string;
  shop_name: string;
  district: string;
  quota_tonnes: number;
  disbursed_tonnes: number;
  off_hours_pct: number;
  manual_bypass_pct: number;
  depletion_hours: number;
  flagged: boolean;
  trigger: string;
  explanation: string;
}

export const generatePDSDemo = () => {
  const records: PDSRecord[] = [];
  const districts = ['DEMO STATE NORTH / Dist 01', 'DEMO STATE EAST / Dist 02', 'DEMO STATE SOUTH / Dist 03'];

  // Planted 3 Midnight Spikes
  records.push({
    id: 'PDS-01',
    fps_id: 'FPS-08',
    shop_name: 'FPS-08 Village North Centre',
    district: 'DEMO STATE NORTH / Dist 01',
    quota_tonnes: 25.0,
    disbursed_tonnes: 24.8,
    off_hours_pct: 82.5,
    manual_bypass_pct: 84.0,
    depletion_hours: 36,
    flagged: true,
    trigger: 'Midnight Distribution Surge + 84% Biometric Bypass',
    explanation: '82.5% of total grain disbursed between 1:00 AM and 4:30 AM with 84% offline manual exemption. High probability of diversion to open market.'
  });

  records.push({
    id: 'PDS-02',
    fps_id: 'FPS-14',
    shop_name: 'FPS-14 East Mandi Station',
    district: 'DEMO STATE EAST / Dist 02',
    quota_tonnes: 30.0,
    disbursed_tonnes: 29.5,
    off_hours_pct: 78.0,
    manual_bypass_pct: 71.0,
    depletion_hours: 42,
    flagged: true,
    trigger: 'Midnight Offload Spike (78% nocturnal transactions)',
    explanation: 'Bulk transactions recorded outside licensed operating hours without biometric verification.'
  });

  records.push({
    id: 'PDS-03',
    fps_id: 'FPS-22',
    shop_name: 'FPS-22 South Junction Depot',
    district: 'DEMO STATE SOUTH / Dist 03',
    quota_tonnes: 20.0,
    disbursed_tonnes: 20.0,
    off_hours_pct: 12.0,
    manual_bypass_pct: 35.0,
    depletion_hours: 18,
    flagged: true,
    trigger: 'Extreme Depletion Velocity (100% quota in 18 hours)',
    explanation: '20 metric tonnes exhausted in 18 hours (normal baseline: 20–25 days). Implies bulk single-party offload.'
  });

  // Planted 4 High Manual Bypass cases
  for (let i = 1; i <= 4; i++) {
    records.push({
      id: `PDS-0${3 + i}`,
      fps_id: `FPS-${30 + i * 4}`,
      shop_name: `FPS-${30 + i * 4} Cooperative Store`,
      district: districts[i % districts.length],
      quota_tonnes: 22.0,
      disbursed_tonnes: 21.6,
      off_hours_pct: 14.5,
      manual_bypass_pct: 68.0 + i * 3,
      depletion_hours: 240,
      flagged: true,
      trigger: `Severe Biometric Bypass (${(68.0 + i * 3).toFixed(1)}% vs 5% state norm)`,
      explanation: 'Excessive reliance on supervisor override key; electronic POS biometric scan bypassed on majority of households.'
    });
  }

  // 43 Clean Fair Price Shops
  for (let i = 1; i <= 43; i++) {
    const d = districts[i % districts.length];
    const offHours = parseFloat((1.5 + (i % 6) * 0.8).toFixed(1));
    const bypass = parseFloat((2.0 + (i % 5) * 0.7).toFixed(1));
    const hours = Math.floor(400 + (i % 80));

    records.push({
      id: `PDS-${10 + i}`,
      fps_id: `FPS-${100 + i}`,
      shop_name: `FPS-${100 + i} Fair Price Outlet`,
      district: d,
      quota_tonnes: 25.0,
      disbursed_tonnes: parseFloat((24.0 + (i % 10) * 0.08).toFixed(1)),
      off_hours_pct: offHours,
      manual_bypass_pct: bypass,
      depletion_hours: hours,
      flagged: false,
      trigger: 'Compliant',
      explanation: `Normal operational velocity; ${bypass}% bypass rate is within standard rural network exemption margin.`
    });
  }

  return {
    records,
    kpis: {
      total_shops: records.length,
      total_grain_tonnes: 1250,
      flagged_records: 7,
      clean_records: records.length - 7,
      midnight_spikes: 3,
      avg_bypass_pct: 11.2
    },
    answer_key: {
      tp: 7,
      fp: 0,
      fn: 2,
      tn: 41,
      precision: 1.0,
      recall: 0.778,
      patterns: {
        midnight_offload: { caught: 3, total: 3 },
        biometric_bypass: { caught: 4, total: 4 },
        subtle_ration_leakage: { caught: 0, total: 2 }
      }
    }
  };
};

// ======================== NSP SIMULATED DATA ========================
export interface NSPRecord {
  id: string;
  institute_id: string;
  institute_name: string;
  district: string;
  student_count: number;
  total_stipend_lakh: number;
  shared_phone_count: number;
  campus_accredited: boolean;
  avg_claim_inr: number;
  flagged: boolean;
  trigger: string;
  explanation: string;
}

export const generateNSPDemo = () => {
  const records: NSPRecord[] = [];
  const districts = ['DEMO STATE NORTH / Dist 01', 'DEMO STATE EAST / Dist 02', 'DEMO STATE SOUTH / Dist 03'];

  // Planted 2 Shell Institutes
  records.push({
    id: 'NSP-01',
    institute_id: 'INST-03',
    institute_name: 'Tech Vocational Institute of Advanced Studies',
    district: 'DEMO STATE NORTH / Dist 01',
    student_count: 82,
    total_stipend_lakh: 65.6,
    shared_phone_count: 82,
    campus_accredited: false,
    avg_claim_inr: 80000,
    flagged: true,
    trigger: 'Shell Institute Flag (82 students / 1 phone / Unaccredited)',
    explanation: 'All 82 applicant profiles share a single mobile number (+91-98765-XXXX1). Physical address maps to vacant residential plot.'
  });

  records.push({
    id: 'NSP-02',
    institute_id: 'INST-11',
    institute_name: 'Universal Rural Skill Development Academy',
    district: 'DEMO STATE EAST / Dist 02',
    student_count: 120,
    total_stipend_lakh: 84.0,
    shared_phone_count: 65,
    campus_accredited: false,
    avg_claim_inr: 70000,
    flagged: true,
    trigger: 'Unverified Campus + Single Phone Concentration',
    explanation: 'No faculty AISHE registration on record; 65 students routed to common intermediary account.'
  });

  // Planted 2 Fee Siphon Clusters
  records.push({
    id: 'NSP-03',
    institute_id: 'INST-19',
    institute_name: 'Apex Polytechnic Institute',
    district: 'DEMO STATE SOUTH / Dist 03',
    student_count: 45,
    total_stipend_lakh: 42.5,
    shared_phone_count: 28,
    campus_accredited: true,
    avg_claim_inr: 94444,
    flagged: true,
    trigger: 'Disproportionate Stipend Rate (> ₹90,000 / student)',
    explanation: 'Claimed tuition rate exceeds statutory state scholarship fee cap by 240%.'
  });

  records.push({
    id: 'NSP-04',
    institute_id: 'INST-28',
    institute_name: 'National Paramedical Foundation',
    district: 'DEMO STATE NORTH / Dist 01',
    student_count: 50,
    total_stipend_lakh: 35.0,
    shared_phone_count: 32,
    campus_accredited: false,
    avg_claim_inr: 70000,
    flagged: true,
    trigger: 'Unaccredited Paramedical Shell Disbursal',
    explanation: 'Lacks state council accreditation; student bank accounts opened in bulk without biometric e-KYC.'
  });

  // 31 Clean Educational Institutions
  for (let i = 1; i <= 31; i++) {
    const d = districts[i % districts.length];
    const students = Math.floor(80 + (i % 60) * 5);
    const avgClaim = Math.floor(25000 + (i % 8) * 2000);
    const totalLakh = parseFloat(((students * avgClaim) / 100000).toFixed(2));
    const phones = Math.floor(1 + (i % 3));

    records.push({
      id: `NSP-${10 + i}`,
      institute_id: `INST-${100 + i}`,
      institute_name: `Government Degree College ${i}`,
      district: d,
      student_count: students,
      total_stipend_lakh: totalLakh,
      shared_phone_count: phones,
      campus_accredited: true,
      avg_claim_inr: avgClaim,
      flagged: false,
      trigger: 'Compliant',
      explanation: 'Accredited institution with verified physical faculty and distinct student bank accounts.'
    });
  }

  return {
    records,
    kpis: {
      total_institutes: records.length,
      total_stipend_cr: 3.85,
      flagged_records: 4,
      clean_records: records.length - 4,
      shell_institutes: 2,
      total_students: records.reduce((acc, r) => acc + r.student_count, 0)
    },
    answer_key: {
      tp: 4,
      fp: 0,
      fn: 1,
      tn: 30,
      precision: 1.0,
      recall: 0.80,
      patterns: {
        shell_institute: { caught: 2, total: 2 },
        phone_concentration: { caught: 1, total: 1 },
        fee_siphon: { caught: 1, total: 1 },
        borderline_vocational: { caught: 0, total: 1 }
      }
    }
  };
};

