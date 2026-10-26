const express = require('express');
const { readStore, writeStore, generateId, seedKVIfEmpty } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(async (req, res, next) => {
  try { await seedKVIfEmpty(); } catch {}
  next();
});

// GET /api/posts — 获取帖子列表
router.get('/', async (req, res) => {
  try {
    const posts = await readStore('posts', []);
    const likes = await readStore('likes', []);
    const comments = await readStore('comments', []);

    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'linguaholic-dev-secret-key-change-in-prod');
        userId = decoded.id;
      } catch {}
    }

    const postsWithData = posts.map((post) => {
      const postComments = comments.filter((c) => c.postId === post.id);
      const postLikes = likes.filter((l) => l.postId === post.id);
      const isLiked = userId ? postLikes.some((l) => l.userId === userId) : false;
      return {
        ...post,
        likes: postLikes.length,
        isLiked,
        comments: postComments.map((c) => ({ id: c.id, user: c.username, content: c.content })),
      };
    });

    postsWithData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(postsWithData);
  } catch (e) {
    console.error('获取帖子失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/posts — 发帖
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, language = 'english', tags = [] } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    const users = await readStore('users', []);
    const user = users.find((u) => u.id === req.user.id);

    const posts = await readStore('posts', []);
    const newPost = {
      id: generateId(),
      userId: req.user.id,
      user: {
        name: user?.username || req.user.username,
        avatar: user?.avatar || '👤',
        level: 'A2',
        language,
      },
      content: content.trim(),
      tags,
      createdAt: new Date().toISOString(),
    };
    posts.push(newPost);
    await writeStore('posts', posts);

    res.json({ ...newPost, likes: 0, isLiked: false, comments: [] });
  } catch (e) {
    console.error('发帖失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/posts/:id/like — 点赞 toggle
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const posts = await readStore('posts', []);
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const likes = await readStore('likes', []);
    const existingIndex = likes.findIndex(
      (l) => l.postId === req.params.id && l.userId === req.user.id
    );

    if (existingIndex >= 0) {
      likes.splice(existingIndex, 1);
      await writeStore('likes', likes);
      const totalLikes = likes.filter((l) => l.postId === req.params.id).length;
      res.json({ isLiked: false, likes: totalLikes });
    } else {
      likes.push({
        postId: req.params.id,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      });
      await writeStore('likes', likes);
      const totalLikes = likes.filter((l) => l.postId === req.params.id).length;
      res.json({ isLiked: true, likes: totalLikes });
    }
  } catch (e) {
    console.error('点赞失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/posts/:id/comments — 评论
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const posts = await readStore('posts', []);
    if (!posts.find((p) => p.id === req.params.id)) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const users = await readStore('users', []);
    const user = users.find((u) => u.id === req.user.id);

    const comments = await readStore('comments', []);
    const newComment = {
      id: generateId(),
      postId: req.params.id,
      userId: req.user.id,
      username: user?.username || req.user.username,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    await writeStore('comments', comments);

    res.json({ id: newComment.id, user: newComment.username, content: newComment.content });
  } catch (e) {
    console.error('评论失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
