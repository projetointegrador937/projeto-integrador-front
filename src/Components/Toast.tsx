import { useEffect } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timeout)
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span>{type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</span>
      <p>{message}</p>
      <button type="button" onClick={onClose} aria-label="Fechar mensagem">
        ×
      </button>
    </div>
  )
}
