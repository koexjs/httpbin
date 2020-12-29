import { Context } from '@koex/core';

export async function get(ctx: Context) {
  await ctx.json({
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    headers: ctx.headers,
    origin: ctx.origin,
  });
}

export async function post(ctx: Context) {
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

export async function put(ctx: Context) {
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

export async function patch(ctx: Context) {
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

export async function del(ctx: Context) {
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

export async function headers(ctx: Context) {
  await ctx.json({
    headers: ctx.headers,
  });
}

export async function userAgent(ctx: Context) {
  await ctx.json({
    'user-agent': ctx.get('user-agent'),
  });
}
