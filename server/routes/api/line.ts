export const runtime = 'nodejs';

import { defineEventHandler, readBody } from 'h3';
import { Client, validateSignature } from '@line/bot-sdk';

const config = useRuntimeConfig();

const client = new Client({
  channelAccessToken: config.LINE_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
});
console.log('✅ webhook API 被觸發');
export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  if (method !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = await readBody(event);
  console.log('📦 接收到 LINE webhook：', JSON.stringify(body, null, 2));
  console.log(event);

  const signature = event.node.req.headers['x-line-signature'] || '';
  const valid = validateSignature(JSON.stringify(body), config.LINE_CHANNEL_SECRET, signature);

  if (!valid) {
    console.error('❌ Signature 驗證失敗');
    return { statusCode: 403, body: 'Invalid signature' };
  }

  for (const e of body.events || []) {
    if (e.type === 'message' && e.message.type === 'text') {
      const msg = e.message.text;

      try {
        await client.replyMessage(e.replyToken, {
          type: 'text',
          text: `你說的是：「${msg}」`,
        });
        console.log('✅ 已成功回覆 LINE');
      } catch (err) {
        console.error('❌ 回覆失敗', err);
      }
    } else {
      // 非文字訊息回應
      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: `抱歉，目前只支援文字訊息(請不要包含表情符號或貼圖) 🙇‍♂️`,
      });
    }
  }

  return { status: 'ok' };
});
