# 高校摄影系统 (CampusPhoto System)

一个专为高校学生打造的摄影作品展示、比赛参与和摄影师预约平台。

## 功能特色

### 🎯 核心功能

- **作品展示** - 上传分享摄影作品，支持自动主题识别
- **摄影比赛** - 参与各类摄影比赛，展现创意才华
- **摄影师预约** - 预约专业摄影师，记录美好时光
- **排行榜系统** - 基于AI算法的热度排行榜
- **用户系统** - 多角色权限管理（学生/摄影师/管理员）

### 🤖 智能功能

- **图像识别** - 基于OpenCV的自动主题分类
- **热度算法** - 智能计算作品热度分数
- **动态配置** - 可视化系统配置管理
- **数据分析** - 丰富的统计图表和趋势分析

### 🎨 用户体验

- **响应式设计** - 完美适配PC和移动端
- **暗黑模式** - 支持浅色/深色主题切换
- **实时通知** - 重要事件及时推送
- **搜索功能** - 快速找到感兴趣的内容

## 技术架构

### 前端技术栈

- **框架**: Next.js 14 + TypeScript
- **样式**: Tailwind CSS + Headless UI
- **状态管理**: React Query
- **动画**: Framer Motion
- **图标**: Heroicons

### 后端技术栈

- **框架**: FastAPI + Python 3.11
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **图像处理**: OpenCV + PIL
- **异步任务**: Celery
- **认证**: JWT + OAuth

### 基础设施

- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **存储**: Cloudflare R2
- **CDN**: Cloudflare
- **部署**: Vercel + 自托管

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### 使用Docker运行（推荐）

1. **克隆项目**
```bash
git clone https://github.com/your-org/campusphoto.git
cd campusphoto
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑配置文件
nano backend/.env
nano frontend/.env
```

3. **启动服务**
```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose --profile production up -d
```

4. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

### 本地开发

#### 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env

# 运行数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

## 项目结构

```
campusphoto/
├── backend/                 # FastAPI 后端服务
│   ├── main.py             # 应用入口
│   ├── models/             # 数据模型
│   ├── routers/            # API路由
│   ├── services/           # 业务逻辑
│   ├── utils/              # 工具函数
│   └── requirements.txt    # Python依赖
├── frontend/               # Next.js 前端应用
│   ├── app/                # App Router目录
│   ├── components/         # React组件
│   ├── lib/                # 工具库
│   ├── types/              # TypeScript类型
│   └── package.json        # Node.js依赖
├── nginx/                  # Nginx配置
├── database/               # 数据库脚本
├── docker-compose.yml      # Docker编排
└── README.md              # 项目文档
```

## API文档

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户 |
| POST | `/api/auth/logout` | 用户登出 |

### 作品接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/photos/` | 获取作品列表 |
| POST | `/api/photos/upload` | 上传作品 |
| GET | `/api/photos/{id}` | 获取作品详情 |
| PUT | `/api/photos/{id}` | 更新作品信息 |
| DELETE | `/api/photos/{id}` | 删除作品 |

### 比赛接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/competitions/` | 获取比赛列表 |
| POST | `/api/competitions/` | 创建比赛 |
| GET | `/api/competitions/{id}` | 获取比赛详情 |
| POST | `/api/competitions/{id}/join` | 参加比赛 |

### 预约接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/appointments/` | 获取预约列表 |
| POST | `/api/appointments/` | 创建预约 |
| POST | `/api/appointments/{id}/accept` | 接受预约 |
| POST | `/api/appointments/{id}/complete` | 完成预约 |

完整API文档请访问: http://localhost:8000/docs

## 数据库设计

### 核心表结构

- **users** - 用户信息
- **photos** - 作品信息
- **competitions** - 比赛信息
- **appointments** - 预约信息
- **interactions** - 交互记录
- **rankings** - 排行榜
- **configurations** - 系统配置

详细的数据库设计请参考 `database/init.sql`

## 部署指南

### Vercel部署（前端）

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署前端
cd frontend
vercel --prod
```

### Docker部署（后端）

```bash
# 构建镜像
docker build -t campusphoto-backend ./backend

# 运行容器
docker run -d \
  --name campusphoto-backend \
  -p 8000:8000 \
  -e DATABASE_URL="your-database-url" \
  campusphoto-backend
```

### 环境变量配置

#### 后端环境变量

```env
# 数据库
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379

# JWT配置
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Cloudflare R2
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=campusphoto-images

# 系统配置
DEBUG=false
CORS_ORIGINS=https://your-domain.com
```

#### 前端环境变量

```env
# API配置
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# 其他配置
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 开发指南

### 代码规范

- **Python**: 使用 Black + isort 格式化
- **TypeScript**: 使用 Prettier + ESLint
- **提交信息**: 遵循 Conventional Commits

### 测试

```bash
# 后端测试
cd backend
pytest

# 前端测试
cd frontend
npm test
```

### 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 常见问题

### Q: 如何重置数据库？

```bash
docker-compose down -v
docker-compose up -d db
```

### Q: 如何查看日志？

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### Q: 如何更新依赖？

```bash
# 后端依赖
pip freeze > requirements.txt

# 前端依赖
npm update
```

### Q: 图像识别不工作？

确保安装了 OpenCV 相关依赖：

```bash
pip install opencv-python opencv-contrib-python
```

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

- 项目地址: https://github.com/your-org/campusphoto
- 问题反馈: https://github.com/your-org/campusphoto/issues
- 邮箱: contact@campusphoto.com

## 致谢

感谢所有为这个项目做出贡献的开发者！

---

**开发状态**: 🚧 开发中

**最后更新**: 2024年4月

Made with ❤️ for photography enthusiasts



