import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  IconButton,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { API_BASE_URL } from '../config';
import { Book, Customer, NewOrder, NewOrderItem } from '../types';

const CreateOrder: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [orderItems, setOrderItems] = useState<NewOrderItem[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    // Fetch customers and books
    const fetchData = async () => {
      try {
        const [customersRes, booksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/customers`),
          fetch(`${API_BASE_URL}/api/books`),
        ]);
        
        if (!customersRes.ok || !booksRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const customersData = await customersRes.json();
        const booksData = await booksRes.json();
        
        setCustomers(customersData);
        setBooks(booksData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { ISBN: '', Quantity: 1, Price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof NewOrderItem, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    const newOrder: NewOrder = {
      CustomerID: selectedCustomer,
      items: orderItems,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      setSuccess('Order created successfully!');
      setSelectedCustomer('');
      setOrderItems([]);
    } catch (err) {
      setError('Failed to create order');
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Order
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            label="Customer"
          >
            {customers.map((customer) => (
              <MenuItem key={customer.CustomerID} value={customer.CustomerID}>
                {customer.Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {orderItems.map((item, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Book</InputLabel>
                  <Select
                    value={item.ISBN}
                    onChange={(e) => handleItemChange(index, 'ISBN', e.target.value)}
                    label="Book"
                  >
                    {books.map((book) => (
                      <MenuItem key={book.ISBN} value={book.ISBN}>
                        {book.Title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={item.Quantity}
                  onChange={(e) => handleItemChange(index, 'Quantity', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  value={item.Price}
                  onChange={(e) => handleItemChange(index, 'Price', parseFloat(e.target.value))}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton onClick={() => handleRemoveItem(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{ mb: 2 }}
        >
          Add Item
        </Button>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {success}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!selectedCustomer || orderItems.length === 0}
        >
          Create Order
        </Button>
      </form>
    </Paper>
  );
};

export default CreateOrder; 