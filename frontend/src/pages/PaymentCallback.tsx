import { Box, Text, Icon, Flex } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';

function PaymentCallback() {
  return (
    <Box
      minH="100vh"
      w="100%"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        p={{ base: 6, md: 10 }}
        maxW="450px"
        w="100%"
        textAlign="center"
      >
        {/* Icono de éxito */}
        <Flex
          w={{ base: 20, md: 24 }}
          h={{ base: 20, md: 24 }}
          bg="green.100"
          borderRadius="full"
          align="center"
          justify="center"
          mx="auto"
          mb={6}
        >
          <Icon
            as={FiCheckCircle}
            boxSize={{ base: 10, md: 12 }}
            color="green.500"
          />
        </Flex>

        {/* Título */}
        <Text
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="bold"
          color="gray.800"
          mb={2}
        >
          Pago Procesado
        </Text>

        {/* Mensaje */}
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          color="gray.600"
          mb={6}
          lineHeight="tall"
        >
          Tu pago está siendo procesado correctamente.
          <br />
          Gracias por tu compra.
        </Text>

        {/* Texto para volver a WhatsApp */}
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          color="green.600"
          fontWeight="semibold"
        >
          Ya puedes volver a WhatsApp
        </Text>

        {/* Logo o marca */}
        <Box mt={8} pt={6} borderTop="1px" borderColor="gray.200">
          <Text fontSize="sm" fontWeight="semibold" color="purple.600">
            BodegaMayorista
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            Tu aliado en compras al por mayor
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default PaymentCallback;
