import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { redactPHI } from "./src/utils/security.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI client
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "OrphanDx Clinical Diagnostic Backend",
    timestamp: new Date().toISOString(),
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: PHI Redaction Preview
app.post("/api/redact-phi", (req, res) => {
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

// Endpoint: Analyze Clinical Referral Email
app.post("/api/analyze-referral", async (req, res) => {
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
    } catch (primaryErr: any) {
      console.warn(`Primary model (${primaryModel}) request failed: ${primaryErr?.message}. Falling back to gemini-2.5-flash.`);
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
    }

    if (!responseText) {
      throw new Error("Empty response received from Gemini AI model.");
    }

    let reportData = JSON.parse(responseText);

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
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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

startServer();
