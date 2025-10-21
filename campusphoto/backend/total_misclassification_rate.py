#!/usr/bin/env python3
"""
计算相对于总图片数的误判率
"""
import json
from pathlib import Path
from collections import Counter

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "campusphoto" / "backend"
ERROR_JSON = BACKEND_DIR / "error_cases.json"

def get_total_image_count():
    """统计总图片数量"""
    cases = load_error_cases()
    if not cases:
        return 0, {}
    
    # 统计各主题的总图片数（包括正确和错误的）
    theme_counts = Counter()
    total_images = len(cases)
    
    for case in cases:
        if isinstance(case, dict):
            expected = case.get("expected_theme", "")
            if expected:
                theme_counts[expected] += 1
    
    return total_images, dict(theme_counts)

def load_error_cases():
    """加载所有案例数据"""
    if not ERROR_JSON.exists():
        print(f"❌ 文件不存在: {ERROR_JSON}")
        return []
    
    with open(ERROR_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data if isinstance(data, list) else []

def calculate_misclassification_rates():
    """计算相对于总图片数的误判率"""
    total_images, theme_counts = get_total_image_count()
    
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
    
    # 分析错误分类
    cases = load_error_cases()
    category_stats = {}
    
    for case in cases:
        if not isinstance(case, dict):
            continue
            
        expected = case.get("expected_theme", "")
        predicted = case.get("predicted_theme", "")
        
        if expected and predicted and expected != predicted:
            key = f"{expected}->{predicted}"
            if key not in category_stats:
                category_stats[key] = []
            category_stats[key].append(case)
    
    print(f"📊 总图片数量: {total_images}")
    print(f"📈 各主题图片分布:")
    for theme, count in sorted(theme_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {theme}: {count} 张 ({count/total_images:.1%})")
    
    print(f"\n📋 相对于总图片数的误判率分析:")
    print("=" * 100)
    print(f"{'错误类别':25} | {'错误数':6} | {'AI误判':8} | {'数据集错误':10} | {'总误判率':8} | {'AI误判率':8} | {'样本数':6}")
    print("-" * 100)
    
    total_errors = 0
    total_ai_errors = 0
    total_dataset_errors = 0
    
    # 按错误数排序
    sorted_categories = sorted(category_stats.items(), key=lambda x: len(x[1]), reverse=True)
    
    for category, cases in sorted_categories:
        error_count = len(cases)
        total_errors += error_count
        
        if category in SAMPLE_STATS:
            sample = SAMPLE_STATS[category]
            ai_error_rate = sample["ai_error"] / sample["total"] if sample["total"] > 0 else 0
            dataset_error_rate = sample["dataset_error"] / sample["total"] if sample["total"] > 0 else 0
            
            estimated_ai_errors = int(error_count * ai_error_rate)
            estimated_dataset_errors = int(error_count * dataset_error_rate)
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            
            # 计算相对于总图片数的误判率
            total_misclassification_rate = error_count / total_images
            ai_misclassification_rate = estimated_ai_errors / total_images
            
            print(f"{category:25} | {error_count:6} | {estimated_ai_errors:8} | {estimated_dataset_errors:10} | {total_misclassification_rate:7.1%} | {ai_misclassification_rate:7.1%} | {sample['total']:6}")
        else:
            # 保守估计
            estimated_ai_errors = int(error_count * 0.5)
            estimated_dataset_errors = error_count - estimated_ai_errors
            
            total_ai_errors += estimated_ai_errors
            total_dataset_errors += estimated_dataset_errors
            
            total_misclassification_rate = error_count / total_images
            ai_misclassification_rate = estimated_ai_errors / total_images
            
            print(f"{category:25} | {error_count:6} | {estimated_ai_errors:8} | {estimated_dataset_errors:10} | {total_misclassification_rate:7.1%} | {ai_misclassification_rate:7.1%} | {'无':6}")
    
    print("-" * 100)
    total_misclassification_rate = total_errors / total_images
    ai_misclassification_rate = total_ai_errors / total_images
    dataset_misclassification_rate = total_dataset_errors / total_images
    
    print(f"{'总计':25} | {total_errors:6} | {total_ai_errors:8} | {total_dataset_errors:10} | {total_misclassification_rate:7.1%} | {ai_misclassification_rate:7.1%} | {'':6}")
    
    print(f"\n📊 总结:")
    print(f"  总图片数: {total_images}")
    print(f"  总错误数: {total_errors} ({total_misclassification_rate:.1%})")
    print(f"  AI误判数: {total_ai_errors} ({ai_misclassification_rate:.1%})")
    print(f"  数据集错误: {total_dataset_errors} ({dataset_misclassification_rate:.1%})")

if __name__ == "__main__":
    calculate_misclassification_rates()
