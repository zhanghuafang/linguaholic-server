// Auth 路由 — /api/auth/register, /api/auth/login
import { kvGet, kvSet, kvPushId, KV_KEYS, generateId } from '../kv.js';
import { hashPassword, verifyPassword, signToken, authFromRequest, json } from '../auth.js';

const DEFAULT_PROGRESS = {
  totalStudyTime: 0,
  streakDays: 1,
  lastStudyDate: '',
  wordsLearned: 0,
  wordsMastered: 0,
  grammarCompleted: 0,
  speakingPractice: 0,
  listeningCompleted: 0,
  xpPoints: 0,
  level: 1,
  badges: [],
  languageProgress: {},
  weeklyActivity: [],
};

export async function handleAuth(path, method, request, ctx) {
  const { DB, JWT_SECRET } = ctx;

  if (path === '/api/auth/register' && method === 'POST') {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) return json({ error: '请填写完整信息' }, 400);
    if (password.length < 6) return json({ error: '密码至少6位' }, 400);

    const existingByEmail = await kvGet(DB, KV_KEYS.USER_BY_EMAIL(email));
    if (existingByEmail) return json({ error: '该邮箱已注册' }, 400);
    const existingByName = await kvGet(DB, KV_KEYS.USER_BY_USERNAME(username));
    if (existingByName) return json({ error: '该用户名已被使用' }, 400);

    const id = generateId();
    const passwordHash = await hashPassword(password);
    const user = {
      id, username, email, passwordHash,
      avatar: username[0].toUpperCase(),
      joinedAt: new Date().toISOString(),
    };

    await kvSet(DB, KV_KEYS.USER(id), user);
    await kvSet(DB, KV_KEYS.USER_BY_EMAIL(email), id);
    await kvSet(DB, KV_KEYS.USER_BY_USERNAME(username), id);
    await kvPushId(DB, KV_KEYS.USERS, id);

    // 初始进度
    await kvSet(DB, KV_KEYS.PROGRESS(id), DEFAULT_PROGRESS);

    const token = await signToken({ id, username }, JWT_SECRET);
    return json({
      token,
      user: { id, username, email, avatar: user.avatar },
    });
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = await request.json();
    if (!email || !password) return json({ error: '请填写邮箱和密码' }, 400);

    const userId = await kvGet(DB, KV_KEYS.USER_BY_EMAIL(email));
    if (!userId) return json({ error: '邮箱或密码错误' }, 401);
    const user = await kvGet(DB, KV_KEYS.USER(userId));
    if (!user) return json({ error: '邮箱或密码错误' }, 401);

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return json({ error: '邮箱或密码错误' }, 401);

    const token = await signToken({ id: user.id, username: user.username }, JWT_SECRET);
    return json({
      token,
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
    });
  }

  return null; // 交给其他 handler
}

// 导出以便 authFromRequest 在其他路由用
export { authFromRequest };
