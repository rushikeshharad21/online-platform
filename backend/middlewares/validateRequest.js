import AppError from '../utils/appError.js';

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
    return next(new AppError(`Validation Failed: ${errorMessages}`, 400));
  }
  req.body = result.data;
  next();
};

export default validateRequest;