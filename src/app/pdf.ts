import { Context } from '@koex/core';

export default async function pdf(ctx: Context) {
  await ctx.resource('./static/pdfs/img.jpeg.pdf', 'application/pdf');
}
