import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Form, Alert, 
  Badge, Spinner, Modal
} from 'react-bootstrap';
import { 
  FaFileContract, FaPlus, FaEdit, FaTrash, FaEye, FaFilePdf
} from 'react-icons/fa';
import rentalContractService from '../services/rentalContractService';
import accommodationService from '../services/accommodationService';
import userService from '../services/userService';
import { useTimezone } from '../contexts/TimezoneContext';
import AuditTrailDialog from './AuditTrailDialog';

const CreateContractModal = ({ show, onHide, onCreated, accommodations, users }) => {
  const [form, setForm] = useState({
    accommodationId: '',
    tenantId: '',
    landlordId: '',
    startDate: '',
    endDate: '',
    deposit: '',
    totalAmount: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await rentalContractService.createRentalContract(form);
      onCreated();
      onHide();
    } catch (err) {
      setError(err?.message || 'Lỗi khi tạo hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tạo hợp đồng thuê</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Nhà trọ</Form.Label>
            <Form.Select name="accommodationId" value={form.accommodationId} onChange={handleChange} required>
              <option value="">Chọn nhà trọ</option>
              {accommodations.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Người thuê</Form.Label>
            <Form.Select name="tenantId" value={form.tenantId} onChange={handleChange} required>
              <option value="">Chọn người thuê</option>
              {users.filter(u => u.role === 'tenant').map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Chủ nhà</Form.Label>
            <Form.Select name="landlordId" value={form.landlordId} onChange={handleChange} required>
              <option value="">Chọn chủ nhà</option>
              {users.filter(u => u.role === 'landlord').map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ngày kết thúc</Form.Label>
            <Form.Control type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Tiền cọc</Form.Label>
            <Form.Control type="number" name="deposit" value={form.deposit} onChange={handleChange} required min="0" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Tổng tiền</Form.Label>
            <Form.Control type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} required min="0" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control as="textarea" name="note" value={form.note} onChange={handleChange} />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">Hủy</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Tạo hợp đồng'}</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const DetailContractModal = ({ show, onHide, contractId }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signInput, setSignInput] = useState('');
  const [success, setSuccess] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    if (show && contractId) {
      setLoading(true);
      setError('');
      rentalContractService.getRentalContract(contractId)
        .then(setContract)
        .catch(err => setError(err?.message || 'Lỗi khi tải chi tiết hợp đồng'))
        .finally(() => setLoading(false));
    }
  }, [show, contractId]);

  // Upload file hợp đồng
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('contractFile', file);
      await rentalContractService.uploadContractFile(contractId, formData);
      setSuccess('Tải file hợp đồng thành công!');
      const updated = await rentalContractService.getRentalContract(contractId);
      setContract(updated);
    } catch {
      setError('Lỗi khi tải file hợp đồng');
    } finally {
      setUploading(false);
    }
  };

  // Ký hợp đồng số
  const handleSign = async (e) => {
    e.preventDefault();
    setSigning(true);
    setError('');
    setSuccess('');
    try {
      await rentalContractService.signContract(contractId, { otp: signInput });
      setSuccess('Ký hợp đồng thành công!');
      const updated = await rentalContractService.getRentalContract(contractId);
      setContract(updated);
      setSignInput('');
    } catch {
      setError('Lỗi khi ký hợp đồng. Vui lòng kiểm tra mã OTP hoặc mật khẩu ký.');
    } finally {
      setSigning(false);
    }
  };

  // Tải file hợp đồng đã ký
  const handleDownloadSigned = async () => {
    try {
      const blob = await rentalContractService.getSignedContractFile(contractId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_contract_${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Lỗi khi tải file hợp đồng đã ký');
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết hợp đồng thuê</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? <div className="text-center"><Spinner animation="border" /></div> :
          error ? <Alert variant="danger">{error}</Alert> : contract && (
            <div>
              <p><b>Nhà trọ:</b> {contract.accommodation?.title} ({contract.accommodation?.address})</p>
              <p><b>Người thuê:</b> {contract.tenant?.username} ({contract.tenant?.email})</p>
              <p><b>Chủ nhà:</b> {contract.landlord?.username} ({contract.landlord?.email})</p>
              <p><b>Ngày bắt đầu:</b> {contract.startDate?.slice(0,10)}</p>
              <p><b>Ngày kết thúc:</b> {contract.endDate?.slice(0,10)}</p>
              <p><b>Tiền cọc:</b> {contract.deposit}</p>
              <p><b>Tổng tiền:</b> {contract.totalAmount}</p>
              <p><b>Trạng thái:</b> <Badge bg="info">{contract.status}</Badge></p>
              <p><b>Ghi chú:</b> {contract.note}</p>
              {success && <Alert variant="success">{success}</Alert>}
              {/* Upload file hợp đồng */}
              {!contract.contractFileUrl && (
                <div className="mb-3">
                  <Form.Label><b>Upload file hợp đồng (PDF):</b></Form.Label>
                  <Form.Control type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} />
                  {uploading && <Spinner animation="border" size="sm" className="ms-2" />}
                </div>
              )}
              {/* Nếu đã có file hợp đồng, cho phép ký số */}
              {contract.contractFileUrl && !contract.signed && (
                <Form onSubmit={handleSign} className="mb-3">
                  <Form.Label><b>Ký hợp đồng số:</b></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập mã OTP hoặc mật khẩu ký"
                    value={signInput}
                    onChange={e => setSignInput(e.target.value)}
                    required
                    maxLength={10}
                    className="mb-2"
                  />
                  <Button type="submit" variant="success" disabled={signing}>{signing ? 'Đang ký...' : 'Ký hợp đồng'}</Button>
                </Form>
              )}
              {/* Nếu đã ký số, hiển thị trạng thái và nút tải file đã ký */}
              {contract.signed && (
                <div className="mb-3">
                  <Alert variant="success">Hợp đồng đã được ký số!</Alert>
                  <Button variant="info" onClick={handleDownloadSigned}>Tải file hợp đồng đã ký</Button>
                </div>
              )}
              <div className="mt-3">
                <Button variant="outline-secondary" onClick={() => setShowAudit(true)}>
                  Xem lịch sử thay đổi
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
      <AuditTrailDialog
        show={showAudit}
        onHide={() => setShowAudit(false)}
        objectId={contractId}
        objectType="rental_contract"
      />
    </>
  );
};

const EditContractModal = ({ show, onHide, contractId, onUpdated }) => {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    deposit: '',
    totalAmount: '',
    status: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    if (show && contractId) {
      setInitLoading(true);
      rentalContractService.getRentalContract(contractId)
        .then(data => {
          setForm({
            startDate: data.startDate?.slice(0,10) || '',
            endDate: data.endDate?.slice(0,10) || '',
            deposit: data.deposit || '',
            totalAmount: data.totalAmount || '',
            status: data.status || '',
            note: data.note || ''
          });
        })
        .catch(err => setError(err?.message || 'Lỗi khi tải hợp đồng'))
        .finally(() => setInitLoading(false));
    }
  }, [show, contractId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await rentalContractService.updateRentalContract(contractId, form);
      onUpdated();
      onHide();
    } catch (err) {
      setError(err?.message || 'Lỗi khi cập nhật hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa hợp đồng thuê</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {initLoading ? <div className="text-center"><Spinner animation="border" /></div> :
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-2">
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ngày kết thúc</Form.Label>
            <Form.Control type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Tiền cọc</Form.Label>
            <Form.Control type="number" name="deposit" value={form.deposit} onChange={handleChange} required min="0" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Tổng tiền</Form.Label>
            <Form.Control type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} required min="0" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select name="status" value={form.status} onChange={handleChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="terminated">Đã chấm dứt</option>
              <option value="pending">Chờ xử lý</option>
              <option value="expired">Đã hết hạn</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control as="textarea" name="note" value={form.note} onChange={handleChange} />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">Hủy</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Đang lưu...' : 'Cập nhật'}</Button>
          </div>
        </Form>}
      </Modal.Body>
    </Modal>
  );
};

const RentalContractManagement = ({ isActive }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [editId, setEditId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    accommodationId: '',
    tenantId: '',
    landlordId: ''
  });

  // Options for dropdowns
  const [accommodations, setAccommodations] = useState([]);
  const [users, setUsers] = useState([]);

  const { formatDateTime } = useTimezone();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rentalContractService.getRentalContracts(filters);
      setContracts(data.contracts || []);
    } catch (error) {
      setError('Lỗi khi tải danh sách hợp đồng');
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchOptions = useCallback(async () => {
    try {
      const [accommodationsData, usersData] = await Promise.all([
        accommodationService.getAccommodations({ limit: 1000 }), // Lấy nhiều hơn để search
        userService.getUsers({ limit: 1000 }) // Lấy nhiều hơn để search
      ]);
      setAccommodations(accommodationsData.accommodations || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchData();
      fetchOptions();
    }
  }, [isActive, fetchData, fetchOptions]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const resetForm = () => {
    // Reset form logic if needed
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEditModal = (contract) => {
    setEditId(contract.id);
    setShowEdit(true);
  };

  const openDetailModal = async (contract) => {
    setDetailId(contract.id);
    setShowDetail(true);
  };

  const handleDelete = async (contract) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      try {
        await rentalContractService.deleteRentalContract(contract.id);
        setSuccess('Xóa hợp đồng thành công!');
        fetchData();
      } catch (error) {
        setError('Lỗi khi xóa hợp đồng');
      }
    }
  };

  const handleDownloadPDF = async (contractId) => {
    try {
      const blob = await rentalContractService.downloadContractPDF(contractId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rental_contract_${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Lỗi khi tải hợp đồng PDF');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      expired: 'danger',
      pending: 'warning',
      terminated: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      
      {loading ? (
        <div className="text-center p-5"><Spinner animation="border" /></div>
      ) : (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaFileContract className="me-2" />
              Quản lý hợp đồng thuê
            </h5>
            <Button variant="primary" onClick={openCreateModal}>
              <FaPlus className="me-2" />
              Tạo hợp đồng
            </Button>
          </Card.Header>
          <Card.Body>
            {/* Filters */}
            <Row className="mb-3">
              <Col md={2}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="terminated">Đã chấm dứt</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="expired">Đã hết hạn</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.accommodationId}
                  onChange={(e) => handleFilterChange('accommodationId', e.target.value)}
                >
                  <option value="">Tất cả nhà trọ</option>
                  {accommodations.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.title}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                 <Form.Select
                  value={filters.tenantId}
                  onChange={(e) => handleFilterChange('tenantId', e.target.value)}
                >
                  <option value="">Tất cả người thuê</option>
                  {users.filter(u => u.role === 'tenant').map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </Form.Select>
              </Col>
               <Col md={3}>
                 <Form.Select
                  value={filters.landlordId}
                  onChange={(e) => handleFilterChange('landlordId', e.target.value)}
                >
                  <option value="">Tất cả chủ nhà</option>
                  {users.filter(u => u.role === 'landlord').map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Contracts Table */}
            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nhà trọ</th>
                    <th>Người thuê</th>
                    <th>Chủ nhà</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract, idx) => (
                    <tr key={contract.id}>
                      <td>{(filters.page - 1) * filters.limit + idx + 1}</td>
                      <td>{contract.accommodation?.title || 'N/A'}</td>
                      <td>{contract.tenant?.username || 'N/A'}</td>
                      <td>{contract.landlord?.username || 'N/A'}</td>
                      <td>{formatDateTime(contract.startDate, { dateStyle: 'short' })}</td>
                      <td>{formatDateTime(contract.endDate, { dateStyle: 'short' })}</td>
                      <td>{getStatusBadge(contract.status)}</td>
                      <td>
                        <Button size="sm" variant="outline-info" className="me-1" onClick={() => openDetailModal(contract)}>
                          <FaEye />
                        </Button>
                        <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditModal(contract)}>
                          <FaEdit />
                        </Button>
                        <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDelete(contract)}>
                          <FaTrash />
                        </Button>
                        <Button size="sm" variant="outline-success" onClick={() => handleDownloadPDF(contract.id)} title="Tải hợp đồng PDF">
                          <FaFilePdf />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
      <CreateContractModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={fetchData}
        accommodations={accommodations}
        users={users}
      />
      <DetailContractModal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        contractId={detailId}
      />
      <EditContractModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        contractId={editId}
        onUpdated={fetchData}
      />
    </Container>
  );
};

export default RentalContractManagement; 