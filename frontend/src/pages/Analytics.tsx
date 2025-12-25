import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  HStack,
  Tooltip,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiPercent,
  FiArrowUp,
  FiArrowDown,
  FiMessageCircle,
  FiEye,
  FiUsers,
} from 'react-icons/fi';
import { analyticsAPI, ordersAPI, productsAPI } from '../services/api';
import BarChart from '../components/BarChart';

// Interface para las métricas de la API
interface APIMetric {
  id: number;
  metric_type: string;
  value: string;
  date: string;
}

// Interface para órdenes
interface APIOrder {
  id: number;
  total: string;
  payment_status: string;
  created_at: string;
  items: { product_name: string; quantity: number; total: number }[];
}

// Interface para productos
interface APIProduct {
  id_producto: number;
  nombre: string;
  existencias: number;
  precioventa_con_impuesto: string;
}

// Componente StatsCard con cambio porcentual
interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  iconBg: string;
}

function StatsCard({ title, value, change, isPositive, icon, iconBg }: StatsCardProps) {
  return (
    <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {value}
          </Text>
          <HStack mt={2} spacing={1}>
            <Icon
              as={isPositive ? FiArrowUp : FiArrowDown}
              color={isPositive ? 'green.500' : 'red.500'}
              boxSize={4}
            />
            <Text
              fontSize="sm"
              color={isPositive ? 'green.500' : 'red.500'}
              fontWeight="medium"
            >
              {change}
            </Text>
            <Text fontSize="sm" color="gray.500">
              vs mes anterior
            </Text>
          </HStack>
        </Box>
        <Box bg={iconBg} p={3} borderRadius="md">
          <Icon as={icon} boxSize={6} color="white" />
        </Box>
      </Flex>
    </Box>
  );
}

function Analytics() {
  // Estados para datos de la API
  const [metrics, setMetrics] = useState<APIMetric[]>([]);
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  // Cargar datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [metricsRes, ordersRes, productsRes] = await Promise.all([
          analyticsAPI.getAll(),
          ordersAPI.getAll(),
          productsAPI.getAll(),
        ]);

        setMetrics(Array.isArray(metricsRes) ? metricsRes : []);
        const ordersData = ordersRes.data || ordersRes;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsRes) ? productsRes : []);
      } catch (error) {
        console.error('Error al cargar analíticas:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las analíticas.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calcular métricas de órdenes
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const completedOrders = orders.filter((o) => o.payment_status === 'paid').length;
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calcular métricas de analytics
  const sessionsStarted = metrics.filter((m) => m.metric_type === 'session_started').length;
  const messagesReceived = metrics.filter((m) => m.metric_type === 'message_received').length;
  const messagesSent = metrics.filter((m) => m.metric_type === 'message_sent').length;
  const productViews = metrics.filter((m) => m.metric_type === 'product_view').length;

  // Métricas principales
  const stats = [
    {
      title: 'Ventas Totales',
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${totalOrders} órdenes`,
      isPositive: true,
      icon: FiDollarSign,
      iconBg: 'green.500',
    },
    {
      title: 'Pedidos Completados',
      value: completedOrders.toString(),
      change: `${totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%`,
      isPositive: completedOrders > 0,
      icon: FiShoppingCart,
      iconBg: 'blue.500',
    },
    {
      title: 'Compra Promedio',
      value: `$${averageTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      change: 'por orden',
      isPositive: true,
      icon: FiTrendingUp,
      iconBg: 'purple.500',
    },
    {
      title: 'Sesiones Bot',
      value: sessionsStarted.toString(),
      change: `${messagesReceived} mensajes`,
      isPositive: true,
      icon: FiUsers,
      iconBg: 'orange.500',
    },
  ];

  // Métricas de actividad del bot
  const botMetrics = [
    { label: 'Sesiones Iniciadas', value: sessionsStarted, icon: FiUsers, color: 'blue.500' },
    { label: 'Mensajes Recibidos', value: messagesReceived, icon: FiMessageCircle, color: 'green.500' },
    { label: 'Mensajes Enviados', value: messagesSent, icon: FiMessageCircle, color: 'purple.500' },
    { label: 'Productos Vistos', value: productViews, icon: FiEye, color: 'orange.500' },
  ];

  // Calcular ventas por día de la semana
  const getDayOfWeek = (dateStr: string) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[new Date(dateStr).getDay()];
  };

  const salesByDay = orders.reduce((acc, order) => {
    const day = getDayOfWeek(order.created_at);
    acc[day] = (acc[day] || 0) + (parseFloat(order.total) || 0);
    return acc;
  }, {} as Record<string, number>);

  const dailySalesData = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => ({
    label: day,
    value: salesByDay[day] || 0,
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

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p, i) => ({
      position: i + 1,
      name: p.name,
      units: `${p.units} uds`,
      revenue: `$${p.revenue.toLocaleString()}`,
      trend: 'up' as const,
    }));

  // Mostrar spinner mientras carga
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
        <Box>
          <Heading size="lg" color="gray.800">
            Panel de Ventas y Analíticas
          </Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Métricas y reportes de rendimiento
          </Text>
        </Box>
      </Flex>

      {/* Tarjetas de métricas principales */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Métricas del Bot */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
        {botMetrics.map((metric, index) => (
          <Box
            key={index}
            bg="purple.50"
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px"
            borderColor={metric.color}
          >
            <HStack spacing={3}>
              <Icon as={metric.icon} color={metric.color} boxSize={5} />
              <Box>
                <Text fontSize="sm" color="gray.600">
                  {metric.label}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  {metric.value}
                </Text>
              </Box>
            </HStack>
          </Box>
        ))}
      </Grid>

      {/* Gráfico de Ventas por Día */}
      <Grid templateColumns="1fr" gap={6} mb={6}>
        <BarChart
          title="Ventas por Día de la Semana"
          subtitle="Distribución de ventas"
          data={dailySalesData}
          barColor="purple.400"
          height={280}
          showValues={false}
        />
      </Grid>

      {/* Tabla de Productos Más Vendidos */}
      <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={2} color="gray.800">
          Productos Más Vendidos
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Top 5 por ingresos
        </Text>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Posición</Th>
              <Th>Producto</Th>
              <Th>Unidades Vendidas</Th>
              <Th>Valor Total</Th>
              <Th>Tendencia</Th>
            </Tr>
          </Thead>
          <Tbody>
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <Tr key={product.position} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Badge
                      colorScheme={product.position === 1 ? 'purple' : 'gray'}
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {product.position}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontWeight="medium" color="gray.700">
                      {product.name}
                    </Text>
                  </Td>
                  <Td>
                    <Text color="gray.600">{product.units}</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="semibold" color="gray.800">
                      {product.revenue}
                    </Text>
                  </Td>
                  <Td>
                    <Icon
                      as={product.trend === 'up' ? FiArrowUp : FiArrowDown}
                      color={product.trend === 'up' ? 'green.500' : 'red.500'}
                      boxSize={5}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg">
                    No hay datos de ventas disponibles
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Información adicional */}
      <Box
        mt={6}
        p={4}
        bg="blue.50"
        borderRadius="md"
        borderLeft="4px"
        borderColor="blue.500"
      >
        <Text fontSize="sm" color="blue.800">
          Las métricas se calculan en tiempo real desde las órdenes y la actividad del bot de WhatsApp.
        </Text>
      </Box>
    </Box>
  );
}

export default Analytics;
