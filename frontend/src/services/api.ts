import axios from 'axios';

// URL base del backend (cambiar según tu configuración)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ventas-backend-gyyx.onrender.com/api';

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
    const response = await api.post('/products', fullProductData);
    return response.data;
  },

  // Actualizar un producto - campos según tabla products de PostgreSQL
  update: async (id: number, productData: {
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
    const response = await api.put(`/products/${id}`, fullProductData);
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
// ANALYTICS / ESTADÍSTICAS
// ============================================

export const analyticsAPI = {
  // Obtener todas las métricas
  getAll: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  // Obtener métricas por tipo
  getByType: async (metricType: string) => {
    const response = await api.get(`/analytics/${metricType}`);
    return response.data;
  },

  // Crear una métrica
  create: async (data: { metric_type: string; value: number }) => {
    const response = await api.post('/analytics', data);
    return response.data;
  },
};

// Exportar la instancia de axios por si necesitas usarla directamente
export default api;