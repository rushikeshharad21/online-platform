// backend/middlewares/errorMiddleware.js

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: युझरपासून अंतर्गत सिस्टीम डिटेल्स लपवा
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('🔥 SYSTEM ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went terribly wrong on our infrastructure.',
      });
    }
  }
};

export default globalErrorHandler;