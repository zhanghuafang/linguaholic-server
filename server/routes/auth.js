const express = require('express');
const bcrypt = require('bcryptjs');
const { readJSON, writeJSON, generateId } = require('../db');
const { signToken } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_PROGRESS = {
  totalStudyTime: 0,
  streakDays: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
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
  completedLessonKeys: [],
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写完整信息' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    const users = readJSON('users.json', []);

    // 检查邮箱/用户名是否已存在
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }
    if (users.find((u) => u.username === username)) {
      return res.status(400).json({ error: '该用户名已被使用' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = {
      id: generateId(),
      username,
      email,
      passwordHash,
      avatar: username[0].toUpperCase(),
      joinedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJSON('users.json', users);

    // 创建初始学习进度
    const progress = readJSON('progress.json', {});
    progress[newUser.id] = DEFAULT_PROGRESS;
    writeJSON('progress.json', progress);

    const token = signToken({ id: newUser.id, username: newUser.username });
    res.json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (e) {
    console.error('注册失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请填写邮箱和密码' });
    }

    const users = readJSON('users.json', []);
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: '该邮箱尚未注册，请先注册账号' });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: '密码错误，请重试' });
    }

    const token = signToken({ id: user.id, username: user.username });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    console.error('登录失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
