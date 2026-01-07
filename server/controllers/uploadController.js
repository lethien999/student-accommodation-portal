const uploadService = require('../services/UploadService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = catchAsync(async (req, res, next) => {
    // Determine folder from query or default to 'temp'
    const folder = req.query.folder || 'temp';

    // Create middleware dynamically based on folder
    const uploadMiddleware = uploadService.single('image', folder);

    // Execute middleware manually to handle errors wrapper
    uploadMiddleware(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(AppError.badRequest('File too large. Max size is 5MB'));
            }
            return next(err);
        }

        if (!req.file) {
            return next(AppError.badRequest('Please upload a file'));
        }

        const url = uploadService.getFileUrl(req, req.file, folder);

        res.json({
            success: true,
            url,
            filename: req.file.filename
        });
    });
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadImages = catchAsync(async (req, res, next) => {
    const folder = req.query.folder || 'temp';
    const uploadMiddleware = uploadService.array('images', folder, 10);

    uploadMiddleware(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(AppError.badRequest('Files too large. Max size is 5MB'));
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(AppError.badRequest('Too many files. Max is 10'));
            }
            return next(err);
        }

        if (!req.files || req.files.length === 0) {
            return next(AppError.badRequest('Please upload files'));
        }

        const urls = req.files.map(file => uploadService.getFileUrl(req, file, folder));

        res.json({
            success: true,
            count: urls.length,
            urls
        });
    });
});

module.exports = {
    uploadImage,
    uploadImages
};
