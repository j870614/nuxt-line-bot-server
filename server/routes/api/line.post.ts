// server/routes/api/line.post.ts
import { defineEventHandler, readBody } from 'h3';
import { Client } from '@line/bot-sdk';

export const runtime = 'nodejs';
const config = useRuntimeConfig();
const client = new Client({
  channelAccessToken: config.LINE_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
});

export default defineEventHandler(async (event) => {
  console.log('✅ LINE webhook 被觸發');

  if (event.node.req.method !== 'POST') {
    console.warn('❌ 非 POST 請求');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: any;
  try {
    body = await readBody(event);
    console.log('📦 接收到的資料：', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('❌ 無法解析 body', err);
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  for (const e of body.events || []) {
    if (e.type === 'message' && e.message.type === 'text') {
      const userMsg = e.message.text.trim();
      console.log('🎯 userMsg:', JSON.stringify(userMsg), '| includes:', userMsg.includes('查看今日太陽時間'));
      console.log('✉️ 收到文字訊息:', JSON.stringify(userMsg));
      console.log('🔍 includes 判斷:', userMsg.includes('查看今日太陽時間'));

      // ✅ 使用 includes 判斷觸發太陽時間查詢
      if (userMsg.includes('查看今日太陽時間')) {
        console.log('🚀 觸發「查看今日太陽時間」流程');
        try {
          const sun = await event.$fetch('/api/sun?location=宜蘭縣');
          if (sun.error) throw new Error(sun.error);

          const replyText = `📍 今日 ${sun.location} 太陽時間：
🌅 明相出：${sun['明相出']}
🔆 過中天：${sun['過中天']}
🌇 最後一道光：${sun['最後一道光']}`;

          await client.replyMessage(e.replyToken, { type: 'text', text: replyText });
          console.log('✅ 回覆太陽時間成功');
        } catch (err) {
          console.error('❌ 查詢太陽時間失敗', err);
          await client.replyMessage(e.replyToken, {
            type: 'text',
            text: '查詢太陽時間失敗，請稍後再試 ☀️',
          });
        }
        return { ok: true }; // 回覆成功後結束 handler
      }

      // 📝 非太陽時間指令 → 預設回覆
      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: `你說的是：「${userMsg}」`,
      });
      console.log('✅ 成功回覆使用者');
    } else {
      console.warn('⚠️ 收到非文字訊息，類型為：', e.message?.type || e.type || '未知');
      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: `目前僅支援文字訊息（請不要傳貼圖、圖片或表情符號）🙇‍♂️`,
      });
    }
  }

  return { ok: true };
});
