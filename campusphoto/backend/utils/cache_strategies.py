"""
Redis 缓存策略实现模块
适配 M4 MacBook Air 单机部署环境
"""
import redis
import json
import asyncio
import time
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from functools import wraps
import logging
from sqlalchemy.orm import Session

from config import settings
from models.database import get_db
from models.models import Photo, User

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RedisCacheManager:
    """Redis缓存管理器"""
    
    def __init__(self):
        self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        info = self.redis_client.info('stats')
        return {
            'keyspace_hits': info.get('keyspace_hits', 0),
            'keyspace_misses': info.get('keyspace_misses', 0),
            'used_memory': info.get('used_memory', 0),
            'used_memory_human': info.get('used_memory_human', '0B'),
            'hit_rate': self._calculate_hit_rate(info)
        }
    
    def _calculate_hit_rate(self, info: Dict) -> float:
        """计算命中率"""
        hits = info.get('keyspace_hits', 0)
        misses = info.get('keyspace_misses', 0)
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0

# 全局缓存管理器实例
cache_manager = RedisCacheManager()

def cache_key(prefix: str, *args) -> str:
    """生成缓存键"""
    return f"{prefix}:{':'.join(map(str, args))}"

def cache_aside(ttl: int = 300, key_prefix: str = ""):
    """Cache-Aside 装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key_str = cache_key(key_prefix, *args, *kwargs.values())
            
            # 尝试从缓存获取
            cached_data = cache_manager.redis_client.get(cache_key_str)
            if cached_data:
                cache_manager.cache_stats['hits'] += 1
                logger.info(f"Cache hit: {cache_key_str}")
                return json.loads(cached_data)
            
            # 缓存未命中，查询数据库
            cache_manager.cache_stats['misses'] += 1
            logger.info(f"Cache miss: {cache_key_str}")
            
            result = await func(*args, **kwargs)
            
            # 写入缓存
            if result:
                cache_manager.redis_client.setex(
                    cache_key_str, 
                    ttl, 
                    json.dumps(result, default=str)
                )
                cache_manager.cache_stats['sets'] += 1
                logger.info(f"Cache set: {cache_key_str}, TTL: {ttl}s")
            
            return result
        return wrapper
    return decorator

def smart_ttl_cache(key_prefix: str = ""):
    """智能TTL缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key_str = cache_key(key_prefix, *args, *kwargs.values())
            
            # 检查热度
            hot_key = cache_key("hot", cache_key_str)
            is_hot = cache_manager.redis_client.get(hot_key)
            
            # 根据热度设置TTL
            if is_hot:
                ttl = 600  # 热门数据6分钟
            else:
                ttl = 300  # 普通数据3分钟
            
            # 尝试从缓存获取
            cached_data = cache_manager.redis_client.get(cache_key_str)
            if cached_data:
                cache_manager.cache_stats['hits'] += 1
                # 更新热度
                cache_manager.redis_client.setex(hot_key, 3600, "1")
                return json.loads(cached_data)
            
            # 缓存未命中
            cache_manager.cache_stats['misses'] += 1
            result = await func(*args, **kwargs)
            
            if result:
                cache_manager.redis_client.setex(
                    cache_key_str, 
                    ttl, 
                    json.dumps(result, default=str)
                )
                cache_manager.cache_stats['sets'] += 1
            
            return result
        return wrapper
    return decorator

def write_through_cache(key_prefix: str = "", ttl: int = 600):
    """Write-Through 缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key_str = cache_key(key_prefix, *args, *kwargs.values())
            
            # 执行数据库操作
            result = await func(*args, **kwargs)
            
            # 同时更新缓存
            if result:
                cache_manager.redis_client.setex(
                    cache_key_str, 
                    ttl, 
                    json.dumps(result, default=str)
                )
                cache_manager.cache_stats['sets'] += 1
                logger.info(f"Write-through cache set: {cache_key_str}")
            
            return result
        return wrapper
    return decorator

def write_behind_cache(key_prefix: str = "", ttl: int = 1800):
    """Write-Behind 异步缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key_str = cache_key(key_prefix, *args, *kwargs.values())
            
            # 立即更新缓存
            cache_manager.redis_client.setex(
                cache_key_str, 
                ttl, 
                json.dumps({"status": "pending"}, default=str)
            )
            
            # 异步更新数据库
            asyncio.create_task(_async_db_update(func, args, kwargs, cache_key_str))
            
            return {"status": "cached", "key": cache_key_str}
        return wrapper
    return decorator

