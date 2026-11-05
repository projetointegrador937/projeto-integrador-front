export type UserRole = 'visitante' | 'usuario' | 'barbeiro' | 'barbearia'

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as Record<string, unknown>
  } catch {
    return null
  }
}

function normalizeRole(value: unknown): UserRole {
  const role = String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]/g, '')

  if (['2', 'barbeiro', 'barber', 'funcionario', 'employee'].includes(role)) return 'barbeiro'
  if (['3', 'barbearia', 'estabelecimento', 'business', 'owner', 'proprietario', 'barbershop', 'barbershopowner'].includes(role)) return 'barbearia'
  if (['1', '4', 'usuario', 'user', 'cliente', 'client', 'customer'].includes(role)) return 'usuario'
  return 'visitante'
}

function getRoleClaim(claims: Record<string, unknown>): unknown {
  const roleClaim = claims.role
    ?? claims.Role
    ?? claims.tipo
    ?? claims.userType
    ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

  return Array.isArray(roleClaim) ? roleClaim[0] : roleClaim
}

export function getUserEmail(): string | undefined {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (!token) return undefined
  const claims = decodePayload(token)
  const email = claims?.email ?? claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
  return typeof email === 'string' && email.trim() ? email.trim() : undefined
}

export function getUserName(): string {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (!token) return 'Usuário'
  const claims = decodePayload(token)
  const name = claims?.name ?? claims?.nome ?? claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
  return typeof name === 'string' && name.trim() ? name.trim() : 'Usuário'
}

export function getUserRole(): UserRole {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (!token) return 'visitante'
  const claims = decodePayload(token)
  return claims ? normalizeRole(getRoleClaim(claims)) : 'visitante'
}

export function isAuthenticated() {
  return getUserRole() !== 'visitante'
}
