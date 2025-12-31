import { useState, useEffect } from 'react';
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
  Spinner,
  Center,
  useBreakpointValue,
  Stack,
  SimpleGrid,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FiEdit2, FiPlus, FiPackage, FiSave, FiX, FiTrash2, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { productsAPI } from '../services/api';

// Función para formatear precio en formato colombiano (50.000)
const formatPrice = (price: number): string => {
  return price.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Interface para los productos de la API
interface APIProduct {
  id: string;
  nombre: string;
  categoria: string;
  marca: string;
  existencias: number;
  precioventa_con_impuesto: string;
  precio_venta_base: string;
  descuento_maximo_ps: string;
  stock_minimo: number;
  url_imagen: string | null;
}

// Interface para los productos del componente (vista en tabla)
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  minQuantity: number;
  discount: number;
  stock: number;
  image: string;
}

// Interface para el producto en edición (campos del backend)
interface EditingProduct {
  id: string;
  nombre: string;
  referencia: string;
  codigo_barras: string;
  categoria: string;
  marca: string;
  precioventa_con_impuesto: number;
  precio_venta_base: number;
  precio_compra: number;
  costo: number;
  existencias: number;
  stock_minimo: number;
  descuento_maximo_ps: number;
  impuesto: number;
  ubicacion: string;
  proveedor: string;
  nota: string;
}

