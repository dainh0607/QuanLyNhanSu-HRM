
import { API_URL, requestJson } from "./employee/core";

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

// Mock data generator for initial development
const MOCK_LOGS: AuditLog[] = [
  {
    id: '1',
    employeeId: 1,
    action: 'DELETE',
    timestamp: '2026-04-13T21:44:00',
    content: 'Minh đã hủy đăng ký ca Ca hành chính cho ngày 15/04/2026',
    device: 'Windows 10',
    macAddress: '00-50-56-C0-00-08',
    os: 'Web',
    ipAddress: '192.168.1.15'
  },
  {
    id: '2',
    employeeId: 1,
    action: 'UPDATE',
    timestamp: '2026-04-13T10:15:00',
    content: 'Cập nhật thông tin trình độ học vấn: Thêm bằng Thạc sĩ Quản trị kinh doanh',
    device: 'MacBook Pro 14',
    macAddress: '3C-A6-2F-AA-BB-CC',
    os: 'MacOS',
    ipAddress: '172.16.0.50'
  },
  {
    id: '3',
    employeeId: 1,
    action: 'CREATE',
    timestamp: '2026-04-12T08:30:00',
    content: 'Thêm mới thông tin liên hệ khẩn cấp: Nguyễn Văn B (Anh trai)',
    device: 'iPhone 15 Pro',
    macAddress: 'F0-18-98-DD-EE-FF',
    os: 'iOS App',
    ipAddress: '10.0.0.5'
  },
  {
    id: '4',
    employeeId: 1,
    action: 'UPDATE',
    timestamp: '2026-04-10T15:20:00',
    content: 'Thay đổi trạng thái hợp đồng sang "Đang hiệu lực"',
    device: 'Windows 11',
    macAddress: '04-7C-16-11-22-33',
    os: 'Web',
    ipAddress: '192.168.1.102'
  }
];

export const historyService = {
  async getAuditLogs(employeeId: number, filters: AuditFilters): Promise<AuditLog[]> {
    // In a real app: return await requestJson(`${API_URL}/audit-logs?employeeId=${employeeId}&search=${filters.search}...`)
    
    // Simulating API call with mock data
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network lag
    
    let filtered = MOCK_LOGS.filter(log => log.employeeId === employeeId);
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.content.toLowerCase().includes(searchLower) ||
        log.device.toLowerCase().includes(searchLower) ||
        log.ipAddress.includes(filters.search!)
      );
    }
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      // Set to end of day
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= end);
    }
    
    return [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async exportAuditLogs(logs: AuditLog[]): Promise<void> {
    const headers = ['Thời gian', 'Hành động', 'Nội dung', 'Thiết bị', 'MAC', 'Hệ điều hành', 'Địa chỉ IP'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString('vi-VN'),
      log.action,
      `"${log.content.replace(/"/g, '""')}"`,
      log.device,
      log.macAddress,
      log.os,
      log.ipAddress
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Lich_su_thao_tac_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
