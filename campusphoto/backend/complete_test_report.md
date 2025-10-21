# AI照片分类完整测试报告

## 📊 总体统计

- **测试图片总数**: 332532
- **正确预测数**: 266131
- **错误预测数**: 66401
- **总体准确率**: 80.0%

## 📈 各分类详细结果

| 分类 | 测试图片数 | 正确预测数 | 错误预测数 | 准确率 |
|------|------------|------------|------------|--------|
| 人像 | 75083 | 70935 | 4148 | 94.5% |
| 动物 | 16130 | 15140 | 990 | 93.9% |
| 食物和静物 | 101000 | 87250 | 13750 | 86.4% |
| 街景 | 136000 | 89532 | 46468 | 65.8% |
| 自然风光 | 4319 | 3274 | 1045 | 75.8% |

## ❌ 错误案例分析

### 人像 分类错误 (4148 个错误)

#### 被误分为 动物 (1096 个)

1. **image_page_166_num_13.jpg（素描）**
   - 置信度: 0.788
   - 检测对象: cat(0.79)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_166_num_13.jpg

2. **image_page_194_num_10.jpg（半脸）**
   - 置信度: 0.721
   - 检测对象: cat(0.72)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_194_num_10.jpg

3. **image_page_13_num_6.jpg**
   - 置信度: 0.536
   - 检测对象: horse(0.54)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_13_num_6.jpg

4. **image_page_37_num_8.jpg（图片混淆，动物）**
   - 置信度: 0.907
   - 检测对象: sheep(0.91)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_37_num_8.jpg

5. **image_page_49_num_12.jpg（半脸）**
   - 置信度: 0.573
   - 检测对象: cat(0.57)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_49_num_12.jpg

6. **image_page_199_num_5.jpg**
   - 置信度: 0.354
   - 检测对象: dog(0.35)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_199_num_5.jpg

7. **image_page_98_num_16.jpg**
   - 置信度: 0.640
   - 检测对象: dog(0.64), dog(0.37)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_98_num_16.jpg

