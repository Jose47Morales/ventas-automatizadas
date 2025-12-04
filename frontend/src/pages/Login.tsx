import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';

function Login() {
  // Estados para guardar los valores del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hook de Chakra para mostrar notificaciones
  const toast = useToast();

  // Función que se ejecuta al hacer clic en "Ingresar al Panel"
  const handleLogin = () => {
    // Validación básica: verificar que los campos no estén vacíos
    if (!email || !password) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor ingresa tu correo y contraseña',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simular proceso de login (más adelante conectarás con el backend)
    setIsLoading(true);

    // Simulamos una petición al servidor (2 segundos)
    setTimeout(() => {
      setIsLoading(false);

      // Aquí validarías con el backend real
      // Por ahora, aceptamos cualquier correo/contraseña
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido al panel administrativo',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Aquí redirigirías al dashboard
      console.log('Login exitoso:', { email, password });
    }, 2000);
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Encabezado */}
          <VStack spacing={2}>
            <Box
              bg="green.500"
              p={4}
              borderRadius="lg"
              display="inline-block"
            >
              <Icon viewBox="0 0 24 24" boxSize={8} color="white">
                <path
                  fill="currentColor"
                  d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"
                />
              </Icon>
            </Box>
            <Heading size="lg">Panel Administrativo</Heading>
            <Text color="gray.600">Bodega Mayorista</Text>
          </VStack>

          {/* Formulario */}
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <VStack spacing={6} align="stretch">
              <VStack spacing={1} align="start">
                <Heading size="md">Iniciar Sesión</Heading>
                <Text color="gray.600" fontSize="sm">
                  Ingresa tus credenciales para acceder al panel
                </Text>
              </VStack>

              {/* Campo de Correo Electrónico */}
              <FormControl>
                <FormLabel>Correo electrónico</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="admin@bodega.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              {/* Campo de Contraseña */}
              <FormControl>
                <FormLabel>Contraseña</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              {/* Botón de Login */}
              <Button
                colorScheme="green"
                size="lg"
                width="full"
                onClick={handleLogin}
                isLoading={isLoading}
                loadingText="Ingresando..."
              >
                Ingresar al Panel
              </Button>

              {/* Texto de Demo */}
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Demo: usa cualquier correo y contraseña
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default Login;