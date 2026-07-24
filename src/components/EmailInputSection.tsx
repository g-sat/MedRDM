import React, { useState, useEffect } from 'react';
import {
  Mail,
  Upload,
  FileText,
  Sliders,
  Send,
  Eye,
  EyeOff,
  UserCheck,
  Zap,
  Info,
  Shield
} from 'lucide-react';
import { redactPHI } from '../utils/security';
import { AppSettings, PHIRedactionResult } from '../types';

interface EmailInputSectionProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onRunAnalysis: (
    emailText: string,
    patientAgeSex: string,
    deIdentifyFirst: boolean
  ) => Promise<void>;
  isAnalyzing: boolean;
  analysisError: string | null;
}

export const EmailInputSection: React.FC<EmailInputSectionProps> = ({
  settings,
  onUpdateSettings,
  onRunAnalysis,
  isAnalyzing,
  analysisError,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [emailText, setEmailText] = useState<string>('');
  const [patientAgeSex, setPatientAgeSex] = useState<string>('28-year-old male');
  const [showRedactedPreview, setShowRedactedPreview] = useState<boolean>(true);
  const [redactionResult, setRedactionResult] = useState<PHIRedactionResult | null>(null);

  // Update live PHI preview when email text changes
  useEffect(() => {
    if (emailText) {
      const res = redactPHI(emailText);
      setRedactionResult(res);
    } else {
      setRedactionResult(null);
    }
  }, [emailText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setEmailText(content || '');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim()) return;
    await onRunAnalysis(
      emailText,
      patientAgeSex,
      settings.enableAutoPHIRedaction
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
      {/* Header bar */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Clinical Referral Intake Workstation
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Input referral email or doctor notes, extract symptoms, and execute differential diagnostic screening.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center space-x-1 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/80 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'paste'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Paste Referral Text
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Upload Document
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* File upload view */}
        {activeTab === 'upload' && (
          <div className="mb-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/80 dark:bg-slate-950/40 transition-all">
              <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag and drop clinical referral document (.txt, .eml)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Supported formats: Plain text, standard email files, physician consult exports.
              </p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-2 transition-all shadow">
                <FileText className="w-4 h-4" />
                <span>Browse Local Referral File</span>
                <input
                  type="file"
                  accept=".txt,.eml,.json,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Patient Context & Settings row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Patient Age & Sex Context</span>
            </label>
            <input
              type="text"
              value={patientAgeSex}
              onChange={(e) => setPatientAgeSex(e.target.value)}
              placeholder="e.g. 28-year-old male"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Diagnostic Sensitivity Mode</span>
            </label>
            <select
              value={settings.strictnessMode}
              onChange={(e) =>
                onUpdateSettings({
                  strictnessMode: e.target.value as any,
                })
              }
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="Standard">Standard Sensitivity</option>
              <option value="High Sensitivity (Include Ultrarare)">
                High Sensitivity (Rare Screening)
              </option>
              <option value="Conservative">Conservative (High Specificity)</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="cursor-pointer flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 w-full">
              <input
                type="checkbox"
                checked={settings.enableAutoPHIRedaction}
                onChange={(e) =>
                  onUpdateSettings({
                    enableAutoPHIRedaction: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Patient Privacy Protection
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Automatically scrub names, dates & contact info
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Email Content Input Area */}
        <div className="relative mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Referral Email Content</span>
              {redactionResult && redactionResult.detectedEntitiesCount > 0 && (
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                  <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  {redactionResult.detectedEntitiesCount} Personal Identifier(s) Detected
                </span>
              )}
            </label>

            {settings.enableAutoPHIRedaction && redactionResult && (
              <button
                type="button"
                onClick={() => setShowRedactedPreview(!showRedactedPreview)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                {showRedactedPreview ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>View Raw Text</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Redacted Preview</span>
                  </>
                )}
              </button>
            )}
          </div>

          <textarea
            rows={10}
            value={
              settings.enableAutoPHIRedaction && showRedactedPreview && redactionResult
                ? redactionResult.scrubbedText
                : emailText
            }
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste raw doctor referral email, clinical consult note, or patient history here..."
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono p-4 rounded-xl border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed shadow-inner"
          />
        </div>

        {/* Error message banner */}
        {analysisError && (
          <div className="mb-6 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 p-4 rounded-xl flex items-start gap-3 text-xs">
            <div>
              <p className="font-bold mb-1">Analysis Notice</p>
              <p>{analysisError}</p>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              All diagnostic analyses generate secure, local clinical summaries.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAnalyzing || !emailText.trim()}
            className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-lg transition-all ${
              isAnalyzing || !emailText.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Zap className="w-4 h-4 animate-bounce text-amber-300" />
                <span>Processing Referral & Analyzing Symptoms...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Generate Diagnostic Referral Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
