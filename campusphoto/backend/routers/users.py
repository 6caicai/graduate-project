"""
用户相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from models.database import get_db
from models.models import User, Photo, Appointment, Interaction
from models.schemas import (
    UserInDB, UserProfile, UserUpdate, MessageResponse,
    PaginationParams, PaginatedResponse
)
from utils.auth import get_current_active_user, require_admin, check_resource_owner

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def get_users(
    pagination: PaginationParams = Depends(),
    role: Optional[str] = Query(None, description="按角色筛选"),
    search: Optional[str] = Query(None, description="搜索用户名或邮箱"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取用户列表（管理员功能）"""
    query = db.query(User)
    
    # 角色筛选
    if role:
        query = query.filter(User.role == role)
    
    # 搜索筛选
    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    
    # 获取总数
    total = query.count()
    
    # 分页查询
    users = query.offset(pagination.offset).limit(pagination.size).all()
    
    # 转换为响应模型
    user_list = [UserInDB.model_validate(user) for user in users]
    
    return PaginatedResponse.create(
        items=user_list,
        total=total,
        page=pagination.page,
        size=pagination.size
    )


@router.get("/me/profile", response_model=UserProfile)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取当前用户详细资料"""
    # 统计用户数据
    photos_count = db.query(Photo).filter(Photo.user_id == current_user.id).count()
    
    # 构建用户资料
    profile = UserProfile.model_validate(current_user)
    profile.photos_count = photos_count
    profile.followers_count = 0  # 后续可实现关注功能
    profile.following_count = 0
    
    return profile


@router.get("/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """获取指定用户的公开资料"""
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 统计用户数据
    photos_count = db.query(Photo).filter(
        Photo.user_id == user_id,
        Photo.is_approved == True
    ).count()
    
    # 构建用户资料
    profile = UserProfile.model_validate(user)
    profile.photos_count = photos_count
    profile.followers_count = 0
    profile.following_count = 0
    
    return profile


@router.put("/me", response_model=UserInDB)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新当前用户资料"""
    # 检查用户名冲突
    if user_update.username and user_update.username != current_user.username:
        existing_user = db.query(User).filter(
            User.username == user_update.username,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
    
    # 检查邮箱冲突
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被使用"
            )
    
    # 更新用户信息
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserInDB.model_validate(current_user)


@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新用户信息（管理员功能）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新用户信息
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return UserInDB.model_validate(user)


@router.post("/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """激活用户账户"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    user.is_active = True
    db.commit()
    
    return MessageResponse(message="用户账户已激活")


@router.post("/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """停用用户账户"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能停用自己的账户"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    user.is_active = False
    db.commit()
    
    return MessageResponse(message="用户账户已停用")


@router.get("/photographers", response_model=List[UserProfile])
async def get_photographers(
    db: Session = Depends(get_db)
):
    """获取摄影师列表"""
    photographers = db.query(User).filter(
        User.role == "photographer",
        User.is_active == True
    ).all()
    
    # 统计每个摄影师的数据
    photographer_profiles = []
    for photographer in photographers:
        # 统计作品数量
        photos_count = db.query(Photo).filter(
            Photo.user_id == photographer.id,
            Photo.is_approved == True
        ).count()
        
        # 统计预约数量
        appointments_count = db.query(Appointment).filter(
            Appointment.photographer_id == photographer.id,
            Appointment.status == "completed"
        ).count()
        
        profile = UserProfile.model_validate(photographer)
        profile.photos_count = photos_count
        # 可以添加更多统计信息
        
        photographer_profiles.append(profile)
    
    return photographer_profiles


@router.get("/me/statistics")
async def get_my_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的统计信息"""
    stats = {}
    
    # 作品统计
    total_photos = db.query(Photo).filter(Photo.user_id == current_user.id).count()
    approved_photos = db.query(Photo).filter(
        Photo.user_id == current_user.id,
        Photo.is_approved == True
    ).count()
    
    # 互动统计
    total_likes = db.query(func.sum(Photo.likes)).filter(
        Photo.user_id == current_user.id
    ).scalar() or 0
    total_views = db.query(func.sum(Photo.views)).filter(
        Photo.user_id == current_user.id
    ).scalar() or 0
    
    stats.update({
        "photos": {
            "total": total_photos,
            "approved": approved_photos,
            "pending": total_photos - approved_photos
        },
        "interactions": {
            "total_likes": total_likes,
            "total_views": total_views
        }
    })
    
    # 角色特定统计
    if current_user.role == "photographer":
        # 预约统计
        appointments = db.query(Appointment).filter(
            Appointment.photographer_id == current_user.id
        ).all()
        
        appointment_stats = {
            "total": len(appointments),
            "pending": len([a for a in appointments if a.status == "pending"]),
            "completed": len([a for a in appointments if a.status == "completed"]),
            "avg_rating": 0
        }
        
        # 计算平均评分
        ratings = [a.rating for a in appointments if a.rating]
        if ratings:
            appointment_stats["avg_rating"] = sum(ratings) / len(ratings)
        
        stats["appointments"] = appointment_stats
    
    elif current_user.role == "student":
        # 预约统计
        appointments = db.query(Appointment).filter(
            Appointment.student_id == current_user.id
        ).all()
        
        stats["appointments"] = {
            "total": len(appointments),
            "pending": len([a for a in appointments if a.status == "pending"]),
            "completed": len([a for a in appointments if a.status == "completed"])
        }
    
    return stats

