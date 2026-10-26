// 三模式存储：本地 JSON → Vercel KV → Netlify Blobs
const fs = require('fs');
const path = require('path');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== 检测运行环境 =====
const IS_NETLIFY = process.env.NETLIFY === 'true' || !!process.env.NETLIFY_FUNCTIONS;
const IS_VERCEL = process.env.VERCEL === '1';
const IS_SERVERLESS = IS_NETLIFY || IS_VERCEL;

console.log(`📦 存储模式: ${IS_NETLIFY ? 'Netlify Blobs' : IS_VERCEL ? 'Vercel KV' : '本地 JSON'}`);

// ===== 种子帖子 =====
const SEED_POSTS = [
  { id: 'seed-' + generateId(), userId: 'seed-1', user: { name: 'LanguageExplorer', avatar: '🌍', level: 'B1', language: 'english' }, content: 'Hi everyone! I just started learning English A1 level. Any tips for practicing listening skills? 🎧', tags: ['listening', 'beginner', 'tips'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), likes: 0 },
  { id: 'seed-' + generateId(), userId: 'seed-2', user: { name: '日本語勉強中', avatar: '🇯🇵', level: 'A2', language: 'japanese' }, content: 'こんにちは！毎日日本語を学んでいます。皆さんはどうやって単語を覚えていますか？', tags: ['vocabulary', 'japanese'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), likes: 0 },
  { id: 'seed-' + generateId(), userId: 'seed-3', user: { name: '韩语初学者', avatar: '🇰🇷', level: 'A1', language: 'korean' }, content: '大家好！刚开始学韩语，连发音都还不太会ㅠㅠ 有推荐的入门视频吗？', tags: ['korean', 'beginner', 'resources'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), likes: 0 },
];

// ===== 模式 1: 本地 JSON =====
const DATA_DIR = path.join(__dirname, 'data');
if (!IS_SERVERLESS && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'posts.json'), JSON.stringify(SEED_POSTS, null, 2), 'utf-8');
  console.log('🌱 种子数据已写入 posts.json');
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

// ===== 模式 2 & 3: Serverless (Vercel KV 或 Netlify Blobs) =====
// 统一用一个 async key-value 接口，底层由环境决定
let kvClient = null;
let blobsClient = null;

async function initServerlessStore() {
  if (kvClient || blobsClient) return;

  if (IS_VERCEL) {
    // Vercel KV
    const { kv } = await import('@vercel/kv');
    kvClient = kv;
    console.log('✅ Vercel KV 就绪');
  } else if (IS_NETLIFY) {
    // Netlify Blobs — 用 @netlify/blobs 或 fetch REST API
    try {
      const { store } = await import('@netlify/blobs');
      blobsClient = store({ name: 'linguaholic-data' });
      console.log('✅ Netlify Blobs 就绪');
    } catch (e) {
      console.warn('Netlify Blobs SDK 未安装，尝试用 fetch REST API:', e.message);
      blobsClient = { viaFetch: true };
    }
  }
}

async function serverlessRead(key, defaultValue) {
  await initServerlessStore();

  if (kvClient) {
    const data = await kvClient.get(key);
    if (data === null || data === undefined) return defaultValue;
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return defaultValue; }
    }
    return data;
  }

  if (blobsClient) {
    try {
      if (blobsClient.viaFetch) {
        // 降级方案：用 Netlify Functions 内部 fetch
        const resp = await fetch(`https://api.netlify.com/api/v1/blobs/${key}`, {
          headers: { Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN || ''}` },
        }).catch(() => null);
        if (!resp || !resp.ok) return defaultValue;
        const text = await resp.text();
        try { return JSON.parse(text); } catch { return defaultValue; }
      }
      // 用 SDK
      const data = await blobsClient.get(key, { type: 'json' });
      return data !== null && data !== undefined ? data : defaultValue;
    } catch (e) {
      console.error('Serverless read error:', e.message);
      return defaultValue;
    }
  }

  return defaultValue;
}

async function serverlessWrite(key, data) {
  await initServerlessStore();
  const json = JSON.stringify(data);

  if (kvClient) {
    await kvClient.set(key, json);
    return;
  }

  if (blobsClient) {
    try {
      if (blobsClient.viaFetch) {
        await fetch(`https://api.netlify.com/api/v1/blobs/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN || ''}`,
          },
          body: json,
        }).catch(() => {});
        return;
      }
      await blobsClient.set(key, json);
    } catch (e) {
      console.error('Serverless write error:', e.message);
    }
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
