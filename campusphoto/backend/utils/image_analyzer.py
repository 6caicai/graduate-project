"""
图像分析工具 - 使用OpenCV进行图像识别和分析
"""
import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional
import os
from PIL import Image, ExifTags
import tempfile
import logging

logger = logging.getLogger(__name__)


class ImageAnalyzer:
    """图像分析器"""
    
    def __init__(self):
        # 主题分类映射
        self.theme_mapping = {
            0: "校园风光",
            1: "人物肖像", 
            2: "活动纪实",
            3: "动物植物",
            4: "夜景",
            5: "创意摄影"
        }
        
        # 颜色名称映射
        self.color_names = {
            "red": "红色",
            "green": "绿色", 
            "blue": "蓝色",
            "yellow": "黄色",
            "orange": "橙色",
            "purple": "紫色",
            "pink": "粉色",
            "brown": "棕色",
            "gray": "灰色",
            "black": "黑色",
            "white": "白色"
        }
    
    def analyze_image(self, image_path: str) -> Dict:
        """
        分析图像，返回主题分类、置信度、主色调等信息
        """
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"无法读取图像文件: {image_path}")
            
            # 获取图像基本信息
            height, width, channels = image.shape
            
            # 主题分类
            theme_result = self._classify_theme(image)
            
            # 主色调分析
            dominant_colors = self._extract_dominant_colors(image)
            
            # 图像质量评估
            quality_score = self._assess_image_quality(image)
            
            # 构图分析
            composition_features = self._analyze_composition(image)
            
            # EXIF信息提取
            exif_data = self._extract_exif_data(image_path)
            
            return {
                "theme": theme_result["theme"],
                "confidence": theme_result["confidence"],
                "dominant_colors": dominant_colors,
                "quality_score": quality_score,
                "composition": composition_features,
                "exif": exif_data,
                "dimensions": {"width": width, "height": height},
                "file_size": os.path.getsize(image_path),
                "tags": self._generate_tags(theme_result, dominant_colors, composition_features)
            }
            
        except Exception as e:
            logger.error(f"图像分析失败: {str(e)}")
            return {
                "theme": "未知",
                "confidence": 0.0,
                "dominant_colors": [],
                "quality_score": 0.0,
                "composition": {},
                "exif": {},
                "dimensions": {"width": 0, "height": 0},
                "file_size": 0,
                "tags": [],
                "error": str(e)
            }
    
    def _classify_theme(self, image: np.ndarray) -> Dict:
        """
        主题分类 - 使用简单的特征检测方法
        在实际项目中可以替换为训练好的CNN模型
        """
        # 转换为RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # 特征提取
        features = self._extract_features(image)
        
        # 简单的规则分类（可替换为ML模型）
        theme_scores = {
            "校园风光": self._score_landscape(features),
            "人物肖像": self._score_portrait(features), 
            "活动纪实": self._score_event(features),
            "动物植物": self._score_nature(features),
            "夜景": self._score_night(features),
            "创意摄影": self._score_creative(features)
        }
        
        # 获取最高分数的主题
        best_theme = max(theme_scores, key=theme_scores.get)
        confidence = theme_scores[best_theme]
        
        return {
            "theme": best_theme,
            "confidence": min(confidence, 1.0),
            "all_scores": theme_scores
        }
    
    def _extract_features(self, image: np.ndarray) -> Dict:
        """提取图像特征"""
        # 转换为灰度图
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 边缘检测
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
        
        # 亮度统计
        brightness = np.mean(gray)
        
        # 对比度
        contrast = np.std(gray)
        
        # 颜色统计
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        hue_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180])
        sat_hist = cv2.calcHist([hsv], [1], None, [256], [0, 256])
        
        # 人脸检测
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        face_count = len(faces)
        
        return {
            "edge_density": edge_density,
            "brightness": brightness,
            "contrast": contrast,
            "face_count": face_count,
            "hue_hist": hue_hist.flatten(),
            "sat_hist": sat_hist.flatten(),
            "aspect_ratio": image.shape[1] / image.shape[0]
        }
    
    def _score_landscape(self, features: Dict) -> float:
        """校园风光评分"""
        score = 0.0
        
        # 高对比度，丰富的边缘
        if features["contrast"] > 30:
            score += 0.3
        if features["edge_density"] > 0.1:
            score += 0.2
        
        # 横向构图
        if features["aspect_ratio"] > 1.2:
            score += 0.2
        
        # 无人脸
        if features["face_count"] == 0:
            score += 0.3
        
        return score
    
    def _score_portrait(self, features: Dict) -> float:
        """人物肖像评分"""
        score = 0.0
        
        # 有人脸
        if features["face_count"] > 0:
            score += 0.6
        
        # 竖向构图
        if features["aspect_ratio"] < 0.8:
            score += 0.2
        
        # 适中的亮度
        if 80 < features["brightness"] < 180:
            score += 0.2
        
        return score
    
    def _score_event(self, features: Dict) -> float:
        """活动纪实评分"""
        score = 0.0
        
        # 多人脸或高边缘密度
        if features["face_count"] > 1:
            score += 0.4
        if features["edge_density"] > 0.15:
            score += 0.3
        
        # 较高的饱和度变化
        sat_variance = np.var(features["sat_hist"])
        if sat_variance > 1000:
            score += 0.3
        
        return score
    
    def _score_nature(self, features: Dict) -> float:
        """动物植物评分"""
        score = 0.0
        
        # 绿色调较多（色相在60-120度范围）
        green_range = np.sum(features["hue_hist"][30:60])
        total_hue = np.sum(features["hue_hist"])
        if total_hue > 0 and green_range / total_hue > 0.3:
            score += 0.4
        
        # 高饱和度
        high_sat = np.sum(features["sat_hist"][128:])
        total_sat = np.sum(features["sat_hist"])
        if total_sat > 0 and high_sat / total_sat > 0.5:
            score += 0.3
        
        # 无人脸
        if features["face_count"] == 0:
            score += 0.3
        
        return score
    
    def _score_night(self, features: Dict) -> float:
        """夜景评分"""
        score = 0.0
        
        # 低亮度
        if features["brightness"] < 80:
            score += 0.5
        
        # 高对比度（明暗对比强烈）
        if features["contrast"] > 40:
            score += 0.3
        
        # 低饱和度
        low_sat = np.sum(features["sat_hist"][:64])
        total_sat = np.sum(features["sat_hist"])
        if total_sat > 0 and low_sat / total_sat > 0.6:
            score += 0.2
        
        return score
    
    def _score_creative(self, features: Dict) -> float:
        """创意摄影评分"""
        score = 0.0
        
        # 极端长宽比
        if features["aspect_ratio"] > 2.0 or features["aspect_ratio"] < 0.5:
            score += 0.3
        
        # 极端亮度
        if features["brightness"] < 50 or features["brightness"] > 200:
            score += 0.3
        
        # 高饱和度变化
        sat_variance = np.var(features["sat_hist"])
        if sat_variance > 2000:
            score += 0.4
        
        return score
    
    def _extract_dominant_colors(self, image: np.ndarray, k: int = 5) -> List[Dict]:
        """提取主色调"""
        try:
            # 重塑图像数据
            data = image.reshape((-1, 3))
            data = np.float32(data)
            
            # K-means聚类
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
            _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            
            # 计算每个颜色的占比
            unique, counts = np.unique(labels, return_counts=True)
            
            colors = []
            for i, center in enumerate(centers):
                if i in unique:
                    percentage = counts[list(unique).index(i)] / len(labels)
                    color_name = self._get_color_name(center)
                    colors.append({
                        "rgb": [int(center[2]), int(center[1]), int(center[0])],  # BGR to RGB
                        "hex": f"#{int(center[2]):02x}{int(center[1]):02x}{int(center[0]):02x}",
                        "percentage": float(percentage),
                        "name": color_name
                    })
            
            # 按占比排序
            colors.sort(key=lambda x: x["percentage"], reverse=True)
            return colors
            
        except Exception as e:
            logger.error(f"主色调提取失败: {str(e)}")
            return []
    
    def _get_color_name(self, rgb: np.ndarray) -> str:
        """获取颜色名称"""
        r, g, b = int(rgb[2]), int(rgb[1]), int(rgb[0])  # BGR to RGB
        
        # 简单的颜色分类
        if r < 50 and g < 50 and b < 50:
            return "黑色"
        elif r > 200 and g > 200 and b > 200:
            return "白色"
        elif abs(r - g) < 30 and abs(g - b) < 30:
            return "灰色"
        elif r > g and r > b:
            if g > 100:
                return "橙色" if g > b else "粉色"
            else:
                return "红色"
        elif g > r and g > b:
            return "绿色"
        elif b > r and b > g:
            if r > 100:
                return "紫色"
            else:
                return "蓝色"
        elif r > 150 and g > 150 and b < 100:
            return "黄色"
        else:
            return "棕色"
    
    def _assess_image_quality(self, image: np.ndarray) -> float:
        """评估图像质量"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 清晰度（基于拉普拉斯变换）
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_score = min(laplacian_var / 1000, 1.0)
            
            # 噪声估计
            noise = np.std(gray - cv2.GaussianBlur(gray, (5, 5), 0))
            noise_score = max(0, 1.0 - noise / 50)
            
            # 曝光评估
            brightness = np.mean(gray)
            exposure_score = 1.0 - abs(brightness - 127) / 127
            
            # 对比度
            contrast = np.std(gray)
            contrast_score = min(contrast / 50, 1.0)
            
            # 综合评分
            quality = (sharpness_score * 0.3 + 
                      noise_score * 0.2 + 
                      exposure_score * 0.3 + 
                      contrast_score * 0.2)
            
            return float(quality)
            
        except Exception as e:
            logger.error(f"图像质量评估失败: {str(e)}")
            return 0.5
    
    def _analyze_composition(self, image: np.ndarray) -> Dict:
        """构图分析"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape
            
            # 三分法分析
            third_lines = {
                "v1": w // 3,
                "v2": 2 * w // 3,
                "h1": h // 3,
                "h2": 2 * h // 3
            }
            
            # 检测关键点
            corners = cv2.goodFeaturesToTrack(gray, 100, 0.01, 10)
            
            # 计算黄金分割点附近的特征密度
            golden_ratio_score = 0.0
            if corners is not None:
                for corner in corners:
                    x, y = corner.ravel()
                    # 检查是否在黄金分割线附近
                    if (abs(x - third_lines["v1"]) < 20 or abs(x - third_lines["v2"]) < 20 or
                        abs(y - third_lines["h1"]) < 20 or abs(y - third_lines["h2"]) < 20):
                        golden_ratio_score += 1
                
                golden_ratio_score = min(golden_ratio_score / len(corners), 1.0)
            
            # 对称性分析
            left_half = gray[:, :w//2]
            right_half = cv2.flip(gray[:, w//2:], 1)
            symmetry_score = 1.0 - np.mean(np.abs(left_half.astype(float) - right_half.astype(float))) / 255
            
            return {
                "golden_ratio_score": float(golden_ratio_score),
                "symmetry_score": float(max(0, symmetry_score)),
                "key_points_count": len(corners) if corners is not None else 0,
                "aspect_ratio": w / h
            }
            
        except Exception as e:
            logger.error(f"构图分析失败: {str(e)}")
            return {
                "golden_ratio_score": 0.0,
                "symmetry_score": 0.0,
                "key_points_count": 0,
                "aspect_ratio": 1.0
            }
    
    def _extract_exif_data(self, image_path: str) -> Dict:
        """提取EXIF信息"""
        try:
            image = Image.open(image_path)
            exifdata = image.getexif()
            
            exif_info = {}
            for tag_id in exifdata:
                tag = ExifTags.TAGS.get(tag_id, tag_id)
                data = exifdata.get(tag_id)
                
                # 处理特定的EXIF标签
                if tag in ["DateTime", "DateTimeOriginal", "DateTimeDigitized"]:
                    exif_info[tag] = str(data)
                elif tag in ["Make", "Model", "Software"]:
                    exif_info[tag] = str(data)
                elif tag == "Orientation":
                    exif_info[tag] = int(data)
                elif tag in ["XResolution", "YResolution"]:
                    exif_info[tag] = float(data)
                elif tag in ["ExposureTime", "FNumber", "ISO"]:
                    exif_info[tag] = str(data)
            
            return exif_info
            
        except Exception as e:
            logger.error(f"EXIF信息提取失败: {str(e)}")
            return {}
    
    def _generate_tags(self, theme_result: Dict, colors: List[Dict], composition: Dict) -> List[str]:
        """生成标签"""
        tags = []
        
        # 主题标签
        if theme_result["confidence"] > 0.6:
            tags.append(theme_result["theme"])
        
        # 颜色标签
        for color in colors[:3]:  # 只取前3个主色调
            if color["percentage"] > 0.2:
                tags.append(color["name"])
        
        # 构图标签
        if composition["golden_ratio_score"] > 0.3:
            tags.append("构图优秀")
        if composition["symmetry_score"] > 0.7:
            tags.append("对称构图")
        
        # 长宽比标签
        aspect_ratio = composition["aspect_ratio"]
        if aspect_ratio > 1.5:
            tags.append("横向构图")
        elif aspect_ratio < 0.7:
            tags.append("竖向构图")
        else:
            tags.append("方形构图")
        
        return tags
    
    def create_thumbnail(self, image_path: str, size: Tuple[int, int] = (300, 300)) -> str:
        """创建缩略图"""
        try:
            with Image.open(image_path) as image:
                # 保持长宽比的缩略图
                image.thumbnail(size, Image.Resampling.LANCZOS)
                
                # 生成缩略图文件名
                base_name = os.path.splitext(os.path.basename(image_path))[0]
                thumbnail_path = os.path.join(
                    tempfile.gettempdir(),
                    f"{base_name}_thumb_{size[0]}x{size[1]}.jpg"
                )
                
                # 保存缩略图
                image.save(thumbnail_path, "JPEG", quality=85, optimize=True)
                
                return thumbnail_path
                
        except Exception as e:
            logger.error(f"缩略图创建失败: {str(e)}")
            return image_path


# 全局图像分析器实例
image_analyzer = ImageAnalyzer()

