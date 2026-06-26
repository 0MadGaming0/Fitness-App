import api from './api';

/** POST /workout */
export const addWorkout = (data) => api.post('/workout', data);

/** GET /workouts */
export const getWorkouts = () => api.get('/workouts');

/** PUT /workout/:id */
export const updateWorkout = (id, data) => api.put(`/workout/${id}`, data);

/** DELETE /workout/:id */
export const deleteWorkout = (id) => api.delete(`/workout/${id}`);
