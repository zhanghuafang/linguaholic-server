// Workers 认证模块 — 用 Web Crypto API 替代 bcryptjs + jsonwebtoken
// Workers 原生支持 crypto.subtle，零依赖

// ===== 密码哈希（SHA-256 + salt）=====
export async function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(16));
  }
  const enc = new TextEncoder();
  const data = enc.encode(salt + ':' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashHex = bufferToHex(hash);
  const saltHex = bufferToHex(salt);
  return `${saltHex}.${hashHex}`;
}

export async function verifyPassword(password, stored) {
  const [saltHex, _] = stored.split('.');
  const salt = hexToBuffer(saltHex);
  const enc = new TextEncoder();
  const data = enc.encode(salt + ':' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashHex = bufferToHex(hash);
  return stored === `${saltHex}.${hashHex}`;
}

function bufferToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

// ===== 简易 JWT（HS256）=====
export async function signToken(payload, secret, expiresSec = 7 * 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresSec };

  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(body));
  const signingInput = `${h}.${p}`;

  const signature = await hmacSign(signingInput, secret);
  return `${signingInput}.${base64url(signature)}`;
}

export async function verifyToken(token, secret) {
  try {
    const [h, p, sig] = token.split('.');
    const signingInput = `${h}.${p}`;
    const expectedSig = await hmacSign(signingInput, secret);
    if (base64url(expectedSig) !== sig) return null;

    const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hmacSign(data, secretStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', key, enc.encode(data));
}

function base64url(str) {
  const buf = str instanceof ArrayBuffer ? str : new TextEncoder().encode(str);
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ===== 鉴权中间件（在路由里手动调用）=====
export async function authFromRequest(request, JWT_SECRET) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verifyToken(token, JWT_SECRET);
}

// ===== HTTP 响应 =====
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', ...headers },
  });
}

export function text(text, status = 200) {
  return new Response(text, {
    status,
    headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
  });
}