8. **image_page_37_num_10.jpg（图片混淆，动物）**
   - 置信度: 0.941
   - 检测对象: giraffe(0.94), giraffe(0.55), sheep(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_37_num_10.jpg

9. **image_page_78_num_22.jpg（逆光）**
   - 置信度: 0.272
   - 检测对象: horse(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_78_num_22.jpg

10. **image_page_96_num_20.jpg**
   - 置信度: 0.416
   - 检测对象: cat(0.42), donut(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_96_num_20.jpg

... 还有 1086 个类似错误

#### 被误分为 食物和静物 (1094 个)

1. **image_page_185_num_12.jpg**
   - 置信度: 0.286
   - 检测对象: bed(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_185_num_12.jpg

2. **image_page_188_num_11.jpg**
   - 置信度: 0.520
   - 检测对象: vase(0.52)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_188_num_11.jpg

3. **image_page_168_num_7.jpg**
   - 置信度: 0.475
   - 检测对象: carrot(0.47), carrot(0.27), carrot(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_168_num_7.jpg

4. **image_page_171_num_25.jpg**
   - 置信度: 0.935
   - 检测对象: vase(0.94), vase(0.87), vase(0.86), vase(0.81), potted plant(0.64), potted plant(0.39), potted plant(0.39)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_171_num_25.jpg

5. **image_page_177_num_0.jpg**
   - 置信度: 0.404
   - 检测对象: cake(0.40)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_177_num_0.jpg

6. **image_page_151_num_15.jpg**
   - 置信度: 0.820
   - 检测对象: clock(0.82), clock(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_151_num_15.jpg

7. **image_page_37_num_14.jpg**
   - 置信度: 0.315
   - 检测对象: chair(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_37_num_14.jpg

8. **image_page_186_num_26.jpg**
   - 置信度: 0.487
   - 检测对象: vase(0.49), vase(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_186_num_26.jpg

9. **image_page_12_num_24.jpg**
   - 置信度: 0.357
   - 检测对象: teddy bear(0.36), chair(0.33), teddy bear(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_12_num_24.jpg

10. **image_page_174_num_19.jpg**
   - 置信度: 0.434
   - 检测对象: donut(0.43)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_174_num_19.jpg

... 还有 1084 个类似错误

#### 被误分为 自然风光 (1843 个)

1. **image_page_100_num_1.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_100_num_1.jpg

2. **image_page_129_num_19.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_129_num_19.jpg

3. **image_page_152_num_21.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_152_num_21.jpg

4. **image_page_191_num_29.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_191_num_29.jpg

5. **image_page_64_num_25.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_64_num_25.jpg

6. **image_page_171_num_5.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_171_num_5.jpg

7. **image_page_53_num_18.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_53_num_18.jpg

8. **image_page_106_num_7.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_106_num_7.jpg

9. **image_page_192_num_1.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_192_num_1.jpg

10. **image_page_165_num_6.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_165_num_6.jpg

... 还有 1833 个类似错误

#### 被误分为 街景 (115 个)

1. **image_page_42_num_26.jpg**
   - 置信度: 0.439
   - 检测对象: train(0.44)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_42_num_26.jpg

2. **image_page_180_num_10.jpg**
   - 置信度: 0.678
   - 检测对象: bench(0.68), fire hydrant(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_180_num_10.jpg

3. **image_page_145_num_11.jpg**
   - 置信度: 0.264
   - 检测对象: fire hydrant(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_145_num_11.jpg

4. **image_page_169_num_0.jpg**
   - 置信度: 0.297
   - 检测对象: traffic light(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_169_num_0.jpg

5. **image_page_196_num_15.jpg**
   - 置信度: 0.266
   - 检测对象: bench(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_196_num_15.jpg

6. **image_page_161_num_2.jpg**
   - 置信度: 0.308
   - 检测对象: fire hydrant(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_161_num_2.jpg

7. **image_page_139_num_22.jpg**
   - 置信度: 0.258
   - 检测对象: traffic light(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_139_num_22.jpg

8. **image_page_184_num_4.jpg**
   - 置信度: 0.400
   - 检测对象: fire hydrant(0.40)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_184_num_4.jpg

9. **image_page_197_num_14.jpg**
   - 置信度: 0.840
   - 检测对象: fire hydrant(0.84)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_197_num_14.jpg

10. **image_page_174_num_5.jpg**
   - 置信度: 0.555
   - 检测对象: car(0.55)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/人像测试/caucasianfaces-images/images1/image_page_174_num_5.jpg

... 还有 105 个类似错误

### 动物 分类错误 (990 个错误)

#### 被误分为 自然风光 (730 个)

1. **pixabay_cat_002336.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_002336.jpg

2. **pixabay_cat_003983.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_003983.jpg

3. **flickr_cat_000340.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000340.jpg

4. **pixabay_cat_002308.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_002308.jpg

5. **pixabay_cat_000480.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_000480.jpg

6. **pixabay_cat_004769.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_004769.jpg

7. **pixabay_cat_001162.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_001162.jpg

8. **pixabay_cat_000652.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_000652.jpg

9. **pixabay_cat_002737.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_002737.jpg

10. **pixabay_cat_002656.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_002656.jpg

... 还有 720 个类似错误

#### 被误分为 人像 (214 个)

1. **flickr_cat_000397.jpg**
   - 置信度: 0.348
   - 检测对象: person(0.35)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000397.jpg

2. **pixabay_cat_000481.jpg**
   - 置信度: 0.626
   - 检测对象: person(0.63)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_000481.jpg

3. **pixabay_cat_001953.jpg**
   - 置信度: 0.269
   - 检测对象: cat(0.71), person(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_001953.jpg

4. **flickr_cat_000790.jpg**
   - 置信度: 0.474
   - 检测对象: person(0.47)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000790.jpg

5. **flickr_cat_000343.jpg**
   - 置信度: 0.250
   - 检测对象: cat(0.48), person(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000343.jpg

6. **pixabay_cat_004621.jpg**
   - 置信度: 0.257
   - 检测对象: cat(0.54), person(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_004621.jpg

7. **flickr_cat_000227.jpg**
   - 置信度: 0.398
   - 检测对象: person(0.40)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000227.jpg

8. **pixabay_cat_003991.jpg**
   - 置信度: 0.296
   - 检测对象: cat(0.39), person(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_003991.jpg

9. **pixabay_cat_001957.jpg**
   - 置信度: 0.286
   - 检测对象: cat(0.60), person(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_001957.jpg

10. **pixabay_cat_003549.jpg**
   - 置信度: 0.294
   - 检测对象: cat(0.39), clock(0.37), cat(0.32), person(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_003549.jpg

... 还有 204 个类似错误

#### 被误分为 食物和静物 (43 个)

1. **flickr_cat_000032.jpg**
   - 置信度: 0.300
   - 检测对象: teddy bear(0.30), teddy bear(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000032.jpg

2. **pixabay_cat_001203.jpg**
   - 置信度: 0.604
   - 检测对象: teddy bear(0.60)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_001203.jpg

3. **pixabay_cat_001270.jpg**
   - 置信度: 0.262
   - 检测对象: teddy bear(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_001270.jpg

4. **pixabay_cat_003507.jpg**
   - 置信度: 0.767
   - 检测对象: teddy bear(0.77)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_003507.jpg

5. **pixabay_cat_000972.jpg**
   - 置信度: 0.535
   - 检测对象: teddy bear(0.54), donut(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_000972.jpg

6. **pixabay_cat_000030.jpg**
   - 置信度: 0.647
   - 检测对象: teddy bear(0.65)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_000030.jpg

7. **pixabay_cat_002967.jpg**
   - 置信度: 0.679
   - 检测对象: apple(0.68)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_002967.jpg

8. **pixabay_cat_001473.jpg**
   - 置信度: 0.513
   - 检测对象: clock(0.51)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_001473.jpg

9. **pixabay_cat_000209.jpg**
   - 置信度: 0.297
   - 检测对象: teddy bear(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/pixabay_cat_000209.jpg

10. **flickr_cat_000045.jpg**
   - 置信度: 0.367
   - 检测对象: donut(0.37)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/cat/flickr_cat_000045.jpg

... 还有 33 个类似错误

#### 被误分为 街景 (3 个)

1. **flickr_dog_000789.jpg**
   - 置信度: 0.396
   - 检测对象: fire hydrant(0.40)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/dog/flickr_dog_000789.jpg

2. **flickr_dog_000792.jpg**
   - 置信度: 0.560
   - 检测对象: boat(0.56), boat(0.48)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/dog/flickr_dog_000792.jpg

3. **flickr_wild_003818.jpg**
   - 置信度: 0.296
   - 检测对象: boat(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/动物测试/train/wild/flickr_wild_003818.jpg

### 食物和静物 分类错误 (13750 个错误)

#### 被误分为 自然风光 (7292 个)

1. **1244707.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/1244707.jpg

2. **3258796.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/3258796.jpg

3. **815094.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/815094.jpg

4. **591251.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/591251.jpg

5. **2764204.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/2764204.jpg

6. **14344.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/14344.jpg

7. **651184.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/651184.jpg

8. **2619365.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/2619365.jpg

9. **1716712.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/1716712.jpg

10. **1124869.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/1124869.jpg

... 还有 7282 个类似错误

#### 被误分为 人像 (6177 个)

1. **2411232.jpg**
   - 置信度: 0.708
   - 检测对象: cup(0.85), dining table(0.81), wine glass(0.80), knife(0.76), cup(0.72), person(0.71), cup(0.70), sandwich(0.69), cup(0.62), cup(0.55), chair(0.52), wine glass(0.51), sandwich(0.42), cup(0.38), sandwich(0.38), fork(0.36), person(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/2411232.jpg

2. **403493.jpg**
   - 置信度: 0.400
   - 检测对象: fork(0.89), sandwich(0.67), dining table(0.45), person(0.40), bowl(0.40), orange(0.36), vase(0.29), cup(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/403493.jpg

3. **196292.jpg**
   - 置信度: 0.846
   - 检测对象: wine glass(0.95), wine glass(0.91), person(0.85), dining table(0.80), fork(0.78), wine glass(0.77), fork(0.72), bowl(0.57), wine glass(0.54), bottle(0.46), knife(0.37), wine glass(0.34), cup(0.32), cup(0.30), chair(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/196292.jpg

4. **477517.jpg**
   - 置信度: 0.474
   - 检测对象: cup(0.90), cake(0.64), cake(0.59), cup(0.54), person(0.47), sandwich(0.42), cake(0.37), cake(0.34), dining table(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/477517.jpg

5. **45478.jpg**
   - 置信度: 0.501
   - 检测对象: bowl(0.64), person(0.50), person(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/45478.jpg

6. **3736321.jpg**
   - 置信度: 0.378
   - 检测对象: wine glass(0.94), wine glass(0.92), wine glass(0.82), dining table(0.72), wine glass(0.65), person(0.38)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/3736321.jpg

7. **1051565.jpg**
   - 置信度: 0.727
   - 检测对象: wine glass(0.90), bowl(0.84), wine glass(0.79), person(0.73), dining table(0.56), cup(0.35), spoon(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/1051565.jpg

8. **3237430.jpg**
   - 置信度: 0.833
   - 检测对象: person(0.83), knife(0.62), bowl(0.48), dining table(0.46)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/3237430.jpg

9. **2896713.jpg**
   - 置信度: 0.718
   - 检测对象: person(0.72), bowl(0.46), donut(0.44), sandwich(0.35)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/2896713.jpg

10. **1051567.jpg**
   - 置信度: 0.705
   - 检测对象: wine glass(0.85), bowl(0.81), spoon(0.78), person(0.70), dining table(0.54), wine glass(0.40), wine glass(0.40)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/1051567.jpg

... 还有 6167 个类似错误

#### 被误分为 动物 (257 个)

1. **549971.jpg**
   - 置信度: 0.400
   - 检测对象: dining table(0.63), bowl(0.59), spoon(0.48), pizza(0.45), cat(0.40), spoon(0.33), cat(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/foie_gras/549971.jpg

2. **2410413.jpg**
   - 置信度: 0.273
   - 检测对象: cat(0.27), cake(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/club_sandwich/2410413.jpg

3. **3310632.jpg**
   - 置信度: 0.323
   - 检测对象: cup(0.87), sandwich(0.69), sandwich(0.33), sheep(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/club_sandwich/3310632.jpg

4. **2395818.jpg**
   - 置信度: 0.515
   - 检测对象: dog(0.51), teddy bear(0.43), dog(0.40), bear(0.36)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/cup_cakes/2395818.jpg

5. **1463304.jpg**
   - 置信度: 0.341
   - 检测对象: cake(0.68), bird(0.34)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/cup_cakes/1463304.jpg

6. **276904.jpg**
   - 置信度: 0.330
   - 检测对象: cat(0.33)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/garlic_bread/276904.jpg

7. **3023328.jpg**
   - 置信度: 0.277
   - 检测对象: bird(0.28)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/gnocchi/3023328.jpg

8. **2120757.jpg**
   - 置信度: 0.337
   - 检测对象: dog(0.34)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/2120757.jpg

9. **2689765.jpg**
   - 置信度: 0.264
   - 检测对象: donut(0.69), cat(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/2689765.jpg

10. **767801.jpg**
   - 置信度: 0.309
   - 检测对象: cat(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/767801.jpg

... 还有 247 个类似错误

#### 被误分为 街景 (24 个)

1. **3059518.jpg**
   - 置信度: 0.620
   - 检测对象: bicycle(0.62)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/garlic_bread/3059518.jpg

2. **1069788.jpg**
   - 置信度: 0.337
   - 检测对象: truck(0.34), bus(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/1069788.jpg

3. **583540.jpg**
   - 置信度: 0.293
   - 检测对象: bench(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/583540.jpg

4. **3844709.jpg**
   - 置信度: 0.755
   - 检测对象: boat(0.75), boat(0.64), boat(0.43), boat(0.38), boat(0.36), boat(0.35), boat(0.27), boat(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/3844709.jpg

5. **1574431.jpg**
   - 置信度: 0.821
   - 检测对象: car(0.82), car(0.78), car(0.73), car(0.69), car(0.33), car(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/1574431.jpg

6. **2064526.jpg**
   - 置信度: 0.316
   - 检测对象: fire hydrant(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/ice_cream/2064526.jpg

7. **1047420.jpg**
   - 置信度: 0.591
   - 检测对象: boat(0.59), boat(0.56), boat(0.48), boat(0.45), boat(0.34)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/shrimp_and_grits/1047420.jpg

8. **2358942.jpg**
   - 置信度: 0.267
   - 检测对象: fire hydrant(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/red_velvet_cake/2358942.jpg

9. **3447996.jpg**
   - 置信度: 0.779
   - 检测对象: car(0.78), car(0.74), car(0.70), car(0.38), car(0.28), car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/churros/3447996.jpg

10. **1470951.jpg**
   - 置信度: 0.867
   - 检测对象: car(0.87), car(0.60), car(0.58)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/食物与静物测试/images/breakfast_burrito/1470951.jpg

... 还有 14 个类似错误

### 街景 分类错误 (46468 个错误)

#### 被误分为 人像 (27567 个)

1. **ec22a2b8-c0a9cf70.jpg**
   - 置信度: 0.832
   - 检测对象: car(0.87), person(0.83), car(0.67), car(0.59), person(0.54), car(0.40), car(0.39), traffic light(0.37)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/ec22a2b8-c0a9cf70.jpg

2. **da4124ce-bd20b6cc.jpg**
   - 置信度: 0.296
   - 检测对象: car(0.70), bus(0.67), person(0.30), person(0.25), car(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/da4124ce-bd20b6cc.jpg

3. **da489e07-6900546f.jpg**
   - 置信度: 0.683
   - 检测对象: car(0.92), car(0.89), car(0.82), person(0.68), car(0.54), person(0.34), person(0.32), car(0.30), traffic light(0.30), person(0.28), person(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/da489e07-6900546f.jpg

4. **e520b7f3-7983ffcd.jpg**
   - 置信度: 0.427
   - 检测对象: traffic light(0.59), bus(0.56), car(0.52), person(0.43), car(0.42), car(0.41), traffic light(0.30), truck(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/e520b7f3-7983ffcd.jpg

5. **f4566c1f-c00a52fd.jpg**
   - 置信度: 0.561
   - 检测对象: car(0.82), person(0.56), car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/f4566c1f-c00a52fd.jpg

6. **eded941c-2bf30938.jpg**
   - 置信度: 0.878
   - 检测对象: person(0.88), truck(0.43)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/eded941c-2bf30938.jpg

7. **fca90061-34f503c3.jpg**
   - 置信度: 0.451
   - 检测对象: car(0.81), car(0.73), truck(0.69), car(0.63), bus(0.48), person(0.45), truck(0.38), car(0.38), car(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/fca90061-34f503c3.jpg

8. **e0f7f853-794fab91.jpg**
   - 置信度: 0.321
   - 检测对象: person(0.32), car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/e0f7f853-794fab91.jpg

9. **eef00887-4dfd186a.jpg**
   - 置信度: 0.351
   - 检测对象: car(0.88), car(0.74), car(0.58), car(0.38), person(0.35), car(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/eef00887-4dfd186a.jpg

10. **f372f558-bb364c48.jpg**
   - 置信度: 0.674
   - 检测对象: car(0.81), car(0.69), person(0.67), car(0.43), car(0.36), car(0.35), car(0.32), person(0.29), person(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/f372f558-bb364c48.jpg

... 还有 27557 个类似错误

#### 被误分为 自然风光 (14054 个)

1. **d32079ee-98db9786.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/d32079ee-98db9786.jpg

2. **d8af95c2-cd266036.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/d8af95c2-cd266036.jpg

3. **f8961219-921fcb83.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/f8961219-921fcb83.jpg

4. **f975d5ae-96a32311.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/test/f975d5ae-96a32311.jpg

5. **34639fbe-63f05cbb.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/34639fbe-63f05cbb.jpg

6. **3927fe20-9d5dec3a.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/3927fe20-9d5dec3a.jpg

7. **9801e81f-304dc29f.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/9801e81f-304dc29f.jpg

8. **0675f404-5d0dcb6e.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/0675f404-5d0dcb6e.jpg

9. **23ee48e1-71fa6571.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/23ee48e1-71fa6571.jpg

10. **63cccae4-2f0b4ca3.jpg**
   - 置信度: 0.500
   - 检测对象: 无检测对象
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/63cccae4-2f0b4ca3.jpg

... 还有 14044 个类似错误

#### 被误分为 食物和静物 (4271 个)

1. **4b9930a7-95c5f50e.jpg**
   - 置信度: 0.405
   - 检测对象: car(0.92), car(0.49), car(0.47), car(0.44), tv(0.40), car(0.37)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/4b9930a7-95c5f50e.jpg

2. **71ee4d90-039440f5.jpg**
   - 置信度: 0.561
   - 检测对象: tv(0.56)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/71ee4d90-039440f5.jpg

3. **01460ec4-ae03e419.jpg**
   - 置信度: 0.422
   - 检测对象: tv(0.42), laptop(0.28)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/01460ec4-ae03e419.jpg

4. **07e49e2a-08324f2c.jpg**
   - 置信度: 0.445
   - 检测对象: tv(0.45), tv(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/07e49e2a-08324f2c.jpg

5. **01460ec4-a1d65b66.jpg**
   - 置信度: 0.781
   - 检测对象: laptop(0.78), truck(0.71), car(0.37), car(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/01460ec4-a1d65b66.jpg

6. **6cdbf4d8-07a39bb8.jpg**
   - 置信度: 0.563
   - 检测对象: tv(0.56), car(0.42), traffic light(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/6cdbf4d8-07a39bb8.jpg

7. **a6e76c3b-d195e9d8.jpg**
   - 置信度: 0.481
   - 检测对象: car(0.71), car(0.55), umbrella(0.48), car(0.41), car(0.34), car(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/a6e76c3b-d195e9d8.jpg

8. **28d6efaa-b54d565f.jpg**
   - 置信度: 0.606
   - 检测对象: tv(0.61), traffic light(0.27), traffic light(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/28d6efaa-b54d565f.jpg

9. **70d7bfdd-9300b893.jpg**
   - 置信度: 0.291
   - 检测对象: car(0.71), bicycle(0.44), car(0.33), tv(0.29), car(0.28)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/70d7bfdd-9300b893.jpg

10. **a9500e18-cf79b8be.jpg**
   - 置信度: 0.301
   - 检测对象: car(0.62), traffic light(0.49), traffic light(0.49), car(0.45), car(0.41), car(0.38), tv(0.30), car(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/train/a9500e18-cf79b8be.jpg

... 还有 4261 个类似错误

#### 被误分为 动物 (576 个)

1. **c146d100-cb76d05b.jpg**
   - 置信度: 0.548
   - 检测对象: cow(0.55), cow(0.31), car(0.30), car(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/c146d100-cb76d05b.jpg

2. **bb269a85-bd43ab11.jpg**
   - 置信度: 0.296
   - 检测对象: truck(0.45), dog(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/bb269a85-bd43ab11.jpg

3. **be986afd-012d020c.jpg**
   - 置信度: 0.376
   - 检测对象: car(0.72), car(0.54), sheep(0.38), car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/be986afd-012d020c.jpg

4. **c21f174e-57fbb4a3.jpg**
   - 置信度: 0.406
   - 检测对象: horse(0.41), car(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/c21f174e-57fbb4a3.jpg

5. **b6ff1331-f6d3fba8.jpg**
   - 置信度: 0.734
   - 检测对象: car(0.87), car(0.83), car(0.80), bird(0.73), car(0.70), truck(0.69), car(0.66), car(0.54), car(0.51), car(0.45), car(0.40), car(0.28), car(0.28), car(0.27), car(0.27), car(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/b6ff1331-f6d3fba8.jpg

6. **c4933980-04482b56.jpg**
   - 置信度: 0.310
   - 检测对象: car(0.61), car(0.57), horse(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/c4933980-04482b56.jpg

7. **b9cd5de4-5614ed70.jpg**
   - 置信度: 0.541
   - 检测对象: car(0.89), car(0.87), car(0.82), car(0.70), car(0.68), bird(0.54), bird(0.41)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/b9cd5de4-5614ed70.jpg

8. **c88fa35f-e6582069.jpg**
   - 置信度: 0.274
   - 检测对象: car(0.86), car(0.65), car(0.61), car(0.60), car(0.58), car(0.54), elephant(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/c88fa35f-e6582069.jpg

9. **c417a291-6a4ed4c9.jpg**
   - 置信度: 0.518
   - 检测对象: car(0.86), car(0.82), car(0.77), car(0.75), car(0.65), car(0.64), car(0.63), car(0.53), bird(0.52), car(0.50), car(0.48), car(0.48), car(0.37), car(0.30), car(0.29), car(0.29), car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/c417a291-6a4ed4c9.jpg

10. **b251064f-5f6b663e.jpg**
   - 置信度: 0.468
   - 检测对象: car(0.66), truck(0.52), car(0.47), bird(0.47), car(0.42), car(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/街景测试/bdd100k/bdd100k/images/100k/val/b251064f-5f6b663e.jpg

... 还有 566 个类似错误

### 自然风光 分类错误 (1045 个错误)

#### 被误分为 街景 (292 个)

1. **00000234_(2).jpg**
   - 置信度: 0.453
   - 检测对象: boat(0.45)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000234_(2).jpg

2. **00000633_(3).jpg**
   - 置信度: 0.434
   - 检测对象: airplane(0.43), airplane(0.43), airplane(0.39)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000633_(3).jpg

3. **00000578_(4).jpg**
   - 置信度: 0.752
   - 检测对象: car(0.75), car(0.73), car(0.54), car(0.53), car(0.43)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000578_(4).jpg

4. **00000897_(3).jpg**
   - 置信度: 0.255
   - 检测对象: car(0.25)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000897_(3).jpg

5. **00000080_(4).jpg**
   - 置信度: 0.260
   - 检测对象: airplane(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000080_(4).jpg

6. **00000141_(4).jpg**
   - 置信度: 0.272
   - 检测对象: boat(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000141_(4).jpg

7. **00000029_(4).jpg**
   - 置信度: 0.867
   - 检测对象: car(0.87)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000029_(4).jpg

8. **00000462_(4).jpg**
   - 置信度: 0.561
   - 检测对象: boat(0.56), boat(0.48)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000462_(4).jpg

9. **00000065_(5).jpg**
   - 置信度: 0.263
   - 检测对象: car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000065_(5).jpg

10. **00000739_(3).jpg**
   - 置信度: 0.306
   - 检测对象: train(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000739_(3).jpg

... 还有 282 个类似错误

#### 被误分为 人像 (401 个)

1. **00000623_(3).jpg**
   - 置信度: 0.939
   - 检测对象: person(0.94)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000623_(3).jpg

2. **00000224_(2).jpg**
   - 置信度: 0.298
   - 检测对象: kite(0.79), person(0.30), person(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000224_(2).jpg

3. **00000255_(4).jpg**
   - 置信度: 0.550
   - 检测对象: person(0.55), boat(0.47), boat(0.45), person(0.44), person(0.38)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000255_(4).jpg

4. **00000123_(4).jpg**
   - 置信度: 0.810
   - 检测对象: person(0.81), surfboard(0.53), person(0.41), surfboard(0.31), person(0.30), surfboard(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000123_(4).jpg

5. **00000158.jpg**
   - 置信度: 0.553
   - 检测对象: person(0.55), person(0.55)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000158.jpg

6. **00000083_(2).jpg**
   - 置信度: 0.481
   - 检测对象: person(0.48)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000083_(2).jpg

7. **00000762.jpg**
   - 置信度: 0.612
   - 检测对象: kite(0.77), kite(0.75), person(0.61), kite(0.56), kite(0.52), kite(0.49), kite(0.45), kite(0.43), kite(0.43), kite(0.37), kite(0.31)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000762.jpg

8. **00000090_(4).jpg**
   - 置信度: 0.862
   - 检测对象: person(0.86), person(0.85), boat(0.84), person(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000090_(4).jpg

9. **00000058_(2).jpg**
   - 置信度: 0.830
   - 检测对象: person(0.83)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000058_(2).jpg

10. **00000237_(4).jpg**
   - 置信度: 0.577
   - 检测对象: person(0.58), person(0.37), person(0.35), umbrella(0.33), person(0.29), chair(0.28)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000237_(4).jpg

... 还有 391 个类似错误

#### 被误分为 食物和静物 (96 个)

1. **00000094_(6).jpg**
   - 置信度: 0.265
   - 检测对象: broccoli(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000094_(6).jpg

2. **00000219_(5).jpg**
   - 置信度: 0.265
   - 检测对象: kite(0.26), car(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000219_(5).jpg

3. **00000789.jpg**
   - 置信度: 0.339
   - 检测对象: cake(0.34)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000789.jpg

4. **00000537_(3).jpg**
   - 置信度: 0.616
   - 检测对象: kite(0.62)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000537_(3).jpg

5. **00000374_(6).jpg**
   - 置信度: 0.377
   - 检测对象: teddy bear(0.38)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000374_(6).jpg

6. **00000526_(2).jpg**
   - 置信度: 0.685
   - 检测对象: chair(0.69), chair(0.68), bench(0.48)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000526_(2).jpg

7. **00000175_(3).jpg**
   - 置信度: 0.331
   - 检测对象: kite(0.33), boat(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000175_(3).jpg

8. **00000177_(4).jpg**
   - 置信度: 0.644
   - 检测对象: chair(0.64), umbrella(0.61), chair(0.48), umbrella(0.37), chair(0.33)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000177_(4).jpg

9. **00000069_(6).jpg**
   - 置信度: 0.643
   - 检测对象: broccoli(0.64)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000069_(6).jpg

10. **00000277_(6).jpg**
   - 置信度: 0.300
   - 检测对象: potted plant(0.30)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000277_(6).jpg

... 还有 86 个类似错误

#### 被误分为 动物 (256 个)

1. **00000361_(5).jpg**
   - 置信度: 0.760
   - 检测对象: giraffe(0.76), giraffe(0.33)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000361_(5).jpg

2. **00000145_(6).jpg**
   - 置信度: 0.279
   - 检测对象: giraffe(0.28)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000145_(6).jpg

3. **00000394_(4).jpg**
   - 置信度: 0.324
   - 检测对象: cow(0.32)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000394_(4).jpg

4. **00000003_(7).jpg**
   - 置信度: 0.289
   - 检测对象: clock(0.38), horse(0.29)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000003_(7).jpg

5. **00000397_(2).jpg**
   - 置信度: 0.260
   - 检测对象: bird(0.26)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000397_(2).jpg

6. **00000004.jpg**
   - 置信度: 0.869
   - 检测对象: sheep(0.87), sheep(0.83), sheep(0.74), sheep(0.55), sheep(0.37), sheep(0.34)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000004.jpg

7. **00000527_(3).jpg**
   - 置信度: 0.945
   - 检测对象: cow(0.95), cow(0.71), cow(0.48)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000527_(3).jpg

8. **00000227_(4).jpg**
   - 置信度: 0.553
   - 检测对象: bird(0.55)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000227_(4).jpg

9. **00000081_(5).jpg**
   - 置信度: 0.380
   - 检测对象: bird(0.38)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000081_(5).jpg

10. **00000213.jpg**
   - 置信度: 0.785
   - 检测对象: bird(0.79), bird(0.76), bird(0.76), bird(0.67), bird(0.66), bird(0.52), bird(0.46), bird(0.44), bird(0.41), bird(0.37), bird(0.36), bird(0.31), bird(0.29), bird(0.27)
   - 文件路径: /Users/caizhuoqi/Code/graduate-project/campusphoto/ai/exp/自然风光测试/00000213.jpg

... 还有 246 个类似错误


## 🔍 YOLO检测统计

### 错误案例中的检测对象统计

| 检测对象 | 出现次数 |
|----------|----------|
| car | 146630 |
| person | 78059 |
| traffic light | 20347 |
| truck | 11097 |
| bus | 5316 |
| dining table | 4246 |
| bowl | 4036 |
| cup | 3459 |
| chair | 3443 |
| umbrella | 2703 |
| sandwich | 1851 |
| bicycle | 1770 |
| pizza | 1327 |
| cake | 1277 |
| bottle | 1104 |
| donut | 1081 |
| motorcycle | 1020 |
| bird | 973 |
| bed | 968 |
| spoon | 876 |
| fork | 863 |
| knife | 768 |
| wine glass | 739 |
| fire hydrant | 643 |
| dog | 599 |
| potted plant | 570 |
| cow | 557 |
| carrot | 513 |
| stop sign | 509 |
| broccoli | 498 |
| vase | 492 |
| handbag | 491 |
| cat | 455 |
| hot dog | 438 |
| tv | 434 |
| boat | 427 |
| train | 422 |
| clock | 309 |
| teddy bear | 303 |
| sheep | 300 |
| banana | 267 |
| backpack | 267 |
| bench | 265 |
| kite | 252 |
| orange | 238 |
| suitcase | 185 |
| horse | 178 |
| cell phone | 127 |
| sports ball | 127 |
| giraffe | 119 |
| bear | 108 |
| airplane | 97 |
| apple | 95 |
| elephant | 93 |
| skateboard | 90 |
| parking meter | 70 |
| book | 65 |
| surfboard | 63 |
| laptop | 62 |
| frisbee | 56 |
| tie | 53 |
| oven | 38 |
| zebra | 32 |
| keyboard | 25 |
| toilet | 23 |
| scissors | 21 |
| refrigerator | 19 |
| sink | 16 |
| couch | 16 |
| mouse | 15 |
| microwave | 12 |
| remote | 10 |
| toothbrush | 8 |
| tennis racket | 8 |
| baseball bat | 8 |
| snowboard | 5 |
| skis | 3 |
| baseball glove | 1 |
| toaster | 1 |
