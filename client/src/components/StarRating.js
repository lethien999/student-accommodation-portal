import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, readonly = false, size = 20 }) => {
    const [hover, setHover] = useState(null);

    return (
        <div className="flex items-center space-x-1">
            {[...Array(5)].map((star, i) => {
                const ratingValue = i + 1;

                return (
                    <label key={i} className={readonly ? "cursor-default" : "cursor-pointer"}>
                        {!readonly && (
                            <input
                                type="radio"
                                name="rating"
                                className="hidden"
                                value={ratingValue}
                                onClick={() => setRating && setRating(ratingValue)}
                            />
                        )}
                        <FaStar
                            size={size}
                            className="transition-colors duration-200"
                            color={
                                ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                            }
                            onMouseEnter={() => !readonly && setHover(ratingValue)}
                            onMouseLeave={() => !readonly && setHover(null)}
                        />
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;
