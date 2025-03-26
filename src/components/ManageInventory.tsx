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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { API_BASE_URL } from '../config';
import { Book, Inventory, InventoryUpdate } from '../types';

const ManageInventory: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    // Fetch books and inventory
    const fetchData = async () => {
      try {
        const [booksRes, inventoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/inventory`),
        ]);
        
        if (!booksRes.ok || !inventoryRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const booksData = await booksRes.json();
        const inventoryData = await inventoryRes.json();
        
        setBooks(booksData);
        setInventory(inventoryData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedBook) {
      setError('Please select a book');
      return;
    }

    if (stockQuantity < 0) {
      setError('Stock quantity cannot be negative');
      return;
    }

    const update: InventoryUpdate = {
      ISBN: selectedBook,
      StockQuantity: stockQuantity,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      // Refresh inventory data
      const inventoryRes = await fetch(`${API_BASE_URL}/api/inventory`);
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventory(inventoryData);
      }

      setSuccess('Inventory updated successfully!');
      setSelectedBook('');
      setStockQuantity(0);
    } catch (err) {
      setError('Failed to update inventory');
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Manage Inventory
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: 2 }}>
            <InputLabel>Book</InputLabel>
            <Select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              label="Book"
            >
              {books.map((book) => (
                <MenuItem key={book.ISBN} value={book.ISBN}>
                  {book.Title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            sx={{ flex: 1 }}
            type="number"
            label="Stock Quantity"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(parseInt(e.target.value))}
            inputProps={{ min: 0 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!selectedBook || stockQuantity < 0}
          >
            Update Stock
          </Button>
        </Box>

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
      </form>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Book Title</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell align="right">Stock Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.ISBN}>
                <TableCell>{item.BookTitle}</TableCell>
                <TableCell>{item.ISBN}</TableCell>
                <TableCell align="right">{item.StockQuantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ManageInventory; 