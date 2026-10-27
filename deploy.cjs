// 修复版：Token 通过环境变量自动认证，不出现在命令行
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.NETLIFY_AUTH_TOKEN;
const SITE_ID = process.env.NETLIFY_SITE_ID;

if (!TOKEN || !SITE_ID) {
  console.error('❌ 请先设置 $env:NETLIFY_AUTH_TOKEN 和 $env:NETLIFY_SITE_ID');
  process.exit(1);
}

// ===== 关键：把 server/ 复制到 netlify/functions/server/ =====
const rootDir = __dirname;
const sourceServer = path.join(rootDir, 'server');
const targetServer = path.join(rootDir, 'netlify', 'functions', 'server');

// 清理旧的
if (fs.existsSync(targetServer)) {
  fs.rmSync(targetServer, { recursive: true, force: true });
}
// 复制整个 server 目录（排除 node_modules）
fs.cpSync(sourceServer, targetServer, {
  recursive: true,
  filter: (src) => !src.includes('node_modules') && !src.endsWith('.log')
});
console.log('📦 server/ → netlify/functions/server/ 复制完成');

// 确保 package.json 里没有本地路径问题（忽略 package-lock.json 里的）
// 复制后 netlify/functions/ 里已经有 node_modules 了
// server/ 里的 node_modules 不用带，netlify/functions/package.json 已经装了 express/bcryptjs/jsonwebtoken

// 但 server/db.js 引用了 __dirname，复制后 __dirname 会变成 netlify/functions/server/
// 这是对的！因为 Netlify Functions 里工作目录是 netlify/functions/

console.log('🚀 Netlify CLI 部署 (Token 隐藏模式)...');
console.log('   Site:', SITE_ID);

const result = spawnSync(
  'npx.cmd',
  ['-y', 'netlify-cli', 'deploy', '--prod', '--dir', 'dist', '--functions', 'netlify/functions', '--site', SITE_ID],
  { cwd: __dirname, env: process.env, stdio: 'inherit', timeout: 300000, shell: true }
);

if (result.status === 0) {
  console.log('\n✅ 部署成功！打开你的 netlify.app 地址看看');
} else {
  console.error('\n❌ 失败，退出码:', result.status);
  process.exit(result.status || 1);
}
