import { Context } from '@koex/core';
import * as aes from '@zodash/crypto/lib/aes';

export async function encrypt(ctx: Context) {
  const {
    algorithm,
    iv,
    key,
    value,
  } = ctx.params;

  await ctx.json({
    algorithm,
    iv,
    key,
    value,
    encrypedValue: aes.encrypt(algorithm, key, iv, value),
  });
}

export async function decrypt(ctx: Context) {
  const {
    algorithm,
    iv,
    key,
    value,
  } = ctx.params;

  await ctx.json({
    algorithm,
    iv,
    key,
    value,
    decrypedValue: aes.decrypt(algorithm, key, iv, value),
  });
}

export default {
  encrypt,
  decrypt,
};