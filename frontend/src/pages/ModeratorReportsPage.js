import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ModeratorReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Fetch reports from API
    // Simulate loading
    setTimeout(() => {
      setReports([
        {
          id: 1,
          type: 'accommodation',
          reason: 'Thông tin sai lệch',
          status: 'pending',
          reporter: 'user1',
          reportedItem: 'Chỗ ở ABC',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          type: 'review',
          reason: 'Nội dung không phù hợp',
          status: 'resolved',
          reporter: 'user2',
          reportedItem: 'Đánh giá XYZ',
          createdAt: '2024-01-14'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleResolve = (reportId, action) => {
    // TODO: Call API to resolve report
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: action === 'approve' ? 'approved' : 'rejected' }
        : report
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'resolved': return 'Đã xử lý';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý báo cáo
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Người báo cáo</TableCell>
                <TableCell>Đối tượng báo cáo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.type === 'accommodation' ? 'Chỗ ở' : 'Đánh giá'} 
                      size="small" 
                      color="primary" 
                    />
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{report.reporter}</TableCell>
                  <TableCell>{report.reportedItem}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(report.status)} 
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{report.createdAt}</TableCell>
                  <TableCell>
                    {report.status === 'pending' && (
                      <Box>
                        <Button
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          color="success"
                          onClick={() => handleResolve(report.id, 'approve')}
                          sx={{ mr: 1 }}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          color="error"
                          onClick={() => handleResolve(report.id, 'reject')}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      variant="outlined"
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ModeratorReportsPage; 