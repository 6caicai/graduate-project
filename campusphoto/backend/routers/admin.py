"""
管理员相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from models.database import get_db
from models.models import User, Photo, Competition, Appointment, Configuration, SystemLog
from models.schemas import (
    ConfigurationCreate, ConfigurationInDB, ConfigurationUpdate,
    SystemLogCreate, SystemLogInDB, MessageResponse, StatisticsResponse,
    PaginationParams, PaginatedResponse, PhotoInDB, PhotoApprovalRequest, PhotoApprovalResponse
)
from utils.auth import get_current_active_user, require_admin
from utils.config_manager import get_config_manager

router = APIRouter()


@router.get("/dashboard", response_model=StatisticsResponse)
async def get_dashboard_statistics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取管理员仪表板统计数据"""
    from datetime import datetime, timedelta
    
    # 基础统计
    total_users = db.query(User).count()
    total_photos = db.query(Photo).count()
    total_competitions = db.query(Competition).count()
    total_appointments = db.query(Appointment).count()
    
    # 照片审核状态统计
    pending_photos = db.query(Photo).filter(Photo.approval_status == "pending").count()
    approved_photos = db.query(Photo).filter(Photo.approval_status == "approved").count()
    rejected_photos = db.query(Photo).filter(Photo.approval_status == "rejected").count()
    
    # 活跃比赛数
    active_competitions = db.query(Competition).filter(
        Competition.status.in_(["active", "voting"])
    ).count()
    
    # 本月新增数据
    this_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    photos_this_month = db.query(Photo).filter(
        Photo.uploaded_at >= this_month
    ).count()
    users_this_month = db.query(User).filter(
        User.created_at >= this_month
    ).count()
    
    # 最近上传的照片（最近5张）
    recent_photos = db.query(Photo).join(User, Photo.user_id == User.id).filter(
        Photo.is_approved == True
    ).order_by(Photo.uploaded_at.desc()).limit(5).all()
    
    recent_photos_data = []
    for photo in recent_photos:
        recent_photos_data.append({
            "id": photo.id,
            "title": photo.title,
            "image_url": photo.image_url,
            "uploaded_at": photo.uploaded_at.isoformat(),
            "user": {
                "id": photo.user.id,
                "username": photo.user.username,
                "avatar_url": photo.user.avatar_url
            },
            "approval_status": photo.approval_status
        })
    
    # 最近注册的用户（最近5个）
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    
    recent_users_data = []
    for user in recent_users:
        recent_users_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "avatar_url": user.avatar_url,
            "created_at": user.created_at.isoformat()
        })
    
    # 系统健康状态（简化版本）
    system_health = {
        "status": "healthy",
        "uptime": "24h",
        "memory_usage": 45.2,
        "disk_usage": 32.1,
        "cpu_usage": 15.8,
        "timestamp": datetime.now().isoformat()
    }
    
    return StatisticsResponse(
        total_users=total_users,
        total_photos=total_photos,
        total_competitions=total_competitions,
        total_appointments=total_appointments,
        active_competitions=active_competitions,
        photos_this_month=photos_this_month,
        users_this_month=users_this_month,
        pending_photos=pending_photos,
        approved_photos=approved_photos,
        rejected_photos=rejected_photos,
        recent_photos=recent_photos_data,
        recent_users=recent_users_data,
        system_health=system_health
    )


@router.get("/config", response_model=List[ConfigurationInDB])
async def get_all_configurations(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取所有配置项"""
    configs = db.query(Configuration).order_by(Configuration.category, Configuration.key).all()
    return [ConfigurationInDB.model_validate(config) for config in configs]


@router.put("/config/{config_id}", response_model=ConfigurationInDB)
async def update_configuration(
    config_id: int,
    config_update: ConfigurationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新配置项"""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配置项不存在"
        )
    
    # 记录更新前的值
    old_value = config.value
    
    # 更新配置
    update_data = config_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    
    # 更新配置管理器缓存
    config_manager = get_config_manager()
    config_manager.set(config.key, config.value, db)
    
    # 记录操作日志
    log_entry = SystemLog(
        user_id=current_user.id,
        action="update_config",
        resource_type="configuration",
        resource_id=config.id,
        details={
            "key": config.key,
            "old_value": old_value,
            "new_value": config.value
        }
    )
    db.add(log_entry)
    db.commit()
    
    return ConfigurationInDB.model_validate(config)


