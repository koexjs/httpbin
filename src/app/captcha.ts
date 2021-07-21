import { Context } from '@koex/core';
import { create as createCaptcha } from '@zodash/captcha';
import Cache from '@zodash/cache';
import { token as generateToken } from '@zodash/random';

const codeCache = new Cache<
  string,
  {
    code: string;
    type: string;
    data: string;
  }
>(2500);

export async function generate(ctx: Context) {
  const { type, code, data } = createCaptcha({ type: 'image' });
  const token = generateToken();

  codeCache.set(token, { type, code, data }, { maxAge: 60 * 1000 });

  ctx.type = type;
  ctx.set('token', token);

  ctx.json({
    token,
    type,
    // url: `/captcha/${token}`,
  });
}

export async function view(ctx: Context) {
  const { token } = ctx.params;

  ctx.set('Cache-Control', 'public, max-age=7200');

  if (!token) {
    ctx.logger.error('Token is required');
    ctx.status = 404;
    return;
  }

  const cached = codeCache.get(token);
  if (!cached) {
    ctx.logger.error('Token is invalid');
    ctx.status = 404;
    return;
  }

  const { type, data } = cached;
  ctx.type = type;
  ctx.body = data;
}

export async function validate(ctx: Context) {
  const { token, code } = ctx.request.body;

  if (!token || !code) {
    ctx.throw(400, {
      code: 4001001,
      message: 'Token and code is required',
    });
  }

  const _code = codeCache.get(token);
  if (_code === null) {
    ctx.throw(400, {
      code: 4001002,
      message: 'Token has been used before',
    });
  }

  codeCache.set(token, null);
  if (code !== _code) {
    ctx.throw(400, {
      code: 4001003,
      message: 'Invalid',
    });
  }

  ctx.status = 200;
  ctx.body = {
    code: 200,
    message: 'Valid',
  };
}

export const captcha = {
  view,
  generate,
  validate,
};

export default captcha;
