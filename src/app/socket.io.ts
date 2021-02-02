import { Server } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getLogger } from '@zodash/logger';

const logger = getLogger('ws');

export default (path: string, server: Server) => {
  const app = new SocketIOServer(server, {
    path,
    cors: {
      origin: (origin, cb) => cb(null, true),
    },
  });

  app.on('connection', (socket: Socket) => {
    socket.on('disconnect', onDisconnect);

    socket.on('message', function incomming({ target, payload }) {
      if (!target) {
        return socket.emit('message', {
          type: 'notice',
          source: 'system',
          payload: 'invalid format',
        });
      }
  
      socket.to(target).emit('message', {
        type: 'message',
        source: socket.id,
        payload,
      });
    });


    function onDisconnect() {
      log(socket, 'disconnected');
    }

    function onConnect() {
      log(socket, 'connected');
    }

    onConnect();
  });
};

function log(socket: Socket, message: string) {
  logger.info(`[socket.io: ${socket.id}] ${message}`);
}