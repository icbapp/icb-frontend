import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://masteradmin.icbapp.site/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Optional: Add token automatically if available
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }


  return config
})

export default api



