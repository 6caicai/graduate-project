"""
作品相关路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
import os
import tempfile
from datetime import datetime

from models.database import get_db
from models.models import User, Photo, Interaction, Competition
from models.schemas import (
    PhotoCreate, PhotoInDB, PhotoDetail, PhotoUpdate, InteractionCreate,
    MessageResponse, PaginationParams, PaginatedResponse
)
from utils.auth import get_current_active_user, require_photographer, check_resource_owner
from utils.image_analyzer import image_analyzer
from utils.config_manager import get_config_manager

router = APIRouter()


@router.post("/upload", response_model=PhotoInDB)
async def upload_photo(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    competition_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """上传作品"""
    config_manager = get_config_manager()
    
    # 检查每日上传限制
    today = datetime.now().date()
    today_uploads = db.query(Photo).filter(
        Photo.user_id == current_user.id,
        func.date(Photo.uploaded_at) == today
    ).count()
    
    daily_limit = config_manager.get_upload_limit()
    if today_uploads >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"每日上传限制为 {daily_limit} 张"
        )
    
    # 检查文件大小
    max_size = config_manager.get_max_file_size()
    if file.size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"文件大小超过限制 ({max_size} bytes)"
        )
    
    # 检查文件类型
    allowed_extensions = config_manager.get_allowed_extensions()
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型，支持: {', '.join(allowed_extensions)}"
        )
    
    # 检查比赛是否存在且开放投稿
    if competition_id:
        competition = db.query(Competition).filter(Competition.id == competition_id).first()
        if not competition:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="比赛不存在"
            )
        if competition.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="比赛未开放投稿"
            )
    
    # 保存临时文件
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}")
    contents = await file.read()
    temp_file.write(contents)
    temp_file.close()
    
    try:
        # 图像分析
        analysis_result = image_analyzer.analyze_image(temp_file.name)
        
        # 创建缩略图
        thumbnail_path = image_analyzer.create_thumbnail(temp_file.name)
        
        # 在实际项目中，这里应该上传到 Cloudflare R2
        # 目前使用本地路径模拟
        image_url = f"/static/uploads/{file.filename}"
        thumbnail_url = f"/static/thumbnails/{os.path.basename(thumbnail_path)}"
        
        # 创建作品记录
        photo = Photo(
            user_id=current_user.id,
            title=title,
            description=description,
            image_url=image_url,
            thumbnail_url=thumbnail_url,
            theme=analysis_result.get("theme"),
            confidence=analysis_result.get("confidence"),
            competition_id=competition_id
        )
        
        db.add(photo)
        db.commit()
        db.refresh(photo)
        
        return PhotoInDB.model_validate(photo)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"图片处理失败: {str(e)}"
        )
    finally:
        # 清理临时文件
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)


@router.get("/", response_model=PaginatedResponse)
async def get_photos(
    pagination: PaginationParams = Depends(),
    theme: Optional[str] = Query(None, description="按主题筛选"),
    competition_id: Optional[int] = Query(None, description="按比赛筛选"),
    user_id: Optional[int] = Query(None, description="按用户筛选"),
    sort_by: str = Query("uploaded_at", description="排序字段"),
    sort_order: str = Query("desc", description="排序方向"),
    db: Session = Depends(get_db)
):
    """获取作品列表"""
    query = db.query(Photo).filter(Photo.is_approved == True)
    
    # 主题筛选
    if theme:
        query = query.filter(Photo.theme == theme)
    
    # 比赛筛选
    if competition_id:
        query = query.filter(Photo.competition_id == competition_id)
    
    # 用户筛选
    if user_id:
        query = query.filter(Photo.user_id == user_id)
    
    # 排序
    if sort_order.lower() == "desc":
        query = query.order_by(desc(getattr(Photo, sort_by)))
    else:
        query = query.order_by(getattr(Photo, sort_by))
    
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


@router.get("/{photo_id}", response_model=PhotoDetail)
async def get_photo_detail(
    photo_id: int,
    current_user: Optional[User] = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取作品详情"""
    photo = db.query(Photo).filter(
        Photo.id == photo_id,
        Photo.is_approved == True
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    # 增加浏览量
    photo.views += 1
    
    # 记录浏览交互
    if current_user:
        existing_view = db.query(Interaction).filter(
            Interaction.user_id == current_user.id,
            Interaction.photo_id == photo_id,
            Interaction.type == "view"
        ).first()
        
        if not existing_view:
            view_interaction = Interaction(
                user_id=current_user.id,
                photo_id=photo_id,
                type="view"
            )
            db.add(view_interaction)
    
    db.commit()
    
    # 构建详细信息
    photo_detail = PhotoDetail.model_validate(photo)
    photo_detail.user = photo.user
    photo_detail.competition = photo.competition
    
    # 检查当前用户的交互状态
    if current_user:
        photo_detail.is_liked = db.query(Interaction).filter(
            Interaction.user_id == current_user.id,
            Interaction.photo_id == photo_id,
            Interaction.type == "like"
        ).first() is not None
        
        photo_detail.is_favorited = db.query(Interaction).filter(
            Interaction.user_id == current_user.id,
            Interaction.photo_id == photo_id,
            Interaction.type == "favorite"
        ).first() is not None
        
        photo_detail.is_voted = db.query(Interaction).filter(
            Interaction.user_id == current_user.id,
            Interaction.photo_id == photo_id,
            Interaction.type == "vote"
        ).first() is not None
    
    return photo_detail


@router.put("/{photo_id}", response_model=PhotoInDB)
async def update_photo(
    photo_id: int,
    photo_update: PhotoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新作品信息"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    # 检查权限
    if not check_resource_owner(current_user, photo.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限修改此作品"
        )
    
    # 更新作品信息
    update_data = photo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(photo, field, value)
    
    db.commit()
    db.refresh(photo)
    
    return PhotoInDB.model_validate(photo)


@router.delete("/{photo_id}", response_model=MessageResponse)
async def delete_photo(
    photo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除作品"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    # 检查权限
    if not check_resource_owner(current_user, photo.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此作品"
        )
    
    # 删除相关交互记录
    db.query(Interaction).filter(Interaction.photo_id == photo_id).delete()
    
    # 删除作品
    db.delete(photo)
    db.commit()
    
    return MessageResponse(message="作品删除成功")


@router.post("/{photo_id}/interact", response_model=MessageResponse)
async def interact_with_photo(
    photo_id: int,
    interaction: InteractionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """与作品交互（点赞、收藏、投票）"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    # 检查是否已有相同类型的交互
    existing_interaction = db.query(Interaction).filter(
        Interaction.user_id == current_user.id,
        Interaction.photo_id == photo_id,
        Interaction.type == interaction.type
    ).first()
    
    if existing_interaction:
        if interaction.type == "view":
            # 浏览记录可以重复
            pass
        else:
            # 取消交互
            db.delete(existing_interaction)
            
            # 更新计数
            if interaction.type == "like":
                photo.likes = max(0, photo.likes - 1)
            elif interaction.type == "favorite":
                photo.favorites = max(0, photo.favorites - 1)
            elif interaction.type == "vote":
                photo.votes = max(0, photo.votes - 1)
            
            db.commit()
            return MessageResponse(message=f"已取消{interaction.type}")
    else:
        # 创建新交互
        new_interaction = Interaction(
            user_id=current_user.id,
            photo_id=photo_id,
            type=interaction.type
        )
        db.add(new_interaction)
        
        # 更新计数
        if interaction.type == "like":
            photo.likes += 1
        elif interaction.type == "favorite":
            photo.favorites += 1
        elif interaction.type == "vote":
            photo.votes += 1
        elif interaction.type == "view":
            photo.views += 1
        
        db.commit()
        return MessageResponse(message=f"已{interaction.type}")


@router.post("/{photo_id}/approve", response_model=MessageResponse)
async def approve_photo(
    photo_id: int,
    current_user: User = Depends(require_photographer),
    db: Session = Depends(get_db)
):
    """审核通过作品（摄影师/管理员功能）"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    photo.is_approved = True
    db.commit()
    
    return MessageResponse(message="作品审核通过")


@router.post("/{photo_id}/reject", response_model=MessageResponse)
async def reject_photo(
    photo_id: int,
    current_user: User = Depends(require_photographer),
    db: Session = Depends(get_db)
):
    """审核拒绝作品（摄影师/管理员功能）"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="作品不存在"
        )
    
    photo.is_approved = False
    db.commit()
    
    return MessageResponse(message="作品审核拒绝")


@router.get("/themes/list")
async def get_photo_themes(db: Session = Depends(get_db)):
    """获取作品主题列表"""
    themes = db.query(Photo.theme).filter(
        Photo.theme.isnot(None),
        Photo.is_approved == True
    ).distinct().all()
    
    theme_list = [theme[0] for theme in themes if theme[0]]
    
    return {"themes": theme_list}


@router.get("/me/photos", response_model=PaginatedResponse)
async def get_my_photos(
    pagination: PaginationParams = Depends(),
    status_filter: Optional[str] = Query(None, description="状态筛选：approved, pending, rejected"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取我的作品列表"""
    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    
    # 状态筛选
    if status_filter == "approved":
        query = query.filter(Photo.is_approved == True)
    elif status_filter == "pending":
        query = query.filter(Photo.is_approved.is_(None))
    elif status_filter == "rejected":
        query = query.filter(Photo.is_approved == False)
    
    # 按上传时间倒序
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

