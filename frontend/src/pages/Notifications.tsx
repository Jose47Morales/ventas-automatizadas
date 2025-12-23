import { useState, useEffect } from 'react';
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
  Divider,
  Avatar,
} from '@chakra-ui/react';
import {
  FiBell,
  FiPackage,
  FiAlertTriangle,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import { ordersAPI, productsAPI } from '../services/api';


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
  id_producto: number;
  nombre: string;
  existencias: number;
  stock_minimo: number;
  precioventa_con_impuesto: string;
  categoria: string;
}

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'stock' | 'top_product';
  title: string;
  message: string;
  timestamp: string;
  icon: any;
  color: string;
  read: boolean;
}

interface TopProduct {
  name: string;
  units: number;
  revenue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  minStock: number;
  category: string;
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const toast = useToast();

  // Cargar datos
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
      ]);

      const orders: APIOrder[] = ordersRes.data || ordersRes;
      const products: APIProduct[] = productsRes || [];

      // Generar notificaciones de pedidos recientes (últimas 24 horas)
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentOrders = orders.filter((o) => new Date(o.created_at) > last24h);

      const orderNotifications: Notification[] = recentOrders.map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        title: 'Nuevo Pedido',
        message: `Pedido #${order.id} de ${order.client_name || 'Cliente'} por $${parseFloat(order.total).toLocaleString()}`,
        timestamp: order.created_at,
        icon: FiShoppingCart,
        color: 'blue.500',
        read: false,
      }));

      // Notificaciones de pagos pendientes
      const pendingPayments = orders.filter((o) => o.payment_status === 'pending');
      const paymentNotifications: Notification[] = pendingPayments.slice(0, 5).map((order) => ({
        id: `payment-${order.id}`,
        type: 'payment',
        title: 'Pago Pendiente',
        message: `Pedido #${order.id} - $${parseFloat(order.total).toLocaleString()} pendiente de pago`,
        timestamp: order.created_at,
        icon: FiClock,
        color: 'orange.500',
        read: false,
      }));

      // Productos con bajo stock
      const lowStock = products
        .filter((p) => p.existencias <= (p.stock_minimo || 5))
        .map((p) => ({
          id: p.id_producto,
          name: p.nombre,
          stock: p.existencias,
          minStock: p.stock_minimo || 5,
          category: p.categoria || 'Sin categoría',
        }));

      setLowStockProducts(lowStock);

      const stockNotifications: Notification[] = lowStock.slice(0, 10).map((product) => ({
        id: `stock-${product.id}`,
        type: 'stock',
        title: 'Stock Bajo',
        message: `${product.name} - Solo ${product.stock} unidades disponibles`,
        timestamp: new Date().toISOString(),
        icon: FiAlertTriangle,
        color: 'red.500',
        read: false,
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

      setTopProducts(sortedProducts);

      const topProductNotifications: Notification[] = sortedProducts.slice(0, 3).map((product, i) => ({
        id: `top-${i}`,
        type: 'top_product',
        title: `Top ${i + 1} en Ventas`,
        message: `${product.name} - ${product.units} unidades vendidas ($${product.revenue.toLocaleString()})`,
        timestamp: new Date().toISOString(),
        icon: FiTrendingUp,
        color: 'green.500',
        read: false,
      }));

      // Combinar todas las notificaciones y ordenar por fecha
      const allNotifications = [
        ...orderNotifications,
        ...paymentNotifications,
        ...stockNotifications,
        ...topProductNotifications,
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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

  useEffect(() => {
    fetchData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
  const paymentCount = notifications.filter((n) => n.type === 'payment').length;
  const stockCount = lowStockProducts.length;

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Encabezado */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <Heading size="lg" color="gray.800">
            Centro de Notificaciones
          </Heading>
          {unreadCount > 0 && (
            <Badge colorScheme="red" fontSize="md" px={3} py={1} borderRadius="full">
              {unreadCount} nuevas
            </Badge>
          )}
        </HStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            variant="outline"
            onClick={fetchData}
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<FiCheckCircle />}
            size="sm"
            colorScheme="purple"
            onClick={markAllAsRead}
            isDisabled={unreadCount === 0}
          >
            Marcar todo leído
          </Button>
        </HStack>
      </Flex>

      {/* Resumen de estadísticas */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6 }>
        <Box bg="blue.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="blue.500">
          <HStack spacing={3}>
            <Icon as={FiShoppingCart} color="blue.500" boxSize={6} />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">{orderCount}</Text>
              <Text fontSize="sm" color="gray.600">Pedidos Recientes</Text>
            </Box>
          </HStack>
        </Box>
        <Box bg="orange.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="orange.500">
          <HStack spacing={3}>
            <Icon as={FiDollarSign} color="orange.500" boxSize={6} />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">{paymentCount}</Text>
              <Text fontSize="sm" color="gray.600">Pagos Pendientes</Text>
            </Box>
          </HStack>
        </Box>
        <Box bg="red.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="red.500">
          <HStack spacing={3}>
            <Icon as={FiAlertTriangle} color="red.500" boxSize={6} />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">{stockCount}</Text>
              <Text fontSize="sm" color="gray.600">Productos Bajo Stock</Text>
            </Box>
          </HStack>
        </Box>
        <Box bg="green.50" p={4} borderRadius="lg" borderLeft="4px" borderColor="green.500">
          <HStack spacing={3}>
            <Icon as={FiTrendingUp} color="green.500" boxSize={6} />
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">{topProducts.length}</Text>
              <Text fontSize="sm" color="gray.600">Top Productos</Text>
            </Box>
          </HStack>
        </Box>
      </Grid>

      <Grid templateColumns="2fr 1fr" gap={6}>
        {/* Lista de Notificaciones */}
        <Box>
          <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
            <Box p={4} borderBottom="1px" borderColor="gray.200">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiBell} color="purple.500" />
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    Todas las Notificaciones
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
                </Text>
              </HStack>
            </Box>

            <VStack spacing={0} align="stretch" maxH="500px" overflowY="auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={4}
                    bg={notification.read ? 'white' : 'purple.25'}
                    borderBottom="1px"
                    borderColor="gray.100"
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <HStack spacing={3} align="start">
                      <Box
                        bg={notification.color}
                        p={2}
                        borderRadius="md"
                        flexShrink={0}
                      >
                        <Icon as={notification.icon} color="white" boxSize={4} />
                      </Box>
                      <Box flex={1}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontWeight="semibold" color="gray.800">
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <Badge colorScheme="purple" size="sm">Nueva</Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {notification.message}
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={1}>
                          {new Date(notification.timestamp).toLocaleString('es-CO')}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Box p={8} textAlign="center">
                  <Icon as={FiBell} color="gray.300" boxSize={12} mb={4} />
                  <Text color="gray.500">No hay notificaciones</Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Box>

        {/* Panel lateral */}
        <VStack spacing={6} align="stretch">
          {/* Productos más vendidos */}
          <Box bg="green.50" p={4} borderRadius="lg" boxShadow="sm">
            <HStack spacing={2} mb={4}>
              <Icon as={FiTrendingUp} color="green.500" />
              <Text fontWeight="semibold" color="gray.800">
                Productos Más Vendidos
              </Text>
            </HStack>
            <VStack spacing={3} align="stretch">
              {topProducts.map((product, index) => (
                <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="md">
                  <HStack spacing={2}>
                    <Badge colorScheme={index === 0 ? 'yellow' : 'gray'} fontSize="sm">
                      #{index + 1}
                    </Badge>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1} maxW="120px">
                      {product.name}
                    </Text>
                  </HStack>
                  <VStack spacing={0} align="end">
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      ${product.revenue.toLocaleString()}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {product.units} uds
                    </Text>
                  </VStack>
                </HStack>
              ))}
              {topProducts.length === 0 && (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Sin datos de ventas
                </Text>
              )}
            </VStack>
          </Box>

          {/* Alertas de Stock Bajo */}
          <Box bg="red.50" p={4} borderRadius="lg" boxShadow="sm">
            <HStack spacing={2} mb={4}>
              <Icon as={FiAlertTriangle} color="red.500" />
              <Text fontWeight="semibold" color="gray.800">
                Alertas de Stock Bajo
              </Text>
            </HStack>
            <VStack spacing={2} align="stretch" maxH="250px" overflowY="auto">
              {lowStockProducts.slice(0, 10).map((product) => (
                <Box key={product.id} p={3} bg="white" borderRadius="md" borderLeft="3px" borderColor="red.500">
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
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
                <HStack p={3} bg="white" borderRadius="md">
                  <Icon as={FiCheckCircle} color="green.500" />
                  <Text fontSize="sm" color="gray.600">
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
      <Box mt={6} p={4} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.500">
        <Text fontSize="sm" color="blue.800">
          Las notificaciones se actualizan automáticamente cada 30 segundos. Los productos con stock menor o igual al mínimo configurado aparecen en alertas.
        </Text>
      </Box>
    </Box>
  );
}

export default Notifications;
