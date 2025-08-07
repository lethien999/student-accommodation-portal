import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import userService from '../services/userService';

const steps = ['Thông tin cơ bản', 'Tài liệu xác minh', 'Xác nhận'];

const LandlordVerification = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [verificationData, setVerificationData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    idType: '',
    idNumber: '',
    idImages: [],
    propertyDocuments: [],
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleIdImageChange = (e) => {
    setVerificationData({
      ...verificationData,
      idImages: Array.from(e.target.files),
    });
  };

  const handlePropertyDocumentChange = (e) => {
    setVerificationData({
      ...verificationData,
      propertyDocuments: Array.from(e.target.files),
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(verificationData).forEach(key => {
        if (key === 'idImages' || key === 'propertyDocuments') {
          verificationData[key].forEach(file => {
            formData.append(key, file);
          });
        } else {
          formData.append(key, verificationData[key]);
        }
      });

      await userService.requestLandlordVerification(formData);
      handleNext();
    } catch (err) {
      setError(err.message || 'Failed to submit verification request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Họ và tên"
              value={verificationData.fullName}
              onChange={(e) => setVerificationData({ ...verificationData, fullName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              value={verificationData.phoneNumber}
              onChange={(e) => setVerificationData({ ...verificationData, phoneNumber: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              value={verificationData.address}
              onChange={(e) => setVerificationData({ ...verificationData, address: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Loại giấy tờ</InputLabel>
              <Select
                value={verificationData.idType}
                onChange={(e) => setVerificationData({ ...verificationData, idType: e.target.value })}
                label="Loại giấy tờ"
                required
              >
                <MenuItem value="id_card">CMND/CCCD</MenuItem>
                <MenuItem value="passport">Hộ chiếu</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Số giấy tờ"
              value={verificationData.idNumber}
              onChange={(e) => setVerificationData({ ...verificationData, idNumber: e.target.value })}
              required
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="id-image-upload"
                multiple
                type="file"
                onChange={handleIdImageChange}
              />
              <label htmlFor="id-image-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
                  Tải lên ảnh giấy tờ
                </Button>
              </label>
              {verificationData.idImages.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đã chọn {verificationData.idImages.length} ảnh
                </Typography>
              )}
            </Box>

            <Box>
              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="property-document-upload"
                multiple
                type="file"
                onChange={handlePropertyDocumentChange}
              />
              <label htmlFor="property-document-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
                  Tải lên tài liệu nhà trọ
                </Button>
              </label>
              {verificationData.propertyDocuments.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đã chọn {verificationData.propertyDocuments.length} tài liệu
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin
            </Typography>
            <Typography variant="body1" paragraph>
              Họ và tên: {verificationData.fullName}
            </Typography>
            <Typography variant="body1" paragraph>
              Số điện thoại: {verificationData.phoneNumber}
            </Typography>
            <Typography variant="body1" paragraph>
              Địa chỉ: {verificationData.address}
            </Typography>
            <Typography variant="body1" paragraph>
              Loại giấy tờ: {verificationData.idType === 'id_card' ? 'CMND/CCCD' : 'Hộ chiếu'}
            </Typography>
            <Typography variant="body1" paragraph>
              Số giấy tờ: {verificationData.idNumber}
            </Typography>
            <Typography variant="body1" paragraph>
              Số ảnh giấy tờ: {verificationData.idImages.length}
            </Typography>
            <Typography variant="body1" paragraph>
              Số tài liệu nhà trọ: {verificationData.propertyDocuments.length}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Xác minh chủ nhà
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Quay lại
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Gửi yêu cầu'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Tiếp tục
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default LandlordVerification; 