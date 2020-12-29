import { Context } from '@koex/core';

export default async function pdf(ctx: Context) {
  await ctx.render('./static/pdf/index.html', {
    url: ctx.query.url,
  })
}