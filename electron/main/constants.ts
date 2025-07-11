export const COOKIE_DOMAIN = 'sasuai.blastify.tech'
export const AUTH_COOKIE_NAME = 'better-auth.session_token'
export const USER_DATA_COOKIE_NAME = 'better-auth.session_data'

export const AUTH_STORE_TOKEN_KEY = 'auth.token'
export const AUTH_STORE_USER_KEY = 'auth.user'

export const COOKIE_CONFIG = {
  SECURE_PREFIX: '__Secure-',
  DEFAULT_SAMSITE: 'strict' as const,
  DEFAULT_PATH: '/',
  DEFAULT_HTTPONLY: true,
  DEFAULT_SECURE: true
}
