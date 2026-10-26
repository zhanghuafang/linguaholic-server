import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { LANGUAGES, VOCABULARY, GRAMMAR_EXERCISES, LISTENING_EXERCISES } from '../data/mockData';
import { useProgress } from '../context/AppContext';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Pencil,
  Mic,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function Practice() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lang = searchParams.get('lang') || 'english';
  const courseId = searchParams.get('courseId');
  const lessonIndex = searchParams.get('lessonIndex');
  const language = LANGUAGES.find(l => l.id === lang);

  if (!type) {
    return <PracticeHome language={language} lang={lang} />;
  }

  const lessonInfo = { language, lang, courseId, lessonIndex };

  const components = {
    vocabulary: <VocabularyPractice {...lessonInfo} />,
    grammar: <GrammarPractice {...lessonInfo} />,
    speaking: <SpeakingPractice {...lessonInfo} />,
    listening: <ListeningPractice {...lessonInfo} />,
  };

  const titles = {
    vocabulary: { title: '单词记忆', icon: '📚', desc: '科学记忆法，高效背单词' },
    grammar: { title: '语法练习', icon: '✏️', desc: '精选语法题，系统学习' },
    speaking: { title: '口语跟读', icon: '🎤', desc: 'AI 语音评测，纠正发音' },
    listening: { title: '听力训练', icon: '🎧', desc: '沉浸式听力场景训练' },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-slate-600 hover:text-slate-800 flex items-center gap-2 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className={`${language?.gradient} rounded-2xl p-6 text-white mb-6`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{language?.flag}</span>
          <div>
            <p className="text-white/80 text-sm">{titles[type]?.icon} {language?.name}</p>
            <h1 className="text-2xl font-bold">{titles[type]?.title}</h1>
            <p className="text-white/90 text-sm mt-1">{titles[type]?.desc}</p>
          </div>
        </div>
      </div>

      {components[type]}
    </div>
  );
}

