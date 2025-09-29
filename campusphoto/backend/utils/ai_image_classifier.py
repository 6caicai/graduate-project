"""
基于深度学习的智能图像分类器
"""
import os
import logging
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
import torch.nn as nn
from typing import Dict, List, Tuple, Optional
import cv2

logger = logging.getLogger(__name__)

class AIImageClassifier:
    """AI图像分类器 - 基于预训练模型"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.transform = None
        self.class_labels = {}
        self._load_model()
    
    def _load_model(self):
        """加载预训练模型"""
        try:
            # 使用ResNet50预训练模型
            self.model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
            self.model.eval()
            self.model.to(self.device)
            
            # 图像预处理
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                   std=[0.229, 0.224, 0.225])
            ])
            
            # ImageNet类别标签
            self.class_labels = self._load_imagenet_labels()
            
            logger.info("AI图像分类器加载成功")
            
        except Exception as e:
            logger.error(f"AI模型加载失败: {str(e)}")
            self.model = None
    
    def _load_imagenet_labels(self) -> Dict[int, str]:
        """加载ImageNet类别标签"""
        # 简化的ImageNet标签映射到我们的分类体系
        imagenet_to_our_categories = {
            # 自然与风景
            'landscape': ['mountain', 'hill', 'valley', 'cliff', 'coast', 'seashore', 'lakeside', 'beach'],
            'sky': ['sky', 'cloud', 'sunset', 'sunrise', 'horizon'],
            'forest': ['forest', 'woodland', 'grove', 'jungle', 'tree', 'oak', 'pine', 'maple'],
            'grass': ['grass', 'lawn', 'meadow', 'field', 'pasture'],
            'flower': ['flower', 'rose', 'tulip', 'daisy', 'sunflower', 'orchid'],
            
            # 城市与建筑
            'building': ['building', 'house', 'skyscraper', 'tower', 'church', 'palace', 'castle'],
            'street': ['street', 'road', 'highway', 'sidewalk', 'pavement'],
            'bridge': ['bridge', 'viaduct', 'overpass'],
            'car': ['car', 'automobile', 'vehicle', 'truck', 'bus', 'van'],
            
            # 人物
            'person': ['person', 'people', 'man', 'woman', 'child', 'baby', 'boy', 'girl'],
            'face': ['face', 'portrait', 'head'],
            
            # 动物
            'animal': ['animal', 'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'sheep', 'pig'],
            'wildlife': ['wildlife', 'lion', 'tiger', 'elephant', 'bear', 'wolf', 'deer'],
            
            # 食物
            'food': ['food', 'fruit', 'apple', 'banana', 'orange', 'bread', 'cake', 'pizza'],
            'drink': ['drink', 'bottle', 'cup', 'glass', 'coffee', 'tea'],
            
            # 物品
            'furniture': ['furniture', 'chair', 'table', 'bed', 'sofa', 'desk'],
            'electronic': ['electronic', 'computer', 'phone', 'television', 'camera'],
            'clothing': ['clothing', 'shirt', 'dress', 'hat', 'shoe', 'jacket'],
        }
        
        return imagenet_to_our_categories
    
    def _smart_map_to_categories(self, predictions: List[Tuple[str, float]]) -> Tuple[str, str, float]:
        """智能映射到我们的分类体系"""
        # 定义更精确的关键词映射
        category_keywords = {
            "自然与风景": {
                "keywords": [
                    "landscape", "mountain", "hill", "valley", "cliff", "coast", "seashore", 
                    "lakeside", "beach", "sky", "cloud", "sunset", "sunrise", "horizon",
                    "forest", "woodland", "grove", "jungle", "tree", "oak", "pine", "maple",
                    "grass", "lawn", "meadow", "field", "pasture", "flower", "rose", "tulip",
                    "daisy", "sunflower", "orchid", "garden", "park", "nature", "outdoor"
                ],
                "subcategories": ["山川", "海洋", "森林", "天空", "花草", "四季"],
                "weight": 1.0
            },
            "城市与建筑": {
                "keywords": [
                    "building", "house", "skyscraper", "tower", "church", "palace", "castle",
                    "street", "road", "highway", "sidewalk", "pavement", "bridge", "viaduct",
                    "overpass", "car", "automobile", "vehicle", "truck", "bus", "van",
                    "city", "urban", "downtown", "architecture", "construction"
                ],
                "subcategories": ["城市风光", "街景", "地标建筑", "室内设计", "古建筑"],
                "weight": 1.0
            },
            "人物": {
                "keywords": [
                    "person", "people", "man", "woman", "child", "baby", "boy", "girl",
                    "face", "portrait", "head", "human", "figure", "crowd", "family"
                ],
                "subcategories": ["肖像", "群体照", "职业人物", "明星", "儿童", "老人"],
                "weight": 1.2
            },
            "动物与植物": {
                "keywords": [
                    "animal", "dog", "cat", "bird", "fish", "horse", "cow", "sheep", "pig",
                    "wildlife", "lion", "tiger", "elephant", "bear", "wolf", "deer",
                    "pet", "mammal", "reptile", "insect", "butterfly", "bee", "spider"
                ],
                "subcategories": ["野生动物", "家养动物", "鸟类", "昆虫", "树木", "花卉"],
                "weight": 1.1
            },
            "日常生活与物品": {
                "keywords": [
                    "food", "fruit", "apple", "banana", "orange", "bread", "cake", "pizza",
                    "drink", "bottle", "cup", "glass", "coffee", "tea", "furniture", "chair",
                    "table", "bed", "sofa", "desk", "electronic", "computer", "phone",
                    "television", "camera", "clothing", "shirt", "dress", "hat", "shoe", "jacket",
                    "kitchen", "bathroom", "bedroom", "living_room"
                ],
                "subcategories": ["食物饮品", "交通工具", "家具", "工具", "科技产品", "衣物"],
                "weight": 1.0
            }
        }
        
        # 计算每个类别的得分
        category_scores = {}
        for category, data in category_keywords.items():
            score = 0
            matched_keywords = []
            
            for label, prob in predictions:
                label_lower = label.lower()
                for keyword in data["keywords"]:
                    if keyword in label_lower:
                        # 根据关键词匹配度和概率计算得分
                        keyword_score = prob * data["weight"]
                        score += keyword_score
                        matched_keywords.append(keyword)
            
            category_scores[category] = {
                "score": score,
                "matched_keywords": matched_keywords
            }
        
        # 选择得分最高的类别
        if category_scores and max(category_scores.values(), key=lambda x: x["score"])["score"] > 0:
            best_category = max(category_scores, key=lambda x: category_scores[x]["score"])
            best_data = category_scores[best_category]
            
            # 选择子分类
            subcategories = category_keywords[best_category]["subcategories"]
            subcategory = subcategories[0] if subcategories else None
            
            # 计算置信度
            confidence = min(best_data["score"] * 2, 0.95)
            
            return best_category, subcategory, confidence
        
        # 默认分类
        return "自然风光", "山川", 0.6
    
    def classify_image(self, image_path: str) -> Dict:
        """使用AI模型分类图像"""
        if not self.model:
            return self._fallback_classification()
        
        try:
            # 加载和预处理图像
            image = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # 模型推理
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                top5_prob, top5_indices = torch.topk(probabilities, 5)
            
            # 获取ImageNet标签
            imagenet_labels = self._get_imagenet_labels()
            
            # 分析结果并映射到我们的分类体系
            classification_result = self._analyze_classification_results(
                top5_indices.cpu().numpy(), 
                top5_prob.cpu().numpy(),
                imagenet_labels
            )
            
            return classification_result
            
        except Exception as e:
            logger.error(f"AI图像分类失败: {str(e)}")
            return self._fallback_classification()
    
    def _get_imagenet_labels(self) -> List[str]:
        """获取ImageNet标签列表"""
        # 这里应该加载完整的ImageNet标签
        # 为了简化，我们返回一些常见的标签
        return [
            'tench', 'goldfish', 'great_white_shark', 'tiger_shark', 'hammerhead',
            'electric_ray', 'stingray', 'cock', 'hen', 'ostrich', 'brambling',
            'goldfinch', 'house_finch', 'junco', 'indigo_bunting', 'robin',
            'bulbul', 'jay', 'magpie', 'chickadee', 'water_ouzel', 'kite',
            'bald_eagle', 'vulture', 'great_grey_owl', 'european_fire_salamander',
            'common_newt', 'eft', 'spotted_salamander', 'axolotl', 'bullfrog',
            'tree_frog', 'tailed_frog', 'loggerhead', 'leatherback_turtle',
            'mud_turtle', 'terrapin', 'box_turtle', 'banded_gecko',
            'common_iguana', 'american_chameleon', 'whiptail', 'agama',
            'frilled_lizard', 'alligator_lizard', 'gila_monster', 'green_lizard',
            'african_crocodile', 'american_alligator', 'triceratops', 'thunder_snake',
            'ringneck_snake', 'hognose_snake', 'green_snake', 'king_snake',
            'garter_snake', 'water_snake', 'vine_snake', 'night_snake',
            'boa_constrictor', 'rock_python', 'indian_cobra', 'green_mamba',
            'sea_snake', 'horned_viper', 'diamondback', 'sidewinder', 'trilobite',
            'harvestman', 'scorpion', 'black_and_gold_garden_spider', 'barn_spider',
            'garden_spider', 'black_widow', 'tarantula', 'wolf_spider', 'tick',
            'centipede', 'black_grouse', 'ptarmigan', 'ruffed_grouse', 'prairie_chicken',
            'peacock', 'quail', 'partridge', 'african_grey', 'macaw', 'sulphur_crested_cockatoo',
            'lorikeet', 'coucal', 'bee_eater', 'hornbill', 'jacamar', 'toucan',
            'drake', 'red_breasted_merganser', 'goose', 'black_swan', 'tusker',
            'echidna', 'platypus', 'wallaby', 'koala', 'wombat', 'jellyfish',
            'sea_anemone', 'brain_coral', 'flatworm', 'nematode', 'conch',
            'snail', 'slug', 'sea_slug', 'chiton', 'chambered_nautilus', 'Dungeness_crab',
            'rock_crab', 'fiddler_crab', 'king_crab', 'american_lobster', 'spiny_lobster',
            'crayfish', 'hermit_crab', 'isopod', 'white_stork', 'black_stork', 'spoonbill',
            'flamingo', 'little_blue_heron', 'american_egret', 'bittern', 'crane',
            'limpkin', 'european_gallinule', 'american_coot', 'bustard', 'ruddy_turnstone',
            'red_backed_sandpiper', 'redshank', 'dowitcher', 'oystercatcher', 'pelican',
            'king_penguin', 'albatross', 'grey_whale', 'killer_whale', 'dugong',
            'sea_lion', 'chihuahua', 'japanese_spaniel', 'maltese_dog', 'pekinese',
            'shih_tzu', 'blenheim_spaniel', 'papillon', 'toy_terrier', 'rhodesian_ridgeback',
            'afghan_hound', 'basset', 'beagle', 'bloodhound', 'bluetick', 'black_and_tan_coonhound',
            'walker_hound', 'treeing_walker_coonhound', 'english_foxhound', 'redbone',
            'borzoi', 'irish_wolfhound', 'italian_greyhound', 'whippet', 'ibizan_hound',
            'norwegian_elkhound', 'otterhound', 'saluki', 'scottish_deerhound', 'weimaraner',
            'staffordshire_bullterrier', 'american_staffordshire_terrier', 'bedlington_terrier',
            'border_terrier', 'kerry_blue_terrier', 'irish_terrier', 'norfolk_terrier',
            'norwich_terrier', 'yorkshire_terrier', 'wire_haired_fox_terrier', 'lakeland_terrier',
            'sealyham_terrier', 'airedale', 'cairn', 'australian_terrier', 'dandie_dinmont',
            'boston_bull', 'miniature_schnauzer', 'giant_schnauzer', 'standard_schnauzer',
            'scotch_terrier', 'tibetan_terrier', 'silky_terrier', 'soft_coated_wheaten_terrier',
            'west_highland_white_terrier', 'lhasa', 'flat_coated_retriever', 'curly_coated_retriever',
            'golden_retriever', 'labrador_retriever', 'chesapeake_bay_retriever', 'german_short_haired_pointer',
            'vizsla', 'english_setter', 'irish_setter', 'gordon_setter', 'brittany_spaniel',
            'clumber', 'english_springer', 'welsh_springer_spaniel', 'cocker_spaniel',
            'sussex_spaniel', 'irish_water_spaniel', 'kuvasz', 'schipperke', 'groenendael',
            'malinois', 'briard', 'kelpie', 'komondor', 'old_english_sheepdog', 'shetland_sheepdog',
            'collie', 'border_collie', 'bouvier_des_flandres', 'rottweiler', 'german_shepherd',
            'doberman', 'miniature_pinscher', 'greater_swiss_mountain_dog', 'bernese_mountain_dog',
            'appenzeller', 'entlebucher', 'boxer', 'bull_mastiff', 'tibetan_mastiff',
            'french_bulldog', 'great_dane', 'saint_bernard', 'eskimo_dog', 'malamute',
            'siberian_husky', 'affenpinscher', 'basenji', 'pug', 'leonberg', 'newfoundland',
            'great_pyrenees', 'samoyed', 'pomeranian', 'chow', 'keeshond', 'brabancon_griffon',
            'pembroke', 'cardigan', 'toy_poodle', 'miniature_poodle', 'standard_poodle',
            'mexican_hairless', 'timber_wolf', 'white_wolf', 'red_wolf', 'coyote', 'dingo',
            'dhole', 'african_hunting_dog', 'hyena', 'red_fox', 'kit_fox', 'arctic_fox',
            'grey_fox', 'tabby', 'tiger_cat', 'persian_cat', 'siamese_cat', 'egyptian_cat',
            'lion', 'tiger', 'jaguar', 'leopard', 'snow_leopard', 'lynx', 'bobcat',
            'clouded_leopard', 'snow_leopard', 'cheetah', 'brown_bear', 'american_black_bear',
            'ice_bear', 'sloth_bear', 'mongoose', 'meerkat', 'tiger_beetle', 'ladybug',
            'ground_beetle', 'long_horned_beetle', 'leaf_beetle', 'dung_beetle', 'rhinoceros_beetle',
            'weevil', 'fly', 'bee', 'ant', 'grasshopper', 'cricket', 'walking_stick',
            'cockroach', 'mantis', 'cicada', 'leafhopper', 'lacewing', 'dragonfly', 'monarch',
            'cabbage_butterfly', 'sulphur_butterfly', 'lycaenid', 'starfish', 'sea_urchin',
            'sea_cucumber', 'wood_rabbit', 'hare', 'angora', 'hamster', 'porcupine',
            'fox_squirrel', 'marmot', 'beaver', 'guinea_pig', 'sorrel', 'zebra',
            'hog', 'wild_boar', 'warthog', 'hippopotamus', 'ox', 'water_buffalo',
            'bison', 'ram', 'bighorn', 'ibex', 'hartebeest', 'impala', 'gazelle',
            'arabian_camel', 'llama', 'weasel', 'mink', 'polecat', 'black_footed_ferret',
            'otter', 'skunk', 'badger', 'armadillo', 'three_toed_sloth', 'orangutan',
            'gorilla', 'chimpanzee', 'gibbon', 'siamang', 'guenon', 'patas', 'baboon',
            'macaque', 'langur', 'colobus', 'proboscis_monkey', 'marmoset', 'capuchin',
            'howler_monkey', 'titi', 'spider_monkey', 'squirrel_monkey', 'madagascar_cat',
            'indri', 'indian_elephant', 'african_elephant', 'lesser_panda', 'giant_panda',
            'barracouta', 'eel', 'coho', 'rock_beauty', 'anemone_fish', 'sturgeon',
            'gar', 'lionfish', 'puffer', 'abacus', 'abaya', 'academic_gown', 'accordion',
            'acoustic_guitar', 'aircraft_carrier', 'airliner', 'airship', 'altar',
            'ambulance', 'amphibian', 'analog_clock', 'apiary', 'apron', 'ashcan',
            'assault_rifle', 'backpack', 'bakery', 'balance_beam', 'balloon', 'ballpoint',
            'band_aid', 'banjo', 'bannister', 'barbell', 'barber_chair', 'barbershop',
            'barn', 'barometer', 'barrel', 'barrow', 'baseball', 'basketball',
            'bassinet', 'bassoon', 'bathing_cap', 'bath_towel', 'bathtub', 'beach_wagon',
            'beacon', 'beaker', 'bearskin', 'beer_bottle', 'beer_glass', 'bell_cote',
            'bib', 'bicycle_built_for_two', 'bikini', 'binder', 'binoculars', 'birdhouse',
            'boathouse', 'bobsled', 'bolo_tie', 'bonnet', 'bookcase', 'bookshop',
            'bottlecap', 'bow', 'bow_tie', 'brass', 'brassiere', 'breakwater', 'breastplate',
            'broom', 'bucket', 'buckle', 'bulletproof_vest', 'bullet_train', 'butcher_shop',
            'cab', 'caldron', 'candle', 'cannon', 'canoe', 'can_opener', 'cardigan',
            'car_mirror', 'carousel', 'carpenters_kit', 'carton', 'car_wheel', 'cash_machine',
            'cassette', 'cassette_player', 'castle', 'catamaran', 'CD_player', 'cello',
            'cellular_telephone', 'chain', 'chainlink_fence', 'chain_mail', 'chain_saw',
            'chest', 'chiffonier', 'chime', 'china_cabinet', 'christmas_stocking', 'church',
            'cinema', 'cleaver', 'cliff_dwelling', 'cloak', 'clog', 'cocktail_shaker',
            'coffee_mug', 'coffeepot', 'coil', 'combination_lock', 'computer_keyboard', 'confectionery',
            'container_ship', 'convertible', 'corkscrew', 'cornet', 'cowboy_boot', 'cowboy_hat',
            'cradle', 'crane', 'crash_helmet', 'crate', 'crib', 'Crock_Pot', 'croquet_ball',
            'crutch', 'cuirass', 'dam', 'desk', 'desktop_computer', 'dial_telephone',
            'diaper', 'digital_clock', 'digital_watch', 'dining_table', 'dishrag', 'dishwasher',
            'disk_brake', 'dock', 'dogsled', 'dome', 'doormat', 'drilling_platform',
            'drum', 'drumstick', 'dumbbell', 'dutch_oven', 'electric_fan', 'electric_guitar',
            'electric_locomotive', 'entertainment_center', 'envelope', 'espresso_maker', 'face_powder',
            'feather_boa', 'file', 'fireboat', 'fire_engine', 'fire_screen', 'flagpole',
            'flute', 'folding_chair', 'football_helmet', 'forklift', 'fountain', 'fountain_pen',
            'four_poster', 'freight_car', 'french_horn', 'frying_pan', 'fur_coat', 'garbage_truck',
            'gasmask', 'gas_pump', 'goblet', 'go_kart', 'golf_ball', 'golfcart', 'gondola',
            'gong', 'gown', 'grand_piano', 'greenhouse', 'grille', 'grocery_store', 'guillotine',
            'hair_slide', 'hair_spray', 'half_track', 'hammer', 'hamper', 'hand_blower',
            'hand_held_computer', 'handkerchief', 'hard_disc', 'harmonica', 'harp', 'harvester',
            'hatchet', 'holster', 'home_theater', 'honeycomb', 'hook', 'hoopskirt', 'horizontal_bar',
            'horse_cart', 'hourglass', 'iPod', 'iron', 'jack_o_lantern', 'jean', 'jeep',
            'jersey', 'jigsaw_puzzle', 'jinrikisha', 'joystick', 'kimono', 'knee_pad',
            'knot', 'lab_coat', 'ladle', 'lampshade', 'laptop', 'lawn_mower', 'lens_cap',
            'letter_opener', 'library', 'lifeboat', 'lighter', 'limousine', 'liner',
            'lipstick', 'Loafer', 'lotion', 'loudspeaker', 'loupe', 'lumbermill', 'magnetic_compass',
            'mailbag', 'mailbox', 'maillot', 'manhole_cover', 'maraca', 'marimba', 'mask',
            'matchstick', 'maypole', 'maze', 'measuring_cup', 'medicine_chest', 'megalith',
            'microphone', 'microwave', 'military_uniform', 'milk_can', 'minibus', 'miniskirt',
            'minivan', 'missile', 'mitten', 'mixing_bowl', 'mobile_home', 'Model_T', 'modem',
            'monastery', 'monitor', 'moped', 'mortar', 'mortarboard', 'mosque', 'mosquito_net',
            'motor_scooter', 'mountain_bike', 'mountain_tent', 'mouse', 'mousetrap', 'moving_van',
            'muzzle', 'nail', 'neck_brace', 'necklace', 'nipple', 'notebook', 'obelisk',
            'oboe', 'ocarina', 'odometer', 'oil_filter', 'organ', 'oscilloscope', 'overskirt',
            'oxcart', 'oxygen_mask', 'packet', 'paddle', 'paddlewheel', 'padlock', 'paintbrush',
            'pajama', 'palace', 'panpipe', 'paper_towel', 'parachute', 'parallel_bars', 'park_bench',
            'parking_meter', 'passenger_car', 'patio', 'pay_phone', 'pedestal', 'pencil_box',
            'pencil_sharpener', 'perfume', 'Petri_dish', 'photocopier', 'pick', 'pickelhaube',
            'picket_fence', 'pickup', 'pier', 'piggy_bank', 'pill_bottle', 'pillow', 'ping_pong_ball',
            'pinwheel', 'pirate', 'pitcher', 'plane', 'planetarium', 'plastic_bag', 'plate_rack',
            'plow', 'plunger', 'Polaroid_camera', 'pole', 'police_van', 'poncho', 'pool_table',
            'pop_bottle', 'pot', 'potters_wheel', 'power_drill', 'prayer_rug', 'printer',
            'prison', 'projectile', 'projector', 'puck', 'punching_bag', 'purse', 'quill',
            'quilt', 'racer', 'racket', 'radiator', 'radio', 'radio_telescope', 'rain_barrel',
            'recreational_vehicle', 'reel', 'reflex_camera', 'refrigerator', 'remote_control',
            'restaurant', 'revolver', 'rifle', 'rocking_chair', 'rotisserie', 'rubber_eraser',
            'rugby_ball', 'rule', 'running_shoe', 'safe', 'safety_pin', 'saltshaker', 'sandal',
            'sarong', 'sax', 'scabbard', 'scale', 'school_bus', 'schooner', 'scoreboard',
            'screen', 'screw', 'screwdriver', 'seat_belt', 'sewing_machine', 'shield', 'shoe_shop',
            'shoji', 'shopping_basket', 'shopping_cart', 'shovel', 'shower_cap', 'shower_curtain',
            'ski', 'ski_mask', 'sleeping_bag', 'slide_rule', 'sliding_door', 'slot', 'snorkel',
            'snowmobile', 'snowplow', 'soap_dispenser', 'soccer_ball', 'sock', 'solar_dish',
            'sombrero', 'soup_bowl', 'space_bar', 'space_heater', 'space_shuttle', 'spatula',
            'speedboat', 'spider_web', 'spindle', 'sports_car', 'spotlight', 'stage', 'steam_locomotive',
            'steel_arch_bridge', 'steel_drum', 'stethoscope', 'stole', 'stone_wall', 'stopwatch',
            'stove', 'strainer', 'streetcar', 'stretcher', 'studio_couch', 'stupa', 'submarine',
            'suit', 'sundial', 'sunglass', 'sunglasses', 'sunscreen', 'suspension_bridge', 'swab',
            'sweatshirt', 'swimming_trunks', 'swing', 'switch', 'syringe', 'table_lamp', 'tank',
            'tape_player', 'teapot', 'teddy', 'television', 'tennis_ball', 'thatch', 'theater_curtain',
            'thimble', 'thresher', 'throne', 'tile_roof', 'toaster', 'tobacco_shop', 'toilet_seat',
            'torch', 'totem_pole', 'tow_truck', 'toyshop', 'tractor', 'trailer_truck', 'tray',
            'trench_coat', 'tricycle', 'trimaran', 'tripod', 'triumphal_arch', 'trolleybus', 'trombone',
            'tub', 'turnstile', 'typewriter_keyboard', 'umbrella', 'unicycle', 'upright', 'vacuum',
            'vase', 'vault', 'velvet', 'vending_machine', 'vestment', 'viaduct', 'violin',
            'volleyball', 'waffle_iron', 'wall_clock', 'wallet', 'wardrobe', 'warplane', 'washbasin',
            'washer', 'water_bottle', 'water_jug', 'water_tower', 'whiskey_jug', 'whistle', 'wig',
            'window_screen', 'window_shade', 'Windsor_tie', 'wine_bottle', 'wing', 'wok', 'wooden_spoon',
            'wool', 'worm_fence', 'wreck', 'yawl', 'yurt', 'web_site', 'comic_book', 'crossword_puzzle',
            'street_sign', 'traffic_light', 'book_jacket', 'menu', 'plate', 'guacamole', 'consomme',
            'hot_pot', 'trifle', 'ice_cream', 'ice_lolly', 'french_loaf', 'bagel', 'pretzel',
            'cheeseburger', 'hotdog', 'mashed_potato', 'head_cabbage', 'broccoli', 'cauliflower',
            'zucchini', 'spaghetti_squash', 'acorn_squash', 'butternut_squash', 'cucumber', 'artichoke',
            'bell_pepper', 'cardoon', 'mushroom', 'Granny_Smith', 'strawberry', 'orange', 'lemon',
            'fig', 'pineapple', 'banana', 'jackfruit', 'custard_apple', 'pomegranate', 'hay',
            'carbonara', 'chocolate_sauce', 'dough', 'meat_loaf', 'pizza', 'potpie', 'burrito',
            'red_wine', 'espresso', 'cup', 'eggnog', 'alp', 'bubble', 'cliff', 'coral_reef',
            'geyser', 'lakeside', 'promontory', 'sandbar', 'seashore', 'valley', 'volcano',
            'ballplayer', 'groom', 'scuba_diver', 'rapeseed', 'daisy', 'yellow_lady_slipper',
            'corn', 'acorn', 'hip', 'buckeye', 'coral_fungus', 'agaric', 'gyromitra',
            'stinkhorn', 'earthstar', 'hen_of_the_woods', 'bolete', 'ear', 'toilet_tissue'
        ]
    
    def _analyze_classification_results(self, top5_indices: np.ndarray, top5_prob: np.ndarray, imagenet_labels: List[str]) -> Dict:
        """分析分类结果并映射到我们的分类体系"""
        # 获取前5个预测结果
        predictions = []
        for i, (idx, prob) in enumerate(zip(top5_indices, top5_prob)):
            if idx < len(imagenet_labels):
                label = imagenet_labels[idx]
                predictions.append((label, float(prob)))
        
        # 使用更智能的映射方法
        theme, subcategory, confidence = self._smart_map_to_categories(predictions)
        
        return {
            "theme": theme,
            "subcategory": subcategory,
            "confidence": confidence,
            "predictions": predictions[:3]  # 返回前3个预测结果
        }
    
    def _map_to_our_categories(self, predictions: List[Tuple[str, float]]) -> Tuple[str, str, float]:
        """将ImageNet预测映射到我们的分类体系"""
        # 定义关键词映射 - 4类分类体系
        keyword_mapping = {
            "人像": {
                "keywords": ["person", "people", "man", "woman", "child", "baby", "boy", "girl", "face", "portrait", "head", "human", "individual", "crowd", "family", "couple", "party", "wedding", "sport", "game", "concert", "meeting", "celebration", "festival", "event", "activity", "daily", "lifestyle"],
                "subcategories": ["肖像", "群体照", "职业人物", "明星", "儿童", "老人", "生活场景", "活动记录"]
            },
            "动物与植物": {
                "keywords": ["animal", "dog", "cat", "bird", "fish", "horse", "cow", "sheep", "pig", "wildlife", "lion", "tiger", "elephant", "bear", "wolf", "deer", "tree", "oak", "pine", "maple", "grass", "lawn", "meadow", "field", "pasture", "flower", "rose", "tulip", "daisy", "sunflower", "orchid", "plant", "leaf", "branch", "root", "fruit", "vegetable"],
                "subcategories": ["野生动物", "家养动物", "鸟类", "昆虫", "树木", "花卉", "植物特写", "动物行为"]
            },
            "城市与建筑": {
                "keywords": ["building", "house", "skyscraper", "tower", "church", "palace", "castle", "street", "road", "highway", "sidewalk", "pavement", "bridge", "viaduct", "overpass", "car", "automobile", "vehicle", "truck", "bus", "van", "city", "urban", "architecture", "office", "hospital", "school", "factory", "industrial", "business", "technology", "computer", "electronics", "furniture", "chair", "table", "bed", "sofa", "desk"],
                "subcategories": ["城市风光", "街景", "地标建筑", "室内设计", "古建筑", "商务场景", "科技元素", "工业建筑"]
            },
            "自然风光": {
                "keywords": ["landscape", "mountain", "hill", "valley", "cliff", "coast", "seashore", "lakeside", "beach", "sky", "cloud", "sunset", "sunrise", "horizon", "forest", "woodland", "grove", "jungle", "nature", "outdoor", "wilderness", "lake", "river", "waterfall", "desert", "canyon", "volcano", "glacier", "seascape", "countryside", "meadow", "field"],
                "subcategories": ["山川", "海洋", "森林", "天空", "花草", "四季", "日出日落", "云彩", "湖泊", "河流"]
            }
        }
        
        # 计算每个类别的得分
        category_scores = {}
        for category, data in keyword_mapping.items():
            score = 0
            for label, prob in predictions:
                for keyword in data["keywords"]:
                    if keyword in label.lower():
                        score += prob
            category_scores[category] = score
        
        # 选择得分最高的类别
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            best_score = category_scores[best_category]
            
            # 选择子分类
            subcategories = keyword_mapping[best_category]["subcategories"]
            subcategory = subcategories[0] if subcategories else None
            
            # 计算置信度
            confidence = min(best_score * 2, 0.95)  # 调整置信度范围
            
            return best_category, subcategory, confidence
        
        # 默认分类
        return "自然风光", "山川", 0.6
    
    def _fallback_classification(self) -> Dict:
        """回退分类"""
        return {
            "theme": "自然风光",
            "subcategory": "山川",
            "confidence": 0.6,
            "predictions": []
        }

# 全局AI分类器实例
ai_classifier = AIImageClassifier()
