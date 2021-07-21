import { Server } from 'http';
import doreamon from '@zodash/doreamon';
import * as WebSocket from '@zodash/websocket';

export interface Client extends WebSocket.Socket {
  code?: string;
  //
  isServer?: boolean;
  client?: WebSocket.Socket;
  //
  isClient?: boolean;
  server?: WebSocket.Socket;
}

export interface Options {
  port?: string;
  path?: string;
}

export function relay(options?: Options) {
  const logger = doreamon.logger.getLogger('relay');

  const path = options?.path || '/';

  const app = new WebSocket.Server({
    path,
  });

  //
  const serverSockets = new Map<string, Client>();
  const clientSockets = new Map<string, Client>();

  app.on('connection', (_client) => {
    const socket = _client as unknown as Client;

    logger.log('socket connect:', socket.id);

    socket.on('disconnect', () => {
      logger.log('socket disconnect:', socket.id);

      if (socket.isServer) {
        serverSockets.delete(socket.code);

        // make client disconnect
        if (socket.client) {
          socket.client.disconnect();
        }
      } else if (socket.isClient) {
        clientSockets.delete(socket.id);

        // release server.client
        if (socket.server) {
          (socket.server as Client).client = null;
        }
      }
    });

    // (server) online: code => server:wait
    socket.on('online', ({ code }) => {
      socket.isServer = true;
      socket.code = code;

      logger.log(`[server][online] code: ${code}`);

      serverSockets.set(code, socket);
    });

    // (client) connect: code => client:request
    socket.on('connect', ({ code }) => {
      socket.isClient = true;
      socket.code = code;

      logger.log(`[client][connect] ${socket.id}: ${code}`);

      if (!serverSockets.has(code)) {
        const message = `code(${code}) is invalid`;
        logger.error(`[client][connect][error]`, message);

        socket.emit('error', message);
        socket.disconnect();
        return;
      }

      // bind socket: server <-> client: bind one-2-one
      const serverSocket = serverSockets.get(code);
      const clientSocket = socket;
      // if already bind client, should emit error, because
      if (serverSocket.client) {
        const message = `code(${code}) is used by others, you cannot use it`;
        clientSocket.emit('error', message);
        clientSocket.disconnect();
        return;
      }
      clientSocket.server = serverSocket;
      serverSocket.client = clientSocket;

      clientSockets.set(socket.id, socket);

      clientSocket.emit('connected');
      serverSocket.emit('connected');
    });

    // communite following

    // [client] => server
    socket.on('input', ({ command }) => {
      const serverSocket = socket.server;

      serverSocket.emit('input', {
        id: socket.id,
        command,
      });
    });

    // [server] => client
    socket.on('output', ({ id, data }) => {
      if (!clientSockets.has(id)) {
        const error = new Error(`invalid client: ${id}`);
        return socket.emit('error', error.message);
      }

      const clientSocket = clientSockets.get(id);
      clientSocket.emit('output', {
        data,
      });
    });
  });

  return app;
}

export default (path: string, server: Server) => {
  const app = relay({
    path,
  });

  app.attach(server);
};
