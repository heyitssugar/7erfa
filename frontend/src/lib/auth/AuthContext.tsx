import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { AuthState, LoginCredentials, SignupData, User, AuthTokens } from './types';
import * as authApi from './api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = '7erfa_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    // Load auth state from localStorage
    const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedAuth) {
      const { user, tokens } = JSON.parse(savedAuth);
      setState((prev) => ({ ...prev, user, tokens, isLoading: false }));
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // Set up refresh token interval
    if (state.tokens?.refreshToken) {
      const refreshInterval = setInterval(async () => {
        try {
          const newTokens = await authApi.refreshTokens(state.tokens.refreshToken);
          setState((prev) => ({
            ...prev,
            tokens: newTokens,
          }));
        } catch (error) {
          logout();
        }
      }, 14 * 60 * 1000); // Refresh 1 minute before token expires

      return () => clearInterval(refreshInterval);
    }
  }, [state.tokens?.refreshToken]);

  const saveAuthState = (user: User, tokens: AuthTokens) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, tokens }));
    setState((prev) => ({ ...prev, user, tokens, error: null }));
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { user, tokens } = await authApi.login(credentials);
      saveAuthState(user, tokens);
      router.push('/dashboard');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false,
      }));
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { user, tokens } = await authApi.signup(data);
      saveAuthState(user, tokens);
      router.push('/dashboard');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to signup',
        isLoading: false,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
    });
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
