/**
 * AppError - Custom Error class cho application
 * Tuân thủ SRP: Chỉ chịu trách nhiệm xử lý application errors
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    // Factory methods - tuân thủ OCP (có thể extend mà không sửa code)

    static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
        return new AppError(message, 400, errorCode);
    }

    static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
        return new AppError(message, 401, errorCode);
    }

    static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN') {
        return new AppError(message, 403, errorCode);
    }

    static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        return new AppError(message, 404, errorCode);
    }

    static conflict(message = 'Resource already exists', errorCode = 'CONFLICT') {
        return new AppError(message, 409, errorCode);
    }

    static validationError(message = 'Validation failed', errorCode = 'VALIDATION_ERROR') {
        return new AppError(message, 422, errorCode);
    }

    static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
        return new AppError(message, 500, errorCode);
    }

    // Convert to JSON response format
    toJSON() {
        return {
            success: false,
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            errorCode: this.errorCode,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }
}

module.exports = AppError;
