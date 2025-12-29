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
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { SearchIcon, BellIcon, ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons';
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
  id: string;
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
  costo: string;
  precio_compra: string;
  impuesto: string;
  nota: string;
}

interface SearchOrder {
  id: string;
  client_name: string;
  client_phone: string;
  total_amount: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  source: string;
  notes: string;
}

// Componente MenuItem: Un item del menú lateral
interface MenuItemProps {
  icon: any;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

function MenuItem({ icon, label, isActive, onClick, collapsed }: MenuItemProps) {
  return (
    <Flex
      align="center"
      gap={3}
      px={collapsed ? 2 : 4}
      py={3}
      borderRadius="md"
      cursor="pointer"
      bg={isActive ? 'green.50' : 'transparent'}
      color={isActive ? 'black.600' : 'gray.600'}
      _hover={{ bg: 'green.50', color: 'green.600' }}
      onClick={onClick}
      transition="all 0.2s"
      justify={collapsed ? 'center' : 'flex-start'}
    >
      <Icon as={icon} boxSize={5} />
      {!collapsed && (
        <Text fontWeight={isActive ? 'semibold' : 'medium'} fontSize={{ base: 'sm', md: 'md' }}>
          {label}
        </Text>
      )}
    </Flex>
  );
}

// Componente principal Layout
function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const sidebarWidth = useBreakpointValue({ base: '100%', md: '220px', lg: '250px' });

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
          o.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.client_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id?.toString().includes(searchTerm) ||
          o.order_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.payment_status?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Navegar y cerrar drawer en móvil
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
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

  // Contenido del sidebar (reutilizable para drawer y sidebar fijo)
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Flex align="center" gap={2} mb={8} px={2}>
        <Box
          w={{ base: 8, md: 10 }}
          h={{ base: 8, md: 10 }}
          borderRadius="md"
          overflow="hidden"
          flexShrink={0}
        >
          <img
            src="/logo.png"
            alt="Bodega Mayorista"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
        <Text fontSize={{ base: 'md', md: 'xl' }} fontWeight="bold" color="gray.800" noOfLines={1}>
          BodegaMayorista
        </Text>
      </Flex>

      {/* Menú de navegación */}
      <VStack spacing={1} align="stretch" flex={1}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={isActive(item.path)}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </VStack>

