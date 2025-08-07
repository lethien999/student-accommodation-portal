import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const AdvertisementList = ({
  advertisements,
  onEdit,
  onDelete,
  onViewStats,
  onApprove,
  isAdmin = false,
  showApprovalActions = false
}) => {
  const [approvalDialog, setApprovalDialog] = useState({ open: false, ad: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (ad) => {
    setApprovalDialog({ open: true, ad, action: 'approve' });
  };

  const handleReject = (ad) => {
    setApprovalDialog({ open: true, ad, action: 'reject' });
  };

  const handleApprovalSubmit = () => {
    const { ad, action } = approvalDialog;
    onApprove(ad.id, action === 'approve' ? 'active' : 'rejected', rejectionReason);
    setApprovalDialog({ open: false, ad: null });
    setRejectionReason('');
  };

  const handleApprovalCancel = () => {
    setApprovalDialog({ open: false, ad: null });
    setRejectionReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'paused': return 'info';
      case 'rejected': return 'error';
      case 'completed': return 'default';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Approval';
      case 'paused': return 'Paused';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const calculateCTR = (impressions, clicks) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (!advertisements || advertisements.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No advertisements found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Table View for Admin */}
      {isAdmin && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Advertisement</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Impressions</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>CTR</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Date Range</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {advertisements.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {ad.imageUrl && (
                        <Box
                          component="img"
                          src={ad.imageUrl}
                          alt={ad.title}
                          sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {ad.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                          {ad.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={ad.position} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(ad.status)}
                      color={getStatusColor(ad.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon fontSize="small" color="primary" />
                      {ad.impressions?.toLocaleString() || 0}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOnIcon fontSize="small" color="success" />
                      {ad.clicks?.toLocaleString() || 0}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {calculateCTR(ad.impressions || 0, ad.clicks || 0)}%
                  </TableCell>
                  <TableCell>
                    {formatCurrency(ad.budget || 0)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(ad.startDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      to {formatDate(ad.endDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Statistics">
                        <IconButton
                          size="small"
                          onClick={() => onViewStats(ad)}
                          color="info"
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(ad)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {showApprovalActions && ad.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(ad)}
                              color="success"
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleReject(ad)}
                              color="error"
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(ad.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Card View for Regular Users */}
      {!isAdmin && (
        <Grid container spacing={3}>
          {advertisements.map((ad) => (
            <Grid item xs={12} sm={6} md={4} key={ad.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {ad.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={ad.imageUrl}
                    alt={ad.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {ad.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ad.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      label={getStatusLabel(ad.status)}
                      color={getStatusColor(ad.status)}
                      size="small"
                    />
                    <Chip label={ad.position} size="small" variant="outlined" />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                    </Typography>
                    {isAdmin && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => onViewStats(ad)}
                          color="info"
                        >
                          <AssessmentIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(ad)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(ad.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialog.open} onClose={handleApprovalCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalDialog.action === 'approve' ? 'Approve Advertisement' : 'Reject Advertisement'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {approvalDialog.ad?.title}
          </Typography>
          
          {approvalDialog.action === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              helperText="Please provide a reason for rejection"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApprovalCancel}>Cancel</Button>
          <Button
            onClick={handleApprovalSubmit}
            variant="contained"
            color={approvalDialog.action === 'approve' ? 'success' : 'error'}
          >
            {approvalDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvertisementList; 