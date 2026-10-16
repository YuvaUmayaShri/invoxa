import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => 
    localStorage.getItem('invoxa_token') || localStorage.getItem('invoiceflow_token') || null
  );
  const [loading, setLoading] = useState(true);

  // Validate existing token on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('invoxa_token') || localStorage.getItem('invoiceflow_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.success && res.data) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('invoxa_token', receivedToken);
        localStorage.setItem('invoxa_user', JSON.stringify(receivedUser));
        // Reset welcome flag for this new login session
        sessionStorage.removeItem(`invoxa_welcome_${receivedUser._id}`);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/api/auth/register', formData);
      if (res.success && res.data) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('invoxa_token', receivedToken);
        localStorage.setItem('invoxa_user', JSON.stringify(receivedUser));
        sessionStorage.removeItem(`invoxa_welcome_${receivedUser._id}`);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser, message: res.message };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      return { success: false, error: err.message || 'Failed to create account. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/api/auth/logout', {});
      }
    } catch (e) {
      // Ignore logout request errors
    } finally {
      if (user?._id) {
        sessionStorage.removeItem(`invoxa_welcome_${user._id}`);
      }
      // Clear all possible session welcome flags
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('invoxa_welcome_')) {
          sessionStorage.removeItem(key);
        }
      });
      localStorage.removeItem('invoxa_token');
      localStorage.removeItem('invoxa_user');
      localStorage.removeItem('invoiceflow_token');
      localStorage.removeItem('invoiceflow_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('invoxa_user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