@router.get("/logs", response_model=PaginatedResponse)
async def get_system_logs(
    pagination: PaginationParams = Depends(),
    action: Optional[str] = Query(None, description="操作类型筛选"),
    resource_type: Optional[str] = Query(None, description="资源类型筛选"),
    user_id: Optional[int] = Query(None, description="用户ID筛选"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取系统日志"""
    query = db.query(SystemLog)
    
    # 筛选条件
    if action:
        query = query.filter(SystemLog.action == action)
    if resource_type:
        query = query.filter(SystemLog.resource_type == resource_type)
    if user_id:
        query = query.filter(SystemLog.user_id == user_id)
    
    # 按时间倒序
    query = query.order_by(desc(SystemLog.created_at))
    
    # 获取总数
    total = query.count()
    
    # 分页查询
    logs = query.offset(pagination.offset).limit(pagination.size).all()
    
    # 转换为响应模型
    log_list = [SystemLogInDB.model_validate(log) for log in logs]
    
    return PaginatedResponse.create(
        items=log_list,
        total=total,
        page=pagination.page,
        size=pagination.size
    )


@router.post("/bulk-actions/approve-photos", response_model=MessageResponse)
async def bulk_approve_photos(
    photo_ids: List[int],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """批量审核通过作品"""
    updated_count = db.query(Photo).filter(
        Photo.id.in_(photo_ids)
    ).update({Photo.is_approved: True}, synchronize_session=False)
    
    db.commit()
    
    # 记录操作日志
    log_entry = SystemLog(
        user_id=current_user.id,
        action="bulk_approve_photos",
        details={
            "photo_ids": photo_ids,
            "count": updated_count
        }
    )
    db.add(log_entry)
    db.commit()
    
    return MessageResponse(message=f"成功批量审核通过 {updated_count} 张作品")


@router.post("/bulk-actions/reject-photos", response_model=MessageResponse)
async def bulk_reject_photos(
    photo_ids: List[int],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """批量审核拒绝作品"""
    updated_count = db.query(Photo).filter(
        Photo.id.in_(photo_ids)
    ).update({Photo.is_approved: False}, synchronize_session=False)
    
    db.commit()
    
    # 记录操作日志
    log_entry = SystemLog(
        user_id=current_user.id,
        action="bulk_reject_photos",
        details={
            "photo_ids": photo_ids,
            "count": updated_count
        }
    )
    db.add(log_entry)
    db.commit()
    
    return MessageResponse(message=f"成功批量审核拒绝 {updated_count} 张作品")


@router.delete("/photos/{photo_id}", response_model=MessageResponse)
async def admin_delete_photo(
    photo_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员删除作品"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    # 记录删除前的信息
    photo_info = {
        "id": photo.id,
        "title": photo.title,
        "user_id": photo.user_id,
        "image_url": photo.image_url,
        "uploaded_at": photo.uploaded_at.isoformat() if photo.uploaded_at else None
    }
    
    # 删除相关交互记录
    from models.models import Interaction
    db.query(Interaction).filter(Interaction.photo_id == photo_id).delete()
    
    # 删除作品
    db.delete(photo)
    db.commit()
    
    # 记录操作日志
    log_entry = SystemLog(
        user_id=current_user.id,
        action="admin_delete_photo",
        resource_type="photo",
        resource_id=photo_id,
        details={
            "deleted_photo": photo_info,
            "reason": "管理员删除"
        }
    )
    db.add(log_entry)
    db.commit()
    
    return MessageResponse(message="作品删除成功")


@router.post("/bulk-actions/delete-photos", response_model=MessageResponse)
async def bulk_delete_photos(
    photo_ids: List[int],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """批量删除作品"""
    if not photo_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请选择要删除的作品"
        )
    
    # 获取要删除的作品信息
    photos = db.query(Photo).filter(Photo.id.in_(photo_ids)).all()
    if not photos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到要删除的作品"
        )
    
    # 记录删除前的信息
    deleted_photos = []
    for photo in photos:
        deleted_photos.append({
            "id": photo.id,
            "title": photo.title,
            "user_id": photo.user_id,
            "image_url": photo.image_url,
            "uploaded_at": photo.uploaded_at.isoformat() if photo.uploaded_at else None
        })
    
    # 删除相关交互记录
    from models.models import Interaction
    db.query(Interaction).filter(Interaction.photo_id.in_(photo_ids)).delete()
    
    # 删除作品
    deleted_count = db.query(Photo).filter(Photo.id.in_(photo_ids)).delete(synchronize_session=False)
    db.commit()
    
    # 记录操作日志
    log_entry = SystemLog(
        user_id=current_user.id,
        action="bulk_delete_photos",
        details={
            "photo_ids": photo_ids,
            "deleted_photos": deleted_photos,
            "count": deleted_count,
            "reason": "管理员批量删除"
        }
    )
    db.add(log_entry)
    db.commit()
    
    return MessageResponse(message=f"成功删除 {deleted_count} 张作品")


@router.get("/photos", response_model=PaginatedResponse)
async def get_all_photos_for_admin(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    status_filter: Optional[str] = Query(None, description="状态筛选: approved, pending, rejected"),
    user_id: Optional[int] = Query(None, description="用户ID筛选"),
    theme: Optional[str] = Query(None, description="主题筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员获取所有作品列表"""
    try:
        query = db.query(Photo)
        
        # 状态筛选
        if status_filter == "approved":
            query = query.filter(Photo.is_approved == True)
        elif status_filter == "pending":
            query = query.filter(Photo.is_approved.is_(None))
        elif status_filter == "rejected":
            query = query.filter(Photo.is_approved == False)
        
        # 用户筛选
        if user_id:
            query = query.filter(Photo.user_id == user_id)
        
        # 主题筛选
        if theme:
            query = query.filter(Photo.theme == theme)
        
        # 搜索筛选
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Photo.title.ilike(search_term)) |
                (Photo.description.ilike(search_term))
            )
        
        # 按上传时间倒序
        query = query.order_by(desc(Photo.uploaded_at))
        
        # 获取总数
        total = query.count()
        
        # 分页查询
        offset = (page - 1) * size
        photos = query.offset(offset).limit(size).all()
        
        # 构建响应数据
        photo_list = []
        for photo in photos:
            photo_dict = {
                'id': photo.id,
                'title': photo.title,
                'description': photo.description,
                'user_id': photo.user_id,
                'image_url': photo.image_url,
                'thumbnail_url': photo.thumbnail_url,
                'theme': photo.theme,
                'confidence': str(photo.confidence) if photo.confidence else None,
                'views': photo.views,
                'likes': photo.likes,
                'favorites': photo.favorites,
                'votes': photo.votes,
                'heat_score': str(photo.heat_score) if photo.heat_score else None,
                'competition_id': photo.competition_id,
                'is_approved': photo.is_approved,
                'uploaded_at': photo.uploaded_at.isoformat() if photo.uploaded_at else None,
                'updated_at': photo.updated_at.isoformat() if photo.updated_at else None
            }
            
            # 添加审核状态
            if photo.is_approved is None:
                photo_dict['approval_status'] = 'pending'
            elif photo.is_approved:
                photo_dict['approval_status'] = 'approved'
            else:
                photo_dict['approval_status'] = 'rejected'
            
            photo_list.append(photo_dict)
        
        return PaginatedResponse.create(
            items=photo_list,
            total=total,
            page=page,
            size=size
        )
    except Exception as e:
        print(f"Error in get_all_photos_for_admin: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取照片列表失败: {str(e)}"
        )


