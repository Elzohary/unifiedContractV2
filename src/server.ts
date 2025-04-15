const express = require('express');
import { Request, Response, NextFunction } from 'express';
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env['PORT'] || 3000;

// Enable CORS
app.use(cors());

// Enable request logging
app.use(morgan('dev'));

// Enable gzip compression
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist/unified-contract-management-app/browser'), {
  setHeaders: (res: Response, filePath: string) => {
    // Set caching headers for static files
    if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// API routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Handle all other routes by serving the index.html file
app.use('/**', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, 'dist/unified-contract-management-app/browser/index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
