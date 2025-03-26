import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import { CustomerOrder, Customer } from '../types';
import { API_BASE_URL } from '../config';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const theme = useTheme();

  const columns = [
    { id: 'OrderID' as keyof CustomerOrder, label: 'Order ID', minWidth: 100 },
    { id: 'CustomerID' as keyof CustomerOrder, label: 'Customer ID', minWidth: 100 },
    { id: 'OrderDate' as keyof CustomerOrder, label: 'Order Date', minWidth: 150 },
    { id: 'OrderTotal' as keyof CustomerOrder, label: 'Total', minWidth: 100, format: (value: number) => `$${value.toFixed(2)}` },
  ];

  useEffect(() => {
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

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 4,
          background: 'linear-gradient(45deg, #007AFF 30%, #5856D6 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
        }}
      >
        Orders Database
      </Typography>

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
    </Box>
  );
};

export default Orders; 