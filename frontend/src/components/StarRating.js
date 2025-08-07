import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, isEditable = false }) => (
  <div className="star-rating">
    {[...Array(5)].map((_, index) => {
      const ratingValue = index + 1;
      return (
        <FaStar
          key={ratingValue}
          size={20}
          color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
          style={{ cursor: isEditable ? 'pointer' : 'default', marginRight: 2 }}
          onClick={() => isEditable && setRating && setRating(ratingValue)}
        />
      );
    })}
  </div>
);

export default StarRating; 