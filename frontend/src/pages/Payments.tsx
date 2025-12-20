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
  VStack,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import CategoryButtons from '../components/CategoryButtons';

// Componente StatCard para las métricas superiores
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  iconBg: string;
}

function StatCard({ title, value, change, isPositive, icon, iconBg }: StatCardProps) {
  return (
    <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="black.600" mb={2}>
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="black.800">
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
            <Text fontSize="sm" color="black.500">
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

function Payments() {
  // Datos de métricas principales
  const mainStats = [
    {
      title: 'Ingresos Confirmados',
      value: '$17,453.00',
      change: '+18.2%',
      isPositive: true,
      icon: FiCheckCircle,
      iconBg: 'green.500',
    },
    {
      title: 'Pagos Pendientes',
      value: '$11,876.00',
      change: '2 pendientes',
      isPositive: false,
      icon: FiClock,
      iconBg: 'orange.500',
    },
    {
      title: 'Total Transacciones',
      value: '5',
      change: 'Este mes',
      isPositive: true,
      icon: FiTrendingUp,
      iconBg: 'blue.500',
    },
    {
      title: 'Tasa de Éxito',
      value: '96.8%',
      change: '+2.4%',
      isPositive: true,
      icon: FiDollarSign,
      iconBg: 'purple.500',
    },
  ];

  // Datos del resumen contable
  const accountingSummary = [
    {
      label: 'Ingresos Totales',
      value: '$17,453.00',
      icon: FiArrowUp,
      color: 'green.500',
      bg: 'green.50',
    },
    {
      label: 'Egresos',
      value: '$8,450.00',
      icon: FiArrowDown,
      color: 'red.500',
      bg: 'red.100',
    },
    {
      label: 'Balance Neto',
      value: '$9,003.00',
      icon: FiTrendingUp,
      color: 'blue.500',
      bg: 'blue.50',
    },
  ];

  // Datos de pagos por pasarela
  const paymentGateways = [
    { name: 'Stripe', count: 2, amount: '$6,248.50' },
    { name: 'PayPal', count: 2, amount: '$11,204.50' },
    { name: 'Transferencia', count: 1, amount: '$5,000.00' },
  ];

  // Datos del historial de pagos
  const paymentHistory = [
    {
      id: '#1',
      order: '#1001',
      gateway: 'Stripe',
      code: 'pi_3Q4k4BL9K2bF5uGx',
      amount: 11248.5,
      status: 'Completado',
      date: '11/11/2025',
    },
    {
      id: '#2',
      order: '#1003',
      gateway: 'PayPal',
      code: 'PAY12-HXF2PL4',
      amount: 4632.0,
      status: 'Completado',
      date: '12/11/2025',
    },
    {
      id: '#3',
      order: '#1002',
      gateway: 'Transferencia',
      code: 'TRF-2M25-1M92',
      amount: 5000.0,
      status: 'Pendiente',
      date: '12/11/2025',
    },
    {
      id: '#4',
      order: '#1004',
      gateway: 'Stripe',
      code: 'pi_3Q2u8PRLc6T7ygF2',
      amount: 1572.5,
      status: 'Completado',
      date: '13/11/2025',
    },
    {
      id: '#5',
      order: '#1005',
      gateway: 'PayPal',
      code: 'PAY17-HXF1BM8',
      amount: 6876.0,
      status: 'Pendiente',
      date: '12/11/2025',
    },
  ];

  

  // Función para determinar el color del badge según el estado
  const getStatusColor = (status: string) => {
    return status === 'Completado' ? 'green' : 'orange';
  };

  // Función para determinar el color del badge según la pasarela
  const getGatewayColor = (gateway: string) => {
    switch (gateway) {
      case 'Stripe':
        return 'purple';
      case 'PayPal':
        return 'blue';
      case 'Transferencia':
        return 'teal';
      default:
        return 'gray';
    }
  };

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
          Panel de Pagos
        </Heading>
        <CategoryButtons />
      </Flex>

      {/* Tarjetas de métricas principales */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Sección de Resumen Contable y Pagos por Pasarela */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        {/* Resumen Contable */}
        <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4} color="black">
            Resumen Contable
          </Heading>
          <VStack spacing={4} align="stretch">
            {accountingSummary.map((item, index) => (
              <Box
                key={index}
                bg={item.bg}
                p={4}
                borderRadius="md"
                borderLeft="4px"
                borderColor={item.color}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box bg={item.color} p={2} borderRadius="md">
                      <Icon as={item.icon} color="white" boxSize={5} />
                    </Box>
                    <Text fontWeight="medium" color="gray.700">
                      {item.label}
                    </Text>
                  </HStack>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    {item.value}
                  </Text>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Pagos por Pasarela */}
        <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4} color="black">
            Pagos por Pasarela
          </Heading>
          <VStack spacing={4} align="stretch">
            {paymentGateways.map((gateway, index) => (
              <Box
                key={index}
                p={4}
                borderRadius="md"
                border="1px"
                borderColor="gray.500"
                _hover={{ bg: 'gray.50' }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" color="gray.800" mb={1}>
                      {gateway.name}
                    </Text>
                    <Text fontSize="sm" color="black.500">
                      {gateway.count} pagos
                    </Text>
                  </Box>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    {gateway.amount}
                  </Text>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      </Grid>

      {/* Historial de Pagos */}
      <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Text fontSize="md" fontWeight="semibold" color="gray.800">
            Historial de Pagos
          </Text>
        </Box>

        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID Pago</Th>
              <Th>Orden</Th>
              <Th>Pasarela</Th>
              <Th>Código</Th>
              <Th>Monto</Th>
              <Th>Estado</Th>
              <Th>Fecha</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paymentHistory.map((payment) => (
              <Tr key={payment.id}>
                {/* ID Pago */}
                <Td fontWeight="bold" color="blue.600">
                  {payment.id}
                </Td>

                {/* Orden */}
                <Td fontWeight="medium" color="gray.700">
                  {payment.order}
                </Td>

                {/* Pasarela */}
                <Td>
                  <Badge
                    colorScheme={getGatewayColor(payment.gateway)}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {payment.gateway}
                  </Badge>
                </Td>



                {/* Código */}
                <Td>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    fontFamily="mono"
                    bg="gray.50"
                    px={2}
                    py={1}
                    borderRadius="md"
                    display="inline-block"
                  >
                    {payment.code}
                  </Text>
                </Td>

                {/* Monto */}
                <Td fontWeight="semibold" color="gray.800">
                  ${payment.amount.toLocaleString()}
                </Td>

                {/* Estado */}
                <Td>
                  <Badge
                    colorScheme={getStatusColor(payment.status)}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {payment.status}
                  </Badge>
                </Td>

                {/* Fecha */}
                <Td color="gray.600">{payment.date}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Información adicional */}
      <Box
        mt={6}
        p={4}
        bg="green.50"
        borderRadius="md"
        borderLeft="4px"
        borderColor="green.500"
      >
        <Text fontSize="sm" color="green.800">
          ✅ <strong>Sincronizado:</strong> Los datos de pagos se actualizan
          automáticamente cuando se confirma una transacción en las pasarelas
          de pago.
        </Text>
      </Box>
    </Box>
  );
}

export default Payments;