function PracticeHome({ language, lang }) {
  const navigate = useNavigate();

  const practiceTypes = [
    {
      type: 'vocabulary',
      icon: <BookOpen className="w-8 h-8" />,
      title: '单词记忆',
      desc: '间隔重复算法，让单词记得更牢',
      color: 'from-purple-500 to-pink-500',
    },
    {
      type: 'grammar',
      icon: <Pencil className="w-8 h-8" />,
      title: '语法练习',
      desc: '精选习题，巩固语法基础',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      type: 'speaking',
      icon: <Mic className="w-8 h-8" />,
      title: '口语跟读',
      desc: '模拟真实场景，练就地道口语',
      color: 'from-orange-500 to-red-500',
    },
    {
      type: 'listening',
      icon: <Headphones className="w-8 h-8" />,
      title: '听力训练',
      desc: '多场景对话，提升听力理解',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">练习中心</h1>
        <p className="text-slate-600">选择练习类型，开始你的沉浸式学习之旅</p>
      </div>

      {/* Language selector */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">选择语言</h3>
        <div className="flex gap-3 flex-wrap">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => navigate(`/practice?lang=${l.id}`)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all ${
                l.id === lang
                  ? `${l.gradient} text-white shadow-lg`
                  : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {practiceTypes.map((pt) => (
          <div
            key={pt.type}
            onClick={() => navigate(`/practice/${pt.type}?lang=${lang}`)}
            className="learn-card bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm"
          >
            <div className={`bg-gradient-to-r ${pt.color} p-6 text-white`}>
              {pt.icon}
              <h3 className="text-xl font-bold mt-3">{pt.title}</h3>
              <p className="text-white/90 text-sm mt-1">{pt.desc}</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">每天 15 分钟</span>
                <button className="text-primary-600 font-semibold text-sm flex items-center gap-1">
                  开始练习 →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 单词记忆 ====================
function VocabularyPractice({ language, lang, courseId, lessonIndex }) {
  const words = VOCABULARY[lang] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState([]);
  const [unknownWords, setUnknownWords] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { completeLesson, masterWord, markLessonCompleted } = useProgress();

  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const currentWord = words[currentIndex];

  const speakWord = (text) => {
    if (isSpeechSupported) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'english' ? 'en-US' : lang === 'japanese' ? 'ja-JP' : 'ko-KR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKnown = () => {
    masterWord();
    setKnownWords([...knownWords, currentWord.id]);
    nextWord();
  };

  const handleUnknown = () => {
    setUnknownWords([...unknownWords, currentWord.id]);
    nextWord();
  };

  const nextWord = () => {
    if (currentIndex + 1 >= words.length) {
      completeLesson('vocabulary');
      if (courseId !== null && courseId !== undefined && lessonIndex !== null && lessonIndex !== undefined) markLessonCompleted(lang, courseId, parseInt(lessonIndex), 'vocabulary');
      setSessionComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownWords([]);
    setUnknownWords([]);
    setSessionComplete(false);
  };

  if (sessionComplete) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">练习完成！</h2>
        <p className="text-slate-600 mb-6">
          认识 <span className="text-green-600 font-bold">{knownWords.length}</span> 个，
          需复习 <span className="text-orange-500 font-bold">{unknownWords.length}</span> 个
        </p>
        <button
          onClick={restart}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          继续练习
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {words.length}
        </span>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">✓ {knownWords.length}</span>
          <span className="text-orange-500">✗ {unknownWords.length}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="bg-white rounded-3xl shadow-xl min-h-64 p-8 cursor-pointer select-none perspective-1000"
      >
        <div className="text-center">
          {!isFlipped ? (
            <div className="animate-fade-in">
              <p className="text-4xl font-bold text-slate-800 mb-4">{currentWord.word}</p>
              <p className="text-slate-500 text-lg mb-4">{currentWord.pronunciation}</p>
              {isSpeechSupported ? (
                <button
                  onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word); }}
                  className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full hover:bg-primary-100 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                  播放发音
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-full text-sm">
                  <Volume2 className="w-5 h-5" />
                  浏览器不支持语音播放
                </span>
              )}
              <p className="text-sm text-slate-400 mt-8">👆 点击卡片查看释义</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <p className="text-3xl font-bold text-primary-600 mb-4">{currentWord.translation}</p>
              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-slate-500 text-sm mb-2">例句</p>
                <p className="text-slate-700 italic">"{currentWord.example}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleUnknown}
          className="flex-1 bg-white border-2 border-orange-300 text-orange-500 py-4 rounded-2xl font-semibold hover:bg-orange-50 transition-colors inline-flex items-center justify-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          不认识
        </button>
        <button
          onClick={handleKnown}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          认识
        </button>
      </div>
    </div>
  );
}

// ==================== 语法练习 ====================
function GrammarPractice({ language, lang, courseId, lessonIndex }) {
  const exercises = GRAMMAR_EXERCISES[lang] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { completeLesson, markLessonCompleted } = useProgress();

  const currentExercise = exercises[currentIndex];

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === currentExercise.correctIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= exercises.length) {
      completeLesson('grammar');
      if (courseId !== null && courseId !== undefined && lessonIndex !== null && lessonIndex !== undefined) markLessonCompleted(lang, courseId, parseInt(lessonIndex), 'grammar');
      setSessionComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSessionComplete(false);
  };

  if (sessionComplete) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">练习完成！</h2>
        <div className="my-6">
          <div className="text-5xl font-bold text-primary-600 mb-2">{percentage}%</div>
          <p className="text-slate-600">
            答对 {score} / {exercises.length} 题
          </p>
        </div>
        <button
          onClick={restart}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          再练一次
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">
          第 {currentIndex + 1} / {exercises.length} 题
        </span>
        <span className="text-sm font-semibold text-primary-600">得分: {score}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
          style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-semibold text-slate-600">语法选择题</span>
        </div>
        <p className="text-xl font-medium text-slate-800 mb-6 leading-relaxed">
          {currentExercise.question}
        </p>

        <div className="space-y-3">
          {currentExercise.options.map((option, index) => {
            const isCorrect = index === currentExercise.correctIndex;
            const isSelected = selectedAnswer === index;
            let bgClass = 'bg-slate-50 hover:bg-slate-100';
            
            if (showResult) {
              if (isCorrect) {
                bgClass = 'bg-green-100 border-green-300';
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-red-100 border-red-300';
              } else {
                bgClass = 'bg-slate-50 opacity-60';
              }
            } else if (isSelected) {
              bgClass = 'bg-primary-100 border-primary-300';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${bgClass} ${
                  showResult || 'cursor-pointer'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 font-medium">{option}</span>
                {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-fade-in">
          <p className="font-semibold text-blue-800 mb-1">💡 解析</p>
          <p className="text-blue-700 text-sm">{currentExercise.explanation}</p>
        </div>
      )}

      <button
        onClick={nextQuestion}
        disabled={!showResult}
        className={`w-full py-4 rounded-xl font-semibold transition-all ${
          showResult
            ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:shadow-lg'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {currentIndex + 1 >= exercises.length ? '查看结果' : '下一题 →'}
      </button>
    </div>
  );
}

// ==================== 口语跟读 ====================
function SpeakingPractice({ language, lang, courseId, lessonIndex }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [practiceLog, setPracticeLog] = useState([]);
  const { completeLesson, markLessonCompleted } = useProgress();

  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const sampleSentences = {
    english: [
      { en: "Hello, nice to meet you.", zh: "你好，很高兴认识你" },
      { en: "How are you today?", zh: "你今天好吗" },
      { en: "I love learning languages.", zh: "我喜欢学习语言" },
      { en: "What's your favorite book?", zh: "你最喜欢的书是什么" },
      { en: "Let's go for a walk.", zh: "我们去散步吧" },
    ],
    japanese: [
      { en: "こんにちは、元気ですか？", zh: "你好，身体好吗？" },
      { en: "日本語が大好きです。", zh: "我非常喜欢日语" },
      { en: "毎日勉強しています。", zh: "每天都在学习" },
      { en: "週末に友達と会います。", zh: "周末和朋友见面" },
      { en: "美味しい料理を食べました。", zh: "吃了美味的料理" },
    ],
    korean: [
      { en: "안녕하세요, 만나서 반갑습니다.", zh: "你好，很高兴认识你" },
      { en: "한국어를 배우고 있어요.", zh: "正在学习韩语" },
      { en: "매일 공부하고 있어요.", zh: "每天都在学习" },
      { en: "주말에 친구를 만나요.", zh: "周末见朋友" },
      { en: "맛있는 음식을 먹었어요.", zh: "吃了好吃的食物" },
    ],
  };

  const sentences = sampleSentences[lang] || sampleSentences.english;
  const currentSentence = sentences[currentIndex];

  const speakSentence = () => {
    if (isSpeechSupported) {
      const utterance = new SpeechSynthesisUtterance(currentSentence.en);
      utterance.lang = lang === 'english' ? 'en-US' : lang === 'japanese' ? 'ja-JP' : 'ko-KR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setLastScore(null);
    
    // 模拟录音和评分（实际中应使用 Web Speech API 的 recognition）
    setTimeout(() => {
      setIsRecording(false);
      const score = Math.floor(Math.random() * 30) + 70; // 70-100分
      setLastScore(score);
      completeLesson('speaking');
      if (courseId !== null && courseId !== undefined && lessonIndex !== null && lessonIndex !== undefined) markLessonCompleted(lang, courseId, parseInt(lessonIndex), 'speaking');
      setPracticeLog([...practiceLog, score]);
    }, 2000);
  };

  const nextSentence = () => {
    if (currentIndex + 1 < sentences.length) {
      setCurrentIndex(currentIndex + 1);
      setLastScore(null);
    }
  };

  const scoreColor = lastScore >= 90 ? 'text-green-500' : lastScore >= 80 ? 'text-yellow-500' : 'text-orange-500';
  const scoreLabel = lastScore >= 90 ? '非常棒！' : lastScore >= 80 ? '不错哦' : '继续加油';

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">
          {currentIndex + 1} / {sentences.length}
        </span>
        {practiceLog.length > 0 && (
          <span className="text-sm font-semibold text-orange-500">
            平均 {Math.round(practiceLog.reduce((a, b) => a + b, 0) / practiceLog.length)} 分
          </span>
        )}
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
          style={{ width: `${(currentIndex / sentences.length) * 100}%` }}
        />
      </div>

      {/* Sentence card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-6">
        <p className="text-sm text-slate-500 mb-4">请跟读下面的句子</p>
        
        <div className="mb-6">
          <p className="text-3xl font-bold text-slate-800 mb-2 leading-relaxed">
            {currentSentence.en}
          </p>
          <p className="text-slate-500">{currentSentence.zh}</p>
        </div>

        {isSpeechSupported ? (
          <button
            onClick={speakSentence}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-5 py-2.5 rounded-full hover:bg-primary-100 transition-colors mb-6"
          >
            <Volume2 className="w-5 h-5" />
            听原声
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 px-5 py-2.5 rounded-full text-sm mb-6">
            <Volume2 className="w-5 h-5" />
            浏览器不支持语音播放
          </span>
        )}

        {/* Record button */}
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`w-24 h-24 rounded-full text-white font-semibold transition-all mx-auto ${
            isRecording
              ? 'bg-red-500 animate-pulse'
              : 'bg-gradient-to-br from-orange-500 to-red-500 hover:shadow-xl hover:scale-105'
          }`}
        >
          <Mic className="w-10 h-10 mx-auto" />
          <span className="text-xs mt-1 block">{isRecording ? '录音中...' : '点击录音'}</span>
        </button>

        {/* Score display */}
        {lastScore !== null && (
          <div className="mt-6 animate-fade-in">
            <div className={`text-5xl font-bold ${scoreColor} mb-2`}>{lastScore}</div>
            <p className="text-slate-600">{scoreLabel}</p>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(lastScore / 20) ? 'text-yellow-400' : 'text-slate-300'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-xl font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          上一句
        </button>
        <button
          onClick={nextSentence}
          disabled={currentIndex >= sentences.length - 1}
          className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
        >
          下一句
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ==================== 听力训练 ====================
function ListeningPractice({ language, lang, courseId, lessonIndex }) {
  const exercises = LISTENING_EXERCISES[lang] || [];
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [dialogueShown, setDialogueShown] = useState(false);
  const { completeLesson, markLessonCompleted } = useProgress();

  const currentExercise = exercises[currentExerciseIndex];
  const currentQuestion = currentExercise?.questions[currentQuestionIndex];

  const handleAnswer = (index) => {
    if (showAnswer) return;
    setSelectedAnswer(index);
    setShowAnswer(true);
    if (index === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const nextStep = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex + 1 < currentExercise.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentExerciseIndex + 1 < exercises.length) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentQuestionIndex(0);
      setDialogueShown(false);
    } else {
      completeLesson('listening');
      if (courseId !== null && courseId !== undefined && lessonIndex !== null && lessonIndex !== undefined) markLessonCompleted(lang, courseId, parseInt(lessonIndex), 'listening');
      setSessionComplete(true);
    }
  };

  const restart = () => {
    setCurrentExerciseIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setSessionComplete(false);
    setDialogueShown(false);
  };

  if (sessionComplete) {
    const totalQuestions = exercises.reduce((acc, e) => acc + e.questions.length, 0);
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">听力训练完成！</h2>
        <div className="my-6">
          <div className="text-5xl font-bold text-green-500 mb-2">{percentage}%</div>
          <p className="text-slate-600">
            答对 {score} / {totalQuestions} 题
          </p>
        </div>
        <button
          onClick={restart}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          再练一次
        </button>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
        <Headphones className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">该语言暂无听力练习</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500">
          对话 {currentExerciseIndex + 1} / {exercises.length}
        </span>
        <span className="text-sm font-semibold text-green-600">得分: {score}</span>
      </div>

      {/* Audio card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-slate-700">{currentExercise.audioTitle}</span>
          </div>
          <button
            onClick={() => setDialogueShown(!dialogueShown)}
            className="text-sm text-primary-600 hover:underline"
          >
            {dialogueShown ? '隐藏文字稿' : '显示文字稿'}
          </button>
        </div>

        {/* Fake audio player */}
        <div className="bg-slate-900 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors">
              <Volume2 className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full w-1/3" />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0:00</span>
                <span>0:30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dialogue (if shown) */}
        {dialogueShown && (
          <div className="bg-slate-50 rounded-xl p-4 animate-fade-in">
            {currentExercise.dialogue.map((line, i) => (
              <p key={i} className="text-slate-700 py-1">{line}</p>
            ))}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-semibold text-slate-600">
            问题 {currentQuestionIndex + 1} / {currentExercise.questions.length}
          </span>
        </div>
        <p className="text-lg font-medium text-slate-800 mb-6">{currentQuestion.q}</p>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.answer;
            const isSelected = selectedAnswer === index;
            let bgClass = 'bg-slate-50 hover:bg-slate-100';
            
            if (showAnswer) {
              if (isCorrect) {
                bgClass = 'bg-green-100 border-green-300';
              } else if (isSelected && !isCorrect) {
                bgClass = 'bg-red-100 border-red-300';
              } else {
                bgClass = 'bg-slate-50 opacity-60';
              }
            } else if (isSelected) {
              bgClass = 'bg-primary-100 border-primary-300';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showAnswer}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${bgClass} ${
                  showAnswer || 'cursor-pointer'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 font-medium">{option}</span>
                {showAnswer && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {showAnswer && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={nextStep}
        disabled={!showAnswer}
        className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all ${
          showAnswer
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {currentQuestionIndex + 1 >= currentExercise.questions.length &&
        currentExerciseIndex + 1 >= exercises.length
          ? '查看结果'
          : '下一题 →'}
      </button>
    </div>
  );
}
