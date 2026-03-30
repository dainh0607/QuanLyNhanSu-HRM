import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { BasicInfoExportColumn } from '../data/basicInfoExportColumns';

interface BasicInfoExportModalProps {
  isOpen: boolean;
  columns: BasicInfoExportColumn[];
  totalEmployees: number;
  isExporting?: boolean;
  onClose: () => void;
  onExport: (selectedColumns: BasicInfoExportColumn[]) => void;
}

const BasicInfoExportModal: React.FC<BasicInfoExportModalProps> = ({
  isOpen,
  columns,
  totalEmployees,
  isExporting = false,
  onClose,
  onExport,
}) => {
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedColumnIds(columns.map((column) => column.id));
    setSearchTerm('');
  }, [isOpen, columns]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExporting, isOpen, onClose]);

  const selectedCount = selectedColumnIds.length;
  const isAllSelected = columns.length > 0 && selectedCount === columns.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < columns.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const selectedColumns = useMemo(
    () => columns.filter((column) => selectedColumnIds.includes(column.id)),
    [columns, selectedColumnIds],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredColumns = useMemo(() => {
    if (!normalizedSearch) return columns;

    return columns.filter((column) => column.label.toLowerCase().includes(normalizedSearch));
  }, [columns, normalizedSearch]);

  const groupedColumns = useMemo(() => {
    return filteredColumns.reduce<Record<string, BasicInfoExportColumn[]>>((groups, column) => {
      if (!groups[column.group]) {
        groups[column.group] = [];
      }

      groups[column.group].push(column);
      return groups;
    }, {});
  }, [filteredColumns]);

  const groupEntries = Object.entries(groupedColumns);

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedColumnIds(checked ? columns.map((column) => column.id) : []);
  };

  const handleToggleGroup = (groupColumns: BasicInfoExportColumn[], checked: boolean) => {
    const groupIds = groupColumns.map((column) => column.id);

    setSelectedColumnIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...groupIds]));
      }

      return prev.filter((id) => !groupIds.includes(id));
    });
  };

  const handleToggleColumn = (columnId: string, checked: boolean) => {
    setSelectedColumnIds((prev) => {
      if (checked) {
        return prev.includes(columnId) ? prev : [...prev, columnId];
      }

      return prev.filter((id) => id !== columnId);
    });
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isExporting) {
      onClose();
    }
  };

  const handleExport = () => {
    if (selectedColumns.length === 0 || isExporting) return;
    onExport(selectedColumns);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto bg-black/40 backdrop-blur-sm px-4 pt-8 pb-6 md:pt-12 md:pb-8"
      onClick={handleBackdropClick}
    >
      <div className="mx-auto w-full max-w-[1040px] rounded-[28px] bg-white shadow-2xl overflow-hidden flex max-h-[calc(100vh-3.5rem)] md:max-h-[calc(100vh-5rem)] flex-col">
        <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Xuất file thông tin cơ bản</h2>
            <p className="mt-1 text-sm text-gray-500">
              Chọn các cột dữ liệu muốn xuất cho {totalEmployees} nhân sự theo bộ lọc hiện tại.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="rounded-3xl border border-[#192841]/10 bg-[linear-gradient(135deg,rgba(25,40,65,0.06),rgba(25,40,65,0.02))] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#192841]">Thiết lập cột xuất</p>
                <p className="mt-1 text-sm text-gray-500">
                  Đã chọn {selectedCount}/{columns.length} cột. Bạn có thể tìm nhanh hoặc chọn theo từng nhóm.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[260px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm cột cần xuất"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-[#192841] focus:ring-4 focus:ring-[#192841]/5"
                  />
                </div>

                <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(event) => handleToggleSelectAll(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#192841] focus:ring-[#192841]"
                  />
                  Chọn tất cả
                </label>

              </div>
            </div>
          </div>

          <div className="pr-1 space-y-4">
            {groupEntries.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                <p className="text-sm font-semibold text-gray-700">Không tìm thấy cột phù hợp</p>
                <p className="mt-1 text-sm text-gray-500">Hãy thử lại với từ khóa khác.</p>
              </div>
            )}

            {groupEntries.map(([groupName, groupColumns]) => {
              const groupSelectedCount = groupColumns.filter((column) =>
                selectedColumnIds.includes(column.id),
              ).length;
              const isGroupSelected =
                groupColumns.length > 0 && groupSelectedCount === groupColumns.length;

              return (
                <section
                  key={groupName}
                  className="rounded-3xl border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{groupName}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Đã chọn {groupSelectedCount}/{groupColumns.length} cột
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleGroup(groupColumns, !isGroupSelected)}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        isGroupSelected
                          ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          : 'bg-[#192841] text-white hover:bg-[#253a5c]'
                      }`}
                    >
                      {isGroupSelected ? 'Bỏ chọn nhóm' : 'Chọn nhóm'}
                    </button>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                    {groupColumns.map((column) => {
                      const checked = selectedColumnIds.includes(column.id);

                      return (
                        <label
                          key={column.id}
                          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all ${
                            checked
                              ? 'border-[#192841]/25 bg-[#192841]/[0.04] shadow-[0_8px_24px_rgba(25,40,65,0.06)]'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => handleToggleColumn(column.id, event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#192841] focus:ring-[#192841]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800">{column.label}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <p className="mr-auto text-sm text-gray-500">
            Các trường chưa có dữ liệu trong hồ sơ hiện tại sẽ được để trống trong file xuất.
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={selectedColumns.length === 0 || isExporting}
            className="px-6 py-2.5 rounded-xl bg-[#192841] text-sm font-bold text-white hover:bg-[#253a5c] transition-all shadow-md shadow-[#192841]/20 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isExporting && (
              <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
            )}
            Xuất CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoExportModal;
