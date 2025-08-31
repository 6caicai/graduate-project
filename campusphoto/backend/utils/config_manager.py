"""
动态配置管理器
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models.models import Configuration
from models.database import get_db
import json
import logging

logger = logging.getLogger(__name__)


class ConfigManager:
    """配置管理器"""
    
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._load_default_configs()
    
    def _load_default_configs(self):
        """加载默认配置"""
        self._cache = {
            # 上传限制配置
            "daily_upload_limit": {"value": 5, "enabled": True},
            "max_file_size": {"value": 10485760, "enabled": True},  # 10MB
            "allowed_extensions": {"value": ["jpg", "jpeg", "png", "webp"], "enabled": True},
            
            # 排行榜权重配置
            "ranking_weights": {
                "like": 1.0,
                "favorite": 2.0,
                "vote": 3.0,
                "view": 0.5,
                "comment": 1.5,
                "time_decay": 0.9
            },
            
            # 比赛规则配置
            "competition_rules": {
                "max_submissions_per_user": 3,
                "min_voting_period_hours": 24,
                "allow_late_submissions": False,
                "require_approval": True
            },
            
            # 角色权限配置
            "role_permissions": {
                "student": {
                    "can_upload": True,
                    "can_vote": True,
                    "can_comment": True,
                    "can_report": True
                },
                "photographer": {
                    "can_upload": True,
                    "can_vote": True,
                    "can_comment": True,
                    "can_review": True,
                    "can_manage_appointments": True
                },
                "admin": {
                    "can_manage_users": True,
                    "can_manage_competitions": True,
                    "can_manage_configs": True,
                    "can_view_analytics": True
                }
            },
            
            # 预约系统配置
            "appointment_settings": {
                "advance_booking_days": 30,
                "max_daily_appointments": 5,
                "cancellation_hours": 24,
                "auto_confirm": False
            },
            
            # 图像处理配置
            "image_processing": {
                "auto_generate_thumbnails": True,
                "thumbnail_sizes": [150, 300, 600],
                "enable_ai_tagging": True,
                "ai_confidence_threshold": 0.6
            },
            
            # 通知配置
            "notification_settings": {
                "email_notifications": True,
                "push_notifications": False,
                "digest_frequency": "daily"
            },
            
            # 安全配置
            "security_settings": {
                "max_login_attempts": 5,
                "lockout_duration_minutes": 30,
                "password_min_length": 6,
                "require_email_verification": True
            }
        }
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值"""
        return self._cache.get(key, default)
    
    def set(self, key: str, value: Any, db: Session) -> bool:
        """设置配置值"""
        try:
            # 更新缓存
            self._cache[key] = value
            
            # 更新数据库
            config = db.query(Configuration).filter(Configuration.key == key).first()
            if config:
                config.value = value if isinstance(value, dict) else {"value": value}
            else:
                config = Configuration(
                    key=key,
                    value=value if isinstance(value, dict) else {"value": value},
                    description=f"配置项: {key}"
                )
                db.add(config)
            
            db.commit()
            logger.info(f"配置更新: {key} = {value}")
            return True
            
        except Exception as e:
            logger.error(f"配置更新失败: {key}, 错误: {str(e)}")
            db.rollback()
            return False
    
    def load_from_db(self, db: Session):
        """从数据库加载配置"""
        try:
            configs = db.query(Configuration).filter(Configuration.is_active == True).all()
            
            for config in configs:
                self._cache[config.key] = config.value
            
            logger.info(f"从数据库加载了 {len(configs)} 个配置项")
            
        except Exception as e:
            logger.error(f"从数据库加载配置失败: {str(e)}")
    
    def reload(self, db: Session):
        """重新加载配置"""
        self._load_default_configs()
        self.load_from_db(db)
        logger.info("配置已重新加载")
    
    def get_all(self) -> Dict[str, Any]:
        """获取所有配置"""
        return self._cache.copy()
    
    def get_category(self, category: str) -> Dict[str, Any]:
        """获取指定分类的配置"""
        result = {}
        for key, value in self._cache.items():
            if key.startswith(category):
                result[key] = value
        return result
    
    # 便捷方法
    def get_upload_limit(self) -> int:
        """获取每日上传限制"""
        config = self.get("daily_upload_limit", {"value": 5, "enabled": True})
        return config.get("value", 5) if config.get("enabled", True) else 999
    
    def get_ranking_weights(self) -> Dict[str, float]:
        """获取排行榜权重配置"""
        return self.get("ranking_weights", {
            "like": 1.0, "favorite": 2.0, "vote": 3.0, 
            "view": 0.5, "comment": 1.5, "time_decay": 0.9
        })
    
    def get_competition_rules(self) -> Dict[str, Any]:
        """获取比赛规则配置"""
        return self.get("competition_rules", {
            "max_submissions_per_user": 3,
            "min_voting_period_hours": 24,
            "allow_late_submissions": False,
            "require_approval": True
        })
    
    def get_role_permissions(self, role: str) -> Dict[str, bool]:
        """获取角色权限配置"""
        all_permissions = self.get("role_permissions", {})
        return all_permissions.get(role, {})
    
    def is_feature_enabled(self, feature: str) -> bool:
        """检查功能是否启用"""
        config = self.get(feature)
        if isinstance(config, dict):
            return config.get("enabled", True)
        return bool(config)
    
    def get_max_file_size(self) -> int:
        """获取最大文件大小"""
        config = self.get("max_file_size", {"value": 10485760, "enabled": True})
        return config.get("value", 10485760) if config.get("enabled", True) else 10485760
    
    def get_allowed_extensions(self) -> list:
        """获取允许的文件扩展名"""
        config = self.get("allowed_extensions", {"value": ["jpg", "jpeg", "png", "webp"], "enabled": True})
        return config.get("value", ["jpg", "jpeg", "png", "webp"]) if config.get("enabled", True) else []


# 全局配置管理器实例
config_manager = ConfigManager()


def init_config_manager(db: Session):
    """初始化配置管理器"""
    config_manager.load_from_db(db)


def get_config_manager() -> ConfigManager:
    """获取配置管理器实例"""
    return config_manager

