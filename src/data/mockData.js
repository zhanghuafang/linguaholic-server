// ==================== 语言课程数据 ====================
export const LANGUAGES = [
  {
    id: 'english',
    name: '英语',
    flag: '🇬🇧',
    gradient: 'bg-gradient-english',
    description: '全球通用语言，商务与学术必备',
    color: '#667eea',
  },
  {
    id: 'japanese',
    name: '日语',
    flag: '🇯🇵',
    gradient: 'bg-gradient-japanese',
    description: '动漫游戏爱好者的首选，日本旅行必备',
    color: '#f5576c',
  },
  {
    id: 'korean',
    name: '韩语',
    flag: '🇰🇷',
    gradient: 'bg-gradient-korean',
    description: '韩流文化体验，韩国工作留学必备',
    color: '#4facfe',
  },
];

export const LEVELS = [
  { id: 'A1', name: '入门', description: '基础发音与简单日常用语', color: '#10b981' },
  { id: 'A2', name: '初级', description: '基本语法框架与日常交流', color: '#3b82f6' },
  { id: 'B1', name: '中级', description: '较流畅的日常与工作交流', color: '#8b5cf6' },
  { id: 'B2', name: '中高级', description: '复杂话题讨论与书面表达', color: '#f59e0b' },
  { id: 'C1', name: '高级', description: '接近母语者水平的流畅表达', color: '#ef4444' },
];

