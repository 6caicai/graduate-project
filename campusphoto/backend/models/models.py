"""
数据库模型定义
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, DECIMAL, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False, default="student")  # student, photographer, admin
    avatar_url = Column(String(500))
    bio = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    photos = relationship("Photo", back_populates="user")
    student_appointments = relationship("Appointment", foreign_keys="Appointment.student_id", back_populates="student")
    photographer_appointments = relationship("Appointment", foreign_keys="Appointment.photographer_id", back_populates="photographer")
    interactions = relationship("Interaction", back_populates="user")


class Photo(Base):
    """作品表"""
    __tablename__ = "photos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    image_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text)
    theme = Column(String(50))  # 自动识别的主题
    confidence = Column(DECIMAL(3, 2))  # AI识别置信度
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    favorites = Column(Integer, default=0)
    votes = Column(Integer, default=0)  # 比赛投票数
    heat_score = Column(DECIMAL(10, 2), default=0)  # 热度分数
    competition_id = Column(Integer, ForeignKey("competitions.id"))
    is_approved = Column(Boolean, default=True)  # 是否通过审核
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="photos")
    competition = relationship("Competition", back_populates="photos")
    interactions = relationship("Interaction", back_populates="photo")
    rankings = relationship("Ranking", back_populates="photo")


class Competition(Base):
    """比赛表"""
    __tablename__ = "competitions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    theme = Column(String(50))
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    voting_end_time = Column(DateTime(timezone=True))
    status = Column(String(20), default="draft")  # draft, active, voting, closed
    rules = Column(JSON)  # 比赛规则配置
    prizes = Column(JSON)  # 奖项设置
    max_submissions = Column(Integer, default=3)  # 每人最大投稿数
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    photos = relationship("Photo", back_populates="competition")


class Appointment(Base):
    """预约表"""
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    photographer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    preferred_time = Column(DateTime(timezone=True))
    actual_time = Column(DateTime(timezone=True))
    location = Column(String(200))
    status = Column(String(20), default="pending")  # pending, accepted, rejected, completed, cancelled
    notes = Column(Text)  # 摄影师备注
    rating = Column(Integer)  # 学生评分 1-5
    review = Column(Text)  # 学生评价
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    student = relationship("User", foreign_keys=[student_id], back_populates="student_appointments")
    photographer = relationship("User", foreign_keys=[photographer_id], back_populates="photographer_appointments")


class Interaction(Base):
    """交互记录表（点赞、收藏、浏览等）"""
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    type = Column(String(20), nullable=False)  # like, favorite, view, vote
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    user = relationship("User", back_populates="interactions")
    photo = relationship("Photo", back_populates="interactions")
    
    # 复合唯一索引，防止重复操作（除了view）
    __table_args__ = (
        # 对于like, favorite, vote，同一用户对同一作品只能操作一次
    )


class Ranking(Base):
    """排行榜表"""
    __tablename__ = "rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=False)
    rank_type = Column(String(20), nullable=False)  # weekly, monthly, competition_X
    rank = Column(Integer, nullable=False)
    score = Column(DECIMAL(10, 2), nullable=False)
    period = Column(String(50))  # 时间周期标识，如 "2024-W01", "2024-01", "comp_1"
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    photo = relationship("Photo", back_populates="rankings")


class Configuration(Base):
    """系统配置表"""
    __tablename__ = "configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(Text)
    category = Column(String(50), default="general")  # general, ranking, upload, competition
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SystemLog(Base):
    """系统日志表"""
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)  # 操作类型
    resource_type = Column(String(50))  # 资源类型：photo, user, competition, config
    resource_id = Column(Integer)  # 资源ID
    details = Column(JSON)  # 详细信息
    ip_address = Column(String(45))  # IPv4/IPv6地址
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    user = relationship("User")

