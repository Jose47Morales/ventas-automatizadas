import axios from 'axios';

// URL base del backend (cambiar según tu configuración)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ventas-backend-gyyx.onrender.com';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Si hay token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente retornarla
    return response;
  },
  (error) => {
    // Si el token expiró (401), redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTENTICACIÓN
// ============================================

export const authAPI = {
  // Login
  // NOTA: El backend de José NO tiene endpoint de auth todavía
  // Por ahora usamos un login simulado
  login: async (email: string, _password: string) => {
    // TODO: Preguntar a José cuál es el endpoint correcto de login
    // Opciones posibles: /auth/login, /login, /api/login
    
    // POR AHORA: Simulamos login exitoso
    // Esto es TEMPORAL hasta que José confirme el endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'temporary-token-12345',
          user: {
            id: 1,
            name: 'Usuario Admin',
            email: email,
            role: 'admin'
          }
        });
      }, 1000);
    });
    
    // CUANDO JOSÉ CONFIRME EL ENDPOINT, descomentar esto:
    // const response = await api.post('/auth/login', { email, password });
    // return response.data;
  },
  
  // Logout
  logout: async () => {
    // Por ahora solo limpiamos localStorage
    return { success: true };
    // const response = await api.post('/auth/logout');
    // return response.data;
  },
  
  // Obtener usuario actual
  me: async () => {
    // Por ahora retornamos el usuario guardado
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('No user found');
    // const response = await api.get('/auth/me');
    // return response.data;
  },
};

// ============================================
// PRODUCTOS
// ============================================

export const productsAPI = {
  // Obtener todos los productos
  getAll: async (params?: { search?: string; category?: string }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  // Obtener un producto por ID
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  // Crear un producto
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  // Actualizar un producto
  update: async (id: number, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  // Eliminar un producto
  delete: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// ============================================
// PEDIDOS
// ============================================

export const ordersAPI = {
  // Obtener todos los pedidos
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  // Obtener un pedido por ID
  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // Crear un pedido
  create: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // Actualizar estado de un pedido
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
};

// ============================================
// PAGOS
// ============================================

export const paymentsAPI = {
  // Obtener todos los pagos
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },
  
  // Obtener un pago por ID
  getById: async (id: number) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  
  // Confirmar un pago
  confirm: async (id: number) => {
    const response = await api.post(`/payments/${id}/confirm`);
    return response.data;
  },
};

// ============================================
// DASHBOARD / ESTADÍSTICAS
// ============================================

export const statsAPI = {
  // Obtener estadísticas del dashboard
  getDashboard: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },
  
  // Obtener analíticas
  getAnalytics: async () => {
    const response = await api.get('/stats/analytics');
    return response.data;
  },
  
  // Obtener ventas por período
  getSalesByPeriod: async (period: 'day' | 'week' | 'month' | 'year') => {
    const response = await api.get(`/stats/sales/${period}`);
    return response.data;
  },
};

// Exportar la instancia de axios por si necesitas usarla directamente
export default api;