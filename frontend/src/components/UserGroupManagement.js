import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import userService from '../services/userService';

const UserGroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create | edit | members
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [members, setMembers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUserGroups();
      setGroups(data.groups || data || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch all users for adding member
  const fetchAllUsers = async () => {
    try {
      const data = await userService.getUsers({ limit: 1000 });
      setAllUsers(data.users || []);
    } catch {}
  };

  // Modal handlers
  const openCreateModal = () => {
    setForm({ name: '', description: '' });
    setModalType('create');
    setShowModal(true);
  };
  const openEditModal = (group) => {
    setForm({ name: group.name, description: group.description });
    setSelectedGroup(group);
    setModalType('edit');
    setShowModal(true);
  };
  const openMembersModal = async (group) => {
    setSelectedGroup(group);
    setModalType('members');
    setShowModal(true);
    setMemberLoading(true);
    try {
      const data = await userService.getGroupMembers(group.id);
      setMembers(data.members || data || []);
      fetchAllUsers();
    } catch {
      setMembers([]);
    } finally {
      setMemberLoading(false);
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
    setForm({ name: '', description: '' });
    setMembers([]);
    setNewMemberId('');
  };

  // CRUD group
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userService.createUserGroup(form);
      setSuccess('Tạo nhóm thành công!');
      closeModal();
      fetchGroups();
    } catch {
      setError('Lỗi khi tạo nhóm');
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userService.updateUserGroup(selectedGroup.id, form);
      setSuccess('Cập nhật nhóm thành công!');
      closeModal();
      fetchGroups();
    } catch {
      setError('Lỗi khi cập nhật nhóm');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (group) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhóm này?')) return;
    setLoading(true);
    setError('');
    try {
      await userService.deleteUserGroup(group.id);
      setSuccess('Xóa nhóm thành công!');
      fetchGroups();
    } catch {
      setError('Lỗi khi xóa nhóm');
    } finally {
      setLoading(false);
    }
  };

  // Member management
  const handleAddMember = async () => {
    if (!newMemberId) return;
    setMemberLoading(true);
    try {
      await userService.addGroupMember(selectedGroup.id, newMemberId);
      setSuccess('Thêm thành viên thành công!');
      const data = await userService.getGroupMembers(selectedGroup.id);
      setMembers(data.members || data || []);
      setNewMemberId('');
    } catch {
      setError('Lỗi khi thêm thành viên');
    } finally {
      setMemberLoading(false);
    }
  };
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Xóa thành viên này khỏi nhóm?')) return;
    setMemberLoading(true);
    try {
      await userService.removeGroupMember(selectedGroup.id, userId);
      setSuccess('Xóa thành viên thành công!');
      const data = await userService.getGroupMembers(selectedGroup.id);
      setMembers(data.members || data || []);
    } catch {
      setError('Lỗi khi xóa thành viên');
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý nhóm người dùng</h5>
          <Button variant="primary" onClick={openCreateModal}>Tạo nhóm</Button>
        </Card.Header>
        <Card.Body>
          {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên nhóm</th>
                  <th>Mô tả</th>
                  <th>Thành viên</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, idx) => (
                  <tr key={group.id}>
                    <td>{idx + 1}</td>
                    <td>{group.name}</td>
                    <td>{group.description}</td>
                    <td>
                      <Button size="sm" variant="info" onClick={() => openMembersModal(group)}>
                        Xem ({group.memberCount || 0})
                      </Button>
                    </td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditModal(group)}>Sửa</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(group)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      {/* Modal tạo/sửa nhóm */}
      <Modal show={showModal && (modalType === 'create' || modalType === 'edit')} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'create' ? 'Tạo nhóm' : 'Chỉnh sửa nhóm'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={modalType === 'create' ? handleCreate : handleEdit}>
            <Form.Group className="mb-2">
              <Form.Label>Tên nhóm</Form.Label>
              <Form.Control name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">Hủy</Button>
              <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Đang lưu...' : (modalType === 'create' ? 'Tạo nhóm' : 'Cập nhật')}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Modal thành viên nhóm */}
      <Modal show={showModal && modalType === 'members'} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thành viên nhóm: {selectedGroup?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberLoading ? <div className="text-center"><Spinner animation="border" /></div> : (
            <>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, idx) => (
                    <tr key={m.id}>
                      <td>{idx + 1}</td>
                      <td>{m.username}</td>
                      <td>{m.email}</td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => handleRemoveMember(m.id)}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Form className="d-flex align-items-center mt-3" onSubmit={e => { e.preventDefault(); handleAddMember(); }}>
                <Form.Select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} required style={{ maxWidth: 300 }}>
                  <option value="">Chọn người dùng để thêm</option>
                  {allUsers.filter(u => !members.some(m => m.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </Form.Select>
                <Button type="submit" variant="success" className="ms-2">Thêm thành viên</Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserGroupManagement; 