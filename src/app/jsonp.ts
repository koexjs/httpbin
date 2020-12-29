import { Context } from '@koex/core';

export default async function _jsonp(ctx: Context) {
  const { callback } = ctx.query;

  const data = {
    code: 200,
    message: null,
    result: {
      name: 'jsonp method',
      callback,
      message: 'You have made a successful jsonp call.',
    },
  };

  ctx.body = `${callback}(${JSON.stringify(data)})`;
}