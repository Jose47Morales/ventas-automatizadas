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
  HStack,
  Heading,
  Text,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon } from '@chakra-ui/icons';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Login() {
  // Estados para Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para Registro
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  const toast = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Manejar Login
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

      let errorMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';

      if (err.response?.data?.error) {
        const backendError = err.response.data.error;
        if (backendError === 'Invalid credentials') {
          errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (backendError === 'Account compromised') {
          errorMessage = 'Tu cuenta ha sido marcada como comprometida. Contacta al administrador.';
        } else {
          errorMessage = backendError;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

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

  // Manejar Registro
  const handleRegister = async () => {
    setRegError('');

    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (regFirstName.length < 2) {
      setRegError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (regLastName.length < 2) {
      setRegError('El apellido debe tener al menos 2 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden');
      return;
    }

    setIsRegistering(true);

    try {
      await register({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
      });

      toast({
        title: 'Registro exitoso',
        description: 'Tu cuenta ha sido creada. Bienvenido!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/');
    } catch (err: any) {
      console.error('Error en registro:', err);

      let errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';

      if (err.response?.data?.error) {
        const backendError = err.response.data.error;
        if (backendError === 'Email already registered') {
          errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
        } else {
          errorMessage = backendError;
        }
      }

      setRegError(errorMessage);

      toast({
        title: 'Error al registrar',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'login' | 'register') => {
    if (e.key === 'Enter') {
      if (action === 'login') {
        handleLogin();
      } else {
        handleRegister();
      }
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
            <Tabs colorScheme="purple" isFitted>
              <TabList mb={4}>
                <Tab>Iniciar Sesión</Tab>
                <Tab>Registrarse</Tab>
              </TabList>

              <TabPanels>
                {/* Panel de Login */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={1} align="start">
                      <Heading size="md">Bienvenido</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Ingresa tus credenciales para acceder
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
                          placeholder="tu@correo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, 'login')}
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
                          onKeyPress={(e) => handleKeyPress(e, 'login')}
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
                      Ingresar
                    </Button>
                  </VStack>
                </TabPanel>

                {/* Panel de Registro */}
                <TabPanel p={0}>
                  <VStack spacing={4} align="stretch">
                    <VStack spacing={1} align="start">
                      <Heading size="md">Crear Cuenta</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Completa el formulario para registrarte
                      </Text>
                    </VStack>

                    {regError && (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        {regError}
                      </Alert>
                    )}

                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Nombre</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiUser} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Juan"
                            value={regFirstName}
                            onChange={(e) => setRegFirstName(e.target.value)}
                            isDisabled={isRegistering}
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Apellido</FormLabel>
                        <Input
                          placeholder="Pérez"
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          isDisabled={isRegistering}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl isRequired>
                      <FormLabel>Correo electrónico</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <EmailIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="email"
                          placeholder="tu@correo.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          isDisabled={isRegistering}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Contraseña</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <LockIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          isDisabled={isRegistering}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <LockIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Repite tu contraseña"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, 'register')}
                          isDisabled={isRegistering}
                        />
                      </InputGroup>
                    </FormControl>

                    <Button
                      colorScheme="purple"
                      size="lg"
                      width="full"
                      onClick={handleRegister}
                      isLoading={isRegistering}
                      loadingText="Registrando..."
                    >
                      Crear Cuenta
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Sistema de gestión de inventario y ventas
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

export default Login;
