"""
分析统计相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
import pandas as pd

from models.database import get_db
from models.models import User, Photo, Interaction, Ranking, Competition, Appointment
from models.schemas import RankingDetail, PhotoInDB
from utils.auth import get_current_active_user, require_photographer, require_admin
from utils.config_manager import get_config_manager

router = APIRouter()


@router.get("/rankings/hot")
async def get_hot_rankings(
    limit: int = Query(20, ge=1, le=100),
    period: str = Query("weekly", description="时间周期: weekly, monthly, all"),
    theme: Optional[str] = Query(None, description="主题筛选"),
    db: Session = Depends(get_db)
):
    """获取热度排行榜"""
    # 根据周期确定时间范围
    now = datetime.now()
    if period == "weekly":
        start_time = now - timedelta(days=7)
    elif period == "monthly":
        start_time = now - timedelta(days=30)
    else:  # all
        start_time = datetime(2020, 1, 1)  # 很早的时间
    
    # 构建查询
    query = db.query(Photo).filter(
        Photo.is_approved == True,
        Photo.uploaded_at >= start_time
    )
    
    # 主题筛选
    if theme:
        query = query.filter(Photo.theme == theme)
    
    # 按热度分数排序
    photos = query.order_by(desc(Photo.heat_score)).limit(limit).all()
    
    # 构建排行榜数据
    rankings = []
    for i, photo in enumerate(photos, 1):
        rankings.append({
            "rank": i,
            "photo": PhotoInDB.model_validate(photo),
            "score": float(photo.heat_score),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        })
    
    return {
        "period": period,
        "theme": theme,
        "total": len(rankings),
        "rankings": rankings
    }


@router.get("/rankings/competition/{competition_id}")
async def get_competition_rankings(
    competition_id: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取比赛排行榜"""
    # 检查比赛是否存在
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    # 获取比赛作品排行
    photos = db.query(Photo).filter(
        Photo.competition_id == competition_id,
        Photo.is_approved == True
    ).order_by(
        desc(Photo.votes),
        desc(Photo.likes),
        desc(Photo.favorites)
    ).limit(limit).all()
    
    # 构建排行榜数据
    rankings = []
    for i, photo in enumerate(photos, 1):
        score = photo.votes * 3 + photo.likes * 1 + photo.favorites * 2  # 简单的评分计算
        rankings.append({
            "rank": i,
            "photo": PhotoInDB.model_validate(photo),
            "score": score,
            "votes": photo.votes,
            "likes": photo.likes,
            "favorites": photo.favorites,
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            }
        })
    
    return {
        "competition": {
            "id": competition.id,
            "name": competition.name,
            "status": competition.status
        },
        "total": len(rankings),
        "rankings": rankings
    }


