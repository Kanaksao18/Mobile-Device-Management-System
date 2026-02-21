import axios from 'axios'

const TOKEN_KEY = 'mdm_token'

let unauthorizedHandler = null

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (unauthorizedHandler) {
        unauthorizedHandler()
      } else {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
export default api
