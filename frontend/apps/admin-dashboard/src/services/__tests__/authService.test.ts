import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { authService } from "../authService";
import { mockFetch, clearMocks, decodeJWT } from "../../test-utils/fetch-mock";

describe("AuthService", () => {
  beforeEach(() => {
    clearMocks();
    localStorage.clear();
  });

  afterEach(() => {
    clearMocks();
  });

  describe("login()", () => {
    it("TC1.4.1: Login with valid credentials returns token", async () => {
      // Arrange
      const mockResponse = {
        success: true,
        idToken: "eyJhbGc...",
        refreshToken: "refresh...",
        user: {
          userId: 123,
          email: "admin@nexahr.vn",
          tenantId: 123,
          roles: ["system_admin"],
        },
      };
      mockFetch("POST", "/api/auth/login", 200, mockResponse);

      // Act
      const result = await authService.login("admin@nexahr.vn", "Password123");

      // Assert
      expect(result.idToken).toBeDefined();
      expect(result.user?.tenantId).toBe(123);
      // Note: authService in this codebase doesn't seem to store token in localStorage directly in login()
      // but through applyAuthResponse which sets a session marker.
    });

    it("TC1.4.2: Login with invalid credentials throws error", async () => {
      // Arrange
      mockFetch("POST", "/api/auth/login", 401, {
        success: false,
        message: "Invalid credentials",
      });

      // Act
      const result = await authService.login("admin@nexahr.vn", "WrongPassword");

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");
    });

    it("TC1.4.3: Login response includes valid JWT claims", async () => {
      // Arrange
      const validJWT =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtMTIzIiwicm9sZXMiOlsiYWRtaW4iXX0.signature";
      mockFetch("POST", "/api/auth/login", 200, {
        success: true,
        idToken: validJWT,
        user: { userId: 1, tenantId: 123 },
      });

      // Act
      const result = await authService.login("admin@nexahr.vn", "Password123");

      // Assert
      const decoded = decodeJWT(result.idToken!);
      expect(decoded.tenant_id).toBe("tenant-123");
      expect(decoded.roles).toContain("admin");
    });
  });

  describe("getCurrentUser()", () => {
    it("TC1.4.4: Get current user returns user with scopes", async () => {
      // Arrange
      // First we need to mock the response for checkAuth() or set the session
      const mockUser = {
        userId: 123,
        email: "admin@nexahr.vn",
        tenantId: 123,
        roles: ["system_admin"],
        scopeLevel: "TENANT",
      };
      
      mockFetch("GET", "/api/auth/me", 200, mockUser);

      // Act
      const user = await authService.checkAuth();

      // Assert
      expect(user?.tenantId).toBe(123);
      expect(user?.scopeLevel).toBe("TENANT");
    });
  });

  describe("logout()", () => {
    it("TC1.4.6: Logout revokes session server-side", async () => {
      // Arrange
      let logoutCalled = false;
      mockFetch("POST", "/api/auth/logout", 200, () => {
        logoutCalled = true;
        return { success: true };
      });

      // Act
      await authService.logout();

      // Assert
      expect(logoutCalled).toBe(true);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});
