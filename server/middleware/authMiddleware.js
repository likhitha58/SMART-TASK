// Dummy token check middleware (replace with JWT later)
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (token === 'Bearer dummy_token') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized. Token missing or invalid' });
  }
};

export { authenticate };
