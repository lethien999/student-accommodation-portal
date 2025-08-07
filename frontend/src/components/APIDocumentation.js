import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge, Nav, Accordion } from 'react-bootstrap';
import { FaBook, FaCode, FaPlay, FaCopy, FaDownload, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';

const APIDocumentation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResponse, setShowResponse] = useState({});

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/v1/users',
      description: 'Lấy danh sách người dùng',
      category: 'users',
      auth: true,
      params: [
        { name: 'page', type: 'number', required: false, description: 'Số trang' },
        { name: 'limit', type: 'number', required: false, description: 'Số lượng mỗi trang' },
        { name: 'search', type: 'string', required: false, description: 'Tìm kiếm theo tên' },
        { name: 'role', type: 'string', required: false, description: 'Lọc theo vai trò' }
      ],
      response: {
        success: true,
        data: {
          users: [
            {
              id: 1,
              username: 'john_doe',
              email: 'john@example.com',
              role: 'tenant',
              status: 'active',
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          total: 1,
          page: 1,
          totalPages: 1
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/users',
      description: 'Tạo người dùng mới',
      category: 'users',
      auth: true,
      body: {
        username: 'string',
        email: 'string',
        password: 'string',
        role: 'string'
      },
      response: {
        success: true,
        data: {
          user: {
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            role: 'tenant',
            status: 'active'
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/accommodations',
      description: 'Lấy danh sách nhà trọ',
      category: 'accommodations',
      auth: false,
      params: [
        { name: 'page', type: 'number', required: false, description: 'Số trang' },
        { name: 'limit', type: 'number', required: false, description: 'Số lượng mỗi trang' },
        { name: 'search', type: 'string', required: false, description: 'Tìm kiếm theo địa chỉ' },
        { name: 'minPrice', type: 'number', required: false, description: 'Giá tối thiểu' },
        { name: 'maxPrice', type: 'number', required: false, description: 'Giá tối đa' }
      ],
      response: {
        success: true,
        data: {
          accommodations: [
            {
              id: 1,
              title: 'Phòng trọ đẹp',
              address: '123 Đường ABC, Quận 1',
              price: 5000000,
              area: 25,
              status: 'available'
            }
          ],
          total: 1,
          page: 1,
          totalPages: 1
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/advertisements',
      description: 'Tạo quảng cáo mới',
      category: 'advertisements',
      auth: true,
      body: {
        title: 'string',
        content: 'string',
        position: 'string',
        startDate: 'date',
        endDate: 'date',
        status: 'string'
      },
      response: {
        success: true,
        data: {
          advertisement: {
            id: 1,
            title: 'Quảng cáo mới',
            content: 'Nội dung quảng cáo',
            position: 'homepage',
            status: 'active'
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/activities',
      description: 'Lấy log hoạt động',
      category: 'activities',
      auth: true,
      params: [
        { name: 'page', type: 'number', required: false, description: 'Số trang' },
        { name: 'limit', type: 'number', required: false, description: 'Số lượng mỗi trang' },
        { name: 'userId', type: 'number', required: false, description: 'ID người dùng' },
        { name: 'action', type: 'string', required: false, description: 'Loại hành động' }
      ],
      response: {
        success: true,
        data: {
          activities: [
            {
              id: 1,
              userId: 1,
              action: 'login',
              description: 'User logged in',
              ipAddress: '192.168.1.1',
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          ],
          total: 1,
          page: 1,
          totalPages: 1
        }
      }
    }
  ];

  const categories = [
    { key: 'overview', label: 'Tổng quan', icon: <FaBook /> },
    { key: 'users', label: 'Người dùng', icon: <FaCode /> },
    { key: 'accommodations', label: 'Nhà trọ', icon: <FaCode /> },
    { key: 'advertisements', label: 'Quảng cáo', icon: <FaCode /> },
    { key: 'activities', label: 'Hoạt động', icon: <FaCode /> },
    { key: 'auth', label: 'Xác thực', icon: <FaCode /> }
  ];

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    if (activeTab === 'overview') return true;
    if (activeTab === 'auth') return endpoint.auth;
    return endpoint.category === activeTab;
  }).filter(endpoint => {
    if (!searchTerm) return true;
    return endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
           endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getMethodBadge = (method) => {
    const variants = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger',
      PATCH: 'info'
    };
    return <Badge bg={variants[method] || 'secondary'}>{method}</Badge>;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleResponse = (endpointId) => {
    setShowResponse(prev => ({
      ...prev,
      [endpointId]: !prev[endpointId]
    }));
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaBook className="me-2" />
                Tài liệu API
              </h5>
              <div>
                <Button variant="outline-success" size="sm" className="me-2">
                  <FaDownload className="me-2" />
                  Tải PDF
                </Button>
                <Button variant="outline-primary" size="sm">
                  <FaPlay className="me-2" />
                  Test API
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Search */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      placeholder="Tìm kiếm endpoint..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <div className="text-end">
                    <small className="text-muted">
                      Base URL: <code>http://localhost:5000</code>
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Navigation */}
              <Nav variant="tabs" className="mb-4">
                {categories.map(category => (
                  <Nav.Item key={category.key}>
                    <Nav.Link 
                      active={activeTab === category.key}
                      onClick={() => setActiveTab(category.key)}
                    >
                      {category.icon} {category.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              {/* API Endpoints */}
              {activeTab === 'overview' && (
                <div className="mb-4">
                  <h6>Chào mừng đến với tài liệu API</h6>
                  <p className="text-muted">
                    API này cung cấp các endpoint để quản lý hệ thống nhà trọ sinh viên.
                    Tất cả các request phải được gửi dưới dạng JSON và response cũng sẽ trả về JSON.
                  </p>
                  
                  <Row className="mt-4">
                    <Col md={4}>
                      <Card className="text-center">
                        <Card.Body>
                          <h5 className="text-success">{apiEndpoints.length}</h5>
                          <p className="text-muted">Endpoints</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center">
                        <Card.Body>
                          <h5 className="text-primary">5</h5>
                          <p className="text-muted">Danh mục</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center">
                        <Card.Body>
                          <h5 className="text-info">99.9%</h5>
                          <p className="text-muted">Uptime</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Endpoints List */}
              <Accordion>
                {filteredEndpoints.map((endpoint, index) => (
                  <Accordion.Item key={index} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center w-100">
                        <div className="me-3">
                          {getMethodBadge(endpoint.method)}
                        </div>
                        <div className="flex-grow-1">
                          <code className="me-3">{endpoint.path}</code>
                          <span className="text-muted">{endpoint.description}</span>
                        </div>
                        {endpoint.auth && (
                          <Badge bg="warning" className="me-2">Auth</Badge>
                        )}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={8}>
                          {/* Parameters */}
                          {endpoint.params && endpoint.params.length > 0 && (
                            <div className="mb-3">
                              <h6>Tham số</h6>
                              <Table striped bordered size="sm">
                                <thead>
                                  <tr>
                                    <th>Tên</th>
                                    <th>Kiểu</th>
                                    <th>Bắt buộc</th>
                                    <th>Mô tả</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.params.map((param, idx) => (
                                    <tr key={idx}>
                                      <td><code>{param.name}</code></td>
                                      <td>{param.type}</td>
                                      <td>{param.required ? 'Có' : 'Không'}</td>
                                      <td>{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}

                          {/* Request Body */}
                          {endpoint.body && (
                            <div className="mb-3">
                              <h6>Request Body</h6>
                              <div className="position-relative">
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary" 
                                  className="position-absolute top-0 end-0"
                                  onClick={() => copyToClipboard(JSON.stringify(endpoint.body, null, 2))}
                                >
                                  <FaCopy />
                                </Button>
                                <pre className="bg-light p-3 rounded" style={{ fontSize: '0.875rem' }}>
                                  {JSON.stringify(endpoint.body, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Response */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6>Response</h6>
                              <div>
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary" 
                                  className="me-2"
                                  onClick={() => toggleResponse(index)}
                                >
                                  {showResponse[index] ? <FaEyeSlash /> : <FaEye />}
                                  {showResponse[index] ? ' Ẩn' : ' Hiện'} Response
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary"
                                  onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2))}
                                >
                                  <FaCopy />
                                </Button>
                              </div>
                            </div>
                            {showResponse[index] && (
                              <pre className="bg-light p-3 rounded" style={{ fontSize: '0.875rem' }}>
                                {JSON.stringify(endpoint.response, null, 2)}
                              </pre>
                            )}
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="sticky-top" style={{ top: '20px' }}>
                            <Card>
                              <Card.Header>
                                <h6 className="mb-0">Test Endpoint</h6>
                              </Card.Header>
                              <Card.Body>
                                <Form>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Method</Form.Label>
                                    <Form.Control value={endpoint.method} readOnly />
                                  </Form.Group>
                                  <Form.Group className="mb-3">
                                    <Form.Label>URL</Form.Label>
                                    <Form.Control value={`http://localhost:5000${endpoint.path}`} readOnly />
                                  </Form.Group>
                                  {endpoint.auth && (
                                    <Alert variant="warning" className="mb-3">
                                      <small>Endpoint này yêu cầu xác thực</small>
                                    </Alert>
                                  )}
                                  <Button variant="primary" size="sm" className="w-100">
                                    <FaPlay className="me-2" />
                                    Test Request
                                  </Button>
                                </Form>
                              </Card.Body>
                            </Card>
                          </div>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>

              {filteredEndpoints.length === 0 && (
                <div className="text-center py-5">
                  <FaSearch size={48} className="text-muted mb-3" />
                  <p className="text-muted">Không tìm thấy endpoint nào phù hợp</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default APIDocumentation; 