function Products() {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');

  // Estado para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el modal de agregar producto
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Estado para el modal de eliminar producto
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newProduct, setNewProduct] = useState({
    nombre: '',
    referencia: '',
    codigo_barras: '',
    categoria: '',
    marca: '',
    precioventa_con_impuesto: 0,
    precio_venta_base: 0,
    precio_compra: 0,
    costo: 0,
    existencias: 0,
    stock_minimo: 1,
    descuento_maximo_ps: 0,
    impuesto: 0,
    ubicacion: '',
    proveedor: '',
    nota: '',
  });

  // Estado para los productos cargados desde la API
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Toast para notificaciones
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: true, lg: false });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const modalWidth = useBreakpointValue({ base: '95%', md: '90%', lg: '600px' });

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const data: APIProduct[] = await productsAPI.getAll();
        // Mapear los datos de la API al formato del componente
        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id,
          name: p.nombre,
          category: p.categoria || 'Sin categoría',
          brand: p.marca || 'Sin marca',
          price: parseFloat(p.precioventa_con_impuesto) || 0,
          minQuantity: p.stock_minimo || 1,
          discount: parseFloat(p.descuento_maximo_ps) || 0,
          stock: p.existencias || 0,
          image: p.url_imagen || '📦',
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los productos.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Categorías disponibles (dinámicas basadas en los productos)
  const categories = [
    'Todas las categorías',
    ...Array.from(new Set(products.map((p) => p.category))).sort(),
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

  // Lógica de paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Función para determinar el color del badge de stock
  const getStockColor = (stock: number) => {
    if (stock > 200) return 'green';
    if (stock > 50) return 'yellow';
    return 'red';
  };

  // Función para determinar el texto del badge de stock
  const getStockLabel = (stock: number) => {
    if (stock > 200) return 'Alto';
    if (stock > 50) return 'Medio';
    return 'Bajo';
  };

  // Función para abrir el modal de edición - carga datos del producto desde la API
  const handleEditProduct = async (product: Product) => {
    try {
      // Cargar el producto completo desde la API
      const fullProduct = await productsAPI.getById(product.id);
      setEditingProduct({
        id: fullProduct.id,
        nombre: fullProduct.nombre || '',
        referencia: fullProduct.referencia || '',
        codigo_barras: fullProduct.codigo_barras || '',
        categoria: fullProduct.categoria || '',
        marca: fullProduct.marca || '',
        precioventa_con_impuesto: parseFloat(fullProduct.precioventa_con_impuesto) || 0,
        precio_venta_base: parseFloat(fullProduct.precio_venta_base) || 0,
        precio_compra: parseFloat(fullProduct.precio_compra) || 0,
        costo: parseFloat(fullProduct.costo) || 0,
        existencias: fullProduct.existencias || 0,
        stock_minimo: fullProduct.stock_minimo || 1,
        descuento_maximo_ps: parseFloat(fullProduct.descuento_maximo_ps) || 0,
        impuesto: fullProduct.impuesto || 0,
        ubicacion: fullProduct.ubicacion || '',
        proveedor: fullProduct.proveedor || '',
        nota: fullProduct.nota || '',
      });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el producto para editar.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Función para actualizar el campo del producto en edición
  const handleFieldChange = (field: keyof EditingProduct, value: string | number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: value,
      });
    }
  };

  // Función para abrir modal de eliminar producto
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Función para cerrar modal de eliminar
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await productsAPI.delete(productToDelete.id);
      toast({
        title: 'Producto eliminado',
        description: `${productToDelete.name} se ha eliminado correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Recargar productos
      const data: APIProduct[] = await productsAPI.getAll();
      const mappedProducts: Product[] = data.map((p) => ({
        id: p.id,
        name: p.nombre,
        category: p.categoria || 'Sin categoría',
        brand: p.marca || 'Sin marca',
        price: parseFloat(p.precioventa_con_impuesto) || 0,
        minQuantity: p.stock_minimo || 1,
        discount: parseFloat(p.descuento_maximo_ps) || 0,
        stock: p.existencias || 0,
        image: p.url_imagen || '📦',
      }));
      setProducts(mappedProducts);

      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto. Intenta de nuevo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para abrir modal de agregar producto
  const handleOpenAddModal = () => {
    setNewProduct({
      nombre: '',
      referencia: '',
      codigo_barras: '',
      categoria: categories.length > 1 ? categories[1] : '',
      marca: '',
      precioventa_con_impuesto: 0,
      precio_venta_base: 0,
      precio_compra: 0,
      costo: 0,
      existencias: 0,
      stock_minimo: 1,
      descuento_maximo_ps: 0,
      impuesto: 0,
      ubicacion: '',
      proveedor: '',
      nota: '',
    });
    setIsAddModalOpen(true);
  };

  // Función para cerrar modal de agregar producto
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Función para actualizar campos del nuevo producto
  const handleNewProductChange = (field: string, value: string | number) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para crear nuevo producto
  const handleCreateProduct = async () => {
    if (!newProduct.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del producto es requerido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await productsAPI.create({
        nombre: newProduct.nombre,
        referencia: newProduct.referencia,
        codigo_barras: newProduct.codigo_barras,
        categoria: newProduct.categoria || 'Sin categoría',
        marca: newProduct.marca || '',
        precioventa_con_impuesto: newProduct.precioventa_con_impuesto,
        precio_venta_base: newProduct.precio_venta_base || newProduct.precioventa_con_impuesto,
        precio_compra: newProduct.precio_compra,
        costo: newProduct.costo,
        existencias: newProduct.existencias,
        stock_minimo: newProduct.stock_minimo,
        descuento_maximo_ps: newProduct.descuento_maximo_ps,
        impuesto: newProduct.impuesto,
        ubicacion: newProduct.ubicacion,
        proveedor: newProduct.proveedor,
        nota: newProduct.nota,
      });

      toast({
        title: 'Producto creado',
        description: `${newProduct.nombre} se ha agregado correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleCloseAddModal();

      // Recargar productos
      const data: APIProduct[] = await productsAPI.getAll();
      const mappedProducts: Product[] = data.map((p) => ({
        id: p.id,
        name: p.nombre,
        category: p.categoria || 'Sin categoría',
        brand: p.marca || 'Sin marca',
        price: parseFloat(p.precioventa_con_impuesto) || 0,
        minQuantity: p.stock_minimo || 1,
        discount: parseFloat(p.descuento_maximo_ps) || 0,
        stock: p.existencias || 0,
        image: p.url_imagen || '📦',
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el producto. Intenta de nuevo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar los cambios
  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    if (!editingProduct.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del producto es requerido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Llamar a la API para actualizar el producto con todos los campos correctos
      await productsAPI.update(editingProduct.id, {
        nombre: editingProduct.nombre,
        referencia: editingProduct.referencia || undefined,
        codigo_barras: editingProduct.codigo_barras || undefined,
        categoria: editingProduct.categoria || undefined,
        marca: editingProduct.marca || undefined,
        precioventa_con_impuesto: editingProduct.precioventa_con_impuesto || 0,
        precio_venta_base: editingProduct.precio_venta_base || editingProduct.precioventa_con_impuesto || 0,
        precio_compra: editingProduct.precio_compra || 0,
        costo: editingProduct.costo || 0,
        existencias: editingProduct.existencias || 0,
        stock_minimo: editingProduct.stock_minimo || 1,
        descuento_maximo_ps: editingProduct.descuento_maximo_ps || 0,
        impuesto: editingProduct.impuesto || 0,
        ubicacion: editingProduct.ubicacion || undefined,
        proveedor: editingProduct.proveedor || undefined,
        nota: editingProduct.nota || undefined,
      });

      toast({
        title: 'Producto actualizado',
        description: `${editingProduct.nombre} se ha actualizado correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleCloseEditModal();

      // Recargar productos para ver los cambios
      const data: APIProduct[] = await productsAPI.getAll();
      const mappedProducts: Product[] = data.map((p) => ({
        id: p.id,
        name: p.nombre,
        category: p.categoria || 'Sin categoría',
        brand: p.marca || 'Sin marca',
        price: parseFloat(p.precioventa_con_impuesto) || 0,
        minQuantity: p.stock_minimo || 1,
        discount: parseFloat(p.descuento_maximo_ps) || 0,
        stock: p.existencias || 0,
        image: p.url_imagen || '📦',
      }));
      setProducts(mappedProducts);
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

  // Mostrar spinner mientras carga
  if (isLoadingProducts) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box w="100%">
      {/* Encabezado */}
      <Flex
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
        mb={4}
      >
        <Heading size={headingSize} color="gray.800">
          Panel de Productos
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="purple"
          size={buttonSize}
          onClick={handleOpenAddModal}
          w={{ base: '100%', sm: 'auto' }}
        >
          Agregar Producto
        </Button>
      </Flex>

      {/* Barra de búsqueda y filtros */}
      <Box bg="purple.50" p={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="sm" mb={4}>
        <Stack direction={{ base: 'column', md: 'row' }} gap={4} align="stretch">
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
              w={{ base: '100%', md: '200px' }}
              textAlign="left"
            >
              <Text isTruncated>
                {selectedCategory === 'Todas las categorías' ? selectedCategory : selectedCategory.toUpperCase()}
              </Text>
            </MenuButton>
            <MenuList maxH="300px" overflowY="auto">
              {categories.map((category) => (
                <MenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'Todas las categorías' ? category : category.toUpperCase()}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Stack>

        {/* Contador de resultados */}
        <Text mt={4} fontSize="sm" color="gray.600">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
        </Text>
      </Box>

      {/* Productos - Tabla en desktop, Tarjetas en móvil */}
      {isMobile ? (
        /* Vista de tarjetas para móvil */
        <VStack spacing={3} align="stretch">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <Box
                key={product.id}
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                borderLeft="4px"
                borderColor="purple.500"
              >
                <Flex justify="space-between" align="start" mb={3}>
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={product.name}
                      bg="gray.200"
                      icon={<Text fontSize="xl">{product.image}</Text>}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" color="gray.800" fontSize="sm" noOfLines={2}>
                        {product.name}
                      </Text>
                      <Badge colorScheme="blue" fontSize="xs">
                        {product.category.toUpperCase()}
                      </Badge>
                    </VStack>
                  </HStack>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Editar"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleEditProduct(product)}
                    />
                    <IconButton
                      aria-label="Eliminar"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteProduct(product)}
                    />
                  </HStack>
                </Flex>

                <SimpleGrid columns={3} spacing={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Precio</Text>
                    <Text fontWeight="bold" color="gray.800" fontSize="sm">
                      ${formatPrice(product.price)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Mín.</Text>
                    <Text fontWeight="medium" color="gray.600" fontSize="sm">
                      {product.minQuantity} uds
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Stock</Text>
                    <HStack spacing={1}>
                      <Text fontWeight="medium" color="gray.800" fontSize="sm">
                        {product.stock}
                      </Text>
                      <Badge colorScheme={getStockColor(product.stock)} fontSize="xs">
                        {getStockLabel(product.stock)}
                      </Badge>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </Box>
            ))
          ) : (
            <Box p={8} textAlign="center" bg="purple.50" borderRadius="lg">
              <Icon as={FiPackage} color="gray.300" boxSize={12} mb={4} />
              <Text color="gray.500" fontSize="lg">No se encontraron productos</Text>
              <Text color="gray.400" fontSize="sm" mt={2}>Intenta buscar con otros términos</Text>
            </Box>
          )}
        </VStack>
      ) : (
        /* Vista de tabla para desktop */
        <Box bg="purple.50" borderRadius="lg" boxShadow="sm" overflow="hidden" overflowX="auto">
          <Table variant="simple" size={isTablet ? 'sm' : 'md'}>
            <Thead bg="gray.50">
              <Tr>
                <Th>Producto</Th>
                <Th>Categoría</Th>
                <Th>Precio Unitario</Th>
                <Th display={{ base: 'none', lg: 'table-cell' }}>Cant. Mínima</Th>
                <Th>Stock</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <Tr key={product.id}>
                    {/* Producto con imagen */}
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={product.name}
                          bg="gray.200"
                          icon={<Text fontSize="xl">{product.image}</Text>}
                        />
                        <Text fontWeight="medium" color="gray.700" noOfLines={1} maxW={{ base: '120px', lg: '200px' }}>
                          {product.name}
                        </Text>
                      </HStack>
                    </Td>

                    {/* Categoría */}
                    <Td>
                      <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                        {product.category.toUpperCase()}
                      </Badge>
                    </Td>

                    {/* Precio */}
                    <Td fontWeight="semibold" color="gray.800">
                      ${formatPrice(product.price)}
                    </Td>

                    {/* Cantidad mínima - oculto en tablet */}
                    <Td color="gray.600" display={{ base: 'none', lg: 'table-cell' }}>
                      {product.minQuantity} uds
                    </Td>

                    {/* Stock */}
                    <Td>
                      <HStack spacing={2}>
                        <Text fontWeight="medium" color="gray.800">
                          {product.stock}
                        </Text>
                        <Badge colorScheme={getStockColor(product.stock)} fontSize="xs" px={2} py={1}>
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
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text color="gray.500" fontSize="lg">No se encontraron productos</Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>Intenta buscar con otros términos</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
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
          {/* Items per page - oculto en móvil */}
          <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" color="gray.600">Productos por página:</Text>
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

          {/* Navegación de páginas */}
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

          {/* Info de página */}
          <Text fontSize="sm" color="gray.600" textAlign={{ base: 'center', lg: 'right' }}>
            Página {currentPage} de {totalPages}
          </Text>
        </Stack>
      )}

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
          p={{ base: 2, md: 4 }}
          onClick={handleCloseEditModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW={modalWidth}
            w="100%"
            maxH={{ base: '95vh', md: '90vh' }}
            display="flex"
            flexDirection="column"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fijo */}
            <Box
              bg="purple.500"
              color="white"
              p={{ base: 3, md: 4 }}
              borderTopRadius="xl"
              position="sticky"
              top={0}
              zIndex={1}
              flexShrink={0}
            >
              <HStack spacing={3} pr={8}>
                <Icon as={FiPackage} boxSize={5} />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">Editar Producto</Text>
              </HStack>
              <IconButton
                aria-label="Cerrar"
                icon={<FiX />}
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'purple.600' }}
                onClick={handleCloseEditModal}
              />
            </Box>

            {/* Body - Formulario con scroll */}
            <Box p={{ base: 4, md: 6 }} overflowY="auto" flex={1}>
              <VStack spacing={4} align="stretch">
                {/* Nombre del producto */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                    Nombre del Producto
                  </FormLabel>
                  <Input
                    value={editingProduct.nombre}
                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                    placeholder="Nombre del producto"
                    size={{ base: 'sm', md: 'md' }}
                  />
                </FormControl>

                {/* Referencia y Código de barras */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Referencia
                    </FormLabel>
                    <Input
                      value={editingProduct.referencia}
                      onChange={(e) => handleFieldChange('referencia', e.target.value)}
                      placeholder="Ej: REF-001"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Código de Barras
                    </FormLabel>
                    <Input
                      value={editingProduct.codigo_barras}
                      onChange={(e) => handleFieldChange('codigo_barras', e.target.value)}
                      placeholder="Ej: 7701234567890"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Marca y Categoría */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Marca
                    </FormLabel>
                    <Input
                      value={editingProduct.marca}
                      onChange={(e) => handleFieldChange('marca', e.target.value)}
                      placeholder="Ej: Apple, Samsung"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Categoría
                    </FormLabel>
                    <Select
                      value={editingProduct.categoria}
                      onChange={(e) => handleFieldChange('categoria', e.target.value)}
                      placeholder="Seleccionar categoría"
                      size={{ base: 'sm', md: 'md' }}
                    >
                      {categories.filter(c => c !== 'Todas las categorías').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Divider />
                <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>Precios</Text>

                {/* Precio Venta y Precio Base */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Precio Venta (con IVA)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.precioventa_con_impuesto}
                      onChange={(_, value) => handleFieldChange('precioventa_con_impuesto', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Precio Base (sin IVA)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.precio_venta_base}
                      onChange={(_, value) => handleFieldChange('precio_venta_base', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Precio Compra y Costo */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Precio Compra
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.precio_compra}
                      onChange={(_, value) => handleFieldChange('precio_compra', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Costo
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.costo}
                      onChange={(_, value) => handleFieldChange('costo', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Impuesto y Descuento */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Impuesto (%)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.impuesto}
                      onChange={(_, value) => handleFieldChange('impuesto', value || 0)}
                      min={0}
                      max={100}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="19" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Descuento Máximo (%)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.descuento_maximo_ps}
                      onChange={(_, value) => handleFieldChange('descuento_maximo_ps', value || 0)}
                      min={0}
                      max={100}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <Divider />
                <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>Inventario</Text>

                {/* Stock y Stock Mínimo */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Existencias
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.existencias}
                      onChange={(_, value) => handleFieldChange('existencias', value || 0)}
                      min={0}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Stock Mínimo (Alerta)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.stock_minimo}
                      onChange={(_, value) => handleFieldChange('stock_minimo', value || 1)}
                      min={1}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="1" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Ubicación y Proveedor */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Ubicación
                    </FormLabel>
                    <Input
                      value={editingProduct.ubicacion}
                      onChange={(e) => handleFieldChange('ubicacion', e.target.value)}
                      placeholder="Ej: Bodega A, Estante 3"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Proveedor
                    </FormLabel>
                    <Input
                      value={editingProduct.proveedor}
                      onChange={(e) => handleFieldChange('proveedor', e.target.value)}
                      placeholder="Nombre del proveedor"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Nota */}
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                    Notas
                  </FormLabel>
                  <Input
                    value={editingProduct.nota}
                    onChange={(e) => handleFieldChange('nota', e.target.value)}
                    placeholder="Notas adicionales del producto"
                    size={{ base: 'sm', md: 'md' }}
                  />
                </FormControl>

                {/* Vista previa del precio con descuento */}
                {editingProduct.precioventa_con_impuesto > 0 && (
                  <Box bg="purple.50" p={{ base: 3, md: 4 }} borderRadius="md" borderLeft="4px" borderColor="purple.500">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="purple.700" fontWeight="medium">
                        Vista previa:
                      </Text>
                      <Flex justify="space-between" w="100%" direction={{ base: 'column', sm: 'row' }} gap={2}>
                        <Text color="gray.700" fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>
                          {editingProduct.nombre || 'Nombre del producto'}
                        </Text>
                        <Badge colorScheme="purple" fontSize={{ base: 'sm', md: 'md' }} px={3} py={1}>
                          ${formatPrice(editingProduct.precioventa_con_impuesto)}
                        </Badge>
                      </Flex>
                      {editingProduct.descuento_maximo_ps > 0 && (
                        <HStack flexWrap="wrap">
                          <Text fontSize="sm" color="gray.500">Con descuento máximo:</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            ${formatPrice(editingProduct.precioventa_con_impuesto * (1 - editingProduct.descuento_maximo_ps / 100))}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Footer - Fijo */}
            <Box
              p={{ base: 3, md: 4 }}
              borderTop="1px"
              borderColor="gray.200"
              bg="gray.50"
              borderBottomRadius="xl"
              flexShrink={0}
            >
              <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'stretch', sm: 'center' }} spacing={3}>
                <Text fontSize="sm" color="gray.500" display={{ base: 'none', sm: 'block' }}>
                  * Campos requeridos
                </Text>
                <Stack direction={{ base: 'column-reverse', sm: 'row' }} spacing={3} w={{ base: '100%', sm: 'auto' }}>
                  <Button
                    variant="ghost"
                    onClick={handleCloseEditModal}
                    leftIcon={<FiX />}
                    w={{ base: '100%', sm: 'auto' }}
                    size={{ base: 'sm', md: 'md' }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={handleSaveProduct}
                    isLoading={isLoading}
                    leftIcon={<FiSave />}
                    w={{ base: '100%', sm: 'auto' }}
                    size={{ base: 'sm', md: 'md' }}
                  >
                    Guardar Cambios
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Agregar Producto */}
      {isAddModalOpen && (
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
          onClick={handleCloseAddModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW={modalWidth}
            w="100%"
            maxH={{ base: '95vh', md: '90vh' }}
            display="flex"
            flexDirection="column"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fijo */}
            <Box
              bg="purple.500"
              color="white"
              p={{ base: 3, md: 4 }}
              borderTopRadius="xl"
              position="sticky"
              top={0}
              zIndex={1}
              flexShrink={0}
            >
              <HStack spacing={3} pr={8}>
                <Icon as={FiPlus} boxSize={5} />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">Agregar Nuevo Producto</Text>
              </HStack>
              <IconButton
                aria-label="Cerrar"
                icon={<FiX />}
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'purple.600' }}
                onClick={handleCloseAddModal}
              />
            </Box>

            {/* Body - Formulario con scroll */}
            <Box p={{ base: 4, md: 6 }} overflowY="auto" flex={1}>
              <VStack spacing={4} align="stretch">
                {/* Nombre del producto */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                    Nombre del Producto
                  </FormLabel>
                  <Input
                    value={newProduct.nombre}
                    onChange={(e) => handleNewProductChange('nombre', e.target.value)}
                    placeholder="Ej: iPhone 15 Pro Max"
                    size={{ base: 'sm', md: 'md' }}
                  />
                </FormControl>

                {/* Referencia y Código de barras */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Referencia
                    </FormLabel>
                    <Input
                      value={newProduct.referencia}
                      onChange={(e) => handleNewProductChange('referencia', e.target.value)}
                      placeholder="Ej: REF-001"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Código de Barras
                    </FormLabel>
                    <Input
                      value={newProduct.codigo_barras}
                      onChange={(e) => handleNewProductChange('codigo_barras', e.target.value)}
                      placeholder="Ej: 7701234567890"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Marca y Categoría */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Marca
                    </FormLabel>
                    <Input
                      value={newProduct.marca}
                      onChange={(e) => handleNewProductChange('marca', e.target.value)}
                      placeholder="Ej: Apple, Samsung"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Categoría
                    </FormLabel>
                    <Select
                      value={newProduct.categoria}
                      onChange={(e) => handleNewProductChange('categoria', e.target.value)}
                      placeholder="Seleccionar categoría"
                      size={{ base: 'sm', md: 'md' }}
                    >
                      {categories.filter(c => c !== 'Todas las categorías').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <Divider />
                <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>Precios</Text>

                {/* Precio Venta y Precio Base */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Precio Venta (con IVA)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.precioventa_con_impuesto}
                      onChange={(_, value) => handleNewProductChange('precioventa_con_impuesto', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Precio Base (sin IVA)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.precio_venta_base}
                      onChange={(_, value) => handleNewProductChange('precio_venta_base', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Precio Compra y Costo */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Precio Compra
                    </FormLabel>
                    <NumberInput
                      value={newProduct.precio_compra}
                      onChange={(_, value) => handleNewProductChange('precio_compra', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Costo
                    </FormLabel>
                    <NumberInput
                      value={newProduct.costo}
                      onChange={(_, value) => handleNewProductChange('costo', value || 0)}
                      min={0}
                      precision={2}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Impuesto y Descuento */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Impuesto (%)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.impuesto}
                      onChange={(_, value) => handleNewProductChange('impuesto', value || 0)}
                      min={0}
                      max={100}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="19" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Descuento Máximo (%)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.descuento_maximo_ps}
                      onChange={(_, value) => handleNewProductChange('descuento_maximo_ps', value || 0)}
                      min={0}
                      max={100}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <Divider />
                <Text fontWeight="bold" color="gray.700" fontSize={{ base: 'sm', md: 'md' }}>Inventario</Text>

                {/* Stock y Stock Mínimo */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Existencias
                    </FormLabel>
                    <NumberInput
                      value={newProduct.existencias}
                      onChange={(_, value) => handleNewProductChange('existencias', value || 0)}
                      min={0}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Stock Mínimo (Alerta)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.stock_minimo}
                      onChange={(_, value) => handleNewProductChange('stock_minimo', value || 1)}
                      min={1}
                      size={{ base: 'sm', md: 'md' }}
                    >
                      <NumberInputField placeholder="1" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                {/* Ubicación y Proveedor */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Ubicación
                    </FormLabel>
                    <Input
                      value={newProduct.ubicacion}
                      onChange={(e) => handleNewProductChange('ubicacion', e.target.value)}
                      placeholder="Ej: Bodega A, Estante 3"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                      Proveedor
                    </FormLabel>
                    <Input
                      value={newProduct.proveedor}
                      onChange={(e) => handleNewProductChange('proveedor', e.target.value)}
                      placeholder="Nombre del proveedor"
                      size={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Nota */}
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium" fontSize={{ base: 'sm', md: 'md' }}>
                    Notas
                  </FormLabel>
                  <Input
                    value={newProduct.nota}
                    onChange={(e) => handleNewProductChange('nota', e.target.value)}
                    placeholder="Notas adicionales del producto"
                    size={{ base: 'sm', md: 'md' }}
                  />
                </FormControl>

                {/* Vista previa */}
                {newProduct.precioventa_con_impuesto > 0 && (
                  <Box bg="green.50" p={{ base: 3, md: 4 }} borderRadius="md" borderLeft="4px" borderColor="green.500">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="green.700" fontWeight="medium">
                        Vista previa del producto:
                      </Text>
                      <Flex justify="space-between" w="100%" direction={{ base: 'column', sm: 'row' }} gap={2}>
                        <Text color="gray.700" fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>
                          {newProduct.nombre || 'Nombre del producto'}
                        </Text>
                        <Badge colorScheme="green" fontSize={{ base: 'sm', md: 'md' }} px={3} py={1}>
                          ${formatPrice(newProduct.precioventa_con_impuesto)}
                        </Badge>
                      </Flex>
                      {newProduct.descuento_maximo_ps > 0 && (
                        <HStack flexWrap="wrap">
                          <Text fontSize="sm" color="gray.500">Con descuento máximo:</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            ${formatPrice(newProduct.precioventa_con_impuesto * (1 - newProduct.descuento_maximo_ps / 100))}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Footer - Fijo */}
            <Box
              p={{ base: 3, md: 4 }}
              borderTop="1px"
              borderColor="gray.200"
              bg="gray.50"
              borderBottomRadius="xl"
              flexShrink={0}
            >
              <Stack direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'stretch', sm: 'center' }} spacing={3}>
                <Text fontSize="sm" color="gray.500" display={{ base: 'none', sm: 'block' }}>
                  * Campos requeridos
                </Text>
                <Stack direction={{ base: 'column-reverse', sm: 'row' }} spacing={3} w={{ base: '100%', sm: 'auto' }}>
                  <Button
                    variant="ghost"
                    onClick={handleCloseAddModal}
                    leftIcon={<FiX />}
                    w={{ base: '100%', sm: 'auto' }}
                    size={{ base: 'sm', md: 'md' }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={handleCreateProduct}
                    isLoading={isLoading}
                    leftIcon={<FiSave />}
                    w={{ base: '100%', sm: 'auto' }}
                    size={{ base: 'sm', md: 'md' }}
                  >
                    Crear Producto
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && productToDelete && (
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
          onClick={handleCloseDeleteModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW={{ base: '95%', sm: '400px' }}
            w="100%"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box
              bg="red.500"
              color="white"
              p={{ base: 3, md: 4 }}
              borderTopRadius="xl"
              position="relative"
            >
              <HStack spacing={3} pr={8}>
                <Icon as={FiTrash2} boxSize={5} />
                <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">Eliminar Producto</Text>
              </HStack>
              <IconButton
                aria-label="Cerrar"
                icon={<FiX />}
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'red.600' }}
                onClick={handleCloseDeleteModal}
              />
            </Box>

            {/* Body */}
            <Box p={{ base: 4, md: 6 }}>
              <VStack spacing={4} align="stretch">
                <Text color="gray.700" textAlign="center">
                  ¿Estás seguro de que deseas eliminar el producto?
                </Text>
                <Box
                  bg="gray.100"
                  p={4}
                  borderRadius="md"
                  textAlign="center"
                >
                  <Text fontWeight="bold" color="gray.800" fontSize="lg">
                    {productToDelete.name}
                  </Text>
                  <HStack justify="center" spacing={4} mt={2}>
                    <Badge colorScheme="blue">{productToDelete.category.toUpperCase()}</Badge>
                    <Text fontSize="sm" color="gray.600">
                      Stock: {productToDelete.stock}
                    </Text>
                  </HStack>
                </Box>
                <Text fontSize="sm" color="red.600" textAlign="center">
                  Esta acción no se puede deshacer.
                </Text>
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={{ base: 3, md: 4 }} borderTop="1px" borderColor="gray.200" bg="gray.50" borderBottomRadius="xl">
              <Stack direction={{ base: 'column-reverse', sm: 'row' }} justify="flex-end" spacing={3}>
                <Button
                  variant="ghost"
                  onClick={handleCloseDeleteModal}
                  isDisabled={isDeleting}
                  w={{ base: '100%', sm: 'auto' }}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleConfirmDelete}
                  isLoading={isDeleting}
                  loadingText="Eliminando..."
                  leftIcon={<FiTrash2 />}
                  w={{ base: '100%', sm: 'auto' }}
                >
                  Eliminar
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Products;