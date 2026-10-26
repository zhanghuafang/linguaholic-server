// Linguaholic Workers 主入口
// Cloudflare Workers 标准模块导出
import { handleAuth } from './routes/auth.js';
import { handlePosts } from './routes/posts.js';
import { handleProgress } from './routes/progress.js';
import { json, text } from './auth.js';

export default {
  async fetch(request, env, ctx) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 注入 serverCtx：DB（KV）+ JWT_SECRET（ctx 是 Workers 保留参数名）
    const serverCtx = { DB: env.DB, JWT_SECRET: env.JWT_SECRET };

    // 健康检查
    if (path === '/api/health' && method === 'GET') {
      return json({ status: 'ok', time: new Date().toISOString() });
    }

    // 路由分发
    const handlers = [handleAuth, handlePosts, handleProgress];
    for (const h of handlers) {
      const res = await h(path, method, request, serverCtx);
      if (res) return res;
    }

    return json({ error: '接口不存在' }, 404);
  },
};
