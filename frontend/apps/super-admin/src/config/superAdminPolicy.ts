import type { User } from "../services/superAdminAuthService";

const DEFAULT_SUPER_ADMIN_EMAILS = ["admin@nexahrm.com"];
const SUPER_ADMIN_ROLE_KEYS = [
  "admin",
  "superadmin",
  "super admin",
  "quan tri",
] as const;

const normalizeValue = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const configuredEmails = String(import.meta.env.VITE_SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => normalizeValue(value))
  .filter(Boolean);

export const allowedSuperAdminEmails =
  configuredEmails.length > 0
    ? configuredEmails
    : DEFAULT_SUPER_ADMIN_EMAILS.map(normalizeValue);

const hasAllowedRole = (user: User | null | undefined): boolean => {
  if (!user?.roles?.length) {
    return false;
  }

  return user.roles.some((role) => {
    const normalizedRole = normalizeValue(role);
    return SUPER_ADMIN_ROLE_KEYS.some(
      (allowedRole) => normalizeValue(allowedRole) === normalizedRole,
    );
  });
};

export const isSuperAdminAccount = (
  user: User | null | undefined,
): boolean => {
  if (!user?.email) {
    return false;
  }

  return (
    allowedSuperAdminEmails.includes(normalizeValue(user.email)) &&
    hasAllowedRole(user)
  );
};
