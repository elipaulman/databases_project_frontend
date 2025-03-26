import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import { Author, Book } from '../types';
import { API_BASE_URL } from '../config';

interface AuthorWithStats extends Author {
  bookCount: number;
}

const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const theme = useTheme();

  const columns = [
    { id: 'AuthorID' as keyof AuthorWithStats, label: 'Author ID', minWidth: 100 },
    { id: 'Name' as keyof AuthorWithStats, label: 'Name', minWidth: 170 },
    { id: 'bookCount' as keyof AuthorWithStats, label: 'Books Published', minWidth: 150 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsResponse, booksResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/authors`),
          fetch(`${API_BASE_URL}/api/books`)
        ]);
        
        if (!authorsResponse.ok || !booksResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const authorsData = await authorsResponse.json();
        const booksData = await booksResponse.json();
        setAuthors(authorsData);
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Add book count to each author
  const authorsWithStats = authors.map(author => ({
    ...author,
    bookCount: books.filter(book => 
      book.Authors?.split(',').map(name => name.trim()).includes(author.Name)
    ).length
  }));

  const filteredAuthors = selectedAuthor
    ? authorsWithStats.filter(author => author.AuthorID === selectedAuthor)
    : authorsWithStats;

  const getMostProlificAuthor = () => {
    if (authorsWithStats.length === 0) return 'N/A';
    return authorsWithStats.reduce((max, author) => 
      author.bookCount > max.bookCount ? author : max
    ).Name;
  };

  const getAverageBooksPerAuthor = () => {
    if (authors.length === 0) return 0;
    return Number((books.length / authors.length).toFixed(1));
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
        Authors Database
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
                Total Authors
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
                {authors.length}
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
                Average Books per Author
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
                {getAverageBooksPerAuthor()}
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
                Most Prolific Author
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
                {getMostProlificAuthor()}
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
                <InputLabel sx={{ color: '#007AFF' }}>Filter by Author</InputLabel>
                <Select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  label="Filter by Author"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#007AFF',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#5856D6',
                    },
                  }}
                >
                  <MenuItem value="">All Authors</MenuItem>
                  {authors.map((author) => (
                    <MenuItem key={author.AuthorID} value={author.AuthorID}>
                      {author.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <DataTable
            columns={columns}
            rows={filteredAuthors}
            title="Authors List"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Authors; 