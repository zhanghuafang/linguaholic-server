// Netlify Function 入口 — 把整个 Express app 包成一个 serverless function
const serverless = require('serverless-http');
const app = require('./server/index');

// Netlify Functions 要求导出 handler
// server/index.js 里 module.exports = app（Express app）
module.exports.handler = serverless(app);
