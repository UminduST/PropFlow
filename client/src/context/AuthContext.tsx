import React, { createContext, useContext, useState } from 'react';
import { SystemUser, UserRole } from '../types/index.js';

interface AuthContextType {
  currentUser: SystemUser;
  setCurrentUser: (user: SystemUser) => void;
  switchRole: (role: UserRole) => void;
  allUsers: SystemUser[];
}

const defaultUsers: SystemUser[] = [
  {
    id: 'user-admin',
    name: 'Administrator Administrator',
    email: 'admin@propflow.com',
    role: 'administrator',
    avatar: 'AD',
    phone: '+1 (555) 001-1122',
    active: true
  },
  {
    id: 'user-manager',
    name: 'Sarah Connor (Ops Manager)',
    email: 'operations@propflow.com',
    role: 'operations_manager',
    avatar: 'SC',
    phone: '+1 (555) 002-2233',
    active: true
  },
  {
    id: 'user-cleaner-1',
    name: 'Elena Volkova (Cleaner)',
    email: 'elena.cleaner@propflow.com',
    role: 'cleaner',
    avatar: 'EV',
    telegramPin: '482910',
    telegramChatId: 'chat_elena_101',
    phone: '+1 (555) 444-1234',
    active: true
  },
  {
    id: 'user-cleaner-2',
    name: 'Marco Santos (Cleaner)',
    email: 'marco.cleaner@propflow.com',
    role: 'cleaner',
    avatar: 'MS',
    telegramPin: '719304',
    phone: '+1 (555) 444-5678',
    active: true
  },
  {
    id: 'user-maint-1',
    name: 'David Reynolds (Maintenance)',
    email: 'david.tech@propflow.com',
    role: 'maintenance',
    avatar: 'DR',
    telegramPin: '593821',
    telegramChatId: 'chat_david_202',
    phone: '+1 (555) 888-9900',
    active: true
  },
  {
    id: 'user-owner-1',
    name: 'Alexander Wright (Owner)',
    email: 'alex.wright@propowner.com',
    role: 'owner',
    avatar: 'AW',
    phone: '+1 (555) 234-8901',
    active: true
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SystemUser>(defaultUsers[0]);

  const switchRole = (role: UserRole) => {
    const found = defaultUsers.find(u => u.role === role);
    if (found) setCurrentUser(found);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchRole, allUsers: defaultUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
