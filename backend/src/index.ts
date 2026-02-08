import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports that might use them
dotenv.config();

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { prisma } from './lib/db';
import passport from './config/passport';
import { migrate } from './migrations';

// Import route modules
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import sponsorsRoutes from './routes/sponsors';
import sponsorshipsRoutes from './routes/sponsorships';
import schoolsRoutes from './routes/schools';
import proxiesRoutes from './routes/proxies';
import childPhotosRoutes from './routes/child-photos';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes - MUST come before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/sponsors', sponsorsRoutes);
app.use('/api/sponsorships', sponsorshipsRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/proxies', proxiesRoutes);
app.use('/api/child-photos', childPhotosRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Production static file serving - AFTER API routes
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  
  console.log('🚀 Running in production mode');
  console.log('📁 Serving static files from:', frontendBuildPath);
  console.log('🌍 CORS origin:', process.env.CORS_ORIGIN);
  
  // Serve static files with proper headers
  app.use(express.static(frontendBuildPath, {
    maxAge: '1y',
    etag: false
  }));
  
  // Catch all handler for non-API routes: send back React's index.html file
  app.get('*', (req, res) => {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      console.log('📄 Serving index.html for route:', req.path);
      res.sendFile(indexPath);
    } else {
      console.error('❌ index.html not found at:', indexPath);
      res.status(404).json({ 
        error: 'Frontend build files not found',
        message: 'Please ensure the frontend is built and deployed correctly',
        path: indexPath
      });
    }
  });
} else {
  console.log('🔧 Running in development mode');
}

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server with migrations
async function startServer() {
  try {
    // Run database migrations before starting
    console.log('📦 Checking database migrations...');
    await migrate();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ Production mode: serving static files and API');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit();
});

export default app;