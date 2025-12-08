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
  Button,
  ButtonGroup,
  Progress,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiPackage,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';

// Componente StatsCard: Tarjeta de estadística
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
    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
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

function Dashboard() {
  // Datos de ejemplo para las estadísticas
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
      title: 'Productos Vendidos',
      value: '3,842',
      change: '-2.4%',
      isPositive: false,
      icon: FiPackage,
      iconBg: 'orange.500',
    },
  ];

  // Datos de ejemplo para ventas por día (sin gráfico, con barras)
  const salesData = [
    { day: 'Lun', ventas: 12000, percentage: 54 },
    { day: 'Mar', ventas: 15000, percentage: 68 },
    { day: 'Mié', ventas: 10000, percentage: 45 },
    { day: 'Jue', ventas: 18000, percentage: 82 },
    { day: 'Vie', ventas: 22000, percentage: 100 },
    { day: 'Sáb', ventas: 20000, percentage: 91 },
    { day: 'Dom', ventas: 12000, percentage: 54 },
  ];

  // Datos de ejemplo para productos más vendidos
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

  // Datos de ventas por período
  const salesPeriod = [
    { label: 'Hoy', value: '$12,450' },
    { label: 'Esta Semana', value: '$54,320' },
    { label: 'Este Mes', value: '$67,000' },
    { label: 'Este Año', value: '$328,000' },
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
        <Heading size="lg" color="gray.800">
           Panel de Ventas
        </Heading>
        <ButtonGroup size="sm">
          <Button colorScheme="green" variant="outline">
            Accesorios
          </Button>
          <Button colorScheme="red" variant="outline">
            Cacharrería
          </Button>
          <Button colorScheme="blue" variant="solid">
            Android
          </Button>
          <Button colorScheme="yellow" variant="outline">
            iPhone
          </Button>
        </ButtonGroup>
      </Flex>


      {/* Tarjetas de estadísticas */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Gráficos y tablas */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        {/* Ventas por día (con barras de progreso en lugar de gráfico) */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4} color="gray.800">
            Ventas por Día
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Última semana
          </Text>
          <Box>
            {salesData.map((day, index) => (
              <Box key={index} mb={4}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {day.day}
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    ${day.ventas.toLocaleString()}
                  </Text>
                </Flex>
                <Progress
                  value={day.percentage}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Ventas por período */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4} color="gray.800">
            Ventas por Período
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            {salesPeriod.map((period, index) => (
              <Box
                key={index}
                bg="gray.50"
                p={4}
                borderRadius="md"
                borderLeft="4px"
                borderColor="green.500"
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
        </Box>
      </Grid>

      {/* Tabla de productos más vendidos */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4} color="gray.800">
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
              <Tr key={product.position}>
                <Td>
                  <Badge
                    colorScheme={product.position === 1 ? 'green' : 'gray'}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {product.position}
                  </Badge>
                </Td>
                <Td fontWeight="medium" color="gray.700">
                  {product.name}
                </Td>
                <Td color="gray.600">{product.units}</Td>
                <Td fontWeight="semibold" color="gray.800">
                  {product.revenue}
                </Td>
                <Td>
                  <Icon
                    as={product.trend === 'up' ? FiArrowUp : FiArrowDown}
                    color={product.trend === 'up' ? 'green.500' : 'red.500'}
                    boxSize={5}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

export default Dashboard;