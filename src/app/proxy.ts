import * as url from 'url';
import { Context } from '@koex/core';
import { createProxy } from '@zoproxy/batch';

export default async function proxy(ctx: Context) {
  if (!ctx.query.url) {
    ctx.throw(400, {
      code: 4001090,
      message: 'url is required',
    });
  }

  const { contentType } = ctx.query;
  const _url = url.parse(ctx.query.url as any as string);

  const proxy = createProxy({
    table: {
      '(.*)': {
        target: `${_url.protocol}//${_url.host}`,
        pathRewrite: {
          '(.*)': _url.path,
        },
      },
    },
  });

  const { response } = await proxy({
    path: ctx.path,
    method: ctx.method,
    headers: ctx.headers as any,
    query: _url.query,
    body: JSON.stringify((ctx.request as any).body),
    files: (ctx.request as any).files,
  });

  ctx.logger.log(`proxy status:`, response.status);

  response.headers.delete('content-security-policy');
  response.headers.delete('strict-transport-security');
  // response.headers.delete('cache-control');

  // ctx.logger.log(`proxy status:`, JSON.stringify(response.headers.raw(), null, 2));

  ctx.set(response.headers.raw() as any);
  ctx.set('access-control-allow-origin', '*');
  ctx.set(
    'access-control-expose-headers',
    'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, Deprecation, Sunset',
  );
  // ctx.remove('transfer-encoding');

  if (contentType) {
    ctx.remove('content-disposition');
    ctx.type = contentType as any as string;
    // ctx.set('content-type', 'image/jpeg');
  }

  ctx.status = response.status;
  ctx.body = response.body;
}
