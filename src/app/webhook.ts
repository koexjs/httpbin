import { Context } from '@koex/core';

export default async function all(ctx: Context) {
  console.log('webhook request:', JSON.stringify({
    method: ctx.method,
    path: ctx.path,
    headers: ctx.headers,
    query: ctx.query,
    body: ctx.body,
  }, null, 2));

  await ctx.json({
    message: 'ok',
  });
}