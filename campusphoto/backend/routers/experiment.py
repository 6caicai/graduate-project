"""
实验用API路由 - 支持6种缓存策略对比测试
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import time
import asyncio

from models.database import get_db
from models.models import Photo, User
from models.schemas import PhotoDetail, PhotoInDB
from utils.cache_strategies import (
    CacheStrategy, 
    cache_manager, 
    invalidate_cache, 
    clear_all_cache
)

router = APIRouter()

# 实验策略配置
CACHE_STRATEGIES = {
    "baseline": "无缓存基准",
    "cache_aside": "Cache-Aside基础模式", 
    "smart_ttl": "Cache-Aside + 智能TTL",
    "write_through": "Write-Through模式",
    "write_behind": "Write-Behind异步模式",
    "hybrid": "混合策略"
}

@router.get("/status")
async def get_experiment_status():
    """获取实验状态"""
    stats = cache_manager.get_stats()
    return {
        "current_strategy": "未设置",
        "cache_stats": stats,
        "available_strategies": CACHE_STRATEGIES
    }

@router.post("/strategy/{strategy_name}")
async def set_cache_strategy(strategy_name: str):
    """设置缓存策略"""
    if strategy_name not in CACHE_STRATEGIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的策略: {strategy_name}"
        )
    
    # 清空现有缓存
    clear_all_cache()
    
    return {
        "message": f"已切换到策略: {CACHE_STRATEGIES[strategy_name]}",
        "strategy": strategy_name,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/photo/{photo_id}")
async def get_photo_experiment(
    photo_id: int,
    strategy: str = Query("baseline", description="缓存策略"),
    db: Session = Depends(get_db)
):
    """实验用照片详情API - 支持多种缓存策略"""
    
    start_time = time.time()
    
    try:
        if strategy == "baseline":
            # 策略1: 无缓存基准
            result = await _get_photo_baseline(photo_id, db)
        elif strategy == "cache_aside":
            # 策略2: Cache-Aside基础模式
            result = await CacheStrategy.get_photo_detail_cache_aside(photo_id, db)
        elif strategy == "smart_ttl":
            # 策略3: Cache-Aside + 智能TTL
            result = await CacheStrategy.get_photo_detail_smart_ttl(photo_id, db)
        elif strategy == "write_through":
            # 策略4: Write-Through模式
            result = await CacheStrategy.get_photo_detail_write_through(photo_id, db)
        elif strategy == "write_behind":
            # 策略5: Write-Behind异步模式
            result = await CacheStrategy.get_photo_detail_write_behind(photo_id, db)
        elif strategy == "hybrid":
            # 策略6: 混合策略
            result = await CacheStrategy.get_photo_detail_hybrid(photo_id, db)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的策略: {strategy}"
            )
        
        response_time = (time.time() - start_time) * 1000  # 转换为毫秒
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="作品不存在"
            )
        
        return {
            "data": result,
            "metadata": {
                "strategy": strategy,
                "strategy_name": CACHE_STRATEGIES[strategy],
                "response_time_ms": round(response_time, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取作品详情失败: {str(e)}"
        )

async def _get_photo_baseline(photo_id: int, db: Session):
    """策略1: 无缓存基准 - 直接查询数据库"""
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

@router.get("/rankings/photos")
async def get_photo_rankings_experiment(
    strategy: str = Query("baseline", description="缓存策略"),
    period: str = Query("week", description="时间周期"),
    limit: int = Query(20, description="返回数量限制"),
    db: Session = Depends(get_db)
):
    """实验用照片排行榜API"""
    
    start_time = time.time()
    
    try:
        if strategy == "baseline":
            result = await _get_rankings_baseline(period, limit, db)
        else:
            # 其他策略使用缓存
            result = await _get_rankings_cached(strategy, period, limit, db)
        
        response_time = (time.time() - start_time) * 1000
        
        return {
            "data": result,
            "metadata": {
                "strategy": strategy,
                "strategy_name": CACHE_STRATEGIES[strategy],
                "response_time_ms": round(response_time, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取排行榜失败: {str(e)}"
        )

async def _get_rankings_baseline(period: str, limit: int, db: Session):
    """策略1: 无缓存基准 - 直接查询数据库"""
    # 计算时间范围
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:  # all
        start_date = None
    
    # 构建查询
    query = db.query(
        Photo.id,
        Photo.title,
        Photo.image_url,
        Photo.thumbnail_url,
        Photo.theme,
        Photo.likes,
        Photo.views,
        Photo.heat_score,
        User.id.label('user_id'),
        User.username,
        User.avatar_url
    ).join(User, Photo.user_id == User.id).filter(
        Photo.is_approved == True
    )
    
    # 应用时间过滤
    if start_date:
        query = query.filter(Photo.uploaded_at >= start_date)
    
    # 按热度分数排序
    photos = query.order_by(Photo.heat_score.desc()).limit(limit).all()
    
    # 构建响应
    result = []
    for rank, photo in enumerate(photos, 1):
        result.append({
            "id": photo.id,
            "title": photo.title,
            "image_url": photo.image_url,
            "thumbnail_url": photo.thumbnail_url,
            "theme": photo.theme,
            "likes": photo.likes,
            "views": photo.views,
            "heat_score": float(photo.heat_score or 0),
            "rank": rank,
            "user": {
                "id": photo.user_id,
                "username": photo.username,
                "avatar_url": photo.avatar_url
            }
        })
    
    return result

async def _get_rankings_cached(strategy: str, period: str, limit: int, db: Session):
    """缓存策略排行榜查询"""
    # 这里可以实现不同的缓存策略
    # 为了简化，先使用基础查询
    return await _get_rankings_baseline(period, limit, db)

@router.post("/cache/invalidate")
async def invalidate_experiment_cache(pattern: str = Query("*", description="缓存键模式")):
    """手动失效缓存"""
    invalidate_cache(pattern)
    return {
        "message": f"缓存已失效: {pattern}",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/cache/clear")
async def clear_experiment_cache():
    """清空所有缓存"""
    clear_all_cache()
    return {
        "message": "所有缓存已清空",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/metrics")
async def get_experiment_metrics():
    """获取实验指标"""
    stats = cache_manager.get_stats()
    return {
        "cache_stats": stats,
        "system_info": {
            "timestamp": datetime.utcnow().isoformat(),
            "available_strategies": list(CACHE_STRATEGIES.keys())
        }
    }
