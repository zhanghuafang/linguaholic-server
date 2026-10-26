import { useState, useEffect } from 'react';
import { LANGUAGES } from '../data/mockData';
import { useAuth } from '../context/AppContext';
import { postsApi } from '../api/client';
import {
  MessageCircle,
  Heart,
  Share2,
  Send,
  Hash,
  Plus,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
} from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filterLang, setFilterLang] = useState('all');
  const [showComposer, setShowComposer] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedLang, setSelectedLang] = useState('english');
  const [loading, setLoading] = useState(false);

  // 页面加载时从后端拉帖子
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await postsApi.list();
      if (data && Array.isArray(data) && data.length > 0) {
        setPosts(data);
      }
    } catch {
      // 后端不可用，保持 mock 数据
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId) => {
    // 乐观更新
    const prevPosts = posts;
    setPosts(
      posts.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      })
    );
    try {
      const res = await postsApi.toggleLike(postId);
      // 用后端返回纠正
      setPosts((current) =>
        current.map((post) =>
          post.id === postId ? { ...post, isLiked: res.isLiked, likes: res.likes } : post
        )
      );
    } catch {
      // 回滚
      setPosts(prevPosts);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await postsApi.create(newPost, selectedLang, []);
      setPosts([res, ...posts]);
      setNewPost('');
      setShowComposer(false);
    } catch (e) {
      alert(e.message || '发帖失败，请重试');
    }
  };

  const filteredPosts =
    filterLang === 'all' ? posts : posts.filter((p) => p.user.language === filterLang);

  const hotTags = ['英语学习', '日语入门', '韩语基础', '口语练习', '组队学习', '学习心得'];

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">学习社区</h1>
            <p className="text-slate-600">与全球学习者一起进步</p>
          </div>
          <button
            onClick={() => setShowComposer(true)}
            className="bg-gradient-to-r from-primary-600 to-accent-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            发帖
          </button>
        </div>

        {/* Filter & Tags */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">按语言筛选</span>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setFilterLang('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterLang === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部
            </button>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setFilterLang(lang.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                  filterLang === lang.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {hotTags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-full cursor-pointer hover:bg-primary-50 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
              >
                <Hash className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats — 装饰性占位，后端暂未提供统计接口 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-primary-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="font-bold text-lg">--</span>
            </div>
            <p className="text-xs text-slate-500">在线学习者</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-accent-500 mb-1">
              <MessageCircle className="w-4 h-4" />
              <span className="font-bold text-lg">{posts.length}</span>
            </div>
            <p className="text-xs text-slate-500">动态总数</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold text-lg">--</span>
            </div>
            <p className="text-xs text-slate-500">活跃增长</p>
          </div>
        </div>

        {/* Post list */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={() => handleLike(post.id)} />
          ))}
          {filteredPosts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">该语言暂无动态，快来发第一条吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowComposer(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-slate-800 mb-4">发布新动态</h3>

            <div className="mb-4">
              <label className="text-sm text-slate-600 mb-2 block">相关语言</label>
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedLang === lang.id
                        ? `${lang.gradient} text-white`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="分享你的学习心得、问题或组队邀请..."
              className="w-full h-32 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setShowComposer(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                取消
              </button>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className={`px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 transition-all ${
                  newPost.trim()
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments);

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await postsApi.addComment(post.id, newComment);
      setComments([...comments, res]);
      setNewComment('');
    } catch (e) {
      alert(e.message || '评论失败，请重试');
    }
  };

  const lang = LANGUAGES.find((l) => l.id === post.user.language);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* User info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-xl">
          {post.user.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{post.user.name}</span>
            <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-semibold">
              {post.user.level}
            </span>
            {lang && <span className="text-sm">{lang.flag}</span>}
          </div>
          <p className="text-xs text-slate-500">{post.time}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${
            post.isLiked
              ? 'text-red-500 hover:text-red-600'
              : 'text-slate-500 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{post.likes}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{comments.length}</span>
        </button>
        <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">分享</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
          {comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-sm flex-shrink-0">
                    {c.user[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">{c.user}</span>
                    <p className="text-sm text-slate-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写评论..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                newComment.trim()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
