/**
 * useProfile.js
 * Fetches and updates the user profile.
 */
import { useState, useCallback } from 'react';
import { getProfile, updateProfile } from '../services/profileService';
import toast from 'react-hot-toast';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProfile();
      setProfile(data);
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (data) => {
    try {
      await updateProfile(data);
      setProfile((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      return false;
    }
  }, []);

  return { profile, loading, fetchProfile, saveProfile };
}
