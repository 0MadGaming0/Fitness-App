import api from './api';

/**
 * POST /ai-coach
 * @param {Object} data - { goal, age, weight, history }
 * history is the full [{role, content}] array so the backend has full context.
 */
export const askAICoach = (data) => api.post('/ai-coach', data);
