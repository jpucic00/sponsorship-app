import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Import route modules
import childrenRoutes from './routes/children';
import sponsorsRoutes from './routes/sponsors';
import sponsorshipsRoutes from './routes/sponsorships';
import volunteersRoutes from './routes/volunteers';
import schoolsRoutes from './routes/schools';
import proxiesRoutes from './routes/proxies';
import childPhotosRoutes from './routes/child-photos'; // Photo gallery routes

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/children', childrenRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/sponsorships', sponsorshipsRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/proxies', proxiesRoutes);
app.use('/api/child-photos', childPhotosRoutes); // Photo gallery routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

export default app;