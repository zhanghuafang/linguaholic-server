import { useProgress } from '../context/AppContext';
import { LANGUAGES } from '../data/mockData';
import {
  TrendingUp,
  Clock,
  Target,
  Calendar,
  BookOpen,
  Award,
  Flame,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';

export default function Progress() {
  const { progress } = useProgress();

  const totalMinutes = progress.totalStudyTime;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  // 计算周统计
  const weeklyTotal = progress.weeklyActivity.reduce((sum, d) => sum + d.minutes, 0);
  const weeklyGoal = 120; // 假设周目标
  const weeklyPercentage = Math.min((weeklyTotal / weeklyGoal) * 100, 100);
  const maxMinutes = Math.max(...progress.weeklyActivity.map(d => d.minutes));

  // 计算单词掌握率
  const wordMasterRate = progress.wordsLearned > 0
    ? Math.round((progress.wordsMastered / progress.wordsLearned) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">学习进度追踪</h1>
        <p className="text-slate-600">可视化数据，清晰掌握你的成长轨迹</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Clock className="w-6 h-6 text-primary-500" />}
          label="总学习时长"
          value={`${hours}h ${mins}m`}
          trend="+12%"
          trendUp
        />
        <StatCard
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          label="连续学习"
          value={`${progress.streakDays}天`}
          trend="保持"
          trendUp
        />
        <StatCard
          icon={<Target className="w-6 h-6 text-green-500" />}
          label="单词掌握率"
          value={`${wordMasterRate}%`}
          trend="+8%"
          trendUp
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-yellow-500" />}
          label="等级"
          value={`Lv.${progress.level}`}
          trend={`${progress.xpPoints} XP`}
          trendUp
        />
      </div>

      {/* Weekly activity chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            <h2 className="font-bold text-lg text-slate-800">本周学习时长</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">本周目标</p>
            <p className="font-bold text-slate-800">{weeklyTotal} / {weeklyGoal} 分钟</p>
          </div>
        </div>

        {/* Weekly goal progress */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
            style={{ width: `${weeklyPercentage}%` }}
          />
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between gap-2 h-48">
          {progress.weeklyActivity.map((day, i) => {
            const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
            const isToday = i === progress.weeklyActivity.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-slate-700">{day.minutes}</div>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isToday
                      ? 'bg-gradient-to-t from-primary-500 to-accent-500'
                      : 'bg-gradient-to-t from-slate-400 to-slate-300'
                  }`}
                  style={{ height: `${Math.max(height, 5)}%`, minHeight: '10px' }}
                />
                <div className={`text-xs ${isToday ? 'font-bold text-primary-600' : 'text-slate-500'}`}>
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-accent-500" />
          <h2 className="font-bold text-lg text-slate-800">语言学习进度</h2>
        </div>

        <div className="space-y-6">
          {Object.entries(progress.languageProgress).map(([langId, langProgress]) => {
            const lang = LANGUAGES.find(l => l.id === langId);
            if (!lang) return null;
            
            return (
              <div key={langId} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                  {lang.flag}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{lang.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: lang.color + '20', color: lang.color }}
                      >
                        {langProgress.level}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600 font-semibold">
                      {langProgress.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${langProgress.progress}%`,
                        backgroundColor: lang.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>今日已学 {langProgress.todayStudied} 分钟</span>
                    <span>·</span>
                    <span>目标 {langProgress.dailyGoal} 分钟</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: lang.color }}>
                    {Math.round((langProgress.todayStudied / langProgress.dailyGoal) * 100)}%
                  </div>
                  <div className="text-xs text-slate-500">今日目标</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed stats grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Learning breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-primary-500" />
            <h2 className="font-bold text-lg text-slate-800">学习内容统计</h2>
          </div>
          <div className="space-y-4">
            <ProgressBar label="已学单词" value={progress.wordsLearned} total={100} color="bg-purple-500" />
            <ProgressBar label="已掌握单词" value={progress.wordsMastered} total={50} color="bg-green-500" />
            <ProgressBar label="语法练习完成" value={progress.grammarCompleted} total={30} color="bg-blue-500" />
            <ProgressBar label="口语练习次数" value={progress.speakingPractice} total={20} color="bg-orange-500" />
            <ProgressBar label="听力练习完成" value={progress.listeningCompleted} total={25} color="bg-emerald-500" />
          </div>
        </div>

        {/* Streak & motivation */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-6 h-6" />
            <h2 className="font-bold text-lg">连续学习</h2>
          </div>
          <div className="text-5xl font-bold mb-2">{progress.streakDays} 天</div>
          <p className="text-white/90 mb-6">保持连续学习，解锁更多奖励！</p>
          
          {/* Next milestones */}
          <div className="space-y-3">
            {[7, 14, 30, 60].map((milestone) => {
              const achieved = progress.streakDays >= milestone;
              return (
                <div key={milestone} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      achieved ? 'bg-white text-orange-500' : 'bg-white/20 text-white/80'
                    }`}
                  >
                    {achieved ? '✓' : milestone}
                  </div>
                  <span className={achieved ? 'font-semibold' : 'text-white/80'}>
                    连续 {milestone} 天学习
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Personalized tips */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <LineChartIcon className="w-6 h-6 text-accent-500" />
          <h2 className="font-bold text-lg text-slate-800">学习建议</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: '每日目标', desc: '建议每天至少学习20分钟，保持学习连续性' },
            { icon: '📚', title: '单词记忆', desc: '使用间隔重复法，每天复习前一天的单词' },
            { icon: '🎤', title: '口语练习', desc: '大声跟读并录音对比，提升发音准确度' },
          ].map((tip) => (
            <div key={tip.title} className="p-4 rounded-xl bg-slate-50">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <h4 className="font-semibold text-slate-800 mb-1">{tip.title}</h4>
              <p className="text-sm text-slate-600">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className={`text-xs font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = Math.min((value / total) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value} / {total}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
