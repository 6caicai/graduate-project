#!/usr/bin/env python3
"""
清理 bdd100k_seg 相关数据：
1. 备份 error_cases.json
2. 过滤掉包含 bdd100k_seg 的记录
3. 删除 result/ 中相关的目录
"""
import json
import shutil
from pathlib import Path
from datetime import datetime

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "campusphoto" / "backend"
ERROR_JSON = BACKEND_DIR / "error_cases.json"
RESULT_DIR = REPO_ROOT / "campusphoto" / "ai" / "exp" / "result"

def backup_file(file_path: Path) -> Path:
    """创建带时间戳的备份文件"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = file_path.parent / f"{file_path.stem}_backup_{timestamp}{file_path.suffix}"
    shutil.copy2(file_path, backup_path)
    print(f"✅ 已备份: {file_path} -> {backup_path}")
    return backup_path

def filter_error_cases():
    """过滤 error_cases.json 中的 bdd100k_seg 记录"""
    if not ERROR_JSON.exists():
        print(f"❌ 文件不存在: {ERROR_JSON}")
        return False
    
    # 备份原文件
    backup_path = backup_file(ERROR_JSON)
    
    # 读取数据
    print("📖 读取 error_cases.json...")
    with open(ERROR_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        print("❌ JSON 格式错误，期望列表")
        return False
    
    original_count = len(data)
    print(f"📊 原始记录数: {original_count}")
    
    # 过滤掉包含 bdd100k_seg 的记录
    filtered_data = []
    bdd_count = 0
    
    for item in data:
        if isinstance(item, dict):
            file_path = item.get("file_path", "")
            if "bdd100k_seg" in file_path:
                bdd_count += 1
                continue
        filtered_data.append(item)
    
    print(f"🗑️ 过滤掉 bdd100k_seg 记录: {bdd_count}")
    print(f"📊 剩余记录数: {len(filtered_data)}")
    
    # 保存过滤后的数据
    print("💾 保存过滤后的数据...")
    with open(ERROR_JSON, 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已更新 {ERROR_JSON}")
    return True

def cleanup_result_dirs():
    """删除 result/ 中包含 bdd100k_seg 的目录"""
    if not RESULT_DIR.exists():
        print(f"⚠️ 结果目录不存在: {RESULT_DIR}")
        return
    
    print(f"🔍 扫描结果目录: {RESULT_DIR}")
    removed_dirs = []
    
    for item in RESULT_DIR.iterdir():
        if item.is_dir() and "bdd100k_seg" in item.name:
            print(f"🗑️ 删除目录: {item}")
            shutil.rmtree(item)
            removed_dirs.append(item.name)
    
    if removed_dirs:
        print(f"✅ 已删除 {len(removed_dirs)} 个相关目录: {removed_dirs}")
    else:
        print("ℹ️ 未找到包含 bdd100k_seg 的结果目录")

def main():
    print("🧹 开始清理 bdd100k_seg 相关数据...")
    
    # 1. 过滤 error_cases.json
    if not filter_error_cases():
        print("❌ 过滤 error_cases.json 失败")
        return
    
    # 2. 清理结果目录
    cleanup_result_dirs()
    
    print("\n🎉 清理完成！")
    print(f"📁 备份位置: {BACKEND_DIR}")
    print(f"📁 结果目录: {RESULT_DIR}")

if __name__ == "__main__":
    main()