// ==================== 课程数据 ====================
export const COURSES = {
  english: [
    {
      id: 'en-a1-1',
      language: 'english',
      level: 'A1',
      title: '英语入门：第一课',
      lessons: [
        { id: 1, title: '字母与发音', type: 'vocabulary', completed: true },
        { id: 2, title: '自我介绍', type: 'grammar', completed: true },
        { id: 3, title: '数字与日期', type: 'vocabulary', completed: false },
        { id: 4, title: '基础问候语', type: 'speaking', completed: false },
        { id: 5, title: '听力小测试', type: 'listening', completed: false },
      ],
    },
    {
      id: 'en-a1-2',
      language: 'english',
      level: 'A1',
      title: '日常场景英语',
      lessons: [
        { id: 1, title: '在餐厅点餐', type: 'vocabulary', completed: false },
        { id: 2, title: '购物用语', type: 'speaking', completed: false },
        { id: 3, title: '问路指南', type: 'listening', completed: false },
        { id: 4, title: '语法：现在时', type: 'grammar', completed: false },
      ],
    },
    {
      id: 'en-a2-1',
      language: 'english',
      level: 'A2',
      title: '初级进阶：语法基础',
      lessons: [
        { id: 1, title: '过去时入门', type: 'grammar', completed: false },
        { id: 2, title: '常用动词短语', type: 'vocabulary', completed: false },
        { id: 3, title: '描述人物性格', type: 'speaking', completed: false },
        { id: 4, title: '短文听力训练', type: 'listening', completed: false },
      ],
    },
    {
      id: 'en-b1-1',
      language: 'english',
      level: 'B1',
      title: '中级突破：商务英语',
      lessons: [
        { id: 1, title: '邮件写作', type: 'grammar', completed: false },
        { id: 2, title: '会议用语', type: 'speaking', completed: false },
        { id: 3, title: '商务词汇', type: 'vocabulary', completed: false },
        { id: 4, title: '新闻听力', type: 'listening', completed: false },
      ],
    },
  ],
  japanese: [
    {
      id: 'ja-a1-1',
      language: 'japanese',
      level: 'A1',
      title: '日语入门：五十音图',
      lessons: [
        { id: 1, title: '平假名学习', type: 'vocabulary', completed: true },
        { id: 2, title: '片假名学习', type: 'vocabulary', completed: true },
        { id: 3, title: '基础问候语', type: 'speaking', completed: false },
        { id: 4, title: '数字与时间', type: 'vocabulary', completed: false },
        { id: 5, title: '听力小测试', type: 'listening', completed: false },
      ],
    },
    {
      id: 'ja-a2-1',
      language: 'japanese',
      level: 'A2',
      title: '初级日语：语法入门',
      lessons: [
        { id: 1, title: 'は/が助词', type: 'grammar', completed: false },
        { id: 2, title: '动词变形基础', type: 'grammar', completed: false },
        { id: 3, title: '日常对话练习', type: 'speaking', completed: false },
        { id: 4, title: '动漫片段听力', type: 'listening', completed: false },
      ],
    },
    {
      id: 'ja-b1-1',
      language: 'japanese',
      level: 'B1',
      title: '中级日语：敬语与表达',
      lessons: [
        { id: 1, title: '敬语基础', type: 'grammar', completed: false },
        { id: 2, title: '商务日语', type: 'vocabulary', completed: false },
        { id: 3, title: 'NHK新闻听力', type: 'listening', completed: false },
        { id: 4, title: '演讲练习', type: 'speaking', completed: false },
      ],
    },
  ],
  korean: [
    {
      id: 'ko-a1-1',
      language: 'korean',
      level: 'A1',
      title: '韩语入门：韩文字母',
      lessons: [
        { id: 1, title: '韩文基本字母', type: 'vocabulary', completed: true },
        { id: 2, title: '发音规则', type: 'vocabulary', completed: false },
        { id: 3, title: '基础问候语', type: 'speaking', completed: false },
        { id: 4, title: '数字表达', type: 'vocabulary', completed: false },
        { id: 5, title: '听力入门', type: 'listening', completed: false },
      ],
    },
    {
      id: 'ko-a2-1',
      language: 'korean',
      level: 'A2',
      title: '初级韩语：日常语法',
      lessons: [
        { id: 1, title: '句尾助词', type: 'grammar', completed: false },
        { id: 2, title: '敬称与非敬称', type: 'grammar', completed: false },
        { id: 3, title: '购物与点餐', type: 'speaking', completed: false },
        { id: 4, title: '韩剧片段听力', type: 'listening', completed: false },
      ],
    },
    {
      id: 'ko-b1-1',
      language: 'korean',
      level: 'B1',
      title: '中级韩语：深度表达',
      lessons: [
        { id: 1, title: '复杂语法', type: 'grammar', completed: false },
        { id: 2, title: '四字成语', type: 'vocabulary', completed: false },
        { id: 3, title: 'K-Pop歌词解析', type: 'listening', completed: false },
        { id: 4, title: '辩论练习', type: 'speaking', completed: false },
      ],
    },
  ],
};

