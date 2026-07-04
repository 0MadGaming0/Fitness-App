import api from './api';

/** POST /workout */
export const addWorkout = (data) => api.post('/workout', data);

/** GET /workouts */
export const getWorkouts = () => api.get('/workouts');

/** PUT /workout/:id */
export const updateWorkout = (id, data) => api.put(`/workout/${id}`, data);

/** DELETE /workout/:id */
export const deleteWorkout = (id) => api.delete(`/workout/${id}`);

/** POST /workout/start */
export const startSession = (data) => api.post('/workout/start', data);

/** POST /workout/complete-set */
export const completeSet = (data) => api.post('/workout/complete-set', data);

/** POST /workout/finish */
export const finishWorkout = (data) => api.post('/workout/finish', data);

/** POST /workout/skip */
export const skipWorkout = (data) => api.post('/workout/skip', data);

/** GET /dashboard/summary */
export const getDashboardSummary = () => api.get('/dashboard/summary');

/** GET /analytics/detailed */
export const getDetailedAnalytics = () => api.get('/analytics/detailed');

/** GET /calendar */
export const getCalendar = () => api.get('/calendar');

/** GET /goals */
export const getGoals = () => api.get('/goals');

/** PUT /goals */
export const updateGoals = (data) => api.put('/goals', data);

/** GET /notifications */
export const getNotifications = () => api.get('/notifications');

/** POST /feedback */
export const submitFeedback = (data) => api.post('/feedback', data);
