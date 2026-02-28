const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products API',
      version: '1.0.0',
      description: 'API для управления товарами',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./index.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const products = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    category: 'Смартфоны',
    description: 'Флагманский смартфон Apple с чипом A17 Pro, титановым корпусом и камерой 48 МП с тройной оптической системой.',
    price: 119990,
    stock: 15,
    rating: 4.8,
    image: 'https://ant-shop.ru/image/cache/catalog/iphone-15/apple-iphone-15-pro-titanovyy-siniy-400x400.jpeg'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Смартфоны',
    description: 'Мощный Android-флагман с встроенным стилусом S Pen, камерой 200 МП и AI-функциями нового поколения.',
    price: 109990,
    stock: 8,
    rating: 4.7,
    image: 'https://www.gps-expert.ru/pictures/product/middle/13535_middle.jpg'
  },
  {
    id: 3,
    name: 'MacBook Pro 14" M3',
    category: 'Ноутбуки',
    description: 'Профессиональный ноутбук Apple с чипом M3, дисплеем Liquid Retina XDR, до 22 часов автономной работы.',
    price: 189990,
    stock: 6,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
  },
  {
    id: 4,
    name: 'ASUS ROG Zephyrus G14',
    category: 'Ноутбуки',
    description: 'Игровой ноутбук с AMD Ryzen 9, RTX 4090, OLED-дисплеем 165 Гц и компактным корпусом.',
    price: 139990,
    stock: 4,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop'
  },
  {
    id: 5,
    name: 'iPad Pro 12.9" M2',
    category: 'Планшеты',
    description: 'Профессиональный планшет с чипом M2, дисплеем Liquid Retina XDR и поддержкой Apple Pencil 2-го поколения.',
    price: 99990,
    stock: 10,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
  },
  {
    id: 6,
    name: 'Samsung Galaxy Tab S9+',
    category: 'Планшеты',
    description: 'Android-планшет с AMOLED-дисплеем 12.4", процессором Snapdragon 8 Gen 2 и S Pen в комплекте.',
    price: 79990,
    stock: 12,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop'
  },
  {
    id: 7,
    name: 'Sony WH-1000XM5',
    category: 'Наушники',
    description: 'Беспроводные наушники с лучшим шумоподавлением в классе, 30 часами работы и Hi-Res Audio.',
    price: 29990,
    stock: 20,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop'
  },
  {
    id: 8,
    name: 'AirPods Pro 2',
    category: 'Наушники',
    description: 'TWS-наушники Apple с адаптивным шумоподавлением, пространственным звуком и чипом H2.',
    price: 24990,
    stock: 25,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop'
  },
  {
    id: 9,
    name: 'Apple Watch Series 9',
    category: 'Умные часы',
    description: 'Смарт-часы с чипом S9, двойным нажатием, мониторингом здоровья и ярким Always-On дисплеем.',
    price: 39990,
    stock: 18,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
  },
  {
    id: 10,
    name: 'Samsung Galaxy Watch 6',
    category: 'Умные часы',
    description: 'Android-часы с анализом состава тела, датчиком ЧСС, GPS и сапфировым стеклом.',
    price: 24990,
    stock: 14,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop'
  },
  {
    id: 11,
    name: 'Sony PlayStation 5',
    category: 'Игровые консоли',
    description: 'Игровая консоль нового поколения с SSD, 4K-графикой, трассировкой лучей и геймпадом DualSense.',
    price: 54990,
    stock: 3,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'
  },
  {
    id: 12,
    name: 'Nintendo Switch OLED',
    category: 'Игровые консоли',
    description: 'Гибридная игровая консоль с 7-дюймовым OLED-экраном, улучшенным звуком и 64 ГБ памяти.',
    price: 29990,
    stock: 9,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop'
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - category
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         rating:
 *           type: number
 *         image:
 *           type: string
 *       example:
 *         id: 1
 *         name: iPhone 15 Pro
 *         category: Смартфоны
 *         description: Флагманский смартфон Apple с чипом A17 Pro
 *         price: 119990
 *         stock: 15
 *         rating: 4.8
 *         image: https://example.com/image.jpg
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Массив товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  const { category, minPrice, maxPrice, minRating, search } = req.query;

  let filtered = [...products];

  if (category && category !== 'Все') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  if (minRating) {
    filtered = filtered.filter(p => p.rating >= Number(minRating));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Объект товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  res.json(product);
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить список категорий
 *     responses:
 *       200:
 *         description: Массив категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/api/categories', (req, res) => {
  const categories = ['Все', ...new Set(products.map(p => p.category))];
  res.json(categories);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Созданный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;
  if (!name || !category || price == null) {
    return res.status(400).json({ error: 'Поля name, category и price обязательны' });
  }
  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    category,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    rating: Number(rating) || 0,
    image: image || ''
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар полностью
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *       400:
 *         description: Ошибка валидации
 */
app.put('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Товар не найден' });

  const { name, category, description, price, stock, rating, image } = req.body;
  if (!name || !category || price == null) {
    return res.status(400).json({ error: 'Поля name, category и price обязательны' });
  }
  products[idx] = {
    id: products[idx].id,
    name,
    category,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    rating: Number(rating) || 0,
    image: image || ''
  };
  res.json(products[idx]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Частично обновить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Товар не найден' });

  const allowed = ['name', 'category', 'description', 'price', 'stock', 'rating', 'image'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) {
      product[key] = ['price', 'stock', 'rating'].includes(key)
        ? Number(req.body[key])
        : req.body[key];
    }
  });
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Удаленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Товар не найден' });

  const deleted = products.splice(idx, 1)[0];
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
