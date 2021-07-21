import { Context } from '@koex/core';

export async function get(ctx: Context) {
  await ctx.render('./view/upload.html', {
    title: 'Upload',
  });
}

export async function post(ctx: Context) {
  console.log(ctx.request.files);
  await ctx.json({
    method: ctx.method,
    url: ctx.url,
    query: ctx.query,
    params: ctx.params,
    body: ctx.request.body,
    files: ctx.request.files,
    headers: ctx.headers,
    origin: ctx.origin,
  });
}

export default {
  get,
  post,
};
