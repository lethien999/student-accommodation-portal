const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

// Cấu hình validate file
const fileFilter = (req, file, cb) => {
  // Kiểm tra định dạng file
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WEBP, PDF, DOC, DOCX'), false);
  }
};

// Cấu hình storage cho từng module
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `student-accommodation/${folder}`,
      format: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'png';
      },
      public_id: (req, file) => {
        const timestamp = Date.now();
        const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
        return `${folder}-${timestamp}-${originalName}`;
      },
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    },
  });
};

// Tạo multer instance cho từng module
const createUploader = (folder, maxFiles = 5, maxSize = 5 * 1024 * 1024) => {
  const storage = createStorage(folder);
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize, // 5MB default
      files: maxFiles
    }
  });
};

// Upload middleware cho từng module
const uploadMaintenance = createUploader('maintenance', 10, 10 * 1024 * 1024); // 10 files, 10MB each
const uploadAccommodation = createUploader('accommodation', 10, 5 * 1024 * 1024);
const uploadNews = createUploader('news', 5, 5 * 1024 * 1024);
const uploadAdvertisement = createUploader('advertisement', 3, 5 * 1024 * 1024);
const uploadUserVerification = createUploader('verification', 5, 10 * 1024 * 1024);
const uploadReview = createUploader('reviews', 5, 5 * 1024 * 1024);

// Middleware wrapper với error handling
const createUploadMiddleware = (uploader, fieldName) => {
  return (req, res, next) => {
    console.log('[DEBUG] Upload middleware', { 
      method: req.method, 
      url: req.originalUrl, 
      field: fieldName 
    });
    
    uploader.array(fieldName, 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('[ERROR] Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'File quá lớn. Kích thước tối đa: 5MB cho ảnh, 10MB cho tài liệu' 
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            message: 'Quá nhiều file. Số lượng tối đa: 10 file' 
          });
        }
        return res.status(400).json({ message: 'Lỗi upload file', error: err.message });
      } else if (err) {
        console.error('[ERROR] Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

// Export các middleware cho từng module
module.exports = {
  uploadMaintenance: createUploadMiddleware(uploadMaintenance, 'images'),
  uploadAccommodation: createUploadMiddleware(uploadAccommodation, 'images'),
  uploadNews: createUploadMiddleware(uploadNews, 'image'),
  uploadAdvertisement: createUploadMiddleware(uploadAdvertisement, 'image'),
  uploadUserVerification: createUploadMiddleware(uploadUserVerification, 'documents'),
  uploadReview: createUploadMiddleware(uploadReview, 'images'),
  
  // Single file upload
  uploadSingle: (folder, fieldName) => {
    const uploader = createUploader(folder, 1);
    return createUploadMiddleware(uploader, fieldName);
  },
  
  // Legacy support
  uploadArray: (field, maxCount) => {
    const uploader = createUploader('general', maxCount);
    return createUploadMiddleware(uploader, field);
  }
}; 