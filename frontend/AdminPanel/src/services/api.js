import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// attaches sessionKey to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('safar_admin_token');
    if (token) {
      config.params = { ...config.params, sessionKey: token };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
