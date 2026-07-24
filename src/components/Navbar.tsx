import React from 'react';
import {
  ShieldCheck,
  Activity,
  Smartphone,
  History,
  FileText,
  Lock,
  Cpu,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  activeView: 'analyze' | 'history' | 'expogo';
  setActiveView: (view: 'analyze' | 'history' | 'expogo') => void;
  onOpenAuditLogs: () => void;
  savedCasesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  activeView,
  setActiveView,
  onOpenAuditLogs,
  savedCasesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner: Clinical Compliance & Security Bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-400 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            HIPAA Compliant Workstation
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            <Lock className="w-3 h-3 text-cyan-400" />
            AES-256 Encrypted Session
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
            <Activity className="w-3 h-3 text-teal-400" />
            Zero Data Retention LLM Pipeline
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenAuditLogs}
            className="hover:text-cyan-300 transition-colors flex items-center gap-1 text-slate-300 underline underline-offset-2"
            title="View Compliance Audit Trail"
          >
            Audit Trail
          </button>
          <div className="flex items-center space-x-2 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] font-mono text-slate-300">
              {settings.selectedModel === 'gemini-2.5-pro' || settings.selectedModel === 'gemini-3.1-pro-preview'
                ? 'Gemini 2.5 Pro (Clinical)'
                : 'Gemini 2.5 Flash (Fast)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-teal-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                OrphanDx<span className="text-cyan-400 font-light">Clinical</span>
              </h1>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                Rare Disease Specialist
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Differential Referral Analyzer & Clinical Decision Support
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveView('analyze')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'analyze'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Referral Analyzer</span>
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all relative ${
              activeView === 'history'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Case History</span>
            {savedCasesCount > 0 && (
              <span className="bg-slate-900 text-cyan-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-cyan-700">
                {savedCasesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('expogo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'expogo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-indigo-300" />
            <span>Expo Go Mobile</span>
            <span className="bg-indigo-950 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded border border-indigo-700/60 hidden md:inline">
              Mobile App
            </span>
          </button>
        </nav>

        {/* Model Selector & Quick Controls */}
        <div className="hidden lg:flex items-center space-x-3">
          <label className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Model:</span>
            <select
              value={settings.selectedModel}
              onChange={(e) =>
                onUpdateSettings({
                  selectedModel: e.target.value as any,
                })
              }
              className="bg-slate-900 text-slate-100 text-xs font-medium rounded px-2 py-0.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini-2.5-flash">
                Gemini 2.5 Flash (Fast Analysis)
              </option>
              <option value="gemini-2.5-pro">
                Gemini 2.5 Pro (Deep Clinical Reasoning)
              </option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
};
