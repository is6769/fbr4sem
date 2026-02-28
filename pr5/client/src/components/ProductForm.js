import React, { useState, useEffect } from 'react';
import './ProductForm.css';

const empty = { name: '', category: '', description: '', price: '', stock: '', rating: '', image: '' };

function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(empty);
  const isEdit = !!product;

  useEffect(() => {
    if (product) setForm({ ...product, price: String(product.price), stock: String(product.stock), rating: String(product.rating) });
  }, [product]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      rating: Number(form.rating)
    }, isEdit);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="product-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h2>
        <input name="name" placeholder="Название" value={form.name} onChange={handleChange} required />
        <input name="category" placeholder="Категория" value={form.category} onChange={handleChange} required />
        <textarea name="description" placeholder="Описание" value={form.description} onChange={handleChange} rows={3} />
        <input name="price" type="number" placeholder="Цена" value={form.price} onChange={handleChange} required min="0" />
        <input name="stock" type="number" placeholder="Остаток" value={form.stock} onChange={handleChange} min="0" />
        <input name="rating" type="number" placeholder="Рейтинг (0-5)" value={form.rating} onChange={handleChange} min="0" max="5" step="0.1" />
        <input name="image" placeholder="URL изображения" value={form.image} onChange={handleChange} />
        <div className="form-buttons">
          <button type="submit" className="form-btn save">{isEdit ? 'Сохранить' : 'Создать'}</button>
          <button type="button" className="form-btn cancel" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
