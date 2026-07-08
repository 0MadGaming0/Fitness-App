/**
 * useWorkouts.js
 * Encapsulates all workout CRUD operations with loading/error state.
 */
import { useState, useCallback } from 'react';
import {
  getWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
} from '../services/workoutService';
import toast from 'react-hot-toast';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getWorkouts();
      setWorkouts(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workouts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkout = useCallback(async (workoutData) => {
    try {
      await addWorkout(workoutData);
      toast.success('Workout added!');
      await fetchWorkouts();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add workout');
      return false;
    }
  }, [fetchWorkouts]);

  const editWorkout = useCallback(async (id, workoutData) => {
    try {
      await updateWorkout(id, workoutData);
      toast.success('Workout updated!');
      await fetchWorkouts();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update workout');
      return false;
    }
  }, [fetchWorkouts]);

  const removeWorkout = useCallback(async (id) => {
    try {
      await deleteWorkout(id);
      toast.success('Workout deleted');
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workout');
      return false;
    }
  }, []);

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
    createWorkout,
    editWorkout,
    removeWorkout,
  };
}