// ==================== 单词库 ====================
export const VOCABULARY = {
  english: [
    { id: 1, word: 'Hello', pronunciation: '/həˈloʊ/', translation: '你好', example: 'Hello, nice to meet you.', mastered: true },
    { id: 2, word: 'Goodbye', pronunciation: '/ˌɡʊdˈbaɪ/', translation: '再见', example: 'Goodbye, see you tomorrow!', mastered: true },
    { id: 3, word: 'Thank you', pronunciation: '/ˈθæŋk juː/', translation: '谢谢', example: 'Thank you for your help.', mastered: false },
    { id: 4, word: 'Please', pronunciation: '/pliːz/', translation: '请', example: 'Please, have a seat.', mastered: false },
    { id: 5, word: 'Sorry', pronunciation: '/ˈsɑːri/', translation: '对不起', example: 'Sorry for being late.', mastered: false },
    { id: 6, word: 'Friend', pronunciation: '/frend/', translation: '朋友', example: 'She is my best friend.', mastered: false },
    { id: 7, word: 'Family', pronunciation: '/ˈfæməli/', translation: '家人', example: 'My family is small.', mastered: false },
    { id: 8, word: 'School', pronunciation: '/skuːl/', translation: '学校', example: 'I go to school every day.', mastered: false },
    { id: 9, word: 'Work', pronunciation: '/wɜːrk/', translation: '工作', example: 'I work at a bank.', mastered: false },
    { id: 10, word: 'Love', pronunciation: '/lʌv/', translation: '爱', example: 'I love learning languages!', mastered: false },
  ],
  japanese: [
    { id: 1, word: 'こんにちは', pronunciation: 'konnichiwa', translation: '你好', example: 'こんにちは、元気ですか？', mastered: true },
    { id: 2, word: 'さようなら', pronunciation: 'sayounara', translation: '再见', example: 'さようなら、また明日！', mastered: true },
    { id: 3, word: 'ありがとう', pronunciation: 'arigatou', translation: '谢谢', example: 'ありがとうございます。', mastered: false },
    { id: 4, word: 'すみません', pronunciation: 'sumimasen', translation: '对不起/打扰了', example: 'すみません、道を教えてください。', mastered: false },
    { id: 5, word: 'はい', pronunciation: 'hai', translation: '是的', example: 'はい、わかりました。', mastered: false },
    { id: 6, word: '友達', pronunciation: 'tomodachi', translation: '朋友', example: '彼は私の友達です。', mastered: false },
    { id: 7, word: '家族', pronunciation: 'kazoku', translation: '家人', example: '家族と旅行に行きました。', mastered: false },
    { id: 8, word: '学校', pronunciation: 'gakkou', translation: '学校', example: '学校に行きます。', mastered: false },
    { id: 9, word: '仕事', pronunciation: 'shigoto', translation: '工作', example: '仕事が忙しいです。', mastered: false },
    { id: 10, word: '大好き', pronunciation: 'daisuki', translation: '非常喜欢', example: '日本語が大好きです！', mastered: false },
  ],
  korean: [
    { id: 1, word: '안녕하세요', pronunciation: 'annyeonghaseyo', translation: '你好', example: '안녕하세요, 만나서 반갑습니다.', mastered: true },
    { id: 2, word: '안녕히 가세요', pronunciation: 'annyeonghi gaseyo', translation: '再见（对离开的人）', example: '안녕히 가세요, 내일 뵙겠습니다!', mastered: false },
    { id: 3, word: '감사합니다', pronunciation: 'gamshahamnida', translation: '谢谢', example: '도와주셔서 감사합니다.', mastered: false },
    { id: 4, word: '죄송합니다', pronunciation: 'joesonghamnida', translation: '对不起', example: '늦어서 죄송합니다.', mastered: false },
    { id: 5, word: '네', pronunciation: 'ne', translation: '是的', example: '네, 알겠습니다.', mastered: false },
    { id: 6, word: '친구', pronunciation: 'chingu', translation: '朋友', example: '그녀는 제 친구예요.', mastered: false },
    { id: 7, word: '가족', pronunciation: 'gajok', translation: '家人', example: '가족과 함께 지내요.', mastered: false },
    { id: 8, word: '학교', pronunciation: 'hakgyo', translation: '学校', example: '학교에 가고 있어요.', mastered: false },
    { id: 9, word: '일', pronunciation: 'il', translation: '工作', example: '일이 많아요.', mastered: false },
    { id: 10, word: '사랑해요', pronunciation: 'saranghaeyo', translation: '我爱你', example: '한국어 사랑해요!', mastered: false },
  ],
};

