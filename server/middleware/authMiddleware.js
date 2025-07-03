import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🚫 Missing or invalid Authorization header');
    return res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('🔍 Verifying token using secret:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token verified. Decoded user:', decoded);
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth Header (verifyToken):', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🚫 No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('🔍 Verifying token using secret (verifyToken):', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token verified (verifyToken). Decoded:', decoded);
    next();
  } catch (err) {
    console.log('❌ Token verification failed (verifyToken):', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};
