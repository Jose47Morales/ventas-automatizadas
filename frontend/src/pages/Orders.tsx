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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  VStack,
  Icon,
  Divider,
  Spinner,
  Center,
  Select,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  FiEye,
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiPhone,
  FiUser,
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { ordersAPI } from '../services/api';

// Interface para los items de la orden de la API
interface APIOrderItem {
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
  items: APIOrderItem[];
}

// Interface para las órdenes del componente
interface Order {
  id: string;
  client: string;
  contact: string;
  products: string;
  quantity: number;
  total: number;
  status: string;
  date: string;
  items: APIOrderItem[];
}

// Componente StatCard para las métricas superiores
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  iconBg: string;
}

function StatCard({ title, value, subtitle, icon, iconBg }: StatCardProps) {
  return (
    <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="black" mb={1}>
            {title}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="black" mb={1}>
            {value}
          </Text>
          <Text fontSize="sm" color="black">
            {subtitle}
          </Text>
        </Box>
        <Box bg={iconBg} p={3} borderRadius="md">
          <Icon as={icon} boxSize={6} color="white" />
        </Box>
      </Flex>
    </Box>
  );
}

function Orders() {
  // Estado para el filtro de estado
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Estado para el modal de detalles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Estado para los pedidos cargados desde la API
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Toast para notificaciones
  const toast = useToast();

  // Función para mapear estado de pago de la API al español
  const mapPaymentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      partial: 'Pago Parcial',
    };
    return statusMap[status] || status;
  };

  // Cargar pedidos desde la API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const response = await ordersAPI.getAll();
        const data: APIOrder[] = response.data || response;

        // Mapear los datos de la API al formato del componente
        const mappedOrders: Order[] = data.map((o) => ({
          id: `#${o.id}`,
          client: o.client_name || 'Sin nombre',
          contact: o.client_phone || 'Sin contacto',
          products: o.items.map((item) => item.product_name).join(', '),
          quantity: o.items.reduce((sum, item) => sum + item.quantity, 0),
          total: parseFloat(o.total) || 0,
          status: mapPaymentStatus(o.payment_status),
          date: new Date(o.created_at).toLocaleDateString('es-CO'),
          items: o.items,
        }));
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los pedidos.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Función para abrir el modal con los detalles de la orden
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Opciones de filtro de estado
  const statusOptions = ['Todos', 'Pagado', 'Pendiente', 'Pago Parcial'];

  // Filtrar pedidos según el estado seleccionado
  const filteredOrders = orders.filter((order) => {
    return selectedStatus === 'Todos' || order.status === selectedStatus;
  });

  // Lógica de paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  // Calcular métricas
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === 'Pagado').length;
  const pendingOrders = orders.filter((o) => o.status === 'Pendiente').length;

  // Función para determinar el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pagado':
        return 'green';
      case 'Pendiente':
        return 'orange';
      case 'Pago Parcial':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Mostrar spinner mientras carga
  if (isLoadingOrders) {
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
           Panel de Órdenes
        </Heading>
      </Flex>

      {/* Tarjetas de métricas */}
      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
        <StatCard
          title="Total Pedidos"
          value={totalOrders.toString()}
          subtitle="Pedidos totales"
          icon={FiShoppingCart}
          iconBg="blue.500"
        />
        <StatCard
          title="Pedidos Pagados"
          value={paidOrders.toString()}
          subtitle="Completados"
          icon={FiCheckCircle}
          iconBg="green.500"
        />
        <StatCard
          title="Pedidos Pendientes"
          value={pendingOrders.toString()}
          subtitle="Por confirmar"
          icon={FiClock}
          iconBg="orange.500"
        />
      </Grid>

      {/* Barra de filtros */}
      <Box bg="purple.50" p={4} borderRadius="lg" boxShadow="sm" mb={6}>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="black" fontWeight="medium">
            Filtrar por estado:
          </Text>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="outline"
              size="sm"
            >
              {selectedStatus}
            </MenuButton>
            <MenuList>
              {statusOptions.map((status) => (
                <MenuItem
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
      </Box>

      {/* Tabla de pedidos */}
      <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Text fontSize="md" fontWeight="semibold" color="gray.800">
            Listado de Pedidos - Mostrando {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} de {filteredOrders.length}
          </Text>
        </Box>

        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>ID</Th>
              <Th>Cliente</Th>
              <Th>Contacto</Th>
              <Th>Productos</Th>
              <Th>Cantidad</Th>
              <Th>Total</Th>
              <Th>Estado</Th>
              <Th>Fecha</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <Tr key={order.id}>
                  {/* ID */}
                  <Td fontWeight="bold" color="blue.600">
                    {order.id}
                  </Td>

                  {/* Cliente */}
                  <Td fontWeight="medium" color="gray.700">
                    {order.client}
                  </Td>

                  {/* Contacto */}
                  <Td>
                    <HStack spacing={2}>
                      <Icon as={FiPhone} color="gray.400" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        {order.contact}
                      </Text>
                    </HStack>
                  </Td>

                  {/* Productos */}
                  <Td maxW="250px">
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {order.products}
                    </Text>
                  </Td>

                  {/* Cantidad */}
                  <Td color="gray.600">{order.quantity} uds</Td>

                  {/* Total */}
                  <Td fontWeight="semibold" color="gray.800">
                    ${order.total.toLocaleString()}
                  </Td>

                  {/* Estado */}
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(order.status)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {order.status}
                    </Badge>
                  </Td>

                  {/* Fecha */}
                  <Td color="gray.600">{order.date}</Td>

                  {/* Acciones */}
                  <Td>
                    <IconButton
                      aria-label="Ver detalles"
                      icon={<FiEye />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleViewDetails(order)}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={9} textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg">
                    No se encontraron pedidos
                  </Text>
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    Intenta cambiar los filtros
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
            <Text fontSize="sm" color="gray.600">Pedidos por página:</Text>
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
        bg="yellow.50"
        borderRadius="md"
        borderLeft="4px"
        borderColor="yellow.500"
      >
        <Text fontSize="sm" color="yellow.800">
          ⚠️ <strong>Importante:</strong> Los pedidos con estado "Pendiente"
          requieren confirmación de pago. Revisa la sección de Pagos para más
          detalles.
        </Text>
      </Box>

      {/* Modal de Resumen de Venta */}
      {isModalOpen && selectedOrder && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={handleCloseModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW="550px"
            w="90%"
            maxH="90vh"
            overflow="auto"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box bg="purple.500" color="white" p={4} borderTopRadius="xl" position="relative">
              <HStack spacing={3}>
                <Icon as={FiShoppingCart} boxSize={5} />
                <Text fontSize="lg" fontWeight="bold">Resumen de Venta {selectedOrder.id}</Text>
              </HStack>
              <IconButton
                aria-label="Cerrar"
                icon={<Text fontSize="lg">×</Text>}
                position="absolute"
                right={2}
                top={2}
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'blue.600' }}
                onClick={handleCloseModal}
              />
            </Box>

            {/* Body */}
            <Box p={6}>
              <VStack spacing={5} align="stretch">
                {/* Información del Cliente */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiUser} color="blue.500" />
                    <Text fontWeight="bold" color="gray.700">
                      Información del Cliente
                    </Text>
                  </HStack>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Cliente:</Text>
                        <Text fontWeight="medium">{selectedOrder.client}</Text>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Contacto:</Text>
                        <HStack>
                          <Icon as={FiPhone} color="gray.400" boxSize={4} />
                          <Text fontWeight="medium">{selectedOrder.contact}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>

                <Divider />

                {/* Detalles del Pedido */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiPackage} color="blue.500" />
                    <Text fontWeight="bold" color="gray.700">
                      Detalles del Pedido
                    </Text>
                  </HStack>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Productos:</Text>
                        <Text fontWeight="medium" textAlign="right" maxW="250px">
                          {selectedOrder.products}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Cantidad:</Text>
                        <Text fontWeight="medium">{selectedOrder.quantity} unidades</Text>
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Fecha:</Text>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.400" boxSize={4} />
                          <Text fontWeight="medium">{selectedOrder.date}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>

                <Divider />

                {/* Resumen Financiero */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiDollarSign} color="blue.500" />
                    <Text fontWeight="bold" color="gray.700">
                      Resumen Financiero
                    </Text>
                  </HStack>
                  <Box bg="purple.50" p={4} borderRadius="md">
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Estado de Pago:</Text>
                        <Badge
                          colorScheme={getStatusColor(selectedOrder.status)}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {selectedOrder.status}
                        </Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                          Total:
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="white.600">
                          ${selectedOrder.total.toLocaleString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={4} borderTop="1px" borderColor="gray.200">
              <HStack justify="flex-end" spacing={3}>
                <Button variant="ghost" onClick={handleCloseModal}>
                  Cerrar
                </Button>
                <Button colorScheme="green" leftIcon={<Icon as={FiCheckCircle} />}>
                  Marcar como Pagado
                </Button>
              </HStack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Orders;