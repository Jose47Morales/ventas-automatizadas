import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
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
  Spinner,
  Center,
  Select,
  IconButton,
  Button,
  useToast,
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { ordersAPI } from '../services/api';

// Interface para los items de la orden
interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Interface para las órdenes de la API
interface APIOrder {
  id: number;
  client_name: string;
  client_phone: string;
  total: string;
  payment_status: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// Interface para los pagos del componente
interface Payment {
  id: string;
  order: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

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
    <Box bg="purple.50" p={{ base: 4, md: 5 }} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="start">
        <Box flex={1} minW={0}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={1}>
            {title}
          </Text>
          <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" color="gray.800" noOfLines={1}>
            {value}
          </Text>
          <HStack mt={2} spacing={1} flexWrap="wrap">
            <Icon
              as={isPositive ? FiArrowUp : FiArrowDown}
              color={isPositive ? 'green.500' : 'red.500'}
              boxSize={{ base: 3, md: 4 }}
            />
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              color={isPositive ? 'green.500' : 'red.500'}
              fontWeight="medium"
            >
              {change}
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" display={{ base: 'none', lg: 'inline' }}>
              vs mes anterior
            </Text>
          </HStack>
        </Box>
        <Box bg={iconBg} p={{ base: 2, md: 3 }} borderRadius="md" flexShrink={0} ml={2}>
          <Icon as={icon} boxSize={{ base: 4, md: 6 }} color="white" />
        </Box>
      </Flex>
    </Box>
  );
}

