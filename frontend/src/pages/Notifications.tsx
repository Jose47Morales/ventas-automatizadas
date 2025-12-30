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
  id: string;
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
  id: string;
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

  // Responsive values
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });

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
          id: p.id,
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
            onClick={fetchData}
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
        <Box bg="orange.50" p={{ base: 3, md: 4 }} borderRadius="lg" borderLeft="4px" borderColor="orange.500">
          <HStack spacing={{ base: 2, md: 3 }}>
            <Icon as={FiDollarSign} color="orange.500" boxSize={{ base: 5, md: 6 }} />
            <Box>
              <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color="gray.800">{paymentCount}</Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">Pagos Pendientes</Text>
            </Box>
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
                        <Icon as={notification.icon} color="white" boxSize={{ base: 3, md: 4 }} />
                      </Box>
                      <Box flex={1} minW={0}>
                        <Flex justify="space-between" align="start" mb={1} gap={2} wrap="wrap">
                          <Text fontWeight="semibold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <Badge colorScheme="purple" fontSize="xs">Nueva</Badge>
                          )}
                        </Flex>
                        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={2}>
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
          Las notificaciones se actualizan automáticamente cada 30 segundos. Los productos con stock menor o igual al mínimo configurado aparecen en alertas.
        </Text>
      </Box>
    </Box>
  );
}

export default Notifications;
