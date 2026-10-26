// 轻量级 JSON 文件数据库封装
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 种子数据：首次启动时填充初始帖子和用户
function seedIfEmpty() {
  const postsPath = path.join(DATA_DIR, 'posts.json');
  if (!fs.existsSync(postsPath) || JSON.parse(fs.readFileSync(postsPath, 'utf-8')).length === 0) {
    const seedPosts = [
      {
        id: generateId(),
        userId: 'seed-1',
        user: { name: 'LanguageExplorer', avatar: '🌍', level: 'B1', language: 'english' },
        content: 'Hi everyone! I just started learning English A1 level. Any tips for practicing listening skills? 🎧',
        tags: ['listening', 'beginner', 'tips'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: generateId(),
        userId: 'seed-2',
        user: { name: '日本語勉強中', avatar: '🇯🇵', level: 'A2', language: 'japanese' },
        content: 'こんにちは！毎日日本語を学んでいます。皆さんはどうやって単語を覚えていますか？',
        tags: ['vocabulary', 'japanese'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
      {
        id: generateId(),
        userId: 'seed-3',
        user: { name: '韩语初学者', avatar: '🇰🇷', level: 'A1', language: 'korean' },
        content: '大家好！刚开始学韩语，连发音都还不太会ㅠㅠ 有推荐的入门视频吗？',
        tags: ['korean', 'beginner', 'resources'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      },
    ];
    fs.writeFileSync(postsPath, JSON.stringify(seedPosts, null, 2), 'utf-8');
    console.log('🌱 种子数据已写入 posts.json');
  }
}
seedIfEmpty();

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

module.exports = { readJSON, writeJSON, generateId, DATA_DIR };
