import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { theme } from './theme';
import Navbar from './components/Navbar';
import Books from './pages/Books';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Authors from './pages/Authors';
import Customers from './pages/Customers';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
            <Routes>
              <Route path="/" element={<Books />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/customers" element={<Customers />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 