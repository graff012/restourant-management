import express from 'express';
import cors from 'cors';
import CustomError from './utils/custom.error.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode || 404).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
