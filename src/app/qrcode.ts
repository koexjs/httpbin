import { Context } from '@koex/core';
import qrcode, { types } from '@zodash/qrcode';
import { getLogger } from '@zodash/logger';

export interface INotifyData {
  type?: 'wechat-article-share' | 'wifi-card';

  text?: string;
  width?: string;

  // type: wechat-article-share
  url?: string;
  title?: string;

  // type: wifi-card
  encryptionMode: string;
  ssid: string;
  password: string;
}

const logger = getLogger('nobot');

export default async function qrcodeApp(ctx: Context) {
  const { type } = ctx.query as any as INotifyData;

  if (type === 'wechat-article-share') {
    const { url, title } = ctx.query as any as INotifyData;

    if (!url || !title) {
      ctx.throw(400, {
        code: 4007000,
        message: 'query url and title are required',
      });
    }

    try {
      ctx.type = 'image/svg+xml'
      ctx.body = await types.wechatArticleShare({ url, title });
    } catch (error) {
      logger.error(error);
  
      ctx.throw(500, {
        code: 5006001,
        message: error.message ?? 'nobot internal server error',
      });
    }

    return ;
  }

  if (type === 'wifi-card') {
    const { encryptionMode, ssid, password } = ctx.query as any as INotifyData;

    if (!encryptionMode || !ssid || !password) {
      ctx.throw(400, {
        code: 4007000,
        message: 'query encryptionMode, ssid, and password are required',
      });
    }
    
    try {
      const img = await types.wifiCard({ encryptionMode: encryptionMode as any, ssid, password });
      ctx.body = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"/>
            <title>扫描二维码连接 WiFi</title>
            <style>
              .card {
                position: relative;
                display: flex;
                flex-flow: column nowrap;
                justify-content: center;
                align-items: center;
              }

              .qrcode {
                width: 60%;
              }

              .tip {
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>连接 WiFi</h1>
              <img class="qrcode" src=${img} />
              <div class="tip">
                <div>打开系统相机扫描二维码</div>
                <div>即可自动连接 WiFi</div>
              </div>
            </div>
          </body>
        </html>
      `;
    } catch (error) {
      logger.error(error);
  
      ctx.throw(500, {
        code: 5006002,
        message: error.message ?? 'nobot internal server error',
      });
    }

    return ;
  }
  
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
