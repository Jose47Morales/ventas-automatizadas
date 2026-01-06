import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Icon,
  HStack,
  VStack,
  Spinner,
  Center,
  Button,
  useToast,
  useBreakpointValue,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import {
  FiBell,
  FiAlertTriangle,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiExternalLink,
} from 'react-icons/fi';
import { ordersAPI, productsAPI } from '../services/api';

// Hook para reproducir sonido de notificación
const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(() => {
    try {
      // Crear AudioContext si no existe
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Reanudar contexto si está suspendido (política de autoplay)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Crear osciladores para un sonido agradable tipo "ding-dong"
      // Primera nota (más alta)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Segunda nota (más baja, con delay)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);

    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación:', error);
    }
  }, []);

  return playSound;
};


// Interfaces
interface APIOrder {
  id: number;
  client_name: string;
  client_phone: string;
  total: string;
  payment_status: string;
  created_at: string;
  items: { product_name: string; quantity: number; total: number }[];
}

interface APIProduct {
  id: string;
  nombre: string;
  existencias: number;
  stock_minimo: number;
  precioventa_con_impuesto: string;
  categoria: string;
}

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'stock' | 'top_product' | 'awaiting_payment';
  title: string;
  message: string;
  timestamp: string;
  icon: any;
  color: string;
  read: boolean;
  orderId?: number; // Para navegación directa al pedido
}

interface TopProduct {
  name: string;
  units: number;
  revenue: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  category: string;
}

