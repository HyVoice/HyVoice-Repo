import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Chip, Button,
  IconButton, TextField, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, LinearProgress, ToggleButton, ToggleButtonGroup,
  Avatar, Tooltip, Badge, Divider, Stack
} from '@mui/material';
import { db } from '../firebase/config';
import { 
  collection, query, orderBy, onSnapshot, where,
  doc, updateDoc, deleteDoc, writeBatch, getCountFromServer
} from 'firebase/firestore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'default', icon: '📥' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'info', icon: '✅' },
  { value: 'in-progress', label: 'In Progress', color: 'warning', icon: '🔄' },
  { value: 'resolved', label: 'Resolved', color: 'success', icon: '🎉' },
  { value: 'rejected', label: 'Rejected', color: 'error', icon: '❌' },
  { value: 'duplicate', label: 'Duplicate', color: 'secondary', icon: '📋' }
];

const CATEGORIES = [
  'pothole', 'streetlight', 'garbage', 'water', 'drainage', 'electricity', 'traffic', 'other'
];

const AdminDashboard = ({ user }) => {
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    acknowledged: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedGrievances, setSelectedGrievances] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [bulkAction, setBulkAction] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Load all grievances
  useEffect(() => {
    const q = query(collection(db, 'grievances'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || null
      }));
      
      setGrievances(data);
      setFilteredGrievances(data);
      calculateStats(data);
      setLoading(false);
    }, (error) => {
      console.error('Error loading grievances:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...grievances];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => g.status === statusFilter);
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }
    
    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(g => g.urgency === urgencyFilter);
    }
    
    // Date range filter
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(g => {
        const created = g.createdAt;
        return created >= dateRange[0] && created <= dateRange[1];
      });
    }
    
    setFilteredGrievances(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, statusFilter, categoryFilter, urgencyFilter, dateRange, grievances]);

  const calculateStats = (data) => {
    const statsData = {
      total: data.length,
      submitted: data.filter(g => g.status === 'submitted').length,
      acknowledged: data.filter(g => g.status === 'acknowledged').length,
      inProgress: data.filter(g => g.status === 'in-progress').length,
      resolved: data.filter(g => g.status === 'resolved').length,
      highPriority: data.filter(g => g.urgency === 'high').length
    };
    setStats(statsData);
  };

  const getStatusColor = (status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status);
    return statusObj?.color || 'default';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'submitted': return <PendingIcon fontSize="small" />;
      case 'acknowledged': return <CheckCircleIcon fontSize="small" />;
      case 'in-progress': return <BuildIcon fontSize="small" />;
      case 'resolved': return <CheckCircleIcon fontSize="small" />;
      case 'rejected': return <WarningIcon fontSize="small" />;
      default: return <PendingIcon fontSize="small" />;
    }
  };

  const handleViewGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setViewDialogOpen(true);
  };

  const handleEditGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setEditForm({
      status: grievance.status,
      urgency: grievance.urgency,
      category: grievance.category,
      notes: grievance.adminNotes || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateGrievance = async () => {
    if (!selectedGrievance) return;
    
    try {
      const grievanceRef = doc(db, 'grievances', selectedGrievance.id);
      const statusHistory = selectedGrievance.statusHistory || [];
      
      const updateData = {
        ...editForm,
        updatedAt: new Date(),
        updatedBy: user.email,
        updatedByName: user.displayName || user.email,
        statusHistory: [
          ...statusHistory,
          {
            status: editForm.status,
            timestamp: new Date(),
            by: user.email,
            byName: user.displayName || user.email,
            note: `Status updated to ${editForm.status}${editForm.notes ? `: ${editForm.notes}` : ''}`
          }
        ]
      };
      
      if (editForm.notes) {
        updateData.adminNotes = editForm.notes;
      }
      
      await updateDoc(grievanceRef, updateData);
      setEditDialogOpen(false);
      alert('Grievance updated successfully!');
    } catch (error) {
      console.error('Error updating grievance:', error);
      alert('Failed to update grievance');
    }
  };

  const handleDeleteGrievance = async (grievanceId) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await deleteDoc(doc(db, 'grievances', grievanceId));
        alert('Grievance deleted successfully!');
      } catch (error) {
        console.error('Error deleting grievance:', error);
        alert('Failed to delete grievance');
      }
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedGrievances.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      selectedGrievances.forEach(grievanceId => {
        const grievanceRef = doc(db, 'grievances', grievanceId);
        
        if (bulkAction === 'delete') {
          batch.delete(grievanceRef);
        } else if (bulkAction === 'update-status' && bulkStatus) {
          const grievance = grievances.find(g => g.id === grievanceId);
          const statusHistory = grievance?.statusHistory || [];
          
          batch.update(grievanceRef, {
            status: bulkStatus,
            updatedAt: new Date(),
            updatedBy: user.email,
            updatedByName: user.displayName || user.email,
            statusHistory: [
              ...statusHistory,
              {
                status: bulkStatus,
                timestamp: new Date(),
                by: user.email,
                byName: user.displayName || user.email,
                note: 'Bulk status update'
              }
            ]
          });
        }
      });
      
      await batch.commit();
      
      // Reset selections
      setSelectedGrievances([]);
      setBulkDialogOpen(false);
      setBulkAction('');
      setBulkStatus('');
      
      alert(`Bulk action completed on ${selectedGrievances.length} grievances`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const handleSelectAll = () => {
    if (selectedGrievances.length === filteredGrievances.length) {
      setSelectedGrievances([]);
    } else {
      setSelectedGrievances(filteredGrievances.map(g => g.id));
    }
  };

  const handleSelectGrievance = (grievanceId) => {
    setSelectedGrievances(prev => 
      prev.includes(grievanceId)
        ? prev.filter(id => id !== grievanceId)
        : [...prev, grievanceId]
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Title', 'Category', 'Status', 'Urgency', 'User', 
      'Email', 'Location', 'Address', 'Created At', 'Updated At'
    ];
    
    const csvData = filteredGrievances.map(g => [
      g.id,
      g.title,
      g.category,
      g.status,
      g.urgency,
      g.userName,
      g.userEmail,
      `${g.location?.latitude}, ${g.location?.longitude}`,
      g.location?.address || '',
      g.createdAt.toLocaleString(),
      g.updatedAt?.toLocaleString() || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grievances_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          🔧 Grievance Management System
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage and monitor all civic grievances • Total: {stats.total} issues
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.total}</Typography>
              <Typography variant="caption" display="block">Total Issues</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.submitted}</Typography>
              <Typography variant="caption" display="block">📥 Submitted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.acknowledged}</Typography>
              <Typography variant="caption" display="block">✅ Acknowledged</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.inProgress}</Typography>
              <Typography variant="caption" display="block">🔄 In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.resolved}</Typography>
              <Typography variant="caption" display="block">🎉 Resolved</Typography>
              <Typography variant="caption" display="block" color="textSecondary">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.highPriority}</Typography>
              <Typography variant="caption" display="block">⚡ High Priority</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Panel */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterAltIcon sx={{ mr: 1, color: '#666' }} />
          <Typography variant="h6">Filters & Search</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search grievances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                {STATUS_OPTIONS.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.icon} {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Urgency</InputLabel>
              <Select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                label="Urgency"
              >
                <MenuItem value="all">All Urgency</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={dateRange[0]}
                onChange={(newValue) => setDateRange([newValue, dateRange[1]])}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To Date"
                value={dateRange[1]}
                onChange={(newValue) => setDateRange([dateRange[0], newValue])}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setUrgencyFilter('all');
                setDateRange([null, null]);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions Bar */}
      {selectedGrievances.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">
            {selectedGrievances.length} grievance(s) selected
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setBulkAction('update-status');
                setBulkDialogOpen(true);
              }}
            >
              Update Status
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setBulkAction('delete');
                setBulkDialogOpen(true);
              }}
            >
              Delete Selected
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedGrievances([])}
            >
              Clear Selection
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{ mr: 2 }}
        >
          Export CSV
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setLoading(true)}
        >
          Refresh
        </Button>
      </Box>

      {/* Grievances Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={filteredGrievances.length > 0 && selectedGrievances.length === filteredGrievances.length}
                  onChange={handleSelectAll}
                  indeterminate={selectedGrievances.length > 0 && selectedGrievances.length < filteredGrievances.length}
                />
              </TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Urgency</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGrievances
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((grievance) => (
                <TableRow 
                  key={grievance.id}
                  hover
                  selected={selectedGrievances.includes(grievance.id)}
                  sx={{ 
                    '&:hover': { bgcolor: '#fafafa' },
                    cursor: 'pointer'
                  }}
                >
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGrievances.includes(grievance.id)}
                      onChange={() => handleSelectGrievance(grievance.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {grievance.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {grievance.description.substring(0, 60)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={grievance.category}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={grievance.status}
                      color={getStatusColor(grievance.status)}
                      size="small"
                      icon={getStatusIcon(grievance.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={grievance.urgency}
                      size="small"
                      sx={{
                        bgcolor: grievance.urgency === 'high' ? '#ffebee' : 
                                 grievance.urgency === 'medium' ? '#fff3e0' : '#e8f5e9',
                        color: grievance.urgency === 'high' ? '#d32f2f' : 
                               grievance.urgency === 'medium' ? '#f57c00' : '#388e3c'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {grievance.userName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {grievance.userName?.split('@')[0] || 'User'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {grievance.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={grievance.location?.address || 'No address'}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {grievance.location?.address?.split(',')[0] || 'Hyderabad'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(grievance.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewGrievance(grievance)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditGrievance(grievance)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteGrievance(grievance.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        
        {filteredGrievances.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">No grievances found</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredGrievances.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Grievance Details</DialogTitle>
        <DialogContent>
          {selectedGrievance && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedGrievance.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {selectedGrievance.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Category</Typography>
                  <Chip label={selectedGrievance.category} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Status</Typography>
                  <Chip 
                    label={selectedGrievance.status}
                    color={getStatusColor(selectedGrievance.status)}
                    icon={getStatusIcon(selectedGrievance.status)}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Urgency</Typography>
                  <Chip label={selectedGrievance.urgency} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>User</Typography>
                  <Typography>{selectedGrievance.userName} ({selectedGrievance.userEmail})</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Location</Typography>
                  <Typography>{selectedGrievance.location?.address || 'No address provided'}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Coordinates: {selectedGrievance.location?.latitude?.toFixed(4)}, {selectedGrievance.location?.longitude?.toFixed(4)}
                  </Typography>
                </Grid>
                
                {selectedGrievance.photoURL && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Photo</Typography>
                    <img 
                      src={selectedGrievance.photoURL} 
                      alt="Grievance" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }} 
                    />
                  </Grid>
                )}
                
                {selectedGrievance.statusHistory && selectedGrievance.statusHistory.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Status History</Typography>
                    <Box sx={{ pl: 2 }}>
                      {selectedGrievance.statusHistory.map((history, index) => (
                        <Box key={index} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                          <Typography variant="body2">
                            <strong>{history.status}</strong> by {history.byName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(history.timestamp)} • {history.note}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setViewDialogOpen(false);
              handleEditGrievance(selectedGrievance);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Grievance</DialogTitle>
        <DialogContent>
          {selectedGrievance && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  label="Status"
                >
                  {STATUS_OPTIONS.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={editForm.urgency}
                  onChange={(e) => setEditForm({...editForm, urgency: e.target.value})}
                  label="Urgency"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  label="Category"
                >
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Add notes about this grievance..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateGrievance}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)}>
        <DialogTitle>
          {bulkAction === 'delete' ? 'Delete Grievances' : 'Update Status'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will affect {selectedGrievances.length} grievance(s)
          </Alert>
          
          {bulkAction === 'update-status' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                label="New Status"
              >
                {STATUS_OPTIONS.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.icon} {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {bulkAction === 'delete' && (
            <Typography color="error" sx={{ mt: 2 }}>
              This action cannot be undone. Are you sure you want to delete these grievances?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={bulkAction === 'delete' ? 'error' : 'primary'}
            onClick={handleBulkAction}
            disabled={bulkAction === 'update-status' && !bulkStatus}
          >
            {bulkAction === 'delete' ? 'Delete' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;