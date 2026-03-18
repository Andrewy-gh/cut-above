export const ROLES = ["client", "employee", "admin"] as const;

export type Role = (typeof ROLES)[number];
