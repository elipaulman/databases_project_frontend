import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import { Book } from '../types';
import { API_BASE_URL } from '../config';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const theme = useTheme();

  const columns = [
    { id: 'ISBN' as keyof Book, label: 'ISBN', minWidth: 170 },
    { id: 'Title' as keyof Book, label: 'Title', minWidth: 200 },
    { id: 'Year' as keyof Book, label: 'Year', minWidth: 100 },
    { id: 'Price' as keyof Book, label: 'Price', minWidth: 100, format: (value: number) => `$${value.toFixed(2)}` },
    { id: 'CategoryID' as keyof Book, label: 'Category', minWidth: 150 },
    { id: 'Authors' as keyof Book, label: 'Authors', minWidth: 200 },
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`);
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = selectedCategory
    ? books.filter(book => book.CategoryID === selectedCategory)
    : books;

  const categories = Array.from(new Set(books.map(book => book.CategoryID)));

  const getTotalBooks = () => filteredBooks.length;
  const getAveragePrice = () => {
    if (filteredBooks.length === 0) return 0;
    return filteredBooks.reduce((sum, book) => sum + book.Price, 0) / filteredBooks.length;
  };
  const getTotalValue = () => filteredBooks.reduce((sum, book) => sum + book.Price, 0);

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
        Books Database
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
                Total Books
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
                {getTotalBooks()}
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
                Average Price
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
                ${getAveragePrice().toFixed(2)}
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
                Total Value
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
                ${getTotalValue().toFixed(2)}
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
                <InputLabel sx={{ color: '#007AFF' }}>Filter by Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Filter by Category"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007AFF',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#5856D6',
                    },
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <DataTable
            columns={columns}
            rows={filteredBooks}
            title="Books List"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Books; 