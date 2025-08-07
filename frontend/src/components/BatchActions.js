import React, { useState } from 'react';
import { Button, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaCheckSquare, FaSquare, FaTrash, FaEdit, FaEye, FaBan, FaCheck, FaTimes } from 'react-icons/fa';

const BatchActions = ({ 
  items, 
  selectedItems, 
  onSelectionChange, 
  onBatchAction,
  actions = [],
  itemType = 'items'
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultActions = [
    {
      id: 'delete',
      label: 'Xóa',
      icon: FaTrash,
      variant: 'danger',
      confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedItems.length} ${itemType} đã chọn?`
    },
    {
      id: 'approve',
      label: 'Phê duyệt',
      icon: FaCheck,
      variant: 'success',
      confirmMessage: `Bạn có chắc chắn muốn phê duyệt ${selectedItems.length} ${itemType} đã chọn?`
    },
    {
      id: 'reject',
      label: 'Từ chối',
      icon: FaTimes,
      variant: 'warning',
      confirmMessage: `Bạn có chắc chắn muốn từ chối ${selectedItems.length} ${itemType} đã chọn?`
    },
    {
      id: 'activate',
      label: 'Kích hoạt',
      icon: FaCheck,
      variant: 'success',
      confirmMessage: `Bạn có chắc chắn muốn kích hoạt ${selectedItems.length} ${itemType} đã chọn?`
    },
    {
      id: 'deactivate',
      label: 'Vô hiệu hóa',
      icon: FaBan,
      variant: 'secondary',
      confirmMessage: `Bạn có chắc chắn muốn vô hiệu hóa ${selectedItems.length} ${itemType} đã chọn?`
    }
  ];

  const availableActions = actions.length > 0 ? actions : defaultActions;

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    onSelectionChange(newSelection);
  };

  const handleBatchAction = (action) => {
    setSelectedAction(action);
    setShowConfirmModal(true);
  };

  const confirmBatchAction = async () => {
    try {
      setLoading(true);
      setError('');

      await onBatchAction(selectedAction.id, selectedItems);
      
      setShowConfirmModal(false);
      setSelectedAction(null);
      onSelectionChange([]); // Clear selection after action
    } catch (error) {
      console.error('Batch action error:', error);
      setError('Có lỗi xảy ra khi thực hiện hành động. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionId) => {
    const action = availableActions.find(a => a.id === actionId);
    return action ? action.icon : FaEdit;
  };

  const getActionVariant = (actionId) => {
    const action = availableActions.find(a => a.id === actionId);
    return action ? action.variant : 'primary';
  };

  const getActionLabel = (actionId) => {
    const action = availableActions.find(a => a.id === actionId);
    return action ? action.label : 'Thao tác';
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Selection Controls */}
      <div className="batch-actions-container mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Form.Check
              type="checkbox"
              id="select-all"
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={handleSelectAll}
              label={
                <span className="ms-2">
                  {selectedItems.length === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </span>
              }
            />
            
            {selectedItems.length > 0 && (
              <Badge bg="primary" className="fs-6">
                {selectedItems.length} / {items.length} đã chọn
              </Badge>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="d-flex gap-2">
              {availableActions.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleBatchAction(action)}
                  className="d-flex align-items-center gap-1"
                >
                  <action.icon />
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Selection */}
      <div className="item-selection mb-3">
        {items.map(item => (
          <div
            key={item.id}
            className={`item-row p-2 border rounded mb-2 ${
              selectedItems.includes(item.id) ? 'border-primary bg-light' : ''
            }`}
          >
            <div className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                id={`item-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="me-3"
              />
              <div className="flex-grow-1">
                {item.title || item.name || item.id}
              </div>
              {selectedItems.includes(item.id) && (
                <Badge bg="primary" className="ms-2">
                  Đã chọn
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <selectedAction?.icon className="me-2" />
            Xác nhận hành động
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}
          
          <p>
            {selectedAction?.confirmMessage || 
              `Bạn có chắc chắn muốn thực hiện hành động "${selectedAction?.label}" cho ${selectedItems.length} ${itemType} đã chọn?`
            }
          </p>
          
          <div className="bg-light p-3 rounded">
            <h6>Danh sách {itemType} sẽ bị ảnh hưởng:</h6>
            <ul className="mb-0">
              {items
                .filter(item => selectedItems.includes(item.id))
                .slice(0, 5)
                .map(item => (
                  <li key={item.id}>
                    {item.title || item.name || item.id}
                  </li>
                ))}
              {selectedItems.length > 5 && (
                <li className="text-muted">
                  ... và {selectedItems.length - 5} {itemType} khác
                </li>
              )}
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button
            variant={selectedAction?.variant || 'primary'}
            onClick={confirmBatchAction}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <selectedAction?.icon className="me-2" />
                Xác nhận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BatchActions; 