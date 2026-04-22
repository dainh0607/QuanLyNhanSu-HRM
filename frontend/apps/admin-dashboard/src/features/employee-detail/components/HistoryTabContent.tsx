
import React, { useState, useEffect, useCallback } from 'react';
import { historyService } from '../../../services/historyService';
import type { AuditLog, AuditFilters } from '../../../services/historyService';
import { TimelineEntry } from './TimelineEntry';
import HistoryFilters from './HistoryFilters';

interface HistoryTabContentProps {
  employeeId: number;
}

const HistoryTabContent: React.FC<HistoryTabContentProps> = ({ employeeId }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = useCallback(async (filters: AuditFilters) => {
    setIsLoading(true);
    try {
      const data = await historyService.getAuditLogs(employeeId, filters);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  // Debounced effect for filtering
  useEffect(() => {
    const filters: AuditFilters = {
      search: search.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };

    const handler = setTimeout(() => {
      loadLogs(filters);
    }, 500); // 500ms debounce per AC 2.3

    return () => clearTimeout(handler);
  }, [search, startDate, endDate, loadLogs]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await historyService.exportAuditLogs(employeeId, {
        search: search.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Filters Section */}
      <HistoryFilters 
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Timeline List */}
      <div className="relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[32px] border border-dashed border-slate-200">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 mb-4"></div>
            <p className="text-slate-400 font-bold">Đang tải lịch sử thao tác...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="px-4">
            {logs.map((log, index) => (
              <TimelineEntry 
                key={log.id} 
                log={log} 
                isLast={index === logs.length - 1} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-300 text-[32px]">history</span>
            </div>
            <p className="text-slate-400 font-bold">Không tìm thấy lịch sử thao tác nào khớp với điều kiện lọc</p>
            <button 
              onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
              className="mt-4 text-emerald-600 font-black text-xs uppercase tracking-widest hover:text-emerald-700"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTabContent;
