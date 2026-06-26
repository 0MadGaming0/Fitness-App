import api from './api';

/** POST /register */
export const register = (data) => api.post('/register', data);

/** POST /login — returns { message, token } */
export const login = (data) => api.post('/login', data);

/** POST /change-password */
export const changePassword = (data) => api.post('/change-password', data);
