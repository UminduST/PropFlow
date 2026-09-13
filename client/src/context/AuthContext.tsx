import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, UserRole } from '../types/index.js';
import { api } from '../utils/api.js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: SystemUser | null;
  setCurrentUser: (user: SystemUser | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  allUsers: SystemUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('propflow_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<SystemUser[]>([]);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('propflow_token', newToken);
    } else {
      localStorage.removeItem('propflow_token');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    setToken(null);
    setCurrentUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe(token);
        setCurrentUser(data.user);
      } catch (err) {
        console.error("Auth error:", err);
        setToken(null);
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();
    
    // Optional: fetch all users for the "switchRole" mock functionality if still needed
    api.getUsers().then(users => setAllUsers(users)).catch(() => {});
  }, [token]);

  // For testing purposes during transition (can be removed later)
  const switchRole = (role: UserRole) => {
    const found = allUsers.find(u => u.role === role);
    if (found) setCurrentUser(found);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      token, 
      setToken, 
      isLoading, 
      logout,
      switchRole,
      allUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
