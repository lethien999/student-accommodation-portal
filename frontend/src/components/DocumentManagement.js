import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Spinner, Alert, Dropdown, Form } from 'react-bootstrap';
import documentService from '../services/documentService';

const typeLabels = {
  contract: 'Hợp đồng',
  attachment: 'Tài liệu đính kèm',
  other: 'Khác'
};
const statusLabels = {
  unsigned: 'Chưa ký',
  signed: 'Đã ký'
};

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const fetchDocuments = () => {
    setLoading(true);
    documentService.getDocuments()
      .then(data => setDocuments(data))
      .catch(() => setError('Lỗi khi lấy tài liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await documentService.uploadDocument(formData);
      setFile(null);
      fetchDocuments();
    } catch {
      setError('Lỗi khi upload tài liệu');
    } finally {
      setUploading(false);
    }
  };

  const handleSign = async (id) => {
    await documentService.signDocument(id);
    fetchDocuments();
  };

  const handleDownload = async (id, name) => {
    const blob = await documentService.downloadDocument(id);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    await documentService.deleteDocument(id);
    fetchDocuments();
  };

  const filtered = documents.filter(d =>
    (filterType === 'all' || d.type === filterType) &&
    (filterStatus === 'all' || d.status === filterStatus)
  );

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <b>Quản lý tài liệu/hợp đồng số</b>
        <Form inline onSubmit={handleUpload} className="d-flex gap-2">
          <Form.Control type="file" onChange={e => setFile(e.target.files[0])} />
          <Button type="submit" disabled={uploading || !file}>
            {uploading ? <Spinner size="sm" animation="border" /> : 'Upload'}
          </Button>
        </Form>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="d-flex mb-2 gap-2">
          <Dropdown onSelect={setFilterType}>
            <Dropdown.Toggle size="sm" variant="outline-secondary">
              {filterType === 'all' ? 'Tất cả loại' : typeLabels[filterType]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="all">Tất cả loại</Dropdown.Item>
              {Object.entries(typeLabels).map(([k, v]) => (
                <Dropdown.Item key={k} eventKey={k}>{v}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown onSelect={setFilterStatus}>
            <Dropdown.Toggle size="sm" variant="outline-secondary">
              {filterStatus === 'all' ? 'Tất cả trạng thái' : statusLabels[filterStatus]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="all">Tất cả trạng thái</Dropdown.Item>
              {Object.entries(statusLabels).map(([k, v]) => (
                <Dropdown.Item key={k} eventKey={k}>{v}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {loading ? <Spinner animation="border" /> : (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Tên file</th>
                <th>Loại</th>
                <th>Trạng thái ký</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{typeLabels[d.type]}</td>
                  <td>{statusLabels[d.status]}</td>
                  <td>
                    <Button size="sm" variant="outline-success" onClick={() => handleSign(d.id)} disabled={d.status === 'signed'}>Ký số</Button>{' '}
                    <Button size="sm" variant="outline-primary" onClick={() => handleDownload(d.id, d.name)}>Tải về</Button>{' '}
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(d.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default DocumentManagement; 