"""
开发环境配置文件
"""

# 数据库配置
DATABASE_URL = "postgresql://campusphoto_user:campusphoto_password@localhost:5432/campusphoto"

# JWT 配置
SECRET_KEY = "dev-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Redis 配置
REDIS_URL = "redis://localhost:6379"

# 文件上传配置
MAX_FILE_SIZE = 10485760  # 10MB
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]

# 系统配置
DEBUG = True
CORS_ORIGINS = ["http://localhost:3000"]

# 开发模式不需要Cloudflare R2配置
R2_ENDPOINT = ""
R2_ACCESS_KEY_ID = ""
R2_SECRET_ACCESS_KEY = ""
R2_BUCKET_NAME = ""



