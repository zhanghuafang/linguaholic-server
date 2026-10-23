const express = require('express');
const { readJSON, writeJSON } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress — 获取当前用户学习进度
router.get('/', authMiddleware, (req, res) => {
  const progress = readJSON('progress.json', {});
  const userProgress = progress[req.user.id];

  if (!userProgress) {
    return res.json({
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
    });
  }

  res.json(userProgress);
});

// PUT /api/progress — 更新学习进度
router.put('/', authMiddleware, (req, res) => {
  const progress = readJSON('progress.json', {});
  const userProgress = progress[req.user.id] || {};

  const {
    totalStudyTime,
    wordsLearned,
    wordsMastered,
    grammarCompleted,
    speakingPractice,
    listeningCompleted,
    xpPoints,
    level,
    languageProgress,
  } = req.body;

  const updated = {
    ...userProgress,
    totalStudyTime: totalStudyTime !== undefined ? totalStudyTime : userProgress.totalStudyTime,
    wordsLearned: wordsLearned !== undefined ? wordsLearned : userProgress.wordsLearned,
    wordsMastered: wordsMastered !== undefined ? wordsMastered : userProgress.wordsMastered,
    grammarCompleted: grammarCompleted !== undefined ? grammarCompleted : userProgress.grammarCompleted,
    speakingPractice: speakingPractice !== undefined ? speakingPractice : userProgress.speakingPractice,
    listeningCompleted: listeningCompleted !== undefined ? listeningCompleted : userProgress.listeningCompleted,
    xpPoints: xpPoints !== undefined ? xpPoints : userProgress.xpPoints,
    level: level !== undefined ? level : userProgress.level,
    languageProgress: languageProgress !== undefined ? languageProgress : userProgress.languageProgress,
    updatedAt: new Date().toISOString(),
  };

  progress[req.user.id] = updated;
  writeJSON('progress.json', progress);
  res.json(updated);
});

// POST /api/progress/add-study — 增加学习时间 + XP
router.post('/add-study', authMiddleware, (req, res) => {
  const { minutes = 10, lessonType } = req.body;
  const progress = readJSON('progress.json', {});
  const userProgress = progress[req.user.id] || {
    totalStudyTime: 0,
    xpPoints: 0,
    level: 1,
    wordsLearned: 0,
    grammarCompleted: 0,
    speakingPractice: 0,
    listeningCompleted: 0,
    streakDays: 1,
  };

  userProgress.totalStudyTime = (userProgress.totalStudyTime || 0) + minutes;
  userProgress.xpPoints = (userProgress.xpPoints || 0) + minutes * 2;

  // 根据练习类型增加对应计数
  if (lessonType === 'vocabulary') userProgress.wordsLearned = (userProgress.wordsLearned || 0) + 1;
  if (lessonType === 'grammar') userProgress.grammarCompleted = (userProgress.grammarCompleted || 0) + 1;
  if (lessonType === 'speaking') userProgress.speakingPractice = (userProgress.speakingPractice || 0) + 1;
  if (lessonType === 'listening') userProgress.listeningCompleted = (userProgress.listeningCompleted || 0) + 1;

  // 升级判定
  if (userProgress.xpPoints >= userProgress.level * 500) {
    userProgress.level = (userProgress.level || 1) + 1;
  }

  userProgress.updatedAt = new Date().toISOString();
  progress[req.user.id] = userProgress;
  writeJSON('progress.json', progress);

  res.json(userProgress);
});

module.exports = router;
