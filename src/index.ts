import * as fs from 'fs';
import * as path from 'path';

import App from '@koex/core';
import body from '@koex/body';
import cors from '@koex/cors';
import statics from '@koex/static';

import { format } from '@zodash/format';

import health from './app/health';
import * as request from './app/request';
import cookies from './app/cookies';
import cache from './app/cache';
import etag from './app/etag';
import * as auth from './app/auth';
import ip from './app/ip';

import delay from './app/delay';
import uuid from './app/uuid';
import base64 from './app/base64';
import md5 from './app/md5';
import aes from './app/aes';

import image from './app/image';
import pdf from './app/pdf';

import upload from './app/upload';

import jsonp from './app/jsonp';
import proxy from './app/proxy';
import shorturl from './app/shorturl';
import pdfViewer from './app/pdf-viewer';

import email from './app/email';
import captcha from './app/captcha';

import ws from './app/ws';
import socketio from './app/socket.io';

import $2fa from './app/2fa';

// declare module '@koex/core' {
//   interface Request {
//       body: any;
//       rawBody: string;
//       // files: any[];
//   }
// }

declare module '@koex/core' {
  // export interface Logger {
  //   debug(...args: any): void;
  // }

  export interface Context {
    json(data: object | any[]): Promise<void>;
    resource(filepath: string, contentType: string): Promise<void>;
    render<T>(viewpath: string, context?: T): Promise<void>;
    // logger: Logger;
  }
}

const app = new App();

app.use(async (ctx, next) => {
  await next();

  console.log('xxx:', ctx.response.header);
});

const env = {
  value: process.env.NODE_ENV,
  prod: process.env.NODE_ENV === 'production',
}

app.proxy = env.prod && true;

const time = {
  _start: 0,
  start() {
    this._start = +new Date();
  },
  end() {
    return +new Date() - this._start;
  },
};
const stat = (filepath: string): Promise<fs.Stats> => new Promise((resolve, reject) => {
  fs.stat(filepath, (err, stats) => {
    if (err) return reject(err);
    return resolve(stats);
  });
});

app.use(statics('/static', {
  dir: path.join(__dirname, '../static'),
}))

app.use(cors());

app.use(async function error(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;

    ctx.json({
      code: err.code || err.status || 500,
      message: err.message, // !env.prod ? err.message : 'Internal Server Error',
    });
  }
});

app.use(async function json(ctx, next) {
  ctx.json = async (data: any) => {
    ctx.body = data;
  }

  await next();
});

app.use(async function render(ctx, next) {
  ctx.render = async <T>(viewpath: string, context?: T) => {
    return new Promise<void>((resolve, reject) => {
      const absoluteFilePath = path.join(process.cwd(), viewpath);
      fs.readFile(absoluteFilePath, (err, text) => {
        if (err) {
          reject(err);
        }
        ctx.body = format(text.toString(), context);
        resolve();
      });
    });
  }

  await next();
});

app.use(async function resource(ctx, next) {
  ctx.resource = async (filepath: string, contentType: string) => {
    const absoluteFilePath = path.join(process.cwd(), filepath);

    // secure
    ctx.set('X-Content-Type-Options', 'nosniff');

    // fs.stat
    const stats = await stat(absoluteFilePath);
    ctx.set('Last-Modified', `${stats.mtime}`);
    ctx.set('Content-Length', `${stats.size}`);

    // only download
    // ctx.set('Content-Disposition', `attachment; filename=${filename}`);

    // basic
    ctx.set('Content-Type', contentType);
    ctx.body = fs.createReadStream(absoluteFilePath);
  }

  await next();
});

// app.use(async function logger(ctx, next) {
//   ctx.logger = {
//     debug(...args: any) {
//       console.log(...args);
//     },
//   }

//   await next();
// });

app.use(body({
  enableTypes: ['json', 'form', 'multipart'],
  formidable: {
    // maxFileSize: 100 * 1024 * 1024, // 100M
    maxFileSize: 500 * 1024 * 1024, // 500M
    hash: 'md5',
    // uploadDir: path.join(__dirname, 'temp'),
  },
}));

