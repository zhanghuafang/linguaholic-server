import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, LEVELS } from '../data/mockData';
import { useProgress } from '../context/AppContext';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

// 模拟水平测试题目
const PLACEMENT_QUESTIONS = {
  english: [
    {
      level: 'A1',
      question: 'What is the color of the sky on a clear day?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      correctIndex: 1,
    },
    {
      level: 'A2',
      question: 'She ___ to school every day.',
      options: ['go', 'goes', 'going', 'went'],
      correctIndex: 1,
    },
    {
      level: 'B1',
      question: 'If I ___ rich, I would travel the world.',
      options: ['am', 'was', 'were', 'be'],
      correctIndex: 2,
    },
    {
      level: 'B2',
      question: 'The report ___ by next Friday.',
      options: ['will finish', 'will be finished', 'is finishing', 'has finished'],
      correctIndex: 1,
    },
    {
      level: 'C1',
      question: 'Not only ___ late, but he also forgot the documents.',
      options: ['he was', 'was he', 'did he', 'he did'],
      correctIndex: 1,
    },
  ],
  japanese: [
    {
      level: 'A1',
      question: 'こんにちはは、何の意味ですか？',
      options: ['さようなら', 'ありがとう', '你好', 'すみません'],
      correctIndex: 2,
    },
    {
      level: 'A2',
      question: '私は毎日日本語を___。',
      options: ['学ぶ', '学びます', '学んだ', '学んで'],
      correctIndex: 1,
    },
    {
      level: 'B1',
      question: 'もし時間があれば、映画を___に行きます。',
      options: ['見る', '見', '見た', '見て'],
      correctIndex: 1,
    },
    {
      level: 'B2',
      question: 'この仕事は経験者___応募できます。',
      options: ['だけ', 'なら', 'より', 'ほど'],
      correctIndex: 0,
    },
    {
      level: 'C1',
      question: '彼の話はあまりにも突飛で、誰も___いなかった。',
      options: ['信じて', '信じようとして', '信じられずに', '信じさせて'],
      correctIndex: 2,
    },
  ],
  korean: [
    {
      level: 'A1',
      question: '안녕하세요는 무슨 뜻인가요?',
      options: ['감사합니다', '你好', '안녕히가세요', '죄송합니다'],
      correctIndex: 1,
    },
    {
      level: 'A2',
      question: '저는 한국어를 매일___.',
      options: ['배워요', '배웠어요', '배울 거예요', '배우고 있어요'],
      correctIndex: 0,
    },
    {
      level: 'B1',
      question: '오늘 날씨가 정말___.',
      options: ['좋아요', '좋았어요', '좋을 거예요', '좋고'],
      correctIndex: 0,
    },
    {
      level: 'B2',
      question: '이 문제는 학생들___ 조금 어려울 수 있어요.',
      options: ['한테', '에게', '한테서', '으로'],
      correctIndex: 0,
    },
    {
      level: 'C1',
      question: '그는 너무나도 충격을___ 말을 잇지 못했다.',
      options: ['받아', '받은', '받고', '받아서'],
      correctIndex: 3,
    },
  ],
};

