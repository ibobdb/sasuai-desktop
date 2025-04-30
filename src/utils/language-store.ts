/**
 * Safe wrapper around electron-store for language preferences
 * Uses the preload script's IPC bridge instead of direct Node.js access
 */
export const languageStore = {
  get: async (): Promise<string> => {
    try {
      return await window.api.language.get()
    } catch (error) {
      console.error('Failed to get language preference:', error)
      return 'en' // Default to English on error
    }
  },

  set: async (lang: string): Promise<void> => {
    try {
      await window.api.language.set(lang)
    } catch (error) {
      console.error('Failed to save language preference:', error)
    }
  }
}
