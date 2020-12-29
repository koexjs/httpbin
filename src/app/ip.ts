import { Context } from '@koex/core';

export default async function health(ctx: Context) {
  await ctx.json({
    ip: ctx.ip,
    ips: ctx.ips,
  });
}