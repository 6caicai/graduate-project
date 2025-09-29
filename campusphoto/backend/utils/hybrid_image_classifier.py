"""
混合图像分类器 - 结合传统特征分析和AI模型
"""
import os
import logging
import numpy as np
from PIL import Image
import cv2
from typing import Dict, List, Tuple, Optional
from sklearn.cluster import KMeans
import colorsys

logger = logging.getLogger(__name__)

class HybridImageClassifier:
    """混合图像分类器 - 结合多种方法"""
    
    def __init__(self):
        self.theme_mapping = {
            0: "人像",
            1: "动物与植物", 
            2: "城市与建筑",
            3: "自然风光"
        }
        
        self.subcategory_mapping = {
            "人像": ["肖像", "群体照", "职业人物", "明星", "儿童", "老人", "生活场景", "活动记录"],
            "动物与植物": ["野生动物", "家养动物", "鸟类", "昆虫", "树木", "花卉", "植物特写", "动物行为"],
            "城市与建筑": ["城市风光", "街景", "地标建筑", "室内设计", "古建筑", "商务场景", "科技元素", "工业建筑"],
            "自然风光": ["山川", "海洋", "森林", "天空", "花草", "四季", "日出日落", "云彩", "湖泊", "河流"]
        }
    
    def classify_image(self, image_path: str) -> Dict:
        """混合分类方法"""
        try:
            # 加载图像
            image = Image.open(image_path).convert('RGB')
            image_array = np.array(image)
            
            # 1. 传统特征分析
            traditional_result = self._traditional_classification(image_array)
            
            # 2. 颜色分析
            color_result = self._color_based_classification(image_array)
            
            # 3. 纹理分析
            texture_result = self._texture_based_classification(image_array)
            
            # 4. 综合决策
            final_result = self._combine_classifications(
                traditional_result, color_result, texture_result
            )
            
            return final_result
            
        except Exception as e:
            logger.error(f"混合分类失败: {str(e)}")
            return self._fallback_classification()
    
    def _traditional_classification(self, image_array: np.ndarray) -> Dict:
        """传统特征分类"""
        # 转换为灰度图
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # 计算基础特征
        brightness = np.mean(gray) / 255.0
        contrast = np.std(gray) / 255.0
        
        # 边缘检测
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges) / (edges.shape[0] * edges.shape[1])
        
        # 轮廓分析
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour_count = len(contours)
        
        # 基于特征分类
        if brightness > 0.7 and contrast < 0.3:
            return {"theme": "自然与风景", "confidence": 0.8, "method": "traditional"}
        elif edge_density > 0.15 and contrast > 0.4:
            return {"theme": "城市与建筑", "confidence": 0.75, "method": "traditional"}
        elif contour_count > 10 and edge_density < 0.1:
            return {"theme": "人物", "confidence": 0.7, "method": "traditional"}
        elif brightness < 0.4 and contrast > 0.6:
            return {"theme": "艺术与抽象", "confidence": 0.7, "method": "traditional"}
        else:
            return {"theme": "自然与风景", "confidence": 0.6, "method": "traditional"}
    
    def _color_based_classification(self, image_array: np.ndarray) -> Dict:
        """基于颜色的分类"""
        # 计算主色调
        pixels = image_array.reshape(-1, 3)
        
        # 使用K-means聚类
        try:
            kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
            kmeans.fit(pixels)
            dominant_colors = kmeans.cluster_centers_
            labels = kmeans.labels_
            
            # 计算颜色比例
            color_counts = np.bincount(labels)
            color_percentages = color_counts / len(labels)
            
            # 分析颜色特征
            avg_color = np.mean(dominant_colors, axis=0)
            color_variance = np.var(dominant_colors, axis=0)
            
            # 转换为HSV进行分析
            hsv_colors = []
            for color in dominant_colors:
                h, s, v = colorsys.rgb_to_hsv(color[0]/255, color[1]/255, color[2]/255)
                hsv_colors.append([h, s, v])
            
            hsv_colors = np.array(hsv_colors)
            avg_hue = np.mean(hsv_colors[:, 0])
            avg_saturation = np.mean(hsv_colors[:, 1])
            avg_value = np.mean(hsv_colors[:, 2])
            
            # 基于颜色特征分类
            if avg_hue < 0.3 and avg_saturation > 0.5:  # 绿色系
                return {"theme": "自然与风景", "confidence": 0.8, "method": "color"}
            elif avg_hue > 0.5 and avg_hue < 0.7 and avg_saturation > 0.4:  # 蓝色系
                return {"theme": "自然与风景", "confidence": 0.75, "method": "color"}
            elif avg_value < 0.3:  # 暗色调
                return {"theme": "城市与建筑", "confidence": 0.7, "method": "color"}
            elif avg_saturation < 0.2:  # 低饱和度
                return {"theme": "艺术与抽象", "confidence": 0.6, "method": "color"}
            else:
                return {"theme": "自然与风景", "confidence": 0.6, "method": "color"}
                
        except Exception as e:
            logger.warning(f"颜色分析失败: {str(e)}")
            return {"theme": "自然与风景", "confidence": 0.5, "method": "color"}
    
    def _texture_based_classification(self, image_array: np.ndarray) -> Dict:
        """基于纹理的分类"""
        # 转换为灰度图
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # 计算纹理特征
        # 1. 局部二值模式 (LBP)
        lbp = self._calculate_lbp(gray)
        lbp_hist = np.histogram(lbp, bins=256)[0]
        lbp_entropy = -np.sum((lbp_hist / np.sum(lbp_hist)) * np.log2((lbp_hist / np.sum(lbp_hist)) + 1e-10))
        
        # 2. 梯度特征
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        gradient_mean = np.mean(gradient_magnitude)
        gradient_std = np.std(gradient_magnitude)
        
        # 3. 纹理能量
        texture_energy = np.sum(gradient_magnitude**2)
        
        # 基于纹理特征分类
        if lbp_entropy > 6 and gradient_std > 20:
            return {"theme": "自然与风景", "confidence": 0.8, "method": "texture"}
        elif gradient_std > 30 and texture_energy > 1000000:
            return {"theme": "城市与建筑", "confidence": 0.75, "method": "texture"}
        elif lbp_entropy < 4 and gradient_std < 15:
            return {"theme": "人物", "confidence": 0.7, "method": "texture"}
        elif gradient_std < 10:
            return {"theme": "艺术与抽象", "confidence": 0.6, "method": "texture"}
        else:
            return {"theme": "自然与风景", "confidence": 0.6, "method": "texture"}
    
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
    
    def _combine_classifications(self, traditional: Dict, color: Dict, texture: Dict) -> Dict:
        """综合多个分类结果"""
        # 收集所有分类结果
        results = [traditional, color, texture]
        
        # 统计每个主题的得分
        theme_scores = {}
        for result in results:
            theme = result["theme"]
            confidence = result["confidence"]
            method = result["method"]
            
            if theme not in theme_scores:
                theme_scores[theme] = {"score": 0, "count": 0, "methods": []}
            
            # 不同方法给予不同权重
            weight = 1.0
            if method == "traditional":
                weight = 1.2
            elif method == "color":
                weight = 1.0
            elif method == "texture":
                weight = 0.8
            
            theme_scores[theme]["score"] += confidence * weight
            theme_scores[theme]["count"] += 1
            theme_scores[theme]["methods"].append(method)
        
        # 选择得分最高的主题
        if theme_scores:
            best_theme = max(theme_scores, key=lambda x: theme_scores[x]["score"])
            best_data = theme_scores[best_theme]
            
            # 计算综合置信度
            avg_confidence = best_data["score"] / best_data["count"]
            final_confidence = min(avg_confidence, 0.95)
            
            # 选择子分类
            subcategories = self.subcategory_mapping.get(best_theme, [])
            subcategory = subcategories[0] if subcategories else None
            
            return {
                "theme": best_theme,
                "subcategory": subcategory,
                "confidence": final_confidence,
                "methods_used": best_data["methods"]
            }
        
        # 默认分类
        return self._fallback_classification()
    
    def _fallback_classification(self) -> Dict:
        """回退分类"""
        return {
            "theme": "自然与风景",
            "subcategory": "花草",
            "confidence": 0.6,
            "methods_used": ["fallback"]
        }

# 全局混合分类器实例
hybrid_classifier = HybridImageClassifier()

