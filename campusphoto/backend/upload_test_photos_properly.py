#!/usr/bin/env python3
"""
正确上传测试照片：复制文件并生成缩略图
"""
import os
import sys
import shutil
from PIL import Image
from datetime import datetime
import random

# 添加项目路径
sys.path.append('/Users/caizhuoqi/Code/graduate-project/campusphoto/backend')

from models.database import SessionLocal
from models.models import Photo, User

def create_thumbnail(image_path, thumbnail_path, size=(300, 300)):
    """创建缩略图"""
    try:
        with Image.open(image_path) as img:
            # 转换为RGB模式（处理RGBA图片）
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # 创建缩略图
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # 保存缩略图
            img.save(thumbnail_path, 'JPEG', quality=85)
            return True
    except Exception as e:
        print(f"创建缩略图失败: {e}")
        return False

def upload_test_photos_properly():
    """正确上传测试照片"""
    db = SessionLocal()
    try:
        # 获取admin用户
        user = db.query(User).filter(User.username == 'admin').first()
        if not user:
            print("找不到admin用户")
            return
        
        print(f"使用用户: {user.username} (ID: {user.id})")
        
        # 设置路径
        source_dir = "/Users/caizhuoqi/Code/graduate-project/campusphoto/photos"
        uploads_dir = "/Users/caizhuoqi/Code/graduate-project/campusphoto/backend/static/uploads"
        thumbnails_dir = "/Users/caizhuoqi/Code/graduate-project/campusphoto/backend/static/thumbnails"
        
        # 确保目录存在
        os.makedirs(uploads_dir, exist_ok=True)
        os.makedirs(thumbnails_dir, exist_ok=True)
        
        # 照片信息
        photos_info = [
            {"file": "test1.jpg", "title": "自然风光测试1", "theme": "自然风光"},
            {"file": "test2.jpg", "title": "人像测试1", "theme": "人像"},
            {"file": "test3.jpg", "title": "城市建筑测试1", "theme": "城市与建筑"},
            {"file": "test4.jpg", "title": "动物植物测试1", "theme": "动物与植物"},
            {"file": "test5.jpg", "title": "自然风光测试2", "theme": "自然风光"},
            {"file": "test6.jpg", "title": "人像测试2", "theme": "人像"},
            {"file": "test7.jpg", "title": "城市建筑测试2", "theme": "城市与建筑"},
            {"file": "test8.jpg", "title": "动物植物测试2", "theme": "动物与植物"},
        ]
        
        # 删除之前的测试照片记录
        old_photos = db.query(Photo).filter(Photo.title.like('%测试%')).all()
        for photo in old_photos:
            db.delete(photo)
        db.commit()
        print(f"删除了 {len(old_photos)} 张旧的测试照片记录")
        
        for i, info in enumerate(photos_info):
            source_path = os.path.join(source_dir, info["file"])
            
            if not os.path.exists(source_path):
                print(f"源文件不存在: {source_path}")
                continue
            
            # 生成唯一的文件名
            timestamp = int(datetime.utcnow().timestamp())
            unique_filename = f"{info['file'].replace('.jpg', '')}_{timestamp}.jpg"
            thumbnail_filename = f"{info['file'].replace('.jpg', '')}_{timestamp}_thumb_300x300.jpg"
            
            # 目标路径
            upload_path = os.path.join(uploads_dir, unique_filename)
            thumbnail_path = os.path.join(thumbnails_dir, thumbnail_filename)
            
            # 复制原图
            shutil.copy2(source_path, upload_path)
            print(f"复制原图: {info['file']} -> {unique_filename}")
            
            # 创建缩略图
            if create_thumbnail(upload_path, thumbnail_path):
                print(f"创建缩略图: {thumbnail_filename}")
            else:
                print(f"缩略图创建失败: {info['file']}")
                continue
            
            # 创建数据库记录
            photo = Photo(
                user_id=user.id,
                title=info["title"],
                description=f"这是{info['title']}的测试照片",
                image_url=f"/static/uploads/{unique_filename}",
                thumbnail_url=f"/static/thumbnails/{thumbnail_filename}",
                theme=info["theme"],
                confidence=0.9,
                views=random.randint(50, 200),
                likes=random.randint(20, 80),
                favorites=random.randint(5, 25),
                votes=random.randint(2, 10),
                is_approved=True,
                approval_status='approved',
                uploaded_at=datetime.utcnow()
            )
            
            # 计算热度分数
            photo.heat_score = (
                photo.likes * 0.4 +
                photo.views * 0.3 +
                photo.favorites * 0.2 +
                photo.votes * 0.1
            )
            
            db.add(photo)
            print(f"添加数据库记录: {photo.title} (热度: {photo.heat_score:.2f})")
        
        db.commit()
        print(f"成功上传 {len(photos_info)} 张测试照片")
        
        # 验证结果
        print("\n验证上传结果:")
        test_photos = db.query(Photo).filter(Photo.title.like('%测试%')).all()
        for photo in test_photos:
            print(f"  {photo.title}: {photo.image_url}")
            # 检查文件是否存在
            image_path = f"/Users/caizhuoqi/Code/graduate-project/campusphoto/backend{photo.image_url}"
            thumbnail_path = f"/Users/caizhuoqi/Code/graduate-project/campusphoto/backend{photo.thumbnail_url}"
            print(f"    原图存在: {os.path.exists(image_path)}")
            print(f"    缩略图存在: {os.path.exists(thumbnail_path)}")
        
    except Exception as e:
        print(f"上传失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    upload_test_photos_properly()
