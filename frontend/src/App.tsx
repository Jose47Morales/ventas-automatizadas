import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { AuthProvider } from './context/AuthContext';  ← COMENTADO
// import Layout from './components/Layout';              ← COMENTADO
import Login from './pages/Login.tsx';
// import Products from './pages/Products';               ← COMENTADO
// import Dashboard from './pages/Dashboard';             ← COMENTADO

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        {/* <AuthProvider> */}
          <Router>
            <Box minH="100vh" bg="gray.50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />
                {/* Las otras rutas las activaremos después */}
              </Routes>
            </Box>
          </Router>
        {/* </AuthProvider> */}
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;