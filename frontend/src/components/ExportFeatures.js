import React, { useState } from 'react';
import { Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaFileExport, FaFilePdf, FaFileExcel, FaDownload, FaCog } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportFeatures = ({ data, dataType, onExport }) => {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeTimestamps: true,
    includeMetadata: false,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');

      if (exportFormat === 'excel') {
        await exportToExcel();
      } else if (exportFormat === 'pdf') {
        await exportToPDF();
      }

      setShowModal(false);
      if (onExport) {
        onExport(exportFormat, exportOptions);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for export
    const exportData = prepareDataForExport();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Add metadata if requested
    if (exportOptions.includeMetadata) {
      const metadata = [
        { 'Thông tin': 'Giá trị' },
        { 'Loại dữ liệu': dataType },
        { 'Ngày xuất': new Date().toLocaleString('vi-VN') },
        { 'Tổng số bản ghi': data.length },
        { '': '' } // Empty row
      ];
      
      const metadataSheet = XLSX.utils.json_to_sheet(metadata);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
    }
    
    // Add main data sheet
    XLSX.utils.book_append_sheet(workbook, worksheet, dataType);
    
    // Auto-size columns
    const columnWidths = getColumnWidths(exportData);
    worksheet['!cols'] = columnWidths;
    
    // Generate filename
    const filename = `${dataType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, filename);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`${dataType.toUpperCase()}`, 14, 22);
    
    // Add metadata if requested
    if (exportOptions.includeMetadata) {
      doc.setFontSize(10);
      doc.text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, 14, 32);
      doc.text(`Tổng số bản ghi: ${data.length}`, 14, 38);
      doc.text('', 14, 44); // Empty line
    }
    
    // Prepare data for table
    const exportData = prepareDataForExport();
    const headers = Object.keys(exportData[0] || {});
    const tableData = exportData.map(row => headers.map(header => row[header]));
    
    // Add table
    doc.autoTable({
      head: exportOptions.includeHeaders ? [headers] : [],
      body: tableData,
      startY: exportOptions.includeMetadata ? 50 : 30,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Generate filename
    const filename = `${dataType}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save file
    doc.save(filename);
  };

  const prepareDataForExport = () => {
    if (!data || data.length === 0) return [];

    return data.map(item => {
      const exportItem = { ...item };
      
      // Format dates if timestamps are included
      if (exportOptions.includeTimestamps) {
        Object.keys(exportItem).forEach(key => {
          if (exportItem[key] && typeof exportItem[key] === 'string' && 
              exportItem[key].match(/^\d{4}-\d{2}-\d{2}/)) {
            const date = new Date(exportItem[key]);
            exportItem[key] = date.toLocaleDateString('vi-VN');
          }
        });
      }
      
      // Remove sensitive data
      delete exportItem.password;
      delete exportItem.token;
      delete exportItem.refreshToken;
      
      return exportItem;
    });
  };

  const getColumnWidths = (data) => {
    if (!data || data.length === 0) return [];
    
    const headers = Object.keys(data[0]);
    return headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...data.map(row => String(row[header] || '').length)
      );
      return { width: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
  };

  const getDataTypeConfig = () => {
    const configs = {
      accommodations: {
        title: 'Danh sách nhà trọ',
        description: 'Xuất danh sách nhà trọ với thông tin chi tiết',
        fields: ['id', 'title', 'address', 'price', 'area', 'roomType', 'status', 'createdAt']
      },
      users: {
        title: 'Danh sách người dùng',
        description: 'Xuất danh sách người dùng trong hệ thống',
        fields: ['id', 'username', 'email', 'role', 'status', 'createdAt']
      },
      payments: {
        title: 'Lịch sử thanh toán',
        description: 'Xuất lịch sử thanh toán',
        fields: ['id', 'amount', 'method', 'status', 'createdAt']
      },
      reviews: {
        title: 'Đánh giá',
        description: 'Xuất danh sách đánh giá',
        fields: ['id', 'rating', 'comment', 'createdAt']
      },
      reports: {
        title: 'Báo cáo',
        description: 'Xuất danh sách báo cáo',
        fields: ['id', 'type', 'status', 'createdAt']
      }
    };
    
    return configs[dataType] || {
      title: 'Dữ liệu',
      description: 'Xuất dữ liệu',
      fields: []
    };
  };

  const config = getDataTypeConfig();

  return (
    <>
      <Button
        variant="outline-primary"
        onClick={() => setShowModal(true)}
        className="d-flex align-items-center gap-2"
      >
        <FaFileExport />
        Xuất dữ liệu
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileExport className="me-2" />
            {config.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">{config.description}</p>
          
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Định dạng xuất</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="excel-format"
                  name="exportFormat"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  label={
                    <div className="d-flex align-items-center gap-2">
                      <FaFileExcel className="text-success" />
                      Excel (.xlsx)
                    </div>
                  }
                />
                <Form.Check
                  type="radio"
                  id="pdf-format"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  label={
                    <div className="d-flex align-items-center gap-2">
                      <FaFilePdf className="text-danger" />
                      PDF (.pdf)
                    </div>
                  }
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tùy chọn xuất</Form.Label>
              <div className="row">
                <div className="col-md-6">
                  <Form.Check
                    type="checkbox"
                    id="includeHeaders"
                    label="Bao gồm tiêu đề cột"
                    checked={exportOptions.includeHeaders}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeHeaders: e.target.checked
                    }))}
                  />
                  <Form.Check
                    type="checkbox"
                    id="includeTimestamps"
                    label="Bao gồm thời gian"
                    checked={exportOptions.includeTimestamps}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeTimestamps: e.target.checked
                    }))}
                  />
                </div>
                <div className="col-md-6">
                  <Form.Check
                    type="checkbox"
                    id="includeMetadata"
                    label="Bao gồm thông tin metadata"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeMetadata: e.target.checked
                    }))}
                  />
                </div>
              </div>
            </Form.Group>

            <div className="bg-light p-3 rounded">
              <h6 className="mb-2">Thông tin xuất:</h6>
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">Số bản ghi:</small>
                  <div><Badge bg="info">{data?.length || 0}</Badge></div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Định dạng:</small>
                  <div>
                    <Badge bg={exportFormat === 'excel' ? 'success' : 'danger'}>
                      {exportFormat.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={loading || !data || data.length === 0}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xuất...
              </>
            ) : (
              <>
                <FaDownload className="me-2" />
                Xuất dữ liệu
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ExportFeatures; 