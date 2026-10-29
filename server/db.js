// 三模式存储：本地 JSON → Vercel KV → Netlify Blobs
const fs = require('fs');
const path = require('path');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== 检测运行环境 =====
// Netlify Functions: /var/task 路径 + NETLIFY 系列 env
// Vercel: VERCEL=1
const IS_NETLIFY = process.env.NETLIFY === 'true' 
  || !!process.env.NETLIFY_FUNCTIONS 
  || !!process.env.NETLIFY_BUILD 
  || __dirname.includes('/var/task')
  || __dirname.includes('\\var\\task');
const IS_VERCEL = process.env.VERCEL === '1';
const IS_SERVERLESS = IS_NETLIFY || IS_VERCEL;

console.log(`📦 存储模式: ${IS_NETLIFY ? 'Netlify Serverless' : IS_VERCEL ? 'Vercel KV' : '本地 JSON'} (IS_SERVERLESS=${IS_SERVERLESS}, dir=${__dirname})`);

// ===== 种子帖子 =====
const SEED_POSTS = [
  { id: 'seed-' + generateId(), userId: 'seed-1', user: { name: 'LanguageExplorer', avatar: '🌍', level: 'B1', language: 'english' }, content: 'Hi everyone! I just started learning English A1 level. Any tips for practicing listening skills? 🎧', tags: ['listening', 'beginner', 'tips'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), likes: 0 },
  { id: 'seed-' + generateId(), userId: 'seed-2', user: { name: '日本語勉強中', avatar: '🇯🇵', level: 'A2', language: 'japanese' }, content: 'こんにちは！毎日日本語を学んでいます。皆さんはどうやって単語を覚えていますか？', tags: ['vocabulary', 'japanese'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), likes: 0 },
  { id: 'seed-' + generateId(), userId: 'seed-3', user: { name: '韩语初学者', avatar: '🇰🇷', level: 'A1', language: 'korean' }, content: '大家好！刚开始学韩语，连发音都还不太会ㅠㅠ 有推荐的入门视频吗？', tags: ['korean', 'beginner', 'resources'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), likes: 0 },
];

// ===== 模式 1: 本地 JSON =====
const DATA_DIR = path.join(__dirname, 'data');
if (!IS_SERVERLESS) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(path.join(DATA_DIR, 'posts.json'), JSON.stringify(SEED_POSTS, null, 2), 'utf-8');
      console.log('🌱 种子数据已写入 posts.json');
    }
  } catch (e) {
    console.warn('⚠️ 本地存储不可用，跳过:', e.message);
  }
}

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

// ===== 模式 2 & 3: Serverless (Netlify Blobs SDK / Vercel KV / 内存 fallback) =====
let blobsStore = null;     // Netlify Blobs SDK store
let kvClient = null;       // Vercel KV
const MEMORY_STORE = {};   // 最后兜底：内存（冷启动丢数据）

async function initServerlessStore() {
  if (blobsStore || kvClient) return;

  // 优先 Netlify Blobs SDK — 零配置、自动注入 credentials
  if (IS_NETLIFY) {
    try {
      const { getStore } = await import('@netlify/blobs');
      blobsStore = getStore('linguaholic-data');
      console.log('✅ Netlify Blobs SDK 就绪（持久化存储）');
      return;
    } catch (e) {
      console.warn('⚠️ @netlify/blobs 不可用，fallback 内存:', e.message);
    }
  }

  // 次选 Vercel KV
  if (IS_VERCEL) {
    try {
      const { kv } = await import('@vercel/kv');
      kvClient = kv;
      console.log('✅ Vercel KV 就绪');
      return;
    } catch (e) {
      console.warn('Vercel KV 不可用:', e.message);
    }
  }

  console.warn('⚠️ Serverless 存储全不可用，用内存（重启会丢数据）');
}

async function serverlessRead(key, defaultValue) {
  await initServerlessStore();

  // Netlify Blobs SDK
  if (blobsStore) {
    try {
      const text = await blobsStore.get(key, { type: 'text' });
      if (text === null || text === undefined) return defaultValue;
      try { return JSON.parse(text); } catch { return defaultValue; }
    } catch (e) {
      console.warn('Blobs read 失败，fallback 内存:', e.message);
    }
  }

  // Vercel KV
  if (kvClient) {
    try {
      const data = await kvClient.get(key);
      if (data === null || data === undefined) return defaultValue;
      if (typeof data === 'string') { try { return JSON.parse(data); } catch { return defaultValue; } }
      return data;
    } catch (e) {
      console.warn('KV read 失败:', e.message);
    }
  }

  // 内存 fallback
  if (MEMORY_STORE[key] !== undefined) return MEMORY_STORE[key];
  return defaultValue;
}

async function serverlessWrite(key, data) {
  await initServerlessStore();
  const json = JSON.stringify(data);

  // 永远先写内存（同实例内的后续请求立即可用）
  MEMORY_STORE[key] = data;

  // Netlify Blobs SDK
  if (blobsStore) {
    try {
      await blobsStore.set(key, json);
      return;
    } catch (e) {
      console.warn('Blobs write 失败:', e.message);
    }
  }

  // Vercel KV
  if (kvClient) {
    try { await kvClient.set(key, json); } catch (e) { console.warn('KV write 失败:', e.message); }
  }
}

// ===== 统一对外 API =====
async function readStore(key, defaultValue = []) {
  if (IS_SERVERLESS) {
    return await serverlessRead(key, defaultValue);
  }
  return readJSON(key + '.json', defaultValue);
}

async function writeStore(key, data) {
  if (IS_SERVERLESS) {
    return await serverlessWrite(key, data);
  }
  writeJSON(key + '.json', data);
}

// 种子数据（Serverless 首次访问时检查）
async function seedKVIfEmpty() {
  if (IS_SERVERLESS) {
    const posts = await readStore('posts', null);
    if (!posts || posts.length === 0) {
      await writeStore('posts', SEED_POSTS);
      console.log('🌱 种子数据已写入 Serverless 存储');
    }
  }
}

module.exports = {
  readStore,
  writeStore,
  generateId,
  seedKVIfEmpty,
  IS_SERVERLESS,
  IS_NETLIFY,
  IS_VERCEL,
  // 本地开发直接用
  readJSON,
  writeJSON,
  DATA_DIR,
};
