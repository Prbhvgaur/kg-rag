import React from 'react'
import { colors } from '../lib/design'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? colors.status.success : type === 'error' ? colors.status.error : colors.status.info

  return (
    <div 
      className="fixed top-4 right-4 p-4 rounded-lg shadow-2xl z-50 flex items-center justify-between min-w-[300px] animate-in slide-in-from-right fade-in"
      style={{ backgroundColor: bgColor, color: colors.text.primary }}
    >
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  )
}
