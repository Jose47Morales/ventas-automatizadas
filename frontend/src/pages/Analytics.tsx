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
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiPercent,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import CategoryButtons from '../components/CategoryButtons';
import BarChart from '../components/BarChart';

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
  // Métricas principales de ventas
  const stats = [
    {
      title: 'Ventas Totales',
      value: '$328,000',
      change: '+12.5%',
      isPositive: true,
      icon: FiDollarSign,
      iconBg: 'green.500',
    },
    {
      title: 'Pedidos Completados',
      value: '248',
      change: '+8.2%',
      isPositive: true,
      icon: FiShoppingCart,
      iconBg: 'blue.500',
    },
    {
      title: 'Ticket Promedio',
      value: '$1,322',
      change: '+6.3%',
      isPositive: true,
      icon: FiTrendingUp,
      iconBg: 'purple.500',
    },
    {
      title: 'Tasa de Conversión',
      value: '6.87%',
      change: '+1.2%',
      isPositive: true,
      icon: FiPercent,
      iconBg: 'orange.500',
    },
  ];

  // Datos de ventas por día (para gráfico de barras)
  const dailySalesData = [
    { label: 'Lun', value: 12000 },
    { label: 'Mar', value: 15000 },
    { label: 'Mié', value: 10000 },
    { label: 'Jue', value: 18000 },
    { label: 'Vie', value: 22000 },
    { label: 'Sáb', value: 20000 },
    { label: 'Dom', value: 12000 },
  ];

  // Datos de ingresos mensuales (para gráfico de barras)
  const monthlySalesData = [
    { label: 'Ene', value: 45000 },
    { label: 'Feb', value: 32000 },
    { label: 'Mar', value: 28000 },
    { label: 'Abr', value: 35000 },
    { label: 'May', value: 55000 },
    { label: 'Jun', value: 52000 },
  ];

  // Datos de ventas por período
  const salesPeriod = [
    { label: 'Hoy', value: '$12,450' },
    { label: 'Esta Semana', value: '$54,320' },
    { label: 'Este Mes', value: '$67,000' },
    { label: 'Este Año', value: '$328,000' },
  ];

  // Productos más vendidos
  const topProducts = [
    {
      position: 1,
      name: 'Camiseta Básica',
      units: '1240 uds',
      revenue: '$15,500',
      trend: 'up',
    },
    {
      position: 2,
      name: 'Audífonos BT Pro',
      units: '852 uds',
      revenue: '$40,140',
      trend: 'up',
    },
    {
      position: 3,
      name: 'Reloj Inteligente',
      units: '678 uds',
      revenue: '$61,000',
      trend: 'up',
    },
    {
      position: 4,
      name: 'Zapatillas Deportivas',
      units: '524 uds',
      revenue: '$34,060',
      trend: 'down',
    },
    {
      position: 5,
      name: 'Botella Térmica',
      units: '480 uds',
      revenue: '$8,880',
      trend: 'up',
    },
  ];

  return (
    <Box>
      <Box
        minH="0vh"
        w="100vw"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      ></Box>

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
        <CategoryButtons />
      </Flex>

      {/* Tarjetas de métricas principales */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Ventas por período */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
        {salesPeriod.map((period, index) => (
          <Box
            key={index}
            bg="purple.50"
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            borderLeft="4px"
            borderColor="purple.500"
          >
            <Text fontSize="sm" color="gray.600" mb={1}>
              {period.label}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              {period.value}
            </Text>
          </Box>
        ))}
      </Grid>

      {/* Gráficos de barras */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        {/* Gráfico de Ventas Diarias */}
        <BarChart
          title="Ventas Diarias"
          subtitle="Última semana"
          data={dailySalesData}
          barColor="purple.400"
          height={280}
          showValues={false}
        />

        {/* Gráfico de Ingresos Mensuales */}
        <BarChart
          title="Ingresos Mensuales"
          subtitle="Últimos 6 meses"
          data={monthlySalesData}
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
          Top 5 del mes
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
            {topProducts.map((product) => (
              <Tr key={product.position} _hover={{ bg: 'gray.50' }}>
                {/* Posición */}
                <Td>
                  <Tooltip
                    label={`Posición #${product.position} en ventas`}
                    placement="top"
                    hasArrow
                    bg="gray.800"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    px={3}
                    py={2}
                    borderRadius="md"
                    openDelay={0}
                  >
                    <Badge
                      colorScheme={product.position === 1 ? 'purple' : 'gray'}
                      fontSize="md"
                      px={3}
                      py={1}
                      borderRadius="full"
                      cursor="pointer"
                    >
                      {product.position}
                    </Badge>
                  </Tooltip>
                </Td>

                {/* Producto */}
                <Td>
                  <Tooltip
                    label={`Producto: ${product.name}`}
                    placement="top"
                    hasArrow
                    bg="gray.800"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    px={3}
                    py={2}
                    borderRadius="md"
                    openDelay={0}
                  >
                    <Text fontWeight="medium" color="gray.700" cursor="pointer">
                      {product.name}
                    </Text>
                  </Tooltip>
                </Td>

                {/* Unidades Vendidas */}
                <Td>
                  <Tooltip
                    label={`Unidades vendidas: ${product.units}`}
                    placement="top"
                    hasArrow
                    bg="blue.600"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    px={3}
                    py={2}
                    borderRadius="md"
                    openDelay={0}
                  >
                    <Text color="gray.600" cursor="pointer">
                      {product.units}
                    </Text>
                  </Tooltip>
                </Td>

                {/* Valor Total */}
                <Td>
                  <Tooltip
                    label={`Ingresos generados: ${product.revenue}`}
                    placement="top"
                    hasArrow
                    bg="green.600"
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                    px={4}
                    py={2}
                    borderRadius="md"
                    openDelay={0}
                  >
                    <Text fontWeight="semibold" color="gray.800" cursor="pointer">
                      {product.revenue}
                    </Text>
                  </Tooltip>
                </Td>

                {/* Tendencia */}
                <Td>
                  <Tooltip
                    label={`Tendencia: ${product.trend === 'up' ? 'En aumento' : 'En descenso'}`}
                    placement="top"
                    hasArrow
                    bg={product.trend === 'up' ? 'green.600' : 'red.500'}
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    px={3}
                    py={2}
                    borderRadius="md"
                    openDelay={0}
                  >
                    <Box cursor="pointer" display="inline-block">
                      <Icon
                        as={product.trend === 'up' ? FiArrowUp : FiArrowDown}
                        color={product.trend === 'up' ? 'green.500' : 'red.500'}
                        boxSize={5}
                      />
                    </Box>
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

export default Analytics;
