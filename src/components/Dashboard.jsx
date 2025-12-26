import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { 
  Card, CardContent, Typography, Chip, Grid,
  Box, LinearProgress, Select, MenuItem, FormControl,
  InputLabel, CardMedia, Avatar, Button, ToggleButton, ToggleButtonGroup,
  Alert, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormGroup, FormControlLabel, Radio, RadioGroup
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportIcon from '@mui/icons-material/Report';
import WarningIcon from '@mui/icons-material/Warning';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PublicIcon from '@mui/icons-material/Public';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BuildIcon from '@mui/icons-material/Build';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Import status constants
import { STATUS_OPTIONS, getStatusInfo } from '../constants/status';

const Dashboard = ({ user }) => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('my');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    submitted: 0,
    acknowledged: 0
  });

  useEffect(() => {
    let q;
    
    if (viewMode === 'my' && user) {
      q = query(
        collection(db, 'grievances'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'grievances'), orderBy('createdAt', 'desc'));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || null
      }));
      
      setGrievances(data);
      
      // Calculate stats
      const statsData = {
        total: data.length,
        resolved: data.filter(g => g.status === 'resolved').length,
        inProgress: data.filter(g => g.status === 'in-progress').length,
        submitted: data.filter(g => g.status === 'submitted').length,
        acknowledged: data.filter(g => g.status === 'acknowledged').length,
        rejected: data.filter(g => g.status === 'rejected').length,
        duplicate: data.filter(g => g.status === 'duplicate').length
      };
      
      setStats(statsData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [viewMode, user]);

  // Filter grievances based on category and status
  const filteredGrievances = grievances.filter(grievance => {
    const categoryMatch = filter === 'all' || grievance.category === filter;
    const statusMatch = statusFilter === 'all' || grievance.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const getStatusIcon = (status) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.icon;
  };

  const getStatusColor = (status) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.color;
  };

  const getStatusDescription = (status) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.description;
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'pothole': return '🚧';
      case 'streetlight': return '💡';
      case 'garbage': return '🗑️';
      case 'water': return '💧';
      case 'drainage': return '🌊';
      default: return '❓';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const diff = now - date;
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleOpenUpdateDialog = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status || 'submitted');
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedGrievance(null);
    setNewStatus('');
  };

  const updateGrievanceStatus = async () => {
    if (!selectedGrievance || !newStatus) return;
    
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'grievances', selectedGrievance.id), {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: user?.email,
        updatedByName: user?.displayName || user?.email
      });
      
      // Show success message
      alert(`Status updated to ${getStatusInfo(newStatus).label}`);
      handleCloseUpdateDialog();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusProgress = (status) => {
    switch(status) {
      case 'submitted': return 25;
      case 'acknowledged': return 50;
      case 'in-progress': return 75;
      case 'resolved': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading grievances...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Grievance Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track and manage civic issues across Hyderabad
        </Typography>
      </Box>

      {/* Status Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.total}</Typography>
              <Typography variant="caption" display="block">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.submitted}</Typography>
              <Typography variant="caption" display="block">📥 Submitted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.acknowledged}</Typography>
              <Typography variant="caption" display="block">✅ Acknowledged</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.inProgress}</Typography>
              <Typography variant="caption" display="block">🔄 In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.resolved}</Typography>
              <Typography variant="caption" display="block">🎉 Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.rejected + stats.duplicate}</Typography>
              <Typography variant="caption" display="block">📋 Other</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Bar */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h6">
              {viewMode === 'my' ? 'My Grievances' : 'All Grievances'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {filteredGrievances.length} issues found
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="my">
                <MyLocationIcon sx={{ mr: 1, fontSize: 16 }} />
                My Issues
              </ToggleButton>
              <ToggleButton value="all">
                <PublicIcon sx={{ mr: 1, fontSize: 16 }} />
                All Issues
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="pothole">🚧 Potholes</MenuItem>
                <MenuItem value="streetlight">💡 Street Lights</MenuItem>
                <MenuItem value="garbage">🗑️ Garbage</MenuItem>
                <MenuItem value="water">💧 Water Issues</MenuItem>
                <MenuItem value="drainage">🌊 Drainage</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 180 }} size="small">
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
            
            <IconButton onClick={() => setLoading(true)} color="primary">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {/* Grievances Grid */}
      {filteredGrievances.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          border: '2px dashed #ccc',
          borderRadius: 2,
          bgcolor: '#fafafa'
        }}>
          <ReportIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No grievances found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {viewMode === 'my' 
              ? "You haven't reported any issues yet." 
              : "No issues match your filters."}
          </Typography>
          <Button 
            variant="contained" 
            href="/report"
            startIcon={<ReportIcon />}
          >
            Report New Issue
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredGrievances.map((grievance) => (
            <Grid item xs={12} md={6} lg={4} key={grievance.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                {grievance.photoURL && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={grievance.photoURL}
                    alt={grievance.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Status Bar */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Chip 
                      label={getStatusInfo(grievance.status).label}
                      color={getStatusColor(grievance.status)}
                      size="small"
                      icon={getStatusInfo(grievance.status).icon === '📥' ? <PendingIcon /> :
                            getStatusInfo(grievance.status).icon === '✅' ? <CheckCircleIcon /> :
                            getStatusInfo(grievance.status).icon === '🔄' ? <BuildIcon /> :
                            getStatusInfo(grievance.status).icon === '🎉' ? <ThumbUpIcon /> :
                            getStatusInfo(grievance.status).icon === '❌' ? <BlockIcon /> :
                            <ContentCopyIcon />}
                    />
                    
                    {/* Update Status Button (only for user's own grievances or admin) */}
                    {(grievance.userId === user?.uid || user?.email?.includes('admin')) && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenUpdateDialog(grievance)}
                        title="Update Status"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* Status Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getStatusProgress(grievance.status)} 
                      sx={{ height: 6, borderRadius: 3 }}
                      color={
                        grievance.status === 'resolved' ? 'success' :
                        grievance.status === 'in-progress' ? 'warning' :
                        grievance.status === 'acknowledged' ? 'info' : 'primary'
                      }
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                      {getStatusDescription(grievance.status)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {getCategoryIcon(grievance.category)} {grievance.title}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    📁 {grievance.category?.charAt(0).toUpperCase() + grievance.category?.slice(1)} • 
                    ⚡ {grievance.urgency?.charAt(0).toUpperCase() + grievance.urgency?.slice(1)}
                  </Typography>
                  
                  <Typography variant="body2" paragraph sx={{ 
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {grievance.description}
                  </Typography>
                  
                  {/* Last Updated Info */}
                  {grievance.updatedAt && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 1, 
                      bgcolor: '#f5f5f5', 
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        Updated: {formatDate(grievance.updatedAt)}
                        {grievance.updatedByName && ` by ${grievance.updatedByName}`}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* User and Location Info */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid #eee'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 30, 
                        height: 30, 
                        mr: 1.5,
                        bgcolor: grievance.userId === user?.uid ? '#1976d2' : '#757575',
                        fontSize: '0.75rem'
                      }}>
                        {grievance.userName?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" display="block">
                          {grievance.userId === user?.uid ? 'You' : grievance.userName?.split('@')[0] || 'User'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(grievance.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption">
                        {grievance.location?.address?.split(',')[0] || 'Hyderabad'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog open={updateDialogOpen} onClose={handleCloseUpdateDialog}>
        <DialogTitle>Update Grievance Status</DialogTitle>
        <DialogContent>
          {selectedGrievance && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Issue: {selectedGrievance.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Current Status: {getStatusInfo(selectedGrievance.status).label}
              </Typography>
              
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <RadioGroup
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <FormControlLabel
                      key={status.value}
                      value={status.value}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{status.icon}</span>
                          <span>{status.label}</span>
                          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                            {status.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog}>Cancel</Button>
          <Button 
            onClick={updateGrievanceStatus} 
            variant="contained"
            disabled={updating || !newStatus || newStatus === selectedGrievance?.status}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer Note */}
      <Box sx={{ 
        mt: 4, 
        pt: 3, 
        borderTop: '1px solid #eee',
        textAlign: 'center' 
      }}>
        <Typography variant="body2" color="textSecondary">
          📊 {stats.resolved} of {stats.total} issues resolved ({stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%)
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
          Click on the edit icon to update status • Real-time updates enabled
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;