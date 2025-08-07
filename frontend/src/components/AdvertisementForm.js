import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import advertisementService from '../services/advertisementService';

const AdvertisementForm = ({ advertisement, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    position: 'homepage',
    priority: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    budget: 0,
    isScheduled: false,
    scheduleType: 'immediate',
    targetAudience: [],
    tags: []
  });

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchPositions();
    if (advertisement) {
      setFormData({
        title: advertisement.title || '',
        description: advertisement.description || '',
        imageUrl: advertisement.imageUrl || '',
        targetUrl: advertisement.targetUrl || '',
        position: advertisement.position || 'homepage',
        priority: advertisement.priority || 1,
        startDate: advertisement.startDate ? new Date(advertisement.startDate) : new Date(),
        endDate: advertisement.endDate ? new Date(advertisement.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        budget: advertisement.budget || 0,
        isScheduled: advertisement.isScheduled || false,
        scheduleType: advertisement.scheduleType || 'immediate',
        targetAudience: advertisement.targetAudience || [],
        tags: advertisement.tags || []
      });
      setImagePreview(advertisement.imageUrl || '');
    }
  }, [advertisement]);

  const fetchPositions = async () => {
    try {
      const positionsData = await advertisementService.getAdvertisementPositions();
      setPositions(positionsData);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagInput = (event) => {
    const value = event.target.value;
    if (value.endsWith(',')) {
      const tag = value.slice(0, -1).trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        event.target.value = '';
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAudienceInput = (event) => {
    const value = event.target.value;
    if (value.endsWith(',')) {
      const audience = value.slice(0, -1).trim();
      if (audience && !formData.targetAudience.includes(audience)) {
        setFormData(prev => ({
          ...prev,
          targetAudience: [...prev.targetAudience, audience]
        }));
        event.target.value = '';
      }
    }
  };

  const handleRemoveAudience = (audienceToRemove) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(audience => audience !== audienceToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.targetUrl.trim()) {
      setError('Target URL is required');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date');
      return false;
    }
    if (formData.budget < 0) {
      setError('Budget cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadResult = await advertisementService.uploadAdvertisementImage(imageFile);
        imageUrl = uploadResult.url;
      }

      const submitData = {
        ...formData,
        imageUrl,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        targetAudience: JSON.stringify(formData.targetAudience),
        tags: JSON.stringify(formData.tags)
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || 'Failed to save advertisement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Basic Information" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target URL"
                    value={formData.targetUrl}
                    onChange={(e) => handleInputChange('targetUrl', e.target.value)}
                    required
                    helperText="The URL where users will be redirected when clicking the ad"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Image Upload */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Advertisement Image" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{ maxWidth: 300, maxHeight: 200, objectFit: 'contain' }}
                  />
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Recommended size: 728x90px for banners, 300x250px for sidebars
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Display Settings" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Position</InputLabel>
                    <Select
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      label="Position"
                    >
                      {positions.map((position) => (
                        <MenuItem key={position.code} value={position.code}>
                          {position.name} ({position.width}x{position.height})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 10 }}
                    helperText="Higher priority ads are displayed first (1-10)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Scheduling */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Scheduling" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isScheduled}
                        onChange={(e) => handleInputChange('isScheduled', e.target.checked)}
                      />
                    }
                    label="Scheduled Advertisement"
                  />
                </Grid>
                {formData.isScheduled && (
                  <>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Schedule Type</InputLabel>
                        <Select
                          value={formData.scheduleType}
                          onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                          label="Schedule Type"
                        >
                          <MenuItem value="immediate">Immediate</MenuItem>
                          <MenuItem value="scheduled">Scheduled</MenuItem>
                          <MenuItem value="recurring">Recurring</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={formData.startDate}
                          onChange={(date) => handleInputChange('startDate', date)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={formData.endDate}
                          onChange={(date) => handleInputChange('endDate', date)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget and Targeting */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Budget" />
            <CardContent>
              <TextField
                fullWidth
                type="number"
                label="Budget ($)"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value))}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Daily budget for this advertisement"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Target Audience" />
            <CardContent>
              <TextField
                fullWidth
                label="Add Target Audience"
                placeholder="e.g., students, young professionals (press comma to add)"
                onKeyUp={handleAudienceInput}
                helperText="Press comma to add each audience segment"
              />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.targetAudience.map((audience, index) => (
                  <Chip
                    key={index}
                    label={audience}
                    onDelete={() => handleRemoveAudience(audience)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tags */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Tags" />
            <CardContent>
              <TextField
                fullWidth
                label="Add Tags"
                placeholder="e.g., student housing, affordable, near campus (press comma to add)"
                onKeyUp={handleTagInput}
                helperText="Press comma to add each tag"
              />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {advertisement ? 'Update Advertisement' : 'Create Advertisement'}
        </Button>
      </Box>
    </Box>
  );
};

export default AdvertisementForm; 