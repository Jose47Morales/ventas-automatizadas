import { useState } from 'react';
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
} from 'react-icons/fi';
import { useEnvironment } from '../context/EnvironmentContext';
import CategoryButtons from '../components/CategoryButtons';
import type { Environment } from '../context/EnvironmentContext';

// Interface para las órdenes
interface Order {
  id: string;
  client: string;
  contact: string;
  products: string;
  environment: Environment;
  quantity: number;
  total: number;
  status: string;
  date: string;
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

  // Función para abrir el modal con los detalles de la orden
  const handleViewDetails = (order: Order) => {
    console.log('Orden seleccionada:', order);
    setSelectedOrder(order);
    setIsModalOpen(true);
    console.log('Modal abierto');
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Contexto del entorno
  const { currentEnvironment } = useEnvironment();

  // Datos de ejemplo de pedidos con entorno
  const orders: Order[] = [
    {
      id: '#1001',
      client: 'Comercial García S.A.',
      contact: '+1 (555) 123-4567',
      products: 'Funda Samsung Galaxy S24, Cargador Rápido USB-C',
      environment: 'Android',
      quantity: 150,
      total: 11248.5,
      status: 'Pagado',
      date: '11/11/2025',
    },
    {
      id: '#1002',
      client: 'Distribuidora Central',
      contact: '+1 (555) 234-5678',
      products: 'Funda iPhone 15 Pro, Cable Lightning',
      environment: 'iPhone',
      quantity: 500,
      total: 5000.0,
      status: 'Pendiente',
      date: '12/11/2025',
    },
    {
      id: '#1003',
      client: 'Mayorista López',
      contact: '+1 (555) 345-6789',
      products: 'Audífonos Bluetooth Pro, Mochila Urbana',
      environment: 'Accesorios',
      quantity: 96,
      total: 4632.0,
      status: 'Pagado',
      date: '13/11/2025',
    },
    {
      id: '#1004',
      client: 'Grupo Empresarial Norte',
      contact: '+1 (555) 456-7890',
      products: 'Soporte para Auto, Protector de Pantalla',
      environment: 'Cacharrería',
      quantity: 200,
      total: 3145.0,
      status: 'Pago Parcial',
      date: '13/11/2025',
    },
    {
      id: '#1005',
      client: 'Tiendas El Ahorro',
      contact: '+1 (555) 567-8901',
      products: 'Cargador Rápido USB-C, Funda Samsung',
      environment: 'Android',
      quantity: 180,
      total: 6876.0,
      status: 'Pendiente',
      date: '12/11/2025',
    },
    {
      id: '#1006',
      client: 'Tech Store Premium',
      contact: '+1 (555) 678-9012',
      products: 'Cable Lightning Original, Funda iPhone 15',
      environment: 'iPhone',
      quantity: 120,
      total: 8540.0,
      status: 'Pagado',
      date: '14/11/2025',
    },
  ];

  // Opciones de filtro de estado
  const statusOptions = ['Todos', 'Pagado', 'Pendiente', 'Pago Parcial'];

  // Filtrar pedidos según el estado seleccionado y el entorno
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'Todos' || order.status === selectedStatus;
    const matchesEnvironment = currentEnvironment === 'Todos' || order.environment === currentEnvironment;
    return matchesStatus && matchesEnvironment;
  });

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
           Panel de Órdenes
        </Heading>
        <CategoryButtons />
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
            Listado de Pedidos ({filteredOrders.length})
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
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