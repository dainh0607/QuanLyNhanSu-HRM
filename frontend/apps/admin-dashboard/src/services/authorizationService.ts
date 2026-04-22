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

export const authorizationService = {
  async getRoles(): Promise<Role[]> {
    try {
      return await requestJson<Role[]>(
        `${API_URL}/auth-mgmt/roles`,
        { method: "GET" },
        "Failed to fetch roles",
      );
    } catch {
      return [];
    }
  },

  async getRoleById(id: number): Promise<Role | null> {
    try {
      return await requestJson<Role>(
        `${API_URL}/auth-mgmt/roles/${id}`,
        { method: "GET" },
        `Failed to fetch role ${id}`,
      );
    } catch {
      return null;
    }
  },

  async createRole(data: Partial<Role>): Promise<Role> {
    return requestJson<Role>(
      `${API_URL}/auth-mgmt/roles`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      "Failed to create role",
    );
  },

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    return requestJson<Role>(
      `${API_URL}/auth-mgmt/roles/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      `Failed to update role ${id}`,
    );
  },

  async deleteRole(id: number): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>(
      `${API_URL}/auth-mgmt/roles/${id}`,
      { method: "DELETE" },
      `Failed to delete role ${id}`,
    );
  },

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    try {
      return await requestJson<Permission[]>(
        `${API_URL}/auth-mgmt/roles/${roleId}/permissions`,
        { method: "GET" },
        `Failed to fetch permissions for role ${roleId}`,
      );
    } catch {
      return [];
    }
  },

  async updateRolePermissions(
    roleId: number,
    permissions: Array<{ permissionId: number; granted: boolean }>,
  ): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>(
      `${API_URL}/auth-mgmt/roles/${roleId}/permissions`,
      {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      },
      `Failed to update permissions for role ${roleId}`,
    );
  },

  async getLookups(): Promise<{ roles: Role[]; permissions: Permission[] }> {
    try {
      return await requestJson<{ roles: Role[]; permissions: Permission[] }>(
        `${API_URL}/auth-mgmt/lookups`,
        { method: "GET" },
        "Failed to fetch authorization lookups",
      );
    } catch {
      return { roles: [], permissions: [] };
    }
  },

  async assignUserRole(userId: number, roleId: number): Promise<UserRole> {
    return requestJson<UserRole>(
      `${API_URL}/auth-mgmt/user-roles/assign`,
      {
        method: "POST",
        body: JSON.stringify({ userId, roleId }),
      },
      "Failed to assign role",
    );
  },

  async getUserRoles(userId: number): Promise<UserRole[]> {
    try {
      return await requestJson<UserRole[]>(
        `${API_URL}/auth-mgmt/user-roles/${userId}`,
        { method: "GET" },
        `Failed to fetch roles for user ${userId}`,
      );
    } catch {
      return [];
    }
  },

  async removeUserRole(userRoleId: number): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>(
      `${API_URL}/auth-mgmt/user-roles/${userRoleId}`,
      { method: "DELETE" },
      `Failed to remove user role ${userRoleId}`,
    );
  },
};
