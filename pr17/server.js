'use strict';

require('dotenv').config();

const https = require('https');
const express = require('express');
const { Server } = require('socket.io');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
};

const server = https.createServer(sslOptions, app);
const io = new Server(server);

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Ошибка: VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY должны быть заданы в .env');
  console.error('Запустите: npm run generate-vapid > .env (и отредактируйте файл)');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:admin@todo-pwa.local',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const pushSubscriptions = new Map();

// Хранилище активных таймеров напоминаний: Map<taskId, timeoutId>
const reminderTimers = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Некорректная подписка' });
  }
  pushSubscriptions.set(subscription.endpoint, subscription);
  console.log(`[Push] Новая подписка: ${subscription.endpoint.slice(0, 60)}...`);
  res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'Не указан endpoint' });
  }
  pushSubscriptions.delete(endpoint);
  console.log(`[Push] Удалена подписка: ${endpoint.slice(0, 60)}...`);
  res.json({ message: 'Подписка удалена' });
});

// Планирование напоминания
app.post('/api/reminders/schedule', (req, res) => {
  const { taskId, text, reminder } = req.body;
  if (!taskId || !reminder) {
    return res.status(400).json({ error: 'Не указан taskId или reminder' });
  }

  const delay = reminder - Date.now();
  if (delay <= 0) {
    return res.status(400).json({ error: 'Время напоминания уже прошло' });
  }

  // Отменяем предыдущий таймер, если был
  if (reminderTimers.has(taskId)) {
    clearTimeout(reminderTimers.get(taskId));
    console.log(`[Reminder] Таймер для задачи ${taskId} перезапланирован`);
  }

  const timerId = setTimeout(async () => {
    reminderTimers.delete(taskId);
    console.log(`[Reminder] Срабатывание напоминания для задачи ${taskId}: "${text}"`);

    if (pushSubscriptions.size > 0) {
      await sendPushToAll({
        title: 'Напоминание',
        body: text || 'Пора выполнить задачу!',
        icon: '/icons/icon-192.png',
        tag: `reminder-${taskId}`,
        data: { taskId, text, reminder },
        actions: [
          { action: 'snooze', title: 'Отложить на 5 мин' },
          { action: 'dismiss', title: 'Закрыть' },
        ],
      });
    }

    // Уведомляем подключённых клиентов через Socket.IO
    io.emit('reminderFired', { taskId, text });
  }, delay);

  reminderTimers.set(taskId, timerId);

  const fireDate = new Date(reminder).toLocaleString('ru-RU');
  console.log(`[Reminder] Запланировано для задачи ${taskId}: ${fireDate} (через ${Math.round(delay / 1000)} сек)`);
  res.json({ message: 'Напоминание запланировано', fireAt: reminder });
});

// Отмена напоминания
app.delete('/api/reminders/:taskId', (req, res) => {
  const { taskId } = req.params;
  if (reminderTimers.has(taskId)) {
    clearTimeout(reminderTimers.get(taskId));
    reminderTimers.delete(taskId);
    console.log(`[Reminder] Отменено для задачи ${taskId}`);
  }
  res.json({ message: 'Напоминание отменено' });
});

// Откладывание напоминания (snooze) — вызывается из Service Worker
app.post('/api/reminders/snooze', (req, res) => {
  const { taskId, text } = req.body;
  if (!taskId) {
    return res.status(400).json({ error: 'Не указан taskId' });
  }

  const snoozeMs = 5 * 60 * 1000; // 5 минут
  const newReminder = Date.now() + snoozeMs;

  // Отменяем текущий таймер, если есть
  if (reminderTimers.has(taskId)) {
    clearTimeout(reminderTimers.get(taskId));
  }

  const timerId = setTimeout(async () => {
    reminderTimers.delete(taskId);
    console.log(`[Reminder] Отложенное напоминание для задачи ${taskId}: "${text}"`);

    if (pushSubscriptions.size > 0) {
      await sendPushToAll({
        title: 'Напоминание (отложенное)',
        body: text || 'Пора выполнить задачу!',
        icon: '/icons/icon-192.png',
        tag: `reminder-${taskId}`,
        data: { taskId, text, reminder: newReminder },
        actions: [
          { action: 'snooze', title: 'Отложить на 5 мин' },
          { action: 'dismiss', title: 'Закрыть' },
        ],
      });
    }

    io.emit('reminderFired', { taskId, text });
  }, snoozeMs);

  reminderTimers.set(taskId, timerId);

  console.log(`[Reminder] Отложено на 5 мин для задачи ${taskId}`);
  res.json({ message: 'Напоминание отложено на 5 минут', fireAt: newReminder });
});

// Получение списка активных таймеров
app.get('/api/reminders', (req, res) => {
  const activeIds = [...reminderTimers.keys()];
  res.json({ active: activeIds });
});

async function sendPushToAll(payload) {
  const promises = [];
  for (const [endpoint, subscription] of pushSubscriptions) {
    const promise = webpush
      .sendNotification(subscription, JSON.stringify(payload))
      .catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`[Push] Подписка устарела, удаляем: ${endpoint.slice(0, 60)}...`);
          pushSubscriptions.delete(endpoint);
        } else {
          console.error('[Push] Ошибка отправки:', err.message);
        }
      });
    promises.push(promise);
  }
  await Promise.all(promises);
}

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Клиент подключён: ${socket.id}`);

  socket.on('newTask', async (task) => {
    console.log(`[Socket.IO] Новая задача от ${socket.id}:`, task.text);
    socket.broadcast.emit('taskAdded', task);
    if (pushSubscriptions.size > 0) {
      await sendPushToAll({
        title: 'Новая задача',
        body: task.text,
        icon: '/icons/icon-192.png',
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Клиент отключён: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен: https://localhost:${PORT}`);
  console.log(`VAPID Public Key: ${VAPID_PUBLIC_KEY}`);
  console.log(`Активных таймеров напоминаний: ${reminderTimers.size}`);
});
