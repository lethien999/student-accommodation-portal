import React, { useState, useEffect } from 'react';
import { Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import landlordReputationService from '../services/landlordReputationService';
import { BsShieldCheck } from 'react-icons/bs';

const LandlordReputationBadge = ({ landlordId }) => {
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!landlordId) {
      setLoading(false);
      return;
    }

    const fetchReputation = async () => {
      try {
        setLoading(true);
        const data = await landlordReputationService.getReputation(landlordId);
        setReputation(data);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [landlordId]);

  const getBadgeVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  if (loading) {
    return <Spinner animation="border" size="sm" />;
  }

  if (error || !reputation) {
    return null; // Don't render anything if there's an error or no data
  }

  const renderTooltip = (props) => (
    <Tooltip id={`reputation-tooltip-${landlordId}`} {...props}>
      <strong>Chi tiết uy tín:</strong><br />
      Điểm đánh giá: {reputation.reviewRating?.toFixed(1)}/5.0<br />
      Nhà đã xác minh: {reputation.verifiedListings}<br />
      Cập nhật lần cuối: {new Date(reputation.lastCalculated).toLocaleDateString('vi-VN')}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <Badge bg={getBadgeVariant(reputation.reputationScore)} className="ms-2">
        <BsShieldCheck className="me-1" />
        {reputation.reputationScore}
      </Badge>
    </OverlayTrigger>
  );
};

export default LandlordReputationBadge; 