export default function Placement() {
  const { setLanguageLevel, progress } = useProgress();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [correctLevels, setCorrectLevels] = useState([]);
  const [estimatedLevel, setEstimatedLevel] = useState(null);

  const questions = selectedLang ? PLACEMENT_QUESTIONS[selectedLang] : [];
  const currentQuestion = questions[currentLevelIndex];

  const handleStartTest = (langId) => {
    setSelectedLang(langId);
    setCurrentLevelIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTestComplete(false);
    setCorrectLevels([]);
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectLevels([...correctLevels, currentQuestion.level]);
    }
  };

  const nextLevel = () => {
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;

    if (!isCorrect || currentLevelIndex + 1 >= questions.length) {
      // 测试结束，计算级别并存入 progress
      const level = getEstimatedLevel();
      setEstimatedLevel(level);
      setTestComplete(true);
      // 立即写入 progress.languageProgress
      if (selectedLang) {
        setLanguageLevel(selectedLang, level);
      }
    } else {
      // 如果答对了，继续测试更高等级
      setCurrentLevelIndex(currentLevelIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const getEstimatedLevel = () => {
    if (correctLevels.length === 0) return 'A1';
    return correctLevels[correctLevels.length - 1];
  };

  const restart = () => {
    setSelectedLang(null);
    setCurrentLevelIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTestComplete(false);
    setCorrectLevels([]);
  };

  // Language selection screen
  if (!selectedLang) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">语言水平测试</h1>
            <p className="text-slate-600 max-w-lg mx-auto">
              通过5道精选题目，我们将为你推荐最适合的学习起点。测试大约需要3-5分钟。
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="font-semibold text-slate-800 mb-4">为什么要做水平测试？</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🎯', title: '精准定位', desc: '找到真正适合你的起点' },
                { icon: '⚡', title: '高效学习', desc: '避免重复学习已会的内容' },
                { icon: '📈', title: '个性推荐', desc: '获得专属学习路径' },
              ].map((item) => (
                <div key={item.title} className="text-center p-4">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Language selection */}
          <h3 className="font-semibold text-slate-700 mb-4">选择要测试的语言</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {LANGUAGES.map((lang) => {
              const existingLevel = progress.languageProgress?.[lang.id]?.level;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleStartTest(lang.id)}
                  className={`${lang.gradient} rounded-2xl p-6 text-white text-left hover:shadow-xl transition-all hover:scale-105 relative`}
                >
                  {existingLevel && (
                    <div className="absolute top-3 right-3 bg-white/25 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full">
                      已测 · {existingLevel}
                    </div>
                  )}
                  <div className="text-5xl mb-3">{lang.flag}</div>
                  <h4 className="text-xl font-bold mb-1">{lang.name}</h4>
                  <p className="text-white/90 text-sm mb-4">{lang.description}</p>
                  <div className="flex items-center gap-2 font-semibold">
                    {existingLevel ? '重新测试' : '开始测试'}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (testComplete) {
    const estimatedLevel = getEstimatedLevel();
    const levelInfo = LEVELS.find((l) => l.id === estimatedLevel);
    const lang = LANGUAGES.find((l) => l.id === selectedLang);

    return (
      <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">测试完成！</h2>
            <p className="text-slate-600 mb-6">
              根据你的表现，我们为你推荐以下等级开始学习
            </p>

            <div
              className={`${lang.gradient} rounded-2xl p-6 text-white mb-6`}
            >
              <div className="text-4xl mb-2">{lang.flag}</div>
              <p className="text-white/90 mb-2">{lang.name}</p>
              <div
                className="text-5xl font-bold mb-2"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
              >
                {estimatedLevel}
              </div>
              <p className="text-sm">{levelInfo?.name} · {levelInfo?.description}</p>
            </div>

            {/* Level visualization */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-1">
                {LEVELS.map((level) => {
                  const achieved = correctLevels.includes(level.id);
                  const isRecommended = level.id === estimatedLevel;
                  return (
                    <div key={level.id} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          achieved
                            ? 'bg-green-500 text-white'
                            : isRecommended
                            ? 'bg-primary-500 text-white ring-4 ring-primary-200'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {achieved || isRecommended ? level.id : '·'}
                      </div>
                      {level.id !== 'C1' && (
                        <div className={`w-6 h-0.5 ${achieved ? 'bg-green-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={restart}
                className="flex-1 py-3 rounded-xl font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                重新测试
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                开始学习
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test screen
  const lang = LANGUAGES.find((l) => l.id === selectedLang);

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{lang.flag}</span>
            <span className="font-semibold text-slate-700">{lang.name}水平测试</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">当前等级测试：</span>
            <span className="font-bold text-primary-600">{currentQuestion.level}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
              style={{ width: `${((currentLevelIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                backgroundColor: LEVELS.find((l) => l.id === currentQuestion.level)?.color + '20',
                color: LEVELS.find((l) => l.id === currentQuestion.level)?.color,
              }}
            >
              {currentQuestion.level}
            </span>
            <span className="text-sm text-slate-500">请选择正确答案</span>
          </div>

          <p className="text-xl font-medium text-slate-800 mb-6 leading-relaxed">
            {currentQuestion.question}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctIndex;
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
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${bgClass}`}
                >
                  <span className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 font-medium">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={nextLevel}
          disabled={!showResult}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            showResult
              ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {showResult ? '继续 →' : '请选择答案'}
        </button>
      </div>
    </div>
  );
}
