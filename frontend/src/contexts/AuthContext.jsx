import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
           const parsedData = JSON.parse(storedUser);
           setUser(parsedData.user ? parsedData.user : parsedData);
        } else {
           // In future, could call authService.getCurrentUser() if session cookie exists
        }
      } catch (e) {
        console.error('Failed to init auth', e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data));
      return data.user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (role, name, email, password, company) => {
    setLoading(true);
    try {
      const data = await authService.register(role, name, email, password, company);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data));
      return data.user;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (token) => {
    setLoading(true);
    try {
      const data = await authService.loginWithToken(token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data));
      return data.user;
    } catch (error) {
      console.error("Login with token failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
       console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};