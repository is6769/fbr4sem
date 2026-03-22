const jwt = require('jsonwebtoken');
const SECRET = 'secret_key';
const REFRESH_SECRET = 'refresh_secret_key';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = authMiddleware;
module.exports.SECRET = SECRET;
module.exports.REFRESH_SECRET = REFRESH_SECRET;
module.exports.roleMiddleware = roleMiddleware;
