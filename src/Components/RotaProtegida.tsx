import { Navigate } from 'react-router-dom'
import { getUserRole, type UserRole } from '../services/auth'
import type { ReactNode } from 'react'

interface Props {
  permitidos: UserRole[]
  children: ReactNode
  redirecionar?: string
}

function RotaProtegida({ permitidos, children, redirecionar = '/' }: Props) {
  const role = getUserRole()
  if (!permitidos.includes(role)) {
    return <Navigate to={redirecionar} replace />
  }
  return <>{children}</>
}

export default RotaProtegida
