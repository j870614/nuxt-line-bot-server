export const runtime = 'edge';

// server/api/line.ts
// @ts-expect-error 使用已棄用的 Client
import { defineEventHandler, readBody } from 'h3';
import { Client, middleware, validateSignature } from '@line/bot-sdk';

const config = useRuntimeConfig();

const client = new Client({
  channelAccessToken: config.LINE_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const signature = event.node.req.headers['x-line-signature'];

  // 驗證 LINE 傳來的請求是否合法
  if (!validateSignature(JSON.stringify(body), config.LINE_CHANNEL_SECRET, signature)) {
    return { statusCode: 403, body: 'Invalid signature' };
  }

  for (const e of body.events || []) {
    if (e.type === 'message' && e.message.type === 'text') {
      const msg = e.message.text;

      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: 
        `南無阿彌陀佛\n
        你說的是：「${msg}」`,
      });
    }
  }

  return { status: 'ok' };
});
