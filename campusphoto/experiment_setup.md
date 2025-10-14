# Redis 缓存策略优化实验环境准备

## 1. 硬件环境
- **设备**: M4 MacBook Air (24GB 内存, 8核CPU)
- **操作系统**: macOS Sonoma 14.0+
- **Docker**: Docker Desktop 4.25.0+

## 2. 软件依赖
```bash
# 安装 k6 负载测试工具
brew install k6

# 安装监控工具
pip install glances psutil

# 验证 Docker 环境
docker --version
docker-compose --version
```

## 3. 测试数据准备
- **照片数据**: 10,000 条作品记录
- **用户数据**: 5,000 个用户账户
- **交互数据**: 50,000 条点赞/投票记录

## 4. 实验容器配置
```yaml
# docker-compose.experiment.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    environment:
      - REDIS_PASSWORD=

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: campusphoto
      POSTGRES_USER: campusphoto_user
      POSTGRES_PASSWORD: campusphoto_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - redis
      - postgres
    environment:
      - DATABASE_URL=postgresql://campusphoto_user:campusphoto_password@postgres:5432/campusphoto
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app

volumes:
  redis_data:
  postgres_data:
```

## 5. 监控配置
- **Redis 监控**: 内存使用、命中率、连接数
- **PostgreSQL 监控**: QPS、连接数、查询延迟
- **系统监控**: CPU、内存、网络使用率
