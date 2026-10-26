// Progress 路由
import { kvGet, kvSet, KV_KEYS } from '../kv.js';
import { authFromRequest, json } from '../auth.js';

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

export async function handleProgress(path, method, request, ctx) {
  const { DB, JWT_SECRET } = ctx;
  const user = await authFromRequest(request, JWT_SECRET);
  if (!user) return json({ error: '未登录' }, 401);

  // GET /api/progress
  if (path === '/api/progress' && method === 'GET') {
    const p = await kvGet(DB, KV_KEYS.PROGRESS(user.id), DEFAULT_PROGRESS);
    return json(p);
  }

  // PUT /api/progress
  if (path === '/api/progress' && method === 'PUT') {
    const body = await request.json();
    const existing = await kvGet(DB, KV_KEYS.PROGRESS(user.id), DEFAULT_PROGRESS);
    const merged = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kvSet(DB, KV_KEYS.PROGRESS(user.id), merged);
    return json(merged);
  }

  // POST /api/progress/add-study
  if (path === '/api/progress/add-study' && method === 'POST') {
    const { minutes = 10, lessonType } = await request.json();
    const p = await kvGet(DB, KV_KEYS.PROGRESS(user.id), DEFAULT_PROGRESS);

    p.totalStudyTime = (p.totalStudyTime || 0) + minutes;
    p.xpPoints = (p.xpPoints || 0) + minutes * 2;

    if (lessonType === 'vocabulary') p.wordsLearned = (p.wordsLearned || 0) + 1;
    if (lessonType === 'grammar') p.grammarCompleted = (p.grammarCompleted || 0) + 1;
    if (lessonType === 'speaking') p.speakingPractice = (p.speakingPractice || 0) + 1;
    if (lessonType === 'listening') p.listeningCompleted = (p.listeningCompleted || 0) + 1;

    if (p.xpPoints >= (p.level || 1) * 500) p.level = (p.level || 1) + 1;

    p.updatedAt = new Date().toISOString();
    await kvSet(DB, KV_KEYS.PROGRESS(user.id), p);
    return json(p);
  }

  return null;
}
