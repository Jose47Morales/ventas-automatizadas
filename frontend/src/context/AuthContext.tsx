import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';

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

// ⚠️ MODO DESARROLLO: Bypass de autenticación temporal
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

// Provider del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_BYPASS_AUTH ? DEV_USER : null);
  const [accessToken, setAccessToken] = useState<string | null>(DEV_BYPASS_AUTH ? 'dev-token' : null);
  const [isLoading, setIsLoading] = useState(false);

  // Al cargar la app, verificar si hay tokens guardados
  useEffect(() => {
    // Si está en modo bypass, no verificar auth
    if (DEV_BYPASS_AUTH) {
      return;
    }

    const checkAuth = async () => {
      const savedAccessToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');

      if (savedAccessToken && savedRefreshToken && savedUser) {
        setAccessToken(savedAccessToken);
        setUser(JSON.parse(savedUser));
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

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

      setAccessToken(newAccessToken);
      setUser(userData);
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
