from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from models.database import get_db
from models.models import Photo, User
from models.schemas import BaseModel
from typing import List, Optional
from utils.auth import require_admin
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float

class QualityStats(BaseModel):
    average_quality: float
    high_quality_count: int
    medium_quality_count: int
    low_quality_count: int

class RecentAnalysis(BaseModel):
    id: int
    title: str
    category: str
    confidence: float
    quality_score: float
    analyzed_at: str

class SystemPerformance(BaseModel):
    analysis_speed: float
    success_rate: float
    error_rate: float

class AnalysisStatsResponse(BaseModel):
    total_photos: int
    analyzed_photos: int
    analysis_accuracy: float
    category_distribution: List[CategoryDistribution]
    quality_stats: QualityStats
    recent_analysis: List[RecentAnalysis]
    system_performance: SystemPerformance

@router.get("/analysis", response_model=AnalysisStatsResponse)
async def get_analysis_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取智能分析统计数据"""
    try:
        # 基础统计
        total_photos = db.query(Photo).count()
        analyzed_photos = db.query(Photo).filter(Photo.theme.isnot(None)).count()
        
        # 计算分析准确率（基于置信度）
        high_confidence_photos = db.query(Photo).filter(
            Photo.confidence >= 0.8
        ).count()
        analysis_accuracy = (high_confidence_photos / analyzed_photos * 100) if analyzed_photos > 0 else 0
        
        # 分类分布统计
        category_stats = db.query(
            Photo.theme,
            func.count(Photo.id).label('count')
        ).filter(
            Photo.theme.isnot(None)
        ).group_by(Photo.theme).all()
        
        category_distribution = []
        for theme, count in category_stats:
            percentage = (count / analyzed_photos * 100) if analyzed_photos > 0 else 0
            category_distribution.append(CategoryDistribution(
                category=theme,
                count=count,
                percentage=percentage
            ))
        
        # 质量统计
        quality_stats_query = db.query(
            func.avg(Photo.confidence).label('avg_quality'),
            func.count(Photo.id).filter(Photo.confidence >= 0.8).label('high_quality'),
            func.count(Photo.id).filter(Photo.confidence >= 0.5, Photo.confidence < 0.8).label('medium_quality'),
            func.count(Photo.id).filter(Photo.confidence < 0.5).label('low_quality')
        ).filter(Photo.confidence.isnot(None)).first()
        
        avg_quality = quality_stats_query.avg_quality or 0
        high_quality_count = quality_stats_query.high_quality or 0
        medium_quality_count = quality_stats_query.medium_quality or 0
        low_quality_count = quality_stats_query.low_quality or 0
        
        quality_stats = QualityStats(
            average_quality=avg_quality,
            high_quality_count=high_quality_count,
            medium_quality_count=medium_quality_count,
            low_quality_count=low_quality_count
        )
        
        # 最近分析记录
        recent_photos = db.query(Photo).filter(
            Photo.theme.isnot(None),
            Photo.confidence.isnot(None)
        ).order_by(desc(Photo.updated_at)).limit(10).all()
        
        recent_analysis = []
        for photo in recent_photos:
            recent_analysis.append(RecentAnalysis(
                id=photo.id,
                title=photo.title,
                category=photo.theme,
                confidence=photo.confidence or 0,
                quality_score=photo.confidence or 0,  # 使用置信度作为质量评分
                analyzed_at=photo.updated_at.isoformat()
            ))
        
        # 系统性能指标（模拟数据）
        system_performance = SystemPerformance(
            analysis_speed=2.5,  # 平均分析速度（秒）
            success_rate=95.2,   # 分析成功率
            error_rate=4.8       # 错误率
        )
        
        return AnalysisStatsResponse(
            total_photos=total_photos,
            analyzed_photos=analyzed_photos,
            analysis_accuracy=analysis_accuracy,
            category_distribution=category_distribution,
            quality_stats=quality_stats,
            recent_analysis=recent_analysis,
            system_performance=system_performance
        )
        
    except Exception as e:
        logger.error(f"获取分析统计数据失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"获取分析统计数据失败: {str(e)}"
        )
