import os
import sys
import json
import subprocess
from pathlib import Path
import unicodedata
import re
from typing import List, Dict, Any, Tuple


REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "campusphoto" / "backend"
ERROR_JSON = BACKEND_DIR / "error_cases.json"
EXP_DIR = REPO_ROOT / "campusphoto" / "ai" / "exp"
# 结果输出目录改为 ai/exp/result
RESULT_DIR = EXP_DIR / "result"

# YOLO 标注支持
try:
    from utils.yolo_image_classifier import yolo_classifier  # type: ignore
except Exception:
    yolo_classifier = None  # 延迟失败处理


def open_image(image_path: Path) -> bool:
    """使用系统默认程序打开图片（macOS/Linux/Windows 兼容）。"""
    try:
        if sys.platform == "darwin":
            subprocess.run(["open", str(image_path)], check=False)
        elif os.name == "nt":
            os.startfile(str(image_path))  # type: ignore[attr-defined]
        else:
            subprocess.run(["xdg-open", str(image_path)], check=False)
        return True
    except Exception:
        return False


def load_error_cases_raw() -> List[Dict[str, Any]]:
    """读取 error_cases.json 的原始记录列表。"""
    if not ERROR_JSON.exists():
        return []

    try:
        data = json.loads(ERROR_JSON.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return [x for x in data if isinstance(x, dict)]
        return []
    except Exception:
        return []


def normalize_path(p: Any) -> Path:
    """Normalize path strings to avoid false negatives on existence checks.

    - Strip surrounding whitespace
    - Remove zero-width and control characters
    - Unicode normalize to NFC (macOS paths may be NFD)
    - Normalize path separators
    """
    if not isinstance(p, str):
        return Path(p)
    s = p.strip()
    # Remove zero-width and control chars
    s = re.sub(r"[\u200B-\u200D\uFEFF\u202A-\u202E\u2060\u2066-\u2069\u0000-\u001F]", "", s)
    # Unicode normalize
    s = unicodedata.normalize('NFC', s)
    # Normalize separators
    s = os.path.normpath(s)
    return Path(s)


def to_nfd(s: str) -> str:
    try:
        return unicodedata.normalize('NFD', s)
    except Exception:
        return s


def path_exists_any(p: Path) -> bool:
    """Check existence trying both NFC and NFD normalized strings."""
    s = str(p)
    # try current
    if p.exists() or os.path.lexists(s):
        return True
    # try NFD
    s_nfd = to_nfd(s)
    if os.path.exists(s_nfd) or os.path.lexists(s_nfd):
        return True
    # try NFC (redundant but explicit)
    s_nfc = unicodedata.normalize('NFC', s)
    if os.path.exists(s_nfc) or os.path.lexists(s_nfc):
        return True
    return False


def debug_path_info(p: Path) -> None:
    s = str(p)
    s_nfc = unicodedata.normalize('NFC', s)
    s_nfd = to_nfd(s)
    print("\n🔎 调试路径信息:")
    print(f" raw: {s}")
    print(f" len: {len(s)}")
    print(f" NFC exists: {os.path.exists(s_nfc)}  lexists: {os.path.lexists(s_nfc)}")
    print(f" NFD exists: {os.path.exists(s_nfd)}  lexists: {os.path.lexists(s_nfd)}")
    # 打印末尾文件名各字符的 code point（最多前后各20字符）
    tail = os.path.basename(s)
    hexs = ' '.join(hex(ord(ch)) for ch in tail)
    print(f" basename: {tail}")
    print(f" codepoints: {hexs}")
    # 列一下父目录，帮助对比
    parent = os.path.dirname(s)
    try:
        names = os.listdir(parent)
        print(f" parent: {parent}")
        print(f" has {len(names)} entries, sample: {names[:10]}")
    except Exception as e:
        print(f" listdir error: {e}")


def build_filename_index(root: Path) -> Dict[str, List[Path]]:
    """Index all files under root by basename (with NFC and NFD normalized keys)."""
    index: Dict[str, List[Path]] = {}
    if not root.exists():
        return index
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            if not name:
                continue
            name_nfc = unicodedata.normalize('NFC', name)
            name_nfd = unicodedata.normalize('NFD', name)
            p = Path(dirpath) / name
            index.setdefault(name, []).append(p)
            index.setdefault(name_nfc, []).append(p)
            index.setdefault(name_nfd, []).append(p)
    return index


def try_repair_missing_paths(missing: List[Path]) -> Dict[Path, Path]:
    """Attempt to repair missing paths by matching basenames under EXP_DIR.

    Preference:
      1) candidates in same top-level class folder (derived from original path after 'exp')
      2) otherwise unique basename match anywhere under EXP_DIR
    Returns a mapping from old_missing_path -> new_found_path
    """
    repaired: Dict[Path, Path] = {}
    if not EXP_DIR.exists():
        return repaired
    index = build_filename_index(EXP_DIR)
    for mp in missing:
        name = os.path.basename(str(mp))
        name_nfc = unicodedata.normalize('NFC', name)
        name_nfd = unicodedata.normalize('NFD', name)
        cands = index.get(name, []) + index.get(name_nfc, []) + index.get(name_nfd, [])
        if not cands:
            continue
        # derive class folder from original path
        parts = Path(str(mp)).parts
        cls = None
        for i, seg in enumerate(parts):
            if seg == 'exp' and i + 1 < len(parts):
                cls = parts[i + 1]
                break
        if cls:
            same_cls = [c for c in cands if ('/exp/' + cls + '/') in str(c)]
            if len(same_cls) == 1:
                repaired[mp] = same_cls[0]
                continue
            if len(same_cls) > 1:
                # if multiple in same class, pick the shortest full path as heuristic
                repaired[mp] = sorted(same_cls, key=lambda p: len(str(p)))[0]
                continue
        # fallback: unique basename across all
        unique = list({str(c): c for c in cands}.values())
        if len(unique) == 1:
            repaired[mp] = unique[0]
        else:
            # pick shortest path as heuristic
            repaired[mp] = sorted(unique, key=lambda p: len(str(p)))[0]
    return repaired

def extract_existing_paths(cases: List[Dict[str, Any]]) -> List[Path]:
    paths: List[Path] = []
    for item in cases:
        p = item.get("file_path") or item.get("path")
        if isinstance(p, str):
            path_obj = normalize_path(p)
            if path_exists_any(path_obj):
                paths.append(path_obj)
    return paths


def extract_missing_paths(cases: List[Dict[str, Any]]) -> List[Path]:
    paths: List[Path] = []
    for item in cases:
        p = item.get("file_path") or item.get("path")
        if isinstance(p, str):
            path_obj = normalize_path(p)
            if not path_exists_any(path_obj):
                paths.append(path_obj)
    return paths


def build_groups(cases: List[Dict[str, Any]], mode: str = "gt_pred") -> Dict[str, List[Path]]:
    """按 gt->pred 分组，值为存在的图片路径列表。
    
    兼容多种字段命名（中英文），并在缺失 gt 时尽量从路径中推断（ai/exp/后一级目录）。
    """
    # 优先从 JSON 读取 GT/Pred 字段；若 GT 缺失则回退从路径推导
    default_gt_keys = [
        "expected_theme", "gt", "truth", "label", "ground_truth", "true_label", "expected",
        "expected_label", "真实", "真实类别", "应为", "标签", "真实分类", "groundtruth"
    ]
    default_pred_keys = [
        "predicted_theme", "pred", "prediction", "predicted", "pred_label", "model_pred", "yolo_pred",
        "detected", "detected_label", "ai", "ai_label", "ai_theme",
        "预测", "预测类别", "误分为", "被误分为", "预测分类"
    ]

    def first_str(item: Dict[str, Any], keys: List[str]) -> Any:
        for k in keys:
            v = item.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
        return None

    def derive_gt_from_path(p: str) -> Any:
        try:
            parts = Path(p).parts
            # 寻找 "exp"，取其后一级目录作为 gt（若存在）
            for i, seg in enumerate(parts):
                if seg == "exp":
                    if i + 1 < len(parts):
                        return parts[i + 1]
                    break
        except Exception:
            pass
        return None

    groups: Dict[str, List[Path]] = {}
    for item in cases:
        p = item.get("file_path") or item.get("path")
        if not isinstance(p, str):
            continue
        path_obj = normalize_path(p)

        # 运行时选定的键优先（可由外部设置）；否则使用默认键
        gt_keys = getattr(build_groups, "_gt_keys", None) or default_gt_keys
        pred_keys = getattr(build_groups, "_pred_keys", None) or default_pred_keys

        # 先从 JSON 读取 GT/Pred；若 GT 缺失则回退路径
        gt = first_str(item, gt_keys)
        pred = first_str(item, pred_keys)
        if not gt:
            gt = derive_gt_from_path(str(path_obj))

        if mode == "gt_only":
            if not isinstance(gt, str):
                continue
            key = f"{gt}"
        else:
            if not isinstance(gt, str) or not isinstance(pred, str):
                continue
            key = f"{gt}->{pred}"
        groups.setdefault(key, []).append(path_obj)
    return groups


def detect_candidate_keys(sample: List[Dict[str, Any]], max_samples: int = 1000) -> Tuple[List[str], List[str]]:
    """从样本中统计可能的字符串键，返回候选 gt 键、pred 键列表（按出现频次排序）。"""
    from collections import Counter

    gt_aliases = set([
        "gt", "truth", "label", "ground_truth", "true_label", "expected",
        "expected_label", "actual", "真实", "真实类别", "应为", "标签", "真实分类", "groundtruth"
    ])
    pred_aliases = set([
        "pred", "prediction", "predicted", "pred_label", "model_pred", "yolo_pred",
        "detected", "detected_label", "ai", "ai_label", "ai_theme",
        "预测", "预测类别", "误分为", "被误分为", "预测分类"
    ])

    gt_counter: Counter[str] = Counter()
    pred_counter: Counter[str] = Counter()

    for i, item in enumerate(sample):
        if i >= max_samples:
            break
        if not isinstance(item, dict):
            continue
        for k, v in item.items():
            if isinstance(v, str) and v.strip():
                if k in gt_aliases:
                    gt_counter[k] += 1
                if k in pred_aliases:
                    pred_counter[k] += 1

    return [k for k, _ in gt_counter.most_common()], [k for k, _ in pred_counter.most_common()]



def deduplicate_keep_order(paths: List[Path]) -> List[Path]:
    seen: Dict[str, bool] = {}
    result: List[Path] = []
    for p in paths:
        key = str(p.resolve())
        if key not in seen:
            seen[key] = True
            result.append(p)
    return result


def open_batch(paths: List[Path]) -> None:
    """一次性打开一批图片。macOS 使用单次 open 多文件，其它平台逐个打开。"""
    if not paths:
        return
    try:
        if sys.platform == "darwin":
            subprocess.run(["open", *[str(p) for p in paths]], check=False)
        elif os.name == "nt":
            for p in paths:
                os.startfile(str(p))  # type: ignore[attr-defined]
        else:
            for p in paths:
                subprocess.run(["xdg-open", str(p)], check=False)
    except Exception:
        pass


def sanitize_group_dir_name(group_key: str) -> str:
    name = group_key.strip().replace("/", "-")
    # 去除不安全字符
    return re.sub(r"[^\w\-\u4e00-\u9fa5><= ]+", "_", name)


def annotate_batch(paths: List[Path], group_key: str, base_dir: Path = RESULT_DIR) -> int:
    """使用 YOLO 对一批图片生成标注图，保存到 result/<group_key>/ 下。
    返回成功生成的数量。
    """
    if not paths:
        return 0
    base_dir.mkdir(parents=True, exist_ok=True)
    group_dir = base_dir / sanitize_group_dir_name(group_key)
    group_dir.mkdir(parents=True, exist_ok=True)

    if yolo_classifier is None:
        print("❌ YOLO 分类器未可用，无法生成标注图")
        return 0

    success = 0
    for p in paths:
        try:
            # 为避免重名冲突，加 annotated_ 前缀
            outfile = group_dir / ("annotated_" + Path(str(p)).name)
            ok = yolo_classifier.create_annotated_image(str(p), str(outfile))
            if ok:
                success += 1
            else:
                # 若失败，尝试直接复制原图以占位（可选）
                pass
        except Exception as e:
            print(f"   ⚠️ 标注失败: {p} - {e}")
    print(f"✅ 本批标注完成，共生成 {success}/{len(paths)} 张，输出目录: {group_dir}")
    return success


def annotate_all_groups(groups: Dict[str, List[Path]], dest_root: Path = RESULT_DIR) -> None:
    if yolo_classifier is None:
        print("❌ YOLO 分类器未可用，无法生成标注图")
        return
    total_groups = len(groups)
    print(f"🛠️ 开始为所有分组生成标注图，共 {total_groups} 组...")
    done_groups = 0
    total_images = sum(len(v) for v in groups.values())
    done_images = 0
    for gk, gpaths in groups.items():
        print(f"\n📂 分组: {gk}  图片数: {len(gpaths)}")
        cnt = annotate_batch(gpaths, gk, base_dir=dest_root)
        done_groups += 1
        done_images += cnt
        print(f"进度: 组 {done_groups}/{total_groups}  累计成功 {done_images}/{total_images}")
    print(f"\n✅ 全部分组标注完成。输出根目录: {dest_root}")


def main() -> None:
    cases = load_error_cases_raw()
    if not cases:
        print("❌ 未找到可用的误分类记录（请提供 campusphoto/backend/error_cases.json）")
        sys.exit(1)

    print(f"✅ 已加载 {len(cases)} 条误分类记录（将直接尝试打开路径，打开失败即视为不存在）")

    # 默认直接使用 expected_theme 与 predicted_theme 进行 gt->pred 分组
    setattr(build_groups, "_gt_keys", ["expected_theme"])  # 若无则回退路径
    setattr(build_groups, "_pred_keys", ["predicted_theme"])  # 若无再用默认候选
    mode = "gt_pred"

    # 构建分组，并按组内图片数量降序显示
    groups = build_groups(cases, mode=mode)
    if not groups:
        print("❌ 未能构建分组（请确认 JSON 中包含可用的路径，或提供预测字段）")
        sys.exit(1)

    sorted_groups = sorted(groups.items(), key=lambda kv: len(kv[1]), reverse=True)

    # 不再预先检测缺失，直接按分组打开，如打开失败则由系统报错

    while True:
        print("\n可用分组：")
        for idx, (k, v) in enumerate(sorted_groups, 1):
            print(f"  {idx}. {k}  (共 {len(v)} 张)")
        print("选择序号进入该分组；输入 q 退出；输入 r 重新加载分组；输入 x 一键导出所有分组")

        try:
            choice = input("> ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\n👋 已退出")
            break

        if choice == "q":
            print("👋 已退出")
            break
        if choice == "r":
            cases = load_error_cases_raw()
            groups = build_groups(cases)
            sorted_groups = sorted(groups.items(), key=lambda kv: len(kv[1]), reverse=True)
            continue
        if choice == "x":
            annotate_all_groups(dict(sorted_groups), dest_root=RESULT_DIR)
            continue

        if not choice.isdigit():
            print("ℹ️ 请输入分组序号或 q 退出")
            continue

        idx = int(choice)
        if idx < 1 or idx > len(sorted_groups):
            print("ℹ️ 序号超出范围")
            continue

        group_key, group_paths = sorted_groups[idx - 1]
        group_paths = deduplicate_keep_order(group_paths)
        batch_size = 100
        total = len(group_paths)
        start = 0
        print(f"\n📂 分组: {group_key}  共 {total} 张")
        while start < total:
            end = min(start + batch_size, total)
            print(f"\n📦 即将打开第 {start+1} - {end} 张（共 {total}）")
            print("操作: 回车=打开本批, y=标注并导出本批, a=标注并导出整组, n=跳过本批, b=返回, q=退出")
            try:
                sub = input("> ").strip().lower()
            except (EOFError, KeyboardInterrupt):
                print("\n👋 已退出")
                return

            if sub == "q":
                print("👋 已退出")
                return
            if sub == "b":
                break
            if sub == "n":
                start = end
                continue
            if sub == "y":
                annotate_batch(group_paths[start:end], group_key)
                start = end
                continue
            if sub == "a":
                print("🛠️ 正在为整组生成标注图，这可能需要较长时间...")
                annotate_batch(group_paths, group_key)
                # 仅生成，不改变当前分页位置
                continue

            open_batch(group_paths[start:end])
            start = end


if __name__ == "__main__":
    main()