// ==================== 语法练习 ====================
export const GRAMMAR_EXERCISES = {
  english: [
    {
      id: 1,
      question: 'She ___ to school every day.',
      options: ['go', 'goes', 'going', 'went'],
      correctIndex: 1,
      explanation: '第三人称单数主语后动词需要加 s/es',
    },
    {
      id: 2,
      question: 'I ___ learning English since 2020.',
      options: ['am', 'was', 'have been', 'had been'],
      correctIndex: 2,
      explanation: '现在完成进行时表示从过去持续到现在的动作',
    },
    {
      id: 3,
      question: 'This book is ___ interesting than that one.',
      options: ['more', 'most', 'much', 'very'],
      correctIndex: 0,
      explanation: '比较级用 more + 形容词原级',
    },
  ],
  japanese: [
    {
      id: 1,
      question: '私は日本語を___。',
      options: ['学ぶ', '学びます', '学んで', '学んだ'],
      correctIndex: 1,
      explanation: 'ます形是礼貌体的标准形式',
    },
    {
      id: 2,
      question: '東京___大阪まで新幹線で行きます。',
      options: ['から', 'まで', 'で', 'に'],
      correctIndex: 0,
      explanation: 'から表示起点，まで表示终点',
    },
    {
      id: 3,
      question: 'このりんごは___安いです。',
      options: ['とても', 'いちばん', 'より', 'まあまあ'],
      correctIndex: 0,
      explanation: 'とても表示程度，"非常"的意思',
    },
  ],
  korean: [
    {
      id: 1,
      question: '저는 한국어___ 배워요.',
      options: ['을', '를', '이', '가'],
      correctIndex: 1,
      explanation: '를用于辅音结尾名词后，宾格助词',
    },
    {
      id: 2,
      question: '오늘은 날씨가 ___ 좋아요.',
      options: ['아주', '가장', '더', '조금'],
      correctIndex: 0,
      explanation: '아주表示"非常"的意思',
    },
    {
      id: 3,
      question: '내일 영화___ 볼 거예요.',
      options: ['을', '를', '에', '에서'],
      correctIndex: 0,
      explanation: '을用于元音结尾名词后，宾格助词',
    },
  ],
};

// ==================== 听力训练 ====================
export const LISTENING_EXERCISES = {
  english: [
    {
      id: 1,
      audioTitle: '日常对话',
      dialogue: ['A: Hi, how are you?', 'B: I\'m great, thanks! How about you?', 'A: Pretty good, just busy with work.'],
      questions: [
        { q: 'How is person A feeling?', options: ['Great', 'Pretty good', 'Tired', 'Sad'], answer: 1 },
        { q: 'What is person A busy with?', options: ['School', 'Family', 'Work', 'Hobbies'], answer: 2 },
      ],
    },
    {
      id: 2,
      audioTitle: '电话留言',
      dialogue: ['"Hello, this is Sarah. I\'m calling about the meeting tomorrow at 3 PM. Please call me back at 555-1234."'],
      questions: [
        { q: 'Who is calling?', options: ['John', 'Sarah', 'Mike', 'Emma'], answer: 1 },
        { q: 'When is the meeting?', options: ['Today', 'Tomorrow at 3 PM', 'Tomorrow at 5 PM', 'Next week'], answer: 1 },
      ],
    },
  ],
  japanese: [
    {
      id: 1,
      audioTitle: '便利店对话',
      dialogue: ['店員: いらっしゃいませ！', '客: おにぎりを一つください。', '店員: かしこまりました。こちらです。'],
      questions: [
        { q: 'お客さんは何を買いましたか？', options: ['パン', 'おにぎり', 'お茶', 'お菓子'], answer: 1 },
        { q: '店員の最初の言葉は？', options: ['ありがとう', 'いらっしゃいませ', 'すみません', 'さようなら'], answer: 1 },
      ],
    },
  ],
  korean: [
    {
      id: 1,
      audioTitle: '咖啡厅对话',
      dialogue: ['직원: 안녕하세요, 뭐 드릴까요?', '손님: 아이스 아메리카노 한 잔 주세요.', '직원: 네, 잠시만 기다려 주세요.'],
      questions: [
        { q: '손님이 주문한 것은?', options: ['라떼', '아이스 아메리카노', '차', '주스'], answer: 1 },
        { q: '직원이 처음 한 말은?', options: ['감사합니다', '안녕하세요', '죄송합니다', '네'], answer: 1 },
      ],
    },
  ],
};

