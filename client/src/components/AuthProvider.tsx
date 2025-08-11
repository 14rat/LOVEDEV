import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTestToken, getStoredToken, clearToken } from '@/lib/auth';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getStoredToken();
    if (existingToken) {
      setToken(existingToken);
      // Verify token with server
      verifyToken(existingToken);
    } else {
      // Auto-login for demo purposes
      login();
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToVerify);
        setIsLoading(false);
      } else {
        // Token is invalid, get a new one
        await login();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      await login();
    }
  };

  const login = async (email: string = 'test@example.com') => {
    try {
      setIsLoading(true);
      const data = await getTestToken(email);
      setUser(data.user);
      setToken(data.token);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}