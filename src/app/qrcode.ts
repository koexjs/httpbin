import { Context } from '@koex/core';
import qrcode from '@zodash/qrcode';
import { getLogger } from '@zodash/logger';

export interface INotifyData {
  text: string;
  width?: string;
}

const logger = getLogger('nobot');

export default async function qrcodeApp(ctx: Context) {
  const { text, width } = ctx.query as any as INotifyData;
  if (!text) {
    ctx.throw(400, {
      code: 4007000,
      message: 'query text is required',
    });
  }

  try {
    const dataURL = await qrcode(text);

    ctx.body = `<img style="width: ${
      width ?? 'auto'
    }; height: auto;" src=${dataURL} />`;
  } catch (error) {
    logger.error(error);

    ctx.throw(500, {
      code: 5006000,
      message: error.message ?? 'nobot internal server error',
    });
  }
}
