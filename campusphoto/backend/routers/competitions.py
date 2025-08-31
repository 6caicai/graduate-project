"""
比赛相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime

from models.database import get_db
from models.models import User, Competition, Photo
from models.schemas import (
    CompetitionCreate, CompetitionInDB, CompetitionDetail, CompetitionUpdate,
    MessageResponse, PaginationParams, PaginatedResponse, PhotoInDB
)
from utils.auth import get_current_active_user, require_admin

router = APIRouter()


@router.post("/", response_model=CompetitionInDB)
async def create_competition(
    competition: CompetitionCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """创建比赛（管理员功能）"""
    db_competition = Competition(
        **competition.model_dump()
    )
    
    db.add(db_competition)
    db.commit()
    db.refresh(db_competition)
    
    return CompetitionInDB.model_validate(db_competition)


@router.get("/", response_model=PaginatedResponse)
async def get_competitions(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[str] = Query(None, description="状态筛选"),
    theme: Optional[str] = Query(None, description="主题筛选"),
    db: Session = Depends(get_db)
):
    """获取比赛列表"""
    query = db.query(Competition)
    
    # 状态筛选
    if status_filter:
        query = query.filter(Competition.status == status_filter)
    
    # 主题筛选
    if theme:
        query = query.filter(Competition.theme == theme)
    
    # 按创建时间倒序
    query = query.order_by(desc(Competition.created_at))
    
    # 获取总数
    total = query.count()
    
    # 分页查询
    competitions = query.offset(pagination.offset).limit(pagination.size).all()
    
    # 转换为响应模型
    competition_list = [CompetitionInDB.model_validate(comp) for comp in competitions]
    
    return PaginatedResponse.create(
        items=competition_list,
        total=total,
        page=pagination.page,
        size=pagination.size
    )


@router.get("/{competition_id}", response_model=CompetitionDetail)
async def get_competition_detail(
    competition_id: int,
    db: Session = Depends(get_db)
):
    """获取比赛详情"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    # 统计参赛信息
    photos = db.query(Photo).filter(Photo.competition_id == competition_id).all()
    participants = set([photo.user_id for photo in photos])
    
    # 构建详细信息
    competition_detail = CompetitionDetail.model_validate(competition)
    competition_detail.photos_count = len(photos)
    competition_detail.participants_count = len(participants)
    competition_detail.photos = [PhotoInDB.model_validate(photo) for photo in photos[:10]]  # 只返回前10张
    
    return competition_detail


@router.put("/{competition_id}", response_model=CompetitionInDB)
async def update_competition(
    competition_id: int,
    competition_update: CompetitionUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新比赛信息（管理员功能）"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    # 更新比赛信息
    update_data = competition_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(competition, field, value)
    
    db.commit()
    db.refresh(competition)
    
    return CompetitionInDB.model_validate(competition)


@router.delete("/{competition_id}", response_model=MessageResponse)
async def delete_competition(
    competition_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """删除比赛（管理员功能）"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    # 检查是否有参赛作品
    photos_count = db.query(Photo).filter(Photo.competition_id == competition_id).count()
    if photos_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="比赛有参赛作品，无法删除"
        )
    
    db.delete(competition)
    db.commit()
    
    return MessageResponse(message="比赛删除成功")


@router.post("/{competition_id}/start", response_model=MessageResponse)
async def start_competition(
    competition_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """开始比赛（管理员功能）"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    if competition.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有草稿状态的比赛才能开始"
        )
    
    competition.status = "active"
    db.commit()
    
    return MessageResponse(message="比赛已开始")


@router.post("/{competition_id}/start-voting", response_model=MessageResponse)
async def start_voting(
    competition_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """开始投票（管理员功能）"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    if competition.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有进行中的比赛才能开始投票"
        )
    
    competition.status = "voting"
    db.commit()
    
    return MessageResponse(message="投票已开始")


@router.post("/{competition_id}/close", response_model=MessageResponse)
async def close_competition(
    competition_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """结束比赛（管理员功能）"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    competition.status = "closed"
    db.commit()
    
    return MessageResponse(message="比赛已结束")


@router.get("/{competition_id}/photos", response_model=PaginatedResponse)
async def get_competition_photos(
    competition_id: int,
    pagination: PaginationParams = Depends(),
    sort_by: str = Query("votes", description="排序字段"),
    db: Session = Depends(get_db)
):
    """获取比赛参赛作品"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    query = db.query(Photo).filter(
        Photo.competition_id == competition_id,
        Photo.is_approved == True
    )
    
    # 排序
    if sort_by == "votes":
        query = query.order_by(desc(Photo.votes))
    elif sort_by == "likes":
        query = query.order_by(desc(Photo.likes))
    elif sort_by == "views":
        query = query.order_by(desc(Photo.views))
    else:
        query = query.order_by(desc(Photo.uploaded_at))
    
    # 获取总数
    total = query.count()
    
    # 分页查询
    photos = query.offset(pagination.offset).limit(pagination.size).all()
    
    # 转换为响应模型
    photo_list = [PhotoInDB.model_validate(photo) for photo in photos]
    
    return PaginatedResponse.create(
        items=photo_list,
        total=total,
        page=pagination.page,
        size=pagination.size
    )


@router.get("/{competition_id}/leaderboard")
async def get_competition_leaderboard(
    competition_id: int,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取比赛排行榜"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    # 获取参赛作品排行
    photos = db.query(Photo).filter(
        Photo.competition_id == competition_id,
        Photo.is_approved == True
    ).order_by(desc(Photo.votes), desc(Photo.likes)).limit(limit).all()
    
    leaderboard = []
    for i, photo in enumerate(photos, 1):
        leaderboard.append({
            "rank": i,
            "photo": PhotoInDB.model_validate(photo),
            "user": photo.user,
            "score": photo.votes + photo.likes * 0.5  # 简单的评分计算
        })
    
    return {
        "competition": CompetitionInDB.model_validate(competition),
        "leaderboard": leaderboard
    }


@router.get("/active/list", response_model=List[CompetitionInDB])
async def get_active_competitions(db: Session = Depends(get_db)):
    """获取活跃的比赛列表"""
    now = datetime.now()
    competitions = db.query(Competition).filter(
        Competition.status.in_(["active", "voting"]),
        Competition.start_time <= now,
        Competition.end_time >= now
    ).order_by(Competition.start_time).all()
    
    return [CompetitionInDB.model_validate(comp) for comp in competitions]


@router.post("/{competition_id}/join", response_model=MessageResponse)
async def join_competition(
    competition_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """参加比赛"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="比赛不存在"
        )
    
    if competition.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="比赛未开放参与"
        )
    
    # 检查是否已参与
    existing_photos = db.query(Photo).filter(
        Photo.user_id == current_user.id,
        Photo.competition_id == competition_id
    ).count()
    
    if existing_photos >= competition.max_submissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"已达到最大投稿数量限制 ({competition.max_submissions})"
        )
    
    return MessageResponse(message="可以开始上传参赛作品")

