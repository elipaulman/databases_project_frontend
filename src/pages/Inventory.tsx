import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, useTheme } from '@mui/material';
import DataTable from '../components/DataTable';
import { Inventory as InventoryType, Book, BookDemand } from '../types';
import { API_BASE_URL } from '../config';
import ManageInventory from '../components/ManageInventory';

interface InventoryWithDetails extends InventoryType {
  title: string;
  price: number;
  popularity: number;
  status: string;
  category: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryType[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [demand, setDemand] = useState<BookDemand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [lowStock, setLowStock] = useState<boolean>(false);
  const theme = useTheme();

  const columns = [
    { id: 'ISBN' as keyof InventoryWithDetails, label: 'ISBN', minWidth: 170 },
    { id: 'title' as keyof InventoryWithDetails, label: 'Title', minWidth: 200 },
    { id: 'StockQuantity' as keyof InventoryWithDetails, label: 'Stock', minWidth: 100 },
    { id: 'price' as keyof InventoryWithDetails, label: 'Price', minWidth: 100, format: (value: number) => `$${value.toFixed(2)}` },
    { id: 'popularity' as keyof InventoryWithDetails, label: 'Popularity', minWidth: 100 },
    { id: 'status' as keyof InventoryWithDetails, label: 'Status', minWidth: 100 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryResponse, booksResponse, demandResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/inventory`),
          fetch(`${API_BASE_URL}/api/books`),
          fetch(`${API_BASE_URL}/api/book-demand`)
        ]);

        if (!inventoryResponse.ok || !booksResponse.ok || !demandResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const inventoryData = await inventoryResponse.json();
        const booksData = await booksResponse.json();
        const demandData = await demandResponse.json();

        setInventory(inventoryData);
        setBooks(booksData);
        setDemand(demandData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Combine inventory data with book and demand information
  const inventoryWithDetails: InventoryWithDetails[] = inventory.map(item => {
    const book = books.find(b => b.ISBN === item.ISBN);
    const demandInfo = demand.find(d => d.ISBN === item.ISBN);
    return {
      ...item,
      title: book?.Title || 'Unknown',
      price: book?.Price || 0,
      popularity: demandInfo?.Popularity || 0,
      status: item.StockQuantity < 10 ? 'Low Stock' : 'In Stock',
      category: book?.CategoryID || 'Unknown'
    };
  });

  const filteredInventory = inventoryWithDetails.filter(item => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (lowStock && item.StockQuantity >= 10) return false;
    return true;
  });

  const categories = Array.from(new Set(books.map(book => book.CategoryID)));

  const getTotalItems = () => inventory.reduce((sum, item) => sum + item.StockQuantity, 0);
  const getLowStockItems = () => inventory.filter(item => item.StockQuantity < 10).length;
  const getAverageStock = () => {
    if (inventory.length === 0) return 0;
    return Number((getTotalItems() / inventory.length).toFixed(1));
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
        Inventory Management
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
                Total Items
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
                {getTotalItems()}
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
                Low Stock Items
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
                {getLowStockItems()}
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
                Average Stock
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
                {getAverageStock()}
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
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={lowStock}
                    onChange={(e) => setLowStock(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#007AFF',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 122, 255, 0.08)',
                        },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#007AFF',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: '#007AFF', fontWeight: 500 }}>
                    Show Low Stock Items Only
                  </Typography>
                }
              />
            </Grid>
          </Grid>

          <DataTable
            columns={columns}
            rows={filteredInventory}
            title="Inventory List"
          />
        </CardContent>
      </Card>

      <ManageInventory />
    </Box>
  );
};

export default Inventory; 