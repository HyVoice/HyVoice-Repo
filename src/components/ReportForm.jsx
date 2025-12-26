import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { uploadToSupabase } from '../utils/uploadPhoto';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Box,
  Alert,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import PhotoIcon from '@mui/icons-material/Photo';
import SendIcon from '@mui/icons-material/Send';

// Status constants
const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'default', icon: '📥' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'info', icon: '✅' },
  { value: 'in-progress', label: 'In Progress', color: 'warning', icon: '🔄' },
  { value: 'resolved', label: 'Resolved', color: 'success', icon: '🎉' },
  { value: 'rejected', label: 'Rejected', color: 'error', icon: '❌' },
  { value: 'duplicate', label: 'Duplicate', color: 'secondary', icon: '📋' }
];

const ReportForm = ({ location, user }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    urgency: 'medium'
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  const steps = ['Select Location', 'Issue Details', 'Add Photo', 'Review & Submit'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setPhoto(file);
      setError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Move to next step
      setActiveStep(3);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !location) {
      setError('Please select a location on the map first!');
      return;
    }
    
    if (activeStep === 1 && (!formData.title.trim() || !formData.description.trim())) {
      setError('Please fill in all required fields');
      return;
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to report an issue');
      return;
    }
    
    if (!location) {
      setError('Please select a location on the map first!');
      return;
    }
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let photoURL = '';
      
      // 1. Upload photo to SUPABASE if exists
      if (photo) {
        photoURL = await uploadToSupabase(photo, user.uid);
        console.log('Photo uploaded to Supabase:', photoURL);
      }
      
      // 2. Save everything to FIREBASE Firestore with status tracking
      const grievanceData = {
        ...formData,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || `Location at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        },
        photoURL,
        status: 'submitted', // Initial status
        statusHistory: [{
          status: 'submitted',
          timestamp: new Date(),
          by: user.email,
          byName: user.displayName || user.email,
          note: 'Issue reported via HyVoice'
        }],
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Saving to Firebase:', grievanceData);
      const docRef = await addDoc(collection(db, 'grievances'), grievanceData);
      console.log('Document written with ID:', docRef.id);
      
      setSubmissionId(docRef.id);
      setSuccess(true);
      
      // Auto-reset after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({ 
          title: '', 
          description: '', 
          category: 'pothole', 
          urgency: 'medium' 
        });
        setPhoto(null);
        setPhotoPreview(null);
        setActiveStep(0);
        setSubmissionId('');
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting grievance:', error);
      setError(`Submission failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Categories with icons
  const categories = [
    { value: 'pothole', label: '🚧 Pothole', description: 'Road damage, potholes, broken pavement' },
    { value: 'streetlight', label: '💡 Street Light', description: 'Non-working lights, broken poles' },
    { value: 'garbage', label: '🗑️ Garbage', description: 'Overflowing bins, litter, waste management' },
    { value: 'water', label: '💧 Water Issue', description: 'Water leakage, shortage, quality issues' },
    { value: 'drainage', label: '🌊 Drainage', description: 'Blocked drains, water logging' },
    { value: 'electricity', label: '⚡ Electricity', description: 'Power issues, exposed wires' },
    { value: 'traffic', label: '🚦 Traffic', description: 'Signals, signs, road markings' },
    { value: 'other', label: '❓ Other', description: 'Any other civic issue' }
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LocationOnIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Step 1: Select Location
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Click on the map to pinpoint the exact location of the issue
            </Typography>
            
            {location ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Location selected: {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ⚠️ Please select a location on the map
              </Alert>
            )}
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon sx={{ mr: 2, color: '#1976d2' }} />
              <Typography variant="h6">Step 2: Issue Details</Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Issue Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              placeholder="e.g., Large pothole near HITEC City junction"
              helperText="Be specific about the issue location"
            />
            
            <TextField
              fullWidth
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
              disabled={loading}
              placeholder="Describe the issue in detail. Include any safety concerns or impact."
              helperText="Detailed descriptions help authorities address issues faster"
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category *"
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box>
                        <Typography>{cat.label}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {cat.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Urgency *</InputLabel>
                <Select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  label="Urgency *"
                  disabled={loading}
                >
                  <MenuItem value="low">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: '50%', mr: 1 }} />
                      Low Priority
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: '50%', mr: 1 }} />
                      Medium Priority
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: '50%', mr: 1 }} />
                      <PriorityHighIcon fontSize="small" sx={{ mr: 0.5 }} />
                      High Priority
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PhotoIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Step 3: Add Photo (Optional)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Photos help authorities understand the issue better
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoChange}
              disabled={loading}
            />
            <label htmlFor="photo-upload">
              <Button
                component="span"
                variant="contained"
                startIcon={<PhotoCamera />}
                disabled={loading}
                sx={{ py: 1.5, px: 4 }}
              >
                Choose Photo
              </Button>
            </label>
            
            {photoPreview && (
              <Box sx={{ mt: 3 }}>
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }} 
                />
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  {photo?.name} ({(photo?.size / 1024).toFixed(1)} KB)
                </Typography>
              </Box>
            )}
            
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 2 }}>
              Max file size: 5MB • Supported formats: JPG, PNG, WebP
            </Typography>
            
            <Button
              variant="outlined"
              onClick={() => setActiveStep(3)}
              sx={{ mt: 3 }}
              disabled={loading}
            >
              Skip Photo & Continue
            </Button>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SendIcon sx={{ mr: 2, color: '#1976d2' }} />
              <Typography variant="h6">Step 4: Review & Submit</Typography>
            </Box>
            
            {/* Review Card */}
            <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📍 Location
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {location?.address || `${location?.latitude?.toFixed(4)}, ${location?.longitude?.toFixed(4)}`}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📝 Issue Details
                </Typography>
                <Typography variant="body2"><strong>Title:</strong> {formData.title}</Typography>
                <Typography variant="body2"><strong>Category:</strong> {
                  categories.find(c => c.value === formData.category)?.label
                }</Typography>
                <Typography variant="body2"><strong>Urgency:</strong> {
                  formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)
                }</Typography>
                <Typography variant="body2"><strong>Description:</strong> {formData.description}</Typography>
                
                {photoPreview && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      📸 Photo Included
                    </Typography>
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '150px', 
                        maxHeight: '150px', 
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }} 
                    />
                  </>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🔄 Initial Status
                </Typography>
                <Chip 
                  label="Submitted" 
                  color="default" 
                  size="small"
                  icon={<span>📥</span>}
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  Your issue will start with "Submitted" status and can be tracked
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  👤 Reported By
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={user?.photoURL} 
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{user?.displayName || user?.email}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date().toLocaleDateString('en-IN')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* User Info Card */}
      <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={user?.photoURL} 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 2,
                bgcolor: user?.photoURL ? 'transparent' : '#1976d2'
              }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                Reporting as: {user?.displayName || user?.email}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Your report will be linked to your account
              </Typography>
            </Box>
          </Box>
          
          <Chip 
            label="Status: Submitted" 
            color="default" 
            size="small"
            icon={<span>📥</span>}
          />
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ mb: 3 }}
          onClose={() => setSuccess(false)}
        >
          <Typography variant="subtitle2" gutterBottom>
            ✅ Grievance Submitted Successfully!
          </Typography>
          <Typography variant="body2">
            Your issue has been reported with ID: <strong>{submissionId.substring(0, 8)}...</strong><br />
            Initial status: <strong>Submitted</strong> • You can track progress on the dashboard.
          </Typography>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      {getStepContent(activeStep)}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !location}
              startIcon={loading ? null : <CloudUploadIcon />}
              sx={{ minWidth: 150 }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress size={20} sx={{ width: 60 }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Report'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Information */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          📋 Status Tracking Information
        </Typography>
        <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}>
          Your grievance will go through these status stages:<br />
          <strong>1. Submitted</strong> → Issue reported<br />
          <strong>2. Acknowledged</strong> → Authorities have seen it<br />
          <strong>3. In Progress</strong> → Work has started<br />
          <strong>4. Resolved</strong> → Issue fixed<br />
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(status => (
              <Chip 
                key={status.value}
                label={status.label} 
                size="small"
                icon={<span>{status.icon}</span>}
                color={status.color}
                variant="outlined"
              />
            ))}
          </Box>
        </Typography>
      </Alert>
    </Box>
  );
};

export default ReportForm;