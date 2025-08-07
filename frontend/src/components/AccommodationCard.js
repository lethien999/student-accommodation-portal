import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import './AccommodationCard.css';
import { useCurrency } from '../contexts/CurrencyContext';

const AccommodationCard = ({ accommodation, onFavoriteToggle, isFavorite }) => {
  const { formatCurrency } = useCurrency();
  if (!accommodation) return null;
  const {
    id,
    title,
    description,
    price,
    address,
    city,
    images,
    amenities,
    rating,
    reviewCount,
    roomType,
  } = accommodation;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(id);
    }
  };

  const numericRating = rating ? parseFloat(rating) : 0;

  const roomTypes = Array.isArray(roomType)
    ? roomType
    : roomType
      ? [roomType]
      : [];

  return (
    <Card className="accommodation-card h-100">
      <div className="card-image-container">
        <Card.Img
          variant="top"
          src={images?.[0] || '/placeholder-image.jpg'}
          alt={title}
          className="card-image"
        />
        <Button
          variant="light"
          size="sm"
          className="favorite-btn"
          onClick={handleFavoriteClick}
        >
          {isFavorite ? (
            <FaHeart className="text-danger" />
          ) : (
            <FaRegHeart />
          )}
        </Button>
        {numericRating > 0 && (
          <div className="rating-badge">
            <FaStar className="text-warning" />
            <span className="ms-1">{numericRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="card-title" as="h5">
          {title}
        </Card.Title>

        <div className="location-info mb-2">
          <FaMapMarkerAlt className="text-muted me-1" />
          <small className="text-muted">
            {address}, {city}
          </small>
        </div>

        <div className="price-info mb-2">
          <strong className="text-primary fs-5">
            {formatCurrency(price)}
          </strong>
        </div>

        {numericRating > 0 && reviewCount > 0 && (
          <div className="rating-info mb-2">
            <FaStar className="text-warning me-1" />
            <small className="text-muted">
              {numericRating.toFixed(1)} ({reviewCount} đánh giá)
            </small>
          </div>
        )}

        <Card.Text className="card-description flex-grow-1">
          {description}
        </Card.Text>

        <div className="amenities-container mt-auto">
          {roomTypes.map((type, index) => (
            <Badge key={`type-${index}`} bg="info" text="light" className="me-1 mb-1">
              {type}
            </Badge>
          ))}
          {amenities?.slice(0, 3).map((amenity, index) => (
            <Badge key={`amenity-${index}`} bg="light" text="dark" className="me-1 mb-1">
              {amenity}
            </Badge>
          ))}
          {amenities?.length > 3 && (
            <Badge bg="light" text="dark" className="me-1 mb-1">
              +{amenities.length - 3}
            </Badge>
          )}
        </div>

        <Button
          as={Link}
          to={`/accommodations/${id}`}
          variant="primary"
          className="mt-3 w-100"
        >
          Xem chi tiết
        </Button>
      </Card.Body>
    </Card>
  );
};

export default AccommodationCard; 