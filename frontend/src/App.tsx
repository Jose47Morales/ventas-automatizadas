import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <AuthProvider>
          <Router>
            <Box minH="100vh" bg="gray.50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;