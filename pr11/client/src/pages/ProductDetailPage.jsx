import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/products'));
  }, [id]);

  if (!product) return <div className="container"><p>Загрузка...</p></div>;

  return (
    <div className="container">
      <div className="card">
        <h1>{product.title}</h1>
        <p><b>Категория:</b> {product.category}</p>
        <p><b>Описание:</b> {product.description}</p>
        <p><b>Цена:</b> {product.price} руб.</p>
        <button className="btn-secondary" onClick={() => navigate('/products')}>Назад</button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