# 分析结果更新请求模型
class AnalysisUpdateRequest(BaseModel):
    theme: str
    confidence: float

@router.put("/photos/{photo_id}/analysis")
async def update_photo_analysis(
    photo_id: int,
    analysis_data: AnalysisUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """管理员更新照片分析结果"""
    try:
        # 查找照片
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="照片不存在"
            )
        
        # 更新分析结果
        photo.theme = analysis_data.theme
        photo.confidence = analysis_data.confidence
        photo.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "分析结果更新成功",
            "photo_id": photo_id,
            "theme": photo.theme,
            "confidence": photo.confidence
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_photo_analysis: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新分析结果失败: {str(e)}"
        )


@router.get("/photos/pending", response_model=PaginatedResponse)
async def get_pending_photos(
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取待审核的照片列表"""
    try:
        query = db.query(Photo).join(User, Photo.user_id == User.id).filter(
            Photo.approval_status == "pending"
        ).order_by(Photo.uploaded_at.desc())
        
        total = query.count()
        photos = query.offset(pagination.offset).limit(pagination.size).all()
        
        photo_list = []
        for photo in photos:
            photo_dict = PhotoInDB.model_validate(photo).model_dump()
            if photo.user:
                photo_dict['user'] = {
                    'id': photo.user.id,
                    'username': photo.user.username,
                    'avatar_url': photo.user.avatar_url,
                    'role': photo.user.role
                }
            else:
                photo_dict['user'] = None
            photo_list.append(photo_dict)
        
        return PaginatedResponse.create(
            items=photo_list,
            total=total,
            page=pagination.page,
            size=pagination.size
        )
    except Exception as e:
        print(f"Error in get_pending_photos: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取待审核照片失败: {str(e)}"
        )


@router.put("/photos/{photo_id}/approve", response_model=PhotoApprovalResponse)
async def approve_photo(
    photo_id: int,
    approval_data: PhotoApprovalRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """审核照片（通过或拒绝）"""
    try:
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="照片不存在"
            )
        
        if photo.approval_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该照片已经审核过了"
            )
        
        # 更新审核状态
        photo.approval_status = approval_data.approval_status
        photo.approval_notes = approval_data.approval_notes
        photo.approved_by = current_user.id
        photo.approved_at = datetime.utcnow()
        
        if approval_data.approval_status == "approved":
            photo.is_approved = True
            message = "照片审核通过"
        else:
            photo.is_approved = False
            message = "照片审核未通过"
        
        photo.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(photo)
        
        return PhotoApprovalResponse(
            id=photo.id,
            approval_status=photo.approval_status,
            approval_notes=photo.approval_notes,
            approved_by=photo.approved_by,
            approved_at=photo.approved_at,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in approve_photo: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"审核照片失败: {str(e)}"
        )


@router.get("/photos/approval-stats")
async def get_approval_statistics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取审核统计信息"""
    try:
        total_pending = db.query(Photo).filter(Photo.approval_status == "pending").count()
        total_approved = db.query(Photo).filter(Photo.approval_status == "approved").count()
        total_rejected = db.query(Photo).filter(Photo.approval_status == "rejected").count()
        
        # 今日审核统计
        today = datetime.utcnow().date()
        today_approved = db.query(Photo).filter(
            Photo.approval_status == "approved",
            func.date(Photo.approved_at) == today
        ).count()
        
        today_rejected = db.query(Photo).filter(
            Photo.approval_status == "rejected",
            func.date(Photo.approved_at) == today
        ).count()
        
        return {
            "total_pending": total_pending,
            "total_approved": total_approved,
            "total_rejected": total_rejected,
            "today_approved": today_approved,
            "today_rejected": today_rejected,
            "approval_rate": round(total_approved / (total_approved + total_rejected) * 100, 2) if (total_approved + total_rejected) > 0 else 0
        }
        
    except Exception as e:
        print(f"Error in get_approval_statistics: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取审核统计失败: {str(e)}"
        )


