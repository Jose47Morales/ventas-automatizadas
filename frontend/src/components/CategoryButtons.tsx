import { ButtonGroup, Button } from '@chakra-ui/react';
import { useEnvironment, environments } from '../context/EnvironmentContext';
import type { Environment } from '../context/EnvironmentContext';

export default function CategoryButtons() {
  const { currentEnvironment, setCurrentEnvironment } = useEnvironment();

  return (
    <ButtonGroup size="sm" spacing={2}>
      {environments.map((env) => {
        const isActive = currentEnvironment === env.key;
        return (
          <Button
            key={env.key}
            colorScheme={env.colorScheme}
            variant={isActive ? 'solid' : 'outline'}
            onClick={() => setCurrentEnvironment(env.key as Environment)}
            fontWeight={isActive ? 'bold' : 'medium'}
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'sm',
            }}
            transition="all 0.2s"
          >
            {env.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
