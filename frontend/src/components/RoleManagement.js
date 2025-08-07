import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Modal, Form, 
  Alert, Badge, Tabs, Tab, ListGroup, Accordion 
} from 'react-bootstrap';
import { 
  FaPlus, FaEdit, FaTrash, FaShieldAlt, FaUsers, 
  FaCog
} from 'react-icons/fa';
import roleService from '../services/roleService';

const fieldModules = [
  { key: 'user', label: 'Người dùng', fields: [
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'role', label: 'Vai trò' }
  ] },
  { key: 'rental_contract', label: 'Hợp đồng thuê', fields: [
    { key: 'deposit', label: 'Tiền cọc' },
    { key: 'totalAmount', label: 'Tổng tiền' },
    { key: 'note', label: 'Ghi chú' }
  ] },
  // Có thể mở rộng thêm các module khác
];

const fieldPermissionOptions = [
  { key: 'view', label: 'Xem' },
  { key: 'edit', label: 'Sửa' },
  { key: 'hide', label: 'Ẩn' }
];

const RoleManagement = ({ isActive }) => {
  // State cho roles
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State cho modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  // State cho forms
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [permissionForm, setPermissionForm] = useState({
    name: '',
    description: '',
    module: '',
    action: ''
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    maxMembers: '',
    roles: []
  });

  const [selectedFieldModule, setSelectedFieldModule] = useState(fieldModules[0].key);
  const [fieldPermissions, setFieldPermissions] = useState({});
  const [savingFieldPerm, setSavingFieldPerm] = useState(false);
  const [fieldPermError, setFieldPermError] = useState('');

  // Fetch data
  useEffect(() => {
    if (isActive) {
      fetchData();
    }
  }, [isActive]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes, groupsRes] = await Promise.all([
        roleService.getAllRoles(),
        roleService.getAllPermissions(),
        roleService.getUserGroups()
      ]);

      setRoles(rolesRes);
      setPermissions(permissionsRes);
      setGroups(groupsRes.groups || []);
    } catch (error) {
      setError('Lỗi khi tải dữ liệu');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Role management
  const handleCreateRole = async () => {
    try {
      await roleService.createRole(roleForm);
      setShowRoleModal(false);
      setRoleForm({ name: '', description: '', permissions: [] });
      fetchData();
    } catch (error) {
      setError('Lỗi khi tạo vai trò');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await roleService.updateRole(editingRole.id, roleForm);
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: [] });
      fetchData();
    } catch (error) {
      setError('Lỗi khi cập nhật vai trò');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Bạn có chắc muốn xóa vai trò này?')) {
      try {
        await roleService.deleteRole(roleId);
        fetchData();
      } catch (error) {
        setError('Lỗi khi xóa vai trò');
      }
    }
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map(p => p.id) || []
    });
    setShowRoleModal(true);
  };

  // Permission management
  const handleCreatePermission = async () => {
    try {
      await roleService.createPermission(permissionForm);
      setShowPermissionModal(false);
      setPermissionForm({ name: '', description: '', module: '', action: '' });
      fetchData();
    } catch (error) {
      setError('Lỗi khi tạo quyền');
    }
  };

  // Group management
  const handleCreateGroup = async () => {
    try {
      await roleService.createUserGroup(groupForm);
      setShowGroupModal(false);
      setGroupForm({ name: '', description: '', maxMembers: '', roles: [] });
      fetchData();
    } catch (error) {
      setError('Lỗi khi tạo nhóm');
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await roleService.updateUserGroup(editingGroup.id, groupForm);
      setShowGroupModal(false);
      setEditingGroup(null);
      setGroupForm({ name: '', description: '', maxMembers: '', roles: [] });
      fetchData();
    } catch (error) {
      setError('Lỗi khi cập nhật nhóm');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhóm này?')) {
      try {
        await roleService.deleteUserGroup(groupId);
        fetchData();
      } catch (error) {
        setError('Lỗi khi xóa nhóm');
      }
    }
  };

  const openEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description,
      maxMembers: group.maxMembers || '',
      roles: group.roles?.map(r => r.id) || []
    });
    setShowGroupModal(true);
  };

  // Fetch field-level permissions
  const fetchFieldPermissions = async () => {
    try {
      const data = await roleService.getFieldPermissions(selectedFieldModule);
      setFieldPermissions(data || {});
    } catch {
      setFieldPermissions({});
    }
  };

  useEffect(() => {
    if (isActive) fetchFieldPermissions();
    // eslint-disable-next-line
  }, [isActive, selectedFieldModule]);

  // Cập nhật quyền trường dữ liệu
  const handleFieldPermChange = (roleId, fieldKey, permKey) => {
    setFieldPermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [fieldKey]: permKey
      }
    }));
  };

  const saveFieldPermissions = async () => {
    setSavingFieldPerm(true);
    setFieldPermError('');
    try {
      await roleService.setFieldPermissions(selectedFieldModule, fieldPermissions);
    } catch {
      setFieldPermError('Lỗi khi lưu phân quyền trường dữ liệu');
    } finally {
      setSavingFieldPerm(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      
      <Tabs defaultActiveKey="roles" className="mb-4">
        {/* Roles Tab */}
        <Tab eventKey="roles" title={
          <span><FaShieldAlt className="me-2" />Vai trò</span>
        }>
          <Row>
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Quản lý vai trò</h5>
                  <Button variant="primary" onClick={() => setShowRoleModal(true)}>
                    <FaPlus className="me-2" />Thêm vai trò
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Tên vai trò</th>
                        <th>Mô tả</th>
                        <th>Số quyền</th>
                        <th>Loại</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => (
                        <tr key={role.id}>
                          <td>
                            <strong>{role.name}</strong>
                            {role.isSystem && <Badge bg="secondary" className="ms-2">Hệ thống</Badge>}
                          </td>
                          <td>{role.description}</td>
                          <td>
                            <Badge bg="info">{role.permissions?.length || 0}</Badge>
                          </td>
                          <td>
                            {role.isSystem ? (
                              <Badge bg="warning">Hệ thống</Badge>
                            ) : (
                              <Badge bg="success">Tùy chỉnh</Badge>
                            )}
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => openEditRole(role)}
                              disabled={role.isSystem}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              disabled={role.isSystem}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Permissions Tab */}
        <Tab eventKey="permissions" title={
          <span><FaCog className="me-2" />Quyền</span>
        }>
          <Row>
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Quản lý quyền</h5>
                  <Button variant="primary" onClick={() => setShowPermissionModal(true)}>
                    <FaPlus className="me-2" />Thêm quyền
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Accordion>
                    {Object.entries(permissions).map(([module, modulePermissions]) => (
                      <Accordion.Item key={module} eventKey={module}>
                        <Accordion.Header>
                          <strong>{module.toUpperCase()}</strong>
                          <Badge bg="info" className="ms-2">{modulePermissions.length}</Badge>
                        </Accordion.Header>
                        <Accordion.Body>
                          <ListGroup>
                            {modulePermissions.map(permission => (
                              <ListGroup.Item key={permission.id} className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{permission.name}</strong>
                                  <br />
                                  <small className="text-muted">{permission.description}</small>
                                </div>
                                <Badge bg="secondary">{permission.action}</Badge>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Groups Tab */}
        <Tab eventKey="groups" title={
          <span><FaUsers className="me-2" />Nhóm người dùng</span>
        }>
          <Row>
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Quản lý nhóm</h5>
                  <Button variant="primary" onClick={() => setShowGroupModal(true)}>
                    <FaPlus className="me-2" />Thêm nhóm
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Tên nhóm</th>
                        <th>Mô tả</th>
                        <th>Thành viên</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(group => (
                        <tr key={group.id}>
                          <td>
                            <strong>{group.name}</strong>
                            {group.isSystem && <Badge bg="secondary" className="ms-2">Hệ thống</Badge>}
                          </td>
                          <td>{group.description}</td>
                          <td>
                            <Badge bg="info">{group.members?.length || 0}</Badge>
                            {group.maxMembers && ` / ${group.maxMembers}`}
                          </td>
                          <td>
                            {group.roles?.map(role => (
                              <Badge key={role.id} bg="success" className="me-1">{role.name}</Badge>
                            ))}
                          </td>
                          <td>
                            {group.isActive ? (
                              <Badge bg="success">Hoạt động</Badge>
                            ) : (
                              <Badge bg="danger">Không hoạt động</Badge>
                            )}
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => openEditGroup(group)}
                              disabled={group.isSystem}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                              disabled={group.isSystem}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="field-permissions" title={<span><FaCog className="me-2" />Phân quyền trường dữ liệu</span>}>
          <Card className="mb-4 mt-3">
            <Card.Header>
              <Row>
                <Col md={4}>
                  <Form.Select value={selectedFieldModule} onChange={e => setSelectedFieldModule(e.target.value)}>
                    {fieldModules.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </Form.Select>
                </Col>
                <Col md={8} className="text-end">
                  <Button variant="success" onClick={saveFieldPermissions} disabled={savingFieldPerm}>
                    {savingFieldPerm ? 'Đang lưu...' : 'Lưu phân quyền'}
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {fieldPermError && <Alert variant="danger">{fieldPermError}</Alert>}
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Trường dữ liệu</th>
                    {roles.map(role => <th key={role.id}>{role.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {fieldModules.find(m => m.key === selectedFieldModule)?.fields.map(field => (
                    <tr key={field.key}>
                      <td>{field.label}</td>
                      {roles.map(role => (
                        <td key={role.id} className="text-center">
                          <Form.Select
                            value={fieldPermissions[role.id]?.[field.key] || ''}
                            onChange={e => handleFieldPermChange(role.id, field.key, e.target.value)}
                          >
                            <option value="">---</option>
                            {fieldPermissionOptions.map(opt => (
                              <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                          </Form.Select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Role Modal */}
      <Modal show={showRoleModal} onHide={() => {
        setShowRoleModal(false);
        setEditingRole(null);
        setRoleForm({ name: '', description: '', permissions: [] });
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên vai trò</Form.Label>
              <Form.Control
                type="text"
                value={roleForm.name}
                onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                placeholder="Nhập tên vai trò"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roleForm.description}
                onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                placeholder="Nhập mô tả"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quyền</Form.Label>
              <Accordion>
                {Object.entries(permissions).map(([module, modulePermissions]) => (
                  <Accordion.Item key={module} eventKey={module}>
                    <Accordion.Header>
                      <Form.Check
                        type="checkbox"
                        checked={modulePermissions.every(p => roleForm.permissions.includes(p.id))}
                        onChange={(e) => {
                          const modulePermissionIds = modulePermissions.map(p => p.id);
                          if (e.target.checked) {
                            setRoleForm({
                              ...roleForm,
                              permissions: [...new Set([...roleForm.permissions, ...modulePermissionIds])]
                            });
                          } else {
                            setRoleForm({
                              ...roleForm,
                              permissions: roleForm.permissions.filter(id => !modulePermissionIds.includes(id))
                            });
                          }
                        }}
                        className="me-2"
                      />
                      <strong>{module.toUpperCase()}</strong>
                    </Accordion.Header>
                    <Accordion.Body>
                      {modulePermissions.map(permission => (
                        <Form.Check
                          key={permission.id}
                          type="checkbox"
                          label={`${permission.name} (${permission.action})`}
                          checked={roleForm.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleForm({
                                ...roleForm,
                                permissions: [...roleForm.permissions, permission.id]
                              });
                            } else {
                              setRoleForm({
                                ...roleForm,
                                permissions: roleForm.permissions.filter(id => id !== permission.id)
                              });
                            }
                          }}
                        />
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={editingRole ? handleUpdateRole : handleCreateRole}>
            {editingRole ? 'Cập nhật' : 'Tạo'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permission Modal */}
      <Modal show={showPermissionModal} onHide={() => {
        setShowPermissionModal(false);
        setPermissionForm({ name: '', description: '', module: '', action: '' });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm quyền mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên quyền</Form.Label>
              <Form.Control
                type="text"
                value={permissionForm.name}
                onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                placeholder="Nhập tên quyền"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={permissionForm.description}
                onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                placeholder="Nhập mô tả"
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Module</Form.Label>
                  <Form.Control
                    type="text"
                    value={permissionForm.module}
                    onChange={(e) => setPermissionForm({...permissionForm, module: e.target.value})}
                    placeholder="VD: user, accommodation"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hành động</Form.Label>
                  <Form.Control
                    type="text"
                    value={permissionForm.action}
                    onChange={(e) => setPermissionForm({...permissionForm, action: e.target.value})}
                    placeholder="VD: create, read, update, delete"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermissionModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleCreatePermission}>
            Tạo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Group Modal */}
      <Modal show={showGroupModal} onHide={() => {
        setShowGroupModal(false);
        setEditingGroup(null);
        setGroupForm({ name: '', description: '', maxMembers: '', roles: [] });
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingGroup ? 'Chỉnh sửa nhóm' : 'Thêm nhóm mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên nhóm</Form.Label>
              <Form.Control
                type="text"
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                placeholder="Nhập tên nhóm"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={groupForm.description}
                onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                placeholder="Nhập mô tả"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số thành viên tối đa</Form.Label>
              <Form.Control
                type="number"
                value={groupForm.maxMembers}
                onChange={(e) => setGroupForm({...groupForm, maxMembers: e.target.value})}
                placeholder="Để trống nếu không giới hạn"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              {roles.map(role => (
                <Form.Check
                  key={role.id}
                  type="checkbox"
                  label={`${role.name} - ${role.description}`}
                  checked={groupForm.roles.includes(role.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setGroupForm({
                        ...groupForm,
                        roles: [...groupForm.roles, role.id]
                      });
                    } else {
                      setGroupForm({
                        ...groupForm,
                        roles: groupForm.roles.filter(id => id !== role.id)
                      });
                    }
                  }}
                />
              ))}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGroupModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}>
            {editingGroup ? 'Cập nhật' : 'Tạo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoleManagement; 