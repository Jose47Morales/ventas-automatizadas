import { AxiosError } from 'axios';

// Tipos de errores de la API
export interface APIError {
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
}

// Códigos de error centralizados
export const ErrorCodes = {
  // Errores de red
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Errores de autenticación
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Errores del servidor
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Errores genéricos
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Mensajes de error en español para el usuario
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Error de conexión. Verifica tu conexión a internet.',
  [ErrorCodes.TIMEOUT]: 'La solicitud tardó demasiado. Intenta de nuevo.',
  [ErrorCodes.UNAUTHORIZED]: 'No tienes autorización. Inicia sesión nuevamente.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu email y contraseña.',
  [ErrorCodes.VALIDATION_ERROR]: 'Los datos ingresados no son válidos.',
  [ErrorCodes.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ErrorCodes.CONFLICT]: 'Ya existe un registro con esos datos.',
  [ErrorCodes.SERVER_ERROR]: 'Error en el servidor. Intenta más tarde.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'El servicio no está disponible. Intenta más tarde.',
  [ErrorCodes.UNKNOWN_ERROR]: 'Ha ocurrido un error inesperado.',
};

// Callback global para mostrar errores (se configura desde App.tsx)
let globalErrorHandler: ((error: APIError) => void) | null = null;

export const setGlobalErrorHandler = (handler: (error: APIError) => void) => {
  globalErrorHandler = handler;
};

export const getGlobalErrorHandler = () => globalErrorHandler;

// Función para parsear errores de Axios
export const parseAxiosError = (error: AxiosError<any>): APIError => {
  // Error de red (sin respuesta del servidor)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        code: ErrorCodes.TIMEOUT,
        message: ErrorMessages[ErrorCodes.TIMEOUT],
      };
    }
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: ErrorMessages[ErrorCodes.NETWORK_ERROR],
    };
  }

  const { status, data } = error.response;

  // Mapear códigos HTTP a códigos de error
  switch (status) {
    case 400:
      return {
        code: ErrorCodes.VALIDATION_ERROR,
        message: data?.message || ErrorMessages[ErrorCodes.VALIDATION_ERROR],
        details: data?.errors ? JSON.stringify(data.errors) : undefined,
        statusCode: status,
      };

    case 401:
      return {
        code: ErrorCodes.UNAUTHORIZED,
        message: data?.message || ErrorMessages[ErrorCodes.UNAUTHORIZED],
        statusCode: status,
      };

    case 403:
      return {
        code: ErrorCodes.UNAUTHORIZED,
        message: 'No tienes permisos para realizar esta acción.',
        statusCode: status,
      };

    case 404:
      return {
        code: ErrorCodes.NOT_FOUND,
        message: data?.message || ErrorMessages[ErrorCodes.NOT_FOUND],
        statusCode: status,
      };

    case 409:
      return {
        code: ErrorCodes.CONFLICT,
        message: data?.message || ErrorMessages[ErrorCodes.CONFLICT],
        statusCode: status,
      };

    case 500:
      return {
        code: ErrorCodes.SERVER_ERROR,
        message: data?.message || ErrorMessages[ErrorCodes.SERVER_ERROR],
        statusCode: status,
      };

    case 502:
    case 503:
    case 504:
      return {
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: ErrorMessages[ErrorCodes.SERVICE_UNAVAILABLE],
        statusCode: status,
      };

    default:
      return {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: data?.message || ErrorMessages[ErrorCodes.UNKNOWN_ERROR],
        statusCode: status,
      };
  }
};

// Función para manejar errores globalmente
export const handleAPIError = (error: AxiosError<any>, showToast = true): APIError => {
  const parsedError = parseAxiosError(error);

  // Llamar al handler global si está configurado y showToast es true
  if (showToast && globalErrorHandler) {
    globalErrorHandler(parsedError);
  }

  // Log para debugging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      code: parsedError.code,
      message: parsedError.message,
      details: parsedError.details,
      originalError: error,
    });
  }

  return parsedError;
};

// Errores específicos que no deberían mostrar toast (manejados silenciosamente)
export const silentErrorCodes = [
  ErrorCodes.TOKEN_EXPIRED, // El refresh automático maneja esto
];

export const shouldShowError = (errorCode: string): boolean => {
  return !silentErrorCodes.includes(errorCode as any);
};

/**
 * Obtiene el mensaje de error de una respuesta de axios de forma segura.
 * Útil para mostrar en los componentes cuando se captura un error.
 */
export const getErrorMessage = (error: any): string => {
  // Si el error ya fue parseado por nuestro interceptor
  if (error.parsedError?.message) {
    return error.parsedError.message;
  }

  // Si es un error de axios con respuesta
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Si tiene un mensaje directo
  if (error.message) {
    return error.message;
  }

  // Mensaje por defecto
  return ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
};

/**
 * Verifica si un error es de un tipo específico.
 */
export const isErrorCode = (error: any, code: string): boolean => {
  return error.parsedError?.code === code;
};
