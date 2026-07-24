import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Trash2,
  ArrowUpDown,
  Search,
  CheckCircle2,
  Cpu
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
import { getAuditLogs, logAuditActivity } from '../utils/security';
import { AuditLogEntry } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);

  useEffect(() => {
    if (isOpen) {
      setLogs(getAuditLogs());
    }
  }, [isOpen]);

  const handleClear = () => {
    localStorage.removeItem('orphandx_audit_trail_v1');
    setLogs([]);
    logAuditActivity('Audit Log Cleared', 'Physician cleared compliance audit history.', true);
    setLogs(getAuditLogs());
  };

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: 'action',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Action Event</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-cyan-700 dark:text-cyan-300 text-xs whitespace-nowrap">
            {row.original.action}
          </span>
        ),
      },
      {
        accessorKey: 'details',
        header: 'Details & Event Scope',
        cell: ({ row }) => (
          <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-snug block max-w-sm">
            {row.original.details}
          </span>
        ),
      },
      {
        accessorKey: 'phiRedacted',
        header: 'PHI Protection',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap border ${
              row.original.phiRedacted
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {row.original.phiRedacted ? 'PHI Scrubbed' : 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'modelUsed',
        header: 'Engine',
        cell: ({ row }) => (
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            {row.original.modelUsed || 'Local System'}
          </span>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            <span>Timestamp</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
            {new Date(row.original.timestamp).toLocaleString()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: logs,
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
        pageSize: 6,
      },
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Compliance & Security Audit Ledger
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  Local Compliance Ledger
                </strong>
                Tracks all clinical referral analysis requests, PHI de-identification events, and model interactions.
              </div>
            </div>

            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search audit trail..."
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              No audit entries recorded yet.
            </p>
          ) : (
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

              {/* Pagination */}
              {table.getPageCount() > 1 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-white dark:bg-slate-950">
                  <div>
                    Page <strong className="text-slate-800 dark:text-slate-200">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{table.getPageCount()}</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-[11px]"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-[11px]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Audit Trail</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold transition-all"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

