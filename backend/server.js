require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── Connect Database ──────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/user',    require('./routes/userRoutes'));
app.use('/api/machine', require('./routes/machineRoutes'));
app.use('/api/profit',  require('./routes/profitRoutes'));
app.use('/api/mandi',   require('./routes/mandiRoutes'));
app.use('/api/post',    require('./routes/postRoutes'));
app.use('/api/social',  require('./routes/followRoutes'));
app.use('/',            require('./routes/pagesRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🌾 Kisan Plus API is running', status: 'ok' });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
