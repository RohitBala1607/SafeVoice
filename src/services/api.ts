const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const isFormData = options.body instanceof FormData;

        const headers = {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        } as Record<string, string>;

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw { response: { data: error } };
        }

        return { data: await response.json() };
    },

    get(endpoint: string, options?: RequestInit) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint: string, data: any, options?: RequestInit) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        });
    },

    patch(endpoint: string, data: any, options?: RequestInit) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data),
        });
    },
};

export default api;
