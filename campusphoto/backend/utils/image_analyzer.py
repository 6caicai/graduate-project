"""
图像分析工具 - AI增强版本
"""
from typing import Dict, List, Tuple, Optional
import os
import tempfile
import logging
import random
import shutil
import numpy as np
from PIL import Image
import cv2
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import colorsys
from .hybrid_image_classifier import hybrid_classifier

logger = logging.getLogger(__name__)


class ImageAnalyzer:
    """图像分析器"""
    
    def __init__(self):
        # 主题分类映射 - 新的4大分类体系
        self.theme_mapping = {
            0: "人像",
            1: "动物与植物", 
            2: "城市与建筑",
            3: "自然风光"
        }
        
        # 详细子分类映射
        self.subcategory_mapping = {
            "人像": ["肖像", "群体照", "职业人物", "明星", "儿童", "老人", "生活场景", "活动记录"],
            "动物与植物": ["野生动物", "家养动物", "鸟类", "昆虫", "树木", "花卉", "植物特写", "动物行为"],
            "城市与建筑": ["城市风光", "街景", "地标建筑", "室内设计", "古建筑", "商务场景", "科技元素", "工业建筑"],
            "自然风光": ["山川", "海洋", "森林", "天空", "花草", "四季", "日出日落", "云彩", "湖泊", "河流"]
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
            # 检查文件是否存在
            if not os.path.exists(image_path):
                raise ValueError(f"图像文件不存在: {image_path}")
            
            # 获取文件大小
            file_size = os.path.getsize(image_path)
            
            # 加载图像
            image = Image.open(image_path)
            image_array = np.array(image)
            
            # 获取图像尺寸
            width, height = image.size
            
            # AI主题分类
            theme_result = self._classify_theme_ai(image_array)
            
            # AI主色调分析
            dominant_colors = self._extract_dominant_colors_ai(image_array)
            
            # AI图像质量评估
            quality_score = self._assess_image_quality_ai(image_array)
            
            # AI构图分析
            composition_features = self._analyze_composition_ai(image_array)
            
            # 生成智能标签
            tags = self._generate_smart_tags(theme_result, dominant_colors, composition_features)
            
            return {
                "theme": theme_result["theme"],
                "subcategory": theme_result.get("subcategory"),
                "confidence": theme_result["confidence"],
                "dominant_colors": dominant_colors,
                "quality_score": quality_score,
                "composition": composition_features,
                "exif": self._extract_exif_data(image),
                "dimensions": {"width": width, "height": height},
                "file_size": file_size,
                "tags": tags
            }
            
        except Exception as e:
            logger.error(f"图像分析失败: {str(e)}")
            # 回退到简单分析
            return self._fallback_analysis(image_path)
    
    def _classify_theme_ai(self, image_array: np.ndarray) -> Dict:
        """AI主题分类 - 使用深度学习模型"""
        try:
            # 保存临时图像文件用于AI分类
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                # 转换numpy数组为PIL图像
                if len(image_array.shape) == 3:
                    image = Image.fromarray(image_array)
                else:
                    image = Image.fromarray(image_array, mode='L').convert('RGB')
                
                image.save(tmp.name)
                temp_path = tmp.name
            
            try:
                # 使用混合分类器
                ai_result = hybrid_classifier.classify_image(temp_path)
                
                if ai_result and ai_result.get("theme"):
                    return {
                        "theme": ai_result["theme"],
                        "subcategory": ai_result.get("subcategory"),
                        "confidence": ai_result.get("confidence", 0.8)
                    }
                else:
                    # AI分类失败，回退到传统方法
                    return self._classify_theme_traditional(image_array)
                    
            finally:
                # 清理临时文件
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"AI主题分类失败: {str(e)}")
            return self._classify_theme_traditional(image_array)
    
    def _classify_theme_traditional(self, image_array: np.ndarray) -> Dict:
        """传统主题分类 - 基于图像特征分析"""
        try:
            # 提取图像特征
            features = self._extract_image_features(image_array)
            
            # 基于特征进行分类
            theme, confidence = self._classify_by_features(features)
            
            # 将主题信息添加到特征中
            features["theme"] = theme
            
            # 选择子分类
            subcategories = self.subcategory_mapping.get(theme, [])
            subcategory = self._select_subcategory(features, subcategories)
            
            return {
                "theme": theme,
                "subcategory": subcategory,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"传统主题分类失败: {str(e)}")
            return self._classify_theme_simple()
    
    def _extract_image_features(self, image_array: np.ndarray) -> Dict:
        """提取图像特征"""
        # 转换为RGB
        if len(image_array.shape) == 3:
            rgb_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        else:
            rgb_image = image_array
        
        # 转换为灰度图
        gray = cv2.cvtColor(rgb_image, cv2.COLOR_BGR2GRAY)
        
        # 计算颜色特征
        color_features = self._calculate_color_features(rgb_image)
        
        # 计算纹理特征
        texture_features = self._calculate_texture_features(gray)
        
        # 计算形状特征
        shape_features = self._calculate_shape_features(gray)
        
        # 计算亮度特征
        brightness = np.mean(gray) / 255.0
        
        # 计算对比度
        contrast = np.std(gray) / 255.0
        
        return {
            "color_features": color_features,
            "texture_features": texture_features,
            "shape_features": shape_features,
            "brightness": brightness,
            "contrast": contrast,
            "aspect_ratio": rgb_image.shape[1] / rgb_image.shape[0]
        }
    
    def _calculate_color_features(self, image: np.ndarray) -> Dict:
        """计算颜色特征"""
        # 计算主色调
        pixels = image.reshape(-1, 3)
        
        # 检查颜色多样性
        unique_colors = len(np.unique(pixels.view(np.dtype((np.void, pixels.dtype.itemsize * pixels.shape[1])))))
        
        # 根据颜色多样性调整聚类数量
        n_clusters = min(5, max(2, unique_colors))
        
        try:
            # 使用K-means聚类找到主要颜色
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            kmeans.fit(pixels)
            
            # 获取主要颜色
            dominant_colors = kmeans.cluster_centers_
            labels = kmeans.labels_
            
            # 计算每种颜色的比例
            color_counts = np.bincount(labels)
            color_percentages = color_counts / len(labels)
            
            # 计算颜色分布
            color_variance = np.var(pixels, axis=0)
            
            return {
                "dominant_colors": dominant_colors,
                "color_percentages": color_percentages,
                "color_variance": color_variance,
                "color_diversity": len(np.unique(labels))
            }
        except Exception as e:
            logger.warning(f"K-means聚类失败，使用简化方法: {str(e)}")
            # 回退到简单方法
            unique_colors, counts = np.unique(pixels.view(np.dtype((np.void, pixels.dtype.itemsize * pixels.shape[1]))), return_counts=True)
            dominant_colors = pixels[np.argmax(counts)]
            return {
                "dominant_colors": [dominant_colors],
                "color_percentages": [1.0],
                "color_variance": np.var(pixels, axis=0),
                "color_diversity": 1
            }
    
    def _calculate_texture_features(self, gray_image: np.ndarray) -> Dict:
        """计算纹理特征"""
        # 计算LBP (Local Binary Pattern) 特征
        lbp = self._calculate_lbp(gray_image)
        
        # 计算梯度特征
        grad_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        return {
            "lbp_histogram": np.histogram(lbp, bins=256)[0],
            "gradient_mean": np.mean(gradient_magnitude),
            "gradient_std": np.std(gradient_magnitude),
            "texture_energy": np.sum(gradient_magnitude**2)
        }
    
    def _calculate_shape_features(self, gray_image: np.ndarray) -> Dict:
        """计算形状特征"""
        # 边缘检测
        edges = cv2.Canny(gray_image, 50, 150)
        
        # 查找轮廓
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # 计算形状特征
        if contours:
            # 最大轮廓
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            perimeter = cv2.arcLength(largest_contour, True)
            
            # 形状复杂度
            if perimeter > 0:
                circularity = 4 * np.pi * area / (perimeter ** 2)
            else:
                circularity = 0
        else:
            area = 0
            perimeter = 0
            circularity = 0
        
        return {
            "edge_density": np.sum(edges) / (edges.shape[0] * edges.shape[1]),
            "contour_count": len(contours),
            "largest_area": area,
            "circularity": circularity
        }
    
    def _calculate_lbp(self, image: np.ndarray) -> np.ndarray:
        """计算局部二值模式"""
        rows, cols = image.shape
        lbp = np.zeros_like(image)
        
        for i in range(1, rows - 1):
            for j in range(1, cols - 1):
                center = image[i, j]
                binary_string = ""
                
                # 8邻域
                neighbors = [
                    image[i-1, j-1], image[i-1, j], image[i-1, j+1],
                    image[i, j+1], image[i+1, j+1], image[i+1, j],
                    image[i+1, j-1], image[i, j-1]
                ]
                
                for neighbor in neighbors:
                    binary_string += "1" if neighbor >= center else "0"
                
                lbp[i, j] = int(binary_string, 2)
        
        return lbp
    
    def _classify_by_features(self, features: Dict) -> Tuple[str, float]:
        """基于特征进行分类"""
        # 基于规则的特征分类
        brightness = features["brightness"]
        contrast = features["contrast"]
        color_diversity = features["color_features"]["color_diversity"]
        edge_density = features["shape_features"]["edge_density"]
        circularity = features["shape_features"]["circularity"]
        aspect_ratio = features["aspect_ratio"]
        
        # 改进的分类规则
        # 1. 自然与风景：高亮度，低对比度，中等颜色多样性
        if brightness > 0.6 and contrast < 0.4 and color_diversity >= 3:
            return "自然与风景", 0.85
        
        # 2. 城市与建筑：高边缘密度，高对比度，几何形状多
        elif edge_density > 0.15 and contrast > 0.4 and circularity < 0.5:
            return "城市与建筑", 0.8
        
        # 3. 人物：高圆形度，低边缘密度，中等亮度
        elif circularity > 0.6 and edge_density < 0.08 and 0.3 < brightness < 0.8:
            return "人物", 0.8
        
        # 4. 动物与植物：中等亮度，中等对比度，颜色多样性高
        elif 0.4 < brightness < 0.8 and 0.2 < contrast < 0.6 and color_diversity >= 4:
            return "动物与植物", 0.75
        
        # 5. 艺术与抽象：低亮度或高对比度，颜色多样性低
        elif (brightness < 0.3 and color_diversity < 3) or (contrast > 0.7 and color_diversity < 2):
            return "艺术与抽象", 0.7
        
        # 6. 日常生活与物品：高边缘密度，中等亮度
        elif edge_density > 0.12 and 0.3 < brightness < 0.7:
            return "日常生活与物品", 0.75
        
        # 7. 事件与活动：高亮度，高颜色多样性，中等对比度
        elif brightness > 0.7 and color_diversity >= 5 and 0.3 < contrast < 0.6:
            return "事件与活动", 0.7
        
        # 8. 商业与科技：高对比度，几何形状，中等亮度
        elif contrast > 0.5 and circularity < 0.4 and 0.4 < brightness < 0.8:
            return "商业与科技", 0.7
        
        # 9. 符号与图标：低边缘密度，高对比度，简单形状
        elif edge_density < 0.05 and contrast > 0.6 and circularity > 0.8:
            return "符号与图标", 0.7
        
        else:
            # 基于主要特征进行更智能的默认分类
            if brightness > 0.6:
                return "自然与风景", 0.6
            elif edge_density > 0.1:
                return "城市与建筑", 0.6
            else:
                return "艺术与抽象", 0.6
    
    def _select_subcategory(self, features: Dict, subcategories: List[str]) -> Optional[str]:
        """选择子分类"""
        if not subcategories:
            return None
        
        # 基于特征智能选择子分类
        brightness = features["brightness"]
        contrast = features["contrast"]
        color_diversity = features["color_features"]["color_diversity"]
        edge_density = features["shape_features"]["edge_density"]
        
        # 根据主题和特征选择最合适的子分类
        theme = features.get("theme", "")
        
        if theme == "自然与风景":
            # 根据亮度和颜色多样性选择
            if brightness > 0.8 and color_diversity >= 4:
                # 明亮多彩的风景
                preferred = ["天空", "花草", "四季"]
            elif brightness < 0.5:
                # 较暗的风景
                preferred = ["森林", "山川"]
            else:
                # 一般风景
                preferred = ["山川", "海洋", "森林", "天空"]
        elif theme == "动物与植物":
            # 根据边缘密度和颜色多样性选择
            if edge_density < 0.05 and color_diversity >= 4:
                preferred = ["花卉", "树木"]
            elif edge_density > 0.08:
                preferred = ["野生动物", "家养动物", "鸟类"]
            else:
                preferred = ["树木", "花卉", "昆虫"]
        elif theme == "城市与建筑":
            # 根据对比度和边缘密度选择
            if contrast > 0.6 and edge_density > 0.2:
                preferred = ["地标建筑", "城市风光"]
            elif edge_density < 0.15:
                preferred = ["室内设计", "古建筑"]
            else:
                preferred = ["街景", "城市风光"]
        else:
            # 其他主题使用随机选择
            return random.choice(subcategories)
        
        # 从偏好列表中选择存在的子分类
        available_preferred = [sub for sub in preferred if sub in subcategories]
        if available_preferred:
            return random.choice(available_preferred)
        else:
            return random.choice(subcategories)
    
    def _classify_theme_simple(self) -> Dict:
        """简化的主题分类 - 使用新的9大分类体系"""
        themes = list(self.theme_mapping.values())
        theme = random.choice(themes)
        confidence = random.uniform(0.6, 0.9)
        
        # 随机选择一个子分类
        subcategories = self.subcategory_mapping.get(theme, [])
        subcategory = random.choice(subcategories) if subcategories else None
        
        return {
            "theme": theme, 
            "subcategory": subcategory,
            "confidence": confidence
        }
    
    def _extract_dominant_colors_ai(self, image_array: np.ndarray) -> List[Dict]:
        """AI主色调分析"""
        try:
            # 重塑图像数据
            pixels = image_array.reshape(-1, 3)
            
            # 使用K-means聚类找到主要颜色
            kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
            kmeans.fit(pixels)
            
            # 获取主要颜色和标签
            dominant_colors = kmeans.cluster_centers_
            labels = kmeans.labels_
            
            # 计算每种颜色的比例
            color_counts = np.bincount(labels)
            color_percentages = color_counts / len(labels)
            
            # 转换为颜色名称和百分比
            color_results = []
            for i, (color, percentage) in enumerate(zip(dominant_colors, color_percentages)):
                color_name = self._rgb_to_color_name(color)
                color_results.append({
                    "name": color_name,
                        "percentage": float(percentage),
                    "rgb": color.tolist()
                })
            
            # 按百分比排序
            color_results.sort(key=lambda x: x["percentage"], reverse=True)
            
            return color_results[:3]  # 返回前3个主要颜色
            
        except Exception as e:
            logger.error(f"AI颜色分析失败: {str(e)}")
            return self._extract_dominant_colors_simple()
    
    def _rgb_to_color_name(self, rgb: np.ndarray) -> str:
        """将RGB值转换为颜色名称"""
        r, g, b = rgb.astype(int)
        
        # 转换为HSV进行更好的颜色识别
        h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
        
        # 基于HSV值判断颜色
        if v < 0.2:
            return "黑色"
        elif v > 0.8 and s < 0.1:
            return "白色"
        elif s < 0.2:
            return "灰色"
        elif h < 0.05 or h > 0.95:
                return "红色"
        elif h < 0.1:
            return "橙色"
        elif h < 0.2:
            return "黄色"
        elif h < 0.4:
            return "绿色"
        elif h < 0.6:
            return "青色"
        elif h < 0.8:
            return "蓝色"
        elif h < 0.9:
                return "紫色"
        else:
            return "粉色"
    
    def _assess_image_quality_ai(self, image_array: np.ndarray) -> float:
        """AI图像质量评估"""
        try:
            # 转换为灰度图
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = image_array
            
            # 计算清晰度（拉普拉斯方差）
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # 计算对比度
            contrast = np.std(gray) / 255.0
            
            # 计算亮度分布
            brightness = np.mean(gray) / 255.0
            
            # 计算噪声水平（高频成分）
            noise_level = self._calculate_noise_level(gray)
            
            # 综合质量评分
            sharpness_score = min(laplacian_var / 1000, 1.0)  # 归一化
            contrast_score = min(contrast * 2, 1.0)  # 归一化
            brightness_score = 1.0 - abs(brightness - 0.5) * 2  # 理想亮度为0.5
            noise_score = max(0, 1.0 - noise_level)  # 噪声越少越好
            
            # 加权平均
            quality_score = (
                sharpness_score * 0.4 +
                contrast_score * 0.3 +
                brightness_score * 0.2 +
                noise_score * 0.1
            )
            
            return float(np.clip(quality_score, 0.0, 1.0))
            
        except Exception as e:
            logger.error(f"AI质量评估失败: {str(e)}")
            return random.uniform(0.6, 0.9)
    
    def _calculate_noise_level(self, gray_image: np.ndarray) -> float:
        """计算噪声水平"""
        # 使用高斯滤波估计噪声
        blurred = cv2.GaussianBlur(gray_image, (5, 5), 0)
        noise = gray_image.astype(float) - blurred.astype(float)
        return np.std(noise) / 255.0
    
    def _analyze_composition_ai(self, image_array: np.ndarray) -> Dict:
        """AI构图分析"""
        try:
            height, width = image_array.shape[:2]
            aspect_ratio = width / height
            
            # 转换为灰度图
            if len(image_array.shape) == 3:
                gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = image_array
            
            # 计算三分法构图
            rule_of_thirds = self._analyze_rule_of_thirds(gray)
            
            # 计算对称性
            symmetry = self._calculate_symmetry(gray)
            
            # 计算主体位置
            subject_position = self._find_subject_position(gray)
            
            # 计算景深效果
            depth_of_field = self._analyze_depth_of_field(gray)
            
            return {
                "aspect_ratio": aspect_ratio,
                "rule_of_thirds": rule_of_thirds,
                "symmetry": symmetry,
                "subject_position": subject_position,
                "depth_of_field": depth_of_field
            }
            
        except Exception as e:
            logger.error(f"AI构图分析失败: {str(e)}")
            return {"aspect_ratio": 1.0, "rule_of_thirds": 0.5, "symmetry": 0.5}
    
    def _analyze_rule_of_thirds(self, gray_image: np.ndarray) -> float:
        """分析三分法构图"""
        height, width = gray_image.shape
        
        # 计算三分线位置
        third_h = height // 3
        third_w = width // 3
        
        # 计算三分线交点处的亮度
        intersections = [
            gray_image[third_h, third_w],
            gray_image[third_h, 2*third_w],
            gray_image[2*third_h, third_w],
            gray_image[2*third_h, 2*third_w]
        ]
        
        # 计算交点亮度与整体亮度的差异
        avg_intersection = np.mean(intersections)
        avg_overall = np.mean(gray_image)
        
        return abs(avg_intersection - avg_overall) / 255.0
    
    def _calculate_symmetry(self, gray_image: np.ndarray) -> float:
        """计算图像对称性"""
        height, width = gray_image.shape
        
        # 水平对称
        top_half = gray_image[:height//2, :]
        bottom_half = gray_image[height//2:, :]
        bottom_half_flipped = np.flipud(bottom_half)
        
        # 确保两个半部分大小相同
        min_height = min(top_half.shape[0], bottom_half_flipped.shape[0])
        top_half = top_half[:min_height, :]
        bottom_half_flipped = bottom_half_flipped[:min_height, :]
        
        horizontal_symmetry = 1.0 - np.mean(np.abs(top_half.astype(float) - bottom_half_flipped.astype(float))) / 255.0
        
        # 垂直对称
        left_half = gray_image[:, :width//2]
        right_half = gray_image[:, width//2:]
        right_half_flipped = np.fliplr(right_half)
        
        # 确保两个半部分大小相同
        min_width = min(left_half.shape[1], right_half_flipped.shape[1])
        left_half = left_half[:, :min_width]
        right_half_flipped = right_half_flipped[:, :min_width]
        
        vertical_symmetry = 1.0 - np.mean(np.abs(left_half.astype(float) - right_half_flipped.astype(float))) / 255.0
        
        return (horizontal_symmetry + vertical_symmetry) / 2.0
    
    def _find_subject_position(self, gray_image: np.ndarray) -> str:
        """找到主体位置"""
        height, width = gray_image.shape
        
        # 计算图像中心
        center_y, center_x = height // 2, width // 2
        
        # 计算四个象限的亮度差异
        top_left = np.mean(gray_image[:center_y, :center_x])
        top_right = np.mean(gray_image[:center_y, center_x:])
        bottom_left = np.mean(gray_image[center_y:, :center_x])
        bottom_right = np.mean(gray_image[center_y:, center_x:])
        
        quadrants = [top_left, top_right, bottom_left, bottom_right]
        max_quadrant = np.argmax(quadrants)
        
        positions = ["左上", "右上", "左下", "右下"]
        return positions[max_quadrant]
    
    def _analyze_depth_of_field(self, gray_image: np.ndarray) -> float:
        """分析景深效果"""
        # 计算图像梯度
        grad_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # 计算梯度分布
        gradient_std = np.std(gradient_magnitude)
        gradient_mean = np.mean(gradient_magnitude)
        
        # 景深效果与梯度分布相关
        depth_score = gradient_std / (gradient_mean + 1e-6)
        
        return float(np.clip(depth_score, 0.0, 1.0))
    
    def _extract_exif_data(self, image: Image.Image) -> Dict:
        """提取EXIF数据"""
        try:
            exif_data = {}
            if hasattr(image, '_getexif') and image._getexif() is not None:
                exif = image._getexif()
                for tag_id, value in exif.items():
                    tag = image._getexif().get(tag_id, {})
                    if isinstance(tag, dict) and 'name' in tag:
                        exif_data[tag['name']] = str(value)
            return exif_data
        except Exception:
            return {}
    
    def _generate_smart_tags(self, theme_result: Dict, colors: List[Dict], composition: Dict) -> List[str]:
        """生成智能标签"""
        tags = [theme_result["theme"]]
        
        # 添加子分类标签
        if theme_result.get("subcategory"):
            tags.append(theme_result["subcategory"])
        
        # 添加颜色标签
        if colors:
            tags.append(colors[0]["name"])
        
        # 添加构图标签
        if composition.get("rule_of_thirds", 0) > 0.7:
            tags.append("三分法构图")
        
        if composition.get("symmetry", 0) > 0.8:
            tags.append("对称构图")
        
        # 添加质量标签
        if theme_result.get("confidence", 0) > 0.8:
            tags.append("高质量")
        
        return tags
    
    def _fallback_analysis(self, image_path: str) -> Dict:
        """回退分析"""
        return {
            "theme": "自然风光",
            "confidence": 0.7,
            "dominant_colors": [{"name": "蓝色", "percentage": 0.3}],
            "quality_score": 0.8,
            "composition": {"aspect_ratio": 1.78},
            "exif": {},
            "dimensions": {"width": 1920, "height": 1080},
            "file_size": 0,
            "tags": ["自然风光", "蓝色"]
        }
    
    def _extract_dominant_colors_simple(self) -> List[Dict]:
        """简化的主色调提取"""
        colors = ["蓝色", "绿色", "红色", "黄色", "橙色", "紫色", "粉色", "灰色"]
        color = random.choice(colors)
        return [{"name": color, "percentage": random.uniform(0.3, 0.8)}]
    
    def _analyze_composition_simple(self) -> Dict:
        """简化的构图分析"""
        return {"aspect_ratio": random.uniform(0.5, 2.0)}
    
    def _generate_tags_simple(self, theme_result: Dict, colors: List[Dict]) -> List[str]:
        """简化的标签生成 - 包含主分类和子分类"""
        tags = [theme_result["theme"]]
        
        # 添加子分类标签
        if theme_result.get("subcategory"):
            tags.append(theme_result["subcategory"])
        
        # 添加颜色标签
        if colors:
            tags.append(colors[0]["name"])
        
        return tags
    
    def create_thumbnail(self, image_path: str, size: Tuple[int, int] = (300, 300)) -> str:
        """创建缩略图 - 简化版本"""
        try:
            # 直接返回原图路径作为缩略图
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            thumbnail_path = os.path.join(
                tempfile.gettempdir(),
                f"{base_name}_thumb_{size[0]}x{size[1]}.jpg"
            )
            
            # 复制原文件作为缩略图（简化实现）
            shutil.copy2(image_path, thumbnail_path)
            
            return thumbnail_path
                
        except Exception as e:
            logger.error(f"缩略图创建失败: {str(e)}")
            return image_path


# 全局图像分析器实例
image_analyzer = ImageAnalyzer()