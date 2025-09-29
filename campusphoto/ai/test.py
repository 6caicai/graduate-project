# 引入opencv
import cv2

# 引入YOLO模型
from ultralytics import YOLO

# 打开图像
img_path = "./test6.jpg"

# 打开图像
img = cv2.imread(filename=img_path)

# 加载模型
model = YOLO(model="yolov8n.pt")

# 正向推理
res = model(img)

# 绘制推理结果
annotated_img = res[0].plot()

# 显示图像
cv2.imshow(winname="YOLOV8", mat=annotated_img)

# 等待时间
cv2.waitKey(delay=10000)

# 绘制推理结果
cv2.imwrite(filename="jieguo.jpeg", img=annotated_img)