async def _async_db_update(func, args, kwargs, cache_key_str):
    """异步数据库更新"""
    try:
        result = await func(*args, **kwargs)
        if result:
            cache_manager.redis_client.setex(
                cache_key_str, 
                1800, 
                json.dumps(result, default=str)
            )
            logger.info(f"Async DB update completed: {cache_key_str}")
    except Exception as e:
        logger.error(f"Async DB update failed: {cache_key_str}, error: {e}")

class CacheStrategy:
    """缓存策略实现类"""
    
    @staticmethod
    @cache_aside(ttl=300, key_prefix="photo_detail")
    async def get_photo_detail_cache_aside(photo_id: int, db: Session):
        """策略2: Cache-Aside 照片详情"""
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            return None
        
        return {
            "id": photo.id,
            "title": photo.title,
            "description": photo.description,
            "image_url": photo.image_url,
            "theme": photo.theme,
            "likes": photo.likes,
            "views": photo.views,
            "heat_score": float(photo.heat_score or 0),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        }
    
    @staticmethod
    @smart_ttl_cache(key_prefix="photo_detail_smart")
    async def get_photo_detail_smart_ttl(photo_id: int, db: Session):
        """策略3: 智能TTL 照片详情"""
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            return None
        
        return {
            "id": photo.id,
            "title": photo.title,
            "description": photo.description,
            "image_url": photo.image_url,
            "theme": photo.theme,
            "likes": photo.likes,
            "views": photo.views,
            "heat_score": float(photo.heat_score or 0),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        }
    
    @staticmethod
    @write_through_cache(key_prefix="photo_detail_wt", ttl=600)
    async def get_photo_detail_write_through(photo_id: int, db: Session):
        """策略4: Write-Through 照片详情"""
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            return None
        
        return {
            "id": photo.id,
            "title": photo.title,
            "description": photo.description,
            "image_url": photo.image_url,
            "theme": photo.theme,
            "likes": photo.likes,
            "views": photo.views,
            "heat_score": float(photo.heat_score or 0),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        }
    
    @staticmethod
    @write_behind_cache(key_prefix="photo_detail_wb", ttl=1800)
    async def get_photo_detail_write_behind(photo_id: int, db: Session):
        """策略5: Write-Behind 照片详情"""
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            return None
        
        return {
            "id": photo.id,
            "title": photo.title,
            "description": photo.description,
            "image_url": photo.image_url,
            "theme": photo.theme,
            "likes": photo.likes,
            "views": photo.views,
            "heat_score": float(photo.heat_score or 0),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        }
    
    @staticmethod
    async def get_photo_detail_hybrid(photo_id: int, db: Session):
        """策略6: 混合策略 照片详情"""
        # 结合智能TTL和Write-Through
        cache_key_str = cache_key("photo_detail_hybrid", photo_id)
        
        # 检查热度
        hot_key = cache_key("hot", cache_key_str)
        is_hot = cache_manager.redis_client.get(hot_key)
        
        # 根据热度设置TTL
        ttl = 600 if is_hot else 300
        
        # 尝试从缓存获取
        cached_data = cache_manager.redis_client.get(cache_key_str)
        if cached_data:
            cache_manager.cache_stats['hits'] += 1
            # 更新热度
            cache_manager.redis_client.setex(hot_key, 3600, "1")
            return json.loads(cached_data)
        
        # 缓存未命中，查询数据库
        cache_manager.cache_stats['misses'] += 1
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            return None
        
        result = {
            "id": photo.id,
            "title": photo.title,
            "description": photo.description,
            "image_url": photo.image_url,
            "theme": photo.theme,
            "likes": photo.likes,
            "views": photo.views,
            "heat_score": float(photo.heat_score or 0),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        }
        
        # 写入缓存
        cache_manager.redis_client.setex(
            cache_key_str, 
            ttl, 
            json.dumps(result, default=str)
        )
        cache_manager.cache_stats['sets'] += 1
        
        return result

def invalidate_cache(pattern: str):
    """缓存失效函数"""
    keys = cache_manager.redis_client.keys(pattern)
    if keys:
        cache_manager.redis_client.delete(*keys)
        cache_manager.cache_stats['deletes'] += len(keys)
        logger.info(f"Cache invalidated: {len(keys)} keys matching {pattern}")

def clear_all_cache():
    """清空所有缓存"""
    cache_manager.redis_client.flushall()
    logger.info("All cache cleared")
