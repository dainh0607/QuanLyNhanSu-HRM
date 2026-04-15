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
}

const MOCK_DELAY_MS = 260;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const nowIso = () => new Date().toISOString();

const mockSessions: WorkspaceOwnerActivationSession[] = [
  {
    token: "owner-minhtam-activate-2026",
    companyName: "Minh Tam Retail",
    workspaceCode: "MINHTAM",
    ownerFullName: "Le My Linh",
    ownerEmail: "owner@minhtamretail.vn",
    planName: "Starter",
    issuedAt: "2026-04-14T02:30:00.000Z",
    expiresAt: "2026-04-18T17:00:00.000Z",
    status: "ready",
    invitedBy: "admin@nexahrm.com",
    supportContactEmail: "support@nexahrm.com",
    activationPolicy: "owner-sets-password",
    instructions: [
      "SuperAdmin da tao san workspace metadata cho doanh nghiep cua ban.",
      "Ban tu dat mat khau lan dau. SuperAdmin khong duoc biet mat khau nay.",
      "Sau khi kich hoat thanh cong, ban dang nhap bang email cong viec vao admin-dashboard.",
    ],
  },
  {
    token: "owner-hoanggia-activate-2026",
    companyName: "Hoang Gia Hospitality",
    workspaceCode: "HOANGGIA",
    ownerFullName: "Pham Thanh Ha",
    ownerEmail: "cio@hoanggia.vn",
    planName: "Enterprise",
    issuedAt: "2026-04-10T03:15:00.000Z",
    expiresAt: "2026-04-12T17:00:00.000Z",
    status: "expired",
    invitedBy: "admin@nexahrm.com",
    supportContactEmail: "support@nexahrm.com",
    activationPolicy: "owner-sets-password",
    instructions: [
      "Activation link chi duoc dung mot lan trong thoi gian quy dinh.",
      "Neu link het han, Workspace Owner can yeu cau SuperAdmin gui lai loi moi.",
    ],
  },
  {
    token: "owner-anphat-activate-2026",
    companyName: "An Phat Logistics",
    workspaceCode: "ANPHAT",
    ownerFullName: "Nguyen Quoc Duy",
    ownerEmail: "admin@anphatlogistics.vn",
    planName: "Growth",
    issuedAt: "2026-04-09T02:00:00.000Z",
    expiresAt: "2026-04-16T17:00:00.000Z",
    status: "activated",
    invitedBy: "admin@nexahrm.com",
    supportContactEmail: "support@nexahrm.com",
    activationPolicy: "owner-sets-password",
    instructions: [
      "Tai khoan nay da duoc kich hoat thanh cong.",
      "Neu can reset password, vui long su dung luong quen mat khau tu backend/Firebase sau nay.",
    ],
  },
];

let mutableSessions = clone(mockSessions);

const simulate = async <T,>(factory: () => T): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(clone(factory()));
    }, MOCK_DELAY_MS);
  });

const getSessionByToken = (token: string) =>
  mutableSessions.find((session) => session.token === token);

export const workspaceOwnerActivationService = {
  getDemoToken(): string {
    return "owner-minhtam-activate-2026";
  },

  async fetchActivationSession(
    token: string,
  ): Promise<WorkspaceOwnerActivationResult> {
    const normalizedToken = token.trim();

    return simulate(() => {
      if (!normalizedToken) {
        return {
          success: false,
          status: "not_found" as const,
          message: "Activation link is missing.",
        };
      }

      const session = getSessionByToken(normalizedToken);
      if (!session) {
        return {
          success: false,
          status: "not_found" as const,
          message: "Activation link khong hop le hoac da bi thu hoi.",
        };
      }

      if (
        session.status === "ready" &&
        new Date(session.expiresAt).getTime() < new Date(nowIso()).getTime()
      ) {
        session.status = "expired";
      }

      return {
        success: session.status !== "not_found",
        status: session.status,
        session,
        message:
          session.status === "ready"
            ? "Activation link hop le."
            : "Activation link hien tai khong san sang de kich hoat.",
      };
    });
  },

  async activateWorkspaceOwner(
    payload: WorkspaceOwnerActivationPayload,
  ): Promise<WorkspaceOwnerActivationResult> {
    const normalizedToken = payload.token.trim();

    return simulate(() => {
      const session = getSessionByToken(normalizedToken);
      if (!session) {
        return {
          success: false,
          status: "not_found" as const,
          message: "Activation link khong ton tai.",
        };
      }

      if (
        session.status === "ready" &&
        new Date(session.expiresAt).getTime() < new Date(nowIso()).getTime()
      ) {
        session.status = "expired";
      }

      if (session.status !== "ready") {
        return {
          success: false,
          status: session.status,
          session,
          message:
            session.status === "activated"
              ? "Tai khoan nay da duoc kich hoat truoc do."
              : "Lien ket nay hien khong the su dung de kich hoat tai khoan.",
        };
      }

      if (payload.password.length < 8) {
        return {
          success: false,
          status: "ready",
          session,
          message: "Mat khau phai co it nhat 8 ky tu.",
        };
      }

      if (payload.password !== payload.confirmPassword) {
        return {
          success: false,
          status: "ready",
          session,
          message: "Mat khau xac nhan khong khop.",
        };
      }

      session.status = "activated";

      return {
        success: true,
        status: session.status,
        session,
        message:
          "Mock activation thanh cong. Sau nay BE se tao user Firebase va local session tu endpoint activation.",
      };
    });
  },

  resetMockState(): void {
    mutableSessions = clone(mockSessions);
  },
};
