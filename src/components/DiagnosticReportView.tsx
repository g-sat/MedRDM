import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Copy,
  Printer,
  BookmarkPlus,
  Stethoscope,
  Activity,
  Layers,
  Dna,
  FileSpreadsheet,
  FileCheck,
  ListOrdered,
  FileText,
  PlusCircle,
  ArrowUpDown,
  Table as TableIcon
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { DiagnosticReport, SkimmedSymptom, ActionStep, RareCandidate, CommonDifferential } from '../types';
import { exportReportToPDF } from '../utils/pdfExport';

// --- Subcomponent: Symptoms TanStack Table ---
const SymptomsTanStackTable: React.FC<{ symptoms: SkimmedSymptom[] }> = ({ symptoms }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<SkimmedSymptom>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Symptom / Finding</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const sym = row.original;
          return (
            <div className="flex items-center gap-2">
              {sym.isRedFlag && (
                <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  RED FLAG
                </span>
              )}
              <span className="font-bold text-slate-900 dark:text-white text-xs">{sym.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'system',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Body System</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-blue-700 dark:text-blue-300 font-medium text-xs whitespace-nowrap">
            {row.original.system}
          </span>
        ),
      },
      {
        accessorKey: 'onsetTimeline',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Onset / Timeline</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
            {row.original.onsetTimeline || 'Chronic'}
          </span>
        ),
      },
      {
        accessorKey: 'severity',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Severity</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const sev = row.original.severity;
          const isHigh = sev === 'Debilitating' || sev === 'Severe';
          const isMod = sev === 'Moderate';
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                isHigh
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : isMod
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {sev}
            </span>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: 'Clinical Context & Mention Notes',
        cell: ({ row }) => (
          <span className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed block max-w-sm">
            {row.original.notes || '-'}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable<SkimmedSymptom>({
    data: symptoms,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
      <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
        <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={
                row.original.isRedFlag
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-950/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Subcomponent: Action Plan TanStack Table ---
const ActionPlanTanStackTable: React.FC<{ actions: ActionStep[] }> = ({ actions }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<ActionStep>[]>(
    () => [
      {
        accessorKey: 'stepNumber',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Step</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
            {row.original.stepNumber}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Priority</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const p = row.original.priority;
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
                p === 'CRITICAL'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : p === 'URGENT'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {p}
            </span>
          );
        },
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Category</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-slate-800 whitespace-nowrap">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Recommended Clinical Action & Rationale',
        cell: ({ row }) => (
          <div className="py-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{row.original.description}</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{row.original.rationale}</p>
          </div>
        ),
      },
      {
        accessorKey: 'timeframe',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Timeframe</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {row.original.timeframe}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable<ActionStep>({
    data: actions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
      <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
        <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Subcomponent: Rare Disease Candidates TanStack Table ---
const RareCandidatesTanStackTable: React.FC<{ candidates: RareCandidate[] }> = ({ candidates }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<RareCandidate>[]>(
    () => [
      {
        id: 'rank',
        header: 'Rank',
        cell: ({ row }) => (
          <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/80 border border-purple-300 dark:border-purple-600 text-purple-900 dark:text-purple-200 font-bold text-xs flex items-center justify-center">
            #{row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: 'diseaseName',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <span>Disease Candidate</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{cand.diseaseName}</h4>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono mt-0.5">
                {cand.orphaCode && <span className="text-blue-600 dark:text-blue-400">ORPHA: {cand.orphaCode}</span>}
                {cand.icd10Code && <span className="text-indigo-600 dark:text-indigo-300">ICD-10: {cand.icd10Code}</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'clinicalRationale',
        header: 'Clinical Rationale & Matching Findings',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div className="space-y-1.5 max-w-md py-1">
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{cand.clinicalRationale}</p>
              <div className="flex flex-wrap gap-1">
                {cand.matchingSymptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800/80 px-1.5 py-0.2 rounded text-[10px]"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: 'workup',
        header: 'Diagnostic Tests & Specialists',
        cell: ({ row }) => {
          const cand = row.original;
          return (
            <div className="space-y-1.5 py-1">
              <div>
                <strong className="text-[10px] text-amber-700 dark:text-amber-300 block mb-0.5">Tests:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 text-[10px]">
                  {cand.suggestedDiagnosticTests.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {cand.specialistReferralNeeded.map((spec, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800 px-1.5 py-0.2 rounded text-[10px] font-bold"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable<RareCandidate>({
    data: candidates,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-purple-200 dark:border-purple-900/50 overflow-x-auto shadow-sm">
      <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
        <thead className="bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 uppercase tracking-wider font-semibold border-b border-purple-200 dark:border-purple-900/50 text-[11px]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-purple-100 dark:divide-slate-800/80">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-purple-50/50 dark:hover:bg-slate-900/50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


interface DiagnosticReportViewProps {
  report: DiagnosticReport;
  onSaveReport: (report: DiagnosticReport) => void;
  isSaved: boolean;
  activeTab?: 'summary' | 'symptoms' | 'evaluation' | 'actionplan' | 'export';
  onSelectTab?: (tab: 'summary' | 'symptoms' | 'evaluation' | 'actionplan' | 'export') => void;
  onNewIntake?: () => void;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({
  report,
  onSaveReport,
  isSaved,
  activeTab: controlledActiveTab,
  onSelectTab,
  onNewIntake,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'summary' | 'symptoms' | 'evaluation' | 'actionplan' | 'export'>('summary');

  const activeTab = controlledActiveTab || internalActiveTab;

  const handleTabChange = (tab: 'summary' | 'symptoms' | 'evaluation' | 'actionplan' | 'export') => {
    setInternalActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };
  const [systemFilter, setSystemFilter] = useState<string>('ALL');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const getClassificationBadge = () => {
    switch (report.classification) {
      case 'RARE_DISEASE_PROBABLE':
        return {
          bg: 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200',
          badgeText: 'RARE / ORPHAN DISEASE HIGHLY PROBABLE',
          icon: <Dna className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0" />,
          accentBg: 'from-purple-100 dark:from-purple-900/60 to-indigo-100 dark:to-indigo-900/40',
        };
      case 'RARE_DISEASE_POSSIBLE':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200',
          badgeText: 'RARE DISEASE SUSPECTED - SPECIALIST SCREENING ADVISED',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />,
          accentBg: 'from-amber-100 dark:from-amber-900/60 to-purple-100 dark:to-purple-900/40',
        };
      case 'COMMON_CONDITION_PROBABLE':
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-950/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200',
          badgeText: 'COMMON ETIOLOGY PROBABLE - RARE ETIOLOGY UNLIKELY',
          icon: <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />,
          accentBg: 'from-slate-100 dark:from-slate-900 to-blue-100 dark:to-blue-950/40',
        };
    }
  };

  const badgeInfo = getClassificationBadge();

  // Filter symptoms by system
  const filteredSymptoms = report.symptomsList.filter((s) => {
    if (systemFilter === 'ALL') return true;
    if (systemFilter === 'RED_FLAGS') return s.isRedFlag;
    return s.system === systemFilter;
  });

  const uniqueSystems = Array.from(new Set(report.symptomsList.map((s) => s.system)));

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportReportToPDF(report);
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = `
# Clinical Diagnostic Referral Report
**Date:** ${new Date(report.createdAt).toLocaleString()}
**Classification:** ${report.classification}
**Patient Context:** ${report.patientAgeSex || 'N/A'}

## Executive Clinical Summary
${report.executiveSummary}

## Diagnostic Evaluation
**Status:** ${report.isRareDisease ? 'Candidate Rare Disease Suspected' : 'Common Condition Etiology'}
${report.rareDiseaseJustification}

${
  report.isRareDisease && report.rareCandidates
    ? `### Candidate Rare Diseases
${report.rareCandidates
  .map(
    (c) => `
#### ${c.diseaseName} (ORPHA: ${c.orphaCode || 'N/A'}, ICD-10: ${c.icd10Code || 'N/A'})
- **Clinical Rationale:** ${c.clinicalRationale}
- **Matching Symptoms:** ${c.matchingSymptoms.join(', ')}
- **Recommended Tests:** ${c.suggestedDiagnosticTests.join(', ')}
- **Specialist Referrals:** ${c.specialistReferralNeeded.join(', ')}
`
  )
  .join('\n')}`
    : `### Common Differential Diagnoses
${report.commonDifferentials
  ?.map(
    (d) => `
#### ${d.diseaseName} (ICD-10: ${d.icd10Code || 'N/A'})
- **Why Common vs Rare:** ${d.whyNotRare}
- **Clinical Plan:** ${d.clinicalPlan}
`
  )
  .join('\n')}`
}

## Prioritized Action Protocol
${report.prioritizedActionPlan
  .map(
    (p) => `${p.stepNumber}. [${p.priority}] ${p.category} (${p.timeframe}): ${p.description} - ${p.rationale}`
  )
  .join('\n')}

---
*${report.disclaimer}*
`;
    navigator.clipboard.writeText(md);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden mt-6 transition-colors">
      {/* Top Classification Banner */}
      <div className={`p-6 border-b bg-gradient-to-r ${badgeInfo.accentBg} ${badgeInfo.bg}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-lg">
              {badgeInfo.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm">
                  {badgeInfo.badgeText}
                </span>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-800 shadow-sm">
                  Confidence Score: {report.confidenceScore}%
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {report.referralTitle}
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-3xl">
                {report.executiveSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNewIntake && (
              <button
                onClick={onNewIntake}
                className="px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
                title="Input another referral email"
              >
                <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>New Referral Intake</span>
              </button>
            )}

            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow transition-all disabled:opacity-50"
              title="Download local PDF document for clinical record"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={() => onSaveReport(report)}
              disabled={isSaved}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                isSaved
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{isSaved ? 'Saved in Dossier' : 'Save Dossier'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-100/80 dark:bg-slate-950 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => handleTabChange('summary')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'summary'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('symptoms')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'symptoms'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Extracted Symptoms ({report.symptomsList.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('evaluation')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'evaluation'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>
              {report.isRareDisease ? 'Rare Candidates' : 'Common Differentials'}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('actionplan')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'actionplan'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Action Protocol ({report.prioritizedActionPlan.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('export')}
            className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export & PDF</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Report ID: <span className="text-slate-800 dark:text-slate-200 font-bold">#{report.id.slice(-8)}</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Rare vs Common Callout Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  <span>Diagnostic Justification</span>
                </h3>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {report.rareDiseaseJustification}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Referral Overview</span>
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
                    <dt className="text-slate-500 dark:text-slate-400">Total Symptoms Extracted:</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{report.symptomsList.length}</dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
                    <dt className="text-slate-500 dark:text-slate-400">Red Flag Symptoms:</dt>
                    <dd className="font-bold text-rose-600 dark:text-rose-400">
                      {report.symptomsList.filter((s) => s.isRedFlag).length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Analysis Date:</dt>
                    <dd className="font-mono text-[10px] text-slate-700 dark:text-slate-300">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Symptom Timeline Summary */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Extracted Symptom Timeline & Progression</span>
              </h3>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {report.symptomTimelineSummary}
              </p>
            </div>

            {/* Objective Findings Mentioned */}
            {report.objectiveFindingsMentioned && report.objectiveFindingsMentioned.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Objective Diagnostic Findings Mentioned</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {report.objectiveFindingsMentioned.map((finding, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags & Clinical Alerts */}
            {report.redFlagsAlerts && report.redFlagsAlerts.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Clinical Red Flag Alerts & High-Risk Symptoms</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                  {report.redFlagsAlerts.map((alert, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SKIMMED SYMPTOMS */}
        {activeTab === 'symptoms' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mr-2">Filter Body System:</span>
              <button
                onClick={() => setSystemFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  systemFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                All ({report.symptomsList.length})
              </button>
              <button
                onClick={() => setSystemFilter('RED_FLAGS')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  systemFilter === 'RED_FLAGS'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                Red Flags ({report.symptomsList.filter((s) => s.isRedFlag).length})
              </button>
              {uniqueSystems.map((sys) => (
                <button
                  key={sys}
                  onClick={() => setSystemFilter(sys)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    systemFilter === sys
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900'
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>

            {/* TanStack Table for Symptoms */}
            <SymptomsTanStackTable symptoms={filteredSymptoms} />
          </div>
        )}

        {/* TAB 3: EVALUATION */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {report.isRareDisease ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Dna className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span>Candidate Rare & Orphan Diseases Evaluation</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Differential diagnosis ranked in a TanStack interactive data table.
                    </p>
                  </div>
                </div>

                {report.rareCandidates && report.rareCandidates.length > 0 ? (
                  <RareCandidatesTanStackTable candidates={report.rareCandidates} />
                ) : (
                  <p className="text-xs text-slate-500 italic">No rare candidates listed.</p>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Common Etiology Differential Diagnostic Analysis</span>
                  </h3>
                </div>

                <div className="space-y-4">
                  {report.commonDifferentials?.map((diff, idx) => (
                    <div
                      key={diff.id}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400 font-mono">#{idx + 1}</span>
                          <span>{diff.diseaseName}</span>
                        </h4>
                        {diff.icd10Code && (
                          <span className="text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded text-blue-700 dark:text-blue-300">
                            ICD-10: {diff.icd10Code}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300 mb-2">
                            <strong className="text-slate-900 dark:text-slate-100">Why Common vs Rare:</strong>{' '}
                            {diff.whyNotRare}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                          <strong className="text-blue-700 dark:text-blue-300 block mb-1">
                            Clinical Action & Baseline Workup:
                          </strong>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            {diff.clinicalPlan}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACTION PLAN */}
        {activeTab === 'actionplan' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <ListOrdered className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Prioritized Clinical Plan of Action</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive clinical protocol steps sorted by urgency and priority.
              </p>
            </div>

            <ActionPlanTanStackTable actions={report.prioritizedActionPlan} />
          </div>
        )}

        {/* TAB 5: EXPORT & EHR NOTE */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <span>Export Diagnostic Report</span>
              </h3>
              <p className="text-xs text-slate-400">
                Download a secure local PDF for clinical records, copy formatted Markdown, or print directly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPDF ? 'Generating Local PDF...' : 'Download Clinical PDF File'}</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedText ? 'Copied Markdown!' : 'Copy Formatted Markdown Note'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>

            {/* Medical Disclaimer Notice */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">
                  Clinical Decision Support Disclaimer:
                </strong>
                {report.disclaimer ||
                  'This diagnostic analysis report is generated strictly as a clinical decision support tool for licensed physicians. All diagnostic conclusions, lab orders, and specialist referrals must be verified by attending clinical medical specialists.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
