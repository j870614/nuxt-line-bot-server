// server/routes/api/line.post.ts
import { defineEventHandler, readBody } from 'h3';
import { Client, validateSignature } from '@line/bot-sdk';

const config = useRuntimeConfig();

const client = new Client({
  channelAccessToken: config.LINE_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
});

export default defineEventHandler(async (event) => {
  console.log('✅ LINE webhook 被觸發');

  const method = event.node.req.method;
  if (method !== 'POST') {
    console.warn('❌ 非 POST 請求');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = await readBody(event);
  console.log('📦 接收到的資料：', JSON.stringify(body));

  const signature = event.node.req.headers['x-line-signature'] || '';
  const isValid = validateSignature(JSON.stringify(body), config.LINE_CHANNEL_SECRET, signature);

  if (!isValid) {
    console.error('❌ 簽名驗證失敗');
    return { statusCode: 403, body: 'Invalid signature' };
  }

  for (const e of body.events || []) {
    if (e.type === 'message' && e.message.type === 'text') {
      const userMsg = e.message.text;
      try {
        await client.replyMessage(e.replyToken, {
          type: 'text',
          text: `你說的是：「${userMsg}」`,
        });
        console.log('✅ 成功回覆使用者');
      } catch (err) {
        console.error('❌ 回覆錯誤', err);
      }
    } else {
      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: `目前僅支援文字訊息（請不要傳貼圖、圖片或表情符號）🙇‍♂️`,
      });
    }
  }

  return { ok: true };
});
