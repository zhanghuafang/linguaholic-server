import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LANGUAGES, LEVELS, COURSES } from '../data/mockData';
import { useProgress } from '../context/AppContext';
import { BookOpen, Play, CheckCircle2, Circle, ChevronRight, Sparkles, Award } from 'lucide-react';

export default function Courses() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { progress, updateLanguageProgress, isLessonCompleted } = useProgress();
  const [selectedLang, setSelectedLang] = useState(searchParams.get('lang') || 'english');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    const lang = searchParams.get('lang');
    if (lang && LANGUAGES.find(l => l.id === lang)) {
      setSelectedLang(lang);
    }
  }, [searchParams]);

  // activeCourse 更新时，用 progress 里的真实完成状态覆盖
  useEffect(() => {
    if (activeCourse) {
      setActiveCourse((prev) => ({
        ...prev,
        lessons: prev.lessons.map((lesson, idx) => ({
          ...lesson,
          completed: isLessonCompleted(selectedLang, prev.id, idx),
        })),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completedLessonKeys]);

  // 用 progress 里的真实完成状态覆盖 mock 数据（只信 progress，mock 的 completed 只是占位）
  const language = LANGUAGES.find(l => l.id === selectedLang);
  const courses = (COURSES[selectedLang] || []).map((course) => ({
    ...course,
    lessons: course.lessons.map((lesson, idx) => ({
      ...lesson,
      completed: isLessonCompleted(selectedLang, course.id, idx),
    })),
  }));
  const filteredCourses = selectedLevel === 'all'
    ? courses
    : courses.filter(c => c.level === selectedLevel);

  const openCourse = (course) => {
    setActiveCourse(course);
  };

  const startLesson = (lesson, courseId, lessonIndex) => {
    updateLanguageProgress(selectedLang, 25, 15);
    navigate(`/practice/${lesson.type}?lang=${selectedLang}&courseId=${courseId}&lessonIndex=${lessonIndex}`);
  };

  if (activeCourse) {
    return <CourseDetail course={activeCourse} onBack={() => setActiveCourse(null)} onStartLesson={startLesson} language={language} selectedLang={selectedLang} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">分级课程体系</h1>
        <p className="text-slate-600">科学分级，循序渐进，从入门到精通</p>
      </div>

      {/* Language selector */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">选择语言</h3>
        <div className="flex gap-3 flex-wrap">
          {LANGUAGES.map((lang) => {
            const active = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLang(lang.id);
                  setSelectedLevel('all');
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all ${
                  active
                    ? `${lang.gradient} text-white shadow-lg scale-105`
                    : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">难度等级</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedLevel === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            全部
          </button>
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedLevel === level.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              style={selectedLevel !== 'all' && selectedLevel !== level.id ? {} : undefined}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: level.color }} />
              {level.id} {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* Level legend */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          CEFR 语言能力分级标准
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {LEVELS.map((level) => (
            <div key={level.id} className="text-center p-3 rounded-xl bg-slate-50">
              <div
                className="text-xl font-bold mb-1"
                style={{ color: level.color }}
              >
                {level.id}
              </div>
              <div className="font-medium text-slate-800 text-sm">{level.name}</div>
              <div className="text-xs text-slate-500 mt-1">{level.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Course list */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {language?.name} 课程 ({filteredCourses.length})
        </h2>
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">该等级暂无课程，敬请期待~</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const completedLessons = course.lessons.filter(l => l.completed).length;
              const progress = (completedLessons / course.lessons.length) * 100;
              const level = LEVELS.find(l => l.id === course.level);
              
              return (
                <div
                  key={course.id}
                  onClick={() => openCourse(course)}
                  className="learn-card bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                >
                  <div className={`${language?.gradient} p-6`}>
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white"
                      >
                        {course.level}
                      </span>
                      <span className="text-white/80 text-sm">
                        {course.lessons.length} 节课
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-500">完成进度</span>
                          <span className="font-semibold text-slate-700">
                            {completedLessons}/{course.lessons.length}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {getLessonTypeIcons(course.lessons.slice(0, 4))}
                      </div>
                      <button className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
                        查看课程
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Personalized recommendation */}
      <div className="mt-12 bg-gradient-to-r from-accent-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">智能学习推荐</h3>
            <p className="text-white/90 mb-4">
              根据你的学习进度，建议优先完成 <strong>{language?.name} A2 初级进阶课程</strong>，
              重点练习语法和听力模块，这将帮助你更快提升。
            </p>
            <button
              onClick={() => navigate('/placement')}
              className="bg-white text-accent-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              进行水平测试 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getLessonTypeIcons(lessons) {
  const iconMap = {
    vocabulary: '📚',
    grammar: '✏️',
    speaking: '🎤',
    listening: '🎧',
  };
  return lessons.map((lesson, i) => (
    <span key={i} className="text-sm" title={lesson.title}>
      {iconMap[lesson.type] || '📖'}
    </span>
  ));
}

// Course detail view
function CourseDetail({ course, onBack, onStartLesson, language, selectedLang }) {
  const level = LEVELS.find(l => l.id === course.level);
  const completedLessons = course.lessons.filter(l => l.completed).length;
  const progress = (completedLessons / course.lessons.length) * 100;

  const typeLabel = {
    vocabulary: { icon: '📚', name: '单词记忆', color: 'bg-purple-100 text-purple-700' },
    grammar: { icon: '✏️', name: '语法练习', color: 'bg-blue-100 text-blue-700' },
    speaking: { icon: '🎤', name: '口语跟读', color: 'bg-orange-100 text-orange-700' },
    listening: { icon: '🎧', name: '听力训练', color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 text-slate-600 hover:text-slate-800 flex items-center gap-2 font-medium"
      >
        ← 返回课程列表
      </button>

      {/* Course header */}
      <div className={`${language?.gradient} rounded-2xl p-8 text-white mb-6`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20">{course.level}</span>
          <span className="text-white/80 text-sm flex items-center gap-1">
            <Award className="w-4 h-4" />
            {level?.name}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <div className="flex items-center gap-6 mt-4 text-white/90">
          <span>📚 {course.lessons.length} 节课</span>
          <span>✅ {completedLessons} 已完成</span>
          <span>📊 {Math.round(progress)}% 进度</span>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Lessons list */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-800 mb-4">课程大纲</h2>
        <div className="space-y-3">
          {course.lessons.map((lesson, index) => {
            const type = typeLabel[lesson.type];
            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-primary-300 hover:bg-primary-50 ${
                  lesson.completed ? 'bg-green-50 border-green-200' : 'border-slate-100'
                }`}
                onClick={() => onStartLesson(lesson, course.id, index)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  lesson.completed ? 'bg-green-500' : 'bg-slate-300'
                }`}>
                  {lesson.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{lesson.title}</h4>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${type?.color}`}>
                    {type?.icon} {type?.name}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
