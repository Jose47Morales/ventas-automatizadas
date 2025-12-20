import { createContext, useContext, useState, type ReactNode } from 'react';

// Tipos de entornos disponibles
export type Environment = 'Todos' | 'Accesorios' | 'Cacharrería' | 'Android' | 'iPhone';

// Configuración de los entornos con sus colores
export const environments: { key: Environment; label: string; colorScheme: string }[] = [
  { key: 'Todos', label: 'Todos', colorScheme: 'gray' },
  { key: 'Accesorios', label: 'Accesorios', colorScheme: 'green' },
  { key: 'Cacharrería', label: 'Cacharrería', colorScheme: 'blue' },
  { key: 'Android', label: 'Android', colorScheme: 'purple' },
  { key: 'iPhone', label: 'iPhone', colorScheme: 'orange' },
];

interface EnvironmentContextType {
  currentEnvironment: Environment;
  setCurrentEnvironment: (env: Environment) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>('Todos');

  return (
    <EnvironmentContext.Provider value={{ currentEnvironment, setCurrentEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment debe usarse dentro de un EnvironmentProvider');
  }
  return context;
}
