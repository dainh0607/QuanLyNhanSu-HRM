import { API_URL, requestJson } from "./employee/core";

export interface Education {
  id?: number;
  school: string;
  major: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  certificateUrl?: string;
}

export interface Skill {
  id?: number;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
}

export interface Certificate {
  id?: number;
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  certificateNumber?: string;
}

export interface WorkHistory {
  id?: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  achievements?: string;
  duration?: number; // in months
}

export interface BankAccount {
  id?: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface HealthRecord {
  id?: number;
  bloodType?: string;
  height?: number;
  weight?: number;
  lastCheckupDate?: string;
  notes?: string;
}

export interface Dependent {
  id?: number;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  nationalId?: string;
  isInsured?: boolean;
}

export const employeeDetailsService = {
  async updateEducation(
    employeeId: number,
    education: Education[],
  ): Promise<Education[]> {
    try {
      return await requestJson<Education[]>(
        `${API_URL}/employee-details/education`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, records: education }),
        },
        "Failed to update education",
      );
    } catch (error) {
      console.error("Update education error:", error);
      throw error;
    }
  },

  async updateSkills(employeeId: number, skills: Skill[]): Promise<Skill[]> {
    try {
      return await requestJson<Skill[]>(
        `${API_URL}/employee-details/skills`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, records: skills }),
        },
        "Failed to update skills",
      );
    } catch (error) {
      console.error("Update skills error:", error);
      throw error;
    }
  },

  async updateCertificates(
    employeeId: number,
    certificates: Certificate[],
  ): Promise<Certificate[]> {
    try {
      return await requestJson<Certificate[]>(
        `${API_URL}/employee-details/certificates`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, records: certificates }),
        },
        "Failed to update certificates",
      );
    } catch (error) {
      console.error("Update certificates error:", error);
      throw error;
    }
  },

  async updateWorkHistory(
    employeeId: number,
    history: WorkHistory[],
  ): Promise<WorkHistory[]> {
    try {
      return await requestJson<WorkHistory[]>(
        `${API_URL}/employee-details/work-history`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, records: history }),
        },
        "Failed to update work history",
      );
    } catch (error) {
      console.error("Update work history error:", error);
      throw error;
    }
  },

  async updateBankAccounts(
    employeeId: number,
    accounts: BankAccount[],
  ): Promise<BankAccount[]> {
    try {
      return await requestJson<BankAccount[]>(
        `${API_URL}/employee-details/bank-accounts`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, records: accounts }),
        },
        "Failed to update bank accounts",
      );
    } catch (error) {
      console.error("Update bank accounts error:", error);
      throw error;
    }
  },

  async updateHealthRecord(
    employeeId: number,
    health: HealthRecord,
  ): Promise<HealthRecord> {
    try {
      return await requestJson<HealthRecord>(
        `${API_URL}/employee-details/health-record`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, ...health }),
        },
        "Failed to update health record",
      );
    } catch (error) {
      console.error("Update health record error:", error);
      throw error;
    }
  },

  async updateDependents(
    employeeId: number,
    dependents: Dependent[],
  ): Promise<Dependent[]> {
    try {
      return await requestJson<Dependent[]>(
        `${API_URL}/employee-details/dependents`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, records: dependents }),
        },
        "Failed to update dependents",
      );
    } catch (error) {
      console.error("Update dependents error:", error);
      throw error;
    }
  },
};

export const employeeProfileService = {
  async updateAvatar(file: File): Promise<{ photoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await requestJson<{ photoUrl: string }>(
        `${API_URL}/employee-profile/avatar`,
        {
          method: "PUT",
          body: formData,
        },
        "Failed to update avatar",
      );
    } catch (error) {
      console.error("Update avatar error:", error);
      throw error;
    }
  },

  async updateBasicInfo(
    employeeId: number,
    data: {
      fullName?: string;
      dateOfBirth?: string;
      gender?: string;
      maritalStatus?: string;
    },
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-profile/basic-info`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, ...data }),
        },
        "Failed to update basic info",
      );
    } catch (error) {
      console.error("Update basic info error:", error);
      throw error;
    }
  },

  async updateIdentity(
    employeeId: number,
    data: {
      nationalId?: string;
      passportNumber?: string;
      issueDate?: string;
      expiryDate?: string;
    },
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-profile/identity`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, ...data }),
        },
        "Failed to update identity",
      );
    } catch (error) {
      console.error("Update identity error:", error);
      throw error;
    }
  },

  async updateContact(
    employeeId: number,
    data: {
      email?: string;
      phone?: string;
      homePhone?: string;
    },
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-profile/contact`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, ...data }),
        },
        "Failed to update contact",
      );
    } catch (error) {
      console.error("Update contact error:", error);
      throw error;
    }
  },

  async updateAddresses(
    employeeId: number,
    addresses: any[],
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-profile/addresses`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, addresses }),
        },
        "Failed to update addresses",
      );
    } catch (error) {
      console.error("Update addresses error:", error);
      throw error;
    }
  },

  async updateEmergencyContacts(
    employeeId: number,
    contacts: Array<{ name: string; phone: string; relationship: string }>,
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-profile/emergency-contacts`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, contacts }),
        },
        "Failed to update emergency contacts",
      );
    } catch (error) {
      console.error("Update emergency contacts error:", error);
      throw error;
    }
  },

  async getOtherInfo(employeeId: number): Promise<any> {
    try {
      return await requestJson<any>(
        `${API_URL}/employee-profile/other-info?employeeId=${employeeId}`,
        { method: "GET" },
        "Failed to fetch other info",
      );
    } catch {
      return {};
    }
  },

  async updateOtherInfo(
    employeeId: number,
    data: any,
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/employee-profile/other-info`,
        {
          method: "PUT",
          body: JSON.stringify({ employeeId, ...data }),
        },
        "Failed to update other info",
      );
    } catch (error) {
      console.error("Update other info error:", error);
      throw error;
    }
  },
};
