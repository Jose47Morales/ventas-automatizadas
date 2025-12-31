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
  useBreakpointValue,
  SimpleGrid,
  Stack,
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

// Función para formatear ID: mostrar últimos 8 caracteres en uppercase
const formatOrderId = (id: string | number): string => {
  const idStr = String(id);
  const last8 = idStr.slice(-8);
  return `#${last8.toUpperCase()}`;
};

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
    <Box bg="purple.50" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="start">
        <Box flex={1} minW={0}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="black" mb={1}>
            {title}
          </Text>
          <Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight="bold" color="black" mb={1}>
            {value}
          </Text>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="black">
            {subtitle}
          </Text>
        </Box>
        <Box bg={iconBg} p={{ base: 2, md: 3 }} borderRadius="md" flexShrink={0} ml={2}>
          <Icon as={icon} boxSize={{ base: 4, md: 6 }} color="white" />
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

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });

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
          id: formatOrderId(o.id),
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
    <Box w="100%">
      {/* Encabezado */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size={headingSize} color="gray.800">
           Panel de Órdenes
        </Heading>
      </Flex>

      {/* Tarjetas de métricas */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 2, md: 4 }} mb={4}>
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
      </SimpleGrid>

      {/* Barra de filtros */}
      <Box bg="purple.50" p={{ base: 2, md: 3 }} borderRadius="lg" boxShadow="sm" mb={4}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="black" fontWeight="medium">
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

      {/* Pedidos - Tabla en desktop, Tarjetas en móvil */}
      {isMobile ? (
        /* Vista de tarjetas para móvil */
        <VStack spacing={3} align="stretch">
          <Box bg="purple.50" p={3} borderRadius="lg">
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} de {filteredOrders.length}
            </Text>
          </Box>
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <Box
                key={order.id}
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                borderLeft="4px"
                borderColor={getStatusColor(order.status) + '.500'}
              >
                <Flex justify="space-between" align="start" mb={3}>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2}>
                      <Text fontWeight="bold" color="blue.600" fontSize="sm">
                        {order.id}
                      </Text>
                      <Badge colorScheme={getStatusColor(order.status)} fontSize="xs">
                        {order.status}
                      </Badge>
                    </HStack>
                    <Text fontWeight="medium" color="gray.700" fontSize="sm">
                      {order.client}
                    </Text>
                  </VStack>
                  <IconButton
                    aria-label="Ver detalles"
                    icon={<FiEye />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleViewDetails(order)}
                  />
                </Flex>

                <SimpleGrid columns={2} spacing={2} mb={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Contacto</Text>
                    <HStack spacing={1}>
                      <Icon as={FiPhone} color="gray.400" boxSize={3} />
                      <Text fontSize="xs" color="gray.600">{order.contact}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Fecha</Text>
                    <Text fontSize="xs" color="gray.600">{order.date}</Text>
                  </Box>
                </SimpleGrid>

                <Text fontSize="xs" color="gray.500" noOfLines={1} mb={2}>
                  {order.products}
                </Text>

                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="gray.500">{order.quantity} uds</Text>
                  <Text fontWeight="bold" color="gray.800">${order.total.toLocaleString()}</Text>
                </Flex>
              </Box>
            ))
          ) : (
            <Box p={8} textAlign="center" bg="purple.50" borderRadius="lg">
              <Icon as={FiShoppingCart} color="gray.300" boxSize={12} mb={4} />
              <Text color="gray.500">No se encontraron pedidos</Text>
              <Text color="gray.400" fontSize="sm" mt={2}>Intenta cambiar los filtros</Text>
            </Box>
          )}
        </VStack>
      ) : (
        /* Vista de tabla para desktop */
        <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Box p={4} borderBottom="1px" borderColor="gray.200">
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              Listado de Pedidos - Mostrando {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} de {filteredOrders.length}
            </Text>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>ID</Th>
                  <Th>Cliente</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Contacto</Th>
                  <Th display={{ base: 'none', xl: 'table-cell' }}>Productos</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Cantidad</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Fecha</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="bold" color="blue.600">{order.id}</Td>
                      <Td fontWeight="medium" color="gray.700" maxW="120px">
                        <Text noOfLines={1}>{order.client}</Text>
                      </Td>
                      <Td display={{ base: 'none', lg: 'table-cell' }}>
                        <HStack spacing={2}>
                          <Icon as={FiPhone} color="gray.400" boxSize={4} />
                          <Text fontSize="sm" color="gray.600">{order.contact}</Text>
                        </HStack>
                      </Td>
                      <Td maxW="200px" display={{ base: 'none', xl: 'table-cell' }}>
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>{order.products}</Text>
                      </Td>
                      <Td color="gray.600" display={{ base: 'none', lg: 'table-cell' }}>{order.quantity} uds</Td>
                      <Td fontWeight="semibold" color="gray.800">${order.total.toLocaleString()}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(order.status)} fontSize="xs" px={2} py={1} borderRadius="full">
                          {order.status}
                        </Badge>
                      </Td>
                      <Td color="gray.600" display={{ base: 'none', lg: 'table-cell' }}>{order.date}</Td>
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
                      <Text color="gray.500" fontSize="lg">No se encontraron pedidos</Text>
                      <Text color="gray.400" fontSize="sm" mt={2}>Intenta cambiar los filtros</Text>
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
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', lg: 'center' }}
          mt={4}
          p={{ base: 3, md: 4 }}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          spacing={4}
        >
          <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
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

          <HStack spacing={{ base: 1, md: 2 }} justify="center" flexWrap="wrap">
            <IconButton
              aria-label="Primera página"
              icon={<FiChevronsLeft />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(1)}
              isDisabled={currentPage === 1}
              display={{ base: 'none', sm: 'flex' }}
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
                const visiblePages = isMobile ? 3 : 5;
                const halfVisible = Math.floor(visiblePages / 2);

                if (totalPages <= visiblePages) {
                  pageNum = i + 1;
                } else if (currentPage <= halfVisible + 1) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - halfVisible) {
                  pageNum = totalPages - visiblePages + 1 + i;
                } else {
                  pageNum = currentPage - halfVisible + i;
                }
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'solid' : 'outline'}
                    colorScheme={currentPage === pageNum ? 'purple' : 'gray'}
                    onClick={() => setCurrentPage(pageNum)}
                    minW={{ base: '32px', md: '40px' }}
                    px={{ base: 2, md: 3 }}
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
              display={{ base: 'none', sm: 'flex' }}
            />
          </HStack>

          <Text fontSize="sm" color="gray.600" textAlign={{ base: 'center', lg: 'right' }}>
            Página {currentPage} de {totalPages}
          </Text>
        </Stack>
      )}

      {/* Información adicional */}
      <Box
        mt={6}
        p={{ base: 3, md: 4 }}
        bg="yellow.50"
        borderRadius="md"
        borderLeft="4px"
        borderColor="yellow.500"
      >
        <Text fontSize={{ base: 'xs', md: 'sm' }} color="yellow.800">
          <strong>Importante:</strong> Los pedidos con estado "Pendiente"
          requieren confirmación de pago.
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
          p={{ base: 2, md: 4 }}
          onClick={handleCloseModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW={{ base: '95%', md: '550px' }}
            w="100%"
            maxH={{ base: '95vh', md: '90vh' }}
            overflow="auto"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box bg="purple.500" color="white" p={{ base: 3, md: 4 }} borderTopRadius="xl" position="relative">
              <HStack spacing={3}>
                <Icon as={FiShoppingCart} boxSize={5} />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">Resumen de Venta {selectedOrder.id}</Text>
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
            <Box p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 4, md: 5 }} align="stretch">
                {/* Información del Cliente */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiUser} color="blue.500" boxSize={{ base: 4, md: 5 }} />
                    <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>
                      Información del Cliente
                    </Text>
                  </HStack>
                  <Box bg="gray.50" p={{ base: 3, md: 4 }} borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <Flex justify="space-between" w="100%" direction={{ base: 'column', sm: 'row' }} gap={1}>
                        <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>Cliente:</Text>
                        <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{selectedOrder.client}</Text>
                      </Flex>
                      <Flex justify="space-between" w="100%" direction={{ base: 'column', sm: 'row' }} gap={1}>
                        <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>Contacto:</Text>
                        <HStack>
                          <Icon as={FiPhone} color="gray.400" boxSize={{ base: 3, md: 4 }} />
                          <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{selectedOrder.contact}</Text>
                        </HStack>
                      </Flex>
                    </VStack>
                  </Box>
                </Box>

                <Divider />

                {/* Detalles del Pedido */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiPackage} color="blue.500" boxSize={{ base: 4, md: 5 }} />
                    <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>
                      Detalles del Pedido
                    </Text>
                  </HStack>
                  <Box bg="gray.50" p={{ base: 3, md: 4 }} borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <Box w="100%">
                        <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }} mb={1}>Productos:</Text>
                        <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                          {selectedOrder.products}
                        </Text>
                      </Box>
                      <Flex justify="space-between" w="100%" direction={{ base: 'column', sm: 'row' }} gap={1}>
                        <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>Cantidad:</Text>
                        <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{selectedOrder.quantity} unidades</Text>
                      </Flex>
                      <Flex justify="space-between" w="100%" direction={{ base: 'column', sm: 'row' }} gap={1}>
                        <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>Fecha:</Text>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.400" boxSize={{ base: 3, md: 4 }} />
                          <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{selectedOrder.date}</Text>
                        </HStack>
                      </Flex>
                    </VStack>
                  </Box>
                </Box>

                <Divider />

                {/* Resumen Financiero */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={FiDollarSign} color="blue.500" boxSize={{ base: 4, md: 5 }} />
                    <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>
                      Resumen Financiero
                    </Text>
                  </HStack>
                  <Box bg="purple.50" p={{ base: 3, md: 4 }} borderRadius="md">
                    <VStack align="start" spacing={3}>
                      <Flex justify="space-between" w="100%" align="center" wrap="wrap" gap={2}>
                        <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>Estado de Pago:</Text>
                        <Badge
                          colorScheme={getStatusColor(selectedOrder.status)}
                          fontSize={{ base: 'xs', md: 'sm' }}
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {selectedOrder.status}
                        </Badge>
                      </Flex>
                      <Divider />
                      <Flex justify="space-between" w="100%" align="center" wrap="wrap" gap={2}>
                        <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.700">
                          Total:
                        </Text>
                        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="gray.800">
                          ${selectedOrder.total.toLocaleString()}
                        </Text>
                      </Flex>
                    </VStack>
                  </Box>
                </Box>
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={{ base: 3, md: 4 }} borderTop="1px" borderColor="gray.200">
              <Stack direction={{ base: 'column-reverse', sm: 'row' }} justify="flex-end" spacing={3}>
                <Button variant="ghost" onClick={handleCloseModal} size={{ base: 'sm', md: 'md' }} w={{ base: '100%', sm: 'auto' }}>
                  Cerrar
                </Button>
                <Button colorScheme="green" leftIcon={<Icon as={FiCheckCircle} />} size={{ base: 'sm', md: 'md' }} w={{ base: '100%', sm: 'auto' }}>
                  Marcar como Pagado
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Orders;