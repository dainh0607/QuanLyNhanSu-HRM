export interface TimesheetConfig {
  // AC 2.1: Toggles
  isPhoneDisabled: boolean;
  isWebEnabled: boolean;
  isDeviceSyncEnabled: boolean;
  isOfflinePhoneEnabled: boolean;
  isAutoCheckoutEnabled: boolean;
  isShiftSuggestionEnabled: boolean;
  isTimesheetLocked: boolean;

  // AC 3.1 - 3.3: Công chuẩn
  standardTimeMethod: 'fixed' | 'month_minus_sun' | 'month_minus_half_sat_sun' | 'working_days';
  standardTimeValue: number;
  workingHoursPerDay: number;
  isPhotoRequired: boolean;
}

export interface GPSLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  mainBranch?: string;
  subBranch?: string;
  targetDepartments?: string[];
  targetEmployees?: string[];
}

export interface WifiConfig {
  id: string;
  name: string; // SSID
  bssid?: string;
  securityType: 'ssid_only' | 'ssid_bssid';
  mainBranch?: string;
  subBranch?: string;
  targetDepartments?: string[];
  targetEmployees?: string[];
}

export interface QRCodeConfig {
  id: string;
  name: string;
  otherInfo?: string;
  requireLocation: boolean;
  qrUrl?: string; // URL ảnh mã QR được sinh từ BE
  mainBranch?: string;
  subBranch?: string;
  targetDepartments?: string[];
  targetEmployees?: string[];
}

export interface WANIPConfig {
  id: string;
  name: string;
  ipAddress: string;
  mainBranch: string;
  subBranch?: string;
  targetDepartments?: string[];
  targetEmployees?: string[];
}

export interface CameraDevice {
  id: string;
  name: string;
  type: 'in' | 'out' | 'both';
  status: 'online' | 'offline';
}

export interface FaceIDEnrollment {
  id: string;
  employeeName: string;
  avatar?: string;
  faceIdCode: string;
  branch: string;
  recognitionImage?: string; // Ảnh crop từ AI
  status: 'success' | 'error' | 'not_registered';
  errorMessage?: string;
}

class TimesheetService {
  private config: TimesheetConfig = {
    isPhoneDisabled: false,
    isWebEnabled: true,
    isDeviceSyncEnabled: true,
    isOfflinePhoneEnabled: true,
    isAutoCheckoutEnabled: true,
    isShiftSuggestionEnabled: true,
    isTimesheetLocked: false,
    standardTimeMethod: 'month_minus_sun',
    standardTimeValue: 0,
    workingHoursPerDay: 8,
    isPhotoRequired: false
  };

  private gpsLocations: GPSLocation[] = [
    { id: 'gps1', name: 'Trụ sở chính', address: '123 Đường ABC, Quận 1, TP.HCM', latitude: 10.762622, longitude: 106.660172, radius: 100, mainBranch: 'HCM_Main' },
    { id: 'gps2', name: 'Chi nhánh Hà Nội', address: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội', latitude: 21.028511, longitude: 105.804817, radius: 150, mainBranch: 'HN_Branch' },
  ];

  private wifiConfigs: WifiConfig[] = [
    { id: 'w1', name: 'Office_5G', bssid: '00:1A:2B:3C:4D:5E', securityType: 'ssid_bssid', mainBranch: 'HCM_Main' },
    { id: 'w2', name: 'Guest_Wifi', securityType: 'ssid_only', mainBranch: 'HCM_Main' },
  ];

  private qrConfigs: QRCodeConfig[] = [
    { id: 'qr1', name: 'Quầy lễ tân', requireLocation: true, qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qr_rec_01', mainBranch: 'HCM_Main' },
    { id: 'qr2', name: 'Nhà kho B', requireLocation: false, qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qr_whb_02', mainBranch: 'HN_Branch' },
  ];

  private wanIpConfigs: WANIPConfig[] = [
    { id: 'ip1', name: 'Đường truyền Viettel Tầng 1', ipAddress: '14.248.82.11', mainBranch: 'HCM_Main' },
    { id: 'ip2', name: 'Mạng FPT Tầng 3', ipAddress: '171.244.40.155', mainBranch: 'HCM_Main' },
  ];

  private cameraDevices: CameraDevice[] = [
    { id: 'cam1', name: 'Camera Sảnh Chính - Tầng G', type: 'both', status: 'online' },
    { id: 'cam2', name: 'Camera Cửa Kho - Tầng B1', type: 'in', status: 'online' },
    { id: 'cam3', name: 'Camera Lối Thoát Hiểm', type: 'out', status: 'offline' },
  ];

  private faceEnrollments: FaceIDEnrollment[] = [
    { id: 'emp1', employeeName: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=a', faceIdCode: 'FID_001', branch: 'HCM_Main', recognitionImage: 'https://i.pravatar.cc/150?u=a_crop', status: 'success' },
    { id: 'emp2', employeeName: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=b', faceIdCode: 'FID_002', branch: 'HCM_Main', status: 'error', errorMessage: 'Không tìm thấy khuôn mặt' },
    { id: 'emp3', employeeName: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?u=c', faceIdCode: 'FID_003', branch: 'HCM_Main', status: 'not_registered' },
    { id: 'emp4', employeeName: 'Phạm Minh D', avatar: 'https://i.pravatar.cc/150?u=d', faceIdCode: 'FID_004', branch: 'HN_Branch', recognitionImage: 'https://i.pravatar.cc/150?u=d_crop', status: 'success' },
    { id: 'emp5', employeeName: 'Hoàng Anh E', avatar: 'https://i.pravatar.cc/150?u=e', faceIdCode: 'FID_005', branch: 'HN_Branch', status: 'error', errorMessage: 'Phát hiện nhiều khuôn mặt' },
  ];

  async getConfig(): Promise<TimesheetConfig> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...this.config }), 500);
    });
  }

