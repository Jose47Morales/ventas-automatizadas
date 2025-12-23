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
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FiEdit2, FiPlus, FiPackage, FiSave, FiX, FiTrash2, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { productsAPI } from '../services/api';

// Interface para los productos de la API
interface APIProduct {
  id_producto: number;
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
  id: number;
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
  id: number;
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

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const data: APIProduct[] = await productsAPI.getAll();
        // Mapear los datos de la API al formato del componente
        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id_producto,
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
        id: fullProduct.id_producto,
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
        id: p.id_producto,
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
        referencia: editingProduct.referencia,
        codigo_barras: editingProduct.codigo_barras,
        categoria: editingProduct.categoria || 'Sin categoría',
        marca: editingProduct.marca || '',
        precioventa_con_impuesto: editingProduct.precioventa_con_impuesto,
        precio_venta_base: editingProduct.precio_venta_base || editingProduct.precioventa_con_impuesto,
        precio_compra: editingProduct.precio_compra,
        costo: editingProduct.costo,
        existencias: editingProduct.existencias,
        stock_minimo: editingProduct.stock_minimo,
        descuento_maximo_ps: editingProduct.descuento_maximo_ps,
        impuesto: editingProduct.impuesto,
        ubicacion: editingProduct.ubicacion,
        proveedor: editingProduct.proveedor,
        nota: editingProduct.nota,
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
        id: p.id_producto,
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
    <Box>
      {/* Encabezado */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="gray.800">
          Panel de Productos
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="purple"
          size="md"
          onClick={handleOpenAddModal}
        >
          Agregar Producto
        </Button>
      </Flex>

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
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
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

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4} p={4} bg="white" borderRadius="lg" boxShadow="sm">
          <HStack spacing={2}>
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
            maxW="600px"
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
                _hover={{ bg: 'purple.600' }}
                onClick={handleCloseEditModal}
              />
            </Box>

