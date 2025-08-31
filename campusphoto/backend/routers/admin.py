"""
管理员相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from models.database import get_db
from models.models import User, Photo, Competition, Appointment, Configuration, SystemLog
from models.schemas import (
    ConfigurationCreate, ConfigurationInDB, ConfigurationUpdate,
    SystemLogCreate, SystemLogInDB, MessageResponse, StatisticsResponse,
    PaginationParams, PaginatedResponse
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
    # 基础统计
    total_users = db.query(User).count()
    total_photos = db.query(Photo).count()
    total_competitions = db.query(Competition).count()
    total_appointments = db.query(Appointment).count()
    
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
    
    return StatisticsResponse(
        total_users=total_users,
        total_photos=total_photos,
        total_competitions=total_competitions,
        total_appointments=total_appointments,
        active_competitions=active_competitions,
        photos_this_month=photos_this_month,
        users_this_month=users_this_month
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


