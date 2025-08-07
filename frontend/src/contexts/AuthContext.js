import React, { createContext, useState, useContext, useEffect } from 'react';
import { register as registerUser, login as loginUser, logout as logoutUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const user = getCurrentUser();
    if (user) {
      setUser(user);
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const data = await registerUser(userData);
      setUser(data);
      return data;
    } catch (err) {
      console.error('Registration error in context:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await loginUser(credentials);
      setUser(data);
      return data;
    } catch (err) {
      console.error('Login error in context:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      throw err;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 