import { Context } from '@koex/core';
import { delay } from '@zodash/delay';

export default async function _delay(ctx: Context) {
  const ms = +ctx.params.delay || 0;

  await delay(ms);

  await ctx.json({
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.files,
    headers: ctx.headers,
    origin: ctx.origin,
  });
}
