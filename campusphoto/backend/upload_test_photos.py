#!/usr/bin/env python3
"""
上传测试照片并验证排行榜功能
"""
import os
import sys
import requests
import json
from datetime import datetime
import random

# 添加项目路径
sys.path.append('/Users/caizhuoqi/Code/graduate-project/campusphoto/backend')

from models.database import SessionLocal
from models.models import Photo, User

def upload_test_photos():
    """上传测试照片到数据库"""
    db = SessionLocal()
    try:
        # 获取一个用户ID（使用admin用户）
        user = db.query(User).filter(User.username == 'admin').first()
        if not user:
            print("找不到admin用户")
            return
        
        print(f"使用用户: {user.username} (ID: {user.id})")
        
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
        
        photos_dir = "/Users/caizhuoqi/Code/graduate-project/campusphoto/photos"
        
        for i, info in enumerate(photos_info):
            file_path = os.path.join(photos_dir, info["file"])
            
            if not os.path.exists(file_path):
                print(f"文件不存在: {file_path}")
                continue
            
            # 创建照片记录
            photo = Photo(
                user_id=user.id,
                title=info["title"],
                description=f"这是{info['title']}的测试照片",
                image_url=f"/static/uploads/{info['file']}",
                thumbnail_url=f"/static/thumbnails/{info['file'].replace('.jpg', '_thumb.jpg')}",
                theme=info["theme"],
                confidence=0.9,
                views=random.randint(50, 200),
                likes=random.randint(20, 80),
                favorites=random.randint(5, 25),
                votes=random.randint(2, 10),
                is_approved=True,
                approval_status='approved',
                uploaded_at=datetime.utcnow()  # 使用当前时间
            )
            
            # 计算热度分数
            photo.heat_score = (
                photo.likes * 0.4 +
                photo.views * 0.3 +
                photo.favorites * 0.2 +
                photo.votes * 0.1
            )
            
            db.add(photo)
            print(f"添加照片: {photo.title} (热度: {photo.heat_score:.2f})")
        
        db.commit()
        print(f"成功上传 {len(photos_info)} 张测试照片")
        
        # 验证排行榜
        print("\n验证排行榜API:")
        test_rankings()
        
    except Exception as e:
        print(f"上传失败: {e}")
        db.rollback()
    finally:
        db.close()

def test_rankings():
    """测试排行榜API"""
    try:
        # 测试本周排行榜
        response = requests.get("http://localhost:8000/api/rankings/photos?period=week&limit=10")
        if response.status_code == 200:
            data = response.json()
            print(f"本周排行榜: {len(data)} 张照片")
            for i, photo in enumerate(data[:3]):
                print(f"  {i+1}. {photo['title']} (热度: {photo['heat_score']})")
        else:
            print(f"排行榜API错误: {response.status_code}")
        
        # 测试全部时间排行榜
        response = requests.get("http://localhost:8000/api/rankings/photos?period=all&limit=10")
        if response.status_code == 200:
            data = response.json()
            print(f"全部时间排行榜: {len(data)} 张照片")
            for i, photo in enumerate(data[:3]):
                print(f"  {i+1}. {photo['title']} (热度: {photo['heat_score']})")
        else:
            print(f"排行榜API错误: {response.status_code}")
            
    except Exception as e:
        print(f"测试排行榜失败: {e}")

if __name__ == "__main__":
    upload_test_photos()
