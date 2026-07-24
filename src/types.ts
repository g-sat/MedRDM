/**
 * OrphanDx - Clinical Diagnostic & Rare Disease Referral Analyzer
 * Type Definitions
 */

export type DiseaseClassification =
  | 'RARE_DISEASE_PROBABLE'
  | 'RARE_DISEASE_POSSIBLE'
  | 'COMMON_CONDITION_PROBABLE';

export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'ROUTINE';

export interface SymptomItem {
  id: string;
  name: string;
  system: 'Neurological' | 'Cardiovascular' | 'Dermatological' | 'Musculoskeletal' | 'Metabolic/Endocrine' | 'Gastrointestinal' | 'Renal/Genitourinary' | 'Immunological/Hematological' | 'Ophthalmological' | 'Systemic/General';
  onsetTimeline?: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Debilitating';
  isRedFlag: boolean;
  notes?: string;
}

export interface RareDiseaseCandidate {
  id: string;
  diseaseName: string;
  orphaCode?: string;
  icd10Code?: string;
  estimatedPrevalence?: string;
  matchingSymptoms: string[];
  discriminatoryFeatures: string[];
  suggestedDiagnosticTests: string[];
  specialistReferralNeeded: string[];
  clinicalRationale: string;
}

export interface CommonDifferential {
  id: string;
  diseaseName: string;
  icd10Code?: string;
  matchingSymptoms: string[];
  whyNotRare: string;
  baselineWorkupNeeded: string[];
  clinicalPlan: string;
}

export interface ActionPlanItem {
  stepNumber: number;
  category: 'Specialist Referral' | 'Diagnostic Testing' | 'Immediate Triage' | 'Patient Counseling' | 'Medication/Intervention';
  description: string;
  timeframe: string;
  priority: UrgencyLevel;
  rationale: string;
}

export interface DiagnosticReport {
  id: string;
  createdAt: string;
  referralTitle: string;
  patientAgeSex?: string;
  referringDoctor?: string;
  modelUsed: string;
  rawEmailLength: number;
  isDeIdentified: boolean;
  
  // High level classification
  classification: DiseaseClassification;
  confidenceScore: number; // 0 to 100
  executiveSummary: string;

  // Skimmed symptoms list & timeline
  symptomsList: SymptomItem[];
  symptomTimelineSummary: string;
  objectiveFindingsMentioned: string[]; // Labs, vitals, imaging mentioned
  
  // Diagnostic evaluation details
  isRareDisease: boolean;
  rareDiseaseJustification: string;
  
  // If rare disease
  rareCandidates?: RareDiseaseCandidate[];
  
  // If not rare disease
  nonRareReasoning?: string;
  commonDifferentials?: CommonDifferential[];
  
  // Action plan for both cases
  prioritizedActionPlan: ActionPlanItem[];
  
  // HIPAA & Clinical disclaimers
  redFlagsAlerts: string[];
  disclaimer: string;
}

export interface SampleCase {
  id: string;
  title: string;
  category: 'Rare Disease' | 'Common Condition' | 'Complex Differential';
  patientInfo: string;
  sender: string;
  subject: string;
  date: string;
  emailContent: string;
  description: string;
}

export interface PHIRedactionResult {
  scrubbedText: string;
  detectedEntitiesCount: number;
  detectedTypes: {
    names: string[];
    dates: string[];
    contactInfo: string[];
    mrn: string[];
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  phiRedacted: boolean;
  modelUsed?: string;
  ipMasked: string;
}

export interface AppSettings {
  selectedModel: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-3.1-pro-preview' | 'gemini-3.6-flash';
  enableAutoPHIRedaction: boolean;
  enableAESEncryption: boolean;
  showExpoGoMobileView: boolean;
  strictnessMode: 'Standard' | 'High Sensitivity (Include Ultrarare)' | 'Conservative';
  theme: 'dark' | 'light';
}

// Type aliases for UI subcomponents
export type SkimmedSymptom = SymptomItem;
export type RareCandidate = RareDiseaseCandidate;
export type ActionStep = ActionPlanItem;
export type ActiveSubTab = 'intake' | 'summary' | 'symptoms' | 'evaluation' | 'actionplan' | 'export';

