import { Context } from '@koex/core';

export async function get(ctx: Context) {
  const data = {
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    headers: ctx.headers,
    origin: ctx.origin,
  };

  console.log('[request.get] data:', data);

  await ctx.json(data);
}

export async function post(ctx: Context) {
  const data = {
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.files,
    headers: ctx.headers,
    origin: ctx.origin,
  }
  console.log('[request.post] data:', data);
  await ctx.json(data);
}

export async function put(ctx: Context) {
  const data = {
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.files,
    headers: ctx.headers,
    origin: ctx.origin,
  };
  console.log('[request.put] data:', data);
  await ctx.json(data);
}

export async function patch(ctx: Context) {
  const data = {
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.files,
    headers: ctx.headers,
    origin: ctx.origin,
  };
  console.log('[request.patch] data:', data);
  await ctx.json(data);
}

export async function del(ctx: Context) {
  const data = {
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.files,
    headers: ctx.headers,
    origin: ctx.origin,
  };
  console.log('[request.del] data:', data);
  await ctx.json(data);
}

export async function headers(ctx: Context) {
  const data = {
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.files,
    headers: ctx.headers,
    origin: ctx.origin,
  };
  
  console.log('[request.headers] data:', data);

  await ctx.json({
    headers: ctx.headers,
    httpVersion: ctx.req.httpVersion,
  });
}

export async function userAgent(ctx: Context) {
  await ctx.json({
    'user-agent': ctx.get('user-agent'),
  });
}
