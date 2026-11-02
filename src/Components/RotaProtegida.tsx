import { Navigate, useLocation } from 'react-router-dom'
import { getHomeRoute, getUserRole, type UserRole } from '../services/auth'
import type { ReactNode } from 'react'

interface Props {
  permitidos: UserRole[]
  children: ReactNode
  redirecionar?: string
}

function RotaProtegida({ permitidos, children, redirecionar }: Props) {
  const location = useLocation()
  const role = getUserRole()

  if (!permitidos.includes(role)) {
    const destino = redirecionar ?? (role === 'visitante' ? '/login' : getHomeRoute(role))
    if (destino !== location.pathname) {
      return <Navigate to={destino} replace state={{ from: location.pathname }} />
    }
  }

  return <>{children}</>
}

export default RotaProtegida
