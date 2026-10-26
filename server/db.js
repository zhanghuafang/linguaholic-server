// 双模式存储：本地开发用 JSON 文件，Vercel 生产用 KV（Redis）
const fs = require('fs');
const path = require('path');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== 检测运行环境 =====
const IS_VERCEL = process.env.VERCEL === '1';
let kv = null;

async function initKV() {
  if (kv) return kv;
  try {
    const { kv: vercelKV } = await import('@vercel/kv');
    kv = vercelKV;
    console.log('✅ 存储模式: Vercel KV (Redis)');
  } catch (e) {
    console.error('❌ @vercel/kv 未安装或 KV 未配置，请在 Vercel 控制台创建 KV Storage');
    throw e;
  }
  return kv;
}

// ===== 本地 JSON 模式 =====
const DATA_DIR = path.join(__dirname, 'data');
if (!IS_VERCEL && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SEED_POSTS = [
  {
    id: 'seed-' + generateId(),
    userId: 'seed-1',
    user: { name: 'LanguageExplorer', avatar: '🌍', level: 'B1', language: 'english' },
    content: 'Hi everyone! I just started learning English A1 level. Any tips for practicing listening skills? 🎧',
    tags: ['listening', 'beginner', 'tips'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 0,
  },
  {
    id: 'seed-' + generateId(),
    userId: 'seed-2',
    user: { name: '日本語勉強中', avatar: '🇯🇵', level: 'A2', language: 'japanese' },
    content: 'こんにちは！毎日日本語を学んでいます。皆さんはどうやって単語を覚えていますか？',
    tags: ['vocabulary', 'japanese'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 0,
  },
  {
    id: 'seed-' + generateId(),
    userId: 'seed-3',
    user: { name: '韩语初学者', avatar: '🇰🇷', level: 'A1', language: 'korean' },
    content: '大家好！刚开始学韩语，连发音都还不太会ㅠㅠ 有推荐的入门视频吗？',
    tags: ['korean', 'beginner', 'resources'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    likes: 0,
  },
];

// JSON 文件模式的种子（同步，服务器启动时执行一次）
function seedLocalJSON() {
  const postsPath = path.join(DATA_DIR, 'posts.json');
  if (!fs.existsSync(postsPath) || JSON.parse(fs.readFileSync(postsPath, 'utf-8')).length === 0) {
    fs.writeFileSync(postsPath, JSON.stringify(SEED_POSTS, null, 2), 'utf-8');
    console.log('🌱 种子数据已写入 posts.json');
  }
}
if (!IS_VERCEL) seedLocalJSON();

// ===== JSON 文件读写（本地模式）=====
function readJSON(filename, defaultValue = []) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultValue);
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`读取 ${filename} 失败:`, e.message);
    return defaultValue;
  }
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===== 统一对外 API（支持两种模式）=====
async function readStore(key, defaultValue = []) {
  if (IS_VERCEL) {
    const store = await initKV();
    const data = await store.get(key);
    if (data === null || data === undefined) return defaultValue;
    // Vercel KV 可能返回对象（自动解析 JSON），也可能返回字符串
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return defaultValue; }
    }
    return data;
  }
  return readJSON(key + '.json', defaultValue);
}

async function writeStore(key, data) {
  if (IS_VERCEL) {
    const store = await initKV();
    await store.set(key, JSON.stringify(data));
    return;
  }
  writeJSON(key + '.json', data);
}

// KV 模式的种子（异步，首次访问时执行）
async function seedKVIfEmpty() {
  if (IS_VERCEL) {
    const posts = await readStore('posts', null);
    if (!posts || posts.length === 0) {
      await writeStore('posts', SEED_POSTS);
      console.log('🌱 种子数据已写入 Vercel KV');
    }
  }
}

// 导出
module.exports = {
  readStore,        // 异步，读取（自动选 KV 或 JSON）
  writeStore,       // 异步，写入
  generateId,
  IS_VERCEL,
  seedKVIfEmpty,    // KV 模式种子
  // 兼容老代码（本地开发直接用）
  readJSON,
  writeJSON,
  DATA_DIR,
};
