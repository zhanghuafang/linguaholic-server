const jwt = require('jsonwebtoken');

// 生产环境用环境变量覆盖
const JWT_SECRET = process.env.JWT_SECRET || 'linguaholic-dev-secret-key-change-in-prod';
const JWT_EXPIRES_IN = '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
}

module.exports = { signToken, authMiddleware, JWT_SECRET };
