# API 文档

## 概述

高校摄影系统 API 基于 RESTful 设计，使用 JSON 格式进行数据交换。所有 API 均使用 HTTPS 协议，需要通过身份验证才能访问受保护的资源。

**Base URL**: `https://api.campusphoto.com`  
**API Version**: v1  
**Content-Type**: `application/json`

## 身份验证

### JWT Token 认证

除了公开接口外，所有 API 都需要在请求头中包含有效的 JWT Token：

```http
Authorization: Bearer <your_jwt_token>
```

### 获取 Token

```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "role": "student"
  }
}
```

## 错误处理

### 错误响应格式

```json
{
  "detail": "错误描述信息",
  "error_code": "ERROR_CODE",
  "status_code": 400
}
```

### 常见错误码

| HTTP 状态码 | 错误码 | 描述 |
|-------------|--------|------|
| 400 | VALIDATION_ERROR | 请求参数验证失败 |
| 401 | UNAUTHORIZED | 未授权访问 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 资源冲突 |
| 429 | RATE_LIMITED | 请求频率限制 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

## 分页

所有返回列表的 API 都支持分页：

### 分页参数

- `page`: 页码（从1开始，默认为1）
- `size`: 每页大小（默认为20，最大100）

### 分页响应

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "size": 20,
  "pages": 5
}
```

## API 接口

### 1. 认证接口

#### 1.1 用户注册

```http
POST /api/auth/register
```

**请求体**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "student",
  "bio": "摄影爱好者"
}
```

**响应**:
```json
{
  "id": 123,
  "username": "newuser",
  "email": "newuser@example.com",
  "role": "student",
  "bio": "摄影爱好者",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### 1.2 用户登录

```http
POST /api/auth/login
```

**请求体**:
```
Content-Type: application/x-www-form-urlencoded

username=student1&password=password123
```

#### 1.3 获取当前用户信息

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### 1.4 退出登录

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### 1.5 修改密码

```http
POST /api/auth/change-password
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}
```

### 2. 用户接口

#### 2.1 获取用户列表

```http
GET /api/users/?page=1&size=20&role=student&search=张三
Authorization: Bearer <admin_token>
```

**查询参数**:
- `page`: 页码
- `size`: 每页大小
- `role`: 角色筛选 (student/photographer/admin)
- `search`: 搜索用户名或邮箱

#### 2.2 获取用户资料

```http
GET /api/users/{user_id}/profile
```

#### 2.3 更新个人资料

```http
PUT /api/users/me
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "username": "newusername",
  "bio": "新的个人简介",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### 2.4 获取摄影师列表

```http
GET /api/users/photographers
```

#### 2.5 获取用户统计

```http
GET /api/users/me/statistics
Authorization: Bearer <token>
```

### 3. 作品接口

#### 3.1 获取作品列表

```http
GET /api/photos/?page=1&size=20&theme=校园风光&competition_id=1&sort_by=uploaded_at&sort_order=desc
```

**查询参数**:
- `theme`: 主题筛选
- `competition_id`: 比赛ID筛选
- `user_id`: 用户ID筛选
- `sort_by`: 排序字段 (uploaded_at/likes/views/heat_score)
- `sort_order`: 排序方向 (asc/desc)

#### 3.2 获取作品详情

```http
GET /api/photos/{photo_id}
```

**响应**:
```json
{
  "id": 1,
  "title": "夕阳下的校园",
  "description": "美丽的校园夕阳",
  "image_url": "https://example.com/photo.jpg",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "theme": "校园风光",
  "confidence": 0.95,
  "views": 1520,
  "likes": 245,
  "favorites": 89,
  "votes": 34,
  "heat_score": 1250.5,
  "user": {
    "id": 1,
    "username": "photographer1",
    "avatar_url": "https://example.com/avatar.jpg"
  },
  "competition": {
    "id": 1,
    "name": "春季摄影大赛"
  },
  "is_liked": false,
  "is_favorited": true,
  "is_voted": false,
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

#### 3.3 上传作品

```http
POST /api/photos/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**请求体**:
```
file: (binary)
title: 作品标题
description: 作品描述
competition_id: 1 (可选)
```

