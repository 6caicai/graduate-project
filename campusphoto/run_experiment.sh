#!/bin/bash

# Redis 缓存策略优化实验执行脚本
# 适配 M4 MacBook Air 单机部署环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查实验依赖..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker Desktop"
        exit 1
    fi
    
    # 检查k6
    if ! command -v k6 &> /dev/null; then
        log_error "k6未安装，请运行: brew install k6"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 启动实验环境
start_experiment_env() {
    log_info "启动实验环境..."
    
    # 停止现有容器
    docker-compose -f docker-compose.experiment.yml down 2>/dev/null || true
    
    # 启动实验容器
    docker-compose -f docker-compose.experiment.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    if ! curl -s http://localhost:8000/api/experiment/status > /dev/null; then
        log_error "后端服务启动失败"
        exit 1
    fi
    
    if ! docker exec campusphoto_redis redis-cli ping > /dev/null; then
        log_error "Redis服务启动失败"
        exit 1
    fi
    
    log_success "实验环境启动完成"
}

# 生成测试数据
generate_test_data() {
    log_info "生成测试数据..."
    
    # 这里可以添加数据生成脚本
    # python3 scripts/generate_test_data.py
    
    log_success "测试数据生成完成"
}

# 执行单个策略测试
run_strategy_test() {
    local strategy=$1
    local strategy_name=$2
    local duration=${3:-"5m"}
    
    log_info "开始测试策略: $strategy_name"
    
    # 设置缓存策略
    curl -s -X POST "http://localhost:8000/api/experiment/strategy/$strategy" > /dev/null
    
    # 预热
    log_info "预热阶段..."
    k6 run --duration=1m --vus=10 k6_load_test.js > /dev/null
    
    # 正式测试
    log_info "执行负载测试 (${duration})..."
    local output_file="results/${strategy}_$(date +%Y%m%d_%H%M%S).json"
    mkdir -p results
    
    k6 run --duration=$duration --vus=50 \
        --out json=$output_file \
        k6_load_test.js
    
    # 收集缓存指标
    local metrics_file="results/${strategy}_metrics_$(date +%Y%m%d_%H%M%S).json"
    curl -s "http://localhost:8000/api/experiment/metrics" > $metrics_file
    
    log_success "策略 $strategy_name 测试完成"
}

# 执行所有策略测试
run_all_strategies() {
    log_info "开始执行所有策略测试..."
    
    # 策略列表
    declare -A strategies=(
        ["baseline"]="无缓存基准"
        ["cache_aside"]="Cache-Aside基础模式"
        ["smart_ttl"]="Cache-Aside + 智能TTL"
        ["write_through"]="Write-Through模式"
        ["write_behind"]="Write-Behind异步模式"
        ["hybrid"]="混合策略"
    )
    
    # 执行每个策略测试
    for strategy in "${!strategies[@]}"; do
        run_strategy_test "$strategy" "${strategies[$strategy]}" "10m"
        
        # 策略间休息
        log_info "策略间休息 2 分钟..."
        sleep 120
    done
    
    log_success "所有策略测试完成"
}

# 生成实验报告
generate_report() {
    log_info "生成实验报告..."
    
    # 创建报告目录
    mkdir -p reports
    
    # 生成报告
    python3 scripts/generate_report.py
    
    log_success "实验报告生成完成: reports/experiment_report.html"
}

# 清理环境
cleanup() {
    log_info "清理实验环境..."
    
    # 停止容器
    docker-compose -f docker-compose.experiment.yml down
    
    log_success "环境清理完成"
}

# 主函数
main() {
    log_info "开始Redis缓存策略优化实验"
    log_info "实验环境: M4 MacBook Air"
    log_info "实验时间: $(date)"
    
    # 检查依赖
    check_dependencies
    
    # 启动环境
    start_experiment_env
    
    # 生成测试数据
    generate_test_data
    
    # 执行测试
    run_all_strategies
    
    # 生成报告
    generate_report
    
    # 清理环境
    cleanup
    
    log_success "实验完成！"
    log_info "查看报告: reports/experiment_report.html"
    log_info "查看结果: results/"
}

# 错误处理
trap cleanup EXIT

# 执行主函数
main "$@"
