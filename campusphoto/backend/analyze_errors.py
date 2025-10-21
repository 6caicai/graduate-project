#!/usr/bin/env python3
"""
分析错误分类：区分AI误判 vs 数据集污染
基于用户提供的样本统计，估算各类别的真实错误率
"""
import json
from pathlib import Path
from collections import defaultdict, Counter
import re

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

def analyze_by_category():
    """按类别分析错误分布"""
    cases = load_error_cases()
    if not cases:
        return {}
    
    category_stats = defaultdict(list)
    
    for case in cases:
        if not isinstance(case, dict):
            continue
            
        expected = case.get("expected_theme", "")
        predicted = case.get("predicted_theme", "")
        file_path = case.get("file_path", "")
        
        if expected and predicted and expected != predicted:
            key = f"{expected}->{predicted}"
            category_stats[key].append({
                "file_path": file_path,
                "expected": expected,
                "predicted": predicted,
                "confidence": case.get("confidence", 0)
            })
    
    return dict(category_stats)

def calculate_error_rates():
    """基于样本统计计算各类别的错误率"""
    category_stats = analyze_by_category()
    results = {}
    
    print("📊 基于样本统计的错误分析:")
    print("=" * 80)
    
    total_ai_errors = 0
    total_dataset_errors = 0
    total_cases = 0
    
    for category, cases in category_stats.items():
        case_count = len(cases)
        
        if category in SAMPLE_STATS:
            sample = SAMPLE_STATS[category]
            # 计算错误率
            ai_error_rate = sample["ai_error"] / sample["total"] if sample["total"] > 0 else 0
            dataset_error_rate = sample["dataset_error"] / sample["total"] if sample["total"] > 0 else 0
            
            # 估算实际数量
            estimated_ai_errors = int(case_count * ai_error_rate)
            estimated_dataset_errors = int(case_count * dataset_error_rate)
            
            results[category] = {
                "total_cases": case_count,
                "estimated_ai_errors": estimated_ai_errors,
                "estimated_dataset_errors": estimated_dataset_errors,
                "ai_error_rate": ai_error_rate,
                "dataset_error_rate": dataset_error_rate,
                "sample_size": sample["total"]
            }
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            total_cases += case_count
            
            print(f"{category:20} | 总计: {case_count:5d} | AI误判: {estimated_ai_errors:4d} ({ai_error_rate:.1%}) | 数据集错误: {estimated_dataset_errors:4d} ({dataset_error_rate:.1%}) | 样本: {sample['total']:3d}")
        else:
            # 没有样本数据的类别，按保守估计（假设50%是AI错误）
            estimated_ai_errors = int(case_count * 0.5)
            estimated_dataset_errors = case_count - estimated_ai_errors
            
            results[category] = {
                "total_cases": case_count,
                "estimated_ai_errors": estimated_ai_errors,
                "estimated_dataset_errors": estimated_dataset_errors,
                "ai_error_rate": 0.5,
                "dataset_error_rate": 0.5,
                "sample_size": 0
            }
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            total_cases += case_count
            
            print(f"{category:20} | 总计: {case_count:5d} | AI误判: {estimated_ai_errors:4d} (50.0%) | 数据集错误: {estimated_dataset_errors:4d} (50.0%) | 样本: 无")
    
    print("=" * 80)
    print(f"{'总计':20} | 总计: {total_cases:5d} | AI误判: {total_ai_errors:4d} ({total_ai_errors/total_cases:.1%}) | 数据集错误: {total_dataset_errors:4d} ({total_dataset_errors/total_cases:.1%})")
    
    return results

def generate_summary_report():
    """生成总结报告"""
    results = calculate_error_rates()
    
    print("\n📋 智能分类错误分析总结:")
    print("=" * 60)
    
    # 按AI错误率排序
    sorted_results = sorted(results.items(), key=lambda x: x[1]["ai_error_rate"], reverse=True)
    
    print("🔴 AI误判最严重的类别:")
    for category, stats in sorted_results[:5]:
        print(f"  {category}: {stats['estimated_ai_errors']} 张 ({stats['ai_error_rate']:.1%})")
    
    print("\n🟡 数据集污染最严重的类别:")
    sorted_by_dataset = sorted(results.items(), key=lambda x: x[1]["dataset_error_rate"], reverse=True)
    for category, stats in sorted_by_dataset[:5]:
        if stats["dataset_error_rate"] > 0:
            print(f"  {category}: {stats['estimated_dataset_errors']} 张 ({stats['dataset_error_rate']:.1%})")
    
    print("\n💡 建议:")
    print("  1. 优先清理数据集污染严重的类别")
    print("  2. 针对AI误判严重的类别进行模型优化")
    print("  3. 考虑重新标注或过滤低质量数据")

if __name__ == "__main__":
    generate_summary_report()
