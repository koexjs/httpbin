import { Context } from '@koex/core';

export default async function health(ctx: Context) {
  ctx.status = 200;
}
