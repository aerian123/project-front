import { createContext, useContext } from 'react'

export type TextScale = 'standard' | 'large' | 'extra'

type AccessibilityContextValue = {
  textScale: TextScale
  setTextScale: (scale: TextScale) => void
  highContrast: boolean
  toggleHighContrast: () => void
  playAudioSummary: (text: string) => void
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityContext provider')
  }
  return context
}
