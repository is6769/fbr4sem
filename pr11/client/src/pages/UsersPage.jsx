import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function UsersPage({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: '' });
  const navigate = useNavigate();

  const loadUsers = () => {
    api.get('/users').then((res) => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => { loadUsers(); }, []);

  const handleBlock = async (id) => {
    await api.patch(`/users/${id}/block`);
    loadUsers();
  };

  const handleEdit = (u) => {
    setEditing(u.id);
    setEditForm({ first_name: u.first_name, last_name: u.last_name, role: u.role });
  };

  const handleSave = async () => {
    await api.put(`/users/${editing}`, editForm);
    setEditing(null);
    loadUsers();
  };

  return (
    <div className="container">
      <nav>
        <h1>Пользователи</h1>
        <button className="btn-secondary" onClick={() => navigate('/products')}>Назад к товарам</button>
        <span>{user.email} ({user.role})</span>
        <button className="btn-secondary" onClick={onLogout}>Выйти</button>
      </nav>

      {editing && (
        <div className="card">
          <h3>Редактировать пользователя</h3>
          <input
            placeholder="Имя"
            value={editForm.first_name}
            onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
          />
          <input
            placeholder="Фамилия"
            value={editForm.last_name}
            onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
          />
          <select
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            <option value="user">Пользователь</option>
            <option value="seller">Продавец</option>
            <option value="admin">Администратор</option>
          </select>
          <button className="btn-primary" onClick={handleSave}>Сохранить</button>
          <button className="btn-secondary" onClick={() => setEditing(null)}>Отмена</button>
        </div>
      )}

      <div className="card">
        <h3>Список пользователей</h3>
        {users.map((u) => (
          <div className="product-item" key={u.id} style={{ opacity: u.blocked ? 0.5 : 1 }}>
            <span>
              {u.email} — {u.first_name} {u.last_name} — <b>{u.role}</b>
              {u.blocked && ' (заблокирован)'}
            </span>
            <div>
              <button className="btn-success" onClick={() => handleEdit(u)}>Изменить</button>
              <button
                className={u.blocked ? 'btn-primary' : 'btn-danger'}
                onClick={() => handleBlock(u.id)}
              >
                {u.blocked ? 'Разблокировать' : 'Заблокировать'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;
