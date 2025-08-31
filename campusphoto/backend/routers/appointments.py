"""
预约相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from datetime import datetime, timedelta

from models.database import get_db
from models.models import User, Appointment
from models.schemas import (
    AppointmentCreate, AppointmentInDB, AppointmentDetail, AppointmentUpdate,
    MessageResponse, PaginationParams, PaginatedResponse, UserInDB
)
from utils.auth import get_current_active_user, require_photographer, check_resource_owner

router = APIRouter()


@router.post("/", response_model=AppointmentInDB)
async def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建预约请求"""
    # 检查摄影师是否存在
    photographer = db.query(User).filter(
        User.id == appointment.photographer_id,
        User.role == "photographer",
        User.is_active == True
    ).first()
    
    if not photographer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="摄影师不存在或不可用"
        )
    
    # 检查时间是否在未来
    if appointment.preferred_time <= datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="预约时间必须在未来"
        )
    
    # 检查是否在合理的预约范围内（不超过30天）
    max_advance_days = 30
    if appointment.preferred_time > datetime.now() + timedelta(days=max_advance_days):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"预约时间不能超过{max_advance_days}天"
        )
    
    # 检查摄影师在该时间段是否已有预约
    existing_appointment = db.query(Appointment).filter(
        Appointment.photographer_id == appointment.photographer_id,
        Appointment.preferred_time == appointment.preferred_time,
        Appointment.status.in_(["pending", "accepted"])
    ).first()
    
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该时间段已被预约"
        )
    
    # 创建预约
    db_appointment = Appointment(
        student_id=current_user.id,
        photographer_id=appointment.photographer_id,
        title=appointment.title,
        description=appointment.description,
        preferred_time=appointment.preferred_time,
        location=appointment.location
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return AppointmentInDB.model_validate(db_appointment)


@router.get("/", response_model=PaginatedResponse)
async def get_appointments(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[str] = Query(None, description="状态筛选"),
    role_filter: Optional[str] = Query(None, description="角色筛选：student, photographer"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取预约列表"""
    query = db.query(Appointment)
    
    # 根据用户角色过滤
    if current_user.role == "student":
        query = query.filter(Appointment.student_id == current_user.id)
    elif current_user.role == "photographer":
        query = query.filter(Appointment.photographer_id == current_user.id)
    elif current_user.role == "admin":
        # 管理员可以查看所有预约
        if role_filter == "student":
            query = query.filter(Appointment.student_id == current_user.id)
        elif role_filter == "photographer":
            query = query.filter(Appointment.photographer_id == current_user.id)
    
    # 状态筛选
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    # 按创建时间倒序
    query = query.order_by(desc(Appointment.created_at))
    
    # 获取总数
    total = query.count()
    
    # 分页查询
    appointments = query.offset(pagination.offset).limit(pagination.size).all()
    
    # 转换为响应模型
    appointment_list = [AppointmentInDB.model_validate(appt) for appt in appointments]
    
    return PaginatedResponse.create(
        items=appointment_list,
        total=total,
        page=pagination.page,
        size=pagination.size
    )


@router.get("/{appointment_id}", response_model=AppointmentDetail)
async def get_appointment_detail(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取预约详情"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    if (current_user.role != "admin" and 
        current_user.id != appointment.student_id and 
        current_user.id != appointment.photographer_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限查看此预约"
        )
    
    # 构建详细信息
    appointment_detail = AppointmentDetail.model_validate(appointment)
    appointment_detail.student = UserInDB.model_validate(appointment.student)
    appointment_detail.photographer = UserInDB.model_validate(appointment.photographer)
    
    return appointment_detail


@router.put("/{appointment_id}", response_model=AppointmentInDB)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新预约信息"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    can_update = False
    if current_user.role == "admin":
        can_update = True
    elif current_user.id == appointment.student_id and appointment.status == "pending":
        can_update = True
    elif current_user.id == appointment.photographer_id:
        can_update = True
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限修改此预约"
        )
    
    # 更新预约信息
    update_data = appointment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.commit()
    db.refresh(appointment)
    
    return AppointmentInDB.model_validate(appointment)


@router.post("/{appointment_id}/accept", response_model=MessageResponse)
async def accept_appointment(
    appointment_id: int,
    actual_time: Optional[datetime] = None,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """接受预约（摄影师功能）"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    if current_user.id != appointment.photographer_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限操作此预约"
        )
    
    if appointment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能接受待处理的预约"
        )
    
    appointment.status = "accepted"
    appointment.actual_time = actual_time or appointment.preferred_time
    if notes:
        appointment.notes = notes
    
    db.commit()
    
    return MessageResponse(message="预约已接受")


@router.post("/{appointment_id}/reject", response_model=MessageResponse)
async def reject_appointment(
    appointment_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """拒绝预约（摄影师功能）"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    if current_user.id != appointment.photographer_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限操作此预约"
        )
    
    if appointment.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能拒绝待处理的预约"
        )
    
    appointment.status = "rejected"
    if notes:
        appointment.notes = notes
    
    db.commit()
    
    return MessageResponse(message="预约已拒绝")


@router.post("/{appointment_id}/complete", response_model=MessageResponse)
async def complete_appointment(
    appointment_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """完成预约（摄影师功能）"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    if current_user.id != appointment.photographer_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限操作此预约"
        )
    
    if appointment.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能完成已接受的预约"
        )
    
    appointment.status = "completed"
    if notes:
        appointment.notes = notes
    
    db.commit()
    
    return MessageResponse(message="预约已完成")


