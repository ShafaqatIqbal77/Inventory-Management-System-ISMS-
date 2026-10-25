import { createContext, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

const SESSION_KEY = 'ipms_session';
const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const nextSession = {
      token: response.token,
      user: response.user,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return response.user;
  };

  const register = async (data) => {
    const response = await registerUser(data);
    return response.user || response;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const user = session?.user ?? null;
  const token = session?.token ?? null;

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
};
