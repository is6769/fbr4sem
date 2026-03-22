import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Вход</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary">Войти</button>
          <Link to="/register">
            <button type="button" className="btn-secondary">Регистрация</button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
