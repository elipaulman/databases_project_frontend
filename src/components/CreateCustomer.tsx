import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { API_BASE_URL } from '../config';

interface CreateCustomerProps {
  onSuccess?: () => void;
}

const CreateCustomer: React.FC<CreateCustomerProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Address: '',
    Email: '',
    PhoneNumber: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.Name || !formData.Email || !formData.PhoneNumber) {
      setError('Name, Email, and Phone Number are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }

      setSuccess('Customer created successfully!');
      // Reset form
      setFormData({
        Name: '',
        Address: '',
        Email: '',
        PhoneNumber: '',
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add New Customer
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="Name"
              label="Full Name"
              value={formData.Name}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="Address"
              label="Address"
              value={formData.Address}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="Email"
              label="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="PhoneNumber"
              label="Phone Number"
              value={formData.PhoneNumber}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
              margin="normal"
            />
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
            {loading ? 'Creating Customer...' : 'Add Customer'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CreateCustomer;