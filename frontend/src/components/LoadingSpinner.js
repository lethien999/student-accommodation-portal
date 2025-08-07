import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { FaSpinner, FaHourglassHalf, FaSync } from 'react-icons/fa';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  type = 'border', 
  size = 'md', 
  message = 'Đang tải...',
  variant = 'primary',
  fullScreen = false,
  overlay = false,
  showIcon = true
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return undefined;
      default: return undefined;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 48;
      default: return 24;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'grow': return <FaSpinner className="fa-spin" size={getIconSize()} />;
      case 'pulse': return <FaHourglassHalf className="fa-pulse" size={getIconSize()} />;
      case 'sync': return <FaSync className="fa-spin" size={getIconSize()} />;
      default: return null;
    }
  };

  const spinnerContent = (
    <div className={`loading-spinner ${fullScreen ? 'fullscreen' : ''} ${overlay ? 'overlay' : ''}`}>
      <div className="loading-content">
        {showIcon && type !== 'border' && (
          <div className="loading-icon mb-3">
            {getIcon()}
          </div>
        )}
        
        {type === 'border' && (
          <Spinner 
            animation="border" 
            variant={variant}
            size={getSpinnerSize()}
            className="mb-3"
          />
        )}
        
        {message && (
          <div className="loading-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {spinnerContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Specialized loading components
export const PageLoader = ({ message = 'Đang tải trang...' }) => (
  <LoadingSpinner 
    type="border" 
    size="lg" 
    message={message}
    fullScreen={true}
  />
);

export const TableLoader = ({ message = 'Đang tải dữ liệu...' }) => (
  <LoadingSpinner 
    type="border" 
    size="md" 
    message={message}
  />
);

export const ButtonLoader = ({ message = 'Đang xử lý...' }) => (
  <LoadingSpinner 
    type="border" 
    size="sm" 
    message={message}
    showIcon={false}
  />
);

export const InlineLoader = ({ message = 'Đang tải...' }) => (
  <LoadingSpinner 
    type="grow" 
    size="sm" 
    message={message}
  />
);

export const OverlayLoader = ({ message = 'Đang xử lý...' }) => (
  <LoadingSpinner 
    type="border" 
    size="md" 
    message={message}
    overlay={true}
  />
);

// Loading with retry functionality
export const LoadingWithRetry = ({ 
  loading, 
  error, 
  onRetry, 
  message = 'Đang tải...',
  errorMessage = 'Có lỗi xảy ra khi tải dữ liệu'
}) => {
  if (loading) {
    return <LoadingSpinner message={message} />;
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <div className="mb-3">
          <strong>{errorMessage}</strong>
        </div>
        {onRetry && (
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={onRetry}
          >
            <FaSync className="me-2" />
            Thử lại
          </button>
        )}
      </Alert>
    );
  }

  return null;
};

// Skeleton loader for content
export const SkeletonLoader = ({ 
  lines = 3, 
  height = '20px',
  width = '100%',
  className = ''
}) => {
  return (
    <div className={`skeleton-loader ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="skeleton-line"
          style={{
            height,
            width: index === lines - 1 ? '60%' : width,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton = ({ 
  title = true, 
  content = true, 
  actions = false 
}) => {
  return (
    <div className="card skeleton-card">
      {title && (
        <div className="card-header">
          <SkeletonLoader lines={1} height="24px" width="60%" />
        </div>
      )}
      {content && (
        <div className="card-body">
          <SkeletonLoader lines={3} height="16px" />
        </div>
      )}
      {actions && (
        <div className="card-footer">
          <div className="d-flex gap-2">
            <SkeletonLoader lines={1} height="32px" width="80px" />
            <SkeletonLoader lines={1} height="32px" width="80px" />
          </div>
        </div>
      )}
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index}>
                <SkeletonLoader lines={1} height="20px" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex}>
                  <SkeletonLoader lines={1} height="16px" width="90%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadingSpinner; 