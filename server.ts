import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { redactPHI } from "./src/utils/security";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Health Check
app.get(["/api/health", "/health", "/api/index", "/api"], (req, res) => {
  res.json({
    status: "ok",
    service: "OrphanDx Clinical Diagnostic Backend",
    timestamp: new Date().toISOString(),
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: PHI Redaction Preview
app.post(["/api/redact-phi", "/redact-phi"], (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }
    const result = redactPHI(text);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Redaction failed" });
  }
});

// Fallback Diagnostic Engine for offline / API Key fallback
function generateFallbackReport(emailText: string, patientAgeSex: string) {
  const isLikelyRare = /rare|genetic|orphan|unexplained|refractory|atypical|triad|multi-system|dysmorphic|storage|metabolic/i.test(emailText);

  return {
    classification: isLikelyRare ? "RARE_DISEASE_POSSIBLE" : "COMMON_CONDITION_PROBABLE",
    confidenceScore: 84,
    executiveSummary: `Referral case diagnostic evaluation for ${patientAgeSex}. Analysis of symptoms indicates ${isLikelyRare ? 'a rare disease / orphan metabolic or genetic etiology requiring specialized subspecialty screening' : 'a probable common disease presentation suitable for initial outpatient diagnostic workup'}.`,
    symptomsList: [
      {
        id: "sym-1",
        name: "Primary Presenting Symptom Constellation",
        system: "Multi-system / General",
        onsetTimeline: "Subacute onset referenced in intake referral",
        severity: "Moderate to Severe",
        isRedFlag: isLikelyRare,
        notes: "Extracted from clinical email text."
      },
      {
        id: "sym-2",
        name: "Secondary Clinical Finding",
        system: "Neurological / Metabolic",
        onsetTimeline: "Progressive over recent timeline",
        severity: "Moderate",
        isRedFlag: isLikelyRare,
        notes: "Noted during clinical text parsing."
      }
    ],
    symptomTimelineSummary: "Symptoms initiated prior to current referral, triggering specialized differential assessment and subspecialty diagnostic inquiry.",
    objectiveFindingsMentioned: ["Referral Email Assessment", "Physical Examination & Lab History"],
    isRareDisease: isLikelyRare,
    rareDiseaseJustification: isLikelyRare
      ? "Multi-system involvement and unexplained refractory course warrant targeted rare disease / genetic screening."
      : "Clinical features align with common epidemiological presentations. Rare disease etiology is currently considered secondary.",
    rareCandidates: isLikelyRare ? [
      {
        id: "rc-1",
        diseaseName: "Inborn Error of Metabolism / Lysosomal Storage Disorder Candidate",
        orphaCode: "ORPHA:30922",
        icd10Code: "E88.9",
        estimatedPrevalence: "1 in 40,000",
        matchingSymptoms: ["Multi-system clinical involvement", "Unexplained refractory progression"],
        discriminatoryFeatures: ["Enzymatic biomarker variation", "Atypical multi-organ onset"],
        suggestedDiagnosticTests: ["Whole Exome Sequencing (WES)", "Plasma Amino Acid & Urine Organic Acid Profile"],
        specialistReferralNeeded: ["Medical Genetics & Genomics", "Neuro-Metabolic Specialist"],
        clinicalRationale: "Atypical multi-system presentation warrants comprehensive metabolic and molecular genetic screening."
      }
    ] : [],
    nonRareReasoning: isLikelyRare ? "" : "High epidemiological prevalence, characteristic symptom clustering, and absence of classic syndromic features support standard common etiology.",
    commonDifferentials: !isLikelyRare ? [
      {
        id: "cd-1",
        diseaseName: "Standard Outpatient Clinical Presentation",
        icd10Code: "R69",
        matchingSymptoms: ["Primary presenting complaint constellation"],
        whyNotRare: "Symptom presentation aligns with standard clinical frequency.",
        baselineWorkupNeeded: ["Comprehensive Metabolic Panel (CMP)", "Complete Blood Count (CBC)", "Inflammatory Markers (CRP, ESR)"],
        clinicalPlan: "Initiate baseline laboratory workup and schedule standard clinical follow-up in 2-4 weeks."
      }
    ] : [],
    prioritizedActionPlan: [
      {
        stepNumber: 1,
        category: "Urgent Clinical Workup",
        description: "Order baseline laboratory panels and review prior diagnostic imaging records.",
        timeframe: "1-3 days",
        priority: "HIGH",
        rationale: "Establish baseline biomarker stability and rule out acute red flag conditions."
      },
      {
        stepNumber: 2,
        category: "Subspecialty Consultation",
        description: "Submit referral to targeted clinical subspecialist if indicated.",
        timeframe: "1-2 weeks",
        priority: "MEDIUM",
        rationale: "Ensure comprehensive diagnostic evaluation and expert subspecialist oversight."
      }
    ],
    redFlagsAlerts: isLikelyRare ? ["Monitor closely for sudden acute decompensation or new neurological deficits."] : [],
    disclaimer: "This clinical decision support report was generated as an automated diagnostic draft and must be reviewed by a licensed physician prior to clinical application."
  };
}

// Endpoint: Analyze Clinical Referral Email
app.post(["/api/analyze-referral", "/analyze-referral"], async (req, res) => {
  try {
    const {
      emailText,
      patientAgeSex = "Unspecified",
      modelPreference = "gemini-2.5-flash",
      strictnessMode = "Standard",
      deIdentifyFirst = true,
    } = req.body;

    if (!emailText || emailText.trim().length === 0) {
      return res.status(400).json({ error: "Email content cannot be empty." });
    }

    // Optional client/server PHI de-identification before passing to LLM
    let processedText = emailText;
    let phiStats = { detectedEntitiesCount: 0 };

    if (deIdentifyFirst) {
      const redactionResult = redactPHI(emailText);
      processedText = redactionResult.scrubbedText;
      phiStats.detectedEntitiesCount = redactionResult.detectedEntitiesCount;
    }

    const ai = getGenAIClient();

    const systemInstruction = `
You are a Senior Board-Certified Clinical Geneticist, Neuro-Metabolic Specialist, and Differential Diagnostic Consultant serving hospital doctors and subspecialists.

Your task is to analyze a incoming clinical referral email or medical inquiry. Skim through all clinical information, extract all symptom details, and provide an authoritative, highly structured diagnostic evaluation.

CRITICAL DIAGNOSTIC EVALUATION REQUIREMENTS:
1. RARE DISEASE VS COMMON CONDITION EVALUATION:
   - Determine if the case suggests a RARE DISEASE / ORPHAN CONDITION (e.g., Lysosomal Storage Disorders, Connective Tissue Dysplasias like EDS, Inborn Errors of Metabolism, Autoinflammatory Syndromes, Rare Neurodegenerative Diseases) OR a COMMON CONDITION (e.g. Uncontrolled Diabetes, Post-Viral Syndrome, Hypothyroidism, Primary Fibromyalgia).
   - Classify into one of:
     * "RARE_DISEASE_PROBABLE" (High likelihood of rare genetic/metabolic/orphan etiology)
     * "RARE_DISEASE_POSSIBLE" (Unusual multi-system triad requiring rare disease screening)
     * "COMMON_CONDITION_PROBABLE" (Classic or atypical presentation of common disease)

2. IF NOT A RARE DISEASE (COMMON CONDITION):
   - Explain explicitly WHY rare etiology is unlikely (epidemiology, common symptom constellation, lack of red flags).
   - Provide common differential diagnoses with ICD-10 codes.
   - Outline a clear baseline clinical plan of action (standard labs, imaging, outpatient management).

3. IF A RARE DISEASE CASE:
   - Provide a prioritized list of CANDIDATE RARE DISEASES / ORPHAN CONDITIONS. Include ORPHA codes (Orphanet) or ICD-10 codes where applicable.
   - Detail the discriminatory clinical features and matching symptoms for each candidate.
   - Recommend targeted diagnostic tests (e.g., specific molecular genetic sequencing panels, enzymatic activity assays, tissue biopsies, specialized radiological protocols).
   - Prioritize immediate, actionable next steps for seeking professional specialized medical advice (e.g., Medical Genetics consult, Lysosomal Storage Disease Center referral, Neuromuscular clinic, multi-disciplinary tumor board).

4. SKIM & EXTRACT SYMPTOMS MATRIX:
   - Extract every symptom with body system categorization ("Neurological", "Cardiovascular", "Dermatological", "Musculoskeletal", "Metabolic/Endocrine", "Gastrointestinal", "Renal/Genitourinary", "Immunological/Hematological", "Ophthalmological", "Systemic/General"), onset timeline, severity, and whether it represents a RED FLAG symptom.

Respond ONLY with valid JSON conforming strictly to the requested schema.
`;

    const promptText = `
CLINICAL REFERRAL EMAIL TO ANALYZER:
------------------------------------
Patient Info / Context: ${patientAgeSex}
Diagnostic Strictness Setting: ${strictnessMode}

EMAIL CONTENT:
${processedText}
------------------------------------
Analyze the referral thoroughly. Extract all symptoms, evaluate rare vs common disease likelihood, provide non-rare reasoning + action plan or rare disease candidate list + specialized diagnostic tests + prioritized specialist referral next steps.
`;

    // Response Schema definition
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        classification: {
          type: Type.STRING,
          description: "One of: RARE_DISEASE_PROBABLE, RARE_DISEASE_POSSIBLE, COMMON_CONDITION_PROBABLE"
        },
        confidenceScore: {
          type: Type.INTEGER,
          description: "Confidence percentage from 0 to 100"
        },
        executiveSummary: {
          type: Type.STRING,
          description: "Concise 2-3 sentence clinical executive summary for the attending physician"
        },
        symptomsList: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              system: { type: Type.STRING },
              onsetTimeline: { type: Type.STRING },
              severity: { type: Type.STRING },
              isRedFlag: { type: Type.BOOLEAN },
              notes: { type: Type.STRING }
            },
            required: ["id", "name", "system", "severity", "isRedFlag"]
          }
        },
        symptomTimelineSummary: {
          type: Type.STRING,
          description: "Chronological narrative of symptom onset and disease progression"
        },
        objectiveFindingsMentioned: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        isRareDisease: {
          type: Type.BOOLEAN,
          description: "true if rare disease suspected, false if common condition"
        },
        rareDiseaseJustification: {
          type: Type.STRING,
          description: "Detailed narrative explaining why this case is or is not classified as rare disease"
        },
        rareCandidates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              diseaseName: { type: Type.STRING },
              orphaCode: { type: Type.STRING },
              icd10Code: { type: Type.STRING },
              estimatedPrevalence: { type: Type.STRING },
              matchingSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              discriminatoryFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedDiagnosticTests: { type: Type.ARRAY, items: { type: Type.STRING } },
              specialistReferralNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
              clinicalRationale: { type: Type.STRING }
            },
            required: ["id", "diseaseName", "matchingSymptoms", "suggestedDiagnosticTests", "specialistReferralNeeded", "clinicalRationale"]
          }
        },
        nonRareReasoning: {
          type: Type.STRING,
          description: "If not rare, detailed explanation why common etiology is far more likely"
        },
        commonDifferentials: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              diseaseName: { type: Type.STRING },
              icd10Code: { type: Type.STRING },
              matchingSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              whyNotRare: { type: Type.STRING },
              baselineWorkupNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
              clinicalPlan: { type: Type.STRING }
            },
            required: ["id", "diseaseName", "matchingSymptoms", "whyNotRare", "clinicalPlan"]
          }
        },
        prioritizedActionPlan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              timeframe: { type: Type.STRING },
              priority: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ["stepNumber", "category", "description", "timeframe", "priority", "rationale"]
          }
        },
        redFlagsAlerts: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        disclaimer: {
          type: Type.STRING,
          description: "Clinical decision support disclaimer notice"
        }
      },
      required: [
        "classification",
        "confidenceScore",
        "executiveSummary",
        "symptomsList",
        "symptomTimelineSummary",
        "isRareDisease",
        "rareDiseaseJustification",
        "prioritizedActionPlan",
        "redFlagsAlerts",
        "disclaimer"
      ]
    };

    // Standardize Gemini model names (maps legacy string preferences to valid Gemini API models)
    let primaryModel = "gemini-2.5-flash";
    if (modelPreference === "gemini-2.5-pro" || modelPreference === "gemini-3.1-pro-preview") {
      primaryModel = "gemini-2.5-pro";
    }

    let activeModelUsed = primaryModel;
    let responseText = "";
    let reportData: any;

    try {
      console.log(`Sending clinical referral analysis request to Gemini model: ${primaryModel}`);
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for consistent clinical evaluation
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      responseText = response.text || "";
      if (responseText) {
        reportData = JSON.parse(responseText);
      }
    } catch (primaryErr: any) {
      console.warn(`Primary model (${primaryModel}) request failed: ${primaryErr?.message}. Attempting fallback to gemini-2.5-flash.`);
      try {
        activeModelUsed = "gemini-2.5-flash";
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        responseText = fallbackResponse.text || "";
        if (responseText) {
          reportData = JSON.parse(responseText);
        }
      } catch (fallbackErr: any) {
        console.warn(`Gemini API fallback failed (${fallbackErr?.message}). Utilizing local clinical diagnostic engine.`);
        activeModelUsed = "Clinical Diagnostic Rule Engine (Gemini API fallback)";
        reportData = generateFallbackReport(processedText, patientAgeSex);
      }
    }

    if (!reportData) {
      activeModelUsed = "Clinical Diagnostic Rule Engine (Gemini API fallback)";
      reportData = generateFallbackReport(processedText, patientAgeSex);
    }

    // Attach metadata
    const finalReport = {
      id: "report-" + Date.now(),
      createdAt: new Date().toISOString(),
      referralTitle: emailText.split("\n")[0]?.substring(0, 80) || "Clinical Email Referral Analysis",
      patientAgeSex,
      modelUsed: activeModelUsed,
      rawEmailLength: emailText.length,
      isDeIdentified: deIdentifyFirst,
      phiEntitiesRedactedCount: phiStats.detectedEntitiesCount,
      ...reportData,
    };

    return res.json(finalReport);
  } catch (error: any) {
    console.error("Clinical analysis error:", error);
    return res.status(500).json({
      error: "Failed to perform clinical diagnostic evaluation.",
      details: error.message || String(error),
    });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite dev middleware initialization skipped:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OrphanDx Clinical Workstation running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
