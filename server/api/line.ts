// server/api/line.ts
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = await readBody(event);
  return { received: body };
});
