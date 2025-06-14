export const runtime = 'nodejs';
import { defineEventHandler, readBody } from 'h3';
import { Client } from '@line/bot-sdk';

const config = useRuntimeConfig();
const client = new Client({
  channelAccessToken: config.LINE_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
});

export default defineEventHandler(async (event) => {
  console.log('✅ LINE webhook 被觸發');

  if (event.node.req.method !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = await readBody(event);
  for (const e of body.events || []) {
    if (e.type === 'message' && e.message.type === 'text') {
      const userMsg = e.message.text.trim();
      console.log('✉️ 收到訊息:', JSON.stringify(userMsg));

      if (userMsg == '查看今日太陽時間') {
        // Step 1：立即回覆「查詢中」
        await client.replyMessage(e.replyToken, {
          type: 'text',
          text: '查詢中，資料取得後會主動推送 ☀️',
        });
        console.log('⏳ 已回覆查詢中訊息');

        // Step 2：呼叫中央氣象局 API
        try {
          const sun = await event.$fetch('/api/sun?location=宜蘭縣');
          console.log('🌞 API 資料:', JSON.stringify(sun));

          const replyText = `📍 今日 ${sun.location} 太陽時間：
🌅 明相出：${sun['明相出']}
🔆 過中天：${sun['過中天']}
🌇 最後一道光：${sun['最後一道光']}`;

          // Step 3：用 pushMessage 主動推送結果
          await client.pushMessage(e.source.userId, {
            type: 'text',
            text: replyText,
          });
          console.log('✅ 成功 push 太陽時間');
        } catch (err) {
          console.error('❌ API 取得失敗，改用 push 傳錯誤結果', err);
          await client.pushMessage(e.source.userId, {
            type: 'text',
            text: '查詢失敗，請稍後再試 ☀️',
          });
        }
        return { ok: true };
      }

      // 非關鍵字 → 回覆原訊息
      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: `你說的是：「${userMsg}」`,
      });
    }
  }

  return { ok: true };
});
