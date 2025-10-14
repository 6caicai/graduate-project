"""
身份验证和授权工具
"""
from datetime import datetime, timedelta
from typing import Optional, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from config import settings
from models.database import get_db
from models.models import User
from models.schemas import TokenData

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Token Bearer
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """验证令牌"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        
        if username is None or user_id is None:
            raise credentials_exception
            
        token_data = TokenData(username=username, user_id=user_id, role=role)
        return token_data
    except JWTError:
        raise credentials_exception


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """验证用户"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    token = credentials.credentials
    token_data = verify_token(token)
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """获取当前活跃用户"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


class RoleChecker:
    """角色检查器"""
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return current_user


# 常用角色检查器
require_admin = RoleChecker(["admin"])
require_photographer = RoleChecker(["photographer", "admin"])
require_student = RoleChecker(["student", "photographer", "admin"])


def check_resource_owner(user: User, resource_user_id: int) -> bool:
    """检查资源所有权"""
    return user.id == resource_user_id or user.role == "admin"


def has_permission(user: User, action: str, resource: Any = None) -> bool:
    """检查用户权限"""
    # 管理员拥有所有权限
    if user.role == "admin":
        return True
    
    # 基于角色的权限控制
    permissions = {
        "student": [
            "photo:read",  # 学生只能查看照片，不能上传
            "appointment:create", "appointment:read_own", "appointment:update_own",
            "interaction:create", "interaction:read",  # 移除 competition:participate
            "profile:read", "profile:update_own"
        ],
        "photographer": [
            "photo:create", "photo:read", "photo:update_own", "photo:delete_own",
            "photo:review", "appointment:read", "appointment:update", "appointment:manage",
            "interaction:create", "interaction:read", "competition:participate",
            "profile:read", "profile:update_own", "analytics:read_own"
        ]
    }
    
    user_permissions = permissions.get(user.role, [])
    
    # 检查具体权限
    if action in user_permissions:
        return True
    
    # 检查资源所有权相关权限
    if resource and hasattr(resource, 'user_id'):
        if action.endswith('_own') and resource.user_id == user.id:
            return True
    
    return False

