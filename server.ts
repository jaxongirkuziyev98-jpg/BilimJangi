import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { attachGameServer } from './src/server/gameServer';

dotenv.config();

async function bootstrap(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'BilimJang' });
  });

  attachGameServer(io);

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`BilimJang server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start BilimJang server:', err);
  process.exit(1);
});
