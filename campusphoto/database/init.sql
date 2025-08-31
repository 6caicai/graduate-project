-- 高校摄影系统数据库初始化脚本

-- 创建数据库扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'photographer', 'admin')),
    avatar_url VARCHAR(500),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建作品表
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    theme VARCHAR(50),
    confidence DECIMAL(3,2),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    heat_score DECIMAL(10,2) DEFAULT 0,
    competition_id INTEGER,
    is_approved BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建比赛表
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    theme VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    voting_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'voting', 'closed')),
    rules JSONB,
    prizes JSONB,
    max_submissions INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加外键约束
ALTER TABLE photos ADD CONSTRAINT fk_photos_competition 
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE SET NULL;

-- 创建预约表
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photographer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    preferred_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建交互记录表
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'favorite', 'view', 'vote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, photo_id, type)
);

-- 创建排行榜表
CREATE TABLE IF NOT EXISTS rankings (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    rank_type VARCHAR(20) NOT NULL,
    rank INTEGER NOT NULL,
    score DECIMAL(10,2) NOT NULL,
    period VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建配置表
CREATE TABLE IF NOT EXISTS configurations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_competition_id ON photos(competition_id);
CREATE INDEX IF NOT EXISTS idx_photos_theme ON photos(theme);
CREATE INDEX IF NOT EXISTS idx_photos_is_approved ON photos(is_approved);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_photos_heat_score ON photos(heat_score DESC);

CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_start_time ON competitions(start_time);
CREATE INDEX IF NOT EXISTS idx_competitions_end_time ON competitions(end_time);

CREATE INDEX IF NOT EXISTS idx_appointments_student_id ON appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_photographer_id ON appointments(photographer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_preferred_time ON appointments(preferred_time);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_photo_id ON interactions(photo_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_rankings_rank_type ON rankings(rank_type);
CREATE INDEX IF NOT EXISTS idx_rankings_period ON rankings(period);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON rankings(rank);

CREATE INDEX IF NOT EXISTS idx_configurations_key ON configurations(key);
CREATE INDEX IF NOT EXISTS idx_configurations_category ON configurations(category);
CREATE INDEX IF NOT EXISTS idx_configurations_is_active ON configurations(is_active);

CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_resource_type ON system_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认配置数据
INSERT INTO configurations (key, value, description, category) VALUES
('daily_upload_limit', '{"value": 5, "enabled": true}', '每日上传限制', 'upload'),
('max_file_size', '{"value": 10485760, "enabled": true}', '最大文件大小(字节)', 'upload'),
('allowed_extensions', '{"value": ["jpg", "jpeg", "png", "webp"], "enabled": true}', '允许的文件扩展名', 'upload'),
('ranking_weights', '{"like": 1.0, "favorite": 2.0, "vote": 3.0, "view": 0.5, "time_decay": 0.9}', '排行榜权重配置', 'ranking'),
('competition_rules', '{"max_submissions_per_user": 3, "min_voting_period_hours": 24, "allow_late_submissions": false, "require_approval": true}', '比赛规则配置', 'competition'),
('role_permissions', '{"student": {"can_upload": true, "can_vote": true, "can_comment": true}, "photographer": {"can_upload": true, "can_vote": true, "can_review": true, "can_manage_appointments": true}, "admin": {"can_manage_users": true, "can_manage_competitions": true, "can_manage_configs": true}}', '角色权限配置', 'general')
ON CONFLICT (key) DO NOTHING;

-- 创建默认管理员用户 (密码: admin123)
INSERT INTO users (username, email, password_hash, role, bio) VALUES
('admin', 'admin@campusphoto.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', '系统管理员')
ON CONFLICT (username) DO NOTHING;

-- 创建示例摄影师用户
INSERT INTO users (username, email, password_hash, role, bio) VALUES
('photographer1', 'photographer1@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'photographer', '专业人像摄影师'),
('photographer2', 'photographer2@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'photographer', '风光摄影爱好者')
ON CONFLICT (username) DO NOTHING;

-- 创建示例学生用户
INSERT INTO users (username, email, password_hash, role, bio) VALUES
('student1', 'student1@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student', '摄影爱好者'),
('student2', 'student2@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'student', '新手学习中')
ON CONFLICT (username) DO NOTHING;

-- 创建示例比赛
INSERT INTO competitions (name, description, theme, start_time, end_time, status) VALUES
('春季校园摄影大赛', '捕捉春天校园的美丽瞬间，展现青春活力', '校园风光', NOW(), NOW() + INTERVAL '30 days', 'active'),
('人像摄影挑战赛', '展现人物的情感和故事，记录真实的美好', '人物肖像', NOW() - INTERVAL '5 days', NOW() + INTERVAL '15 days', 'active')
ON CONFLICT DO NOTHING;

-- 提交事务
COMMIT;



