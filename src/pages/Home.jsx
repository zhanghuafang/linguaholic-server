import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/AppContext';
import { LANGUAGES, ACHIEVEMENTS } from '../data/mockData';
import { useAuth } from '../context/AppContext';
import {
  Play,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Sparkles,
  Flame,
  Clock,
} from 'lucide-react';

export default function Home() {
  const { progress } = useProgress();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <LandingPage />;
  }

  const completedAchievements = ACHIEVEMENTS.filter(a => progress.badges.includes(a.id));
  const xpToNextLevel = progress.level * 500;
  const xpProgress = (progress.xpPoints / xpToNextLevel) * 100;

  // 推荐继续学习的语言
  const recommendedLanguage = Object.entries(progress.languageProgress).sort(
    (a, b) => b[1].progress - a[1].progress
  )[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 p-6 animate-fade-in">
      {/* Header stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          欢迎回来，{user.username}！ 👋
        </h1>
        <p className="text-slate-600">今天也要坚持学习哦，你的连续学习天数：{progress.streakDays}天 🔥</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Clock className="w-6 h-6 text-primary-500" />}
          label="总学习时长"
          value={`${progress.totalStudyTime}分钟`}
          bgColor="bg-primary-50"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-accent-500" />}
          label="已学单词"
          value={progress.wordsLearned.toString()}
          bgColor="bg-accent-50"
        />
        <StatCard
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          label="连续天数"
          value={`${progress.streakDays}天`}
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-yellow-500" />}
          label="成就徽章"
          value={completedAchievements.length.toString()}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Level progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
              Lv.{progress.level}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">学习等级</h3>
              <p className="text-sm text-slate-500">经验值：{progress.xpPoints} / {xpToNextLevel}</p>
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-primary-500" />
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Continue learning */}
      {recommendedLanguage && (
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <p className="text-white/80 text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              继续学习
            </p>
            <h2 className="text-2xl font-bold mb-4">
              {LANGUAGES.find(l => l.id === recommendedLanguage[0])?.name} - {recommendedLanguage[1].level}
            </h2>
            <p className="text-white/90 mb-4">
              进度：{recommendedLanguage[1].progress}%
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              继续学习
            </Link>
          </div>
        </div>
      )}

      {/* Language cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">选择学习语言</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => {
            const langProgress = progress.languageProgress[lang.id];
            return (
              <div
                key={lang.id}
                onClick={() => navigate(`/courses?lang=${lang.id}`)}
                className="learn-card cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className={`${lang.gradient} h-24 p-4 flex items-center justify-between`}>
                  <div>
                    <span className="text-4xl">{lang.flag}</span>
                    <h3 className="text-white font-bold text-lg mt-1">{lang.name}</h3>
                  </div>
                  {langProgress && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {langProgress.level}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-500 mb-3">{lang.description}</p>
                  {langProgress ? (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>已学习进度</span>
                        <span>{langProgress.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${langProgress.progress}%`, backgroundColor: lang.color }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button className="w-full py-2 text-sm text-primary-600 font-semibold hover:bg-primary-50 rounded-lg transition-colors">
                      开始学习 →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">快捷练习</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={<Target className="w-6 h-6 text-white" />}
            label="单词记忆"
            path="/practice/vocabulary"
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <QuickAction
            icon={<BookOpen className="w-6 h-6 text-white" />}
            label="语法练习"
            path="/practice/grammar"
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <QuickAction
            icon={<Play className="w-6 h-6 text-white" />}
            label="口语跟读"
            path="/practice/speaking"
            color="bg-gradient-to-br from-orange-500 to-red-500"
          />
          <QuickAction
            icon={<Award className="w-6 h-6 text-white" />}
            label="听力训练"
            path="/practice/listening"
            color="bg-gradient-to-br from-green-500 to-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-2xl p-4`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function QuickAction({ icon, label, path, color }) {
  return (
    <Link
      to={path}
      className="learn-card bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm"
    >
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </Link>
  );
}

// ==================== Landing Page (when not logged in) ====================
function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-accent-500 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-9xl">🌏</div>
          <div className="absolute bottom-10 right-10 text-8xl">📚</div>
          <div className="absolute top-1/2 right-1/4 text-6xl">✨</div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">沉浸式多语种学习体验</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            开启你的
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              语言之旅
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            英语、日语、韩语一站搞定。AI 智能推荐、互动式练习、社区学习，让语言学习变得轻松有趣。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              免费开始学习
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white/10 backdrop-blur border border-white/30 px-8 py-3 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
            >
              已有账号，登录
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">为什么选择 Linguaholic？</h2>
        <p className="text-center text-slate-600 mb-12">六大核心功能，打造沉浸式学习体验</p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🎯', title: '分级课程体系', desc: 'A1到C1，科学分级，循序渐进' },
            { icon: '🎮', title: '互动式学习', desc: '单词、语法、口语、听力全面练习' },
            { icon: '📊', title: '进度追踪', desc: '可视化学习数据，清晰掌握成长轨迹' },
            { icon: '🤖', title: '个性化推荐', desc: 'AI 智能分析，定制专属学习路径' },
            { icon: '👥', title: '社区交流', desc: '与全球学习者一起组队进步' },
            { icon: '🏆', title: '成就激励', desc: '徽章、等级、排行榜，让学习上瘾' },
          ].map((f) => (
            <div key={f.title} className="learn-card bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Languages preview */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">支持学习的语言</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {LANGUAGES.map((lang) => (
              <div key={lang.id} className={`${lang.gradient} rounded-2xl p-8 text-white text-center`}>
                <span className="text-6xl block mb-4">{lang.flag}</span>
                <h3 className="text-2xl font-bold mb-2">{lang.name}</h3>
                <p className="text-white/90">{lang.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">准备好开始学习了吗？</h2>
        <p className="text-slate-600 mb-8">注册账号，立即解锁所有功能</p>
        <button
          onClick={() => navigate('/register')}
          className="bg-gradient-to-r from-primary-600 to-accent-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-shadow"
        >
          立即免费注册 →
        </button>
      </div>
    </div>
  );
}
