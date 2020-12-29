import { Context } from '@koex/core';
import * as base64 from '@zodash/crypto/lib/base64';

export async function encode(ctx: Context) {
  const value = ctx.params.value;

  await ctx.json({
    [value]: base64.encode(value),
  });
}

export async function decode(ctx: Context) {
  const value = ctx.params.value;

  await ctx.json({
    [value]: base64.decode(value),
  });
}

export default {
  encode,
  decode,
};