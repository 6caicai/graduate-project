# 快速开始指南

## 🚀 5分钟快速启动

### 前提条件

确保您的系统已安装：
- Docker 和 Docker Compose
- Python 3.11+
- Node.js 18+
- Git

### 第一步：克隆项目并启动基础服务

```bash
# 克隆项目
git clone <项目地址>
cd campusphoto

# 启动数据库和Redis服务
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动（约5秒）
```

### 第二步：启动后端服务

打开新的终端窗口：

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境 (Windows)
venv\Scripts\activate
# 激活虚拟环境 (macOS/Linux)
# source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 第三步：启动前端服务

打开另一个新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端服务
npm run dev
```

### 第四步：访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🚀 一键启动脚本

为了方便开发，我们提供了多种启动脚本：

### Windows用户
```powershell
# PowerShell脚本（推荐，支持中文显示和彩色输出）
.\start-dev.ps1

# 批处理文件（英文版）
.\start-dev.bat

# 批处理文件（中文版）
.\启动开发环境.bat
```

### Linux/macOS用户
```bash
chmod +x start-dev.sh
./start-dev.sh
```

这些脚本会自动：
1. 启动数据库和Redis服务
2. 检查服务状态
3. 显示后续手动启动步骤
4. 提供访问地址和默认账户信息

## 🔑 默认账户

系统已预设以下测试账户：

| 用户名 | 密码 | 角色 | 描述 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理员 |
| photographer1 | admin123 | 摄影师 | 专业人像摄影师 |
| student1 | admin123 | 学生 | 摄影爱好者 |

## 📝 快速测试

### 1. 登录系统
访问 http://localhost:3000，使用上述账户登录

### 2. 测试API
访问 http://localhost:8000/docs 查看交互式API文档

### 3. 上传作品
登录后点击"上传作品"测试图像上传功能

### 4. 创建比赛
使用管理员账户创建摄影比赛

### 5. 预约摄影师
使用学生账户预约摄影师服务

## 🛠 开发工具

### 数据库管理
```bash
# 连接数据库
docker exec -it campusphoto_db psql -U campusphoto_user -d campusphoto

# 查看表结构
\dt

# 重置数据库
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Redis管理
```bash
# 连接Redis
docker exec -it campusphoto_redis redis-cli

# 查看所有键
keys *

# 清空缓存
flushall
```

### 代码检查
```bash
# 后端代码检查
cd backend
black .
isort .
flake8 .

# 前端代码检查
cd frontend
npm run lint
npm run type-check
```

## 🐛 常见问题

### Q: 后端启动失败，提示数据库连接错误
**A**: 确保数据库服务已启动：
```bash
docker-compose -f docker-compose.dev.yml ps
```
如果服务未启动，运行：
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Q: 前端页面空白或报错
**A**: 检查后端API是否正常运行：
```bash
curl http://localhost:8000/health
```

### Q: 图像上传失败
**A**: 确保uploads目录存在且有写权限：
```bash
mkdir -p uploads static/thumbnails
```

### Q: Docker服务启动失败
**A**: 检查端口是否被占用：
```bash
# Windows
netstat -an | findstr :5432
netstat -an | findstr :6379

# macOS/Linux
lsof -i :5432
lsof -i :6379
```

### Q: 依赖安装失败
**A**: 
- Python依赖：确保使用Python 3.11+
- Node.js依赖：确保使用Node.js 18+，可尝试清理缓存：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 下一步

1. **阅读完整文档**: 查看 [README.md](README.md)
2. **API接口文档**: 查看 [API.md](API.md)
3. **贡献代码**: 查看 [CONTRIBUTING.md](CONTRIBUTING.md)
4. **部署指南**: 查看README中的部署章节

## 🆘 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

1. 查看 [常见问题](#-常见问题) 部分
2. 查看项目 Issues: https://github.com/your-org/campusphoto/issues
3. 发送邮件: contact@campusphoto.com

祝您使用愉快！🎉

