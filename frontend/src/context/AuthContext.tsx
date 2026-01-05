import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import axios from 'axios';

// Tipos
interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roleSlug: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MODO DESARROLLO: Bypass de autenticación temporal
// TODO: Remover cuando José despliegue el backend con auth funcionando
const DEV_BYPASS_AUTH = false;

const DEV_USER: User = {
  id: 1,
  email: 'dev@example.com',
  firstName: 'Usuario',
  lastName: 'Desarrollo',
  roleSlug: 'global:admin',
  name: 'Usuario Desarrollo',
  role: 'admin',
};

// Constantes para el manejo de sesión
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // Refrescar 5 minutos antes de expirar

// Función para decodificar JWT y obtener expiración
const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convertir a milisegundos
  } catch {
    return null;
  }
};

// Función para verificar si el token está por expirar
const isTokenExpiringSoon = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return Date.now() > expiration - TOKEN_REFRESH_MARGIN;
};

// Provider del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializar estados desde localStorage para evitar flash de logout
  const [user, setUser] = useState<User | null>(() => {
    if (DEV_BYPASS_AUTH) return DEV_USER;
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (DEV_BYPASS_AUTH) return 'dev-token';
    return localStorage.getItem('accessToken');
  });
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Función para refrescar el token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-empty-frog-4217.fly.dev';
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      if (newAccessToken && newRefreshToken) {
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setAccessToken(newAccessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refrescando token:', error);
      return false;
    }
  }, []);

  // Programar el siguiente refresh del token
  const scheduleTokenRefresh = useCallback((token: string) => {
    // Limpiar timeout anterior
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiration = getTokenExpiration(token);
    if (!expiration) return;

    // Calcular tiempo hasta que necesite refrescar (5 min antes de expirar)
    const timeUntilRefresh = expiration - Date.now() - TOKEN_REFRESH_MARGIN;

    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        const success = await refreshAccessToken();
        if (success) {
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            scheduleTokenRefresh(newToken);
          }
        }
      }, timeUntilRefresh);
    }
  }, [refreshAccessToken]);

  // Al cargar la app, verificar si hay tokens guardados
  useEffect(() => {
    // Si está en modo bypass, no verificar auth
    if (DEV_BYPASS_AUTH) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      const savedAccessToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');

      if (savedAccessToken && savedRefreshToken && savedUser) {
        // Verificar si el token está por expirar
        if (isTokenExpiringSoon(savedAccessToken)) {
          // Intentar refrescar el token
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            // Si falla el refresh, mantener la sesión con el token actual
            // El interceptor de axios manejará el 401 si es necesario
            console.log('Token próximo a expirar, se intentará refrescar en la próxima petición');
          }
        }

        // Programar refresh automático
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) {
          scheduleTokenRefresh(currentToken);
        }

        setAccessToken(localStorage.getItem('accessToken'));
        setUser(JSON.parse(savedUser));
      }

      setIsLoading(false);
    };

    checkAuth();

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshAccessToken, scheduleTokenRefresh]);

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      // Llamar al backend - retorna { accessToken, refreshToken }
      const response = await authAPI.login(email, password);

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Decodificar el JWT para obtener info del usuario
      const payload = JSON.parse(atob(newAccessToken.split('.')[1]));

      const userData: User = {
        id: payload.sub,
        email: email,
        roleSlug: payload.role || 'global:member',
        name: email.split('@')[0],
        role: payload.role || 'global:member',
      };

      // Guardar tokens y usuario
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      // Guardar timestamp de última actividad
      localStorage.setItem('lastActivity', Date.now().toString());

      setAccessToken(newAccessToken);
      setUser(userData);

      // Programar refresh automático
      scheduleTokenRefresh(newAccessToken);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Función de registro
  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      await authAPI.register(data);

      // Después del registro, hacer login automático
      await login(data.email, data.password);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  // Función de logout
  const logout = () => {
    // Limpiar timeout de refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setAccessToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
}
