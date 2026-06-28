import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js'; 
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';
import globalErrorHandler from './middlewares/errorMiddleware.js';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import testRoutes from './routes/testRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// 🟢 CRITICAL FIX: Network Error टाळण्यासाठी CORS सर्वात वर ठेवला आहे
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// डेटा आणि कुकी पार्सर मिडलवेअर्स
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(helmet());
// ॲप राउट्स (App Routes)
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); 
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/tests', testRoutes);
// स्थानिक फाईल्स दाखवण्यासाठी static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
// ग्लोबल एरर हँडलर पाईपलाईन
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`⚙️ Production Server active on explicit port: ${PORT}`));
};

startServer();