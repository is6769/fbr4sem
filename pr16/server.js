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
});
