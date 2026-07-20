import http from 'node:http';
import { config } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './app.js';
import { registerSocketHandlers } from './sockets/index.js';

const app = createApp();
const server = http.createServer(app);

registerSocketHandlers(server);

await connectDatabase();

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

