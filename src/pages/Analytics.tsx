import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, useTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import { Book, CustomerOrder, ProfitMargin, BookDemand, Customer } from '../types';
import { API_BASE_URL } from '../config';

interface TopBook {
  ISBN: string;
  Title: string;
  SalesTotal: number;
  Profit: number;
  Popularity: number;
}

interface TopCustomer {
  CustomerID: string;
  Name: string;
  TotalSpent: number;
  OrderCount: number;
}

const Analytics: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profitMargins, setProfitMargins] = useState<ProfitMargin[]>([]);
  const [bookDemand, setBookDemand] = useState<BookDemand[]>([]);
  const theme = useTheme();

  const topBooksColumns = [
    { id: 'ISBN' as keyof TopBook, label: 'ISBN', minWidth: 170 },
    { id: 'Title' as keyof TopBook, label: 'Title', minWidth: 200 },
    { id: 'SalesTotal' as keyof TopBook, label: 'Sales', minWidth: 100, format: (value: number) => `$${value.toFixed(2)}` },
    { id: 'Profit' as keyof TopBook, label: 'Profit', minWidth: 100, format: (value: number) => `$${value.toFixed(2)}` },
    { id: 'Popularity' as keyof TopBook, label: 'Popularity', minWidth: 100 },
  ];

  const topCustomersColumns = [
    { id: 'CustomerID' as keyof TopCustomer, label: 'Customer ID', minWidth: 100 },
    { id: 'Name' as keyof TopCustomer, label: 'Name', minWidth: 170 },
    { id: 'TotalSpent' as keyof TopCustomer, label: 'Total Spent', minWidth: 150, format: (value: number) => `$${value.toFixed(2)}` },
    { id: 'OrderCount' as keyof TopCustomer, label: 'Orders', minWidth: 100 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksResponse, ordersResponse, customersResponse, profitMarginsResponse, bookDemandResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/orders`),
          fetch(`${API_BASE_URL}/api/customers`),
          fetch(`${API_BASE_URL}/api/profit-margins`),
          fetch(`${API_BASE_URL}/api/book-demand`)
        ]);

        if (!booksResponse.ok || !ordersResponse.ok || !customersResponse.ok || !profitMarginsResponse.ok || !bookDemandResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const booksData = await booksResponse.json();
        const ordersData = await ordersResponse.json();
        const customersData = await customersResponse.json();
        const profitMarginsData = await profitMarginsResponse.json();
        const bookDemandData = await bookDemandResponse.json();

        setBooks(booksData);
        setOrders(ordersData);
        setCustomers(customersData);
        setProfitMargins(profitMarginsData);
        setBookDemand(bookDemandData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate top books
  const topBooks: TopBook[] = books.map(book => {
    const profitMargin = profitMargins.find(pm => pm.ISBN === book.ISBN);
    const demand = bookDemand.find(d => d.ISBN === book.ISBN);
    return {
      ISBN: book.ISBN,
      Title: book.Title,
      SalesTotal: profitMargin?.SalesTotal || 0,
      Profit: (profitMargin?.SalesTotal || 0) - (profitMargin?.CostTotal || 0),
      Popularity: demand?.Popularity || 0
    };
  }).sort((a, b) => b.SalesTotal - a.SalesTotal).slice(0, 10);

  // Calculate top customers
  const topCustomers = orders.reduce<{ [key: string]: TopCustomer }>((acc, order) => {
    if (!acc[order.CustomerID]) {
      const customer = customers.find(c => c.CustomerID === order.CustomerID);
      acc[order.CustomerID] = {
        CustomerID: order.CustomerID,
        Name: customer?.Name || 'Unknown',
        TotalSpent: 0,
        OrderCount: 0
      };
    }
    acc[order.CustomerID].TotalSpent += order.OrderTotal;
    acc[order.CustomerID].OrderCount += 1;
    return acc;
  }, {});

  const topCustomersList = Object.values(topCustomers)
    .sort((a, b) => b.TotalSpent - a.TotalSpent)
    .slice(0, 10);

  const getTotalRevenue = () => orders.reduce((sum, order) => sum + order.OrderTotal, 0);
  const getTotalProfit = () => profitMargins.reduce((sum, pm) => sum + (pm.SalesTotal - pm.CostTotal), 0);
  const getAverageOrderValue = () => {
    if (orders.length === 0) return 0;
    return getTotalRevenue() / orders.length;
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
        Analytics Dashboard
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
                Total Revenue
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
                Total Profit
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
                ${getTotalProfit().toFixed(2)}
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
                columns={topBooksColumns}
                rows={topBooks}
                title="Top 10 Books by Sales"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f0ff 100%)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(88, 86, 214, 0.1)',
              },
            }}
          >
            <CardContent>
              <DataTable
                columns={topCustomersColumns}
                rows={topCustomersList}
                title="Top 10 Customers by Spending"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 