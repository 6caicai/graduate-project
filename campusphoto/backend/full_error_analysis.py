#!/usr/bin/env python3
"""
全面分析错误分类：先统计所有类别，再基于样本估算AI误判数量
"""
import json
from pathlib import Path
from collections import defaultdict, Counter

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "campusphoto" / "backend"
ERROR_JSON = BACKEND_DIR / "error_cases.json"

# 用户提供的样本统计（AI误判 vs 数据集错误）
SAMPLE_STATS = {
    "动物->街景": {"ai_error": 3, "dataset_error": 0, "total": 3},
    "动物->人像": {"ai_error": 188, "dataset_error": 26, "total": 214},
    "动物->食物和静物": {"ai_error": 43, "dataset_error": 0, "total": 43},
    "动物->自然风光": {"ai_error": 730, "dataset_error": 0, "total": 730},
    "街景->动物": {"ai_error": 82, "dataset_error": 5, "total": 87},
    "人像->动物": {"ai_error": 449, "dataset_error": 561, "total": 1010},
    "人像->街景": {"ai_error": 48, "dataset_error": 50, "total": 98},
}

def load_error_cases():
    """加载错误案例数据"""
    if not ERROR_JSON.exists():
        print(f"❌ 文件不存在: {ERROR_JSON}")
        return []
    
    with open(ERROR_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data if isinstance(data, list) else []

def analyze_all_categories():
    """分析所有错误类别"""
    cases = load_error_cases()
    if not cases:
        return {}
    
    category_stats = defaultdict(list)
    theme_counts = Counter()
    
    for case in cases:
        if not isinstance(case, dict):
            continue
            
        expected = case.get("expected_theme", "")
        predicted = case.get("predicted_theme", "")
        
        if expected and predicted:
            theme_counts[expected] += 1
            if expected != predicted:
                key = f"{expected}->{predicted}"
                category_stats[key].append(case)
    
    return dict(category_stats), dict(theme_counts)

def estimate_ai_errors():
    """基于样本统计估算AI误判数量"""
    category_stats, theme_counts = analyze_all_categories()
    
    print("📊 错误分类完整统计:")
    print("=" * 100)
    print(f"{'类别':25} | {'总数':6} | {'AI误判':8} | {'数据集错误':10} | {'AI误判率':8} | {'样本数':6}")
    print("-" * 100)
    
    total_cases = 0
    total_ai_errors = 0
    total_dataset_errors = 0
    
    # 按总数排序显示
    sorted_categories = sorted(category_stats.items(), key=lambda x: len(x[1]), reverse=True)
    
    for category, cases in sorted_categories:
        case_count = len(cases)
        total_cases += case_count
        
        if category in SAMPLE_STATS:
            sample = SAMPLE_STATS[category]
            ai_error_rate = sample["ai_error"] / sample["total"] if sample["total"] > 0 else 0
            dataset_error_rate = sample["dataset_error"] / sample["total"] if sample["total"] > 0 else 0
            
            estimated_ai_errors = int(case_count * ai_error_rate)
            estimated_dataset_errors = int(case_count * dataset_error_rate)
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            
            print(f"{category:25} | {case_count:6} | {estimated_ai_errors:8} | {estimated_dataset_errors:10} | {ai_error_rate:7.1%} | {sample['total']:6}")
        else:
            # 没有样本数据的类别，使用保守估计
            estimated_ai_errors = int(case_count * 0.5)
            estimated_dataset_errors = case_count - estimated_ai_errors
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            
            print(f"{category:25} | {case_count:6} | {estimated_ai_errors:8} | {estimated_dataset_errors:10} | {'50.0%':8} | {'无':6}")
    
    print("-" * 100)
    print(f"{'总计':25} | {total_cases:6} | {total_ai_errors:8} | {total_dataset_errors:10} | {total_ai_errors/total_cases:7.1%} | {'':6}")
    
    return category_stats

def show_theme_distribution():
    """显示各主题的分布情况"""
    cases = load_error_cases()
    theme_counts = Counter()
    
    for case in cases:
        if isinstance(case, dict):
            expected = case.get("expected_theme", "")
            if expected:
                theme_counts[expected] += 1
    
    print("\n📈 各主题分布:")
    print("=" * 40)
    for theme, count in theme_counts.most_common():
        print(f"{theme:15} | {count:6} 张")
    
    print(f"{'总计':15} | {sum(theme_counts.values()):6} 张")

def generate_detailed_report():
    """生成详细报告"""
    print("🔍 错误分类详细分析报告")
    print("=" * 120)
    
    # 1. 显示主题分布
    show_theme_distribution()
    
    # 2. 分析所有错误类别
    category_stats = estimate_ai_errors()
    
    # 3. 重点分析有样本数据的类别
    print("\n🎯 基于样本统计的重点分析:")
    print("=" * 80)
    
    for category, sample in SAMPLE_STATS.items():
        if category in category_stats:
            total = len(category_stats[category])
            ai_rate = sample["ai_error"] / sample["total"]
            dataset_rate = sample["dataset_error"] / sample["total"]
            
            estimated_ai = int(total * ai_rate)
            estimated_dataset = int(total * dataset_rate)
            
            print(f"{category}:")
            print(f"  样本: {sample['total']} 张 (AI误判: {sample['ai_error']}, 数据集错误: {sample['dataset_error']})")
            print(f"  全量: {total} 张 (估算AI误判: {estimated_ai}, 估算数据集错误: {estimated_dataset})")
            print(f"  错误率: AI {ai_rate:.1%}, 数据集 {dataset_rate:.1%}")
            print()

if __name__ == "__main__":
    generate_detailed_report()
