import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido al panel administrativo',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/');
    } catch (err: any) {
      console.error('Error en login:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Credenciales incorrectas. Verifica tu correo y contraseña.';
      
      setError(errorMessage);
      
      toast({
        title: 'Error al iniciar sesión',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      minH="100vh"
      w="100vw"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md" w="full">
        <VStack spacing={8} align="stretch">
          <VStack spacing={2}>
            <Box
              bg="purple.500"
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

          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            <VStack spacing={6} align="stretch">
              <VStack spacing={1} align="start">
                <Heading size="md">Iniciar Sesión</Heading>
                <Text color="gray.600" fontSize="sm">
                  Ingresa tus credenciales para acceder al panel
                </Text>
              </VStack>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

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
                    onKeyPress={handleKeyPress}
                    isDisabled={isLoading}
                  />
                </InputGroup>
              </FormControl>

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
                    onKeyPress={handleKeyPress}
                    isDisabled={isLoading}
                  />
                </InputGroup>
              </FormControl>

              <Button
                colorScheme="purple"
                size="lg"
                width="full"
                onClick={handleLogin}
                isLoading={isLoading}
                loadingText="Ingresando..."
              >
                Ingresar al Panel
              </Button>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Usa las credenciales proporcionadas por el administrador
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default Login;