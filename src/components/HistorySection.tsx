import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Trash2,
  Dna,
  CheckCircle2,
  Lock,
  ArrowRight,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { DiagnosticReport } from '../types';

interface HistorySectionProps {
  savedReports: DiagnosticReport[];
  onSelectReport: (report: DiagnosticReport) => void;
  onDeleteReport: (id: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  savedReports,
  onSelectReport,
  onDeleteReport,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'RARE' | 'COMMON'>('ALL');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredData = useMemo(() => {
    return savedReports.filter((report) => {
      if (filterType === 'RARE') return report.isRareDisease;
      if (filterType === 'COMMON') return !report.isRareDisease;
      return true;
    });
  }, [savedReports, filterType]);

  const columns = useMemo<ColumnDef<DiagnosticReport>[]>(
    () => [
      {
        accessorKey: 'referralTitle',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Case Dossier & Summary</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const report = row.original;
          return (
            <div className="max-w-md py-1">
              <div className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 mb-0.5">
                {report.referralTitle}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {report.executiveSummary}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'isRareDisease',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Classification</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const isRare = row.original.isRareDisease;
          return (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                isRare
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
              }`}
            >
              {isRare ? (
                <Dna className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              )}
              {isRare ? 'Rare Case' : 'Common Etiology'}
            </span>
          );
        },
      },
      {
        id: 'symptomsCount',
        accessorFn: (row) => row.symptomsList.length,
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Symptoms</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800 whitespace-nowrap">
            {row.original.symptomsList.length} Skimmed
          </span>
        ),
      },
      {
        accessorKey: 'confidenceScore',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Confidence</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {row.original.confidenceScore}%
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Date Saved</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="text-right block">Actions</span>,
        cell: ({ row }) => {
          const report = row.original;
          return (
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => onSelectReport(report)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] shadow-sm transition-all whitespace-nowrap"
              >
                <span>Open Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteReport(report.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                title="Delete Dossier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [onSelectReport, onDeleteReport]
  );

  const table = useReactTable<DiagnosticReport>({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-colors space-y-4">
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Clinical Case Dossier History
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Local secure storage of analyzed patient referral emails and diagnostic differentials.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search dossiers..."
              className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 w-44 sm:w-52"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterType === 'ALL'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({savedReports.length})
            </button>
            <button
              onClick={() => setFilterType('RARE')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterType === 'RARE'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Rare ({savedReports.filter((r) => r.isRareDisease).length})
            </button>
            <button
              onClick={() => setFilterType('COMMON')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterType === 'COMMON'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Common ({savedReports.filter((r) => !r.isRareDisease).length})
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table View (TanStack)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Case Dossiers View */}
      {table.getRowModel().rows.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 p-8">
          <Lock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No saved case dossiers found</p>
          <p className="text-slate-500 mt-1">
            Run a referral analysis and click &quot;Save Report&quot; to build your local clinical database.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-cyan-500/5 dark:hover:bg-slate-900/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* TanStack Table Pagination */}
          {table.getPageCount() > 1 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-white dark:bg-slate-950">
              <div>
                Page <strong className="text-slate-800 dark:text-slate-200">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                <strong className="text-slate-800 dark:text-slate-200">{table.getPageCount()}</strong> ({table.getFilteredRowModel().rows.length} Total Dossiers)
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {table.getRowModel().rows.map((row) => {
            const report = row.original as DiagnosticReport;
            return (
              <div
                key={report.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 rounded-xl p-4 transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        report.isRareDisease
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      }`}
                    >
                      {report.isRareDisease ? 'Rare Disease Case' : 'Common Etiology'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {report.referralTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                    {report.executiveSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
                    {report.symptomsList.length} Symptoms Skimmed
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDeleteReport(report.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Dossier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectReport(report)}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

