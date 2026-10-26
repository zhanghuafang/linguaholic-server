const express = require('express');
const { readStore, writeStore } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    const progress = await readStore('progress', {});
    const userProgress = progress[req.user.id];

    if (!userProgress) {
      return res.json({
        totalStudyTime: 0, streakDays: 1, lastStudyDate: new Date().toISOString().split('T')[0],
        wordsLearned: 0, wordsMastered: 0, grammarCompleted: 0, speakingPractice: 0,
        listeningCompleted: 0, xpPoints: 0, level: 1, badges: [],
        languageProgress: {}, weeklyActivity: [], completedLessonKeys: [],
      });
    }

    res.json({
      ...userProgress,
      completedLessonKeys: userProgress.completedLessonKeys || [],
    });
  } catch (e) {
    console.error('获取进度失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/progress
router.put('/', authMiddleware, async (req, res) => {
  try {
    const progress = await readStore('progress', {});
    const userProgress = progress[req.user.id] || {};

    const {
      totalStudyTime, wordsLearned, wordsMastered, grammarCompleted,
      speakingPractice, listeningCompleted, xpPoints, level,
      languageProgress, completedLessonKeys,
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
      completedLessonKeys: completedLessonKeys !== undefined ? completedLessonKeys : (userProgress.completedLessonKeys || []),
      updatedAt: new Date().toISOString(),
    };

    progress[req.user.id] = updated;
    await writeStore('progress', progress);
    res.json(updated);
  } catch (e) {
    console.error('更新进度失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/progress/add-study
router.post('/add-study', authMiddleware, async (req, res) => {
  try {
    const { minutes = 10, lessonType } = req.body;
    const progress = await readStore('progress', {});
    const userProgress = progress[req.user.id] || {
      totalStudyTime: 0, xpPoints: 0, level: 1, wordsLearned: 0,
      grammarCompleted: 0, speakingPractice: 0, listeningCompleted: 0, streakDays: 1,
    };

    userProgress.totalStudyTime = (userProgress.totalStudyTime || 0) + minutes;
    userProgress.xpPoints = (userProgress.xpPoints || 0) + minutes * 2;
    if (lessonType === 'vocabulary') userProgress.wordsLearned = (userProgress.wordsLearned || 0) + 1;
    if (lessonType === 'grammar') userProgress.grammarCompleted = (userProgress.grammarCompleted || 0) + 1;
    if (lessonType === 'speaking') userProgress.speakingPractice = (userProgress.speakingPractice || 0) + 1;
    if (lessonType === 'listening') userProgress.listeningCompleted = (userProgress.listeningCompleted || 0) + 1;

    if (userProgress.xpPoints >= userProgress.level * 500) {
      userProgress.level = (userProgress.level || 1) + 1;
    }

    userProgress.updatedAt = new Date().toISOString();
    progress[req.user.id] = userProgress;
    await writeStore('progress', progress);
    res.json(userProgress);
  } catch (e) {
    console.error('add-study 失败:', e);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
