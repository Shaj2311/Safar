import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(
  (config) => {
    // The OpenAPI spec shows sessionKey in query parameters
    const token = localStorage.getItem('safar_admin_token');
    if (token) {
      config.params = { ...config.params, sessionKey: token };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
