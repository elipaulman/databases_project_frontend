import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { API_BASE_URL } from '../config';

interface CreateAuthorProps {
  onSuccess?: () => void;
}

const CreateAuthor: React.FC<CreateAuthorProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Author name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Name: name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create author');
      }

      setSuccess('Author created successfully!');
      setName(''); // Reset form
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create author');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add New Author
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Author Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          disabled={loading}
          margin="normal"
        />

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
            {loading ? 'Creating Author...' : 'Add Author'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CreateAuthor;