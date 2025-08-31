@echo off
chcp 936 >nul

REM 切换到脚本所在目录
cd /d "%~dp0"

echo ========================================
echo     高校摄影系统 - 开发环境启动
echo ========================================
echo.

echo [1/4] 启动数据库和Redis服务...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo [2/4] 等待服务启动完成...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] 检查服务状态...
docker-compose -f docker-compose.dev.yml ps

echo.
echo [4/4] 基础服务启动完成！
echo.
echo ========================================
echo            接下来的步骤
echo ========================================
echo.
echo 请分别在新的命令行窗口中执行：
echo.
echo 启动后端服务：
echo   cd backend
echo   python -m venv venv
echo   venv\Scripts\activate
echo   pip install -r requirements.txt
echo   uvicorn main:app --reload
echo.
echo 启动前端服务：
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo ========================================
echo            访问地址
echo ========================================
echo   前端界面: http://localhost:3000
echo   后端API:  http://localhost:8000
echo   API文档:  http://localhost:8000/docs
echo ========================================
echo.
pause


