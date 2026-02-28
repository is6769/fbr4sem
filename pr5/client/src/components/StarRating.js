import React from 'react';
import './StarRating.css';

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const partial = !filled && i === Math.ceil(rating) && rating % 1 !== 0;

    stars.push(
      <span key={i}>
        {partial ? (
          <span className="star-partial">
            <span className="star-bg">★</span>
            <span className="star-fill" style={{ width: `${Math.round((rating % 1) * 100)}%` }}>★</span>
          </span>
        ) : (
          <span className={filled ? 'star-full' : 'star-empty'}>★</span>
        )}
      </span>
    );
  }

  return (
    <span className="star-rating">
      {stars}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </span>
  );
}

export default StarRating;
