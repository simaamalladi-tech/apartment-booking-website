import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'alt-berliner-eckkneipe-admin-secret-2026';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

// Generate admin JWT token
export const generateAdminToken = () => {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
};

// Verify admin password
export const verifyAdminPassword = (password) => {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
};

// Middleware to protect admin routes
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default { generateAdminToken, verifyAdminPassword, requireAdmin };
