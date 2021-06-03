import { Server } from 'http';
import * as url from 'url';
import Cache from '@zodash/cache';
import { getLogger } from '@zodash/logger';

import * as WebSocket from '../utils/ws';

const cache = new Cache<string, WebSocket>();
const logger = getLogger('ws');

export interface Client extends WebSocket.Socket {
  isSender?: boolean;
  code?: string;
  isReceiver?: boolean;
}

export default (path: string, server: Server) => {
  const app = new WebSocket.Server();
  const codeSenderMap = new Map<string, WebSocket.Socket>();
  const idReceiverMap = new Map<string, WebSocket.Socket>();
  
  app.on('connection', (_client) => {
    const client = _client as unknown as Client;

    logger.log('clint connect:', client.id);

    client.on('close', () => {
      if (client.isSender) {
        codeSenderMap.delete(client.code);
      } else if (client.isReceiver) {
        idReceiverMap.delete(client.id);
      }
    });

    client.on('wait.receiver.request', ({ code }) => {
      client.isSender = true;
      client.code = code;

      codeSenderMap.set(code, client);
    });

    // client.on('as.receiver', () => {
    //   idReceiverMap.set(client.id, client);
    // });

    client.on('request.sender.to.paste', ({ code }) => {
      client.isReceiver = true;
      const receiver = client.id;

      logger.log('[receiver] request.sender.to.paste', receiver, code);

      if (!codeSenderMap.has(code)) {
        // return client.emit('error', new Error('invalid code'));
        return client.emit('paste.failed', { message: `code(${code}) is invalid` });
      }

      idReceiverMap.set(client.id, client);

      const sender = codeSenderMap.get(code);
      // codeSenderMap.delete(code);

      // sender.emit('request.sender.to.paste', { receiver });
      sender.emit('paste', { receiver });
    });


    client.on('sender.paste.to.receiver', ({ receiver: receiverId, signature, payload }) => {
      logger.log('[sender] sender.paste.to.receiver', receiverId);

      if (!idReceiverMap.has(receiverId)) {
        // return ;
        return client.emit('error', new Error('invalid receiver'));
      }

      const receiver = idReceiverMap.get(receiverId);
      // idReceiverMap.delete(receiverId);

      // receiver.emit('sender.paste.to.receiver', { signature, payload });
      receiver.emit('paste', { signature, payload });
    });

    client.on('paste.done', ({ code }) => {
      const receiver = client.id;
      const sender = codeSenderMap.get(code);

      logger.log('[receiver] paste.done', receiver);

      sender.emit('paste.done', { receiver });
    });
  });

  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    if (path !== pathname) {
      // logger.log('destroy on upgrade:', pathname);
      // return socket.destroy();
      return ;
    }

    app.handleUpgrade(request, socket, head, (ws) => {
      app.emit('connection', ws, request);
    });
  });
};
