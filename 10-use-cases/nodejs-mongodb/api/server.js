// server.js - Simple Express API with MongoDB
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appdb';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Simple schema
const ItemSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});
const Item = mongoose.model('Item', ItemSchema);

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/items', async (req, res) => {
  const item = new Item({ name: req.body.name });
  await item.save();
  res.status(201).json(item);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
