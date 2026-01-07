const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

/**
 * UploadService - Quản lý việc upload file (sử dụng Multer)
 * Có thể mở rộng để support S3/Cloud storage sau này (OCP)
 */
class UploadService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads');

        // Ensure directories exist
        this._ensureDir(path.join(this.uploadDir, 'accommodations'));
        this._ensureDir(path.join(this.uploadDir, 'avatars'));
        this._ensureDir(path.join(this.uploadDir, 'temp'));
    }

    _ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Cấu hình Storage Engine cho Multer
     * @param {String} subFolder - Folder con để lưu file (vd: 'accommodations', 'avatars')
     */
    _getStorage(subFolder) {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                const dest = path.join(this.uploadDir, subFolder);
                this._ensureDir(dest);
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                // Tạo tên file unique: fieldname-timestamp-random.ext
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });
    }

    /**
     * File Filter - Chỉ cho phép ảnh
     */
    _fileFilter(req, file, cb) {
        // Allowed extensions
        const filetypes = /jpeg|jpg|png|gif|webp/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new AppError('Only images are allowed (jpeg, jpg, png, gif, webp)', 400), false);
        }
    }

    /**
     * Tạo middleware upload cho 1 file
     * @param {String} fieldName - Tên field trong FormData
     * @param {String} subFolder - Folder lưu trữ
     */
    single(fieldName, subFolder = 'temp') {
        const upload = multer({
            storage: this._getStorage(subFolder),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
            fileFilter: this._fileFilter
        });
        return upload.single(fieldName);
    }

    /**
     * Tạo middleware upload cho nhiều file
     * @param {String} fieldName 
     * @param {String} subFolder 
     * @param {Number} maxCount 
     */
    array(fieldName, subFolder = 'temp', maxCount = 10) {
        const upload = multer({
            storage: this._getStorage(subFolder),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
            fileFilter: this._fileFilter
        });
        return upload.array(fieldName, maxCount);
    }

    /**
     * Lấy URL công khai của file sau khi upload
     * @param {Object} req - Express request
     * @param {Object} file - Multer file object
     * @param {String} subFolder 
     */
    getFileUrl(req, file, subFolder) {
        // Construct public URL: http://localhost:5000/uploads/subFolder/filename
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}/uploads/${subFolder}/${file.filename}`;
    }
}

module.exports = new UploadService();
