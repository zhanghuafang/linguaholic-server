// API 客户端 — 统一处理 fetch + token + 错误
const API_BASE = import.meta.env.VITE_API_URL || ''; // 开发为空（走 vite proxy），生产指向 Render/Vercel

// 把浏览器原生英文错误转成用户能懂的中文
function friendlyError(err) {
  const msg = (err?.message || err || '').toString().toLowerCase();
  if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
    return '无法连接到服务器，请检查网络或稍后重试';
  }
  if (msg.includes('timeout')) {
    return '请求超时，请检查网络连接';
  }
  if (msg.includes('aborted')) {
    return '请求已取消';
  }
  return err?.message || '请求失败';
}

export function getToken() {
  return localStorage.getItem('linguaholic_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('linguaholic_token', token);
  } else {
    localStorage.removeItem('linguaholic_token');
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: 'no-cache' });
  } catch (e) {
    // 网络层错误（被墙、断网、DNS 失败等）
    throw new Error(friendlyError(e));
  }

  // 先读后端返回体（即使是 4xx/5xx 也可能有 error 字段）
  const data = await res.json().catch(() => ({}));

  // 401 只针对需要 token 的接口（login/register 本身不带 token，401 是业务错误）
  if (res.status === 401) {
    // 只有当前请求带了 token 才清除（说明是 token 过期）
    if (token) setToken(null);
    // 优先显示后端真实错误，否则友好提示
    throw new Error(data.error || (token ? '登录已过期，请重新登录' : friendlyError(new Error('unauthorized'))));
  }

  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`);
  }
  return data;
}

// ===== Auth =====
export const authApi = {
  register: (username, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ===== Posts =====
export const postsApi = {
  list: () => request('/api/posts'),
  create: (content, language, tags) =>
    request('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content, language, tags }),
    }),
  toggleLike: (postId) =>
    request(`/api/posts/${postId}/like`, { method: 'POST' }),
  addComment: (postId, content) =>
    request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

// ===== Progress =====
export const progressApi = {
  get: () => request('/api/progress'),
  update: (data) =>
    request('/api/progress', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  addStudy: (minutes, lessonType) =>
    request('/api/progress/add-study', {
      method: 'POST',
      body: JSON.stringify({ minutes, lessonType }),
    }),
};
