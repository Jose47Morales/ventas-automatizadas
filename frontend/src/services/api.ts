import axios from 'axios';

// URL base del backend (cambiar según tu configuración)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-empty-frog-4217.fly.dev';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener el accessToken del localStorage
    const accessToken = localStorage.getItem('accessToken');

    // Si hay token, agregarlo al header Authorization
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta y refresh automático
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no es una petición de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si ya estamos haciendo refresh, encolar la petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No hay refresh token, limpiar y redirigir
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Intentar renovar el token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh falló, limpiar y redirigir
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTENTICACIÓN
// ============================================

export const authAPI = {
  // Login - Endpoint real de José
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register - Crear nuevo usuario
  // Backend espera: { email, password, firstName?, lastName? }
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await api.post('/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    return response.data;
  },

  // Refresh Token - Renovar tokens
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Logout - Limpiar sesión local
  logout: async () => {
    // Limpiar tokens del localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return { success: true };
  },

  // Obtener usuario actual desde localStorage
  me: async () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    throw new Error('No user found');
  },
};

// ============================================
// PRODUCTOS
// ============================================

export const productsAPI = {
  // Obtener todos los productos
  getAll: async (params?: { search?: string; category?: string }) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id: string | number) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Crear un producto - campos según tabla products de PostgreSQL
  create: async (productData: {
    nombre: string;
    referencia?: string;
    codigo_barras?: string;
    categoria?: string;
    marca?: string;
    existencias?: number;
    precioventa_con_impuesto?: number;
    precio_venta_base?: number;
    precio_compra?: number;
    costo?: number;
    stock_minimo?: number;
    descuento_maximo_ps?: number;
    impuesto?: number;
    ubicacion?: string;
    proveedor?: string;
    nota?: string;
  }) => {
    // Construir objeto con todos los campos que espera el backend
    const fullProductData = {
      nombre: productData.nombre,
      referencia: productData.referencia || null,
      codigo_barras: productData.codigo_barras || null,
      invima: null,
      cum: null,
      codigo_producto_dian: null,
      existencias: productData.existencias || 0,
      impuesto: productData.impuesto || 0,
      precioventa_con_impuesto: String(productData.precioventa_con_impuesto || 0),
      precio_venta_base: String(productData.precio_venta_base || productData.precioventa_con_impuesto || 0),
      precio_venta_minimo: '0',
      descuento_maximo_ps: String(productData.descuento_maximo_ps || 0),
      precio_compra: String(productData.precio_compra || 0),
      precio_compraipm: '0',
      total_impoconsumo: '0',
      total_estampilla: '0',
      icui: '0',
      ibua: '0',
      costo: String(productData.costo || 0),
      stock_minimo: productData.stock_minimo || 1,
      es_ingrediente: false,
      manejo_bascula: false,
      utilidad: '0',
      mostrar_tienda: true,
      categoria: productData.categoria || null,
      marca: productData.marca || null,
      codigo_cuenta: null,
      precio1: '0',
      precio2: '0',
      precio3: '0',
      precio4: '0',
      ubicacion: productData.ubicacion || null,
      proveedor: productData.proveedor || null,
      nit_proveedor: null,
      url_imagen: null,
      nota: productData.nota || null,
      tipo_producto: 'producto',
      imagenes: null,
      videos: null,
      realizar_pedido_solo_existencia: false,
      vender_solo_existencia: false,
    };
    console.log('Enviando producto:', fullProductData);
    const response = await api.post('/api/products', fullProductData);
    return response.data;
  },

  // Actualizar un producto - campos según tabla products de PostgreSQL
  update: async (id: string | number, productData: {
    nombre: string;
    referencia?: string;
    codigo_barras?: string;
    categoria?: string;
    marca?: string;
    existencias?: number;
    precioventa_con_impuesto?: number;
    precio_venta_base?: number;
    precio_compra?: number;
    costo?: number;
    stock_minimo?: number;
    descuento_maximo_ps?: number;
    impuesto?: number;
    ubicacion?: string;
    proveedor?: string;
    nota?: string;
  }) => {
    // Construir objeto con todos los campos que espera el backend
    const fullProductData = {
      nombre: productData.nombre,
      referencia: productData.referencia || null,
      codigo_barras: productData.codigo_barras || null,
      invima: null,
      cum: null,
      codigo_producto_dian: null,
      existencias: productData.existencias || 0,
      impuesto: productData.impuesto || 0,
      precioventa_con_impuesto: String(productData.precioventa_con_impuesto || 0),
      precio_venta_base: String(productData.precio_venta_base || productData.precioventa_con_impuesto || 0),
      precio_venta_minimo: '0',
      descuento_maximo_ps: String(productData.descuento_maximo_ps || 0),
      precio_compra: String(productData.precio_compra || 0),
      precio_compraipm: '0',
      total_impoconsumo: '0',
      total_estampilla: '0',
      icui: '0',
      ibua: '0',
      costo: String(productData.costo || 0),
      stock_minimo: productData.stock_minimo || 1,
      es_ingrediente: false,
      manejo_bascula: false,
      utilidad: '0',
      mostrar_tienda: true,
      categoria: productData.categoria || null,
      marca: productData.marca || null,
      codigo_cuenta: null,
      precio1: '0',
      precio2: '0',
      precio3: '0',
      precio4: '0',
      ubicacion: productData.ubicacion || null,
      proveedor: productData.proveedor || null,
      nit_proveedor: null,
      url_imagen: null,
      nota: productData.nota || null,
      tipo_producto: 'producto',
      imagenes: null,
      videos: null,
      realizar_pedido_solo_existencia: false,
      vender_solo_existencia: false,
    };
    console.log('Actualizando producto:', fullProductData);
    const response = await api.put(`/api/products/${id}`, fullProductData);
    return response.data;
  },

  // Eliminar un producto
  delete: async (id: string | number) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
};

// ============================================
// PEDIDOS
// ============================================

export const ordersAPI = {
  // Obtener todos los pedidos
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
  },

  // Obtener un pedido por ID
  getById: async (id: number) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Crear un pedido
  create: async (orderData: any) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Actualizar estado de un pedido
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};

// ============================================
// PAGOS
// ============================================

export const paymentsAPI = {
  // Obtener todos los pagos
  getAll: async (params?: { status?: string }) => {
    const response = await api.get('/api/payments', { params });
    return response.data;
  },

  // Obtener un pago por ID
  getById: async (id: number) => {
    const response = await api.get(`/api/payments/${id}`);
    return response.data;
  },

  // Confirmar un pago
  confirm: async (id: number) => {
    const response = await api.post(`/api/payments/${id}/confirm`);
    return response.data;
  },
};

// ============================================
// ANALYTICS / ESTADÍSTICAS
// ============================================

export const analyticsAPI = {
  // Obtener todas las métricas
  getAll: async () => {
    const response = await api.get('/api/analytics');
    return response.data;
  },

  // Obtener métricas por tipo
  getByType: async (metricType: string) => {
    const response = await api.get(`/api/analytics/${metricType}`);
    return response.data;
  },

  // Crear una métrica
  create: async (data: { metric_type: string; value: number }) => {
    const response = await api.post('/api/analytics', data);
    return response.data;
  },
};

// Exportar la instancia de axios por si necesitas usarla directamente
export default api;