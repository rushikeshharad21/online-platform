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
    // Production Mode: Hide internal leaks
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err.message
      });
    } else {
      console.error('🔥 SYSTEM ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went terribly wrong on our infrastructure.',
        error: 'Internal Server Error'
      });
    }
  }
};

export default globalErrorHandler;