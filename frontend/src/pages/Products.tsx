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
  VStack,
  Text,
  Avatar,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FiEdit2, FiPlus, FiPackage, FiSave, FiX, FiTrash2 } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import { useEnvironment } from '../context/EnvironmentContext';
import CategoryButtons from '../components/CategoryButtons';
import type { Environment } from '../context/EnvironmentContext';

// Interface para los productos
interface Product {
  id: number;
  name: string;
  category: string;
  environment: Environment;
  price: number;
  minQuantity: number;
  discount: number;
  stock: number;
  image: string;
}

function Products() {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');

  // Estado para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast para notificaciones
  const toast = useToast();

  // Contexto del entorno
  const { currentEnvironment } = useEnvironment();

  // Datos de ejemplo de productos con entorno
  const products: Product[] = [
    {
      id: 1,
      name: 'Funda Samsung Galaxy S24',
      category: 'Fundas',
      environment: 'Android',
      price: 15.99,
      minQuantity: 50,
      discount: 10,
      stock: 450,
      image: '📱',
    },
    {
      id: 2,
      name: 'Cargador Rápido USB-C',
      category: 'Cargadores',
      environment: 'Android',
      price: 25.00,
      minQuantity: 30,
      discount: 15,
      stock: 320,
      image: '🔌',
    },
    {
      id: 3,
      name: 'Funda iPhone 15 Pro',
      category: 'Fundas',
      environment: 'iPhone',
      price: 22.99,
      minQuantity: 40,
      discount: 12,
      stock: 280,
      image: '📱',
    },
    {
      id: 4,
      name: 'Cable Lightning Original',
      category: 'Cables',
      environment: 'iPhone',
      price: 35.00,
      minQuantity: 25,
      discount: 8,
      stock: 150,
      image: '🔗',
    },
    {
      id: 5,
      name: 'Audífonos Bluetooth Pro',
      category: 'Audio',
      environment: 'Accesorios',
      price: 45.00,
      minQuantity: 30,
      discount: 18,
      stock: 320,
      image: '🎧',
    },
    {
      id: 6,
      name: 'Mochila Urbana Tech',
      category: 'Mochilas',
      environment: 'Accesorios',
      price: 32.00,
      minQuantity: 20,
      discount: 23,
      stock: 95,
      image: '🎒',
    },
    {
      id: 7,
      name: 'Soporte para Auto',
      category: 'Soportes',
      environment: 'Cacharrería',
      price: 12.50,
      minQuantity: 100,
      discount: 20,
      stock: 500,
      image: '🚗',
    },
    {
      id: 8,
      name: 'Protector de Pantalla Universal',
      category: 'Protectores',
      environment: 'Cacharrería',
      price: 8.00,
      minQuantity: 200,
      discount: 25,
      stock: 1200,
      image: '🛡️',
    },
  ];

  // Categorías disponibles
  const categories = [
    'Todas las categorías',
    'Fundas',
    'Cargadores',
    'Cables',
    'Audio',
    'Mochilas',
    'Soportes',
    'Protectores',
  ];

  // Filtrar productos según búsqueda, categoría y entorno
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Todas las categorías' ||
      product.category === selectedCategory;
    const matchesEnvironment =
      currentEnvironment === 'Todos' ||
      product.environment === currentEnvironment;
    return matchesSearch && matchesCategory && matchesEnvironment;
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

  // Función para abrir el modal de edición
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Función para actualizar el campo del producto en edición
  const handleFieldChange = (field: keyof Product, value: string | number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: value,
      });
    }
  };

  // Función para eliminar producto
  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return;

    try {
      await productsAPI.delete(product.id);
      toast({
        title: 'Producto eliminado',
        description: `${product.name} se ha eliminado correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Aquí podrías recargar los productos desde la API
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto. Intenta de nuevo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Función para guardar los cambios
  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      // Llamar a la API para actualizar el producto
      await productsAPI.update(editingProduct.id, {
        nombre: editingProduct.name,
        categoria: editingProduct.category,
        precio: editingProduct.price,
        cantidad_minima: editingProduct.minQuantity,
        descuento: editingProduct.discount,
        stock: editingProduct.stock,
      });

      toast({
        title: 'Producto actualizado',
        description: `${editingProduct.name} se ha actualizado correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleCloseEditModal();
      // Aquí podrías recargar los productos desde la API
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto. Intenta de nuevo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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
          Panel de Productos
        </Heading>
        <CategoryButtons />
      </Flex>
      {/* Botón de agregar producto */}
        <Button
          leftIcon={<FiPlus />}
          colorScheme="purple"
          size="md"
          onClick={() => alert('Función de agregar producto próximamente')}
        >
          Agregar Producto
        </Button>
      
      {/* Barra de búsqueda y filtros */}
      <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm" mb={6}>
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
      <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden">
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
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Editar producto"
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEditProduct(product)}
                      />
                      <IconButton
                        aria-label="Eliminar producto"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteProduct(product)}
                      />
                    </HStack>
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

      {/* Modal de Edición de Producto */}
      {isEditModalOpen && editingProduct && (
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
          onClick={handleCloseEditModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW="500px"
            w="90%"
            maxH="90vh"
            overflow="auto"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box bg="purple.500" color="white" p={4} borderTopRadius="xl" position="relative">
              <HStack spacing={3}>
                <Icon as={FiPackage} boxSize={5} />
                <Text fontSize="lg" fontWeight="bold">Editar Producto</Text>
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
                _hover={{ bg: 'blue.600' }}
                onClick={handleCloseEditModal}
              />
            </Box>

            {/* Body - Formulario */}
            <Box p={6}>
              <VStack spacing={4} align="stretch">
                {/* Nombre del producto */}
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium">
                    Nombre del Producto
                  </FormLabel>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Nombre del producto"
                  />
                </FormControl>

                {/* Categoría */}
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium">
                    Categoría
                  </FormLabel>
                  <Select
                    value={editingProduct.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  >
                    {categories.filter(c => c !== 'Todas las categorías').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Divider />

                {/* Precio y Descuento en una fila */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Unitario ($)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.price}
                      onChange={(_, value) => handleFieldChange('price', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Descuento (%)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.discount}
                      onChange={(_, value) => handleFieldChange('discount', value || 0)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Cantidad Mínima y Stock en una fila */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Cantidad Mínima
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.minQuantity}
                      onChange={(_, value) => handleFieldChange('minQuantity', value || 0)}
                      min={1}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Stock Disponible
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.stock}
                      onChange={(_, value) => handleFieldChange('stock', value || 0)}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Vista previa del precio con descuento */}
                <Box bg="purple.50" p={3} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="black" fontWeight="medium">
                      Precio con descuento:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="white.600">
                      ${(editingProduct.price * (1 - editingProduct.discount / 100)).toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={4} borderTop="1px" borderColor="gray.200">
              <HStack justify="flex-end" spacing={3}>
                <Button
                  variant="ghost"
                  onClick={handleCloseEditModal}
                  leftIcon={<FiX />}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleSaveProduct}
                  isLoading={isLoading}
                  leftIcon={<FiSave />}
                >
                  Guardar Cambios
                </Button>
              </HStack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Products;