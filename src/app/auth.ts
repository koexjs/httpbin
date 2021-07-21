import { Context } from '@koex/core';
import * as basicAuth from 'basic-auth';

export async function basic(ctx: Context) {
  const user = basicAuth(ctx.req);
  const { username, password } = ctx.params;

  if (!user || user.name !== username || user.pass !== password) {
    return ctx.throw(401, null, {
      headers: {
        'WWW-Authenticate': `Basic realm="Secure Area"`,
        user: user && user.name,
        pass: user && user.pass,
      },
    });
  }

  await ctx.json({
    'basic-auth': {
      headers: ctx.headers,
      authorization: ctx.get('authorization'),
      username: user.name,
      password: user.pass,
    },
  });
}

export async function bearer(ctx: Context) {
  const authorization = ctx.get('Authorization');
  if (!(authorization && authorization.startsWith('Bearer '))) {
    return ctx.throw(401, null, {
      headers: {
        'WWW-Authenticate': 'Bearer',
      },
    });
  }

  const token = /^Bearer\s(\w+)/.exec(authorization)[1];

  await ctx.json({
    authenticated: true,
    token,
  });
}
