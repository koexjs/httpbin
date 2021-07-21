import { Context } from '@koex/core';
import * as base64 from '@zodash/crypto/lib/base64';
import { uuid } from '@zodash/uuid';

export default async function cache(ctx: Context) {
  const isConditional =
    ctx.get('If-Modified-Since') || ctx.get('If-None-Match');

  if (!isConditional) {
    const lastModified = new Date().toUTCString();
    const etag = base64.encode(uuid()); // @TODO
    ctx.set('Last-Modified', lastModified);
    ctx.set('ETag', etag);
    return await ctx.json({
      lastModified,
      etag,
    });
  }

  ctx.status = 304;
}
