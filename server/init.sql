-- Initialize database with proper charset
ALTER DATABASE student_accommodation CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Grant all privileges to root user
GRANT ALL PRIVILEGES ON student_accommodation.* TO 'root'@'%';
FLUSH PRIVILEGES;
