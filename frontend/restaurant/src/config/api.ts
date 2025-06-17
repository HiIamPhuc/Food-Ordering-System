export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${import.meta.env.VITE_API_URL}/auth/login/`,
    REGISTER: `${import.meta.env.VITE_API_URL}/auth/register/`,
    LOGOUT: `${import.meta.env.VITE_API_URL}/auth/logout/`,
    REFRESH: `${import.meta.env.VITE_API_URL}/auth/refresh/`,
    CHANGE_PASSWORD: `${import.meta.env.VITE_API_URL}/auth/change-password/`,
  },
  // User endpoints
  USER: {
    PROFILE: `${import.meta.env.VITE_API_URL}/users/profile/`,
    STATS: `${import.meta.env.VITE_API_URL}/users/stats/`,
  },
  // Menu endpoints
  MENU: {
    BASE: `${import.meta.env.VITE_MENU_SERVICE_URL}/api/menu`,
    ITEM: (id: string) => `${import.meta.env.VITE_MENU_SERVICE_URL}/api/menu/${id}`,
  },
  // Order endpoints
  ORDER: {
    BASE: `${import.meta.env.VITE_ORDER_SERVICE_URL}/api/orders`,
    USER: (userId: string) => `${import.meta.env.VITE_ORDER_SERVICE_URL}/api/orders/user/${userId}`,
    ITEM: (id: string) => `${import.meta.env.VITE_ORDER_SERVICE_URL}/api/orders/${id}`,
  },
}; 