@router.get("/user-stats/{user_id}")
async def get_user_statistics(
    user_id: int,
    db: Session = Depends(get_db)
):
    """获取用户统计数据"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 基础统计
    total_photos = db.query(Photo).filter(Photo.user_id == user_id).count()
    approved_photos = db.query(Photo).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True
    ).count()
    
    # 互动统计
    total_likes = db.query(func.sum(Photo.likes)).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True
    ).scalar() or 0
    
    total_favorites = db.query(func.sum(Photo.favorites)).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True
    ).scalar() or 0
    
    total_views = db.query(func.sum(Photo.views)).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True
    ).scalar() or 0
    
    # 主题分布
    theme_stats = db.query(
        Photo.theme,
        func.count(Photo.id).label('count')
    ).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True,
        Photo.theme.isnot(None)
    ).group_by(Photo.theme).all()
    
    # 最受欢迎的作品
    popular_photos = db.query(Photo).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True
    ).order_by(desc(Photo.likes + Photo.favorites)).limit(5).all()
    
    # 上传活动趋势（最近30天）
    thirty_days_ago = datetime.now() - timedelta(days=30)
    upload_trend = db.query(
        func.date(Photo.uploaded_at).label('date'),
        func.count(Photo.id).label('count')
    ).filter(
        Photo.user_id == user_id,
        Photo.uploaded_at >= thirty_days_ago
    ).group_by(func.date(Photo.uploaded_at)).order_by('date').all()
    
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "avatar_url": user.avatar_url
        },
        "basic_stats": {
            "total_photos": total_photos,
            "approved_photos": approved_photos,
            "total_likes": int(total_likes),
            "total_favorites": int(total_favorites),
            "total_views": int(total_views)
        },
        "theme_distribution": [
            {"theme": theme, "count": count} for theme, count in theme_stats
        ],
        "popular_photos": [
            {
                "id": photo.id,
                "title": photo.title,
                "likes": photo.likes,
                "favorites": photo.favorites,
                "views": photo.views,
                "image_url": photo.image_url
            } for photo in popular_photos
        ],
        "upload_trend": [
            {"date": str(date), "count": count} for date, count in upload_trend
        ]
    }


@router.get("/trending")
async def get_trending_analysis(
    hours: int = Query(24, ge=1, le=168),  # 1小时到1周
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """获取趋势分析（最近上升最快的作品）"""
    # 计算时间范围
    start_time = datetime.now() - timedelta(hours=hours)
    
    # 获取最近时间段内的互动数据
    recent_interactions = db.query(
        Interaction.photo_id,
        func.count(Interaction.id).label('recent_count')
    ).filter(
        Interaction.created_at >= start_time,
        Interaction.type.in_(["like", "favorite", "vote"])
    ).group_by(Interaction.photo_id).subquery()
    
    # 获取作品的总互动数
    total_interactions = db.query(
        Photo.id,
        (Photo.likes + Photo.favorites + Photo.votes).label('total_count')
    ).subquery()
    
    # 计算趋势分数
    trending_photos = db.query(Photo).join(
        recent_interactions, Photo.id == recent_interactions.c.photo_id
    ).join(
        total_interactions, Photo.id == total_interactions.c.id
    ).filter(
        Photo.is_approved == True
    ).order_by(
        desc(recent_interactions.c.recent_count)
    ).limit(limit).all()
    
    results = []
    for photo in trending_photos:
        # 获取最近互动数
        recent_count = db.query(func.count(Interaction.id)).filter(
            Interaction.photo_id == photo.id,
            Interaction.created_at >= start_time,
            Interaction.type.in_(["like", "favorite", "vote"])
        ).scalar()
        
        results.append({
            "photo": PhotoInDB.model_validate(photo),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username
            },
            "recent_interactions": recent_count,
            "total_interactions": photo.likes + photo.favorites + photo.votes,
            "trend_score": recent_count  # 可以用更复杂的算法
        })
    
    return {
        "period_hours": hours,
        "trending_photos": results
    }


@router.get("/heat-score/recalculate", response_model=dict)
async def recalculate_heat_scores(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """重新计算所有作品的热度分数"""
    config_manager = get_config_manager()
    weights = config_manager.get_ranking_weights()
    
    # 获取所有已审核的作品
    photos = db.query(Photo).filter(Photo.is_approved == True).all()
    
    updated_count = 0
    for photo in photos:
        # 计算热度分数
        heat_score = (
            photo.likes * weights.get("like", 1.0) +
            photo.favorites * weights.get("favorite", 2.0) +
            photo.votes * weights.get("vote", 3.0) +
            photo.views * weights.get("view", 0.5)
        )
        
        # 时间衰减因子
        days_since_upload = (datetime.now() - photo.uploaded_at).days
        time_decay = weights.get("time_decay", 0.9) ** (days_since_upload / 7)  # 每周衰减
        
        final_score = heat_score * time_decay
        
        # 更新分数
        photo.heat_score = Decimal(str(round(final_score, 2)))
        updated_count += 1
    
    db.commit()
    
    return {
        "message": f"成功重新计算了 {updated_count} 张作品的热度分数",
        "weights_used": weights,
        "updated_count": updated_count
    }


@router.get("/interactions/summary")
async def get_interactions_summary(
    days: int = Query(7, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """获取互动数据摘要"""
    start_time = datetime.now() - timedelta(days=days)
    
    # 按类型统计互动数
    interaction_stats = db.query(
        Interaction.type,
        func.count(Interaction.id).label('count')
    ).filter(
        Interaction.created_at >= start_time
    ).group_by(Interaction.type).all()
    
    # 每日互动趋势
    daily_trends = db.query(
        func.date(Interaction.created_at).label('date'),
        Interaction.type,
        func.count(Interaction.id).label('count')
    ).filter(
        Interaction.created_at >= start_time
    ).group_by(
        func.date(Interaction.created_at),
        Interaction.type
    ).order_by('date').all()
    
    # 最活跃的用户
    active_users = db.query(
        Interaction.user_id,
        func.count(Interaction.id).label('interaction_count')
    ).filter(
        Interaction.created_at >= start_time
    ).group_by(Interaction.user_id).order_by(
        desc(func.count(Interaction.id))
    ).limit(10).all()
    
    return {
        "period_days": days,
        "interaction_stats": [
            {"type": itype, "count": count} for itype, count in interaction_stats
        ],
        "daily_trends": [
            {
                "date": str(date),
                "type": itype,
                "count": count
            } for date, itype, count in daily_trends
        ],
        "active_users": [
            {
                "user_id": user_id,
                "interaction_count": count
            } for user_id, count in active_users
        ]
    }


@router.get("/themes/popularity")
async def get_theme_popularity_analysis(
    period: str = Query("monthly", description="时间周期: weekly, monthly, all"),
    db: Session = Depends(get_db)
):
    """获取主题流行度分析"""
    # 确定时间范围
    now = datetime.now()
    if period == "weekly":
        start_time = now - timedelta(days=7)
    elif period == "monthly":
        start_time = now - timedelta(days=30)
    else:  # all
        start_time = datetime(2020, 1, 1)
    
    # 主题上传数统计
    theme_uploads = db.query(
        Photo.theme,
        func.count(Photo.id).label('upload_count')
    ).filter(
        Photo.uploaded_at >= start_time,
        Photo.is_approved == True,
        Photo.theme.isnot(None)
    ).group_by(Photo.theme).all()
    
    # 主题互动统计
    theme_interactions = db.query(
        Photo.theme,
        func.sum(Photo.likes + Photo.favorites + Photo.votes).label('total_interactions'),
        func.avg(Photo.likes + Photo.favorites + Photo.votes).label('avg_interactions')
    ).filter(
        Photo.uploaded_at >= start_time,
        Photo.is_approved == True,
        Photo.theme.isnot(None)
    ).group_by(Photo.theme).all()
    
    # 合并数据
    theme_data = {}
    for theme, count in theme_uploads:
        theme_data[theme] = {"upload_count": count}
    
    for theme, total_int, avg_int in theme_interactions:
        if theme in theme_data:
            theme_data[theme].update({
                "total_interactions": int(total_int or 0),
                "avg_interactions": float(avg_int or 0)
            })
    
    # 计算流行度分数
    results = []
    for theme, data in theme_data.items():
        popularity_score = (
            data["upload_count"] * 0.3 +
            data.get("avg_interactions", 0) * 0.7
        )
        
        results.append({
            "theme": theme,
            "upload_count": data["upload_count"],
            "total_interactions": data.get("total_interactions", 0),
            "avg_interactions": round(data.get("avg_interactions", 0), 2),
            "popularity_score": round(popularity_score, 2)
        })
    
    # 按流行度排序
    results.sort(key=lambda x: x["popularity_score"], reverse=True)
    
    return {
        "period": period,
        "theme_analysis": results
    }


@router.get("/photographers/performance")
async def get_photographer_performance(
    current_user: User = Depends(require_photographer),
    db: Session = Depends(get_db)
):
    """获取摄影师表现分析"""
    # 只有摄影师和管理员可以查看
    if current_user.role not in ["photographer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    # 如果是摄影师，只能查看自己的数据
    photographer_id = current_user.id if current_user.role == "photographer" else None
    
    # 预约统计
    appointment_query = db.query(Appointment)
    if photographer_id:
        appointment_query = appointment_query.filter(Appointment.photographer_id == photographer_id)
    
    appointments = appointment_query.all()
    
    # 按状态统计
    status_stats = {}
    for appointment in appointments:
        status = appointment.status
        status_stats[status] = status_stats.get(status, 0) + 1
    
    # 评分统计
    ratings = [a.rating for a in appointments if a.rating]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    # 月度预约趋势
    monthly_appointments = db.query(
        func.extract('year', Appointment.created_at).label('year'),
        func.extract('month', Appointment.created_at).label('month'),
        func.count(Appointment.id).label('count')
    )
    
    if photographer_id:
        monthly_appointments = monthly_appointments.filter(
            Appointment.photographer_id == photographer_id
        )
    
    monthly_data = monthly_appointments.group_by(
        func.extract('year', Appointment.created_at),
        func.extract('month', Appointment.created_at)
    ).order_by('year', 'month').limit(12).all()
    
    return {
        "photographer_id": photographer_id,
        "appointment_stats": {
            "total": len(appointments),
            "by_status": status_stats,
            "avg_rating": round(avg_rating, 2),
            "total_ratings": len(ratings)
        },
        "monthly_trend": [
            {
                "year": int(year),
                "month": int(month),
                "count": count
            } for year, month, count in monthly_data
        ]
    }

