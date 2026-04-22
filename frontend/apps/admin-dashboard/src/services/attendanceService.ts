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

export const attendanceService = {
  async checkIn(employeeId: number, location?: string): Promise<Attendance> {
    return requestJson<Attendance>(
      `${API_URL}/attendance/check-in`,
      {
        method: "POST",
        body: JSON.stringify({ employeeId, location }),
      },
      "Failed to check in",
    );
  },

  async checkOut(employeeId: number, location?: string): Promise<Attendance> {
    return requestJson<Attendance>(
      `${API_URL}/attendance/check-out`,
      {
        method: "POST",
        body: JSON.stringify({ employeeId, location }),
      },
      "Failed to check out",
    );
  },

  async getTodayAttendance(employeeId: number): Promise<Attendance | null> {
    try {
      return await requestJson<Attendance>(
        `${API_URL}/attendance/today?employeeId=${employeeId}`,
        { method: "GET" },
        "Failed to fetch today's attendance",
      );
    } catch {
      return null;
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
      return [];
    }
  },
};

export const signersService = {
  async generateOtp(
    request: OtpGenerationRequest,
  ): Promise<{ tokenId: string; otpSent: boolean }> {
    return requestJson<{ tokenId: string; otpSent: boolean }>(
      `${API_URL}/signers/generate-otp`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      "Failed to generate OTP",
    );
  },

  async verifyOtp(
    request: OtpVerificationRequest,
  ): Promise<{ verified: boolean; token: string }> {
    return requestJson<{ verified: boolean; token: string }>(
      `${API_URL}/signers/verify-otp`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      "Failed to verify OTP",
    );
  },

  async completeSigning(
    request: SigningCompletionRequest,
  ): Promise<{ success: boolean; contractId: number }> {
    return requestJson<{ success: boolean; contractId: number }>(
      `${API_URL}/signers/complete-signing`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      "Failed to complete signing",
    );
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
    return requestJson<{ id: number; status: string }>(
      `${API_URL}/leave-requests`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      "Failed to submit leave request",
    );
  },
};

export const employeeDocumentService = {
  async uploadDocument(
    employeeId: number,
    file: File,
    documentType: string,
  ): Promise<{ documentId: number; url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    return requestJson<{ documentId: number; url: string }>(
      `${API_URL}/employee-documents/${employeeId}/upload`,
      {
        method: "POST",
        body: formData,
      },
      "Failed to upload document",
    );
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
    return requestJson<{ success: boolean }>(
      `${API_URL}/employee-documents/${documentId}`,
      { method: "DELETE" },
      `Failed to delete document ${documentId}`,
    );
  },
};
