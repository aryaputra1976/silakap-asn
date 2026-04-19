export type UserRole =
  | "ASN"
  | "OPERATOR"
  | "VERIFIKATOR"
  | "PPK"
  | "ADMIN_BKPSDM"
  | "SUPER_ADMIN"

export const rolePermissions: Record<UserRole, string[]> = {
  ASN: ["create", "submit", "view"],

  OPERATOR: ["create", "submit", "view"],

  VERIFIKATOR: ["verify", "reject"],

  PPK: ["approve", "reject"],

  ADMIN_BKPSDM: ["all"],

  SUPER_ADMIN: ["all"]

}
