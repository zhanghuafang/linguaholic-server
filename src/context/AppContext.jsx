import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_USER_PROGRESS } from '../data/mockData';
import { authApi, progressApi, setToken, getToken } from '../api/client';

const AuthContext = createContext();
const ProgressContext = createContext();

// 根据 userId 生成本地存储 key（多账号隔离）
function progressStorageKey(userId) {
  return `linguaholic_progress_${userId}`;
}

// ==================== Auth Provider ====================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('linguaholic_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('linguaholic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('linguaholic_user');
      setToken(null);
    }
  }, [user]);

  const register = async (username, email, password) => {
    const res = await authApi.register(username, email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    // 清当前用户的本地进度缓存（切换账号时不串数据）
    if (user) localStorage.removeItem(progressStorageKey(user.id));
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ==================== Progress Provider ====================
export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();

  // 按 userId 隔离 localStorage key
  const storageKey = user ? progressStorageKey(user.id) : 'linguaholic_progress_guest';

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROGRESS;
  });

  // 用户登录后从后端拉取真实进度
  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    progressApi.get()
      .then((data) => {
        if (data && typeof data === 'object') {
          // 以服务端数据为准，completedLessonKeys 仍保留本地（后端 JSON 不含它）
          const existingLocal = (() => {
            try { return JSON.parse(localStorage.getItem(storageKey) || '{}').completedLessonKeys || []; }
            catch { return []; }
          })();
          const merged = { ...DEFAULT_USER_PROGRESS, ...data, completedLessonKeys: existingLocal };
          setProgress(merged);
          localStorage.setItem(storageKey, JSON.stringify(merged));
        }
      })
      .catch(() => {
        // 后端不可用，保持本地数据
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 用户切换时（从 A 登出 → 登 B），重置 progress 读 B 的 key
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      setProgress(DEFAULT_USER_PROGRESS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 每次更新后同步到 localStorage（离线可用，按 user key 隔离）
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  const addStudyMinutes = useCallback((minutes) => {
    setProgress((prev) => ({
      ...prev,
      totalStudyTime: (prev.totalStudyTime || 0) + minutes,
      xpPoints: (prev.xpPoints || 0) + minutes * 2,
    }));
    // 同步后端（失败忽略）
    progressApi.addStudy(minutes).catch(() => {});
  }, []);

  const completeLesson = useCallback((lessonType = 'vocabulary') => {
    setProgress((prev) => {
      const updates = { ...prev };
      updates.xpPoints = (updates.xpPoints || 0) + 50;

      switch (lessonType) {
        case 'vocabulary':
          updates.wordsLearned = (updates.wordsLearned || 0) + 5;
          break;
        case 'grammar':
          updates.grammarCompleted = (updates.grammarCompleted || 0) + 3;
          break;
        case 'speaking':
          updates.speakingPractice = (updates.speakingPractice || 0) + 1;
          break;
        case 'listening':
          updates.listeningCompleted = (updates.listeningCompleted || 0) + 1;
          break;
      }

      if (updates.xpPoints >= (prev.level || 1) * 500) {
        updates.level = (prev.level || 1) + 1;
      }

      return updates;
    });
    progressApi.addStudy(15, lessonType).catch(() => {});
  }, []);

  const masterWord = useCallback(() => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        wordsMastered: (prev.wordsMastered || 0) + 1,
        xpPoints: (prev.xpPoints || 0) + 10,
      };
      progressApi.update(updated).catch(() => {});
      return updated;
    });
  }, []);

  const updateLanguageProgress = useCallback((language, progressPercent, minutesStudied = 10) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        languageProgress: {
          ...prev.languageProgress,
          [language]: {
            ...prev.languageProgress[language],
            progress: Math.max(prev.languageProgress[language]?.progress || 0, progressPercent),
            todayStudied: (prev.languageProgress[language]?.todayStudied || 0) + minutesStudied,
          },
        },
      };
      progressApi.update(updated).catch(() => {});
      return updated;
    });
  }, []);

  // 设置某语言的级别（水平测试后调用）
  const setLanguageLevel = useCallback((language, level) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        languageProgress: {
          ...prev.languageProgress,
          [language]: {
            ...prev.languageProgress[language],
            level,
            progress: prev.languageProgress[language]?.progress || 0,
          },
        },
      };
      // 异步存后端（就算刷新也能恢复）
      progressApi.update(updated).catch(() => {});
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_USER_PROGRESS);
  }, []);

  // 标记某门课的某节课已完成（用于 Courses 页面进度条）
  const markLessonCompleted = useCallback((language, courseId, lessonIndex, lessonType) => {
    const key = `${language}:${courseId}:${lessonIndex}`;
    setProgress((prev) => {
      const completedKeys = new Set(prev.completedLessonKeys || []);
      completedKeys.add(key);
      const updated = { ...prev, completedLessonKeys: Array.from(completedKeys) };
      // 同步后端！这是用户最在意的持久化数据
      progressApi.update(updated).catch(() => {});
      return updated;
    });
  }, []);

  // 检查某节课是否已完成
  const isLessonCompleted = useCallback((language, courseId, lessonIndex) => {
    const key = `${language}:${courseId}:${lessonIndex}`;
    const keys = progress.completedLessonKeys || [];
    return keys.includes(key);
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        addStudyMinutes,
        completeLesson,
        masterWord,
        updateLanguageProgress,
        setLanguageLevel,
        resetProgress,
        markLessonCompleted,
        isLessonCompleted,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
