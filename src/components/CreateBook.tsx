import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Grid,
} from '@mui/material';
import { API_BASE_URL } from '../config';
import { Author, Category, Publisher } from '../types';

interface CreateBookProps {
  onSuccess?: () => void;
}

const CreateBook: React.FC<CreateBookProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    ISBN: '',
    Title: '',
    Year: new Date().getFullYear(),
    Price: 0,
    PublisherID: '',
    CategoryID: '',
    AuthorIDs: [] as string[],
  });
  
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [authorsRes, categoriesRes, publishersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/authors`),
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/publishers`),
        ]);
        
        if (!authorsRes.ok || !categoriesRes.ok || !publishersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const authorsData = await authorsRes.json();
        const categoriesData = await categoriesRes.json();
        const publishersData = await publishersRes.json();
        
        setAuthors(authorsData);
        setCategories(categoriesData);
        setPublishers(publishersData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateISBN = (isbn: string): boolean => {
    // Basic ISBN-13 validation (13 digits)
    const isbnRegex = /^[0-9]{13}$/;
    return isbnRegex.test(isbn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.ISBN || !formData.Title || !formData.CategoryID || 
        !formData.PublisherID || formData.AuthorIDs.length === 0) {
      setError('ISBN, Title, Category, Publisher and at least one Author are required');
      return;
    }

    // Validate ISBN format
    if (!validateISBN(formData.ISBN)) {
      setError('ISBN must be 13 digits');
      return;
    }

    // Validate price
    if (!formData.Price || formData.Price <= 0) {
      setError('Price must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create book');
      }

      setSuccess('Book created successfully!');
      // Reset form
      setFormData({
        ISBN: '',
        Title: '',
        Year: new Date().getFullYear(),
        Price: 0,
        PublisherID: '',
        CategoryID: '',
        AuthorIDs: [],
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create book');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add New Book
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              name="ISBN"
              label="ISBN"
              value={formData.ISBN}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
              margin="normal"
              helperText="13-digit ISBN number"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="Year"
              label="Publication Year"
              type="number"
              value={formData.Year}
              onChange={(e) => setFormData({
                ...formData,
                Year: parseInt(e.target.value) || new Date().getFullYear()
              })}
              fullWidth
              disabled={loading}
              margin="normal"
              inputProps={{ min: 1000, max: new Date().getFullYear() }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="Title"
              label="Book Title"
              value={formData.Title}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="Price"
              label="Price"
              type="number"
              value={formData.Price}
              onChange={(e) => setFormData({
                ...formData,
                Price: parseFloat(e.target.value) || 0
              })}
              fullWidth
              required
              disabled={loading}
              margin="normal"
              inputProps={{ min: 0.01, step: 0.01 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="CategoryID"
                value={formData.CategoryID}
                onChange={handleSelectChange}
                label="Category"
                disabled={loading}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.CategoryID} value={category.CategoryID}>
                    {category.CategoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Publisher</InputLabel>
              <Select
                name="PublisherID"
                value={formData.PublisherID}
                onChange={handleSelectChange}
                label="Publisher"
                disabled={loading}
                required
              >
                {publishers.map((publisher) => (
                  <MenuItem key={publisher.PublisherID} value={publisher.PublisherID}>
                    {publisher.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Authors</InputLabel>
              <Select
                name="AuthorIDs"
                multiple
                value={formData.AuthorIDs}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Authors" />}
                disabled={loading}
                required
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((authorId) => {
                      const author = authors.find(a => a.AuthorID === authorId);
                      return (
                        <Chip key={authorId} label={author?.Name || authorId} />
                      );
                    })}
                  </Box>
                )}
              >
                {authors.map((author) => (
                  <MenuItem key={author.AuthorID} value={author.AuthorID}>
                    {author.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating Book...' : 'Add Book'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CreateBook;