import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  role: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  ready: false,
});

function parseJwt(token: string): { sub?: string; role?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function getInitialToken(): string | null {
  return localStorage.getItem('token');
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getInitialToken());

  // Вычисляем username и role напрямую из токена — без отдельного стейта
  const payload = token ? parseJwt(token) : null;
  const username = payload?.sub ?? null;
  const role = payload?.role ?? null;

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const isAdmin = role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ token, username, role, isAdmin, login, logout, isAuthenticated: !!token, ready: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
