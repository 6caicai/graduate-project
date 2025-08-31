#!/bin/bash

echo "启动高校摄影系统开发环境..."

echo ""
echo "1. 启动数据库和Redis服务..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "2. 等待数据库启动..."
sleep 5

echo ""
echo "3. 检查服务状态..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "服务启动完成！"
echo ""
echo "接下来请手动启动前后端服务："
echo ""
echo "后端服务（新的终端窗口）："
echo "  cd backend"
echo "  python -m venv venv"
echo "  source venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "前端服务（新的终端窗口）："
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "访问地址："
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo ""



