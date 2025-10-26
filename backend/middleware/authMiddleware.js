const jwt = require('jsonwebtoken');
const { serverStartTime } = require('../config/serverConfig'); // Import the start time

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send("A token is required for authentication");
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- NEW CHECK ---
    // 'iat' (issued at) is a standard JWT claim in seconds. We compare it to the server start time.
    if (decoded.iat * 1000 < serverStartTime) {
        return res.status(401).send("Session expired due to server restart. Please log in again.");
    }
    // --- END OF NEW CHECK ---

    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = auth;