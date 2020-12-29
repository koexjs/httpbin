import { Context } from '@koex/core';
import shorturl from '@zodash/shorturl';

export default async function _shorturl(ctx: Context) {
  const { url } = ctx.request.body;

  ctx.body = {
    url,
    shorturl: shorturl(url),
  };
}