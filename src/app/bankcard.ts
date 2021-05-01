import { Context } from '@koex/core';
import * as bankcard from '@zodash/bankcard';

// test: cardNo=6222005865412565805
export async function validate(ctx: Context) {
  const { cardNo } = ctx.query;

  if (!cardNo) {
    return await ctx.json({
      code: 4008000,
      message: 'cardNo is required',
    });
  }

  await ctx.json({
    cardNo,
    bank: await bankcard.parse(cardNo),
  });
}

export default {
  validate,
};