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
  Alert,
  CircularProgress,
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
  const [loading, setLoading] = useState<boolean>(false);
  const [inventory, setInventory] = useState<{[isbn: string]: number}>({});

  useEffect(() => {
    // Fetch customers, books, and inventory data
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, booksRes, inventoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/customers`),
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/inventory`),
        ]);
        
        if (!customersRes.ok || !booksRes.ok || !inventoryRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const customersData = await customersRes.json();
        const booksData = await booksRes.json();
        const inventoryData = await inventoryRes.json();
        
        console.log('Loaded inventory data:', inventoryData);
        
        // Create inventory map for quick access
        const invMap: {[isbn: string]: number} = {};
        inventoryData.forEach((item: any) => {
          invMap[item.ISBN] = item.StockQuantity;
        });
        
        setCustomers(customersData);
        setBooks(booksData);
        setInventory(invMap);
        
        // Check if we have no inventory data and need to initialize it
        if (inventoryData.length === 0) {
          console.log('No inventory found, initializing inventory');
          try {
            const initRes = await fetch(`${API_BASE_URL}/api/init-inventory`, {
              method: 'POST'
            });
            if (initRes.ok) {
              const initData = await initRes.json();
              console.log('Inventory initialized:', initData);
              
              // Fetch updated inventory after initialization
              const updatedInventoryRes = await fetch(`${API_BASE_URL}/api/inventory`);
              if (updatedInventoryRes.ok) {
                const updatedInventoryData = await updatedInventoryRes.json();
                const newInvMap: {[isbn: string]: number} = {};
                updatedInventoryData.forEach((item: any) => {
                  newInvMap[item.ISBN] = item.StockQuantity;
                });
                setInventory(newInvMap);
              }
            }
          } catch (initErr) {
            console.error('Error initializing inventory:', initErr);
          }
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
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
    
    // If ISBN changed, update the price automatically
    if (field === 'ISBN' && typeof value === 'string') {
      const selectedBook = books.find(book => book.ISBN === value);
      if (selectedBook) {
        newItems[index] = { 
          ...newItems[index], 
          [field]: value,
          Price: selectedBook.Price 
        };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setOrderItems(newItems);
  };

  const validateOrderItems = (): boolean => {
    for (const item of orderItems) {
      if (!item.ISBN) {
        setError('Please select a book for all order items');
        return false;
      }
      
      if (!item.Quantity || item.Quantity <= 0) {
        setError('Quantity must be greater than zero for all items');
        return false;
      }
      
      if (!item.Price || item.Price <= 0) {
        setError('Price must be greater than zero for all items');
        return false;
      }
      
      // Check inventory
      if (inventory[item.ISBN] < item.Quantity) {
        setError(`Insufficient inventory for selected book (ISBN: ${item.ISBN}). Only ${inventory[item.ISBN]} available.`);
        return false;
      }
    }
    
    return true;
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

    if (!validateOrderItems()) {
      return;
    }

    const newOrder: NewOrder = {
      CustomerID: selectedCustomer,
      items: orderItems,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setSuccess('Order created successfully!');
      setSelectedCustomer('');
      setOrderItems([]);
      
      // Refresh inventory data after successful order
      const inventoryRes = await fetch(`${API_BASE_URL}/api/inventory`);
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        const invMap: {[isbn: string]: number} = {};
        inventoryData.forEach((item: any) => {
          invMap[item.ISBN] = item.StockQuantity;
        });
        setInventory(invMap);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStock = (isbn: string): number => {
    return inventory[isbn] || 0;
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Order
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            label="Customer"
            disabled={loading}
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
                    disabled={loading}
                  >
                    {books.map((book) => (
                      <MenuItem key={book.ISBN} value={book.ISBN}>
                        {book.Title} {getAvailableStock(book.ISBN) > 0 ? 
                          `(${getAvailableStock(book.ISBN)} in stock)` : 
                          '(Out of stock)'}
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
                  onChange={(e) => handleItemChange(index, 'Quantity', parseInt(e.target.value) || 0)}
                  inputProps={{ min: 1 }}
                  disabled={loading}
                  helperText={item.ISBN ? `Max: ${getAvailableStock(item.ISBN)}` : ''}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  value={item.Price}
                  onChange={(e) => handleItemChange(index, 'Price', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton onClick={() => handleRemoveItem(index)} color="error" disabled={loading}>
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
          disabled={loading}
        >
          Add Item
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading || !selectedCustomer || orderItems.length === 0}
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </form>
    </Paper>
  );
};

export default CreateOrder;