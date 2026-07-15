import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RecruiterProfile, User, UserRole, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<User>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: UserRole,
    recruiterProfile?: RecruiterProfile
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USERS_KEY = 'navins_ai_users_v1';

interface StoredUser extends User {
  passwordHash: string;
}

const hashPassword = (password: string) => {
  const encoded = encodeURIComponent(password).replace(/%([0-9A-F]{2})/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
  return btoa(encoded);
};

const demoUsers = (): StoredUser[] => [
  { id: 'demo-job-seeker', email: 'student@navinsai.in', name: 'Demo Student', role: 'job_seeker', passwordHash: hashPassword('password') },
  {
    id: 'demo-recruiter',
    email: 'recruiter@navinsai.in',
    name: 'Demo Recruiter',
    role: 'recruiter',
    passwordHash: hashPassword('password'),
    recruiterProfile: {
      companyName: 'ABC Technologies',
      designation: 'Talent Acquisition Manager',
      companyWebsite: 'https://abc.example.com',
      industry: 'Technology',
    },
  },
  { id: 'demo-admin', email: 'admin@navinsai.in', name: 'Platform Admin', role: 'admin', passwordHash: hashPassword('password') },
];

const getStoredUsers = (): StoredUser[] => {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) return JSON.parse(raw) as StoredUser[];
  const users = demoUsers();
  setStoredUsers(users);
  return users;
};
const setStoredUsers = (users: StoredUser[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check local storage for existing session
    const user = localStorage.getItem('user');
    if (user) {
      setAuth({
        user: { role: 'job_seeker', ...JSON.parse(user) },
        isAuthenticated: true,
        loading: false,
      });
    } else {
      setAuth(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole = 'job_seeker') => {
    const users = getStoredUsers();
    const storedUser = users.find((account) => account.email.toLowerCase() === email.toLowerCase() && account.role === role);
    if (!storedUser) throw new Error('Account not found. Please register first.');
    if (storedUser.passwordHash !== hashPassword(password)) throw new Error('Invalid credentials. Please check your password.');
    const user: User = {
      id: storedUser.id,
      email: storedUser.email,
      name: storedUser.name,
      role: storedUser.role,
      avatar: storedUser.avatar,
      recruiterProfile: storedUser.recruiterProfile,
    };
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({
      user,
      isAuthenticated: true,
      loading: false,
    });
    return user;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole = 'job_seeker',
    recruiterProfile?: RecruiterProfile
  ) => {
    const users = getStoredUsers();
    const existing = users.find((account) => account.email.toLowerCase() === email.toLowerCase() && account.role === role);
    if (existing) throw new Error('Account already exists. Please login.');
    const user: User = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      recruiterProfile,
    };
    users.push({ ...user, passwordHash: hashPassword(password) });
    setStoredUsers(users);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({
      user,
      isAuthenticated: true,
      loading: false,
    });
    return user;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuth({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
