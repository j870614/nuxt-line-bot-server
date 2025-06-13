export default defineEventHandler(() => {
  console.log('🚀 測試 /api/test API 被呼叫了！');
  return { hello: 'world' };
});
