import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: {
    label: string;
    value: number;
  }[];
  barColor?: string;
  height?: number;
  showValues?: boolean;
  valuePrefix?: string;
}

export default function BarChart({
  title,
  subtitle,
  data,
  barColor = 'green.400',
  height = 250,
  showValues = true,
  valuePrefix = '$',
}: BarChartProps) {
  // Encontrar el valor máximo para calcular porcentajes
  const maxValue = Math.max(...data.map((d) => d.value));

  // Calcular el paso para las líneas de la cuadrícula (4 líneas)
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const gridValues = gridLines.map((g) => Math.round(maxValue * g));

  return (
    <Box bg="purple.50" p={6} borderRadius="lg" boxShadow="sm" w="100%">
      {/* Título */}
      <Text fontSize="md" fontWeight="semibold" color="black" mb={1}>
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="gray.600" mb={4}>
          {subtitle}
        </Text>
      )}

      {/* Contenedor del gráfico */}
      <Box position="relative" h={`${height}px`} mt={4}>
        {/* Líneas de cuadrícula horizontales y valores del eje Y */}
        <Box position="absolute" top={0} left={0} right={0} bottom={6} pl={12}>
          {gridLines.reverse().map((g, i) => (
            <Box
              key={i}
              position="absolute"
              top={`${i * 25}%`}
              left={0}
              right={0}
              display="flex"
              alignItems="center"
            >
              {/* Valor del eje Y */}
              <Text
                position="absolute"
                left={-12}
                fontSize="xs"
                color="gray.500"
                w={10}
                textAlign="right"
              >
                {gridValues[gridLines.length - 1 - i].toLocaleString()}
              </Text>
              {/* Línea horizontal */}
              <Box flex={1} h="1px" bg="gray.200" />
            </Box>
          ))}
        </Box>

        {/* Barras */}
        <Flex
          position="absolute"
          bottom={6}
          left={12}
          right={0}
          h={`calc(100% - 24px)`}
          align="flex-end"
          justify="space-around"
          gap={2}
        >
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <Flex
                key={index}
                direction="column"
                align="center"
                flex={1}
                h="100%"
                justify="flex-end"
              >
                {/* Valor encima de la barra */}
                {showValues && (
                  <Text fontSize="xs" color="gray.600" mb={1} fontWeight="medium">
                    {valuePrefix}{item.value.toLocaleString()}
                  </Text>
                )}
                {/* Barra */}
                <Tooltip
                  label={`${item.label}: ${valuePrefix}${item.value.toLocaleString()}`}
                  placement="top"
                  hasArrow
                  bg="gray.800"
                  color="white"
                  fontSize="md"
                  fontWeight="bold"
                  px={4}
                  py={2}
                  borderRadius="md"
                  openDelay={0}
                  closeDelay={0}
                >
                  <Box
                    w="100%"
                    maxW="50px"
                    h={`${percentage}%`}
                    minH="4px"
                    bg={barColor}
                    borderRadius="md"
                    transition="all 0.3s ease"
                    _hover={{
                      opacity: 0.8,
                      transform: 'scaleY(1.02)',
                    }}
                    cursor="pointer"
                  />
                </Tooltip>
              </Flex>
            );
          })}
        </Flex>

        {/* Etiquetas del eje X */}
        <Flex
          position="absolute"
          bottom={0}
          left={12}
          right={0}
          justify="space-around"
        >
          {data.map((item, index) => (
            <Text
              key={index}
              fontSize="xs"
              color="gray.600"
              textAlign="center"
              flex={1}
            >
              {item.label}
            </Text>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
