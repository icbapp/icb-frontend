import axios from 'axios'

const apiAdminInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://masteradmin.icbapp.site/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Optional: Add token automatically if available
apiAdminInstance.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }


  return config
})

export const api = apiAdminInstance;


// let apiAdminInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://masteradmin.icbapp.site/api',
// });
// apiAdminInstance.interceptors.request.use(
//   async config => {
//     const token = localStorage.getItem('auth_token');
//     // const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     config.headers['ngrok-skip-browser-warning'] = 'true'
//     return config;
//   },
//   error => Promise.reject(error)
// );

// apiAdminInstance.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   error => {
//     const { response } = error;
//     console.log("throw", response);
//     // if (response.status === 401) {
//     //   localStorage.removeItem('auth_token');
//     //   window.location.href = '/login';
//     // }
//     if (response.status === 500 || 401) {
//       localStorage.removeItem('auth_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );


// export const api = apiAdminInstance;



