export const API_BASE_URL = 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN_EMAIL: `${API_BASE_URL}/auth/sign-in/email`,
    SIGN_IN_USERNAME: `${API_BASE_URL}/auth/sign-in/username`,
    SIGN_OUT: `${API_BASE_URL}/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`
  },
  PRODUCTS: {
    BASE: `${API_BASE_URL}/products`
  },
  MEMBERS: {
    BASE: `${API_BASE_URL}/members`
  }
}
