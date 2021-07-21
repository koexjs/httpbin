import { Context } from '@koex/core';

export async function auto(ctx: Context) {
  if (ctx.accepts('image/webp')) {
    return await ctx.resource('./static/images/wolf_1.webp', 'image/webp');
  } else if (ctx.accepts('image/svg+xml')) {
    return await ctx.resource(
      './static/images/svg_logo.svg',
      'image/svg+xml',
    );
  } else if (ctx.accepts('image/jpeg')) {
    return await ctx.resource('./static/images/jackal.jpg', 'image/jpeg');
  } else if (ctx.accepts('image/png')) {
    return await ctx.resource('./static/images/pig_icon.png', 'image/png');
  } else {
    ctx.status = 406; // Unsupported media type
  }
}

export async function webp(ctx: Context) {
  await ctx.resource('./static/images/wolf_1.webp', 'image/webp');
}

export async function svg(ctx: Context) {
  await ctx.resource('./static/images/svg_logo.svg', 'image/svg+xml');
}

export async function jpeg(ctx: Context) {
  await ctx.resource('./static/images/jackal.jpg', 'image/jpeg');
}

export async function png(ctx: Context) {
  await ctx.resource('./static/images/pig_icon.png', 'image/png');
}

export default {
  auto,
  webp,
  svg,
  jpeg,
  png,
};
