import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Все']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

      const res = await fetch(`/api/products?${params}`);
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="app">
      <Header />
      <main className="main">
        <FilterBar
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onProductClick={setSelectedProduct}
        />
      </main>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default App;
