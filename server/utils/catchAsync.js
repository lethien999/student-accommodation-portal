/**
 * CatchAsync - Wrapper cho async functions để bắt lỗi tự động
 * Thay thế try-catch block lặp lại trong controllers
 * @param {Function} fn - Async middleware function
 */
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