#### 3.4 更新作品信息

```http
PUT /api/photos/{photo_id}
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "title": "新标题",
  "description": "新描述"
}
```

#### 3.5 删除作品

```http
DELETE /api/photos/{photo_id}
Authorization: Bearer <token>
```

#### 3.6 作品交互

```http
POST /api/photos/{photo_id}/interact
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "photo_id": 1,
  "type": "like"
}
```

**交互类型**:
- `like`: 点赞
- `favorite`: 收藏
- `view`: 浏览
- `vote`: 投票

#### 3.7 获取我的作品

```http
GET /api/photos/me/photos?status_filter=approved
Authorization: Bearer <token>
```

**查询参数**:
- `status_filter`: 状态筛选 (approved/pending/rejected)

#### 3.8 获取作品主题列表

```http
GET /api/photos/themes/list
```

### 4. 比赛接口

#### 4.1 获取比赛列表

```http
GET /api/competitions/?page=1&size=20&status=active&theme=校园风光
```

**查询参数**:
- `status`: 状态筛选 (draft/active/voting/closed)
- `theme`: 主题筛选

#### 4.2 获取比赛详情

```http
GET /api/competitions/{competition_id}
```

#### 4.3 创建比赛

```http
POST /api/competitions/
Authorization: Bearer <admin_token>
```

**请求体**:
```json
{
  "name": "春季摄影大赛",
  "description": "捕捉春天的美丽",
  "theme": "校园风光",
  "start_time": "2024-03-01T00:00:00Z",
  "end_time": "2024-03-31T23:59:59Z",
  "voting_end_time": "2024-04-07T23:59:59Z",
  "max_submissions": 3,
  "rules": {
    "min_resolution": "1920x1080",
    "max_file_size": "10MB"
  },
  "prizes": {
    "first": "￥3000",
    "second": "￥2000",
    "third": "￥1000"
  }
}
```

#### 4.4 获取活跃比赛

```http
GET /api/competitions/active/list
```

#### 4.5 获取比赛作品

```http
GET /api/competitions/{competition_id}/photos?sort_by=votes
```

#### 4.6 获取比赛排行榜

```http
GET /api/competitions/{competition_id}/leaderboard?limit=10
```

#### 4.7 参加比赛

```http
POST /api/competitions/{competition_id}/join
Authorization: Bearer <token>
```

### 5. 预约接口

#### 5.1 获取预约列表

```http
GET /api/appointments/?page=1&size=20&status=pending&role_filter=student
Authorization: Bearer <token>
```

**查询参数**:
- `status`: 状态筛选 (pending/accepted/rejected/completed/cancelled)
- `role_filter`: 角色筛选 (student/photographer)

#### 5.2 获取预约详情

```http
GET /api/appointments/{appointment_id}
Authorization: Bearer <token>
```

#### 5.3 创建预约

```http
POST /api/appointments/
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "photographer_id": 2,
  "title": "毕业照拍摄",
  "description": "希望拍摄个人毕业照",
  "preferred_time": "2024-06-15T14:00:00Z",
  "location": "校园图书馆前"
}
```

#### 5.4 更新预约

```http
PUT /api/appointments/{appointment_id}
Authorization: Bearer <token>
```

#### 5.5 接受预约

```http
POST /api/appointments/{appointment_id}/accept
Authorization: Bearer <photographer_token>
```

**请求体**:
```json
{
  "actual_time": "2024-06-15T15:00:00Z",
  "notes": "准备好身份证和学位证"
}
```

#### 5.6 拒绝预约

```http
POST /api/appointments/{appointment_id}/reject
Authorization: Bearer <photographer_token>
```

#### 5.7 完成预约

```http
POST /api/appointments/{appointment_id}/complete
Authorization: Bearer <photographer_token>
```

#### 5.8 取消预约

```http
POST /api/appointments/{appointment_id}/cancel
Authorization: Bearer <token>
```

#### 5.9 评价预约

```http
POST /api/appointments/{appointment_id}/rate?rating=5
Authorization: Bearer <student_token>
```

**请求体**:
```json
{
  "review": "服务很好，拍摄效果很满意！"
}
```

