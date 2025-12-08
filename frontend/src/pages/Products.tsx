import { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
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
  HStack,
  Text,
  Avatar,
  ButtonGroup,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FiEdit2, FiPlus } from 'react-icons/fi';

function Products() {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');

  // Datos de ejemplo de productos
  const products = [
    {
      id: 1,
      name: 'Reloj Inteligente Premium',
      category: 'Electrónica',
      price: 89.99,
      minQuantity: 50,
      discount: 15,
      stock: 450,
      image: '⌚',
    },
    {
      id: 2,
      name: 'Camiseta Básica Premium',
      category: 'Ropa',
      price: 12.50,
      minQuantity: 100,
      discount: 20,
      stock: 1200,
      image: '👕',
    },
    {
      id: 3,
      name: 'Audífonos Bluetooth Pro',
      category: 'Electrónica',
      price: 45.00,
      minQuantity: 30,
      discount: 18,
      stock: 320,
      image: '🎧',
    },
    {
      id: 4,
      name: 'Zapatillas Deportivas',
      category: 'Calzado',
      price: 65.00,
      minQuantity: 24,
      discount: 25,
      stock: 180,
      image: '👟',
    },
    {
      id: 5,
      name: 'Mochila Urbana',
      category: 'Accesorios',
      price: 32.00,
      minQuantity: 20,
      discount: 23,
      stock: 95,
      image: '🎒',
    },
    {
      id: 6,
      name: 'Botella Térmica Inox',
      category: 'Hogar',
      price: 18.50,
      minQuantity: 48,
      discount: 15,
      stock: 620,
      image: '🍶',
    },
  ];

  // Categorías disponibles
  const categories = [
    'Todas las categorías',
    'Electrónica',
    'Ropa',
    'Calzado',
    'Accesorios',
    'Hogar',
  ];

  // Filtrar productos según búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todas las categorías' ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Función para determinar el color del badge de stock
  const getStockColor = (stock: number) => {
    if (stock > 500) return 'green';
    if (stock > 100) return 'yellow';
    return 'red';
  };

  // Función para determinar el texto del badge de stock
  const getStockLabel = (stock: number) => {
    if (stock > 500) return 'Alto';
    if (stock > 100) return 'Medio';
    return 'Bajo';
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
           Panel de Productos
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
      {/* Botón de agregar producto */}
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          size="md"
          onClick={() => alert('Función de agregar producto próximamente')}
        >
          Agregar Producto
        </Button>
      
      {/* Barra de búsqueda y filtros */}
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mb={6}>
        <Flex gap={4} align="center">
          {/* Buscador */}
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.50"
              border="none"
            />
          </InputGroup>

          {/* Filtro de categorías */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="outline"
              minW="200px"
            >
              {selectedCategory}
            </MenuButton>
            <MenuList>
              {categories.map((category) => (
                <MenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        {/* Contador de resultados */}
        <Text mt={4} fontSize="sm" color="gray.600">
          Mostrando {filteredProducts.length} de {products.length} productos
        </Text>
      </Box>

      {/* Tabla de productos */}
      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Producto</Th>
              <Th>Categoría</Th>
              <Th>Precio Unitario</Th>
              <Th>Cant. Mínima</Th>
              <Th>Descuento</Th>
              <Th>Stock</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Tr key={product.id}>
                  {/* Producto con imagen */}
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={product.name}
                        bg="gray.200"
                        icon={
                          <Text fontSize="xl">{product.image}</Text>
                        }
                      />
                      <Text fontWeight="medium" color="gray.700">
                        {product.name}
                      </Text>
                    </HStack>
                  </Td>

                  {/* Categoría */}
                  <Td>
                    <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                      {product.category}
                    </Badge>
                  </Td>

                  {/* Precio */}
                  <Td fontWeight="semibold" color="gray.800">
                    ${product.price.toFixed(2)}
                  </Td>

                  {/* Cantidad mínima */}
                  <Td color="gray.600">{product.minQuantity} uds</Td>

                  {/* Descuento */}
                  <Td>
                    <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                      {product.discount}% OFF
                    </Badge>
                  </Td>

                  {/* Stock */}
                  <Td>
                    <HStack spacing={2}>
                      <Text fontWeight="medium" color="gray.800">
                        {product.stock}
                      </Text>
                      <Badge
                        colorScheme={getStockColor(product.stock)}
                        fontSize="xs"
                        px={2}
                        py={1}
                      >
                        {getStockLabel(product.stock)}
                      </Badge>
                    </HStack>
                  </Td>

                  {/* Acciones */}
                  <Td>
                    <IconButton
                      aria-label="Editar producto"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() =>
                        alert(
                          `Editar producto: ${product.name} (próximamente)`
                        )
                      }
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg">
                    No se encontraron productos
                  </Text>
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    Intenta buscar con otros términos
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Información adicional */}
      <Box mt={6} p={4} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.500">
        <Text fontSize="sm" color="blue.800">
          💡 <strong>Tip:</strong> Los productos con stock "Bajo" requieren reabastecimiento pronto.
          Usa los filtros para encontrar productos rápidamente.
        </Text>
      </Box>
    </Box>
  );
}

export default Products;