import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { FaPlay, FaCode, FaDownload, FaBook, FaHistory, FaCog } from 'react-icons/fa';

const GraphQLPlayground = () => {
  const [query, setQuery] = useState(`query {
  users {
    id
    username
    email
    role
    status
  }
}`);
  const [variables, setVariables] = useState('{\n  \n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const sampleQueries = [
    {
      name: 'Lấy danh sách người dùng',
      query: `query {
  users {
    id
    username
    email
    role
    status
    createdAt
  }
}`
    },
    {
      name: 'Lấy danh sách nhà trọ',
      query: `query {
  accommodations {
    id
    title
    address
    price
    area
    status
    owner {
      id
      username
      email
    }
  }
}`
    },
    {
      name: 'Lấy thông tin người dùng theo ID',
      query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    username
    email
    role
    status
    profile {
      fullName
      phone
      avatar
    }
  }
}`,
      variables: '{\n  "id": "1"\n}'
    },
    {
      name: 'Tạo người dùng mới',
      query: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    username
    email
    role
    status
  }
}`,
      variables: `{
  "input": {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "tenant"
  }
}`
    }
  ];

  const executeQuery = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const response = await fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query,
          variables: variables ? JSON.parse(variables) : {}
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        setError(result.errors[0].message);
      } else {
        setResponse(result);
        // Add to history
        setHistory(prev => [{
          query,
          variables,
          response: result,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      setError('Lỗi kết nối đến GraphQL server');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuery = (sample) => {
    setQuery(sample.query);
    if (sample.variables) {
      setVariables(sample.variables);
    }
  };

  const clearAll = () => {
    setQuery('');
    setVariables('{\n  \n}');
    setResponse(null);
    setError('');
  };

  const formatJSON = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaCode className="me-2" />
                GraphQL Playground
              </h5>
              <div>
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <FaBook className="me-2" />
                  Schema
                </Button>
                <Button variant="outline-primary" size="sm">
                  <FaDownload className="me-2" />
                  Export
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  {/* Query Editor */}
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Query Editor</h6>
                    </Card.Header>
                    <Card.Body>
                      <Form.Control
                        as="textarea"
                        rows={12}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nhập GraphQL query hoặc mutation..."
                        style={{ fontFamily: 'monospace', fontSize: '14px' }}
                      />
                    </Card.Body>
                  </Card>

                  {/* Variables */}
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Variables</h6>
                    </Card.Header>
                    <Card.Body>
                      <Form.Control
                        as="textarea"
                        rows={6}
                        value={variables}
                        onChange={(e) => setVariables(e.target.value)}
                        placeholder='{\n  "variable": "value"\n}'
                        style={{ fontFamily: 'monospace', fontSize: '14px' }}
                      />
                    </Card.Body>
                  </Card>

                  {/* Response */}
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Response</h6>
                      <div>
                        {loading && <Badge bg="info">Loading...</Badge>}
                        {error && <Badge bg="danger">Error</Badge>}
                        {response && <Badge bg="success">Success</Badge>}
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {error && (
                        <Alert variant="danger">
                          <strong>Error:</strong> {error}
                        </Alert>
                      )}
                      {response && (
                        <pre className="bg-light p-3 rounded" style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '14px',
                          maxHeight: '400px',
                          overflow: 'auto'
                        }}>
                          {formatJSON(response)}
                        </pre>
                      )}
                      {!response && !error && !loading && (
                        <div className="text-center text-muted py-4">
                          <FaCode size={48} className="mb-3" />
                          <p>Response sẽ hiển thị ở đây sau khi thực thi query</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  {/* Controls */}
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Controls</h6>
                    </Card.Header>
                    <Card.Body>
                      <Button 
                        variant="primary" 
                        className="w-100 mb-2"
                        onClick={executeQuery}
                        disabled={loading || !query.trim()}
                      >
                        <FaPlay className="me-2" />
                        {loading ? 'Executing...' : 'Execute Query'}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        className="w-100 mb-2"
                        onClick={clearAll}
                      >
                        <FaCog className="me-2" />
                        Clear All
                      </Button>
                    </Card.Body>
                  </Card>

                  {/* Sample Queries */}
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">Sample Queries</h6>
                    </Card.Header>
                    <Card.Body>
                      {sampleQueries.map((sample, index) => (
                        <Button
                          key={index}
                          variant="outline-info"
                          size="sm"
                          className="w-100 mb-2 text-start"
                          onClick={() => loadSampleQuery(sample)}
                        >
                          {sample.name}
                        </Button>
                      ))}
                    </Card.Body>
                  </Card>

                  {/* Query History */}
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">
                        <FaHistory className="me-2" />
                        History
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      {history.length === 0 ? (
                        <p className="text-muted small">Chưa có lịch sử query</p>
                      ) : (
                        <div>
                          {history.map((item, index) => (
                            <div key={index} className="mb-2 p-2 border rounded">
                              <small className="text-muted d-block">
                                {new Date(item.timestamp).toLocaleString('vi-VN')}
                              </small>
                              <div className="text-truncate" style={{ fontSize: '12px' }}>
                                {item.query.split('\n')[0].trim()}
                              </div>
                              <div className="mt-1">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => {
                                    setQuery(item.query);
                                    setVariables(item.variables);
                                  }}
                                >
                                  Load
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GraphQLPlayground; 