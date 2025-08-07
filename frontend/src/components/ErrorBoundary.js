import React from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';
import { FaExclamationTriangle, FaRedo, FaHome, FaBug } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In a real app, you would send this to your error reporting service
    // this.logErrorToService(error, errorInfo, errorId);
  }

  logErrorToService = (error, errorInfo, errorId) => {
    // Example: Send to error reporting service
    const errorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send to your error reporting service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('Thông tin lỗi đã được sao chép vào clipboard. Vui lòng gửi cho đội phát triển.');
    }).catch(() => {
      // Fallback: open email client
      const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
      const body = encodeURIComponent(errorDetails);
      window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Card className="error-boundary-card">
            <Card.Header className="bg-danger text-white">
              <FaExclamationTriangle className="me-2" />
              Đã xảy ra lỗi
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <FaExclamationTriangle size={64} className="text-danger mb-3" />
                <h4>Rất tiếc, đã xảy ra lỗi không mong muốn</h4>
                <p className="text-muted">
                  Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể.
                </p>
              </div>

              <Alert variant="info">
                <strong>Mã lỗi:</strong> {this.state.errorId}
                <br />
                <strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}
              </Alert>

              <div className="d-flex justify-content-center gap-3 mb-4">
                <Button 
                  variant="primary" 
                  onClick={this.handleRetry}
                  className="d-flex align-items-center gap-2"
                >
                  <FaRedo />
                  Thử lại
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={this.handleGoHome}
                  className="d-flex align-items-center gap-2"
                >
                  <FaHome />
                  Về trang chủ
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={this.handleReportBug}
                  className="d-flex align-items-center gap-2"
                >
                  <FaBug />
                  Báo lỗi
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-muted">Chi tiết lỗi (Chỉ hiển thị trong môi trường phát triển)</summary>
                  <div className="mt-2">
                    <h6>Error Message:</h6>
                    <pre className="bg-light p-2 rounded small">
                      {this.state.error?.message}
                    </pre>
                    
                    <h6>Error Stack:</h6>
                    <pre className="bg-light p-2 rounded small">
                      {this.state.error?.stack}
                    </pre>
                    
                    <h6>Component Stack:</h6>
                    <pre className="bg-light p-2 rounded small">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 