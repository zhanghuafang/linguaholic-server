// Posts 路由
import { kvGet, kvSet, kvPushId, kvRemoveId, KV_KEYS, generateId } from '../kv.js';
import { authFromRequest, json } from '../auth.js';

// 解析路径参数：/api/posts/:id/like → { postId, subaction }
function matchPath(path, pattern) {
  const pathSegs = path.split('/').filter(Boolean);
  const patSegs = pattern.split('/').filter(Boolean);
  if (pathSegs.length !== patSegs.length) return null;
  const params = {};
  for (let i = 0; i < patSegs.length; i++) {
    if (patSegs[i].startsWith(':')) {
      params[patSegs[i].slice(1)] = pathSegs[i];
    } else if (patSegs[i] !== pathSegs[i]) {
      return null;
    }
  }
  return params;
}

export async function handlePosts(path, method, request, ctx) {
  const { DB, JWT_SECRET } = ctx;
  const user = await authFromRequest(request, JWT_SECRET);

  // GET /api/posts — 列表
  if (path === '/api/posts' && method === 'GET') {
    const allIds = await kvGet(DB, KV_KEYS.POSTS, []);
    const posts = [];
    for (const pid of allIds) {
      const post = await kvGet(DB, KV_KEYS.POST(pid));
      if (!post) continue;
      const likes = await kvGet(DB, KV_KEYS.LIKES(pid), []);
      const comments = await kvGet(DB, KV_KEYS.COMMENTS(pid), []);
      const isLiked = user ? likes.includes(user.id) : false;
      posts.push({
        ...post,
        likes: likes.length,
        isLiked,
        comments,
      });
    }
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return json(posts);
  }

  // POST /api/posts — 发新帖（需要登录）
  if (path === '/api/posts' && method === 'POST') {
    if (!user) return json({ error: '未登录' }, 401);
    const { content, language = 'english', tags = [] } = await request.json();
    if (!content || !content.trim()) return json({ error: '内容不能为空' }, 400);

    const u = await kvGet(DB, KV_KEYS.USER(user.id));
    const id = generateId();
    const post = {
      id,
      userId: user.id,
      user: {
        name: u?.username || user.username,
        avatar: u?.avatar || '👤',
        level: 'A2',
        language,
      },
      content: content.trim(),
      tags,
      createdAt: new Date().toISOString(),
    };
    await kvSet(DB, KV_KEYS.POST(id), post);
    await kvPushId(DB, KV_KEYS.POSTS, id);
    await kvSet(DB, KV_KEYS.LIKES(id), []);
    await kvSet(DB, KV_KEYS.COMMENTS(id), []);
    return json({ ...post, likes: 0, isLiked: false, comments: [] });
  }

  // POST /api/posts/:id/like — 点赞 toggle
  const likeMatch = matchPath(path, '/api/posts/:id/like');
  if (likeMatch && method === 'POST') {
    if (!user) return json({ error: '未登录' }, 401);
    const postId = likeMatch.id;
    const post = await kvGet(DB, KV_KEYS.POST(postId));
    if (!post) return json({ error: '帖子不存在' }, 404);

    const likes = await kvGet(DB, KV_KEYS.LIKES(postId), []);
    const existingIdx = likes.indexOf(user.id);
    if (existingIdx >= 0) {
      likes.splice(existingIdx, 1);
      await kvSet(DB, KV_KEYS.LIKES(postId), likes);
      return json({ isLiked: false, likes: likes.length });
    } else {
      likes.push(user.id);
      await kvSet(DB, KV_KEYS.LIKES(postId), likes);
      return json({ isLiked: true, likes: likes.length });
    }
  }

  // POST /api/posts/:id/comments — 评论
  const commentMatch = matchPath(path, '/api/posts/:id/comments');
  if (commentMatch && method === 'POST') {
    if (!user) return json({ error: '未登录' }, 401);
    const postId = commentMatch.id;
    const post = await kvGet(DB, KV_KEYS.POST(postId));
    if (!post) return json({ error: '帖子不存在' }, 404);

    const { content } = await request.json();
    if (!content || !content.trim()) return json({ error: '评论内容不能为空' }, 400);

    const u = await kvGet(DB, KV_KEYS.USER(user.id));
    const comments = await kvGet(DB, KV_KEYS.COMMENTS(postId), []);
    const id = generateId();
    const c = { id, postId, userId: user.id, username: u?.username || user.username, content: content.trim(), createdAt: new Date().toISOString() };
    comments.push(c);
    await kvSet(DB, KV_KEYS.COMMENTS(postId), comments);
    return json({ id: c.id, user: c.username, content: c.content });
  }

  return null;
}
