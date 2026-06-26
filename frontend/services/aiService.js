import api from './api';

/**
 * POST /ai-coach
 * @param {Object} data - { goal, age, weight, message }
 * message is appended to the system prompt on the backend
 */
export const askAICoach = (data) => api.post('/ai-coach', data);
