import { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { setGlobalErrorHandler, type APIError, ErrorCodes } from '../services/errorHandler';

/**
 * Componente que configura el manejo global de errores de la API.
 * Debe ser renderizado dentro del ChakraProvider para poder usar useToast.
 */
function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  useEffect(() => {
    // Configurar el handler global de errores
    setGlobalErrorHandler((error: APIError) => {
      // Determinar el tipo de toast según el código de error
      let status: 'error' | 'warning' | 'info' = 'error';
      let duration = 5000;

      switch (error.code) {
        case ErrorCodes.NETWORK_ERROR:
        case ErrorCodes.SERVICE_UNAVAILABLE:
          status = 'warning';
          duration = 6000;
          break;
        case ErrorCodes.VALIDATION_ERROR:
          status = 'warning';
          duration = 4000;
          break;
        case ErrorCodes.NOT_FOUND:
          status = 'info';
          duration = 4000;
          break;
        default:
          status = 'error';
      }

      // Evitar duplicados de toast
      const toastId = `api-error-${error.code}`;
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: getTitleForError(error.code),
          description: error.message,
          status,
          duration,
          isClosable: true,
          position: 'top-right',
        });
      }
    });

    // Cleanup al desmontar
    return () => {
      setGlobalErrorHandler(() => {});
    };
  }, [toast]);

  return <>{children}</>;
}

// Función auxiliar para obtener títulos descriptivos
function getTitleForError(code: string): string {
  switch (code) {
    case ErrorCodes.NETWORK_ERROR:
      return 'Error de conexión';
    case ErrorCodes.TIMEOUT:
      return 'Tiempo agotado';
    case ErrorCodes.UNAUTHORIZED:
    case ErrorCodes.TOKEN_EXPIRED:
      return 'Sesión expirada';
    case ErrorCodes.INVALID_CREDENTIALS:
      return 'Error de autenticación';
    case ErrorCodes.VALIDATION_ERROR:
      return 'Datos inválidos';
    case ErrorCodes.NOT_FOUND:
      return 'No encontrado';
    case ErrorCodes.CONFLICT:
      return 'Conflicto';
    case ErrorCodes.SERVER_ERROR:
      return 'Error del servidor';
    case ErrorCodes.SERVICE_UNAVAILABLE:
      return 'Servicio no disponible';
    default:
      return 'Error';
  }
}

export default GlobalErrorHandler;
