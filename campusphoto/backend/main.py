"""
FastAPI 主应用
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os

from config import settings
from models.database import create_tables, get_db
from utils.config_manager import init_config_manager
from routers import auth, users, photos, competitions, appointments, admin, analytics

# 配置日志
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("正在启动高校摄影系统...")
    
    # 创建数据库表
    create_tables()
    logger.info("数据库表创建完成")
    
    # 初始化配置管理器
    db = next(get_db())
    try:
        init_config_manager(db)
        logger.info("配置管理器初始化完成")
    except Exception as e:
        logger.error(f"配置管理器初始化失败: {e}")
    finally:
        db.close()
    
    # 创建上传目录
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("static/thumbnails", exist_ok=True)
    
    logger.info("高校摄影系统启动完成")
    
    yield
    
    # 关闭时
    logger.info("高校摄影系统正在关闭...")


# 创建FastAPI应用
app = FastAPI(
    title=settings.project_name,
    description=settings.description,
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加信任主机中间件
if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app"]
    )

# 静态文件服务
app.mount("/static", StaticFiles(directory="static"), name="static")

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/users", tags=["用户"])
app.include_router(photos.router, prefix="/api/photos", tags=["作品"])
app.include_router(competitions.router, prefix="/api/competitions", tags=["比赛"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["预约"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["分析"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "欢迎使用高校摄影系统 API",
        "version": settings.version,
        "docs": "/docs" if settings.debug else "文档已禁用",
        "status": "运行中"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "campusphoto-backend",
        "version": settings.version
    }


@app.get("/api/config/public")
async def get_public_config():
    """获取公开配置"""
    from .utils.config_manager import get_config_manager
    
    config_manager = get_config_manager()
    
    return {
        "upload": {
            "max_file_size": config_manager.get_max_file_size(),
            "allowed_extensions": config_manager.get_allowed_extensions(),
            "daily_limit": config_manager.get_upload_limit()
        },
        "features": {
            "ai_tagging": config_manager.is_feature_enabled("image_processing"),
            "competitions": True,
            "appointments": True,
            "rankings": True
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )

