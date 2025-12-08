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
  Icon,
  ButtonGroup,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  FiEye,
  FiShoppingCart,
  FiCheckCircle,
  FiClock,
  FiPhone,
} from 'react-icons/fi';

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
          <Icon as={icon} boxSize={6} color="white" />
        </Box>
      </Flex>
    </Box>
  );
}

function Orders() {
  // Estado para el filtro de estado
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Datos de ejemplo de pedidos
  const orders = [
    {
      id: '#1001',
      client: 'Comercial García S.A.',
      contact: '+1 (555) 123-4567',
      products: 'Reloj Inteligente Premium, Audífonos Bluetooth Pro',
      quantity: 150,
      total: 11248.5,
      status: 'Pagado',
      date: '11/11/2025',
    },
    {
      id: '#1002',
      client: 'Distribuidora Central',
      contact: '+1 (555) 234-5678',
      products: 'Camiseta Básica Premium',
      quantity: 500,
      total: 5000.0,
      status: 'Pendiente',
      date: '12/11/2025',
    },
    {
      id: '#1003',
      client: 'Mayorista López',
      contact: '+1 (555) 345-6789',
      products: 'Zapatillas Deportivas, Mochila Urbana',
      quantity: 96,
      total: 4632.0,
      status: 'Pagado',
      date: '13/11/2025',
    },
    {
      id: '#1004',
      client: 'Grupo Empresarial Norte',
      contact: '+1 (555) 456-7890',
      products: 'Botella Térmica Inox',
      quantity: 200,
      total: 3145.0,
      status: 'Pago Parcial',
      date: '13/11/2025',
    },
    {
      id: '#1005',
      client: 'Tiendas El Ahorro',
      contact: '+1 (555) 567-8901',
      products: 'Audífonos Bluetooth Pro, Mochila Urbana',
      quantity: 180,
      total: 6876.0,
      status: 'Pendiente',
      date: '12/11/2025',
    },
  ];

  // Opciones de filtro de estado
  const statusOptions = ['Todos', 'Pagado', 'Pendiente', 'Pago Parcial'];

  // Filtrar pedidos según el estado seleccionado
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === 'Todos') return true;
    return order.status === selectedStatus;
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
      <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={6}>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
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
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
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
                      onClick={() =>
                        alert(`Ver detalles del pedido ${order.id} (próximamente)`)
                      }
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
    </Box>
  );
}

export default Orders;