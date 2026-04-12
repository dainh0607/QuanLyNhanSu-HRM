import { useNavigate } from "react-router-dom";
import ShiftTemplateModal from "../shift-template/ShiftTemplateModal";
import ShiftTemplateDeleteModal from "./components/ShiftTemplateDeleteModal";
import ShiftTemplateFiltersBar from "./components/ShiftTemplateFiltersBar";
import ShiftTemplateListTable from "./components/ShiftTemplateListTable";
import ShiftTemplatePagination from "./components/ShiftTemplatePagination";
import { useShiftTemplateManagement } from "./hooks/useShiftTemplateManagement";

export const ShiftTemplateManagementPage = () => {
  const navigate = useNavigate();
  const {
    searchInput,
    filters,
    items,
    totalCount,
    currentPage,
    pageSize,
    isLoading,
    isExporting,
    isCreateModalOpen,
    isEditModalOpen,
    editingTemplate,
    deletingTemplate,
    isDeleting,
    ToastComponent,
    setSearchInput,
    applySearchNow,
    setTimeFrom,
    setTimeTo,
    setStatus,
    setCurrentPage,
    exportTemplates,
    openCreateModal,
    closeCreateModal,
    handleCreateSuccess,
    openEditModal,
    closeEditModal,
    handleEditSuccess,
    updateTemplate,
    previewTemplate,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useShiftTemplateManagement();

  return (
    <>
      <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc] px-[30px] py-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#134BBA]">
                Chấm công
              </div>
              <h1 className="mt-3 text-[30px] font-bold tracking-tight text-slate-900">
                Danh sách ca
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Xem, tìm kiếm và quản lý tập trung toàn bộ mẫu ca làm việc đang áp dụng trong hệ thống.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/working-day/timekeeping")}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 lg:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại bảng xếp ca
            </button>
          </div>

          <ShiftTemplateFiltersBar
            searchTerm={searchInput}
            timeFrom={filters.timeFrom}
            timeTo={filters.timeTo}
            status={filters.status}
            isExporting={isExporting}
            onSearchTermChange={setSearchInput}
            onApplySearchNow={applySearchNow}
            onTimeFromChange={setTimeFrom}
            onTimeToChange={setTimeTo}
            onStatusChange={setStatus}
            onExport={() => {
              void exportTemplates();
            }}
            onCreate={openCreateModal}
          />

          <ShiftTemplateListTable
            items={items}
            currentPage={currentPage}
            pageSize={pageSize}
            isLoading={isLoading}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />

          <ShiftTemplatePagination
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      <ShiftTemplateModal
        isOpen={isCreateModalOpen}
        mode="create"
        title="Tạo ca làm"
        onClose={closeCreateModal}
        onSuccess={handleCreateSuccess}
      />

      <ShiftTemplateModal
        isOpen={isEditModalOpen}
        mode="edit"
        title="Chỉnh sửa ca"
        submitLabel="Cập nhật"
        initialData={editingTemplate}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
        onUpdate={updateTemplate}
        onPreview={previewTemplate}
      />

      <ShiftTemplateDeleteModal
        isOpen={Boolean(deletingTemplate)}
        template={deletingTemplate}
        isSubmitting={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={() => {
          void confirmDelete();
        }}
      />

      {ToastComponent}
    </>
  );
};

export default ShiftTemplateManagementPage;
