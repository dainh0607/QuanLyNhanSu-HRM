import { type User } from "./authService";
import { API_URL } from "./apiConfig";

export type WorkspaceOwnerActivationStatus =
  | "ready"
  | "activated"
  | "expired"
  | "revoked"
  | "not_found";

export interface WorkspaceOwnerActivationSession {
  token: string;
  companyName: string;
  workspaceCode: string;
  ownerFullName: string;
  ownerEmail: string;
  planName: string;
  issuedAt: string;
  expiresAt: string;
  status: WorkspaceOwnerActivationStatus;
  invitedBy: string;
  supportContactEmail: string;
  activationPolicy: "owner-sets-password";
  instructions: string[];
}

export interface WorkspaceOwnerActivationPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface WorkspaceOwnerActivationResult {
  success: boolean;
  status: WorkspaceOwnerActivationStatus;
  session?: WorkspaceOwnerActivationSession;
  message?: string;
  user?: User;
  idToken?: string;
}

/**
 * Service handling Workspace Owner Activation by connecting to the real Backend API.
 * Route: api/activation/workspace-owner
 */
export const workspaceOwnerActivationService = {
  /**
   * For the local environment or QA, this returns a consistent token
   * that can be used for testing after being generated in the Control Plane.
   */
  getDemoToken(): string {
    return "owner-minhtam-activate-2026";
  },

  /**
   * Fetches the activation session details from the server using the provided token.
   * Public endpoint - no authentication required.
   */
  async fetchActivationSession(
    token: string,
  ): Promise<WorkspaceOwnerActivationResult> {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      return {
        success: false,
        status: "not_found",
        message: "Mã kích hoạt không được để trống.",
      };
    }

    try {
      const response = await fetch(
        `${API_URL}/activation/workspace-owner?token=${encodeURIComponent(normalizedToken)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (response.status === 404) {
        return {
          success: false,
          status: "not_found",
          message: "Liên kết kích hoạt không tồn tại hoặc đã bị thu hồi.",
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: "not_found",
          message: errorData.message || `Lỗi hệ thống (${response.status}). Vui lòng thử lại sau.`,
        };
      }

      return (await response.json()) as WorkspaceOwnerActivationResult;
    } catch (error) {
      console.error("fetchActivationSession error:", error);
      return {
        success: false,
        status: "not_found",
        message: "Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền mạng.",
      };
    }
  },

  /**
   * Submits the password and activates the workspace owner account.
   * If successful, the Backend returns the User and IdToken to perform an automatic login.
   * Public endpoint - no authentication required.
   */
  async activateWorkspaceOwner(
    payload: WorkspaceOwnerActivationPayload,
  ): Promise<WorkspaceOwnerActivationResult> {
    try {
      const response = await fetch(`${API_URL}/activation/workspace-owner`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token: payload.token.trim(),
          password: payload.password,
          confirmPassword: payload.confirmPassword,
        }),
      });

      const data = (await response.json()) as WorkspaceOwnerActivationResult;

      if (!response.ok) {
        return {
          success: false,
          status: data.status || "ready",
          message: data.message || "Không thể kích hoạt tài khoản vào lúc này.",
        };
      }

      return data;
    } catch (error) {
      console.error("activateWorkspaceOwner error:", error);
      return {
        success: false,
        status: "ready",
        message: "Lỗi kết nối khi kích hoạt. Vui lòng thử lại trong giây lát.",
      };
    }
  },
};
