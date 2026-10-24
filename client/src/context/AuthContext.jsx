import { createContext, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ipms_session');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials) => {
    const loggedUser = await loginUser(credentials);
    localStorage.setItem('ipms_session', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data) => {
    const createdUser = await registerUser(data);
    return createdUser;
  };

  const logout = () => {
    localStorage.removeItem('ipms_session');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
    }),
    [user],
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
