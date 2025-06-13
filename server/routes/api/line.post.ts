// server/routes/api/line.post.ts
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async event => {
  console.log('🐛 [LINE] handler triggered, method=', event.node.req.method);
  const body = await readBody(event);
  console.log('body:', body);
  return { ok: true };
});