// ==================== 成就系统 ====================
export const ACHIEVEMENTS = [
  { id: 1, title: '初学者', description: '完成第一节课程', icon: '🎯', points: 50, condition: 'complete_first_lesson' },
  { id: 2, title: '勤奋学习者', description: '连续学习7天', icon: '🔥', points: 100, condition: 'streak_7_days' },
  { id: 3, title: '单词达人', description: '掌握100个单词', icon: '📚', points: 150, condition: 'master_100_words' },
  { id: 4, title: '语法小能手', description: '通过50道语法练习', icon: '✏️', points: 100, condition: 'pass_50_grammar' },
  { id: 5, title: '口语新星', description: '完成20次口语练习', icon: '🎤', points: 120, condition: 'speaking_20_times' },
  { id: 6, title: '听力高手', description: '完成30个听力练习', icon: '🎧', points: 100, condition: 'listening_30_times' },
  { id: 7, title: '多语达人', description: '同时学习3种语言', icon: '🌍', points: 200, condition: 'learn_3_languages' },
  { id: 8, title: '社区活跃者', description: '发布10条社区动态', icon: '💬', points: 80, condition: 'post_10_times' },
  { id: 9, title: '分享达人', description: '分享学习笔记', icon: '📝', points: 60, condition: 'share_notes' },
  { id: 10, title: '满分学员', description: '单次练习获得满分', icon: '🏆', points: 200, condition: 'perfect_score' },
];

// ==================== 社区数据 ====================
export const COMMUNITY_POSTS = [
  {
    id: 1,
    user: { name: '小明', avatar: '👨‍🎓', level: 'B1', language: 'english' },
    time: '2小时前',
    content: '今天终于完成了英语中级课程！感谢大家的支持，推荐大家每天坚持学习30分钟，真的很有效果！💪',
    likes: 24,
    isLiked: false,
    comments: [
      { user: '语言爱好者', content: '恭喜你！我也要加油了！' },
      { user: '日语控', content: '太棒了，继续加油！' },
    ],
    tags: ['英语学习', '学习心得'],
  },
  {
    id: 2,
    user: { name: '樱子', avatar: '👩‍🎤', level: 'A2', language: 'japanese' },
    time: '5小时前',
    content: '有喜欢日语的小伙伴吗？一起组队学习N2吧！我的目标是今年年底通过考试~ 🎌',
    likes: 18,
    isLiked: false,
    comments: [
      { user: '动漫迷', content: '我我我！一起加油！' },
    ],
    tags: ['日语', '组队学习', 'N2'],
  },
  {
    id: 3,
    user: { name: '韩语学霸', avatar: '👩‍🏫', level: 'B2', language: 'korean' },
    time: '1天前',
    content: '分享一个小技巧：看韩剧的时候把台词写下来，跟着读一遍，口语进步超快！📺✨',
    likes: 56,
    isLiked: false,
    comments: [
      { user: '新手小白', content: '学到了！明天就试试！' },
      { user: 'K-Pop迷', content: '这个方法真的有效，亲测！' },
      { user: '小明', content: '好建议，感谢分享！' },
    ],
    tags: ['韩语', '学习技巧', '口语练习'],
  },
  {
    id: 4,
    user: { name: '环球旅人', avatar: '🧑‍✈️', level: 'A2', language: 'english' },
    time: '2天前',
    content: '刚从日本回来，发现会说日语真的太有用了！下次计划去韩国，有小伙伴一起学韩语吗？🌏',
    likes: 32,
    isLiked: false,
    comments: [],
    tags: ['旅行', '多语种', '交友'],
  },
];

// ==================== 默认用户进度数据 ====================
export const DEFAULT_USER_PROGRESS = {
  totalStudyTime: 0,
  streakDays: 0,
  lastStudyDate: null,
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
