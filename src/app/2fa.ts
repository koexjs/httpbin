import { Context } from '@koex/core';
import * as $2fa from '@zodash/2fa';

export async function generate(ctx: Context) {
  const { secret } = ctx.query;

  if ('verify' in ctx.query) {
    return verify(ctx);
  }

  await ctx.json({
    otp: await $2fa.generate(secret, { length: 6 }),
    ttl: await $2fa.getTTL(),
  });
}

export async function verify(ctx: Context) {
  const { secret, otp } = ctx.query;

  await ctx.json({
    secret,
    otp,
    isValid: await $2fa.verify(otp, secret, { length: 6 }),
  });
}

export default {
  generate,
  verify,
};