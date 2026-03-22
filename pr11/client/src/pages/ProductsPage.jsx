import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ProductsPage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const canCreate = user.role === 'seller' || user.role === 'admin';
  const canEdit = user.role === 'seller' || user.role === 'admin';
  const canDelete = user.role === 'admin';

  const loadProducts = () => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => {});
  };

  useEffect(() => { loadProducts(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price) };
    if (editing) {
      await api.put(`/products/${editing}`, data);
      setEditing(null);
    } else {
      await api.post('/products', data);
    }
    setForm({ title: '', category: '', description: '', price: '' });
    loadProducts();
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  const handleEditProduct = (product) => {
    setForm({
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price
    });
    setEditing(product.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ title: '', category: '', description: '', price: '' });
  };

  return (
    <div className="container">
      <nav>
        <h1>Товары</h1>
        {user.role === 'admin' && (
          <button className="btn-primary" onClick={() => navigate('/users')}>Пользователи</button>
        )}
        <span>{user.email} ({user.role})</span>
        <button className="btn-secondary" onClick={onLogout}>Выйти</button>
      </nav>

      {canCreate && (
        <div className="card">
          <h3>{editing ? 'Редактировать товар' : 'Добавить товар'}</h3>
          <form onSubmit={handleSubmit}>
            <input name="title" placeholder="Название" value={form.title} onChange={handleChange} />
            <input name="category" placeholder="Категория" value={form.category} onChange={handleChange} />
            <textarea name="description" placeholder="Описание" value={form.description} onChange={handleChange} />
            <input name="price" placeholder="Цена" type="number" value={form.price} onChange={handleChange} />
            <button type="submit" className="btn-primary">{editing ? 'Сохранить' : 'Создать'}</button>
            {editing && <button type="button" className="btn-secondary" onClick={cancelEdit}>Отмена</button>}
          </form>
        </div>
      )}

      <div className="card">
        <h3>Список товаров</h3>
        {products.length === 0 && <p>Нет товаров</p>}
        {products.map((p) => (
          <div className="product-item" key={p.id}>
            <span><b>{p.title}</b> — {p.category} — {p.price} руб.</span>
            <div>
              <button className="btn-primary" onClick={() => navigate(`/products/${p.id}`)}>Детали</button>
              {canEdit && <button className="btn-success" onClick={() => handleEditProduct(p)}>Изменить</button>}
              {canDelete && <button className="btn-danger" onClick={() => handleDelete(p.id)}>Удалить</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
