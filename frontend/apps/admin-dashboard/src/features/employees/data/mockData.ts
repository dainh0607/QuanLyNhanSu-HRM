import type { Employee } from '../types';

export const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
    id: `NV${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Nguyễn Hoàng Đại' : `Nhân viên ${i + 1}`,
    avatarInitials: i === 0 ? 'NH' : 'NV',
    role: i === 0 ? 'Quản lý' : 'Nhân viên',
    phone: i === 0 ? '0987.654.321' : `0123.456.78${(i + 1) % 10}`,
    branch: i === 0 ? 'Trụ sở chính' : 'CN Quận 1',
    department: i === 0 ? 'Ban Giám đốc' : 'Kỹ thuật',
    title: i === 0 ? 'Giám đốc điều hành' : 'Lập trình viên',
    email: i === 0 ? 'dai.nguyen@company.com' : `nv${i + 1}@company.com`,
    isPremium: i === 0
}));
