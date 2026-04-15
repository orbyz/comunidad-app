export type Role = "SUPER_ADMIN" | "ADMIN" | "JUNTA" | "RESIDENTE";

export function hasRole(userRole: Role, allowed: Role[]) {
  return allowed.includes(userRole);
}
