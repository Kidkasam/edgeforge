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
    timeout: 45000, // Prevent hanging forever during cold starts
});

// Response interceptor with graceful auth expiration recovery
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status,
            data: error.response?.data,
            message: error.message
        });

        // Clear invalid/expired token so user is not stuck in a broken loop
        if (status === 401 || status === 403) {
            const hadToken = !!localStorage.getItem('token');
            const isLoginAttempt = error.config?.url?.includes('auth/token/');
            if (hadToken && !isLoginAttempt) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.dispatchEvent(new CustomEvent('auth:expired'));
            }
        }

        return Promise.reject(error);
    }
);

// Request interceptor to attach auth token
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

// Non-blocking background ping to spin up Render free tier if it is asleep
export const warmupBackend = () => {
    try {
        const rootUrl = getBaseURL().replace('/api/', '/');
        fetch(rootUrl, { mode: 'no-cors' }).catch(() => {});
    } catch (_) {}
};

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
        localStorage.removeItem('username');
    },
    register: async (userData) => {
        return api.post('auth/register/', userData);
    },
};

export const tradeService = {
    getOverview: async (params) => {
        const response = await api.get('overview/', { params });
        return response.data;
    },
    getStatistics: async (params) => {
        const response = await api.get('statistics/', { params });
        return response.data;
    },
    getAccountsSummary: async () => {
        const response = await api.get('accounts-summary/');
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
        const response = await api.patch(`trades/${id}/`, tradeData);
        return response.data;
    },
    deleteTrade: async (id) => {
        const response = await api.delete(`trades/${id}/`);
        return response.data;
    },
    bulkDeleteTrades: async (ids) => {
        const response = await api.post('trades/bulk-delete/', { ids });
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
