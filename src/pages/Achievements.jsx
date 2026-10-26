import { ACHIEVEMENTS } from '../data/mockData';
import { useProgress } from '../context/AppContext';
import {
  Award,
  Lock,
  Trophy,
  Star,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react';

export default function Achievements() {
  const { progress } = useProgress();
  const earnedCount = progress.badges.length;
  const totalCount = ACHIEVEMENTS.length;
  const totalPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = ACHIEVEMENTS.filter((a) => progress.badges.includes(a.id)).reduce(
    (sum, a) => sum + a.points,
    0
  );

  const earnedAchievements = ACHIEVEMENTS.filter((a) => progress.badges.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter((a) => !progress.badges.includes(a.id));

  const completionRate = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">成就与激励</h1>
        <p className="text-slate-600">完成挑战，解锁成就，见证你的成长</p>
      </div>

      {/* Overall progress card */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <h2 className="text-2xl font-bold">我的成就墙</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-4xl font-bold">{earnedCount}/{totalCount}</div>
              <div className="text-sm text-white/90">已解锁成就</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{earnedPoints}</div>
              <div className="text-sm text-white/90">获得积分</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{totalPoints - earnedPoints}</div>
              <div className="text-sm text-white/90">剩余积分</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{completionRate}%</div>
              <div className="text-sm text-white/90">完成率</div>
            </div>
          </div>

          {/* Progress ring visualization */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earned achievements */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-slate-800">已解锁成就</h2>
          <span className="text-sm text-slate-500">({earnedAchievements.length})</span>
        </div>

        {earnedAchievements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Lock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">还没有解锁任何成就</p>
            <p className="text-sm text-slate-400">开始学习，解锁你的第一个成就吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} earned />
            ))}
          </div>
        )}
      </div>

      {/* Locked achievements */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800">待解锁成就</h2>
          <span className="text-sm text-slate-500">({lockedAchievements.length})</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lockedAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* XP & Level */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current level progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-yellow-500" />
            <h3 className="font-bold text-slate-800">等级进度</h3>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="progress-ring w-full h-full">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress.xpPoints / (progress.level * 500)) * 264} 264`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">Lv.{progress.level}</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm text-slate-500 mb-2">当前经验</div>
              <div className="text-2xl font-bold text-slate-800 mb-2">
                {progress.xpPoints} / {progress.level * 500}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  style={{ width: `${(progress.xpPoints / (progress.level * 500)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next milestones */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-primary-500" />
            <h3 className="font-bold text-slate-800">下一步目标</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { icon: '📅', task: '连续学习 7 天', progress: Math.min((progress.streakDays / 7) * 100, 100), label: `${progress.streakDays}/7 天` },
              { icon: '📚', task: '掌握 50 个单词', progress: Math.min((progress.wordsMastered / 50) * 100, 100), label: `${progress.wordsMastered}/50` },
              { icon: '🎤', task: '完成 20 次口语练习', progress: Math.min((progress.speakingPractice / 20) * 100, 100), label: `${progress.speakingPractice}/20` },
              { icon: '🎧', task: '完成 30 个听力练习', progress: Math.min((progress.listeningCompleted / 30) * 100, 100), label: `${progress.listeningCompleted}/30` },
            ].map((goal) => (
              <div key={goal.task}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-700 flex items-center gap-2">
                    <span>{goal.icon}</span>
                    {goal.task}
                  </span>
                  <span className="text-xs text-slate-500">{goal.label}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard teaser */}
      <div className="mt-8 bg-gradient-to-r from-accent-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">排行榜</h3>
              <p className="text-white/90 text-sm">与全球学习者竞争，登上排行榜！</p>
            </div>
          </div>
          <button className="bg-white text-accent-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            查看排行榜
          </button>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, earned }) {
  return (
    <div
      className={`rounded-2xl p-4 text-center transition-all ${
        earned
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:scale-105'
          : 'bg-slate-50 border border-slate-200 opacity-60'
      }`}
    >
      <div
        className={`text-4xl mb-2 relative ${
          !earned && 'grayscale'
        }`}
      >
        {earned ? achievement.icon : <Lock className="w-10 h-10 text-slate-400 mx-auto" />}
      </div>
      <h4 className={`font-semibold text-sm mb-1 ${earned ? 'text-slate-800' : 'text-slate-500'}`}>
        {achievement.title}
      </h4>
      <p className="text-xs text-slate-500 mb-2 min-h-[32px]">{achievement.description}</p>
      <div
        className={`text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
          earned ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-500'
        }`}
      >
        <Star className="w-3 h-3" />
        +{achievement.points}
      </div>
    </div>
  );
}