app.use(async (ctx, next) => {
  time.start();
  ctx.logger.info(`=> ${ctx.method} ${ctx.originalUrl}`);
  await next();
  ctx.logger.info(`<= ${ctx.method} ${ctx.originalUrl} ${ctx.status} ${time.end()}ms`);
});

app.get('/health', health);

app.get('/', async (ctx) => {
  ctx.body = 'hello, world';
});

/**
 * Returns the requester's IP address.
 */
app.get('/ip', ip);

/**
 * Return a UUID4
 */
app.get('/uuid', uuid);

/**
 * Return the incoming request's HTTP Headers.
 */
app.get('/headers', request.headers);

/**
 * Return the incoming requests's User-Agent Header
 */
app.get('/user-agent', request.userAgent);

/**
 * The request's GET parameters
 */
app.get('/get', request.get);

/**
 * The requests's POST parameters
 */
app.post('/post', request.post);

/**
 * The requests's PUT parameters
 */
app.put('/put', request.put);

/**
 * The requests's PATCH parameters
 */
app.patch('/patch', request.patch);

/**
 * The requests's DELETE parameters
 */
app.del('/delete', request.del);

app.get('/cookie', cookies.raw);

app.get('/cookie/set/:name/:value', cookies.set);

app.get('/cookie/get/:name', cookies.get);

app.get('/cookie/delete/:name', cookies.del);

/**
 * Prompt the user for authorization using HTTP Basic Auth
 */
app.get('/basic-auth/:username/:password', auth.basic);

/**
 * Prompts the user for authorization using bearer authentication
 */
app.get('/bearer', auth.bearer);

/**
 * Returns a delayed response (max of 10 seconds).
 */
app.get('/delay/:delay', delay);

/**
 * Base64 encode
 */
app.get('/base64/encode/:value', base64.encode);

/**
 * Base64 decode
 */
app.get('/base64/decode/:value', base64.decode);

/**
 * MD5
 */
app.get('/md5/:value', md5);

/**
 * AES encrypt
 */
app.get('/aes/encrypt/:algorithm/:iv/:key/:value', aes.encrypt);

/**
 * AES decrypt
 */
app.get('/aes/decrypt/:algorithm/:iv/:key/:value', aes.decrypt);

/**
 * Return a 304 if an If-Modified-Since header or If-None-Match is present. Returns the same as a GET otherwise.
 */
app.get('/cache', cache);

/**
 * Assumes the resource has the given etag and responds to If-None-Match and If-Match headers appropriately.
 */
app.get('/etag/:etag', etag);

app.get('/cache/:value', async (ctx) => {
  const value = +ctx.params.value || 0;
  ctx.set('Cache-Control', `public, max-age=${value}`);
  await ctx.json({
    cacheControl: `public, max-age=${value}`,
  });
});

/**
 * Returns a simple image of the type suggest by the Accept header.
 */
app.get('/image', image.auto);

/**
 * Returns a simple image of the type suggest by the Accept header.
 * 
 * using post
 */
app.post('/image', image.auto);

/**
 * Returns a simple WEBP image.
 */
app.get('/image/webp', image.webp);

/**
 * Returns a simple SVG image.
 */
app.get('/image/svg', image.svg);

/**
 * Returns a simple JPEG image.
 */
app.get('/image/jpeg', image.jpeg);

/**
 * Returns a simple PNG image.
 */
app.get('/image/png', image.png);

app.get('/pdf', pdf);

app.post('/pdf', pdf);

app.get('/upload', upload.get);

app.post('/upload', upload.post);

// jsonp
app.get('/jsonp', jsonp);

app.post('/shorturl', shorturl);

// @TODO
app.all('/proxy', proxy);

app.get('/pdf-viewer', pdfViewer);

app.post('/email', email);

app.get('/captcha/:token', captcha.view);
app.post('/captcha/generate', captcha.generate);
app.post('/captcha/validate', captcha.validate);

app.get('/2fa', $2fa.generate);
app.post('/2fa', $2fa.verify);

const port = +process.env.PORT || 8080;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`server start at http://127.0.0.1:${port}.`);
});


ws('/ws', server);
socketio('/socket.io', server);
