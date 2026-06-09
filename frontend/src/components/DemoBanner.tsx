import React from 'react'
import { colors } from '../lib/design'

export const DemoBanner: React.FC = () => {
  return (
    <div 
      className="w-full py-2 px-4 text-center text-xs font-semibold uppercase tracking-widest sticky top-0 z-40"
      style={{ backgroundColor: colors.accent.gold, color: colors.bg.primary }}
    >
      You're viewing a demo with sample data. Sign in to upload your own documents.
    </div>
  )
}
