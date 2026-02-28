import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
import './ProductModal.css';

function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₽';
}

function ProductModal({ product, onClose }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const stockStatus =
    product.stock === 0
      ? { label: 'Нет в наличии', cls: 'out' }
      : product.stock <= 5
      ? { label: `Осталось ${product.stock} шт.`, cls: 'low' }
      : { label: `В наличии: ${product.stock} шт.`, cls: 'in' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-body">
          <div>
            {!imgError ? (
              <img
                src={product.image}
                alt={product.name}
                className="modal-image"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="modal-image-placeholder">📦</div>
            )}
          </div>

          <div className="modal-info">
            <span className="modal-category">{product.category}</span>
            <h2 className="modal-name">{product.name}</h2>
            <StarRating rating={product.rating} />
            <p className="modal-description">{product.description}</p>

            <table className="modal-table">
              <tbody>
                <tr>
                  <td>Цена</td>
                  <td className="modal-price">{formatPrice(product.price)}</td>
                </tr>
                <tr>
                  <td>Наличие</td>
                  <td className={`stock-${stockStatus.cls}`}>{stockStatus.label}</td>
                </tr>
                <tr>
                  <td>Рейтинг</td>
                  <td>{product.rating} / 5.0</td>
                </tr>
              </tbody>
            </table>

            <button
              className="modal-buy-btn"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
