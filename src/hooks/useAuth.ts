import { useState, useCallback } from 'react';
import { User, AuthState } from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default credentials
  const defaultCredentials = [
    { username: 'admin', password: 'tigosofts', role: 'admin' as const },
    { username: 'user', password: 'pass2040', role: 'user' as const },
    // { username: 'demo', password: 'demo123', role: 'user' as const }
  ];

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check against default credentials
    const validCredential = defaultCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (validCredential) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: validCredential.username,
        role: validCredential.role
      };

      setAuthState({
        isAuthenticated: true,
        user
      });
      
      setIsLoading(false);
      return true;
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setError(null);
  }, []);

  return {
    authState,
    isLoading,
    error,
    login,
    logout
  };
};