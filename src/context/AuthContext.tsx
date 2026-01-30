import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mockUser } from '../data/mockData';
import { rankTiers } from '../data/mockData';
import apiService from '../services/api';

interface RegisterData {
  firstName: string;
  lastName: string;
  phone?: string;
  barangay?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('safezoneph_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const calculateRank = (points: number): string => {
    for (let i = rankTiers.length - 1; i >= 0; i--) {
      if (points >= rankTiers[i].minPoints) {
        return rankTiers[i].name;
      }
    }
    return rankTiers[0].name;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login({ email, password });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        apiService.setToken(response.data.access_token);
        const userData = {
          ...response.data.user,
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          isVerified: response.data.user.is_verified,
          createdAt: response.data.user.created_at,
          skills: []
        };
        setUser(userData);
        localStorage.setItem('safezoneph_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Login failed');
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.register({
        email,
        password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        barangay: userData.barangay,
        city: userData.city,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        apiService.setToken(response.data.access_token);
        const newUserData = {
          ...response.data.user,
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          isVerified: response.data.user.is_verified,
          createdAt: response.data.user.created_at,
          skills: []
        };
        setUser(newUserData);
        localStorage.setItem('safezoneph_user', JSON.stringify(newUserData));
        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Registration failed');
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    apiService.clearToken();
    localStorage.removeItem('safezoneph_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      
      // If points are being updated, also update rank
      if (userData.points !== undefined) {
        const newRank = calculateRank(userData.points);
        if (newRank !== user.rank) {
          updatedUser.rank = newRank;
          // Could add rank up notification here
        }
      }
      
      setUser(updatedUser);
      localStorage.setItem('safezoneph_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