@router.post("/{appointment_id}/cancel", response_model=MessageResponse)
async def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """取消预约"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    if (current_user.id != appointment.student_id and 
        current_user.id != appointment.photographer_id and 
        current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限取消此预约"
        )
    
    if appointment.status in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无法取消已完成或已取消的预约"
        )
    
    # 检查取消时间限制（24小时内不能取消）
    if appointment.preferred_time <= datetime.now() + timedelta(hours=24):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="预约开始前24小时内不能取消"
        )
    
    appointment.status = "cancelled"
    db.commit()
    
    return MessageResponse(message="预约已取消")


@router.post("/{appointment_id}/rate", response_model=MessageResponse)
async def rate_appointment(
    appointment_id: int,
    rating: int = Query(..., ge=1, le=5),
    review: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """评价预约（学生功能）"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预约不存在"
        )
    
    # 检查权限
    if current_user.id != appointment.student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有学生可以评价预约"
        )
    
    if appointment.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能评价已完成的预约"
        )
    
    if appointment.rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该预约已经评价过了"
        )
    
    appointment.rating = rating
    appointment.review = review
    db.commit()
    
    return MessageResponse(message="评价提交成功")


@router.get("/photographer/{photographer_id}/schedule")
async def get_photographer_schedule(
    photographer_id: int,
    start_date: datetime = Query(..., description="开始日期"),
    end_date: datetime = Query(..., description="结束日期"),
    db: Session = Depends(get_db)
):
    """获取摄影师的预约日程"""
    # 检查摄影师是否存在
    photographer = db.query(User).filter(
        User.id == photographer_id,
        User.role == "photographer",
        User.is_active == True
    ).first()
    
    if not photographer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="摄影师不存在"
        )
    
    # 获取指定时间范围内的预约
    appointments = db.query(Appointment).filter(
        Appointment.photographer_id == photographer_id,
        Appointment.preferred_time >= start_date,
        Appointment.preferred_time <= end_date,
        Appointment.status.in_(["pending", "accepted", "completed"])
    ).order_by(Appointment.preferred_time).all()
    
    # 构建日程数据
    schedule = []
    for appointment in appointments:
        schedule.append({
            "id": appointment.id,
            "title": appointment.title,
            "time": appointment.preferred_time,
            "status": appointment.status,
            "student": UserInDB.model_validate(appointment.student)
        })
    
    return {
        "photographer": UserInDB.model_validate(photographer),
        "schedule": schedule
    }


@router.get("/my/statistics")
async def get_my_appointment_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取我的预约统计"""
    if current_user.role == "photographer":
        appointments = db.query(Appointment).filter(
            Appointment.photographer_id == current_user.id
        ).all()
        
        # 计算统计数据
        total = len(appointments)
        pending = len([a for a in appointments if a.status == "pending"])
        accepted = len([a for a in appointments if a.status == "accepted"])
        completed = len([a for a in appointments if a.status == "completed"])
        cancelled = len([a for a in appointments if a.status == "cancelled"])
        rejected = len([a for a in appointments if a.status == "rejected"])
        
        # 计算平均评分
        ratings = [a.rating for a in appointments if a.rating]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        
        return {
            "role": "photographer",
            "total": total,
            "pending": pending,
            "accepted": accepted,
            "completed": completed,
            "cancelled": cancelled,
            "rejected": rejected,
            "avg_rating": round(avg_rating, 2),
            "total_ratings": len(ratings)
        }
    
    else:  # student
        appointments = db.query(Appointment).filter(
            Appointment.student_id == current_user.id
        ).all()
        
        total = len(appointments)
        pending = len([a for a in appointments if a.status == "pending"])
        accepted = len([a for a in appointments if a.status == "accepted"])
        completed = len([a for a in appointments if a.status == "completed"])
        cancelled = len([a for a in appointments if a.status == "cancelled"])
        rejected = len([a for a in appointments if a.status == "rejected"])
        
        return {
            "role": "student",
            "total": total,
            "pending": pending,
            "accepted": accepted,
            "completed": completed,
            "cancelled": cancelled,
            "rejected": rejected
        }

