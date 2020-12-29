import { Context } from '@koex/core';
import * as base64 from '@zodash/crypto/lib/base64';

export async function raw(ctx: Context) {
  await ctx.json({
    cookie: ctx.get('cookie'),
  });
}

export async function get(ctx: Context) {
  await ctx.json({
    getCookie: {
      name: ctx.params.name,
      value: ctx.cookies.get(ctx.params.name),
    },
  });
}

export async function set(ctx: Context) {
  ctx.cookies.set(ctx.params.name, ctx.params.value);

  await ctx.json({
    setCookie: ctx.params,
  });
}

export async function del(ctx: Context) {
  ctx.cookies.set(ctx.params.name, null);

  await ctx.json({
    setCookie: ctx.params,
  });
}

export default {
  raw,
  get,
  set,
  del,
};