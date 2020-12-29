import { Context } from '@koex/core';
import { uuid } from '@zodash/uuid';

export default async function health(ctx: Context) {
  await ctx.json({
    uuid: uuid(),
  });
}