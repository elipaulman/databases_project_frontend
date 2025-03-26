import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DataTable from '../components/DataTable';
import { CustomerOrder, Customer } from '../types';
import { API_BASE_URL } from '../config';
import CreateOrder from '../components/CreateOrder';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<string>('');
  const theme = useTheme();

  const columns = [
    { id: 'OrderID', label: 'Order ID', minWidth: 100 },
    { id: 'CustomerID', label: 'Customer ID', minWidth: 100 },
    { id: 'OrderDate', label: 'Order Date', minWidth: 150 },
    { id: 'OrderTotal', label: 'Total', minWidth: 100, format: (value: number) => `$${value.toFixed(2)}` },
  ];

  const fetchData = async () => {
    try {
      const [ordersResponse, customersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/orders`),
        fetch(`${API_BASE_URL}/api/customers`)
      ]);

      if (!ordersResponse.ok || !customersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const ordersData = await ordersResponse.json();
      const customersData = await customersResponse.json();

      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = selectedCustomer
    ? orders.filter(order => order.CustomerID === selectedCustomer)
    : orders;

  const getTotalOrders = () => filteredOrders.length;
  const getTotalRevenue = () => filteredOrders.reduce((sum, order) => sum + order.OrderTotal, 0);
  const getAverageOrderValue = () => {
    if (filteredOrders.length === 0) return 0;
    return getTotalRevenue() / filteredOrders.length;
  };

  const handleResetDatabase = async () => {
    setResetError('');
    setResetSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-db`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset database');
      }

      setResetSuccess('Database reset successful! Refreshing data...');
      setResetDialogOpen(false);
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error) {
      setResetError('Failed to reset database. Please try again.');
      console.error('Error resetting database:', error);
    }
  };

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            background: 'linear-gradient(45deg, #007AFF 30%, #5856D6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Orders Database
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RefreshIcon />}
          onClick={() => setResetDialogOpen(true)}
        >
          Reset Database
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 122, 255, 0.1)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: '#007AFF',
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Total Orders
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  background: 'linear-gradient(45deg, #007AFF 30%, #5856D6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {getTotalOrders()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(88, 86, 214, 0.1)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: '#5856D6',
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Total Revenue
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  background: 'linear-gradient(45deg, #5856D6 30%, #007AFF 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ${getTotalRevenue().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(52, 199, 89, 0.1)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: '#34C759',
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Average Order Value
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  background: 'linear-gradient(45deg, #34C759 30%, #30B0C7 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ${getAverageOrderValue().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 122, 255, 0.1)',
          },
        }}
      >
        <CardContent>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#007AFF' }}>Filter by Customer</InputLabel>
                <Select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  label="Filter by Customer"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007AFF',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#5856D6',
                    },
                  }}
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.CustomerID} value={customer.CustomerID}>
                      {customer.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <DataTable
            columns={columns}
            rows={filteredOrders}
            title="Orders List"
          />
        </CardContent>
      </Card>

      <CreateOrder />

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Database</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the database? This will:
          </Typography>
          <ul>
            <li>Delete all existing data</li>
            <li>Recreate all tables</li>
            <li>Insert fresh sample data</li>
          </ul>
          <Typography color="error">
            This action cannot be undone!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetDatabase} color="error" variant="contained">
            Reset Database
          </Button>
        </DialogActions>
      </Dialog>

      {resetError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {resetError}
        </Typography>
      )}

      {resetSuccess && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {resetSuccess}
        </Typography>
      )}
    </Box>
  );
};

export default Orders; 