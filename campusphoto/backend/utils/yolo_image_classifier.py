"""
基于YOLOv8的图像识别分类器
"""
import os
import logging
import numpy as np
from PIL import Image
import cv2
from typing import Dict, List, Tuple, Optional
import tempfile
import shutil

logger = logging.getLogger(__name__)

class YOLOImageClassifier:
    """基于YOLOv8的图像识别分类器"""
    
    def __init__(self):
        # YOLO模型路径
        self.model_path = "/Users/caizhuoqi/Code/graduate-project/campusphoto/ai/yolov8n.pt"
        
        # COCO数据集类别映射到我们的分类体系
        self.coco_to_our_categories = {
            # 人像相关
            "person": "人像",
            "bicycle": "人像",  # 骑行场景
            "motorcycle": "人像",  # 骑行场景
            "car": "人像",  # 车内场景
            "bus": "人像",  # 车内场景
            "truck": "人像",  # 车内场景
            "boat": "人像",  # 船上场景
            "train": "人像",  # 车内场景
            
            # 动物与植物相关
            "bird": "动物与植物",
            "cat": "动物与植物",
            "dog": "动物与植物",
            "horse": "动物与植物",
            "sheep": "动物与植物",
            "cow": "动物与植物",
            "elephant": "动物与植物",
            "bear": "动物与植物",
            "zebra": "动物与植物",
            "giraffe": "动物与植物",
            "potted plant": "动物与植物",
            
            # 城市与建筑相关
            "building": "城市与建筑",
            "house": "城市与建筑",
            "bridge": "城市与建筑",
            "traffic light": "城市与建筑",
            "fire hydrant": "城市与建筑",
            "stop sign": "城市与建筑",
            "parking meter": "城市与建筑",
            "bench": "城市与建筑",
            "fence": "城市与建筑",
            "skateboard": "城市与建筑",
            "sports ball": "城市与建筑",
            "kite": "城市与建筑",
            "baseball bat": "城市与建筑",
            "baseball glove": "城市与建筑",
            "tennis racket": "城市与建筑",
            "bottle": "城市与建筑",
            "wine glass": "城市与建筑",
            "cup": "城市与建筑",
            "fork": "城市与建筑",
            "knife": "城市与建筑",
            "spoon": "城市与建筑",
            "bowl": "城市与建筑",
            "banana": "城市与建筑",
            "apple": "城市与建筑",
            "sandwich": "城市与建筑",
            "orange": "城市与建筑",
            "broccoli": "城市与建筑",
            "carrot": "城市与建筑",
            "hot dog": "城市与建筑",
            "pizza": "城市与建筑",
            "donut": "城市与建筑",
            "cake": "城市与建筑",
            "chair": "城市与建筑",
            "couch": "城市与建筑",
            "bed": "城市与建筑",
            "dining table": "城市与建筑",
            "toilet": "城市与建筑",
            "tv": "城市与建筑",
            "laptop": "城市与建筑",
            "mouse": "城市与建筑",
            "remote": "城市与建筑",
            "keyboard": "城市与建筑",
            "cell phone": "城市与建筑",
            "microwave": "城市与建筑",
            "oven": "城市与建筑",
            "toaster": "城市与建筑",
            "sink": "城市与建筑",
            "refrigerator": "城市与建筑",
            "book": "城市与建筑",
            "clock": "城市与建筑",
            "vase": "城市与建筑",
            "scissors": "城市与建筑",
            "teddy bear": "城市与建筑",
            "hair drier": "城市与建筑",
            "toothbrush": "城市与建筑",
            
            # 自然风光相关
            "airplane": "自然风光",  # 天空
            "umbrella": "自然风光",  # 户外
            "backpack": "自然风光",  # 户外
            "handbag": "自然风光",  # 户外
            "tie": "自然风光",  # 户外
            "suitcase": "自然风光",  # 户外
            "frisbee": "自然风光",  # 户外
            "skis": "自然风光",  # 户外
            "snowboard": "自然风光",  # 户外
            "surfboard": "自然风光",  # 户外
            "tennis racket": "自然风光",  # 户外
            "wine glass": "自然风光",  # 户外
        }
        
        # 子分类映射
        self.subcategory_mapping = {
            "人像": ["肖像", "群体照", "职业人物", "明星", "儿童", "老人", "生活场景", "活动记录"],
            "动物与植物": ["野生动物", "家养动物", "鸟类", "昆虫", "树木", "花卉", "植物特写", "动物行为"],
            "城市与建筑": ["城市风光", "街景", "地标建筑", "室内设计", "古建筑", "商务场景", "科技元素", "工业建筑"],
            "自然风光": ["山川", "海洋", "森林", "天空", "花草", "四季", "日出日落", "云彩", "湖泊", "河流"]
        }
        
        # 初始化YOLO模型
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """加载YOLO模型"""
        try:
            from ultralytics import YOLO
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                logger.info(f"YOLO模型加载成功: {self.model_path}")
            else:
                logger.warning(f"YOLO模型文件不存在: {self.model_path}")
                self.model = None
        except ImportError:
            logger.warning("ultralytics模块未安装，无法使用YOLO分类器")
            self.model = None
        except Exception as e:
            logger.error(f"YOLO模型加载失败: {e}")
            self.model = None
    
    def classify_image(self, image_path: str) -> Dict:
        """使用YOLO进行图像分类"""
        if not self.model:
            return self._fallback_classification()
        
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"无法读取图像: {image_path}")
                return self._fallback_classification()
            
            # YOLO推理
            results = self.model(image)
            
            # 解析结果 - 降低置信度阈值以捕获更多检测
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for i in range(len(boxes)):
                        # 获取类别ID和置信度
                        class_id = int(boxes.cls[i])
                        confidence = float(boxes.conf[i])
                        
                        # 降低置信度阈值，从0.5降到0.2
                        if confidence >= 0.2:
                            # 获取类别名称
                            class_name = result.names[class_id]
                            
                            detections.append({
                                'class_name': class_name,
                                'confidence': confidence,
                                'class_id': class_id
                            })
            
            # 根据检测结果进行分类
            classification_result = self._classify_from_detections(detections)
            
            return {
                'theme': classification_result['theme'],
                'subcategory': classification_result['subcategory'],
                'confidence': classification_result['confidence'],
                'detections': detections,
                'method': 'yolo'
            }
            
        except Exception as e:
            logger.error(f"YOLO分类失败: {e}")
            return self._fallback_classification()
    
    def _classify_from_detections(self, detections: List[Dict]) -> Dict:
        """根据检测结果进行分类"""
        if not detections:
            return self._fallback_classification()
        
        # 统计各类别的置信度
        category_scores = {
            "人像": 0.0,
            "动物与植物": 0.0,
            "城市与建筑": 0.0,
            "自然风光": 0.0
        }
        
        # 计算每个类别的加权分数
        for detection in detections:
            class_name = detection['class_name']
            confidence = detection['confidence']
            
            # 映射到我们的分类体系
            our_category = self.coco_to_our_categories.get(class_name, "城市与建筑")
            
            # 累加置信度分数
            category_scores[our_category] += confidence
        
        # 找到最高分的类别
        best_category = max(category_scores, key=category_scores.get)
        best_score = category_scores[best_category]
        
        # 计算最终置信度
        total_detections = len(detections)
        if total_detections > 0:
            final_confidence = min(best_score / total_detections, 1.0)
        else:
            final_confidence = 0.5
        
        return {
            'theme': best_category,
            'subcategory': None,  # 不返回子分类
            'confidence': final_confidence
        }
    
    def _fallback_classification(self) -> Dict:
        """回退分类"""
        return {
            'theme': '自然风光',
            'subcategory': None,  # 不返回子分类
            'confidence': 0.5,
            'detections': [],
            'method': 'fallback'
        }
    
    def create_annotated_image(self, image_path: str, output_path: str) -> bool:
        """创建带标注的图像"""
        if not self.model:
            return False
        
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                return False
            
            # YOLO推理
            results = self.model(image)
            
            # 绘制结果
            annotated_img = results[0].plot()
            
            # 保存标注图像
            cv2.imwrite(output_path, annotated_img)
            
            return True
            
        except Exception as e:
            logger.error(f"创建标注图像失败: {e}")
            return False

# 创建全局实例
yolo_classifier = YOLOImageClassifier()

