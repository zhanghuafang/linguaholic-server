// Workers KV 存储层 — 替代 JSON 文件数据库
// KV 适合存简单对象，用 JSON 序列化

export async function kvList(DB, keyPrefix) {
  const { keys } = await DB.list({ prefix: keyPrefix });
  return keys;
}

export async function kvGet(DB, key, defaultValue = null) {
  const raw = await DB.get(key);
  if (raw === null) return defaultValue;
  try { return JSON.parse(raw); } catch { return raw; }
}

export async function kvSet(DB, key, value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  await DB.put(key, str);
}

export async function kvDel(DB, key) {
  await DB.delete(key);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 特殊：KV 里存数组（因为 KV 是 key-value，我们需要用一个 key 存全部 ID）
const KEYS = {
  USERS: 'users:all',           // 存所有用户 ID 的数组
  POSTS: 'posts:all',           // 存所有帖子 ID 的数组
  USER_BY_EMAIL: (email) => `user_email:${email.toLowerCase()}`,
  USER_BY_USERNAME: (name) => `user_name:${name.toLowerCase()}`,
  USER: (id) => `user:${id}`,
  POST: (id) => `post:${id}`,
  LIKES: (postId) => `likes:${postId}`,   // 数组：点赞用户 ID
  COMMENTS: (postId) => `comments:${postId}`,
  PROGRESS: (userId) => `progress:${userId}`,
};

export const KV_KEYS = KEYS;

// 追加 ID 到某个列表 key
export async function kvPushId(DB, listKey, id) {
  const list = await kvGet(DB, listKey, []);
  if (!list.includes(id)) {
    list.push(id);
    await kvSet(DB, listKey, list);
  }
  return list;
}

// 从列表中移除
export async function kvRemoveId(DB, listKey, id) {
  const list = await kvGet(DB, listKey, []);
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    await kvSet(DB, listKey, list);
  }
  return list;
}
