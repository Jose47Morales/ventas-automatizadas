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
  Progress,
  ButtonGroup,
  Button,
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiPackage,
  FiAlertTriangle,
  FiPercent,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';

// Componente StatCard para las métricas superiores
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor?: string;
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="gray.600" mb={1}>
            {title}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800" mb={1}>
            {value}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {subtitle}
          </Text>
        </Box>
        <Box bg={iconBg} p={3} borderRadius="md">
          <Icon as={icon} boxSize={6} color={iconColor || 'white'} />
        </Box>
      </Flex>
    </Box>
  );
}

function Analytics() {
  // Métricas superiores
  const stats = [
    {
      title: 'Ventas Esta Semana',
      value: '$106,200',
      subtitle: '+24.5% vs semana anterior',
      icon: FiTrendingUp,
      iconBg: 'blue.500',
    },
    {
      title: 'Productos Activos',
      value: '187',
      subtitle: 'En catálogo',
      icon: FiPackage,
      iconBg: 'green.500',
    },
    {
      title: 'Stock Crítico',
      value: '4',
      subtitle: 'Requieren reabastecimiento',
      icon: FiAlertTriangle,
      iconBg: 'orange.50',
      iconColor: 'orange.500',
    },
    {
      title: 'Tasa de Conversión',
      value: '6.87%',
      subtitle: '+1.2% vs mes anterior',
      icon: FiPercent,
      iconBg: 'purple.500',
    },
  ];

  // Datos de ventas por día (para el gráfico de línea simulado con barras)
  const salesByDay = [
    { day: 'Lun', sales: 12000, percentage: 50 },
    { day: 'Mar', sales: 15000, percentage: 62 },
    { day: 'Mié', sales: 10000, percentage: 42 },
    { day: 'Jue', sales: 18000, percentage: 75 },
    { day: 'Vie', sales: 22000, percentage: 92 },
    { day: 'Sáb', sales: 20000, percentage: 83 },
    { day: 'Dom', sales: 12000, percentage: 50 },
  ];

  // Datos del embudo de conversión
  const conversionFunnel = [
    { stage: 'Visitantes', value: 14000, percentage: 100, color: 'green.500' },
    { stage: 'Leads', value: 3500, percentage: 25, color: 'green.400' },
    { stage: 'Pedidos', value: 900, percentage: 6.4, color: 'green.300' },
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
      {/* Encabezado con botones de categoría */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">
           Panel de Analíticas
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

      <Text fontSize="sm" color="gray.600" mb={6}>
        Métricas y reportes de rendimiento
      </Text>

      {/* Tarjetas de métricas superiores */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        {/* Ventas por Día */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={2} color="gray.800">
            Ventas por Día
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Última semana
          </Text>

          {/* Gráfico simulado con líneas y puntos usando CSS */}
          <Box position="relative" h="300px" mb={4}>
            {/* Líneas de cuadrícula horizontales */}
            <Box position="absolute" top="0" left="0" right="0" h="100%">
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  position="absolute"
                  top={`${i * 25}%`}
                  left="0"
                  right="0"
                  h="1px"
                  bg="gray.100"
                />
              ))}
            </Box>

            {/* Línea de ventas simulada */}
            <Flex
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              h="100%"
              align="flex-end"
              justify="space-around"
              px={4}
            >
              {salesByDay.map((day, index) => (
                <Flex
                  key={index}
                  direction="column"
                  align="center"
                  justify="flex-end"
                  h="100%"
                  position="relative"
                  flex={1}
                >
                  {/* Punto del gráfico */}
                  <Box
                    position="absolute"
                    bottom={`${day.percentage}%`}
                    w="12px"
                    h="12px"
                    bg="green.500"
                    borderRadius="full"
                    border="3px solid white"
                    boxShadow="md"
                  />
                  {/* Barra vertical (opcional para mayor claridad) */}
                  <Box
                    w="2px"
                    h={`${day.percentage}%`}
                    bg="green.200"
                    mb={2}
                  />
                </Flex>
              ))}
            </Flex>

            {/* Etiquetas de días */}
            <Flex
              position="absolute"
              bottom="-30px"
              left="0"
              right="0"
              justify="space-around"
              px={4}
            >
              {salesByDay.map((day, index) => (
                <Text
                  key={index}
                  fontSize="xs"
                  color="gray.600"
                  textAlign="center"
                  flex={1}
                >
                  {day.day}
                </Text>
              ))}
            </Flex>
          </Box>
        </Box>

        {/* Embudo de Conversión */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={2} color="gray.800">
            Embudo de Conversión
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Tasa de paso: 28.4%
          </Text>

          <Box>
            {conversionFunnel.map((stage, index) => (
              <Box key={index} mb={6}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium" color="gray.700">
                    {stage.stage}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                      {stage.value.toLocaleString()}
                    </Text>
                    {index > 0 && (
                      <Text fontSize="xs" color="gray.500">
                        ({stage.percentage}%)
                      </Text>
                    )}
                  </HStack>
                </Flex>
                <Progress
                  value={stage.percentage}
                  colorScheme="green"
                  size="lg"
                  borderRadius="full"
                  bg="gray.100"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* Tabla de Productos Más Vendidos */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
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

export default Analytics;