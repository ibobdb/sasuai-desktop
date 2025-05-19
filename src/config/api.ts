export const API_BASE_URL = 'https://sasuai.blastify.tech/api'

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN_EMAIL: `${API_BASE_URL}/auth/sign-in/email`,
    SIGN_IN_USERNAME: `${API_BASE_URL}/auth/sign-in/username`,
    SIGN_OUT: `${API_BASE_URL}/auth/sign-out`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forget-password`,
    VALIDATE_SESSION: `${API_BASE_URL}/auth/get-session`
  },
  PRODUCTS: {
    BASE: `${API_BASE_URL}/products`
  },
  MEMBERS: {
    BASE: `${API_BASE_URL}/members`,
    CALCULATE_POINTS: `${API_BASE_URL}/members/calculatePoints`
  },
  TRANSACTIONS: {
    BASE: `${API_BASE_URL}/transactions`
  },
  REWARDS: {
    BASE: `${API_BASE_URL}/rewards`,
    CLAIM: `${API_BASE_URL}/rewards/claim`
  },
  DISCOUNTS: {
    BASE: `${API_BASE_URL}/discount`
  }
}
