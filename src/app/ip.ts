import { Context } from '@koex/core';

export async function plainIP(ctx: Context) {
  ctx.body = ctx.ip;
}

export default async function ip(ctx: Context) {
  await ctx.json({
    ip: ctx.ip,
    ips: ctx.ips,
  });
}