            {/* Body - Formulario */}
            <Box p={6}>
              <VStack spacing={4} align="stretch">
                {/* Nombre del producto */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
                    Nombre del Producto
                  </FormLabel>
                  <Input
                    value={editingProduct.nombre}
                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                    placeholder="Nombre del producto"
                  />
                </FormControl>

                {/* Referencia y Código de barras */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Referencia
                    </FormLabel>
                    <Input
                      value={editingProduct.referencia}
                      onChange={(e) => handleFieldChange('referencia', e.target.value)}
                      placeholder="Ej: REF-001"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Código de Barras
                    </FormLabel>
                    <Input
                      value={editingProduct.codigo_barras}
                      onChange={(e) => handleFieldChange('codigo_barras', e.target.value)}
                      placeholder="Ej: 7701234567890"
                    />
                  </FormControl>
                </HStack>

                {/* Marca y Categoría */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Marca
                    </FormLabel>
                    <Input
                      value={editingProduct.marca}
                      onChange={(e) => handleFieldChange('marca', e.target.value)}
                      placeholder="Ej: Apple, Samsung"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Categoría
                    </FormLabel>
                    <Select
                      value={editingProduct.categoria}
                      onChange={(e) => handleFieldChange('categoria', e.target.value)}
                      placeholder="Seleccionar categoría"
                    >
                      {categories.filter(c => c !== 'Todas las categorías').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <Divider />
                <Text fontWeight="bold" color="gray.700">Precios</Text>

                {/* Precio Venta y Precio Base */}
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Venta (con IVA)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.precioventa_con_impuesto}
                      onChange={(_, value) => handleFieldChange('precioventa_con_impuesto', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Base (sin IVA)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.precio_venta_base}
                      onChange={(_, value) => handleFieldChange('precio_venta_base', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Precio Compra y Costo */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Compra
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.precio_compra}
                      onChange={(_, value) => handleFieldChange('precio_compra', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Costo
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.costo}
                      onChange={(_, value) => handleFieldChange('costo', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Impuesto y Descuento */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Impuesto (%)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.impuesto}
                      onChange={(_, value) => handleFieldChange('impuesto', value || 0)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField placeholder="19" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Descuento Máximo (%)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.descuento_maximo_ps}
                      onChange={(_, value) => handleFieldChange('descuento_maximo_ps', value || 0)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <Divider />
                <Text fontWeight="bold" color="gray.700">Inventario</Text>

                {/* Stock y Stock Mínimo */}
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Existencias
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.existencias}
                      onChange={(_, value) => handleFieldChange('existencias', value || 0)}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Stock Mínimo (Alerta)
                    </FormLabel>
                    <NumberInput
                      value={editingProduct.stock_minimo}
                      onChange={(_, value) => handleFieldChange('stock_minimo', value || 1)}
                      min={1}
                    >
                      <NumberInputField placeholder="1" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Ubicación y Proveedor */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Ubicación
                    </FormLabel>
                    <Input
                      value={editingProduct.ubicacion}
                      onChange={(e) => handleFieldChange('ubicacion', e.target.value)}
                      placeholder="Ej: Bodega A, Estante 3"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Proveedor
                    </FormLabel>
                    <Input
                      value={editingProduct.proveedor}
                      onChange={(e) => handleFieldChange('proveedor', e.target.value)}
                      placeholder="Nombre del proveedor"
                    />
                  </FormControl>
                </HStack>

                {/* Nota */}
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium">
                    Notas
                  </FormLabel>
                  <Input
                    value={editingProduct.nota}
                    onChange={(e) => handleFieldChange('nota', e.target.value)}
                    placeholder="Notas adicionales del producto"
                  />
                </FormControl>

                {/* Vista previa del precio con descuento */}
                {editingProduct.precioventa_con_impuesto > 0 && (
                  <Box bg="purple.50" p={4} borderRadius="md" borderLeft="4px" borderColor="purple.500">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="purple.700" fontWeight="medium">
                        Vista previa:
                      </Text>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.700">{editingProduct.nombre || 'Nombre del producto'}</Text>
                        <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                          ${editingProduct.precioventa_con_impuesto.toFixed(2)}
                        </Badge>
                      </HStack>
                      {editingProduct.descuento_maximo_ps > 0 && (
                        <HStack>
                          <Text fontSize="sm" color="gray.500">Con descuento máximo:</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            ${(editingProduct.precioventa_con_impuesto * (1 - editingProduct.descuento_maximo_ps / 100)).toFixed(2)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={4} borderTop="1px" borderColor="gray.200" bg="gray.50">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  * Campos requeridos
                </Text>
                <HStack spacing={3}>
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
              </HStack>
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
          onClick={handleCloseAddModal}
        >
          <Box
            bg="white"
            borderRadius="xl"
            maxW="600px"
            w="90%"
            maxH="90vh"
            overflow="auto"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box bg="purple.500" color="white" p={4} borderTopRadius="xl" position="relative">
              <HStack spacing={3}>
                <Icon as={FiPlus} boxSize={5} />
                <Text fontSize="lg" fontWeight="bold">Agregar Nuevo Producto</Text>
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
                onClick={handleCloseAddModal}
              />
            </Box>

            {/* Body - Formulario */}
            <Box p={6}>
              <VStack spacing={4} align="stretch">
                {/* Nombre del producto */}
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
                    Nombre del Producto
                  </FormLabel>
                  <Input
                    value={newProduct.nombre}
                    onChange={(e) => handleNewProductChange('nombre', e.target.value)}
                    placeholder="Ej: iPhone 15 Pro Max"
                  />
                </FormControl>

                {/* Referencia y Código de barras */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Referencia
                    </FormLabel>
                    <Input
                      value={newProduct.referencia}
                      onChange={(e) => handleNewProductChange('referencia', e.target.value)}
                      placeholder="Ej: REF-001"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Código de Barras
                    </FormLabel>
                    <Input
                      value={newProduct.codigo_barras}
                      onChange={(e) => handleNewProductChange('codigo_barras', e.target.value)}
                      placeholder="Ej: 7701234567890"
                    />
                  </FormControl>
                </HStack>

                {/* Marca y Categoría */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Marca
                    </FormLabel>
                    <Input
                      value={newProduct.marca}
                      onChange={(e) => handleNewProductChange('marca', e.target.value)}
                      placeholder="Ej: Apple, Samsung"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Categoría
                    </FormLabel>
                    <Select
                      value={newProduct.categoria}
                      onChange={(e) => handleNewProductChange('categoria', e.target.value)}
                      placeholder="Seleccionar categoría"
                    >
                      {categories.filter(c => c !== 'Todas las categorías').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <Divider />
                <Text fontWeight="bold" color="gray.700">Precios</Text>

                {/* Precio Venta y Precio Base */}
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Venta (con IVA)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.precioventa_con_impuesto}
                      onChange={(_, value) => handleNewProductChange('precioventa_con_impuesto', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Base (sin IVA)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.precio_venta_base}
                      onChange={(_, value) => handleNewProductChange('precio_venta_base', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Precio Compra y Costo */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Precio Compra
                    </FormLabel>
                    <NumberInput
                      value={newProduct.precio_compra}
                      onChange={(_, value) => handleNewProductChange('precio_compra', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Costo
                    </FormLabel>
                    <NumberInput
                      value={newProduct.costo}
                      onChange={(_, value) => handleNewProductChange('costo', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Impuesto y Descuento */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Impuesto (%)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.impuesto}
                      onChange={(_, value) => handleNewProductChange('impuesto', value || 0)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField placeholder="19" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Descuento Máximo (%)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.descuento_maximo_ps}
                      onChange={(_, value) => handleNewProductChange('descuento_maximo_ps', value || 0)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <Divider />
                <Text fontWeight="bold" color="gray.700">Inventario</Text>

                {/* Stock y Stock Mínimo */}
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Existencias
                    </FormLabel>
                    <NumberInput
                      value={newProduct.existencias}
                      onChange={(_, value) => handleNewProductChange('existencias', value || 0)}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Stock Mínimo (Alerta)
                    </FormLabel>
                    <NumberInput
                      value={newProduct.stock_minimo}
                      onChange={(_, value) => handleNewProductChange('stock_minimo', value || 1)}
                      min={1}
                    >
                      <NumberInputField placeholder="1" />
                    </NumberInput>
                  </FormControl>
                </HStack>

                {/* Ubicación y Proveedor */}
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Ubicación
                    </FormLabel>
                    <Input
                      value={newProduct.ubicacion}
                      onChange={(e) => handleNewProductChange('ubicacion', e.target.value)}
                      placeholder="Ej: Bodega A, Estante 3"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Proveedor
                    </FormLabel>
                    <Input
                      value={newProduct.proveedor}
                      onChange={(e) => handleNewProductChange('proveedor', e.target.value)}
                      placeholder="Nombre del proveedor"
                    />
                  </FormControl>
                </HStack>

                {/* Nota */}
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="medium">
                    Notas
                  </FormLabel>
                  <Input
                    value={newProduct.nota}
                    onChange={(e) => handleNewProductChange('nota', e.target.value)}
                    placeholder="Notas adicionales del producto"
                  />
                </FormControl>

                {/* Vista previa */}
                {newProduct.precioventa_con_impuesto > 0 && (
                  <Box bg="green.50" p={4} borderRadius="md" borderLeft="4px" borderColor="green.500">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="green.700" fontWeight="medium">
                        Vista previa del producto:
                      </Text>
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.700">{newProduct.nombre || 'Nombre del producto'}</Text>
                        <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                          ${newProduct.precioventa_con_impuesto.toFixed(2)}
                        </Badge>
                      </HStack>
                      {newProduct.descuento_maximo_ps > 0 && (
                        <HStack>
                          <Text fontSize="sm" color="gray.500">Con descuento máximo:</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            ${(newProduct.precioventa_con_impuesto * (1 - newProduct.descuento_maximo_ps / 100)).toFixed(2)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Footer */}
            <Box p={4} borderTop="1px" borderColor="gray.200" bg="gray.50">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  * Campos requeridos
                </Text>
                <HStack spacing={3}>
                  <Button
                    variant="ghost"
                    onClick={handleCloseAddModal}
                    leftIcon={<FiX />}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={handleCreateProduct}
                    isLoading={isLoading}
                    leftIcon={<FiSave />}
                  >
                    Crear Producto
                  </Button>
                </HStack>
              </HStack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Products;