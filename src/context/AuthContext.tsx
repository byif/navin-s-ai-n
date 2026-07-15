import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthState, RecruiterProfile, User, UserRole } from '../types/auth';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    recruiterProfile?: RecruiterProfile
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type ProfileRow = {
  id?: string;
  email?: string | null;
  full_name?: string | null;
  role?: UserRole | null;
  company_name?: string | null;
  designation?: string | null;
  company_website?: string | null;
  industry?: string | null;
  avatar_url?: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapSessionToUser = async (session: Session | null): Promise<User | null> => {
  if (!session?.user) return null;

  const authUser = session.user;
  const metadata = authUser.user_metadata || {};
  let profile: ProfileRow | null = null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,full_name,role,company_name,designation,company_website,industry,avatar_url')
      .eq('id', authUser.id)
      .maybeSingle<ProfileRow>();

    if (error) {
      console.warn('Profile row could not be loaded. Auth metadata will be used.', error.message);
    }
    profile = data;
  } catch (error) {
    console.warn('Profile lookup failed. Auth metadata will be used.', error);
  }

  const role = (profile?.role || metadata.role || 'job_seeker') as UserRole;
  const recruiterProfile =
    role === 'recruiter'
      ? {
          companyName: profile?.company_name || metadata.companyName || '',
          designation: profile?.designation || metadata.designation || '',
          companyWebsite: profile?.company_website || metadata.companyWebsite || '',
          industry: profile?.industry || metadata.industry || '',
        }
      : undefined;

  return {
    id: authUser.id,
    email: profile?.email || authUser.email || '',
    name: profile?.full_name || metadata.name || authUser.email?.split('@')[0] || "Navin's AI User",
    role,
    avatar: profile?.avatar_url || metadata.photoUrl || metadata.avatar_url,
    recruiterProfile,
  };
};

const upsertProfile = async (
  userId: string,
  email: string,
  name: string,
  role: UserRole,
  recruiterProfile?: RecruiterProfile
) => {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: name,
    role,
    company_name: recruiterProfile?.companyName || null,
    designation: recruiterProfile?.designation || null,
    company_website: recruiterProfile?.companyWebsite || null,
    industry: recruiterProfile?.industry || null,
  });

  if (error) {
    console.warn('Profile table is not ready yet. Auth metadata will be used until Supabase schema is created.', error.message);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = await mapSessionToUser(data.session);
      setAuthState({ user, isAuthenticated: Boolean(user), loading: false });
    } catch (error) {
      console.warn('Session refresh failed.', error);
      setAuthState({ user: null, isAuthenticated: false, loading: false });
    }
  };

  useEffect(() => {
    refreshUser();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      mapSessionToUser(session)
        .then((user) => {
          setAuthState({ user, isAuthenticated: Boolean(user), loading: false });
        })
        .catch((error) => {
          console.warn('Auth state change could not be mapped.', error);
          setAuthState({ user: null, isAuthenticated: false, loading: false });
        });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = await mapSessionToUser(data.session);
    if (!user) throw new Error('Unable to load your profile.');
    if (role !== 'admin' && user.role !== role) {
      await supabase.auth.signOut();
      throw new Error(`This account is registered as ${user.role.replace('_', ' ')}.`);
    }

    setAuthState({ user, isAuthenticated: true, loading: false });
    return user;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    recruiterProfile?: RecruiterProfile
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          companyName: recruiterProfile?.companyName,
          designation: recruiterProfile?.designation,
          companyWebsite: recruiterProfile?.companyWebsite,
          industry: recruiterProfile?.industry,
        },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Signup did not return a user.');

    await upsertProfile(data.user.id, email, name, role, recruiterProfile);
    const user = await mapSessionToUser(data.session);
    const fallbackUser: User = {
      id: data.user.id,
      email,
      name,
      role,
      recruiterProfile: role === 'recruiter' ? recruiterProfile : undefined,
    };

    setAuthState({ user: user || fallbackUser, isAuthenticated: Boolean(data.session), loading: false });
    return user || fallbackUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, isAuthenticated: false, loading: false });
  };

  const value = useMemo(
    () => ({ ...authState, login, register, logout, refreshUser }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
