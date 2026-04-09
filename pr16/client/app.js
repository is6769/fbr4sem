'use strict';

const STORAGE_KEY = 'tasks';

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('toast--visible');
  setTimeout(() => toast.classList.remove('toast--visible'), duration);
}

function renderTasks() {
  const tasks = loadTasks();
  const list = document.getElementById('taskList');
  const emptyMsg = document.getElementById('emptyMsg');

  list.innerHTML = '';
  emptyMsg.style.display = tasks.length ? 'none' : 'block';

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' task-item--done' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-item__checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-item__text';
    span.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-item__delete';
    deleteBtn.title = 'Удалить';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });
}

function addTask(text) {
  const tasks = loadTasks();
  const task = {
    id: Date.now().toString(),
    text: text.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  saveTasks(tasks);
  return task;
}

function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks(tasks);
    renderTasks();
  }
}

function deleteTask(id) {
  saveTasks(loadTasks().filter((t) => t.id !== id));
  renderTasks();
  showToast('Задача удалена');
}

let socket = null;

function initSocket() {
  socket = io();

  socket.on('connect', () => {
    console.log('[Socket.IO] Подключено:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Отключено');
  });

  socket.on('taskAdded', (task) => {
    console.log('[Socket.IO] Получена задача:', task);
    const tasks = loadTasks();
    if (!tasks.find((t) => t.id === task.id)) {
      tasks.unshift(task);
      saveTasks(tasks);
      renderTasks();
      showToast(`Новая задача от другого пользователя: «${task.text}»`, 3500);
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getVapidPublicKey() {
  const res = await fetch('/api/vapid-public-key');
  const data = await res.json();
  return data.publicKey;
}

async function getCurrentSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

async function updatePushUI() {
  const btnSubscribe = document.getElementById('btnSubscribe');
  const btnUnsubscribe = document.getElementById('btnUnsubscribe');
  const pushStatus = document.getElementById('pushStatus');

  if (!('PushManager' in window)) {
    pushStatus.textContent = 'Push-уведомления не поддерживаются браузером';
    return;
  }

  const permission = Notification.permission;
  const subscription = await getCurrentSubscription();

  if (subscription) {
    pushStatus.textContent = '🔔 Push-уведомления включены';
    btnSubscribe.style.display = 'none';
    btnUnsubscribe.style.display = 'inline-block';
  } else if (permission === 'denied') {
    pushStatus.textContent = '⛔ Уведомления заблокированы в настройках браузера';
    btnSubscribe.style.display = 'none';
    btnUnsubscribe.style.display = 'none';
  } else {
    pushStatus.textContent = '🔕 Push-уведомления отключены';
    btnSubscribe.style.display = 'inline-block';
    btnUnsubscribe.style.display = 'none';
  }
}

async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    await fetch('/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    console.log('[Push] Подписка оформлена');
    showToast('Push-уведомления включены');
    await updatePushUI();
  } catch (err) {
    console.error('[Push] Ошибка подписки:', err);
    showToast('Не удалось включить уведомления');
  }
}

async function unsubscribeFromPush() {
  try {
    const subscription = await getCurrentSubscription();
    if (!subscription) return;

    await fetch('/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();

    console.log('[Push] Подписка отменена');
    showToast('Push-уведомления отключены');
    await updatePushUI();
  } catch (err) {
    console.error('[Push] Ошибка отписки:', err);
    showToast('Не удалось отключить уведомления');
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then(async (reg) => {
        console.log('[SW] Зарегистрирован:', reg.scope);
        await updatePushUI();
      })
      .catch((err) => {
        console.error('[SW] Ошибка регистрации:', err);
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  registerServiceWorker();
  initSocket();

  const form = document.getElementById('taskForm');
  const input = document.getElementById('taskInput');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const task = addTask(text);
    input.value = '';
    renderTasks();
    showToast('Задача добавлена');

    if (socket && socket.connected) {
      socket.emit('newTask', task);
    }
  });

  document.getElementById('btnSubscribe').addEventListener('click', subscribeToPush);
  document.getElementById('btnUnsubscribe').addEventListener('click', unsubscribeFromPush);
});
