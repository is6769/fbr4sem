import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

function ProductGrid({ products, loading, error, onProductClick }) {
  if (loading) {
    return (
      <div className="grid-state">
        <div className="spinner" />
        <p className="state-text">Загрузка товаров...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid-state grid-error">
        <span className="state-icon">⚠️</span>
        <p className="state-text">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="grid-state">
        <span className="state-icon">🔍</span>
        <p className="state-text">Ничего не найдено. Попробуйте изменить фильтры.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="products-count">Найдено товаров: {products.length}</p>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
