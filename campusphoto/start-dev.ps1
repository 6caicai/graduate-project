# 高校摄影系统开发环境启动脚本
# PowerShell版本，支持中文显示

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 切换到脚本所在目录
Set-Location $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     高校摄影系统 - 开发环境启动      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] 启动数据库和Redis服务..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.dev.yml up -d
    Write-Host "✓ 服务启动命令执行完成" -ForegroundColor Green
} catch {
    Write-Host "✗ 服务启动失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] 等待服务启动完成..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "[3/4] 检查服务状态..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml ps

Write-Host ""
Write-Host "[4/4] 基础服务启动完成！" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "            接下来的步骤              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请分别在新的PowerShell窗口中执行：" -ForegroundColor White
Write-Host ""
Write-Host "启动后端服务：" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  python -m venv venv" -ForegroundColor Gray
Write-Host "  venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "  pip install -r requirements.txt" -ForegroundColor Gray
Write-Host "  uvicorn main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "启动前端服务：" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "            访问地址                  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  前端界面: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Blue
Write-Host "  后端API:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Blue
Write-Host "  API文档:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000/docs" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 默认账户信息
Write-Host "默认测试账户：" -ForegroundColor Magenta
Write-Host "  管理员: admin / admin123" -ForegroundColor Gray
Write-Host "  摄影师: photographer1 / admin123" -ForegroundColor Gray
Write-Host "  学生: student1 / admin123" -ForegroundColor Gray
Write-Host ""

Read-Host "按回车键继续..."


