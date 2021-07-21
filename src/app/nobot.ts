import { Context } from '@koex/core';
import nobot from '@zodash/nobot';
import { IProvider, IMessage } from '@zodash/nobot/lib/type';
import { getLogger } from '@zodash/logger';

export interface INotifyData {
  provider: IProvider;
  url: string;
  message: IMessage;
}

const logger = getLogger('nobot');

export default async function notify(ctx: Context) {
  const { provider, url, message } = ctx.body as any as INotifyData;
  if (!provider) {
    ctx.throw(400, {
      code: 4006000,
      message: 'nobot provider is required',
    });
  }

  if (!url) {
    ctx.throw(400, {
      code: 4006001,
      message: 'nobot webhook url is required',
    });
  }

  if (!message || !message?.title || !message.content) {
    ctx.throw(400, {
      code: 4006002,
      message: 'nobot message({title, content}) is required',
    });
  }

  try {
    await nobot(provider, url, message);

    await ctx.json({
      ok: true,
    });
  } catch (error) {
    logger.error(error);

    ctx.throw(500, {
      code: 5006000,
      message: error.message ?? 'nobot internal server error',
    });
  }
}
