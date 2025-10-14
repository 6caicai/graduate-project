# Redis 缓存策略优化实验使用说明

## 🎯 实验目标
通过对比6种不同的Redis缓存策略，找到最适合M4 MacBook Air单机部署环境的最优缓存方案，提升高校摄影平台的系统性能。

## 📋 实验环境要求

### 硬件要求
- **设备**: M4 MacBook Air (24GB内存, 8核CPU)
- **存储**: SSD ≥ 256GB
- **网络**: 稳定的网络连接

### 软件要求
- **操作系统**: macOS Sonoma 14.0+
- **Docker**: Docker Desktop 4.25.0+
- **Python**: Python 3.9+
- **k6**: 负载测试工具 (通过Homebrew安装)

## 🚀 快速开始

### 1. 安装依赖
```bash
# 安装k6负载测试工具
brew install k6

# 安装Python依赖
pip install redis matplotlib seaborn pandas numpy
```

### 2. 启动实验环境
```bash
# 启动Docker容器
docker-compose -f docker-compose.experiment.yml up -d

# 等待服务启动
sleep 30

# 检查服务状态
curl http://localhost:8000/api/experiment/status
```

### 3. 执行实验
```bash
# 运行完整实验
chmod +x run_experiment.sh
./run_experiment.sh
```

## 📊 实验策略说明

### 策略1: 无缓存基准 (Baseline)
- **描述**: 直接查询数据库，不使用任何缓存
- **用途**: 建立性能基准
- **预期**: 响应时间最长，数据库压力最大

### 策略2: Cache-Aside基础模式
- **描述**: 读写分离的经典缓存模式
- **实现**: 读时先查缓存，未命中则查DB并写入缓存；写时先更新DB再删缓存
- **TTL**: 固定300秒
- **预期**: 显著减少数据库查询，提升响应速度

### 策略3: Cache-Aside + 智能TTL
- **描述**: 基于数据热度动态调整过期时间
- **实现**: 热门数据TTL=600s，普通数据TTL=300s，冷门数据TTL=60s
- **预期**: 更好的缓存利用率，减少不必要的缓存更新

### 策略4: Write-Through模式
- **描述**: 写操作同时更新缓存和数据库
- **实现**: 读时优先从缓存读取，写时同时写入缓存和DB
- **预期**: 数据一致性最高，但写入性能可能受影响

### 策略5: Write-Behind异步模式
- **描述**: 异步更新数据库，提高写入性能
- **实现**: 立即更新缓存，异步更新DB
- **预期**: 写入性能最佳，但数据一致性风险较高

### 策略6: 混合策略
- **描述**: 结合多种策略的优势
- **实现**: 照片详情用智能TTL，排行榜用Write-Through，统计数据用Write-Behind
- **预期**: 综合性能最优

## 🔧 手动测试

### 测试单个策略
```bash
# 设置缓存策略
curl -X POST "http://localhost:8000/api/experiment/strategy/cache_aside"

# 测试照片详情API
curl "http://localhost:8000/api/experiment/photo/74?strategy=cache_aside"

# 测试排行榜API
curl "http://localhost:8000/api/experiment/rankings/photos?strategy=cache_aside&period=week&limit=20"
```

### 查看缓存指标
```bash
# 获取缓存统计
curl "http://localhost:8000/api/experiment/metrics"

# 清空缓存
curl -X POST "http://localhost:8000/api/experiment/cache/clear"
```

### 负载测试
```bash
# 运行k6负载测试
k6 run --duration=5m --vus=50 k6_load_test.js

# 查看测试结果
k6 run --out json=results.json k6_load_test.js
```

## 📈 监控指标

### 性能指标
- **平均响应时间**: 目标 ≤ 200ms
- **P95响应时间**: 目标 ≤ 300ms
- **错误率**: 目标 ≤ 1%
- **吞吐量**: RPS (每秒请求数)

### 缓存指标
- **命中率**: 目标 ≥ 80%
- **内存使用**: 目标 ≤ 1GB
- **键空间命中/未命中**: 缓存效率指标

### 系统指标
- **CPU使用率**: 目标 ≤ 40%
- **内存使用率**: 监控系统资源
- **数据库QPS**: 目标降低 ≥ 50%

## 📊 结果分析

### 查看实验报告
```bash
# 生成HTML报告
python3 scripts/generate_report.py

# 查看报告
open reports/experiment_report.html
```

### 关键指标对比
实验完成后，报告将包含：
- 6种策略的性能对比图表
- 缓存效率分析
- 最优策略推荐
- 实施建议和风险控制

## 🛠️ 故障排除

### 常见问题

#### 1. Docker服务启动失败
```bash
# 检查Docker状态
docker ps

# 重启Docker服务
docker-compose -f docker-compose.experiment.yml down
docker-compose -f docker-compose.experiment.yml up -d
```

#### 2. Redis连接失败
```bash
# 检查Redis状态
docker exec campusphoto_redis_experiment redis-cli ping

# 查看Redis日志
docker logs campusphoto_redis_experiment
```

#### 3. 后端服务无响应
```bash
# 检查后端状态
curl http://localhost:8000/health

# 查看后端日志
docker logs campusphoto_backend_experiment
```

#### 4. k6测试失败
```bash
# 检查k6安装
k6 version

# 测试简单请求
k6 run --duration=10s --vus=1 k6_load_test.js
```

### 性能调优

#### Redis配置优化
```bash
# 调整Redis内存限制
docker exec campusphoto_redis_experiment redis-cli CONFIG SET maxmemory 1gb

# 调整淘汰策略
docker exec campusphoto_redis_experiment redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

#### 数据库优化
```bash
# 查看PostgreSQL配置
docker exec campusphoto_postgres_experiment psql -U campusphoto_user -d campusphoto -c "SHOW shared_buffers;"
```

## 📝 实验记录

### 实验日志
- 实验开始时间: `date`
- 环境配置: Docker版本、Redis版本、PostgreSQL版本
- 测试数据量: 照片数量、用户数量
- 测试压力: RPS、持续时间

### 结果文件
- `results/`: 各策略的测试结果JSON文件
- `reports/`: 实验报告和图表
- `logs/`: 系统日志文件

## 🎯 验收标准

根据PRD要求，实验需要达到以下标准：

### 性能指标
- ✅ 核心场景平均响应延迟 ≤ 200ms
- ✅ 核心场景P95延迟 ≤ 300ms
- ✅ 数据库QPS降低 ≥ 50%
- ✅ Redis缓存命中率 ≥ 80%

### 资源指标
- ✅ Redis内存占用 ≤ 1GB
- ✅ CPU峰值占用 ≤ 40%
- ✅ 持续压力测试稳定性 (30分钟，错误率≤1%)

### 功能指标
- ✅ 缓存更新正确性 (延迟≤5s)
- ✅ 防缓存击穿有效性
- ✅ 排行榜数据一致性 (重合度≥90%)

## 📞 技术支持

如遇到问题，请检查：
1. 系统资源使用情况
2. Docker容器运行状态
3. 网络连接状况
4. 日志文件错误信息

实验完成后，将生成详细的HTML报告，包含所有测试结果、性能分析和实施建议。
