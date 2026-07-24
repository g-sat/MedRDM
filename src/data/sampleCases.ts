import { SampleCase } from '../types';

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'case-fabry',
    title: 'Acroparesthesia & Left Ventricular Hypertrophy in Young Adult',
    category: 'Rare Disease',
    patientInfo: '28-year-old male',
    sender: 'Dr. Evelyn Reed, MD (Internal Medicine)',
    subject: 'Urgent Referral - Unexplained Episodic Burning Extremity Pain and Cardiac Hypertrophy',
    date: '2026-07-22',
    description: 'Classic presentation of Fabry Disease (GLA deficiency) with microalbuminuria, angiokeratomas, and hypohidrosis.',
    emailContent: `Dear Referral Coordinator & Diagnostic Specialist,

I am requesting an urgent consultation for my patient, Marcus Vance, a 28-year-old male presenting with a 10-year history of debilitating burning pain in his hands and feet (acroparesthesias) that flares during exercise, fever, and hot weather. 

Primary Symptoms & History:
- Severe burning neuropathic pain in fingers and toes since age 18. Standard nerve conduction studies 2 years ago were unrevealing.
- Marked hypohidrosis (inability to sweat during strenuous activity) causing frequent heat intolerance.
- Dermatological finding: Cluster of non-blanching dark red/purple papules around the navel and groin (suspected angiokeratomas).
- Gastrointestinal: Recurrent postprandial abdominal cramping and episodic diarrhea without clear dietary triggers.
- Recent Cardiac Workup: Transthoracic echocardiogram revealed unexplained mild-to-moderate concentric Left Ventricular Hypertrophy (LVH, wall thickness 14mm) despite no history of systemic hypertension.
- Renal findings: Spot urine protein/creatinine ratio shows persistent microalbuminuria (180 mg/g). eGFR remains 92 mL/min.

Family History:
Maternal uncle died in his late 40s of unexpected kidney failure and stroke. Mother has chronic fatigue and mild proteinuria.

The patient has been empirically prescribed gabapentin without significant pain control. Standard autoimmune panels (ANA, ANCA, ENA) and metabolic screens (HbA1c, thyroid panel, B12) are completely normal.

Could you please review this clinical history and advise on differential diagnosis, specialized genetic/enzymatic testing, and appropriate subspecialty referral channels?

Sincerely,
Dr. Evelyn Reed, MD
Internal Medicine Associates, Metro Health
MRN: #MV-8820491`
  },
  {
    id: 'case-eds',
    title: 'Joint Hypermobility, POTS & Vascular Fragility',
    category: 'Rare Disease',
    patientInfo: '24-year-old female',
    sender: 'Dr. Aris Thorne, MD (Rheumatology)',
    subject: 'Diagnostic Evaluation - Multisystem Hypermobility, Autonomic Dysfunction & Easy Bruising',
    date: '2026-07-20',
    description: 'Suspicion for Ehlers-Danlos Syndrome (EDS) vs Vascular EDS (COL3A1 defect) with severe orthostatic intolerance.',
    emailContent: `Dear Clinical Diagnostic Team,

I am referring Miss Clara Bennett, a 24-year-old female, for evaluation of complex multisystem connective tissue features.

Key Symptoms & Clinical Timeline:
1. Generalized Joint Hypermobility: Beighton score of 8/9. Recurrent dislocations of the left patella and bilateral shoulders with minimal trauma since age 14.
2. Skin Findings: Translucent skin with highly visible subcutaneous veins over chest and limbs. Soft, velvety texture with hyperelastic skin extension >2cm on forearm. Marked easy bruising without clotting factor deficits.
3. Autonomic Dysfunction: Orthostatic vitals show heart rate spike from 72 bpm supine to 138 bpm upon standing, accompanied by presyncope, dizziness, and acrocyanosis (POTS protocol positive).
4. Gastrointestinal: Delayed gastric emptying on scintillation scan, severe chronic constipation, and history of uterine prolapse at age 22.
5. Vascular concerns: Family history is notable for her mother suffering a fatal rupture of the abdominal aorta at age 39.

Current Management & Workup:
Standard autoimmune screening (RF, anti-CCP, ANA, SSA/SSB) negative. Coagulation profile normal (PT/INR, PTT, von Willebrand factor normal). Currently taking fludrocortisone and beta-blockers for postural tachycardia with partial symptom control.

Given her skin translucency and significant vascular family history, I am concerned about Vascular Ehlers-Danlos Syndrome (COL3A1) versus Hypermobile EDS or another rare heritable thoracic aortic disease.

Please provide a structured differential evaluation, prioritized molecular genetic testing panel recommendations, and immediate management precautions.

Best regards,
Dr. Aris Thorne, MD
Department of Rheumatology`
  },
  {
    id: 'case-cushing',
    title: 'Rapid Weight Gain, Purple Striae & Proximal Weakness',
    category: 'Rare Disease',
    patientInfo: '34-year-old female',
    sender: 'Dr. Marcus Vance, MD (Primary Care)',
    subject: 'Consult Request - Progressive Central Obesity, Recalcitrant Hypertension & Hypokalemia',
    date: '2026-07-18',
    description: 'Endogenous Cushing Syndrome / ACTH-secreting pituitary tumor vs adrenal adenoma.',
    emailContent: `Dear Endocrinology & Diagnostic Consult Service,

I am requesting consultation for Mrs. Sarah Jenkins, a 34-year-old female who presents with rapid 35 lb central weight gain over 8 months despite no change in diet or activity level.

Clinical Findings:
- Facial fullness ("moon facies") and supraclavicular fat pad accumulation ("buffalo hump").
- Cutaneous: Broad (>1 cm wide) violaceous striae across lower abdomen, thighs, and axillae. Skin appears thin with frequent ecchymoses.
- Musculoskeletal: Severe proximal muscle weakness; patient is unable to stand up from a low chair without using her arms.
- Cardiovascular: New-onset severe hypertension (168/102 mmHg) requiring three antihypertensive medications.
- Laboratory Data: Unexplained hypokalemia (K+ 3.1 mEq/L), elevated morning fasting blood glucose (142 mg/dL), and leukocyte count of 13.8 k/uL with lymphopenia.
- Menstrual irregularity: Secondary amenorrhea for the past 6 months.

She has no history of corticosteroid or immunosuppressive medication usage.

I suspect Endogenous Hypercortisolism (Cushing Syndrome). Please guide on the step-by-step diagnostic confirmation protocol (late-night salivary cortisol, 24h urinary free cortisol, dexamethasone suppression test) and urgency of pituitary/adrenal imaging.

Thank you,
Dr. Marcus Vance, MD`
  },
  {
    id: 'case-diabetes-common',
    title: 'Polyuria, Polydipsia & Glove-and-Stocking Neuropathy',
    category: 'Common Condition',
    patientInfo: '52-year-old male',
    sender: 'Dr. Helen Zhao, MD (Family Medicine)',
    subject: 'Patient Summary - Chronic Fatigue, Excessive Thirst & Bilateral Foot Numbness',
    date: '2026-07-21',
    description: 'Uncontrolled Type 2 Diabetes Mellitus with Peripheral Diabetic Neuropathy and Metabolic Syndrome.',
    emailContent: `Hello Clinical Team,

Requesting a baseline management review for Mr. Robert Miller, a 52-year-old male with a 6-month history of worsening fatigue, nocturia (waking 4-5 times per night), constant thirst, and blurred vision.

Presenting Complaints:
- Polydipsia (drinking 4+ liters of water daily) and polyuria.
- Bilateral burning sensation and numbness in both feet up to mid-shin in a classic "glove-and-stocking" distribution.
- Weight loss of 12 lbs over 2 months despite increased appetite.
- BMI: 33.4 kg/m². Blood pressure today: 144/90 mmHg.

Lab Results from yesterday:
- Fasting Glucose: 248 mg/dL
- HbA1c: 10.4%
- Lipid Panel: Triglycerides 310 mg/dL, HDL 32 mg/dL, LDL 154 mg/dL
- Urine Dipstick: 3+ Glucose, negative ketones, trace microalbumin.
- Serum Creatinine: 1.0 mg/dL, eGFR >90 mL/min.

No family history of early renal disease or rare neuromuscular genetic disorders. Father had Type 2 Diabetes and coronary artery disease.

I would appreciate a concise review confirming whether this pattern fits standard metabolic syndrome / Type 2 diabetes with distal symmetric polyneuropathy versus any atypical disease, and a structured first-line clinical plan of action.

Regards,
Dr. Helen Zhao, MD`
  },
  {
    id: 'case-postviral-common',
    title: 'Post-Viral Fatigue, Brain Fog & Post-Exertional Malaise',
    category: 'Common Condition',
    patientInfo: '31-year-old female',
    sender: 'Dr. Karen Miller, MD (General Practice)',
    subject: 'Referral Evaluation - Prolonged Fatigue & Cognitive Dysfunction Following Acute Viral Syndrome',
    date: '2026-07-15',
    description: 'Post-Viral Fatigue Syndrome / Long-COVID / ME-CFS following acute infectious mononucleosis.',
    emailContent: `Dear Diagnostics Specialist,

Referring Ms. Hannah Lopez, a 31-year-old school teacher, who has experienced severe non-restorative sleep, cognitive slowing ("brain fog"), and profound post-exertional malaise (PEM) for 5 months following an acute viral illness documented as Epstein-Barr virus (EBV) mononucleosis.

Key Symptoms:
- Post-exertional malaise: Minor physical exertion (e.g. 15-minute walk) triggers severe symptom crashes lasting 48-72 hours with muscle aches and cognitive exhaustion.
- Cognitive: Word-finding difficulty, impaired short-term memory, inability to focus on reading tasks.
- Unrefreshing sleep despite sleeping 9-10 hours per night.
- Orthostatic lightheadedness when standing for long periods in line.

Extensive Diagnostic Workup to Date:
- Complete Blood Count (CBC), Comprehensive Metabolic Panel (CMP), TSH, Free T4: All completely normal.
- Inflammatory markers (ESR 6 mm/hr, CRP 0.8 mg/L): Normal.
- Vitamin D, B12, Iron studies (Ferritin 55 ng/mL): Normal.
- Rheumatoid Factor, ANA, Anti-tTG IgA: Negative.
- Brain MRI without contrast: Unremarkable.

Patient is anxious about whether this represents an underlying neurodegenerative or rare genetic muscular disorder. I would appreciate an expert opinion clarifying why this presentation aligns with Post-Viral Fatigue Syndrome / ME-CFS rather than a rare genetic disease, and providing a realistic pacing & clinical care protocol.

Thank you,
Dr. Karen Miller, MD`
  }
];
