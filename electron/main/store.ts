import Store from 'electron-store'
import { AUTH_STORE_TOKEN_KEY, AUTH_STORE_USER_KEY } from './constants'
import { store } from './index'

// Create a typed schema for better TypeScript support
export interface StoreSchema {
  [AUTH_STORE_TOKEN_KEY]?: string
  [AUTH_STORE_USER_KEY]?: string
  language?: string
  [key: string]: unknown
}

// Use the typed store
export const getTypedStore = (): Store<StoreSchema> => {
  return store as Store<StoreSchema>
}
