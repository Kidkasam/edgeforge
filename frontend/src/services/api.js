import axios from 'axios';

const getBaseURL = () => {
    // Check if we are running locally or in production
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:8000/api/';
    }
    // Production Render URL
    return 'https://edgeforge-ct0r.onrender.com/api/';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Add a response interceptor for debugging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authService = {
    login: async (username, password) => {
        const response = await api.post('auth/token/', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    register: async (userData) => {
        return api.post('auth/register/', userData);
    },
};

export const tradeService = {
    getOverview: async () => {
        const response = await api.get('overview/');
        return response.data;
    },
    getStatistics: async () => {
        const response = await api.get('statistics/');
        return response.data;
    },
    getTrades: async (params) => {
        const response = await api.get('trades/', { params });
        return response.data;
    },
    createTrade: async (tradeData) => {
        const response = await api.post('trades/', tradeData);
        return response.data;
    },
    updateTrade: async (id, tradeData) => {
        const response = await api.put(`trades/${id}/`, tradeData);
        return response.data;
    },
    deleteTrade: async (id) => {
        const response = await api.delete(`trades/${id}/`);
        return response.data;
    },
};

export const strategyService = {
    getStrategies: async () => {
        const response = await api.get('strategies/');
        return response.data;
    },
    createStrategy: async (strategyData) => {
        const response = await api.post('strategies/', strategyData);
        return response.data;
    },
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('user/');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('user/', data);
        return response.data;
    },
};

export default api;
