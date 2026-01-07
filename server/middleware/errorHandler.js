const AppError = require('../utils/AppError');

const handleSequelizeError = (err) => {
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(e => e.message).join('; ');
        return AppError.validationError(message);
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(err.fields)[0];
        return AppError.conflict(`${field} already exists`);
    }
    return err;
};

const handleJWTError = () => AppError.unauthorized('Invalid token. Please log in again.', 'INVALID_TOKEN');

const handleJWTExpiredError = () => AppError.unauthorized('Your token has expired! Please log in again.', 'TOKEN_EXPIRED');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak details
    else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (err.name?.startsWith('Sequelize')) error = handleSequelizeError(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
