#!/usr/bin/env python3
"""
基于 complete_test_report.md 的总图片数重新计算误判率
总测试图片: 332,532 张
错误案例: 49,417 张 (来自 error_cases.json)
"""
import json
from pathlib import Path
from collections import Counter

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "campusphoto" / "backend"
ERROR_JSON = BACKEND_DIR / "error_cases.json"

# 从 complete_test_report.md 获取的总图片数
TOTAL_TEST_IMAGES = 332532

# 用户提供的样本统计
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

def calculate_corrected_misclassification_rates():
    """基于总测试图片数计算误判率"""
    cases = load_error_cases()
    if not cases:
        return
    
    # 分析错误分类
    category_stats = {}
    theme_counts = Counter()
    
    for case in cases:
        if not isinstance(case, dict):
            continue
            
        expected = case.get("expected_theme", "")
        predicted = case.get("predicted_theme", "")
        
        if expected:
            theme_counts[expected] += 1
            
        if expected and predicted and expected != predicted:
            key = f"{expected}->{predicted}"
            if key not in category_stats:
                category_stats[key] = []
            category_stats[key].append(case)
    
    print(f"📊 基于 complete_test_report.md 的误判率分析:")
    print(f"总测试图片数: {TOTAL_TEST_IMAGES:,} 张")
    print(f"错误案例数: {len(cases):,} 张")
    print(f"总体错误率: {len(cases)/TOTAL_TEST_IMAGES:.1%}")
    print("=" * 100)
    print(f"{'错误类别':25} | {'错误数':6} | {'AI误判':8} | {'数据集错误':10} | {'总误判率':8} | {'AI误判率':8} | {'样本数':6}")
    print("-" * 100)
    
    total_ai_errors = 0
    total_dataset_errors = 0
    
    # 按错误数排序
    sorted_categories = sorted(category_stats.items(), key=lambda x: len(x[1]), reverse=True)
    
    for category, cases in sorted_categories:
        error_count = len(cases)
        
        if category in SAMPLE_STATS:
            sample = SAMPLE_STATS[category]
            ai_error_rate = sample["ai_error"] / sample["total"] if sample["total"] > 0 else 0
            dataset_error_rate = sample["dataset_error"] / sample["total"] if sample["total"] > 0 else 0
            
            estimated_ai_errors = int(error_count * ai_error_rate)
            estimated_dataset_errors = int(error_count * dataset_error_rate)
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            
            # 计算相对于总测试图片数的误判率
            total_misclassification_rate = error_count / TOTAL_TEST_IMAGES
            ai_misclassification_rate = estimated_ai_errors / TOTAL_TEST_IMAGES
            
            print(f"{category:25} | {error_count:6} | {estimated_ai_errors:8} | {estimated_dataset_errors:10} | {total_misclassification_rate:7.1%} | {ai_misclassification_rate:7.1%} | {sample['total']:6}")
        else:
            # 保守估计
            estimated_ai_errors = int(error_count * 0.5)
            estimated_dataset_errors = error_count - estimated_ai_errors
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            
            total_misclassification_rate = error_count / TOTAL_TEST_IMAGES
            ai_misclassification_rate = estimated_ai_errors / TOTAL_TEST_IMAGES
            
            print(f"{category:25} | {error_count:6} | {estimated_ai_errors:8} | {estimated_dataset_errors:10} | {total_misclassification_rate:7.1%} | {ai_misclassification_rate:7.1%} | {'无':6}")
    
    print("-" * 100)
    total_misclassification_rate = len(cases) / TOTAL_TEST_IMAGES
    ai_misclassification_rate = total_ai_errors / TOTAL_TEST_IMAGES
    dataset_misclassification_rate = total_dataset_errors / TOTAL_TEST_IMAGES
    
    print(f"{'总计':25} | {len(cases):6} | {total_ai_errors:8} | {total_dataset_errors:10} | {total_misclassification_rate:7.1%} | {ai_misclassification_rate:7.1%} | {'':6}")
    
    print(f"\n📊 总结:")
    print(f"  总测试图片数: {TOTAL_TEST_IMAGES:,}")
    print(f"  总错误数: {len(cases):,} ({len(cases)/TOTAL_TEST_IMAGES:.1%})")
    print(f"  AI误判数: {total_ai_errors:,} ({ai_misclassification_rate:.1%})")
    print(f"  数据集错误: {total_dataset_errors:,} ({dataset_misclassification_rate:.1%})")
    print(f"  正确预测数: {TOTAL_TEST_IMAGES - len(cases):,} ({(TOTAL_TEST_IMAGES - len(cases))/TOTAL_TEST_IMAGES:.1%})")

if __name__ == "__main__":
    calculate_corrected_misclassification_rates()
