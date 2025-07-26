import React, { createContext, useContext, useEffect, useState } from 'react'
import { fonts } from '../config/fonts'

type Font = (typeof fonts)[number]

interface FontContextType {
  font: Font
  setFont: (font: Font) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [font, _setFont] = useState<Font>(() => {
    // Use synchronous check to avoid layout shifts
    if (typeof window === 'undefined') return 'opensans'

    try {
      const savedFont = localStorage.getItem('font')
      return fonts.includes(savedFont as Font) ? (savedFont as Font) : 'opensans'
    } catch {
      return 'opensans'
    }
  })

  useEffect(() => {
    const applyFont = (fontName: string) => {
      const root = document.documentElement

      // Remove existing font classes more efficiently
      const fontClasses = Array.from(root.classList).filter((cls) => cls.startsWith('font-'))
      root.classList.remove(...fontClasses)

      // Add new font class
      root.classList.add(`font-${fontName}`)
    }

    // Apply font with requestAnimationFrame to avoid blocking
    requestAnimationFrame(() => {
      applyFont(font)
    })
  }, [font])

  const setFont = (newFont: Font) => {
    try {
      localStorage.setItem('font', newFont)
      _setFont(newFont)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to save font preference:', error)
      }
      // Still update state even if localStorage fails
      _setFont(newFont)
    }
  }

  return <FontContext value={{ font, setFont }}>{children}</FontContext>
}

export const useFont = () => {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
