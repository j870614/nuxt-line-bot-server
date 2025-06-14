// server/api/list.ts
import { readdirSync } from 'fs';
import { join } from 'path';
export default defineEventHandler(() => {
  const base = join(process.cwd(), 'server/api');
  const files = readdirSync(base);
  console.log('📁 API files:', files);
  return { files };
});
