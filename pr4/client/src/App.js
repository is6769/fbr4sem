import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import ProductForm from './components/ProductForm';
import './App.css';

const API = '/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Все']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [filters, setFilters] = useState({
    category: 'Все',
    search: '',
    minRating: 0,
    sortBy: 'default',
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      console.error('Ошибка загрузки категорий');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'Все') params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);
      if (filters.minRating > 0) params.set('minRating', filters.minRating);

      const res = await fetch(`${API}?${params}`);
      if (!res.ok) throw new Error('Ошибка сервера');
      let data = await res.json();

      if (filters.sortBy === 'price-asc') data.sort((a, b) => a.price - b.price);
      else if (filters.sortBy === 'price-desc') data.sort((a, b) => b.price - a.price);
      else if (filters.sortBy === 'rating') data.sort((a, b) => b.rating - a.rating);
      else if (filters.sortBy === 'name') data.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(data);
    } catch (err) {
      setError('Не удалось загрузить товары. Проверьте, что сервер запущен.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (data, isEdit) => {
    try {
      const url = isEdit ? `${API}/${data.id}` : API;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      fetchCategories();
    } catch {
      alert('Ошибка при сохранении товара');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchProducts();
      fetchCategories();
    } catch {
      alert('Ошибка при удалении товара');
    }
  };


  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="toolbar">
          <FilterBar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <button className="add-btn" onClick={handleAdd}>+ Добавить товар</button>
        </div>
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onProductClick={setSelectedProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}

export default App;