function Payments() {
  // Estado para los pagos cargados desde la API
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Toast para notificaciones
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });

  // Función para mapear estado de pago
  const mapPaymentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Completado',
      partial: 'Parcial',
    };
    return statusMap[status] || status;
  };

  // Cargar pagos desde la API de órdenes
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const response = await ordersAPI.getAll();
        const data: APIOrder[] = response.data || response;

        // Mapear las órdenes a formato de pagos
        const mappedPayments: Payment[] = data.map((o) => ({
          id: `#${o.id}`,
          order: `#${o.id}`,
          client: o.client_name || 'Sin nombre',
          amount: parseFloat(o.total) || 0,
          status: mapPaymentStatus(o.payment_status),
          date: new Date(o.created_at).toLocaleDateString('es-CO'),
        }));
        setPayments(mappedPayments);
      } catch (error) {
        console.error('Error al cargar pagos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los pagos.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  // Calcular métricas
  const totalPayments = payments.length;
  const completedPayments = payments.filter((p) => p.status === 'Completado');
  const pendingPayments = payments.filter((p) => p.status === 'Pendiente');

  const confirmedRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const successRate = totalPayments > 0 ? ((completedPayments.length / totalPayments) * 100).toFixed(1) : '0';

  // Datos de métricas principales
  const mainStats = [
    {
      title: 'Ingresos Confirmados',
      value: `$${confirmedRevenue.toLocaleString()}`,
      change: `${completedPayments.length} pagos`,
      isPositive: true,
      icon: FiCheckCircle,
      iconBg: 'green.500',
    },
    {
      title: 'Pagos Pendientes',
      value: `$${pendingRevenue.toLocaleString()}`,
      change: `${pendingPayments.length} pendientes`,
      isPositive: false,
      icon: FiClock,
      iconBg: 'orange.500',
    },
    {
      title: 'Total Transacciones',
      value: totalPayments.toString(),
      change: 'Este mes',
      isPositive: true,
      icon: FiTrendingUp,
      iconBg: 'blue.500',
    },
    {
      title: 'Tasa de Éxito',
      value: `${successRate}%`,
      change: completedPayments.length > 0 ? '+' : '',
      isPositive: true,
      icon: FiDollarSign,
      iconBg: 'purple.500',
    },
  ];

  // Datos del resumen contable
  const accountingSummary = [
    {
      label: 'Ingresos Totales',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: FiArrowUp,
      color: 'green.500',
      bg: 'green.50',
    },
    {
      label: 'Confirmados',
      value: `$${confirmedRevenue.toLocaleString()}`,
      icon: FiCheckCircle,
      color: 'blue.500',
      bg: 'blue.50',
    },
    {
      label: 'Por Cobrar',
      value: `$${pendingRevenue.toLocaleString()}`,
      icon: FiClock,
      color: 'orange.500',
      bg: 'orange.50',
    },
  ];

  // Lógica de paginación
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  // Función para determinar el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'green';
      case 'Pendiente':
        return 'orange';
      case 'Parcial':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Mostrar spinner mientras carga
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
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size={headingSize} color="gray.800">
          Panel de Pagos
        </Heading>
      </Flex>

      {/* Tarjetas de métricas principales */}
      <SimpleGrid columns={{ base: 2, md: 2, lg: 4 }} gap={{ base: 2, md: 4 }} mb={4}>
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </SimpleGrid>

      {/* Sección de Resumen Contable */}
      <Box bg="purple.50" p={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="sm" mb={4}>
        <Heading size={{ base: 'sm', md: 'md' }} mb={3} color="gray.800">
          Resumen Contable
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 2, md: 4 }}>
          {accountingSummary.map((item, index) => (
            <Box
              key={index}
              bg={item.bg}
              p={{ base: 3, md: 4 }}
              borderRadius="md"
              borderLeft="4px"
              borderColor={item.color}
            >
              <Flex justify="space-between" align="center" flexWrap={{ base: 'wrap', sm: 'nowrap' }} gap={2}>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Box bg={item.color} p={2} borderRadius="md" flexShrink={0}>
                    <Icon as={item.icon} color="white" boxSize={{ base: 4, md: 5 }} />
                  </Box>
                  <Text fontWeight="medium" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>
                    {item.label}
                  </Text>
                </HStack>
                <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold" color="gray.800">
                  {item.value}
                </Text>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Historial de Pagos */}
      {isMobile ? (
        /* Vista de tarjetas para móvil */
        <VStack spacing={3} align="stretch">
          <Box bg="purple.50" p={3} borderRadius="lg">
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              Mostrando {startIndex + 1}-{Math.min(endIndex, payments.length)} de {payments.length}
            </Text>
          </Box>
          {paginatedPayments.length > 0 ? (
            paginatedPayments.map((payment) => (
              <Box
                key={payment.id}
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                borderLeft="4px"
                borderColor={getStatusColor(payment.status) + '.500'}
              >
                <Flex justify="space-between" align="start" mb={2}>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color="blue.600" fontSize="sm">
                      {payment.id}
                    </Text>
                    <Text fontWeight="medium" color="gray.700" fontSize="sm">
                      {payment.client}
                    </Text>
                  </VStack>
                  <Badge colorScheme={getStatusColor(payment.status)} fontSize="xs">
                    {payment.status}
                  </Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.500">{payment.date}</Text>
                  <Text fontWeight="bold" color="gray.800">${payment.amount.toLocaleString()}</Text>
                </Flex>
              </Box>
            ))
          ) : (
            <Box p={8} textAlign="center" bg="purple.50" borderRadius="lg">
              <Text color="gray.500">No se encontraron pagos</Text>
            </Box>
          )}
        </VStack>
      ) : (
        /* Vista de tabla para desktop */
        <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Box p={3} borderBottom="1px" borderColor="gray.200">
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Historial de Pagos - Mostrando {startIndex + 1}-{Math.min(endIndex, payments.length)} de {payments.length}
            </Text>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>ID Pago</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Orden</Th>
                  <Th>Cliente</Th>
                  <Th>Monto</Th>
                  <Th>Estado</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Fecha</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment) => (
                    <Tr key={payment.id}>
                      <Td fontWeight="bold" color="blue.600">
                        {payment.id}
                      </Td>
                      <Td fontWeight="medium" color="gray.700" display={{ base: 'none', lg: 'table-cell' }}>
                        {payment.order}
                      </Td>
                      <Td color="gray.600" maxW="150px">
                        <Text noOfLines={1}>{payment.client}</Text>
                      </Td>
                      <Td fontWeight="semibold" color="gray.800">
                        ${payment.amount.toLocaleString()}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(payment.status)}
                          fontSize="xs"
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          {payment.status}
                        </Badge>
                      </Td>
                      <Td color="gray.600" display={{ base: 'none', lg: 'table-cell' }}>{payment.date}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      <Text color="gray.500" fontSize="lg">
                        No se encontraron pagos
                      </Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <Flex
          justify="space-between"
          align="center"
          mt={4}
          p={{ base: 2, md: 4 }}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          flexWrap="wrap"
          gap={2}
        >
          <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" color="gray.600">Pagos por página:</Text>
            <Select
              size="sm"
              w="80px"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </HStack>

          <HStack spacing={{ base: 1, md: 2 }}>
            <IconButton
              aria-label="Primera página"
              icon={<FiChevronsLeft />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(1)}
              isDisabled={currentPage === 1}
              display={{ base: 'none', md: 'flex' }}
            />
            <IconButton
              aria-label="Página anterior"
              icon={<FiChevronLeft />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            />

            <HStack spacing={1}>
              {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                let pageNum;
                const maxButtons = isMobile ? 3 : 5;
                if (totalPages <= maxButtons) {
                  pageNum = i + 1;
                } else if (currentPage <= Math.ceil(maxButtons / 2)) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - Math.floor(maxButtons / 2)) {
                  pageNum = totalPages - maxButtons + 1 + i;
                } else {
                  pageNum = currentPage - Math.floor(maxButtons / 2) + i;
                }
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'solid' : 'outline'}
                    colorScheme={currentPage === pageNum ? 'purple' : 'gray'}
                    onClick={() => setCurrentPage(pageNum)}
                    minW={{ base: '32px', md: '40px' }}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </HStack>

            <IconButton
              aria-label="Página siguiente"
              icon={<FiChevronRight />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
            />
            <IconButton
              aria-label="Última página"
              icon={<FiChevronsRight />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(totalPages)}
              isDisabled={currentPage === totalPages}
              display={{ base: 'none', md: 'flex' }}
            />
          </HStack>

          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
            Página {currentPage} de {totalPages}
          </Text>
        </Flex>
      )}

      {/* Información adicional */}
      <Box
        mt={4}
        p={{ base: 3, md: 4 }}
        bg="green.50"
        borderRadius="md"
        borderLeft="4px"
        borderColor="green.500"
      >
        <Text fontSize={{ base: 'xs', md: 'sm' }} color="green.800">
          Los datos de pagos se calculan automáticamente desde las órdenes registradas en el sistema.
        </Text>
      </Box>
    </Box>
  );
}

export default Payments;
