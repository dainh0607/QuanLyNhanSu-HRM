import { API_URL, requestJson, requestBlob } from "./employee/core";

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: string;
  employeeId: number;
  action: AuditAction;
  timestamp: string;
  content: string;
  device: string;
  macAddress: string;
  os: string;
  ipAddress: string;
}

export interface AuditFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const historyService = {
  async getAuditLogs(employeeId: number, filters: AuditFilters): Promise<AuditLog[]> {
    const url = new URL(`${API_URL}/auditlogs/employee/${employeeId}`);

    if (filters.search) {
      url.searchParams.set("keyword", filters.search);
    }
    if (filters.startDate) {
      url.searchParams.set("fromDate", filters.startDate);
    }
    if (filters.endDate) {
      url.searchParams.set("toDate", filters.endDate);
    }

    try {
      return await requestJson<AuditLog[]>(
        url.toString(),
        { method: "GET" },
        "Lỗi khi tải lịch sử thao tác",
      );
    } catch (error) {
      console.warn("Failed to fetch audit logs:", error);
      return [];
    }
  },

  async exportAuditLogs(employeeId: number, filters: AuditFilters): Promise<void> {
    const url = new URL(`${API_URL}/auditlogs/employee/${employeeId}/export`);

    if (filters.search) {
      url.searchParams.set("keyword", filters.search);
    }
    if (filters.startDate) {
      url.searchParams.set("fromDate", filters.startDate);
    }
    if (filters.endDate) {
      url.searchParams.set("toDate", filters.endDate);
    }

    try {
      const { blob } = await requestBlob(
        url.toString(),
        { method: "GET" },
        "Lỗi khi xuất lịch sử thao tác",
      );

      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);

      link.setAttribute('href', blobUrl);
      link.setAttribute('download', `Lich_su_thao_tac_NV${employeeId}_${new Date().getTime()}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Export audit logs failed:", error);
      throw error;
    }
  },
};
