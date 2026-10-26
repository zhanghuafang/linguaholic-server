const express = require('express');
const { readJSON, writeJSON, generateId } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts — 获取帖子列表（含当前用户点赞状态）
router.get('/', (req, res) => {
  const posts = readJSON('posts.json', []);
  const likes = readJSON('likes.json', []);
  const comments = readJSON('comments.json', []);

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

  // 按创建时间倒序
  postsWithData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(postsWithData);
});

// POST /api/posts — 发新帖子
router.post('/', authMiddleware, (req, res) => {
  const { content, language = 'english', tags = [] } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '内容不能为空' });
  }

  const users = readJSON('users.json', []);
  const user = users.find((u) => u.id === req.user.id);

  const posts = readJSON('posts.json', []);
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
  writeJSON('posts.json', posts);

  res.json({ ...newPost, likes: 0, isLiked: false, comments: [] });
});

// POST /api/posts/:id/like — 点赞/取消点赞（toggle）
router.post('/:id/like', authMiddleware, (req, res) => {
  const posts = readJSON('posts.json', []);
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: '帖子不存在' });
  }

  const likes = readJSON('likes.json', []);
  const existingIndex = likes.findIndex(
    (l) => l.postId === req.params.id && l.userId === req.user.id
  );

  if (existingIndex >= 0) {
    // 取消点赞
    likes.splice(existingIndex, 1);
    writeJSON('likes.json', likes);
    const totalLikes = likes.filter((l) => l.postId === req.params.id).length;
    res.json({ isLiked: false, likes: totalLikes });
  } else {
    // 点赞
    likes.push({
      postId: req.params.id,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    });
    writeJSON('likes.json', likes);
    const totalLikes = likes.filter((l) => l.postId === req.params.id).length;
    res.json({ isLiked: true, likes: totalLikes });
  }
});

// POST /api/posts/:id/comments — 评论
router.post('/:id/comments', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  const posts = readJSON('posts.json', []);
  if (!posts.find((p) => p.id === req.params.id)) {
    return res.status(404).json({ error: '帖子不存在' });
  }

  const users = readJSON('users.json', []);
  const user = users.find((u) => u.id === req.user.id);

  const comments = readJSON('comments.json', []);
  const newComment = {
    id: generateId(),
    postId: req.params.id,
    userId: req.user.id,
    username: user?.username || req.user.username,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  writeJSON('comments.json', comments);

  res.json({ id: newComment.id, user: newComment.username, content: newComment.content });
});

module.exports = router;