#### 5.10 获取摄影师日程

```http
GET /api/appointments/photographer/{photographer_id}/schedule?start_date=2024-06-01&end_date=2024-06-30
```

### 6. 分析接口

#### 6.1 获取热度排行榜

```http
GET /api/analytics/rankings/hot?limit=20&period=weekly&theme=校园风光
```

**查询参数**:
- `limit`: 返回数量 (1-100)
- `period`: 时间周期 (weekly/monthly/all)
- `theme`: 主题筛选

#### 6.2 获取比赛排行榜

```http
GET /api/analytics/rankings/competition/{competition_id}?limit=20
```

#### 6.3 获取用户统计

```http
GET /api/analytics/user-stats/{user_id}
```

#### 6.4 获取趋势分析

```http
GET /api/analytics/trending?hours=24&limit=10
```

#### 6.5 重新计算热度分数

```http
GET /api/analytics/heat-score/recalculate
Authorization: Bearer <admin_token>
```

### 7. 管理接口

#### 7.1 获取仪表板统计

```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### 7.2 获取所有配置

```http
GET /api/admin/config
Authorization: Bearer <admin_token>
```

#### 7.3 更新配置

```http
PUT /api/admin/config/{config_id}
Authorization: Bearer <admin_token>
```

**请求体**:
```json
{
  "value": {
    "value": 10,
    "enabled": true
  },
  "description": "更新后的描述"
}
```

#### 7.4 获取系统日志

```http
GET /api/admin/logs?page=1&size=50&action=login&user_id=1
Authorization: Bearer <admin_token>
```

#### 7.5 批量审核作品

```http
POST /api/admin/bulk-actions/approve-photos
Authorization: Bearer <admin_token>
```

**请求体**:
```json
{
  "photo_ids": [1, 2, 3, 4, 5]
}
```

### 8. 公共配置接口

#### 8.1 获取公开配置

```http
GET /api/config/public
```

**响应**:
```json
{
  "upload": {
    "max_file_size": 10485760,
    "allowed_extensions": ["jpg", "jpeg", "png", "webp"],
    "daily_limit": 5
  },
  "features": {
    "ai_tagging": true,
    "competitions": true,
    "appointments": true,
    "rankings": true
  }
}
```

## 速率限制

为了保护系统资源，我们对 API 请求实施了速率限制：

| 用户类型 | 限制 |
|----------|------|
| 匿名用户 | 100 请求/小时 |
| 认证用户 | 1000 请求/小时 |
| 管理员 | 5000 请求/小时 |

当触发速率限制时，API 会返回 `429 Too Many Requests` 状态码。

## WebSocket 接口

### 连接地址

```
wss://api.campusphoto.com/ws
```

### 认证

在建立 WebSocket 连接时需要传递 JWT Token：

```javascript
const ws = new WebSocket('wss://api.campusphoto.com/ws?token=your_jwt_token');
```

### 消息格式

```json
{
  "type": "notification",
  "data": {
    "title": "新的点赞",
    "message": "用户 张三 点赞了你的作品",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## SDK 和示例

### JavaScript/TypeScript

```javascript
// 使用 fetch
const response = await fetch('https://api.campusphoto.com/api/photos/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// 使用 axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.campusphoto.com',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const photos = await api.get('/api/photos/');
```

### Python

```python
import requests

# 设置认证头
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# 获取作品列表
response = requests.get(
    'https://api.campusphoto.com/api/photos/',
    headers=headers
)
photos = response.json()

# 上传作品
files = {'file': open('photo.jpg', 'rb')}
data = {
    'title': '美丽风景',
    'description': '在校园拍摄的风景照'
}
response = requests.post(
    'https://api.campusphoto.com/api/photos/upload',
    files=files,
    data=data,
    headers={'Authorization': f'Bearer {token}'}
)
```

## 更新日志

### v1.0.0 (2024-01-15)
- 初始 API 版本发布
- 支持用户认证、作品管理、比赛系统、预约功能
- 支持图像识别和热度排行榜

---

如有任何问题或建议，请联系我们：contact@campusphoto.com



