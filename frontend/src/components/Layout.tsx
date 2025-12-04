import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { SearchIcon, BellIcon } from '@chakra-ui/icons';
import {
  FiTrendingUp,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiBarChart2,
} from 'react-icons/fi';

// Componente MenuItem: Un item del menú lateral
interface MenuItemProps {
  icon: any;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

function MenuItem({ icon, label, path, isActive, onClick }: MenuItemProps) {
  return (
    <Flex
      align="center"
      gap={3}
      px={4}
      py={3}
      borderRadius="md"
      cursor="pointer"
      bg={isActive ? 'green.50' : 'transparent'}
      color={isActive ? 'green.600' : 'gray.600'}
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

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Items del menú
  const menuItems = [
    { icon: FiTrendingUp, label: 'Ventas', path: '/' },
    { icon: FiPackage, label: 'Productos', path: '/products' },
    { icon: FiShoppingCart, label: 'Pedidos', path: '/orders' },
    { icon: FiDollarSign, label: 'Pagos', path: '/payments' },
    { icon: FiBarChart2, label: 'Analíticas', path: '/analytics' },
  ];

  return (
    <Flex h="100vh" bg="gray.50">
      {/* SIDEBAR - Menú lateral */}
      <Box
        w="250px"
        bg="white"
        borderRight="1px"
        borderColor="gray.200"
        p={4}
      >
        {/* Logo */}
        <Flex align="center" gap={2} mb={8}>
          <Box
            bg="green.500"
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
            MayorPanel
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
      <Flex flex={1} direction="column" overflow="hidden">
        {/* HEADER - Barra superior */}
        <Flex
          h="70px"
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
          px={6}
          align="center"
          justify="space-between"
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
              />
              <Badge
                position="absolute"
                top={1}
                right={1}
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
              >
                3
              </Badge>
            </Box>

            {/* Usuario */}
            <HStack spacing={3} pl={3} borderLeft="1px" borderColor="gray.200">
              <Avatar size="sm" name="Admin" bg="green.500" />
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Admin
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Administrador
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>

        {/* ÁREA DE CONTENIDO - Aquí se renderizan las páginas */}
        <Box flex={1} overflow="auto" p={6}>
          {/* Outlet es donde se muestran las páginas hijas (Dashboard, Products, etc.) */}
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export default Layout;