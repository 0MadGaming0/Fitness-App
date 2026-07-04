import api from './api';

/** GET /profile */
export const getProfile = () => api.get('/profile');

/** PUT /profile — updates any subset of profile fields */
export const updateProfile = (data) => api.put('/profile', data);

/** PUT /profile — save avatar (base64 data URL or preset ID "avatar:N") */
export const uploadAvatar = (avatarData) => api.put('/profile', { avatar: avatarData });
