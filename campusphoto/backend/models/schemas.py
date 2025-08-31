"""
Pydantic 数据模式定义
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Any, Dict
from decimal import Decimal


# 基础模式
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# 用户相关模式
class UserBase(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str = Field(default="student", pattern="^(student|photographer|admin)$")
    bio: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserProfile(UserInDB):
    photos_count: int = 0
    followers_count: int = 0
    following_count: int = 0


# 认证相关模式
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserInDB


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None


# 作品相关模式
class PhotoBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class PhotoCreate(PhotoBase):
    competition_id: Optional[int] = None


class PhotoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class PhotoInDB(PhotoBase):
    id: int
    user_id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    theme: Optional[str] = None
    confidence: Optional[Decimal] = None
    views: int = 0
    likes: int = 0
    favorites: int = 0
    votes: int = 0
    heat_score: Decimal = 0
    competition_id: Optional[int] = None
    is_approved: bool = True
    uploaded_at: datetime
    updated_at: Optional[datetime] = None


class PhotoDetail(PhotoInDB):
    user: UserInDB
    competition: Optional['CompetitionInDB'] = None
    is_liked: bool = False
    is_favorited: bool = False
    is_voted: bool = False


# 比赛相关模式
class CompetitionBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    theme: Optional[str] = None
    start_time: datetime
    end_time: datetime
    voting_end_time: Optional[datetime] = None
    max_submissions: int = Field(default=3, ge=1, le=10)


class CompetitionCreate(CompetitionBase):
    rules: Optional[Dict[str, Any]] = None
    prizes: Optional[Dict[str, Any]] = None


class CompetitionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    theme: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    voting_end_time: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(draft|active|voting|closed)$")
    rules: Optional[Dict[str, Any]] = None
    prizes: Optional[Dict[str, Any]] = None
    max_submissions: Optional[int] = Field(None, ge=1, le=10)


class CompetitionInDB(CompetitionBase):
    id: int
    status: str
    rules: Optional[Dict[str, Any]] = None
    prizes: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CompetitionDetail(CompetitionInDB):
    photos_count: int = 0
    participants_count: int = 0
    photos: List[PhotoInDB] = []


# 预约相关模式
class AppointmentBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    preferred_time: datetime
    location: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    photographer_id: int


class AppointmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    preferred_time: Optional[datetime] = None
    actual_time: Optional[datetime] = None
    location: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|accepted|rejected|completed|cancelled)$")
    notes: Optional[str] = None


class AppointmentInDB(AppointmentBase):
    id: int
    student_id: int
    photographer_id: int
    actual_time: Optional[datetime] = None
    status: str
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    review: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class AppointmentDetail(AppointmentInDB):
    student: UserInDB
    photographer: UserInDB


# 交互相关模式
class InteractionCreate(BaseModel):
    photo_id: int
    type: str = Field(..., pattern="^(like|favorite|view|vote)$")


class InteractionInDB(InteractionCreate):
    id: int
    user_id: int
    created_at: datetime


# 排行榜相关模式
class RankingInDB(BaseSchema):
    id: int
    photo_id: int
    rank_type: str
    rank: int
    score: Decimal
    period: str
    calculated_at: datetime


class RankingDetail(RankingInDB):
    photo: PhotoDetail


# 配置相关模式
class ConfigurationBase(BaseSchema):
    key: str = Field(..., min_length=1, max_length=100)
    value: Dict[str, Any]
    description: Optional[str] = None
    category: str = Field(default="general", pattern="^(general|ranking|upload|competition)$")


class ConfigurationCreate(ConfigurationBase):
    pass


class ConfigurationUpdate(BaseModel):
    value: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    category: Optional[str] = Field(None, pattern="^(general|ranking|upload|competition)$")
    is_active: Optional[bool] = None


class ConfigurationInDB(ConfigurationBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


# 系统日志相关模式
class SystemLogCreate(BaseModel):
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class SystemLogInDB(SystemLogCreate):
    id: int
    user_id: Optional[int] = None
    created_at: datetime


# 分页相关模式
class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
    
    @classmethod
    def create(cls, items: List[Any], total: int, page: int, size: int):
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size
        )


# 响应模式
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


# 文件上传相关模式
class UploadResponse(BaseModel):
    url: str
    filename: str
    size: int
    content_type: str


# 统计相关模式
class StatisticsResponse(BaseModel):
    total_users: int = 0
    total_photos: int = 0
    total_competitions: int = 0
    total_appointments: int = 0
    active_competitions: int = 0
    photos_this_month: int = 0
    users_this_month: int = 0


# 图像分析相关模式
class ImageAnalysisResult(BaseModel):
    theme: str
    confidence: float
    tags: List[str] = []
    colors: List[str] = []
    
    
# 热度分析相关模式
class HeatScoreConfig(BaseModel):
    like_weight: float = 1.0
    favorite_weight: float = 2.0
    vote_weight: float = 3.0
    view_weight: float = 0.5
    comment_weight: float = 1.5
    time_decay_factor: float = 0.9


# 前向引用解决
PhotoDetail.model_rebuild()
CompetitionDetail.model_rebuild()

