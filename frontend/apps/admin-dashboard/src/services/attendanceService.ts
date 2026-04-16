import { API_URL, requestJson } from "./employee/core";

export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  status: "present" | "absent" | "late" | "early";
  notes?: string;
}

export interface AttendanceHistory {
  employeeId: number;
  employeeName: string;
  records: Attendance[];
}

export interface OtpGenerationRequest {
  contractId: number;
  signerEmail: string;
  signerName: string;
}

export interface OtpVerificationRequest {
  tokenId: string;
  otp: string;
}

export interface SigningCompletionRequest {
  tokenId: string;
  signatureData: string;
  signatureTimestamp: string;
}

// Mock data
const mockAttendance: Attendance[] = [
  {
    id: 1,
    employeeId: 1,
    date: new Date().toISOString().split("T")[0],
    checkInTime: "08:00",
    checkOutTime: "17:00",
    workingHours: 9,
    status: "present",
  },
];

export const attendanceService = {
  async checkIn(employeeId: number, location?: string): Promise<Attendance> {
    try {
      return await requestJson<Attendance>(
        `${API_URL}/attendance/check-in`,
        {
          method: "POST",
          body: JSON.stringify({ employeeId, location }),
        },
        "Failed to check in",
      );
    } catch {
      return mockAttendance[0];
    }
  },

  async checkOut(employeeId: number, location?: string): Promise<Attendance> {
    try {
      return await requestJson<Attendance>(
        `${API_URL}/attendance/check-out`,
        {
          method: "POST",
          body: JSON.stringify({ employeeId, location }),
        },
        "Failed to check out",
      );
    } catch {
      return mockAttendance[0];
    }
  },

  async getTodayAttendance(employeeId: number): Promise<Attendance | null> {
    try {
      return await requestJson<Attendance>(
        `${API_URL}/attendance/today?employeeId=${employeeId}`,
        { method: "GET" },
        "Failed to fetch today's attendance",
      );
    } catch {
      return mockAttendance[0];
    }
  },

  async getAttendanceHistory(
    employeeId: number,
    fromDate: string,
    toDate: string,
  ): Promise<Attendance[]> {
    try {
      const url = new URL(`${API_URL}/attendance/history/${employeeId}`);
      url.searchParams.set("fromDate", fromDate);
      url.searchParams.set("toDate", toDate);

      return await requestJson<Attendance[]>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch attendance history",
      );
    } catch {
      return mockAttendance;
    }
  },
};

export const signersService = {
  async generateOtp(
    request: OtpGenerationRequest,
  ): Promise<{ tokenId: string; otpSent: boolean }> {
    try {
      return await requestJson<{ tokenId: string; otpSent: boolean }>(
        `${API_URL}/signers/generate-otp`,
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        "Failed to generate OTP",
      );
    } catch (error) {
      console.error("Generate OTP error:", error);
      throw error;
    }
  },

  async verifyOtp(
    request: OtpVerificationRequest,
  ): Promise<{ verified: boolean; token: string }> {
    try {
      return await requestJson<{ verified: boolean; token: string }>(
        `${API_URL}/signers/verify-otp`,
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        "Failed to verify OTP",
      );
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  },

  async completeSigning(
    request: SigningCompletionRequest,
  ): Promise<{ success: boolean; contractId: number }> {
    try {
      return await requestJson<{ success: boolean; contractId: number }>(
        `${API_URL}/signers/complete-signing`,
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        "Failed to complete signing",
      );
    } catch (error) {
      console.error("Complete signing error:", error);
      throw error;
    }
  },
};

export const leaveRequestsService = {
  async submitLeaveRequest(data: {
    employeeId: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<{ id: number; status: string }> {
    try {
      return await requestJson<{ id: number; status: string }>(
        `${API_URL}/leave-requests`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Failed to submit leave request",
      );
    } catch (error) {
      console.error("Submit leave request error:", error);
      throw error;
    }
  },
};

export const employeeDocumentService = {
  async uploadDocument(
    employeeId: number,
    file: File,
    documentType: string,
  ): Promise<{ documentId: number; url: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      return await requestJson<{ documentId: number; url: string }>(
        `${API_URL}/employee-documents/${employeeId}/upload`,
        {
          method: "POST",
          body: formData,
        },
        "Failed to upload document",
      );
    } catch (error) {
      console.error("Upload document error:", error);
      throw error;
    }
  },

  async getDocuments(
    employeeId: number,
  ): Promise<Array<{ id: number; name: string; url: string; type: string }>> {
    try {
      return await requestJson<
        Array<{ id: number; name: string; url: string; type: string }>
      >(
        `${API_URL}/employee-documents/${employeeId}`,
        { method: "GET" },
        "Failed to fetch documents",
      );
    } catch {
      return [];
    }
  },

  async deleteDocument(documentId: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-documents/${documentId}`,
        { method: "DELETE" },
        `Failed to delete document ${documentId}`,
      );
    } catch (error) {
      console.error("Delete document error:", error);
      throw error;
    }
  },
};
