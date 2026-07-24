import React, { useState } from 'react';
import {
  FileText,
  History,
  Smartphone,
  ShieldCheck,
  Activity,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  PlusCircle,
  FileCheck,
  Layers,
  Dna,
  ListOrdered,
  Download
} from 'lucide-react';
import { AppSettings, ActiveSubTab } from '../types';

interface SidebarProps {
  activeView: 'analyze' | 'history' | 'expogo';
  setActiveView: (view: 'analyze' | 'history' | 'expogo') => void;
  activeSubTab: ActiveSubTab;
  setActiveSubTab: (subTab: ActiveSubTab) => void;
  savedCasesCount: number;
  onOpenAuditLogs: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.StateAction<boolean>>;
  hasActiveReport: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  activeSubTab,
  setActiveSubTab,
  savedCasesCount,
  onOpenAuditLogs,
  settings,
  onUpdateSettings,
  isCollapsed,
  setIsCollapsed,
  hasActiveReport,
}) => {
  const [isReferralMenuOpen, setIsReferralMenuOpen] = useState<boolean>(true);
  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    onUpdateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const handleMainReferralClick = () => {
    setActiveView('analyze');
    setIsReferralMenuOpen(!isReferralMenuOpen);
  };

  const handleSelectSubTab = (subTab: ActiveSubTab) => {
    setActiveView('analyze');
    setActiveSubTab(subTab);
  };

  return (
    <aside
      className={`h-screen max-h-screen sticky top-0 overflow-hidden transition-all duration-300 z-30 shrink-0 border-r flex flex-col justify-between ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      } ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div>
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/20 border border-blue-400/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-base font-bold tracking-tight font-sans flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  OrphanDx <span className="text-blue-600 dark:text-blue-400 font-normal text-xs">Workstation</span>
                </h1>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Differential Clinical Analyzer</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/20 border border-blue-400/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg transition-colors hidden md:block ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} ${isCollapsed ? 'sr-only' : ''}`}>
            Clinical Menu
          </div>

          {/* Main Referral Item with Dropdown */}
          <div className="space-y-1">
            <button
              onClick={handleMainReferralClick}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'analyze'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Referral Intake & Analysis</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  {hasActiveReport && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Report Ready" />
                  )}
                  {isReferralMenuOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 opacity-80" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  )}
                </div>
              )}
            </button>

            {/* Sub Menu Dropdown Items */}
            {!isCollapsed && isReferralMenuOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-blue-500/30 dark:border-blue-500/20 ml-3.5 transition-all">
                <button
                  onClick={() => handleSelectSubTab('intake')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === 'analyze' && activeSubTab === 'intake'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">New Referral Intake</span>
                </button>

                <button
                  onClick={() => handleSelectSubTab('summary')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === 'analyze' && activeSubTab === 'summary'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Executive Summary</span>
                  </div>
                  {!hasActiveReport && (
                    <span className="text-[9px] text-slate-400 font-mono">Empty</span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectSubTab('symptoms')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === 'analyze' && activeSubTab === 'symptoms'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="truncate">Skimmed Symptoms</span>
                  </div>
                  {!hasActiveReport && (
                    <span className="text-[9px] text-slate-400 font-mono">Empty</span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectSubTab('evaluation')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === 'analyze' && activeSubTab === 'evaluation'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Dna className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">Rare Disease Evaluation</span>
                  </div>
                  {!hasActiveReport && (
                    <span className="text-[9px] text-slate-400 font-mono">Empty</span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectSubTab('actionplan')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === 'analyze' && activeSubTab === 'actionplan'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Action Protocol</span>
                  </div>
                  {!hasActiveReport && (
                    <span className="text-[9px] text-slate-400 font-mono">Empty</span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectSubTab('export')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeView === 'analyze' && activeSubTab === 'export'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Download className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Export Diagnostic PDF</span>
                  </div>
                  {!hasActiveReport && (
                    <span className="text-[9px] text-slate-400 font-mono">Empty</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveView('history')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Saved Case Dossiers</span>}
            </div>
            {!isCollapsed && savedCasesCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-slate-950 text-blue-300 border-blue-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {savedCasesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('expogo')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'expogo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Smartphone className={`w-4 h-4 shrink-0 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Mobile App Companion</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  Expo
                </span>
              </div>
            )}
          </button>

          <div className={`px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'} ${isCollapsed ? 'sr-only' : ''}`}>
            System & Logs
          </div>

          <button
            onClick={onOpenAuditLogs}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            {!isCollapsed && <span>Audit Trail Logs</span>}
          </button>
        </nav>
      </div>

      {/* Footer Controls & Theme Switcher */}
      {!isCollapsed ? (
        <div className={`p-4 border-t space-y-3 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
          {/* Theme Toggle Button */}
          <div>
            <label className={`text-[11px] font-medium flex items-center gap-1.5 mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isDark ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>Interface Theme:</span>
            </label>
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className="flex items-center gap-2">
                {isDark ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
              <span className="text-[10px] text-blue-500 font-bold">Switch</span>
            </button>
          </div>

          <div>
            <label className={`text-[11px] font-medium flex items-center gap-1.5 mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Analysis Mode:</span>
            </label>
            <select
              value={settings.strictnessMode}
              onChange={(e) => onUpdateSettings({ strictnessMode: e.target.value as any })}
              className={`w-full text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none focus:border-blue-500 ${
                isDark
                  ? 'bg-slate-950 text-slate-200 border-slate-800'
                  : 'bg-white text-slate-800 border-slate-200'
              }`}
            >
              <option value="Standard">Standard Sensitivity</option>
              <option value="High Sensitivity (Include Ultrarare)">High Sensitivity (Rare Screening)</option>
              <option value="Conservative">Conservative (High Specificity)</option>
            </select>
          </div>

          <div className={`text-[10px] text-center pt-1 border-t ${isDark ? 'text-slate-500 border-slate-800/80' : 'text-slate-400 border-slate-200'}`}>
            Local Workstation Session
          </div>
        </div>
      ) : (
        <div className={`p-2 border-t text-center space-y-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={`Switch to ${isDark ? 'Light Mode' : 'Dark Mode'}`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
          <button
            onClick={onOpenAuditLogs}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Audit Trail Logs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      )}
    </aside>
  );
};

