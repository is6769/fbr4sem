const express = require('express');
const app = express();

app.use(express.json());

let products = [
    { id: 1, name: 'Товар 1', price: 100 },
    { id: 2, name: 'Товар 2', price: 200 }
];

let nextId = 3;

app.get('/api/products', (req, res) => {
    res.json(products);
});


app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    res.json(product);
});


app.post('/api/products', (req, res) => {
    const product = {
        id: nextId++,
        name: req.body.name,
        price: req.body.price
    };
    products.push(product);
    res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    
    products[index] = {
        id: parseInt(req.params.id),
        name: req.body.name,
        price: req.body.price
    };
    res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Товар не найден' });
    
    products.splice(index, 1);
    res.json({ message: 'Товар удален' });
});

app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