// Constantes para los intervalos de actualización
const ORDERS_UPDATE_INTERVAL = 60 * 1000; // 1 minuto
const STOCK_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas
const STOCK_STORAGE_KEY = 'lastStockUpdate';
const STOCK_DATA_KEY = 'cachedStockData';

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [lastStockUpdate, setLastStockUpdate] = useState<Date | null>(null);

  // Referencia para rastrear IDs de notificaciones previas
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const toast = useToast();
  const navigate = useNavigate();
  const playNotificationSound = useNotificationSound();

  // Responsive values
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });

  // Verificar si necesita actualizar el stock (cada 24 horas)
  const shouldUpdateStock = (): boolean => {
    const lastUpdate = localStorage.getItem(STOCK_STORAGE_KEY);
    if (!lastUpdate) return true;

    const lastUpdateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    return (now - lastUpdateTime) >= STOCK_UPDATE_INTERVAL;
  };

  // Cargar datos de stock desde cache o API
  const fetchStockData = async (forceUpdate = false): Promise<{ lowStock: LowStockProduct[]; stockNotifications: Notification[] }> => {
    // Si no necesita actualizar y hay cache, usar cache
    if (!forceUpdate && !shouldUpdateStock()) {
      const cachedData = localStorage.getItem(STOCK_DATA_KEY);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setLastStockUpdate(new Date(localStorage.getItem(STOCK_STORAGE_KEY) || ''));
          return parsed;
        } catch {
          // Si falla el parse, continuar con la actualización
        }
      }
    }

    // Obtener datos frescos de la API
    const productsRes = await productsAPI.getAll();
    const products: APIProduct[] = productsRes || [];

    const lowStock = products
      .filter((p) => p.existencias <= (p.stock_minimo || 5))
      .map((p) => ({
        id: p.id,
        name: p.nombre,
        stock: p.existencias,
        minStock: p.stock_minimo || 5,
        category: p.categoria || 'Sin categoría',
      }));

    const stockNotifications: Notification[] = lowStock.slice(0, 10).map((product) => ({
      id: `stock-${product.id}`,
      type: 'stock' as const,
      title: 'Stock Bajo',
      message: `${product.name} - Solo ${product.stock} unidades disponibles`,
      timestamp: new Date().toISOString(),
      icon: FiAlertTriangle,
      color: 'red.500',
      read: false,
    }));

    // Guardar en cache
    const cacheData = { lowStock, stockNotifications };
    localStorage.setItem(STOCK_DATA_KEY, JSON.stringify(cacheData));
    localStorage.setItem(STOCK_STORAGE_KEY, new Date().toISOString());
    setLastStockUpdate(new Date());

    return cacheData;
  };

  // Cargar datos de pedidos (se actualiza cada 1 minuto)
  const fetchOrdersData = async (): Promise<{
    orderNotifications: Notification[];
    paymentNotifications: Notification[];
    topProductNotifications: Notification[];
    topProducts: TopProduct[];
  }> => {
    const ordersRes = await ordersAPI.getAll();
    const orders: APIOrder[] = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);

    // Generar notificaciones de pedidos recientes (últimas 24 horas)
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter((o) => new Date(o.created_at) > last24h);

    const orderNotifications: Notification[] = recentOrders.map((order) => ({
      id: `order-${order.id}`,
      type: 'order' as const,
      title: 'Nuevo Pedido',
      message: `Pedido #${String(order.id).slice(-8).toUpperCase()} de ${order.client_name || 'Cliente'} por $${parseFloat(order.total).toLocaleString()}`,
      timestamp: order.created_at,
      icon: FiShoppingCart,
      color: 'blue.500',
      read: false,
    }));

    // Notificaciones de pagos pendientes - REQUIEREN ACCIÓN DEL OPERADOR
    const pendingPayments = orders.filter((o) => o.payment_status === 'pending');
    const paymentNotifications: Notification[] = pendingPayments.slice(0, 10).map((order) => ({
      id: `payment-${order.id}`,
      type: 'awaiting_payment' as const,
      title: 'Confirmar Pago',
      message: `Pedido #${String(order.id).slice(-8).toUpperCase()} de ${order.client_name || 'Cliente'} - $${parseFloat(order.total).toLocaleString()} esperando confirmación`,
      timestamp: order.created_at,
      icon: FiDollarSign,
      color: 'purple.500',
      read: false,
      orderId: order.id,
    }));

    // Calcular productos más vendidos
    const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = { name: item.product_name, units: 0, revenue: 0 };
        }
        productSales[item.product_name].units += item.quantity;
        productSales[item.product_name].revenue += item.total;
      });
    });

    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topProductNotifications: Notification[] = sortedProducts.slice(0, 3).map((product, i) => ({
      id: `top-${i}`,
      type: 'top_product' as const,
      title: `Top ${i + 1} en Ventas`,
      message: `${product.name} - ${product.units} unidades vendidas ($${product.revenue.toLocaleString()})`,
      timestamp: new Date().toISOString(),
      icon: FiTrendingUp,
      color: 'green.500',
      read: false,
    }));

    return { orderNotifications, paymentNotifications, topProductNotifications, topProducts: sortedProducts };
  };

  // Cargar todos los datos (inicial o manual)
  const fetchAllData = async (forceStockUpdate = false) => {
    setIsLoading(true);
    try {
      const [stockData, ordersData] = await Promise.all([
        fetchStockData(forceStockUpdate),
        fetchOrdersData(),
      ]);

      setLowStockProducts(stockData.lowStock);
      setTopProducts(ordersData.topProducts);

      // Combinar notificaciones SIN incluir las de stock (stock solo aparece en el panel lateral)
      const allNotifications = [
        ...ordersData.orderNotifications,
        ...ordersData.paymentNotifications,
        ...ordersData.topProductNotifications,
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Detectar nuevas notificaciones (solo pedidos y pagos pendientes)
      if (!isFirstLoadRef.current) {
        const newNotificationIds = allNotifications
          .filter(n => n.type === 'order' || n.type === 'awaiting_payment')
          .map(n => n.id);

        const hasNewNotifications = newNotificationIds.some(
          id => !previousNotificationIdsRef.current.has(id)
        );

        if (hasNewNotifications) {
          playNotificationSound();
        }
      }

      // Actualizar referencia de IDs previos
      previousNotificationIdsRef.current = new Set(
        allNotifications
          .filter(n => n.type === 'order' || n.type === 'awaiting_payment')
          .map(n => n.id)
      );
      isFirstLoadRef.current = false;

      setNotifications(allNotifications);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las notificaciones.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar solo pedidos (cada 1 minuto) - NO incluye stock
  const updateOrdersOnly = async () => {
    try {
      const ordersData = await fetchOrdersData();

      setTopProducts(ordersData.topProducts);

      // Combinar notificaciones SIN stock (stock solo en panel lateral)
      const allNotifications = [
        ...ordersData.orderNotifications,
        ...ordersData.paymentNotifications,
        ...ordersData.topProductNotifications,
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Detectar nuevas notificaciones (solo pedidos y pagos pendientes)
      const newNotificationIds = allNotifications
        .filter(n => n.type === 'order' || n.type === 'awaiting_payment')
        .map(n => n.id);

      const hasNewNotifications = newNotificationIds.some(
        id => !previousNotificationIdsRef.current.has(id)
      );

      if (hasNewNotifications) {
        playNotificationSound();
      }

      // Actualizar referencia de IDs previos
      previousNotificationIdsRef.current = new Set(newNotificationIds);

      setNotifications(allNotifications);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error al actualizar pedidos:', error);
    }
  };

  // Efecto inicial - cargar todo
  useEffect(() => {
    fetchAllData();
  }, []);

  // Efecto para actualizar pedidos cada 1 minuto
  useEffect(() => {
    const ordersInterval = setInterval(updateOrdersOnly, ORDERS_UPDATE_INTERVAL);
    return () => clearInterval(ordersInterval);
  }, []);

  // Efecto para verificar si hay que actualizar stock cada 24h (solo actualiza el panel lateral)
  useEffect(() => {
    const stockInterval = setInterval(() => {
      if (shouldUpdateStock()) {
        fetchStockData(true).then((stockData) => {
          setLowStockProducts(stockData.lowStock);
          // NO actualiza las notificaciones principales, solo el panel lateral
        });
      }
    }, STOCK_UPDATE_INTERVAL);
    return () => clearInterval(stockInterval);
  }, []);

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Estadísticas rápidas
  const orderCount = notifications.filter((n) => n.type === 'order').length;
  const awaitingPaymentCount = notifications.filter((n) => n.type === 'awaiting_payment').length;
  const stockCount = lowStockProducts.length;

  // Función para navegar a pedidos
  const goToOrders = () => {
    navigate('/orders');
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box w="100%">
      {/* Encabezado */}
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        mb={4}
        spacing={3}
      >
        <HStack spacing={3} flexWrap="wrap">
          <Heading size={headingSize} color="gray.800">
            Centro de Notificaciones
          </Heading>
          {unreadCount > 0 && (
            <Badge colorScheme="red" fontSize={{ base: 'sm', md: 'md' }} px={3} py={1} borderRadius="full">
              {unreadCount} nuevas
            </Badge>
          )}
        </HStack>
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={2}>
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            variant="outline"
            onClick={() => fetchAllData(true)}
            w={{ base: '100%', sm: 'auto' }}
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<FiCheckCircle />}
            size="sm"
            colorScheme="purple"
            onClick={markAllAsRead}
            isDisabled={unreadCount === 0}
            w={{ base: '100%', sm: 'auto' }}
          >
            Marcar todo leído
          </Button>
        </Stack>
      </Stack>

      {/* Resumen de estadísticas */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 2, md: 4 }} mb={4}>
        <Box bg="blue.50" p={{ base: 3, md: 4 }} borderRadius="lg" borderLeft="4px" borderColor="blue.500">
          <HStack spacing={{ base: 2, md: 3 }}>
            <Icon as={FiShoppingCart} color="blue.500" boxSize={{ base: 5, md: 6 }} />
            <Box>
              <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color="gray.800">{orderCount}</Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">Pedidos Recientes</Text>
            </Box>
          </HStack>
        </Box>
        <Box
          bg="purple.50"
          p={{ base: 3, md: 4 }}
          borderRadius="lg"
          borderLeft="4px"
          borderColor="purple.500"
          cursor="pointer"
          onClick={goToOrders}
          _hover={{ bg: 'purple.100' }}
          transition="background 0.2s"
        >
          <HStack spacing={{ base: 2, md: 3 }}>
            <Icon as={FiDollarSign} color="purple.500" boxSize={{ base: 5, md: 6 }} />
            <Box flex={1}>
              <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color="gray.800">{awaitingPaymentCount}</Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">Confirmar Pagos</Text>
            </Box>
            {awaitingPaymentCount > 0 && (
              <Icon as={FiExternalLink} color="purple.400" boxSize={4} />
            )}
          </HStack>
        </Box>
        <Box bg="red.50" p={{ base: 3, md: 4 }} borderRadius="lg" borderLeft="4px" borderColor="red.500">
          <HStack spacing={{ base: 2, md: 3 }}>
            <Icon as={FiAlertTriangle} color="red.500" boxSize={{ base: 5, md: 6 }} />
            <Box>
              <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color="gray.800">{stockCount}</Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">Productos Bajo Stock</Text>
            </Box>
          </HStack>
        </Box>
        <Box bg="green.50" p={{ base: 3, md: 4 }} borderRadius="lg" borderLeft="4px" borderColor="green.500">
          <HStack spacing={{ base: 2, md: 3 }}>
            <Icon as={FiTrendingUp} color="green.500" boxSize={{ base: 5, md: 6 }} />
            <Box>
              <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color="gray.800">{topProducts.length}</Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">Top Productos</Text>
            </Box>
          </HStack>
        </Box>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Lista de Notificaciones */}
        <Box>
          <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
            <Box p={{ base: 3, md: 4 }} borderBottom="1px" borderColor="gray.200">
              <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" spacing={2}>
                <HStack spacing={2}>
                  <Icon as={FiBell} color="purple.500" />
                  <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold" color="gray.800">
                    Todas las Notificaciones
                  </Text>
                </HStack>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                  Última: {lastUpdate.toLocaleTimeString('es-CO')}
                </Text>
              </Stack>
            </Box>

            <VStack spacing={0} align="stretch" maxH={{ base: '400px', md: '500px' }} overflowY="auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={{ base: 3, md: 4 }}
                    bg={notification.read ? 'white' : (notification.type === 'awaiting_payment' ? 'purple.50' : 'blue.50')}
                    borderBottom="1px"
                    borderColor="gray.100"
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.type === 'awaiting_payment') {
                        goToOrders();
                      }
                    }}
                  >
                    <HStack spacing={3} align="start">
                      <Box
                        bg={notification.color}
                        p={2}
                        borderRadius="md"
                        flexShrink={0}
                      >
                        <Icon as={notification.icon} color="white" boxSize={{ base: 3, md: 4 }} />
                      </Box>
                      <Box flex={1} minW={0}>
                        <Flex justify="space-between" align="start" mb={1} gap={2} wrap="wrap">
                          <HStack spacing={2}>
                            <Text fontWeight="semibold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                              {notification.title}
                            </Text>
                            {notification.type === 'awaiting_payment' && (
                              <Badge colorScheme="purple" fontSize="xs">Acción requerida</Badge>
                            )}
                          </HStack>
                          {!notification.read && notification.type !== 'awaiting_payment' && (
                            <Badge colorScheme="blue" fontSize="xs">Nueva</Badge>
                          )}
                        </Flex>
                        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={2}>
                          {notification.message}
                        </Text>
                        <Flex justify="space-between" align="center" mt={1}>
                          <Text fontSize="xs" color="gray.400">
                            {new Date(notification.timestamp).toLocaleString('es-CO')}
                          </Text>
                          {notification.type === 'awaiting_payment' && (
                            <HStack spacing={1} color="purple.500" fontSize="xs">
                              <Text>Ir a Pedidos</Text>
                              <Icon as={FiExternalLink} boxSize={3} />
                            </HStack>
                          )}
                        </Flex>
                      </Box>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Box p={8} textAlign="center">
                  <Icon as={FiBell} color="gray.300" boxSize={{ base: 8, md: 12 }} mb={4} />
                  <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>No hay notificaciones</Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Box>

        {/* Panel lateral - En móvil aparece debajo */}
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Productos más vendidos */}
          <Box bg="green.50" p={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="sm">
            <HStack spacing={2} mb={{ base: 3, md: 4 }}>
              <Icon as={FiTrendingUp} color="green.500" boxSize={{ base: 4, md: 5 }} />
              <Text fontWeight="semibold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                Productos Más Vendidos
              </Text>
            </HStack>
            <VStack spacing={{ base: 2, md: 3 }} align="stretch">
              {topProducts.map((product, index) => (
                <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="md">
                  <HStack spacing={2} flex={1} minW={0}>
                    <Badge colorScheme={index === 0 ? 'yellow' : 'gray'} fontSize={{ base: 'xs', md: 'sm' }}>
                      #{index + 1}
                    </Badge>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" noOfLines={1}>
                      {product.name}
                    </Text>
                  </HStack>
                  <VStack spacing={0} align="end" flexShrink={0}>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold" color="green.600">
                      ${product.revenue.toLocaleString()}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {product.units} uds
                    </Text>
                  </VStack>
                </HStack>
              ))}
              {topProducts.length === 0 && (
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" textAlign="center">
                  Sin datos de ventas
                </Text>
              )}
            </VStack>
          </Box>

          {/* Alertas de Stock Bajo */}
          <Box bg="red.50" p={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="sm">
            <HStack spacing={2} mb={{ base: 3, md: 4 }}>
              <Icon as={FiAlertTriangle} color="red.500" boxSize={{ base: 4, md: 5 }} />
              <Text fontWeight="semibold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                Alertas de Stock Bajo
              </Text>
            </HStack>
            <VStack spacing={2} align="stretch" maxH={{ base: '200px', md: '250px' }} overflowY="auto">
              {lowStockProducts.slice(0, 10).map((product) => (
                <Box key={product.id} p={{ base: 2, md: 3 }} bg="white" borderRadius="md" borderLeft="3px" borderColor="red.500">
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" noOfLines={1}>
                    {product.name}
                  </Text>
                  <HStack justify="space-between" mt={1}>
                    <Badge colorScheme="red" fontSize="xs">
                      {product.stock} unidades
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      Mín: {product.minStock}
                    </Text>
                  </HStack>
                </Box>
              ))}
              {lowStockProducts.length === 0 && (
                <HStack p={{ base: 2, md: 3 }} bg="white" borderRadius="md">
                  <Icon as={FiCheckCircle} color="green.500" boxSize={{ base: 4, md: 5 }} />
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                    Todos los productos tienen stock suficiente
                  </Text>
                </HStack>
              )}
              {lowStockProducts.length > 10 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  +{lowStockProducts.length - 10} productos más con stock bajo
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Información adicional */}
      <Box mt={6} p={{ base: 3, md: 4 }} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.500">
        <Text fontSize={{ base: 'xs', md: 'sm' }} color="blue.800">
          Los pedidos y pagos se actualizan cada 1 minuto. Las alertas de stock solo aparecen en el panel lateral y se actualizan cada 24 horas.
          {lastStockUpdate && (
            <Text as="span" fontWeight="medium"> (Última: {lastStockUpdate.toLocaleString('es-CO')})</Text>
          )}
        </Text>
      </Box>
    </Box>
  );
}

export default Notifications;
