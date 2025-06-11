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

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes - MUST come before static file serving
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

// Production static file serving - AFTER API routes
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build directory
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  
  console.log('Serving static files from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
  
  // Catch all handler for non-API routes: send back React's index.html file
  app.get('*', (req, res) => {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    console.log('Serving index.html from:', indexPath);
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).send('Frontend build files not found. Please run "npm run build" first.');
    }
  });
}

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode with static file serving');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

export default app;