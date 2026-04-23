export type LeaveTypeCategory = 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';

export interface LeaveType {
  id: string;
  keyword: string;
  name: string;
  category: LeaveTypeCategory;
  displayOrder: number;
  isActive: boolean;
  applicableTo: {
    branches?: string[];
    departments?: string[];
    jobTitles?: string[];
    employmentTypes?: string[];
    genders?: ('male' | 'female' | 'other')[];
  };
  accrualRule: {
    type: 'monthly' | 'yearly' | 'adhoc';
    daysPerYear: number;
    allowCarryOver: boolean;
    grantFullAmountAtStart: boolean; // AC 3.2: Giao đủ mức
    grantDaysForNewEmployee?: number; // AC 3.2: Ngày cấp phép cho NV mới
  };
}

export interface LeaveRecord {
  id: string;
  leaveTypeName: string;
  leaveTypeCategory: 'paid' | 'unpaid';
  dateRange: string;
  requestedAt: string;
  lockedAt: string;
  notes: string;
  durationDays: number;
}

export interface EmployeeLeaveGroup {
  employeeId: string;
  employeeName: string;
  avatar: string;
  records: LeaveRecord[];
}

export interface Holiday {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  numDays: number;
  departments: string[];
  employeeIds: string[];
  shiftId: string;
  shiftName: string;
  wageMultiplier: number;
}

export interface HolidaySettings {
  attendanceType: 'workday' | 'holiday'; // workday: theo ngày công, holiday: theo ngày lễ
}

class LeaveService {
  private holidaySettings: HolidaySettings = {
    attendanceType: 'workday'
  };
  private holidays: Holiday[] = [
    {
      id: 'h1',
      title: 'Tết Dương lịch 2026',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      numDays: 1,
      departments: ['1', '2'],
      employeeIds: [],
      shiftId: 's1',
      shiftName: 'Ca Hành chính',
      wageMultiplier: 3.0
    }
  ];
  private leaveTypes: LeaveType[] = [
    {
      id: '1',
      keyword: 'PHEP_NAM',
      name: 'Nghỉ phép năm',
      category: 'annual',
      displayOrder: 1,
      isActive: true,
      applicableTo: {},
      accrualRule: {
        type: 'monthly',
        daysPerYear: 12,
        allowCarryOver: true,
        grantFullAmountAtStart: false,
        grantDaysForNewEmployee: 1
      }
    },
    {
      id: '2',
      keyword: 'NGHI_OM',
      name: 'Nghỉ ốm hưởng BHXH',
      category: 'sick',
      displayOrder: 2,
      isActive: true,
      applicableTo: {},
      accrualRule: {
        type: 'adhoc',
        daysPerYear: 30,
        allowCarryOver: false,
        grantFullAmountAtStart: true
      }
    }
  ];

  async getLeaveTypes(): Promise<LeaveType[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.leaveTypes]), 500);
    });
  }

  async saveLeaveType(leaveType: Partial<LeaveType>): Promise<LeaveType> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (leaveType.id) {
          const index = this.leaveTypes.findIndex(lt => lt.id === leaveType.id);
          this.leaveTypes[index] = { ...this.leaveTypes[index], ...leaveType } as LeaveType;
          resolve(this.leaveTypes[index]);
        } else {
          const newLeaveType = {
            ...leaveType,
            id: Math.random().toString(36).substr(2, 9),
            isActive: true
          } as LeaveType;
          this.leaveTypes.push(newLeaveType);
          resolve(newLeaveType);
        }
      }, 500);
    });
  }

  async deleteLeaveType(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.leaveTypes = this.leaveTypes.filter(lt => lt.id !== id);
        resolve();
      }, 500);
    });
  }

  async getLeaveTrackerData(startDate: string, endDate: string, filters: any): Promise<EmployeeLeaveGroup[]> {
    console.log("Fetching leave data for:", { startDate, endDate, filters });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const allData: EmployeeLeaveGroup[] = [
          {
            employeeId: 'EMP001',
            employeeName: 'Nguyễn Văn Minh',
            avatar: 'M',
            records: [
              { id: '1', leaveTypeName: 'Nghỉ phép năm', leaveTypeCategory: 'paid', dateRange: '2026-04-15', requestedAt: '10/04/2026', lockedAt: '12/04/2026', notes: 'Về quê', durationDays: 1 },
              { id: '2', leaveTypeName: 'Nghỉ ốm', leaveTypeCategory: 'unpaid', dateRange: '2026-04-20', requestedAt: '18/04/2026', lockedAt: '19/04/2026', notes: 'Sốt xuất huyết', durationDays: 2 }
            ]
          },
          {
            employeeId: 'EMP002',
            employeeName: 'Trần Quốc Cường',
            avatar: 'C',
            records: [
               { id: '3', leaveTypeName: 'Nghỉ không lương', leaveTypeCategory: 'unpaid', dateRange: '2026-04-05', requestedAt: '01/04/2026', lockedAt: '02/04/2026', notes: 'Việc gia đình', durationDays: 1 }
            ]
          }
        ];

        // Lọc dữ liệu theo ngày
        const filtered = allData.map(group => ({
          ...group,
          records: group.records.filter(r => {
            const recordDate = new Date(r.dateRange);
            return recordDate >= start && recordDate <= end;
          })
        })).filter(group => group.records.length > 0);

        resolve(filtered);
      }, 600);
    });
  }

  async getHolidays(): Promise<Holiday[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.holidays]), 500);
    });
  }

  async saveHoliday(holiday: Partial<Holiday>): Promise<Holiday> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (holiday.id) {
          const index = this.holidays.findIndex(h => h.id === holiday.id);
          this.holidays[index] = { ...this.holidays[index], ...holiday } as Holiday;
          resolve(this.holidays[index]);
        } else {
          const newHoliday = {
            ...holiday,
            id: Math.random().toString(36).substr(2, 9),
            shiftName: holiday.shiftId === 's1' ? 'Ca Hành chính' : 'Ca Đêm'
          } as Holiday;
          this.holidays.push(newHoliday);
          resolve(newHoliday);
        }
      }, 500);
    });
  }

  async deleteHoliday(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.holidays = this.holidays.filter(h => h.id !== id);
        resolve();
      }, 500);
    });
  }

  async getHolidaySettings(): Promise<HolidaySettings> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...this.holidaySettings }), 500);
    });
  }

  async updateHolidaySettings(settings: HolidaySettings): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.holidaySettings = { ...settings };
        resolve();
      }, 500);
    });
  }
}

export const leaveService = new LeaveService();
