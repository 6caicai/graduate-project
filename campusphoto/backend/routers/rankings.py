"""
排行榜相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, text
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from models.database import get_db
from models.models import User, Photo, Interaction, Ranking
from models.schemas import PaginationParams, PaginatedResponse, PhotoInDB
from utils.auth import get_current_active_user

router = APIRouter()


class PhotoRankingItem(BaseModel):
    id: int
    title: str
    image_url: str
    thumbnail_url: Optional[str]
    theme: Optional[str]
    likes: int
    views: int
    heat_score: float
    rank: int
    user: Dict[str, Any]


class PhotographerRankingItem(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str]
    rating: float
    photos_count: int
    total_likes: int
    rank: int
    specialties: List[str]


class RankingStats(BaseModel):
    total_photos: int
    total_photographers: int
    period: str


@router.get("/photos", response_model=List[PhotoRankingItem])
async def get_photo_rankings(
    period: str = Query("week", description="时间周期: week, month, year, all"),
    limit: int = Query(20, description="返回数量限制"),
    db: Session = Depends(get_db)
):
    """获取照片排行榜"""
    try:
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
        photos = query.order_by(desc(Photo.heat_score)).limit(limit).all()
        
        # 构建响应
        result = []
        for rank, photo in enumerate(photos, 1):
            result.append(PhotoRankingItem(
                id=photo.id,
                title=photo.title,
                image_url=photo.image_url,
                thumbnail_url=photo.thumbnail_url,
                theme=photo.theme,
                likes=photo.likes,
                views=photo.views,
                heat_score=float(photo.heat_score or 0),
                rank=rank,
                user={
                    'id': photo.user_id,
                    'username': photo.username,
                    'avatar_url': photo.avatar_url
                }
            ))
        
        return result
        
    except Exception as e:
        print(f"Error in get_photo_rankings: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取照片排行榜失败: {str(e)}"
        )


@router.get("/photographers", response_model=List[PhotographerRankingItem])
async def get_photographer_rankings(
    period: str = Query("week", description="时间周期: week, month, year, all"),
    limit: int = Query(20, description="返回数量限制"),
    db: Session = Depends(get_db)
):
    """获取摄影师排行榜"""
    try:
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
        
        # 构建查询 - 按总点赞数排序
        query = db.query(
            User.id,
            User.username,
            User.avatar_url,
            func.count(Photo.id).label('photos_count'),
            func.sum(Photo.likes).label('total_likes'),
            func.avg(Photo.heat_score).label('avg_heat_score')
        ).join(Photo, User.id == Photo.user_id).filter(
            Photo.is_approved == True,
            User.role.in_(['photographer', 'student'])  # 包含摄影师和学生
        )
        
        # 应用时间过滤
        if start_date:
            query = query.filter(Photo.uploaded_at >= start_date)
        
        # 按总点赞数排序
        photographers = query.group_by(User.id, User.username, User.avatar_url).order_by(
            desc('total_likes')
        ).limit(limit).all()
        
        # 构建响应
        result = []
        for rank, photographer in enumerate(photographers, 1):
            # 获取摄影师的专业领域（基于照片主题）
            specialties_query = db.query(Photo.theme).filter(
                Photo.user_id == photographer.id,
                Photo.is_approved == True,
                Photo.theme.isnot(None)
            )
            if start_date:
                specialties_query = specialties_query.filter(Photo.uploaded_at >= start_date)
            
            themes = [theme[0] for theme in specialties_query.distinct().all()]
            specialties = list(set(themes))[:3]  # 最多显示3个专业领域
            
            # 计算评分（基于平均热度分数）
            rating = float(photographer.avg_heat_score or 0) / 10  # 将热度分数转换为1-5评分
            rating = min(5.0, max(1.0, rating))  # 限制在1-5范围内
            
            result.append(PhotographerRankingItem(
                id=photographer.id,
                username=photographer.username,
                avatar_url=photographer.avatar_url,
                rating=round(rating, 1),
                photos_count=photographer.photos_count or 0,
                total_likes=photographer.total_likes or 0,
                rank=rank,
                specialties=specialties
            ))
        
        return result
        
    except Exception as e:
        print(f"Error in get_photographer_rankings: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取摄影师排行榜失败: {str(e)}"
        )


@router.get("/stats", response_model=RankingStats)
async def get_ranking_stats(
    period: str = Query("week", description="时间周期: week, month, year, all"),
    db: Session = Depends(get_db)
):
    """获取排行榜统计信息"""
    try:
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
        
        # 统计照片数量
        photos_query = db.query(Photo).filter(Photo.is_approved == True)
        if start_date:
            photos_query = photos_query.filter(Photo.uploaded_at >= start_date)
        total_photos = photos_query.count()
        
        # 统计摄影师数量
        photographers_query = db.query(User).join(Photo, User.id == Photo.user_id).filter(
            Photo.is_approved == True,
            User.role.in_(['photographer', 'student'])
        )
        if start_date:
            photographers_query = photographers_query.filter(Photo.uploaded_at >= start_date)
        total_photographers = photographers_query.distinct().count()
        
        return RankingStats(
            total_photos=total_photos,
            total_photographers=total_photographers,
            period=period
        )
        
    except Exception as e:
        print(f"Error in get_ranking_stats: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取排行榜统计失败: {str(e)}"
        )


@router.post("/calculate-heat-scores")
async def calculate_heat_scores(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """计算照片热度分数（管理员功能）"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有管理员可以执行此操作"
        )
    
    try:
        # 获取所有已审核通过的照片
        photos = db.query(Photo).filter(Photo.is_approved == True).all()
        
        updated_count = 0
        for photo in photos:
            # 计算热度分数：点赞数 * 0.4 + 浏览数 * 0.3 + 收藏数 * 0.2 + 投票数 * 0.1
            heat_score = (
                photo.likes * 0.4 +
                photo.views * 0.3 +
                photo.favorites * 0.2 +
                photo.votes * 0.1
            )
            
            photo.heat_score = heat_score
            updated_count += 1
        
        db.commit()
        
        return {
            "message": f"成功更新 {updated_count} 张照片的热度分数",
            "updated_count": updated_count
        }
        
    except Exception as e:
        print(f"Error in calculate_heat_scores: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"计算热度分数失败: {str(e)}"
        )

