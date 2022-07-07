import { Server } from 'http';
import * as url from 'url';
import * as WebSocket from 'ws';
import { token as generateToken } from '@zodash/random';
import Cache from '@zodash/cache';
import { getLogger } from '@zodash/logger';

const cache = new Cache<string, WebSocket>();
const logger = getLogger('ws');

export interface Socket extends WebSocket {
  id: string;
  renew: Function;
  heartbeat: Function;
  isPing: Function;
  gc: Function;
  disconnect: Function;
}

export default (path: string, server: Server) => {
  const app = new WebSocket.Server({ noServer: true });

  app.on('connection', function connection(socket: Socket) {
    function send(data: any) {
      socket.renew();

      socket.send(JSON.stringify(data));
    }

    socket.on('message', function incomming(message) {
      // heart beat
      if (socket.isPing(message.slice(0, 4))) {
        return socket.heartbeat();
      }

      const { target, payload } = safeJSON(String(message));
      if (!target) {
        return send({
          type: 'notice',
          source: 'system',
          payload: 'invalid format',
        });
      }

      const targetSocket = cache.get(target);
      if (!targetSocket) {
        return send({
          type: 'notice',
          source: 'system',
          payload: 'unavailable',
        });
      }

      send({
        type: 'notice',
        source: 'system',
        payload: 'ok',
      });

      targetSocket.send(
        JSON.stringify({
          type: 'message',
          source: socket.id,
          payload,
        }),
      );
    });

    socket.on('close', onDisconnect);

    function onDisconnect() {
      socket.disconnect();
    }

    function onConnect() {
      const id = generateToken();
      cache.set(id, socket);

      let it = null;

      socket.id = id;
      socket.renew = renew;
      socket.gc = gc;
      socket.pong = pong;
      socket.isPing = isPing;
      socket.heartbeat = pong;
      socket.disconnect = disconnect;

      function gc() {
        log(socket, `gc`);
        socket.close();

        cache.set(id, null);
        clearTimeout(it);
        it = null;
      }

      function disconnect() {
        log(socket, `disconnected`);

        // socket.close();

        // cache.set(id, null);
        // clearTimeout(it);
        // it = null;
        gc();
      }

      function renew() {
        if (it) {
          clearTimeout(it);
        }

        it = setTimeout(gc, 30 * 60 * 1000);
      }

      function pong() {
        renew();

        socket.send('pong');
      }

      function isPing(message: string) {
        return message === 'ping';
      }

      log(socket, 'connected');

      return send({
        type: 'identity',
        source: 'system',
        payload: id,
      });
    }

    onConnect();
  });

  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    if (path !== pathname) {
      // console.log('destroy on upgrade:', pathname);
      // return socket.destroy();
      return;
    }

    (app.handleUpgrade as any)(request, socket, head, (socket) => {
      app.emit('connection', socket, request);
    });
  });
};

function safeJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function log(socket: Socket, message: string) {
  logger.info(`[socket: ${socket.id}] ${message}`);
}
