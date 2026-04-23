import { describe, it, expect, beforeEach } from "vitest";
import { authorizationService } from "../authorizationService";
import { mockFetch } from "../../test-utils/fetch-mock";

describe("AuthorizationService", () => {
  beforeEach(() => {
    localStorage.setItem("token", "valid-token");
  });

  describe("Role Management", () => {
    it("TC1.5.1: getRoles() returns list of roles", async () => {
      // Arrange
      const mockRoles = [
        { id: 1, name: "Admin", description: "System Admin", isSystemRole: true, isActive: true },
        { id: 2, name: "Manager", description: "Department Manager", isSystemRole: false, isActive: true },
      ];
      mockFetch("GET", "/api/auth-mgmt/roles", 200, mockRoles);

      // Act
      const roles = await authorizationService.getRoles();

      // Assert
      expect(roles.length).toBe(2);
      expect(roles[0].name).toBe("Admin");
    });

    it("TC1.5.2: getRoleById() returns specific role", async () => {
      // Arrange
      const mockRole = {
        id: 1,
        name: "Admin",
        description: "System Admin",
        isSystemRole: true,
        isActive: true
      };
      mockFetch("GET", "/api/auth-mgmt/roles/1", 200, mockRole);

      // Act
      const role = await authorizationService.getRoleById(1);

      // Assert
      expect(role?.id).toBe(1);
      expect(role?.name).toBe("Admin");
    });

    it("TC1.5.3: createRole() creates new role", async () => {
      // Arrange
      const newRole = {
        name: "Supervisor",
        description: "Team Supervisor",
      };
      mockFetch("POST", "/api/auth-mgmt/roles", 201, {
        id: 4,
        ...newRole,
        isSystemRole: false,
        isActive: true
      });

      // Act
      const result = await authorizationService.createRole(newRole);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe("Supervisor");
    });

    it("TC1.5.4: updateRole() updates existing role", async () => {
      // Arrange
      const updateData = {
        name: "Super Admin",
      };
      mockFetch("PUT", "/api/auth-mgmt/roles/1", 200, {
        id: 1,
        name: "Super Admin",
        isSystemRole: true,
        isActive: true
      });

      // Act
      const result = await authorizationService.updateRole(1, updateData);

      // Assert
      expect(result.name).toBe("Super Admin");
    });

    it("TC1.5.5: deleteRole() removes role", async () => {
      // Arrange
      mockFetch("DELETE", "/api/auth-mgmt/roles/4", 200, { success: true });

      // Act
      const result = await authorizationService.deleteRole(4);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("Permission Management", () => {
    it("TC1.5.6: getRolePermissions() lists permissions", async () => {
      // Arrange
      const mockPermissions = [
        { id: 1, resource: "employee", action: "read", name: "Read Employee" },
        { id: 2, resource: "employee", action: "create", name: "Create Employee" },
      ];
      mockFetch(
        "GET",
        "/api/auth-mgmt/roles/1/permissions",
        200,
        mockPermissions,
      );

      // Act
      const permissions = await authorizationService.getRolePermissions(1);

      // Assert
      expect(permissions.length).toBe(2);
      expect(permissions[0].resource).toBe("employee");
    });

    it("TC1.5.7: updateRolePermissions() updates permissions", async () => {
      // Arrange
      const newPermissions = [
        { permissionId: 1, granted: true },
        { permissionId: 2, granted: false },
      ];
      mockFetch("PUT", "/api/auth-mgmt/roles/1/permissions", 200, {
        success: true
      });

      // Act
      const result = await authorizationService.updateRolePermissions(1, newPermissions);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("User Role Management", () => {
    it("TC1.5.9: assignUserRole() assigns role to user", async () => {
      // Arrange
      mockFetch("POST", "/api/auth-mgmt/user-roles/assign", 200, {
        id: 1,
        userId: 123,
        roleId: 2,
        assignedAt: new Date().toISOString()
      });

      // Act
      const result = await authorizationService.assignUserRole(123, 2);

      // Assert
      expect(result.userId).toBe(123);
      expect(result.roleId).toBe(2);
    });

    it("TC1.5.10: getUserRoles() lists user role assignments", async () => {
      // Arrange
      const mockUserRoles = [
        {
          id: 1,
          userId: 123,
          roleId: 1,
          role: { name: "Admin" },
          assignedAt: new Date().toISOString()
        },
      ];
      mockFetch(
        "GET",
        "/api/auth-mgmt/user-roles/123",
        200,
        mockUserRoles,
      );

      // Act
      const userRoles = await authorizationService.getUserRoles(123);

      // Assert
      expect(userRoles.length).toBe(1);
      expect(userRoles[0].userId).toBe(123);
    });
  });

  describe("Error Handling", () => {
    it("TC1.5.12: null returned for missing role", async () => {
      // Arrange
      mockFetch("GET", "/api/auth-mgmt/roles/999", 404, {
        error: "Role not found",
      });

      // Act
      const role = await authorizationService.getRoleById(999);

      // Assert
      expect(role).toBeNull();
    });
  });
});
