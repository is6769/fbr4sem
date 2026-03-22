import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UsersPage from './pages/UsersPage';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => { localStorage.clear(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    const meRes = await api.get('/auth/me');
    setUser(meRes.data);
    navigate('/products');
  };

  const handleRegister = async (data) => {
    await api.post('/auth/register', data);
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div className="container"><p>Загрузка...</p></div>;

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/products" /> : <LoginPage onLogin={handleLogin} />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/products" /> : <RegisterPage onRegister={handleRegister} />
      } />
      <Route path="/products" element={
        user ? <ProductsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
      } />
      <Route path="/products/:id" element={
        user ? <ProductDetailPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
      } />
      <Route path="/users" element={
        user && user.role === 'admin' ? <UsersPage user={user} onLogout={handleLogout} /> : <Navigate to="/products" />
      } />
      <Route path="*" element={<Navigate to={user ? '/products' : '/login'} />} />
    </Routes>
  );
}

export default App;
