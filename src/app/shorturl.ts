import { Context } from '@koex/core';
import shorturl from '@zodash/shorturl';
import { GitHub as GitHubObjectStorage } from '@znode/cloud-object-storage';

const storage = new GitHubObjectStorage({
  clientKey: process.env.GITHUB_DATASTORE_USER,
  clientSecret: process.env.GITHUB_DATASTORE_TOKEN,
  bucket: process.env.GITHUB_DATASTORE_REPO || '',
});

export async function createShortUrlWithStorage(ctx: Context) {
  const _base_path = ctx.request.path;
  const { prefix } = ctx.query; 
  const { url } = ctx.request.body;

  if (!process.env.GITHUB_DATASTORE_USER || !process.env.GITHUB_DATASTORE_TOKEN || !process.env.GITHUB_DATASTORE_REPO) {
    ctx.throw(500, {
      code: 5001002,
      message: 'GITHUB_DATASTORE_USER/GITHUB_DATASTORE_TOKEN/GITHUB_DATASTORE_REPO are required',
    });
  }

  if (!url) {
    ctx.throw(400, {
      code: 4001001,
      message: 'url is required',
    });
  }

  const id = shorturl(url);
  const filepath = `/shorturl/${id}`;

  const path = `${prefix || _base_path}/${id}`.replace(/\/{2,}/g, '/');
  const _shorturl = `${ctx.protocol}://${ctx.host}${path}`;

  console.log('xx:', _base_path, prefix, path, _shorturl);

  if (await storage.exists(filepath)) {
    ctx.body = {
      shorturl: _shorturl,
    };

    return;
  }

  try {
    await storage.create(filepath, url);
  } catch (error) {
    console.error('create short url error:', error)

    ctx.throw(500, {
      code: 5001001,
      message: 'Save shorturl error by storage',
    });
  }

  ctx.body = {
    shorturl: _shorturl,
  };
}

export async function getShortUrlWithStorage(ctx: Context) {
  const { id } = ctx.params;

  if (!id) {
    ctx.throw(400, {
      code: 4001002,
      message: 'id is required',
    });
  }

  const filepath = `/shorturl/${id}`;

  try {
    await storage.exists(filepath);
  } catch (error) {
    ctx.throw(404, {
      code: 4041002,
      message: 'short url not found',
    });
  }

  const stream = await storage.get(filepath);
  const url = await new Promise<string>(async (resolve) => {
    const chunks = [];
    stream.on('data', c => {
      chunks.push(c.toString());
    });
    stream.on('end', () => {
      return resolve(chunks.join(''));
    });
  });

  ctx.logger.info('read short link:', id, ' => ', url);

  ctx.redirect(url);
}

