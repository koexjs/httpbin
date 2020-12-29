import { Context } from '@koex/core';
import { md5 } from '@zodash/crypto/lib/md5';

export default async function _md5(ctx: Context) {
  const value = ctx.params.value;

  await ctx.json({
    [value]: md5(value),
  });
}