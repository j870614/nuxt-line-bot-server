// server/api/line.ts
import { defineEventHandler, readBody } from 'h3';
import { Client, validateSignature } from '@line/bot-sdk';

const config = useRuntimeConfig();

const client = new Client({
  channelAccessToken: config.LINE_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
});

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = await readBody(event);
  const signature = event.node.req.headers['x-line-signature'] || '';

  if (!validateSignature(JSON.stringify(body), config.LINE_CHANNEL_SECRET, signature)) {
    return { statusCode: 403, body: 'Invalid signature' };
  }

  for (const e of body.events || []) {
    if (e.type === 'message' && e.message.type === 'text') {
      const msg = e.message.text;

      await client.replyMessage(e.replyToken, {
        type: 'text',
        text: `你說的是：「${msg}」`,
      });
    }
  }

  return { status: 'ok' };
});

