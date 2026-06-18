import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // तुमच्या 'user.js' फाईलचा अचूक पाथ

// 🔑 १. युझर लॉग-इन आहे की नाही हे तपासण्यासाठी (Authentication)
export const protect = async (req, res, next) => {
  let token;

  // कुकीज किंवा ऑथ हेडरमधून टोकन काढणे
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, please login to get access' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

// 🛡️ २. युझरचा रोल (Instructor/Admin) तपासण्यासाठी (Authorization)
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // जर युझरचा रोल परवानगी दिलेल्या लिस्टमध्ये नसेल तर ब्लॉक करा
    // (उदा. जर फक्त 'instructor' ला परवानगी असेल आणि लॉग-इन युझर 'student' असेल)
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};