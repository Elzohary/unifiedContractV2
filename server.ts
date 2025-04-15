import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import bootstrap from './src/main.server';

// Express server
const app = express();
const PORT = process.env['PORT'] || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/unified-contract-management-app/browser');

// Serve static files from /browser
app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

// Compression and other middleware
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');

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

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Universal engine for server-side rendering
const commonEngine = new CommonEngine();

app.use('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  // Only render index.html requests
  if (!existsSync(join(DIST_FOLDER, 'index.html'))) {
    return next();
  }

  commonEngine
    .render({
      bootstrap,
      documentFilePath: join(DIST_FOLDER, 'index.html'),
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: DIST_FOLDER,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});

export default app; 