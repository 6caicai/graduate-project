# 高校摄影系统 Makefile

.PHONY: help dev build start stop clean test lint format install

# 默认目标
help:
	@echo "高校摄影系统 - 可用命令："
	@echo ""
	@echo "开发命令："
	@echo "  dev          启动开发环境"
	@echo "  install      安装所有依赖"
	@echo "  test         运行测试"
	@echo "  lint         代码检查"
	@echo "  format       代码格式化"
	@echo ""
	@echo "部署命令："
	@echo "  build        构建生产镜像"
	@echo "  start        启动生产环境"
	@echo "  stop         停止所有服务"
	@echo "  clean        清理容器和镜像"
	@echo ""
	@echo "数据库命令："
	@echo "  db-init      初始化数据库"
	@echo "  db-migrate   运行数据库迁移"
	@echo "  db-reset     重置数据库"
	@echo "  db-backup    备份数据库"

# 开发环境
dev:
	@echo "启动开发环境..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "数据库和Redis服务已启动"
	@echo "请手动启动前后端服务："
	@echo ""
	@echo "后端服务："
	@echo "  cd backend && python -m venv venv && venv\\Scripts\\activate && pip install -r requirements.txt && uvicorn main:app --reload"
	@echo ""
	@echo "前端服务："
	@echo "  cd frontend && npm install && npm run dev"
	@echo ""
	@echo "访问地址："
	@echo "  前端: http://localhost:3000"
	@echo "  后端: http://localhost:8000"
	@echo "  API文档: http://localhost:8000/docs"

# 安装依赖
install:
	@echo "安装后端依赖..."
	cd backend && pip install -r requirements.txt
	@echo "安装前端依赖..."
	cd frontend && npm install
	@echo "依赖安装完成"

# 构建生产镜像
build:
	@echo "构建生产镜像..."
	docker-compose build --no-cache
	@echo "镜像构建完成"

# 启动生产环境
start:
	@echo "启动生产环境..."
	docker-compose --profile production up -d
	@echo "生产环境已启动"

# 停止服务
stop:
	@echo "停止所有服务..."
	docker-compose down
	@echo "服务已停止"

# 清理容器和镜像
clean:
	@echo "清理容器和镜像..."
	docker-compose down -v --rmi all
	docker system prune -f
	@echo "清理完成"

# 运行测试
test:
	@echo "运行后端测试..."
	cd backend && python -m pytest tests/ -v
	@echo "运行前端测试..."
	cd frontend && npm test
	@echo "测试完成"

# 代码检查
lint:
	@echo "检查后端代码..."
	cd backend && flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	cd backend && black --check .
	cd backend && isort --check-only .
	@echo "检查前端代码..."
	cd frontend && npm run lint
	@echo "代码检查完成"

# 代码格式化
format:
	@echo "格式化后端代码..."
	cd backend && black .
	cd backend && isort .
	@echo "格式化前端代码..."
	cd frontend && npm run lint -- --fix
	cd frontend && npx prettier --write .
	@echo "代码格式化完成"

# 数据库初始化
db-init:
	@echo "初始化数据库..."
	docker-compose exec db psql -U campusphoto_user -d campusphoto -f /docker-entrypoint-initdb.d/init.sql
	@echo "数据库初始化完成"

# 数据库迁移
db-migrate:
	@echo "运行数据库迁移..."
	docker-compose exec backend alembic upgrade head
	@echo "数据库迁移完成"

# 重置数据库
db-reset:
	@echo "重置数据库..."
	docker-compose down -v
	docker-compose up -d db
	sleep 10
	make db-init
	@echo "数据库重置完成"

# 备份数据库
db-backup:
	@echo "备份数据库..."
	docker-compose exec db pg_dump -U campusphoto_user campusphoto > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "数据库备份完成"

# 查看日志
logs:
	docker-compose logs -f

# 查看服务状态
status:
	docker-compose ps

# 进入后端容器
backend-shell:
	docker-compose exec backend bash

# 进入前端容器
frontend-shell:
	docker-compose exec frontend sh

# 进入数据库容器
db-shell:
	docker-compose exec db psql -U campusphoto_user -d campusphoto

# 健康检查
health:
	@echo "检查服务健康状态..."
	@curl -s http://localhost:8000/health || echo "后端服务异常"
	@curl -s http://localhost:3000 > /dev/null && echo "前端服务正常" || echo "前端服务异常"

# 监控资源使用
monitor:
	docker stats

# 生成SSL证书（开发用）
ssl-cert:
	@echo "生成SSL证书..."
	mkdir -p nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/key.pem \
		-out nginx/ssl/cert.pem \
		-subj "/C=CN/ST=Beijing/L=Beijing/O=CampusPhoto/CN=localhost"
	@echo "SSL证书生成完成"

# 更新依赖
update-deps:
	@echo "更新后端依赖..."
	cd backend && pip list --outdated
	@echo "更新前端依赖..."
	cd frontend && npm outdated

# 安全扫描
security-scan:
	@echo "后端安全扫描..."
	cd backend && safety check
	@echo "前端安全扫描..."
	cd frontend && npm audit

# 性能测试
performance-test:
	@echo "运行性能测试..."
	@echo "需要安装 apache2-utils (ab) 或 wrk"
	# ab -n 1000 -c 10 http://localhost:8000/api/photos/
	# wrk -t4 -c100 -d30s http://localhost:3000/

# 代码统计
stats:
	@echo "代码统计："
	@echo "后端 Python 代码行数："
	@find backend -name "*.py" | xargs wc -l | tail -1
	@echo "前端 TypeScript 代码行数："
	@find frontend -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
