import axios from 'axios';

// Use localhost for development, change to your backend IP if needed
const API_BASE_URL = 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  adminLogin: (email, password) => api.post('/login', { email, password }),
  
  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  getRevenueData: (period) => api.get(`/dashboard/revenue?period=${period}`),
  
  // Users
  getUsers: (page = 1, limit = 10, search = '') => 
    api.get('/users', { params: { page, limit, search } }),
  getUserDetails: (userId) => api.get(`/users/${userId}`),
  updateUserStatus: (userId, status, reason = '') => 
    api.put(`/users/${userId}/status`, { status, reason }),
  
  // Drivers
  getDrivers: () => api.get('/drivers'),
  getDriverDetails: (driverId) => api.get(`/drivers/${driverId}`),
  verifyDriver: (driverId, status, reason = '') => 
    api.put(`/drivers/${driverId}/verify`, { status, reason }),
  
  // Rides
  getRides: (page = 1, limit = 10, filters = {}) => 
    api.get('/rides', { params: { page, limit, ...filters } }),
  cancelRide: (rideId, reason) => api.put(`/rides/${rideId}/cancel`, { reason }),
  
  // Commission
  getCommissionSettings: () => api.get('/commission'),
  updateCommissionSettings: (settings) => api.put('/commission', settings),
  
  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
  
  // Vehicles (mock for now - implement backend endpoints as needed)
  getVehicles: () => Promise.resolve({ data: { vehicles: [] } }),
  addVehicle: (data) => Promise.resolve({ data: { success: true } }),
  updateVehicle: (id, data) => Promise.resolve({ data: { success: true } }),
  deleteVehicle: (id) => Promise.resolve({ data: { success: true } }),
  
  // Payouts (mock)
  getPayouts: () => Promise.resolve({ data: { payouts: [] } }),
  processPayout: (id) => Promise.resolve({ data: { success: true } }),
  
  // Reports (mock)
  generateReport: (type, start, end) => Promise.resolve({ data: {} }),
};

export default api;