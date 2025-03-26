import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, useTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import { Customer } from '../types';
import { API_BASE_URL } from '../config';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const theme = useTheme();

  const columns = [
    { id: 'CustomerID' as keyof Customer, label: 'Customer ID', minWidth: 100 },
    { id: 'Name' as keyof Customer, label: 'Name', minWidth: 170 },
    { id: 'Address' as keyof Customer, label: 'Address', minWidth: 200 },
    { id: 'Email' as keyof Customer, label: 'Email', minWidth: 200 },
    { id: 'PhoneNumber' as keyof Customer, label: 'Phone Number', minWidth: 150 },
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/customers`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const getTotalCustomers = () => customers.length;
  const getCustomersWithEmail = () => customers.filter(customer => customer.Email).length;
  const getCustomersWithPhone = () => customers.filter(customer => customer.PhoneNumber).length;

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
        Customers Database
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
                Total Customers
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
                {getTotalCustomers()}
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
                Customers with Email
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
                {getCustomersWithEmail()}
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
                Customers with Phone
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
                {getCustomersWithPhone()}
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
          <DataTable
            columns={columns}
            rows={customers}
            title="Customers List"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Customers; 