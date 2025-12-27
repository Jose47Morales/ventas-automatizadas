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
  Spinner,
  Center,
  Select,
  IconButton,
  Button,
  useToast,
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
  // Estado para los pagos cargados desde la API
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Toast para notificaciones
  const toast = useToast();

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
    <Box>
      {/* Encabezado */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">
          Panel de Pagos
        </Heading>
      </Flex>

      {/* Tarjetas de métricas principales */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </Grid>

      {/* Sección de Resumen Contable */}
      <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm" mb={6}>
        <Heading size="md" mb={4} color="black">
          Resumen Contable
        </Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
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
        </Grid>
      </Box>

      {/* Historial de Pagos */}
      <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Text fontSize="md" fontWeight="semibold" color="gray.800">
            Historial de Pagos - Mostrando {startIndex + 1}-{Math.min(endIndex, payments.length)} de {payments.length}
          </Text>
        </Box>

        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID Pago</Th>
              <Th>Orden</Th>
              <Th>Cliente</Th>
              <Th>Monto</Th>
              <Th>Estado</Th>
              <Th>Fecha</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment) => (
                <Tr key={payment.id}>
                  <Td fontWeight="bold" color="blue.600">
                    {payment.id}
                  </Td>
                  <Td fontWeight="medium" color="gray.700">
                    {payment.order}
                  </Td>
                  <Td color="gray.600">{payment.client}</Td>
                  <Td fontWeight="semibold" color="gray.800">
                    ${payment.amount.toLocaleString()}
                  </Td>
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
                  <Td color="gray.600">{payment.date}</Td>
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

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4} p={4} bg="white" borderRadius="lg" boxShadow="sm">
          <HStack spacing={2}>
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

          <HStack spacing={2}>
            <IconButton
              aria-label="Primera página"
              icon={<FiChevronsLeft />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(1)}
              isDisabled={currentPage === 1}
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'solid' : 'outline'}
                    colorScheme={currentPage === pageNum ? 'purple' : 'gray'}
                    onClick={() => setCurrentPage(pageNum)}
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
            />
          </HStack>

          <Text fontSize="sm" color="gray.600">
            Página {currentPage} de {totalPages}
          </Text>
        </Flex>
      )}

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
          Los datos de pagos se calculan automáticamente desde las órdenes registradas en el sistema.
        </Text>
      </Box>
    </Box>
  );
}

export default Payments;
