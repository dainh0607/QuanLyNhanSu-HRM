import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useToast } from "../../../../hooks/useToast";
import type { ShiftTemplateSubmitPayload } from "../../shift-template/types";
import { shiftTemplateManagementService } from "../services/shiftTemplateManagementService";
import type {
  ShiftTemplateListFilters,
  ShiftTemplateListItem,
  ShiftTemplateListQuery,
  ShiftTemplateStatusFilter,
} from "../types";

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: ShiftTemplateListFilters = {
  searchTerm: "",
  timeFrom: "",
  timeTo: "",
  status: "active",
  page: 1,
  pageSize: PAGE_SIZE,
};

interface UseShiftTemplateManagementResult {
  searchInput: string;
  filters: ShiftTemplateListFilters;
  items: ShiftTemplateListItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  isExporting: boolean;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isEditLoading: boolean;
  editingTemplate: ShiftTemplateListItem | null;
  deletingTemplate: ShiftTemplateListItem | null;
  isDeleting: boolean;
  ToastComponent: ReactNode;
  setSearchInput: (value: string) => void;
  applySearchNow: () => void;
  setTimeFrom: (value: string) => void;
  setTimeTo: (value: string) => void;
  setStatus: (value: ShiftTemplateStatusFilter) => void;
  setCurrentPage: (page: number) => void;
  reload: () => Promise<void>;
  exportTemplates: () => Promise<void>;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  handleCreateSuccess: () => void;
  openEditModal: (item: ShiftTemplateListItem) => void;
  closeEditModal: () => void;
  handleEditSuccess: () => void;
  updateTemplate: (values: ShiftTemplateSubmitPayload) => Promise<void>;
  previewTemplate: () => void;
  openDeleteModal: (item: ShiftTemplateListItem) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
}

export const useShiftTemplateManagement = (): UseShiftTemplateManagementResult => {
  const { showToast, ToastComponent } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<ShiftTemplateListFilters>(DEFAULT_FILTERS);
  const [items, setItems] = useState<ShiftTemplateListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplateListItem | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ShiftTemplateListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) =>
        current.searchTerm === searchInput.trim()
          ? current
          : { ...current, searchTerm: searchInput.trim(), page: 1 },
      );
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  const query = useMemo<ShiftTemplateListQuery>(
    () => ({
      ...filters,
      searchTerm: filters.searchTerm.trim(),
    }),
    [filters],
  );

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await shiftTemplateManagementService.getShiftTemplates(query, true);
      setItems(response.items);
      setTotalCount(response.totalCount);

      if (response.page !== filters.page) {
        setFilters((current) => ({ ...current, page: response.page }));
      }
    } catch (error) {
      console.error("Failed to load shift template list.", error);
      showToast("Không thể tải danh sách ca làm. Vui lòng thử lại.", "error");
      setItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, query, showToast]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const setTimeFrom = (value: string) => {
    setFilters((current) => ({ ...current, timeFrom: value, page: 1 }));
  };

  const setTimeTo = (value: string) => {
    setFilters((current) => ({ ...current, timeTo: value, page: 1 }));
  };

  const setStatus = (value: ShiftTemplateStatusFilter) => {
    setFilters((current) => ({ ...current, status: value, page: 1 }));
  };

  const setCurrentPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const applySearchNow = () => {
    setFilters((current) => ({ ...current, searchTerm: searchInput.trim(), page: 1 }));
  };

  const exportTemplates = useCallback(async () => {
    if (totalCount === 0) {
      showToast("Hiện chưa có dữ liệu danh sách ca để xuất file.", "info");
      return;
    }

    setIsExporting(true);
    try {
      const result = await shiftTemplateManagementService.exportShiftTemplates(
        {
          ...query,
          page: 1,
          pageSize: Math.max(totalCount, PAGE_SIZE),
        },
        true,
      );
      showToast(`Đã xuất file ${result.recordCount} mẫu ca.`, "success");
    } catch (error) {
      console.error("Failed to export shift templates.", error);
      showToast("Không thể xuất file danh sách ca.", "error");
    } finally {
      setIsExporting(false);
    }
  }, [query, showToast, totalCount]);

  const openEditModal = useCallback(
    (item: ShiftTemplateListItem) => {
      setIsEditLoading(true);

      void shiftTemplateManagementService
        .getShiftTemplateDetail(item.id, true)
        .then((detail) => {
          setEditingTemplate({ ...item, ...detail, id: Number(detail.id ?? item.id), shiftId: item.shiftId });
          setIsEditModalOpen(true);
        })
        .catch((error) => {
          console.error("Failed to load shift template detail.", error);
          showToast("Không thể tải chi tiết ca làm.", "error");
        })
        .finally(() => setIsEditLoading(false));
    },
    [showToast],
  );

  const updateTemplate = useCallback(
    async (values: ShiftTemplateSubmitPayload) => {
      if (!editingTemplate) {
        return;
      }

      await shiftTemplateManagementService.updateShiftTemplate(
        {
          id: editingTemplate.id,
          values,
          existing: editingTemplate,
        },
        true,
      );
    },
    [editingTemplate],
  );

  const confirmDelete = useCallback(async () => {
    if (!deletingTemplate) {
      return;
    }

    setIsDeleting(true);
    try {
      await shiftTemplateManagementService.deleteShiftTemplate(deletingTemplate.id, true);
      setDeletingTemplate(null);
      showToast("Đã xóa ca làm thành công.", "success");
      await loadTemplates();
    } catch (error) {
      console.error("Failed to delete shift template.", error);
      showToast("Không thể xóa ca làm.", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [deletingTemplate, loadTemplates, showToast]);

  return {
    searchInput,
    filters,
    items,
    totalCount,
    currentPage: filters.page,
    pageSize: filters.pageSize,
    isLoading,
    isExporting,
    isCreateModalOpen,
    isEditModalOpen,
    isEditLoading,
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
    reload: loadTemplates,
    exportTemplates,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    handleCreateSuccess: () => {
      setIsCreateModalOpen(false);
      showToast("Tạo ca làm thành công", "success");
      void loadTemplates();
    },
    openEditModal,
    closeEditModal: () => {
      setIsEditModalOpen(false);
      setEditingTemplate(null);
    },
    handleEditSuccess: () => {
      setIsEditModalOpen(false);
      setEditingTemplate(null);
      showToast("Cập nhật ca làm thành công", "success");
      void loadTemplates();
    },
    updateTemplate,
    previewTemplate: () => {
      showToast("Nút Xem đã sẵn sàng để nối log hoặc lịch sử thay đổi mẫu ca.", "info");
    },
    openDeleteModal: (item: ShiftTemplateListItem) => setDeletingTemplate(item),
    closeDeleteModal: () => setDeletingTemplate(null),
    confirmDelete,
  };
};

export default useShiftTemplateManagement;
