import type { AuthTokenPayload, User } from "./types"

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = normalized.length % 4
  const padded =
    padding === 0
      ? normalized
      : normalized.padEnd(normalized.length + (4 - padding), "=")

  return atob(padded)
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown
  } catch {
    throw new Error("Access token payload bukan JSON yang valid")
  }
}

export function decodeAccessToken(token: string): AuthTokenPayload {
  const segments = token.split(".")

  if (segments.length !== 3) {
    throw new Error("Format access token tidak valid")
  }

  const payload = parseJson(decodeBase64Url(segments[1]))
  const parsedPayload =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : null

  if (
    parsedPayload === null ||
    typeof parsedPayload.sub !== "string" ||
    typeof parsedPayload.id !== "string" ||
    typeof parsedPayload.name !== "string" ||
    !Array.isArray(parsedPayload.roles) ||
    !parsedPayload.roles.every(
      (role: unknown) => typeof role === "string",
    ) ||
    !Array.isArray(parsedPayload.permissions) ||
    !parsedPayload.permissions.every(
      (permission: unknown) => typeof permission === "string",
    ) ||
    typeof parsedPayload.exp !== "number" ||
    typeof parsedPayload.iat !== "number"
  ) {
    throw new Error("Payload access token tidak valid")
  }

  const role =
    typeof parsedPayload.role === "string" ||
    parsedPayload.role === null
      ? parsedPayload.role
      : null

  const unitKerjaId =
    typeof parsedPayload.unitKerjaId === "string" ||
    parsedPayload.unitKerjaId === null
      ? parsedPayload.unitKerjaId
      : null

  return {
    sub: parsedPayload.sub,
    id: parsedPayload.id,
    name: parsedPayload.name,
    role,
    roles: parsedPayload.roles,
    unitKerjaId,
    permissions: parsedPayload.permissions,
    exp: parsedPayload.exp,
    iat: parsedPayload.iat,
  }
}

export function createUserFromToken(
  payload: AuthTokenPayload,
  overrides: Partial<User> = {},
): User {
  return {
    id: overrides.id ?? payload.id,
    username: overrides.username ?? payload.name,
    roles: overrides.roles ?? payload.roles,
    unitKerjaId:
      overrides.unitKerjaId ?? payload.unitKerjaId ?? null,
    bidangId: overrides.bidangId ?? null,
    opd: overrides.opd ?? null,
    pegawaiId: overrides.pegawaiId ?? null,
    pegawai: overrides.pegawai ?? null,
  }
}
