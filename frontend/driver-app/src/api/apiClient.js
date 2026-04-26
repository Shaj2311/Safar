import axios from 'axios';

const BASE_URL = '/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// The NEW interceptor that fixes the 422 errors based on Haider's API
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
        // We REMOVED the 'Headers' logic. 
        // We ADDED this 'params' logic to send ?sessionKey=token
        config.params = {
            ...config.params,
            sessionKey: token
        };
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});