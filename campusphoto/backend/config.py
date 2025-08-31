"""
配置管理模块
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # 数据库配置
    database_url: str = "postgresql://campusphoto_user:campusphoto_password@localhost:5432/campusphoto"
    
    # JWT 配置
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Cloudflare R2 配置
    r2_endpoint: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "campusphoto-images"
    
    # Redis 配置
    redis_url: str = "redis://localhost:6379"
    
    # 文件上传配置
    max_file_size: int = 10485760  # 10MB
    allowed_extensions: List[str] = ["jpg", "jpeg", "png", "webp"]
    
    # 系统配置
    debug: bool = True
    cors_origins: List[str] = ["http://localhost:3000"]
    
    # 项目信息
    project_name: str = "高校摄影系统"
    version: str = "1.0.0"
    description: str = "Campus Photography System"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# 全局设置实例
settings = Settings()
