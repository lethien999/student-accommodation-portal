import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LandlordVerification from '../components/LandlordVerification';

const LandlordVerificationPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Xác minh chủ nhà
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Để trở thành chủ nhà đã xác minh, vui lòng cung cấp thông tin và tài liệu cần thiết.
          Chúng tôi sẽ xem xét yêu cầu của bạn trong vòng 24-48 giờ.
        </Typography>
      </Box>
      <LandlordVerification />
    </Container>
  );
};

export default LandlordVerificationPage; 