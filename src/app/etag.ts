import { Context } from '@koex/core';

export default async function etag(ctx: Context) {
  const etag = ctx.params.etag;
  const IfNoneMatch = ctx.get('If-None-Match');
  const IfMatch = ctx.get('If-Match');

  if (IfNoneMatch) {
    if (etag === IfNoneMatch) {
      ctx.status = 304;
      ctx.set('Etag', etag);
      return await ctx.json({
        status: 304,
        etag,
      });
    }
  } else if (IfMatch) {
    if (etag != IfMatch) {
      ctx.status = 412;
      return;
    }
  }

  ctx.set('ETag', etag);
  await ctx.json({
    status: 200,
    etag,
  });
}
