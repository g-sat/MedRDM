import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { EmailInputSection } from './components/EmailInputSection';
import { DiagnosticReportView } from './components/DiagnosticReportView';
import { HistorySection } from './components/HistorySection';
import { ExpoGoPreviewModal } from './components/ExpoGoPreviewModal';
import { AuditLogModal } from './components/AuditLogModal';
import { AppSettings, DiagnosticReport, ActiveSubTab } from './types';
import { encryptDataAES, decryptDataAES, logAuditActivity } from './utils/security';
import { ShieldCheck, Sliders, Menu, FileText, PlusCircle } from 'lucide-react';

const SAVED_REPORTS_STORAGE_KEY = 'orphandx_encrypted_dossiers_v1';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>({
    selectedModel: 'gemini-2.5-flash',
    enableAutoPHIRedaction: true,
    enableAESEncryption: true,
    showExpoGoMobileView: false,
    strictnessMode: 'Standard',
  });

  const [activeView, setActiveView] = useState<'analyze' | 'history' | 'expogo'>('analyze');
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('intake');
  const [currentReport, setCurrentReport] = useState<DiagnosticReport | null>(null);
  const [savedReports, setSavedReports] = useState<DiagnosticReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Load saved encrypted reports on mount
  useEffect(() => {
    async function loadSaved() {
      try {
        const encrypted = localStorage.getItem(SAVED_REPORTS_STORAGE_KEY);
        if (encrypted) {
          const decryptedJson = await decryptDataAES(encrypted);
          const parsed = JSON.parse(decryptedJson);
          if (Array.isArray(parsed)) {
            setSavedReports(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load encrypted case dossiers', err);
      }
    }
    loadSaved();
  }, []);

  // Save encrypted reports to localStorage
  const saveReportsToStorage = async (reports: DiagnosticReport[]) => {
    try {
      const json = JSON.stringify(reports);
      const encrypted = await encryptDataAES(json);
      localStorage.setItem(SAVED_REPORTS_STORAGE_KEY, encrypted);
    } catch (e) {
      console.error('Failed to encrypt and store dossiers', e);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleRunAnalysis = async (
    emailText: string,
    patientAgeSex: string,
    deIdentifyFirst: boolean
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    logAuditActivity(
      'Analysis Initiated',
      `Referral email submitted for analysis. Length: ${emailText.length} chars.`,
      deIdentifyFirst,
      settings.selectedModel
    );

    try {
      const response = await fetch('/api/analyze-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailText,
          patientAgeSex,
          modelPreference: settings.selectedModel,
          strictnessMode: settings.strictnessMode,
          deIdentifyFirst,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.details
          ? `${errData.error || 'Server Error'}: ${errData.details}`
          : errData.error || `Server returned HTTP ${response.status}`;
        throw new Error(msg);
      }

      const reportData: DiagnosticReport = await response.json();
      setCurrentReport(reportData);
      setActiveView('analyze');
      setActiveSubTab('summary');

      logAuditActivity(
        'Analysis Completed',
        `Report generated: ${reportData.classification}. Model used: ${reportData.modelUsed}.`,
        deIdentifyFirst,
        reportData.modelUsed
      );
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred during analysis.');
      logAuditActivity(
        'Analysis Failed',
        `Error: ${err.message || String(err)}`,
        deIdentifyFirst,
        settings.selectedModel
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReport = async (reportToSave: DiagnosticReport) => {
    if (savedReports.some((r) => r.id === reportToSave.id)) return;
    const updated = [reportToSave, ...savedReports];
    setSavedReports(updated);
    await saveReportsToStorage(updated);
    logAuditActivity('Dossier Saved', `Report #${reportToSave.id} saved to encrypted local history.`, true);
  };

  const handleDeleteReport = async (id: string) => {
    const updated = savedReports.filter((r) => r.id !== id);
    setSavedReports(updated);
    await saveReportsToStorage(updated);
    logAuditActivity('Dossier Deleted', `Report #${id} deleted from local history.`, true);
  };

  const handleSelectReport = (report: DiagnosticReport) => {
    setCurrentReport(report);
    setActiveView('analyze');
    setActiveSubTab('summary');
  };

  // Sync theme class to document element
  useEffect(() => {
    if (settings.theme === 'dark' || !settings.theme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const isDark = settings.theme === 'dark' || !settings.theme;

  return (
    <div className={`h-screen max-h-screen w-full overflow-hidden font-sans flex flex-col md:flex-row selection:bg-blue-500 selection:text-white transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        savedCasesCount={savedReports.length}
        onOpenAuditLogs={() => setIsAuditLogOpen(true)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        hasActiveReport={!!currentReport}
      />

      {/* Main Workstation View Area */}
      <div className="flex-1 h-screen max-h-screen overflow-y-auto flex flex-col justify-between min-w-0">
        <div className="flex flex-col min-w-0">
          {/* Top Header Bar */}
          <header className={`px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md border-b transition-colors ${
            isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1.5 rounded-lg md:hidden ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold tracking-wide">
                {activeView === 'analyze' && (
                  <>
                    <span>Referral Intake & Diagnostic Workstation</span>
                    {activeSubTab !== 'intake' && currentReport && (
                      <span className="ml-2 text-xs font-normal text-blue-500 dark:text-blue-400">
                        • {currentReport.referralTitle}
                      </span>
                    )}
                  </>
                )}
                {activeView === 'history' && 'Saved Clinical Case Dossiers'}
                {activeView === 'expogo' && 'Mobile Workstation Companion'}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAuditLogOpen(true)}
                className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  isDark
                    ? 'text-slate-300 hover:text-blue-400 bg-slate-950 border-slate-800'
                    : 'text-slate-700 hover:text-blue-600 bg-white border-slate-200 shadow-sm'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Audit Trail</span>
              </button>
            </div>
          </header>

          {/* Content Body */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {activeView === 'analyze' && (
              <>
                {activeSubTab === 'intake' ? (
                  <div className="space-y-4">
                    {currentReport && (
                      <div className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                          <span>
                            Active Diagnostic Report Loaded: <strong className="font-semibold">{currentReport.referralTitle}</strong>
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveSubTab('summary')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow shrink-0"
                        >
                          View Diagnostic Report
                        </button>
                      </div>
                    )}
                    <EmailInputSection
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                      onRunAnalysis={handleRunAnalysis}
                      isAnalyzing={isAnalyzing}
                      analysisError={analysisError}
                    />
                  </div>
                ) : currentReport ? (
                  <DiagnosticReportView
                    report={currentReport}
                    onSaveReport={handleSaveReport}
                    isSaved={savedReports.some((r) => r.id === currentReport.id)}
                    activeTab={activeSubTab === 'intake' ? 'summary' : activeSubTab}
                    onSelectTab={(tab) => setActiveSubTab(tab)}
                    onNewIntake={() => setActiveSubTab('intake')}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      No Diagnostic Report Loaded
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Please submit a referral email or doctor notes in the referral intake workstation to generate a differential diagnostic report.
                    </p>
                    <button
                      onClick={() => setActiveSubTab('intake')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Open Referral Intake Workstation</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {activeView === 'history' && (
              <HistorySection
                savedReports={savedReports}
                onSelectReport={handleSelectReport}
                onDeleteReport={handleDeleteReport}
              />
            )}

            {activeView === 'expogo' && <ExpoGoPreviewModal />}
          </main>
        </div>

        {/* Footer */}
        <footer className={`border-t py-4 px-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto transition-colors ${
          isDark ? 'border-slate-900 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-white text-slate-600'
        }`}>
          <span>
            OrphanDx™ Differential Workstation
          </span>
          <span className={`text-[11px] font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            Local Clinical Record System
          </span>
        </footer>
      </div>

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />
    </div>
  );
}
