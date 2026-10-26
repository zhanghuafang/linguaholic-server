// Netlify Function 入口 — 把整个 Express app 包成一个 serverless function
// 所有 /api/* 请求会被 netlify.toml 路由到这里
const serverless = require('serverless-http');
const { app } = require('../../server/index');

module.exports.handler = serverless(app);
