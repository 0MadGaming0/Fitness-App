import api from './api';

/** GET /profile */
export const getProfile = () => api.get('/profile');

/** PUT /profile */
export const updateProfile = (data) => api.put('/profile', data);
