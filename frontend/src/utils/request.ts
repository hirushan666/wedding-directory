// src/utils/request.ts

import axios from 'axios';

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', // Set the base URL here
    withCredentials: true,            // Include cookies in every request
    headers: {
        'Content-Type': 'application/json',
    },
});

request.interceptors.request.use((config) => {
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split('; ');
        const vendorCookie = cookies.find((row) => row.startsWith('access_tokenVendor='));
        const visitorCookie = cookies.find((row) => row.startsWith('access_token='));
        const token = vendorCookie?.split('=')[1] || visitorCookie?.split('=')[1];
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default request;
