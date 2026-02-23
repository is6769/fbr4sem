import React, { useState } from 'react';
import StarRating from './StarRating';
import './ProductCard.css';

function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₽';
}

function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);

  const stockStatus =
    product.stock === 0
      ? { label: 'Нет в наличии', cls: 'out' }
      : product.stock <= 5
      ? { label: `Осталось ${product.stock} шт.`, cls: 'low' }
      : { label: 'В наличии', cls: 'in' };

  return (
    <article className="product-card" onClick={() => onClick(product)}>
      {!imgError ? (
        <img
          src={product.image}
          alt={product.name}
          className="card-image"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="card-image-placeholder">📦</div>
      )}

      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <h3 className="card-name">{product.name}</h3>
        <p className="card-description">{product.description}</p>

        <div className="card-footer">
          <StarRating rating={product.rating} />
          <div className="card-price-row">
            <span className="card-price">{formatPrice(product.price)}</span>
            <span className={`stock-${stockStatus.cls}`}>{stockStatus.label}</span>
          </div>
          <button
            className="card-btn"
            onClick={e => { e.stopPropagation(); onClick(product); }}
          >
            Подробнее
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
