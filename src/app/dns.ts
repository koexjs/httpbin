import { Context } from '@koex/core';
import { lookup } from '@znode/dns';

export default async function dns(ctx: Context) {
  const hostname = ctx.query.hostname as any as string;
  if (!hostname) {
    throw new Error(`hostname is required`);
  }

  const ips = await lookup(hostname);
  await ctx.json({
    hostname,
    ips,
  });
}
