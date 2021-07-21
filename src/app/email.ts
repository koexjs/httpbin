import { Context } from '@koex/core';
import mail, { createClientByProvider } from '@zodash/mail';

export default async function email(ctx: Context) {
  ctx.logger.log('send email:', JSON.stringify(ctx.request.body, null, 2));

  const { client, content } = ctx.request.body;

  const _client = client.provider
    ? createClientByProvider(client.provider, {
        user: client.username,
        pass: client.password,
      })
    : mail.createClient({
        host: client.host,
        port: client.port,
        auth: {
          user: client.username,
          pass: client.password,
        },
        secure: client.secure,
      });

  try {
    await _client.send({
      to: content.to,
      subject: content.subject,
      content: content.content,
    });

    await ctx.json({
      message: '发送成功',
      body: ctx.request.body,
    });
  } catch (error) {
    ctx.status = 400;

    await ctx.json({
      message: `发送失败：${error.message}`,
      body: ctx.request.body,
    });
  }
}
