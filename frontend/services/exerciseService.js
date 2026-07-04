import api from './api';

/**
 * GET /exercises
 * Optional query params: q, category, difficulty, muscle, equipment
 */
export const getExercises = (params = {}) => api.get('/exercises', { params });

/**
 * GET /exercises/:id
 */
export const getExerciseById = (id) => api.get(`/exercises/${id}`);

/**
 * POST /exercises/seed
 */
export const seedExercises = () => api.post('/exercises/seed');

/**
 * POST /ai-coach/exercise
 * data: { exerciseId, message, history }
 */
export const askExerciseCoach = (data) => api.post('/ai-coach/exercise', data);
