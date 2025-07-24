export const languageStore = {
  get: async (): Promise<string> => {
    try {
      return await window.api.language.get()
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Failed to get language preference:', error)
      return 'en' // Default to English on error
    }
  },

  set: async (lang: string): Promise<void> => {
    try {
      await window.api.language.set(lang)
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Failed to save language preference:', error)
    }
  }
}
