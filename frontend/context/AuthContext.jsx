/**
 * AuthContext.jsx
 * Provides authentication state (user, token) + login/logout helpers.
 * Persists state in localStorage under 'fitai_token' / 'fitai_user'.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../services/profileService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fitai_token') || null);
  const [loading, setLoading] = useState(true);

  // On mount, if token exists — fetch profile to hydrate user state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fitai_token');
      if (storedToken) {
        try {
          const { data } = await getProfile();
          setUser(data);
          setToken(storedToken);
        } catch {
          // Token invalid/expired — clear it
          localStorage.removeItem('fitai_token');
          localStorage.removeItem('fitai_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Called after successful login.
   * Stores token and fetches user profile.
   */
  const loginUser = useCallback(async (newToken) => {
    localStorage.setItem('fitai_token', newToken);
    setToken(newToken);
    try {
      const { data } = await getProfile();
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  /**
   * Clears all auth state and redirects to login.
   */
  const logoutUser = useCallback(() => {
    localStorage.removeItem('fitai_token');
    localStorage.removeItem('fitai_user');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Refreshes the user profile from backend.
   */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    loginUser,
    logoutUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