  async updateConfig(newConfig: TimesheetConfig): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.config = newConfig;
        resolve({ success: true, message: "Cập nhật cấu hình chấm công thành công" });
      }, 500);
    });
  }

  // --- GPS METHODS ---
  async getGPSLocations(): Promise<GPSLocation[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.gpsLocations]), 500);
    });
  }

  async saveGPSLocation(data: Partial<GPSLocation>): Promise<{ success: boolean; data?: GPSLocation }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.id) {
          const index = this.gpsLocations.findIndex(l => l.id === data.id);
          this.gpsLocations[index] = { ...this.gpsLocations[index], ...data } as GPSLocation;
          resolve({ success: true, data: this.gpsLocations[index] });
        } else {
          const newLoc: GPSLocation = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || '',
            address: data.address || '',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            radius: data.radius || 0,
            ...data
          } as GPSLocation;
          this.gpsLocations.push(newLoc);
          resolve({ success: true, data: newLoc });
        }
      }, 500);
    });
  }

  async deleteGPSLocation(id: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.gpsLocations = this.gpsLocations.filter(l => l.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- WIFI METHODS ---
  async getWifiConfigs(): Promise<WifiConfig[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.wifiConfigs]), 500);
    });
  }

  async saveWifiConfig(data: Partial<WifiConfig>): Promise<{ success: boolean; data?: WifiConfig }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.id) {
          const index = this.wifiConfigs.findIndex(w => w.id === data.id);
          this.wifiConfigs[index] = { ...this.wifiConfigs[index], ...data } as WifiConfig;
          resolve({ success: true, data: this.wifiConfigs[index] });
        } else {
          const newWifi: WifiConfig = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || '',
            securityType: data.securityType || 'ssid_only',
            ...data
          } as WifiConfig;
          this.wifiConfigs.push(newWifi);
          resolve({ success: true, data: newWifi });
        }
      }, 500);
    });
  }

  async deleteWifiConfig(id: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.wifiConfigs = this.wifiConfigs.filter(w => w.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- QR METHODS ---
  async getQRConfigs(): Promise<QRCodeConfig[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.qrConfigs]), 500);
    });
  }

  async saveQRConfig(data: Partial<QRCodeConfig>): Promise<{ success: boolean; data?: QRCodeConfig }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.id) {
          const index = this.qrConfigs.findIndex(q => q.id === data.id);
          this.qrConfigs[index] = { ...this.qrConfigs[index], ...data } as QRCodeConfig;
          resolve({ success: true, data: this.qrConfigs[index] });
        } else {
          const newId = Math.random().toString(36).substr(2, 9);
          const newQR: QRCodeConfig = {
            id: newId,
            name: data.name || '',
            requireLocation: data.requireLocation || false,
            qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qr_${newId}`, // Mock sinh QR
            ...data
          } as QRCodeConfig;
          this.qrConfigs.push(newQR);
          resolve({ success: true, data: newQR });
        }
      }, 500);
    });
  }

  async deleteQRConfig(id: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.qrConfigs = this.qrConfigs.filter(q => q.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- WAN IP METHODS ---
  async getWANIPConfigs(): Promise<WANIPConfig[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.wanIpConfigs]), 500);
    });
  }

  async saveWANIPConfig(data: Partial<WANIPConfig>): Promise<{ success: boolean; data?: WANIPConfig }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.id) {
          const index = this.wanIpConfigs.findIndex(i => i.id === data.id);
          this.wanIpConfigs[index] = { ...this.wanIpConfigs[index], ...data } as WANIPConfig;
          resolve({ success: true, data: this.wanIpConfigs[index] });
        } else {
          const newIP: WANIPConfig = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || '',
            ipAddress: data.ipAddress || '',
            mainBranch: data.mainBranch || '',
            ...data
          } as WANIPConfig;
          this.wanIpConfigs.push(newIP);
          resolve({ success: true, data: newIP });
        }
      }, 500);
    });
  }

  async deleteWANIPConfig(id: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.wanIpConfigs = this.wanIpConfigs.filter(i => i.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- CAMERA AI METHODS ---
  async getCameraDevices(): Promise<CameraDevice[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.cameraDevices]), 500);
    });
  }

  async getFaceEnrollments(): Promise<FaceIDEnrollment[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.faceEnrollments]), 500);
    });
  }

  async syncFaceImages(): Promise<{ success: boolean; results: FaceIDEnrollment[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập đồng bộ
        this.faceEnrollments = this.faceEnrollments.map(item => {
          if (item.status === 'not_registered' || item.status === 'error') {
            const isSuccess = Math.random() > 0.3;
            return {
              ...item,
              status: isSuccess ? 'success' : 'error',
              errorMessage: isSuccess ? undefined : 'Kích thước ảnh quá nhỏ',
              faceIdCode: item.faceIdCode || `FID_${Math.floor(Math.random() * 1000)}`
            };
          }
          return item;
        });
        resolve({ success: true, results: [...this.faceEnrollments] });
      }, 2000);
    });
  }
}

export const timesheetService = new TimesheetService();