export async function renderPage(ctx: Context) {
  ctx.body = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>小z短链</title>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, maximum-scale=1.0 user-scalable=0" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-text-size-adjust: 100%;
            -webkit-box-direction: normal;
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
          }

          body {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
          }

          .block {
            margin-top: 10%;
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
          }

          .title {
            text-align: center;
            color: #303659;
            font-weight: 400;
            line-height: 56px;
            margin-bottom: 32px;
            font-size: 40px;
          }

          .search {
            font-size: 14px;
            font-weight: 400;
            color: #303659;
            -webkit-font-smoothing: antialiased;
            border: 1px solid #dce3f2;
            width: 790px;
            background-color: #fff;
            border-radius: 2px;
            padding: 16px 24px 16px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 20px 40px rgba(52,100,224,.1);
          }

          .search .search_input {
            font-size: 14px;
            font-weight: 400;
            color: #303659;
            background: none;
            outline: none;
            border: 0;
            width: 576px;
            // height: 100%;
            height: 48px;
          }

          .search .search_btn {
            overflow: visible;
            text-transform: none;
            -webkit-appearance: button;
            font-weight: 400;
            font-size: 16px;
            color: #fff;
            text-decoration: none;
            outline: none;
            cursor: pointer;
            width: 140px;
            height: 48px;
            border-radius: 2px;
            background-color: #3464e0;
            border: none;
          }

          .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 10px;
            min-width: 300px;
            text-align: center;
            font-size: 14px;
            border: 1px solid #cdcdcd;
            border-radius: 1px;
          }

          @media (max-width: 800px) {
            .block {
              padding-top: 40%;
            }
            .search {
              flex-flow: column nowrap;
              width: 100vw;
              border: none;
              box-shadow: none;
            }

            .search .search_input {
              width: 100%;
              width: 100%;
              font-size: 16px;
              line-height: 32px;
            }

            .search .search_btn {
              margin-top: 60px;
            }
          }
          
          .result {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, .38);
            font-size: 16px;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            display: none;
          }

          .result-inner {
            display: flex;
            flex-flow: row nowrap;
            width: 500px;
            margin-top: -20%;
            background: #fff;
            text-align: left;
          }

          .result-inner .title {
            color: #000;
            font-size: 16px;
            margin-bottom: unset;
            line-height: unset;
            text-align: left;
          }

          .result-inner .title span {

          }

          .result-inner .title .shorturl {

          }

          .result-inner .qrcode {
            width: 128px;
            height: 128px;
          }

          .result-inner .content {
            flex: 1;
            padding: 20px 20px 20px 0;
            display: flex;
            flex-flow: column;
            justify-content: space-between;
          }

          .result-inner .content .actions {
            display: flex;
            justify-content: space-between;
          }

          .result-inner .content .actions .action {
            font-weight: 400;
            font-size: 14px;
            color: #fff;
            cursor: pointer;
            width: 100px;
            height: 32px;
            border-radius: 2px;
            background-color: #3464e0;
            text-decoration: none;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 6px;
          }
        </style>
      </head>
      <body>
        <div class="block">
          <div class="title">小z短链</div>
          <div class="search">
            <input type="text" placeholder="请输入 http:// 或 https:// 开头的网址" class="search_input" />
            <button class="search_btn">生成链接</button>
          </div>
        </div>
        <div class="result">
          <div class="result-inner">
            <img class="qrcode" src="#" />
            <div class="content">
              <div class="title">
                <span>短链接：</span>
                <a class="shorturl" href="#" target="_blank">https://sourl.cn/DFfCxC</a>
              </div>
              <div class="actions">
                <a href="#" class="action action-visit" target="_blank">直接访问</a>
                <div class="action action-copy">复制链接</div>
                <div class="action action-close">关闭</div>
              </div>
            </div>
          </div>
        </div>
        <script>
          const $send = document.querySelector('.search_btn');
          const $close = document.querySelector('.action-close');
          const $copy = document.querySelector('.action-copy');

          $send.addEventListener('click', onGenerate);
          $close.addEventListener('click', onCloseResult);
          $copy.addEventListener('click', onCopyResult);

          async function createShortUrl(url) {
            const response = await fetch(location.pathname, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify({ url }),
            });
            const data = await response.json();
            if (!response.ok) {
              throw new Error('[' + data.code + '] ' + data.message);
            }

            return data.shorturl;
          }

          function notify(message, style) {
            const $el = document.createElement('div');
            $el.innerText = message;
            $el.className = 'notification';
            document.body.appendChild($el);

            if (!!style) {
              for (const key in style) {
                $el.style[key] = style[key];
              }
            }

            setTimeout(() => {
              document.body.removeChild($el);
            }, 1500);
          }

          function notifyError(message) {
            notify(message, { color: 'red' });
          }

          function showResult(shorturl) {
            const $result = document.querySelector('.result');
            const $qrcode = document.querySelector('.qrcode');
            const $shorturl = document.querySelector('.shorturl');
            const $visit = document.querySelector('.action-visit');

            $shorturl.href = shorturl;
            $shorturl.innerText = shorturl;
            $visit.href = shorturl;
            $qrcode.src = '/qrcode?text=' + encodeURIComponent(shorturl);

            $result.style.display = 'flex';
          }

          function onCloseResult() {
            const $result = document.querySelector('.result');
            $result.style.display = 'none';
          }

          function onCopyResult() {
            const $shorturl = document.querySelector('.shorturl');
            
            navigator.clipboard.writeText($shorturl.href);

            notify('复制链接成功', { color: '#3464e0' });
          }

          async function onGenerate() {
            const $input = document.querySelector('.search_input');
            const url = $input.value;
            if (!url) {
              return notifyError('请输入http://或https://开头的网址');
            }

            if (!/^http(s)?:\\/\\//.test(url)) {
              return notify('请输入http://或https://开头的网址');
            }

            notify('正在生成短链接 ...', { color: '#3464e0' })

            try {
              const shorturl = await createShortUrl(url);
              showResult(shorturl);
  
              $input.value = '';
            } catch (error) {
              notifyError(error.message);
            }
          }
        </script>
      </body>
    </html>
  `;
}

export async function algorithm(ctx: Context) {
  const { url } = ctx.request.body;

  ctx.body = {
    url,
    shorturl: shorturl(url),
  };
}
