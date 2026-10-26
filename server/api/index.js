// Vercel Serverless Function 入口（@vercel/node runtime）
// 把 Express app 转成 serverless handler
const { app } = require('./index');
module.exports = app;
