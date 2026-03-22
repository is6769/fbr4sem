import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function RegisterPage({ onRegister }) {
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onRegister(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Регистрация</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} />
          <input name="first_name" placeholder="Имя" value={form.first_name} onChange={handleChange} />
          <input name="last_name" placeholder="Фамилия" value={form.last_name} onChange={handleChange} />
          <input name="password" placeholder="Пароль" type="password" value={form.password} onChange={handleChange} />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">Пользователь</option>
            <option value="seller">Продавец</option>
            <option value="admin">Администратор</option>
          </select>
          <button type="submit" className="btn-success">Зарегистрироваться</button>
          <Link to="/login">
            <button type="button" className="btn-secondary">Назад</button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