      {/* Información de versión */}
      <Box pt={4} mt="auto">
        <Text fontSize="xs" color="gray.400" textAlign="center">
          Panel Mayorista v1.0.0
        </Text>
      </Box>
    </>
  );

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      {/* SIDEBAR - Solo visible en desktop */}
      {!isMobile && (
        <Box
          w={sidebarWidth}
          bg="purple.50"
          borderRight="1px"
          borderColor="gray.200"
          p={4}
          flexShrink={0}
          display="flex"
          flexDirection="column"
        >
          <SidebarContent />
        </Box>
      )}

      {/* Drawer para móvil */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="purple.50">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menú</DrawerHeader>
          <DrawerBody display="flex" flexDirection="column" p={4}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* CONTENIDO PRINCIPAL */}
      <Flex flex={1} direction="column" overflow="hidden" minW={0}>
        {/* HEADER - Barra superior */}
        <Flex
          h={{ base: '60px', md: '70px' }}
          bg="purple.50"
          borderBottom="1px"
          borderColor="gray.200"
          px={{ base: 3, md: 6 }}
          align="center"
          justify="space-between"
          flexShrink={0}
          gap={2}
        >
          {/* Botón hamburguesa en móvil */}
          {isMobile && (
            <IconButton
              aria-label="Abrir menú"
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={onOpen}
              size="md"
            />
          )}

          {/* Barra de búsqueda */}
          <InputGroup maxW={{ base: '100%', sm: '300px', md: '400px' }} flex={1}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder={isMobile ? 'Buscar...' : 'Buscar productos, pedidos, clientes...'}
              bg="gray.50"
              border="none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              size={{ base: 'sm', md: 'md' }}
            />
          </InputGroup>

          {/* Sección derecha del header */}
          <HStack spacing={{ base: 1, md: 4 }}>
            {/* Notificaciones */}
            <Box position="relative">
              <IconButton
                aria-label="Notificaciones"
                icon={<BellIcon />}
                variant="ghost"
                fontSize={{ base: '18px', md: '20px' }}
                size={{ base: 'sm', md: 'md' }}
                onClick={() => navigate('/notifications')}
              />
              <Badge
                position="absolute"
                top={0}
                right={0}
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
                rightIcon={!isMobile ? <ChevronDownIcon /> : undefined}
                pl={{ base: 1, md: 3 }}
                borderLeft={{ base: 'none', md: '1px' }}
                borderColor="gray.200"
                size={{ base: 'sm', md: 'md' }}
              >
                <HStack spacing={{ base: 1, md: 3 }}>
                  <Avatar size={{ base: 'xs', md: 'sm' }} name={user?.name || 'Admin'} bg="purple.500" />
                  {!isMobile && (
                    <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        {user?.name || 'Admin'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {user?.role || 'Administrador'}
                      </Text>
                    </Box>
                  )}
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
          p={{ base: 3, sm: 4, md: 6, lg: 8 }}
        >
          <Box w="full" maxW="1600px" mx="auto">
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
          p={{ base: 2, md: 4 }}
          onClick={closeSearchModal}
        >
          <Box
            bg="white"
            borderRadius={{ base: 'lg', md: 'xl' }}
            maxW="900px"
            w="100%"
            maxH={{ base: '95vh', md: '85vh' }}
            overflow="hidden"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <Box bg="purple.500" color="white" p={{ base: 3, md: 4 }} position="relative">
              <HStack spacing={2}>
                <Icon as={SearchIcon} boxSize={{ base: 4, md: 5 }} />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" noOfLines={1}>
                  Resultados: "{searchTerm}"
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
            <Flex h={{ base: 'calc(95vh - 60px)', md: 'calc(85vh - 60px)' }} direction={{ base: 'column', md: 'row' }}>
              {/* Panel izquierdo - Lista de resultados */}
              <Box
                w={{ base: '100%', md: selectedItem ? '50%' : '100%' }}
                borderRight={{ base: 'none', md: selectedItem ? '1px' : 'none' }}
                borderBottom={{ base: selectedItem ? '1px' : 'none', md: 'none' }}
                borderColor="gray.200"
                overflow="auto"
                maxH={{ base: selectedItem ? '40vh' : '100%', md: '100%' }}
              >
                {isSearching ? (
                  <Flex justify="center" align="center" h="200px">
                    <VStack spacing={3}>
                      <Spinner size="xl" color="purple.500" thickness="4px" />
                      <Text color="gray.500">Buscando...</Text>
                    </VStack>
                  </Flex>
                ) : (
                  <Tabs colorScheme="purple" size="sm">
                    <TabList px={{ base: 2, md: 4 }} pt={2}>
                      <Tab fontSize={{ base: 'xs', md: 'sm' }}>
                        <HStack spacing={1}>
                          <Icon as={FiPackage} />
                          <Text>Productos ({searchResults.products.length})</Text>
                        </HStack>
                      </Tab>
                      <Tab fontSize={{ base: 'xs', md: 'sm' }}>
                        <HStack spacing={1}>
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
                                key={product.id}
                                p={{ base: 3, md: 4 }}
                                borderBottom="1px"
                                borderColor="gray.100"
                                cursor="pointer"
                                bg={selectedItem && selectedType === 'product' && (selectedItem as SearchProduct).id === product.id ? 'purple.50' : 'white'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => handleSelectProduct(product)}
                              >
                                <Flex justify="space-between" align="start" gap={2} flexWrap={{ base: 'wrap', sm: 'nowrap' }}>
                                  <VStack align="start" spacing={1} flex={1} minW={0}>
                                    <Text fontWeight="semibold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>
                                      {product.nombre}
                                    </Text>
                                    <HStack spacing={1} flexWrap="wrap">
                                      <Badge colorScheme="blue" fontSize="xs">{product.categoria || 'Sin categoría'}</Badge>
                                      <Badge colorScheme="purple" fontSize="xs">{product.marca || 'Sin marca'}</Badge>
                                    </HStack>
                                  </VStack>
                                  <VStack align="end" spacing={1} flexShrink={0}>
                                    <Text fontWeight="bold" color="green.600" fontSize={{ base: 'sm', md: 'md' }}>
                                      ${formatPrice(product.precioventa_con_impuesto || '0')}
                                    </Text>
                                    <Badge colorScheme={getStockColor(product.existencias, product.stock_minimo)} fontSize="xs">
                                      Stock: {product.existencias}
                                    </Badge>
                                  </VStack>
                                </Flex>
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
                                p={{ base: 3, md: 4 }}
                                borderBottom="1px"
                                borderColor="gray.100"
                                cursor="pointer"
                                bg={selectedItem && selectedType === 'order' && (selectedItem as SearchOrder).id === order.id ? 'purple.50' : 'white'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => handleSelectOrder(order)}
                              >
                                <Flex justify="space-between" align="start" gap={2}>
                                  <VStack align="start" spacing={1} flex={1} minW={0}>
                                    <Text fontWeight="semibold" color="gray.800" fontSize={{ base: 'sm', md: 'md' }}>
                                      Pedido #{order.id.slice(0, 8)}...
                                    </Text>
                                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={1}>
                                      {order.client_name || 'Cliente no especificado'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {order.client_phone}
                                    </Text>
                                  </VStack>
                                  <VStack align="end" spacing={1} flexShrink={0}>
                                    <Text fontWeight="bold" color="green.600" fontSize={{ base: 'sm', md: 'md' }}>
                                      ${formatPrice(order.total_amount || 0)}
                                    </Text>
                                    <Badge colorScheme={getOrderStatusColor(order.order_status)} fontSize="xs">
                                      {order.order_status || 'Pendiente'}
                                    </Badge>
                                    <Badge colorScheme={order.payment_status === 'paid' ? 'green' : 'orange'} fontSize="xs">
                                      {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                    </Badge>
                                  </VStack>
                                </Flex>
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
                <Box
                  w={{ base: '100%', md: '50%' }}
                  overflow="auto"
                  bg="gray.50"
                  flex={{ base: 1, md: 'none' }}
                >
                  {selectedType === 'product' && (
                    <Box p={{ base: 4, md: 6 }}>
                      <VStack align="stretch" spacing={4}>
                        <Box textAlign="center" pb={4} borderBottom="1px" borderColor="gray.200">
                          <Box
                            w={{ base: 12, md: 16 }}
                            h={{ base: 12, md: 16 }}
                            bg="purple.100"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            mb={3}
                          >
                            <Icon as={FiPackage} boxSize={{ base: 6, md: 8 }} color="purple.500" />
                          </Box>
                          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="gray.800" noOfLines={2}>
                            {(selectedItem as SearchProduct).nombre}
                          </Text>
                          <HStack justify="center" spacing={2} mt={2} flexWrap="wrap">
                            <Badge colorScheme="blue">{(selectedItem as SearchProduct).categoria || 'Sin categoría'}</Badge>
                            <Badge colorScheme="purple">{(selectedItem as SearchProduct).marca || 'Sin marca'}</Badge>
                          </HStack>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'md', md: 'lg' }}>Información del Producto</Text>

                        <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <HStack spacing={2}>
                                <Icon as={FiTag} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Referencia:</Text>
                              </HStack>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchProduct).referencia || 'N/A'}</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <HStack spacing={2}>
                                <Icon as={FiHash} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Código:</Text>
                              </HStack>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchProduct).codigo_barras || 'N/A'}</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <HStack spacing={2}>
                                <Icon as={FiMapPin} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Ubicación:</Text>
                              </HStack>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchProduct).ubicacion || 'N/A'}</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <HStack spacing={2}>
                                <Icon as={FiUser} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Proveedor:</Text>
                              </HStack>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchProduct).proveedor || 'N/A'}</Text>
                            </Flex>
                          </VStack>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'md', md: 'lg' }}>Precios e Inventario</Text>

                        <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Icon as={FiDollarSign} color="green.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Precio Venta:</Text>
                              </HStack>
                              <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="green.600">
                                ${formatPrice((selectedItem as SearchProduct).precioventa_con_impuesto || '0')}
                              </Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Icon as={FiBox} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Existencias:</Text>
                              </HStack>
                              <Badge
                                colorScheme={getStockColor((selectedItem as SearchProduct).existencias, (selectedItem as SearchProduct).stock_minimo)}
                                fontSize={{ base: 'sm', md: 'md' }}
                                px={3}
                                py={1}
                              >
                                {(selectedItem as SearchProduct).existencias} uds
                              </Badge>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between">
                              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Stock Mínimo:</Text>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchProduct).stock_minimo} uds</Text>
                            </Flex>
                          </VStack>
                        </Box>

                        <Button
                          colorScheme="purple"
                          size={{ base: 'sm', md: 'md' }}
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
                    <Box p={{ base: 4, md: 6 }}>
                      <VStack align="stretch" spacing={4}>
                        <Box textAlign="center" pb={4} borderBottom="1px" borderColor="gray.200">
                          <Box
                            w={{ base: 12, md: 16 }}
                            h={{ base: 12, md: 16 }}
                            bg="blue.100"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            mb={3}
                          >
                            <Icon as={FiShoppingCart} boxSize={{ base: 6, md: 8 }} color="blue.500" />
                          </Box>
                          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="gray.800">
                            Pedido #{(selectedItem as SearchOrder).id.slice(0, 8)}...
                          </Text>
                          <HStack justify="center" spacing={2} mt={2} flexWrap="wrap">
                            <Badge
                              colorScheme={getOrderStatusColor((selectedItem as SearchOrder).order_status)}
                              fontSize={{ base: 'sm', md: 'md' }}
                              px={2}
                              py={1}
                            >
                              {(selectedItem as SearchOrder).order_status || 'Pendiente'}
                            </Badge>
                            <Badge
                              colorScheme={(selectedItem as SearchOrder).payment_status === 'paid' ? 'green' : 'orange'}
                              fontSize={{ base: 'sm', md: 'md' }}
                              px={2}
                              py={1}
                            >
                              {(selectedItem as SearchOrder).payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </HStack>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'md', md: 'lg' }}>Cliente</Text>

                        <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <HStack spacing={2}>
                                <Icon as={FiUser} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Nombre:</Text>
                              </HStack>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchOrder).client_name || 'N/A'}</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <HStack spacing={2}>
                                <Icon as={FiHash} color="gray.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Teléfono:</Text>
                              </HStack>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>{(selectedItem as SearchOrder).client_phone || 'N/A'}</Text>
                            </Flex>
                          </VStack>
                        </Box>

                        <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'md', md: 'lg' }}>Detalles</Text>

                        <Box bg="white" p={{ base: 3, md: 4 }} borderRadius="md" boxShadow="sm">
                          <VStack align="stretch" spacing={3}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={2}>
                                <Icon as={FiDollarSign} color="green.500" boxSize={4} />
                                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Total:</Text>
                              </HStack>
                              <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="green.600">
                                ${formatPrice((selectedItem as SearchOrder).total_amount || 0)}
                              </Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between">
                              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Origen:</Text>
                              <Badge colorScheme="purple">{(selectedItem as SearchOrder).source || 'N/A'}</Badge>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between" flexWrap="wrap" gap={1}>
                              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>Fecha:</Text>
                              <Text fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                                {(selectedItem as SearchOrder).created_at
                                  ? new Date((selectedItem as SearchOrder).created_at).toLocaleString('es-CO')
                                  : 'N/A'}
                              </Text>
                            </Flex>
                          </VStack>
                        </Box>

                        <Button
                          colorScheme="blue"
                          size={{ base: 'sm', md: 'md' }}
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
