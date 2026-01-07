import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login action
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token }
      });

      return { success: true, data };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  }, []);

  // Register action
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token }
      });

      return { success: true, data };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  }, []);

  // Logout action
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // Update user profile
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  }, [state.user]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if token is valid
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Token invalid');
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: data.user, token }
      });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
