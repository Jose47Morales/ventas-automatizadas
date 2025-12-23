import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Icon,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem as MenuItemChakra,
  MenuDivider,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart2,
  FiLogOut,
  FiUser,
  FiBell,
  FiX,
  FiMapPin,
  FiTag,
  FiHash,
  FiBox,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { productsAPI, ordersAPI } from '../services/api';

// Interfaces para los resultados de búsqueda
interface SearchProduct {
  id_producto: number;
  nombre: string;
  categoria: string;
  marca: string;
  existencias: number;
  precioventa_con_impuesto: string;
  precio_venta_base: string;
  descuento_maximo_ps: string;
  stock_minimo: number;
  referencia: string;
  codigo_barras: string;
  ubicacion: string;
  proveedor: string;
}

interface SearchOrder {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items?: any[];
}

// Componente MenuItem: Un item del menú lateral
interface MenuItemProps {
  icon: any;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

function MenuItem({ icon, label, isActive, onClick }: MenuItemProps) {
  return (
    <Flex
      align="center"
      gap={3}
      px={4}
      py={3}
      borderRadius="md"
      cursor="pointer"
      bg={isActive ? 'green.50' : 'transparent'}
      color={isActive ? 'black.600' : 'gray.600'}
      _hover={{ bg: 'green.50', color: 'green.600' }}
      onClick={onClick}
      transition="all 0.2s"
    >
      <Icon as={icon} boxSize={5} />
      <Text fontWeight={isActive ? 'semibold' : 'medium'}>
        {label}
      </Text>
    </Flex>
  );
}

// Componente principal Layout
function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const toast = useToast();

  // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: SearchProduct[];
    orders: SearchOrder[];
  }>({ products: [], orders: [] });
  const [selectedItem, setSelectedItem] = useState<SearchProduct | SearchOrder | null>(null);
  const [selectedType, setSelectedType] = useState<'product' | 'order' | null>(null);

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para realizar la búsqueda
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setIsSearchModalOpen(true);

    try {
      // Buscar productos
      const allProducts = await productsAPI.getAll();
      const filteredProducts = allProducts.filter((p: SearchProduct) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Buscar pedidos
      let filteredOrders: SearchOrder[] = [];
      try {
        const allOrders = await ordersAPI.getAll();
        filteredOrders = allOrders.filter((o: SearchOrder) =>
          o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id?.toString().includes(searchTerm) ||
          o.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch {
        // Si no hay endpoint de orders, ignorar
      }

      setSearchResults({
        products: filteredProducts.slice(0, 10),
        orders: filteredOrders.slice(0, 10),
      });
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast({
        title: 'Error',
        description: 'No se pudo realizar la búsqueda.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, toast]);

  // Manejar tecla Enter en búsqueda
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Cerrar modal de búsqueda
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSelectedItem(null);
    setSelectedType(null);
  };

  // Seleccionar un item para ver detalles
  const handleSelectProduct = (product: SearchProduct) => {
    setSelectedItem(product);
    setSelectedType('product');
  };

  const handleSelectOrder = (order: SearchOrder) => {
    setSelectedItem(order);
    setSelectedType('order');
  };

  // Obtener color de estado de stock
  const getStockColor = (stock: number, minStock: number) => {
    if (stock <= 0) return 'red';
    if (stock <= minStock) return 'orange';
    if (stock <= minStock * 2) return 'yellow';
    return 'green';
  };

  // Obtener color de estado de pedido
  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completado':
        return 'green';
      case 'pending':
      case 'pendiente':
        return 'yellow';
      case 'cancelled':
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Formatear precio con separador de miles (formato: 50.000)
  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0';
    return num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Items del menú
  const menuItems = [
    { icon: FiBarChart2, label: 'Ventas y Analíticas', path: '/analytics' },
    { icon: FiPackage, label: 'Productos', path: '/products' },
    { icon: FiShoppingCart, label: 'Pedidos', path: '/orders' },
    { icon: FiDollarSign, label: 'Pagos', path: '/payments' },
    { icon: FiBell, label: 'Notificaciones', path: '/notifications' },
  ];

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      {/* SIDEBAR - Menú lateral */}
      <Box
        w="250px"
        bg="purple.50"
        borderRight="1px"
        borderColor="gray.200"
        p={4}
        flexShrink={0}
      >
        {/* Logo */}
        <Flex align="center" gap={2} mb={8}>
          <Box
            bg="purple.500"
            w={10}
            h={10}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon viewBox="0 0 24 24" color="white" boxSize={6}>
              <path
                fill="currentColor"
                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
              />
            </Icon>
          </Box>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Bodega Mayorista
          </Text>
        </Flex>

        {/* Menú de navegación */}
        <VStack spacing={1} align="stretch">
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={isActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </VStack>

        {/* Información de versión (abajo del sidebar) */}
        <Box position="absolute" bottom={4} left={4} right={4}>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Panel Mayorista v1.0.0
          </Text>
        </Box>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Flex flex={1} direction="column" overflow="hidden" minW={0}>
        {/* HEADER - Barra superior */}
        <Flex
          h="70px"
          bg="purple.50"
          borderBottom="1px"
          borderColor="gray.200"
          px={6}
          align="center"
          justify="space-between"
          flexShrink={0}
        >
          {/* Barra de búsqueda */}
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar productos, pedidos, clientes..."
              bg="gray.50"
              border="none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </InputGroup>

          {/* Sección derecha del header */}
          <HStack spacing={4}>
            {/* Notificaciones */}
            <Box position="relative">
              <IconButton
                aria-label="Notificaciones"
                icon={<BellIcon />}
                variant="ghost"
                fontSize="20px"
                onClick={() => navigate('/notifications')}
              />
              <Badge
                position="absolute"
                top={1}
                right={1}
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
                cursor="pointer"
                onClick={() => navigate('/notifications')}
              >
                *
              </Badge>
            </Box>

            {/* Usuario con menú desplegable */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDownIcon />}
                pl={3}
                borderLeft="1px"
                borderColor="gray.200"
              >
                <HStack spacing={3}>
                  <Avatar size="sm" name={user?.name || 'Admin'} bg="purple.500" />
                  <Box textAlign="left">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      {user?.name || 'Admin'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user?.role || 'Administrador'}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList>
    <MenuItemChakra>
                  <HStack spacing={2}>
                    <Icon as={FiUser} />
                    <Text>Mi Perfil</Text>
                  </HStack>
                </MenuItemChakra>
                <MenuDivider />
                <MenuItemChakra onClick={handleLogout}>
                  <HStack spacing={2}>
                    <Icon as={FiLogOut} color="red.500" />
                    <Text color="red.500">Cerrar Sesión</Text>
                  </HStack>
                </MenuItemChakra>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* ÁREA DE CONTENIDO - Aquí se renderizan las páginas */}
        <Box
          flex={1}
          overflow="auto"
          bg="gray.50"
          p={8}
        >
          <Box maxW="1400px" mx="auto" w="full">
            {/* Outlet es donde se muestran las páginas hijas (Dashboard, Products, etc.) */}
            <Outlet />
          </Box>
        </Box>
      </Flex>

      {/* Modal de Resultados de Búsqueda */}
      {isSearchModalOpen && (
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
          onClick={closeSearchModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW="900px"
            w="95%"
            maxH="85vh"
            overflow="hidden"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <Box bg="purple.500" color="white" p={4} position="relative">
              <HStack spacing={3}>
                <Icon as={SearchIcon} boxSize={5} />
                <Text fontSize="lg" fontWeight="bold">
                  Resultados de búsqueda: "{searchTerm}"
                </Text>
              </HStack>
              <IconButton
                aria-label="Cerrar"
                icon={<FiX />}
                position="absolute"
                right={2}
                top={2}
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'purple.600' }}
                onClick={closeSearchModal}
              />
            </Box>

            {/* Contenido del Modal */}
            <Flex h="calc(85vh - 60px)">
              {/* Panel izquierdo - Lista de resultados */}
              <Box w={selectedItem ? "50%" : "100%"} borderRight={selectedItem ? "1px" : "none"} borderColor="gray.200" overflow="auto">
                {isSearching ? (
                  <Flex justify="center" align="center" h="200px">
                    <VStack spacing={3}>
                      <Spinner size="xl" color="purple.500" thickness="4px" />
                      <Text color="gray.500">Buscando...</Text>
                    </VStack>
                  </Flex>
                ) : (
                  <Tabs colorScheme="purple" size="sm">
                    <TabList px={4} pt={2}>
                      <Tab>
                        <HStack spacing={2}>
                          <Icon as={FiPackage} />
                          <Text>Productos ({searchResults.products.length})</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <Icon as={FiShoppingCart} />
                          <Text>Pedidos ({searchResults.orders.length})</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* Panel de Productos */}
                      <TabPanel p={0}>
                        {searchResults.products.length === 0 ? (
                          <Flex justify="center" align="center" h="150px">
                            <Text color="gray.500">No se encontraron productos</Text>
                          </Flex>
                        ) : (
                          <VStack spacing={0} align="stretch">
                            {searchResults.products.map((product) => (
                              <Box
                                key={product.id_producto}
                                p={4}
                                borderBottom="1px"
                                borderColor="gray.100"
                                cursor="pointer"
                                bg={selectedItem && selectedType === 'product' && (selectedItem as SearchProduct).id_producto === product.id_producto ? 'purple.50' : 'white'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => handleSelectProduct(product)}
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="semibold" color="gray.800">
                                      {product.nombre}
                                    </Text>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="blue" size="sm">{product.categoria || 'Sin categoría'}</Badge>
                                      <Badge colorScheme="purple" size="sm">{product.marca || 'Sin marca'}</Badge>
                                    </HStack>
                                  </VStack>
                                  <VStack align="end" spacing={1}>
                                    <Text fontWeight="bold" color="green.600">
                                      ${formatPrice(product.precioventa_con_impuesto || '0')}
                                    </Text>
                                    <Badge colorScheme={getStockColor(product.existencias, product.stock_minimo)}>
                                      Stock: {product.existencias}
                                    </Badge>
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </TabPanel>

                      {/* Panel de Pedidos */}
                      <TabPanel p={0}>
                        {searchResults.orders.length === 0 ? (
                          <Flex justify="center" align="center" h="150px">
                            <Text color="gray.500">No se encontraron pedidos</Text>
                          </Flex>
                        ) : (
                          <VStack spacing={0} align="stretch">
                            {searchResults.orders.map((order) => (
                              <Box
                                key={order.id}
                                p={4}
                                borderBottom="1px"
                                borderColor="gray.100"
                                cursor="pointer"
                                bg={selectedItem && selectedType === 'order' && (selectedItem as SearchOrder).id === order.id ? 'purple.50' : 'white'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => handleSelectOrder(order)}
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="semibold" color="gray.800">
                                      Pedido #{order.id}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {order.customer_name || 'Cliente no especificado'}
                                    </Text>
                                  </VStack>
                                  <VStack align="end" spacing={1}>
                                    <Text fontWeight="bold" color="green.600">
                                      ${formatPrice(order.total || 0)}
                                    </Text>
                                    <Badge colorScheme={getOrderStatusColor(order.status)}>
                                      {order.status || 'Pendiente'}
                                    </Badge>
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                )}
              </Box>

              {/* Panel derecho - Detalles del item seleccionado */}
              {selectedItem && (
                <Box w="50%" overflow="auto" bg="gray.50">
                  {selectedType === 'product' && (
                    <Box p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box textAlign="center" pb={4} borderBottom="1px" borderColor="gray.200">
                          <Box
                            w={16}
                            h={16}
                            bg="purple.100"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            mb={3}
                          >
                            <Icon as={FiPackage} boxSize={8} color="purple.500" />
                          </Box>
                          <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            {(selectedItem as SearchProduct).nombre}
                          </Text>
                          <HStack justify="center" spacing={2} mt={2}>
                            <Badge colorScheme="blue">{(selectedItem as SearchProduct).categoria || 'Sin categoría'}</Badge>
                            <Badge colorScheme="purple">{(selectedItem as SearchProduct).marca || 'Sin marca'}</Badge>
                          </HStack>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize="lg">Información del Producto</Text>

                        <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiTag} color="gray.500" />
                                <Text color="gray.600">Referencia:</Text>
                              </HStack>
                              <Text fontWeight="medium">{(selectedItem as SearchProduct).referencia || 'N/A'}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiHash} color="gray.500" />
                                <Text color="gray.600">Código de Barras:</Text>
                              </HStack>
                              <Text fontWeight="medium">{(selectedItem as SearchProduct).codigo_barras || 'N/A'}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiMapPin} color="gray.500" />
                                <Text color="gray.600">Ubicación:</Text>
                              </HStack>
                              <Text fontWeight="medium">{(selectedItem as SearchProduct).ubicacion || 'N/A'}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiUser} color="gray.500" />
                                <Text color="gray.600">Proveedor:</Text>
                              </HStack>
                              <Text fontWeight="medium">{(selectedItem as SearchProduct).proveedor || 'N/A'}</Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize="lg">Precios e Inventario</Text>

                        <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiDollarSign} color="green.500" />
                                <Text color="gray.600">Precio Venta:</Text>
                              </HStack>
                              <Text fontWeight="bold" fontSize="lg" color="green.600">
                                ${formatPrice((selectedItem as SearchProduct).precioventa_con_impuesto || '0')}
                              </Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiDollarSign} color="gray.500" />
                                <Text color="gray.600">Precio Base:</Text>
                              </HStack>
                              <Text fontWeight="medium">
                                ${formatPrice((selectedItem as SearchProduct).precio_venta_base || '0')}
                              </Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiBox} color="gray.500" />
                                <Text color="gray.600">Existencias:</Text>
                              </HStack>
                              <Badge
                                colorScheme={getStockColor((selectedItem as SearchProduct).existencias, (selectedItem as SearchProduct).stock_minimo)}
                                fontSize="md"
                                px={3}
                                py={1}
                              >
                                {(selectedItem as SearchProduct).existencias} unidades
                              </Badge>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <Text color="gray.600">Stock Mínimo:</Text>
                              <Text fontWeight="medium">{(selectedItem as SearchProduct).stock_minimo} unidades</Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Button
                          colorScheme="purple"
                          onClick={() => {
                            closeSearchModal();
                            navigate('/products');
                          }}
                        >
                          Ver en Productos
                        </Button>
                      </VStack>
                    </Box>
                  )}

                  {selectedType === 'order' && (
                    <Box p={6}>
                      <VStack align="stretch" spacing={4}>
                        <Box textAlign="center" pb={4} borderBottom="1px" borderColor="gray.200">
                          <Box
                            w={16}
                            h={16}
                            bg="blue.100"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            mb={3}
                          >
                            <Icon as={FiShoppingCart} boxSize={8} color="blue.500" />
                          </Box>
                          <Text fontSize="xl" fontWeight="bold" color="gray.800">
                            Pedido #{(selectedItem as SearchOrder).id}
                          </Text>
                          <Badge
                            colorScheme={getOrderStatusColor((selectedItem as SearchOrder).status)}
                            fontSize="md"
                            px={3}
                            py={1}
                            mt={2}
                          >
                            {(selectedItem as SearchOrder).status || 'Pendiente'}
                          </Badge>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize="lg">Información del Pedido</Text>

                        <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiUser} color="gray.500" />
                                <Text color="gray.600">Cliente:</Text>
                              </HStack>
                              <Text fontWeight="medium">{(selectedItem as SearchOrder).customer_name || 'No especificado'}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <HStack spacing={2}>
                                <Icon as={FiDollarSign} color="green.500" />
                                <Text color="gray.600">Total:</Text>
                              </HStack>
                              <Text fontWeight="bold" fontSize="lg" color="green.600">
                                ${formatPrice((selectedItem as SearchOrder).total || 0)}
                              </Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <Text color="gray.600">Fecha:</Text>
                              <Text fontWeight="medium">
                                {(selectedItem as SearchOrder).created_at
                                  ? new Date((selectedItem as SearchOrder).created_at).toLocaleDateString()
                                  : 'N/A'}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Button
                          colorScheme="blue"
                          onClick={() => {
                            closeSearchModal();
                            navigate('/orders');
                          }}
                        >
                          Ver en Pedidos
                        </Button>
                      </VStack>
                    </Box>
                  )}
                </Box>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </Flex>
  );
}

export default Layout;