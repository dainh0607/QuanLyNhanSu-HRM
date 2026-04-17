import { API_URL, requestJson } from "./employee/core";

export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  role?: Role;
  assignedAt: string;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  granted: boolean;
}

// Mock data
const mockRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    description: "System Administrator",
    isSystemRole: true,
    isActive: true,
  },
  {
    id: 2,
    name: "Manager",
    description: "Manager",
    isSystemRole: true,
    isActive: true,
  },
  {
    id: 3,
    name: "Staff",
    description: "Staff",
    isSystemRole: true,
    isActive: true,
  },
];

const mockPermissions: Permission[] = [
  { id: 1, name: "View", resource: "employee", action: "read" },
  { id: 2, name: "Create", resource: "employee", action: "create" },
  { id: 3, name: "Edit", resource: "employee", action: "update" },
  { id: 4, name: "Delete", resource: "employee", action: "delete" },
];

export const authorizationService = {
  async getRoles(): Promise<Role[]> {
    try {
      return await requestJson<Role[]>(
        `${API_URL}/authorization/roles`,
        { method: "GET" },
        "Failed to fetch roles",
      );
    } catch {
      return mockRoles;
    }
  },

  async getRoleById(id: number): Promise<Role | null> {
    try {
      return await requestJson<Role>(
        `${API_URL}/authorization/roles/${id}`,
        { method: "GET" },
        `Failed to fetch role ${id}`,
      );
    } catch {
      return mockRoles.find((r) => r.id === id) || null;
    }
  },

  async createRole(data: Partial<Role>): Promise<Role> {
    try {
      return await requestJson<Role>(
        `${API_URL}/authorization/roles`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Failed to create role",
      );
    } catch (error) {
      console.error("Create role error:", error);
      throw error;
    }
  },

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    try {
      return await requestJson<Role>(
        `${API_URL}/authorization/roles/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
        `Failed to update role ${id}`,
      );
    } catch (error) {
      console.error("Update role error:", error);
      throw error;
    }
  },

  async deleteRole(id: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/authorization/roles/${id}`,
        { method: "DELETE" },
        `Failed to delete role ${id}`,
      );
    } catch (error) {
      console.error("Delete role error:", error);
      throw error;
    }
  },

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    try {
      return await requestJson<Permission[]>(
        `${API_URL}/authorization/roles/${roleId}/permissions`,
        { method: "GET" },
        `Failed to fetch permissions for role ${roleId}`,
      );
    } catch {
      return mockPermissions;
    }
  },

  async updateRolePermissions(
    roleId: number,
    permissions: Array<{ permissionId: number; granted: boolean }>,
  ): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/authorization/roles/${roleId}/permissions`,
        {
          method: "PUT",
          body: JSON.stringify({ permissions }),
        },
        `Failed to update permissions for role ${roleId}`,
      );
    } catch (error) {
      console.error("Update permissions error:", error);
      throw error;
    }
  },

  async getLookups(): Promise<any> {
    try {
      return await requestJson<any>(
        `${API_URL}/authorization/lookups`,
        { method: "GET" },
        "Failed to fetch authorization lookups",
      );
    } catch {
      return { roles: mockRoles, permissions: mockPermissions };
    }
  },

  async assignUserRole(userId: number, roleId: number): Promise<UserRole> {
    try {
      return await requestJson<UserRole>(
        `${API_URL}/authorization/user-roles/assign`,
        {
          method: "POST",
          body: JSON.stringify({ userId, roleId }),
        },
        "Failed to assign role",
      );
    } catch (error) {
      console.error("Assign role error:", error);
      throw error;
    }
  },

  async getUserRoles(userId: number): Promise<UserRole[]> {
    try {
      return await requestJson<UserRole[]>(
        `${API_URL}/authorization/user-roles/${userId}`,
        { method: "GET" },
        `Failed to fetch roles for user ${userId}`,
      );
    } catch {
      return [];
    }
  },

  async removeUserRole(userRoleId: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/authorization/user-roles/${userRoleId}`,
        { method: "DELETE" },
        `Failed to remove user role ${userRoleId}`,
      );
    } catch (error) {
      console.error("Remove user role error:", error);
      throw error;
    }
  },
};
