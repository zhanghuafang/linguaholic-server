const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3001;

// 前端静态文件 — 一体部署时 Express 同时服务前端
const FRONTEND_DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  console.log(`📦 找到前端构建产物，一起服务: ${FRONTEND_DIST}`);
  app.use(express.static(FRONTEND_DIST));
}

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (res.statusCode >= 400) {
      console.log(`[${res.statusCode}] ${req.method} ${req.url} (${ms}ms) ← 出错了!`);
    } else {
      console.log(`[${res.statusCode}] ${req.method} ${req.url} (${ms}ms)`);
    }
  });
  next();
});

// 中间件
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.VERCEL ? 'vercel' : 'local' });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/progress', progressRoutes);

// 404 API 路由
app.use('/api', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// SPA 回退 — 所有非 API 的 GET 请求返回 index.html（React Router 接管）
if (fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 只在直接运行时 listen（Vercel 会导入 app）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Linguaholic 后端已启动: http://localhost:${PORT}`);
    console.log(`   健康检查: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
