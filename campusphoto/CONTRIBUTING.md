# 贡献指南

感谢您对高校摄影系统的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 Bug 报告
- 💡 功能建议
- 📝 文档改进
- 🔧 代码贡献
- 🧪 测试用例
- 🌐 国际化翻译

## 行为准则

请确保在参与项目时遵守我们的[行为准则](CODE_OF_CONDUCT.md)。我们致力于营造一个友好、包容的开发环境。

## 开始贡献

### 1. 环境准备

确保您的开发环境满足以下要求：

- Node.js 18+
- Python 3.11+
- Git
- Docker & Docker Compose（推荐）

### 2. Fork 和克隆项目

```bash
# Fork 项目到您的 GitHub 账户
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/campusphoto.git
cd campusphoto

# 添加上游仓库
git remote add upstream https://github.com/original-org/campusphoto.git
```

### 3. 创建开发分支

```bash
# 从 main 分支创建新的功能分支
git checkout -b feature/your-feature-name

# 或者修复分支
git checkout -b fix/your-bug-fix
```

### 4. 设置开发环境

```bash
# 使用 Docker（推荐）
make dev

# 或者本地开发
make install
```

## 代码规范

### Python 代码规范

我们使用以下工具确保代码质量：

- **Black**: 代码格式化
- **isort**: 导入排序
- **flake8**: 代码检查
- **mypy**: 类型检查

```bash
# 格式化代码
cd backend
black .
isort .

# 检查代码
flake8 .
mypy .
```

### TypeScript 代码规范

前端代码遵循以下规范：

- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型安全

```bash
# 格式化代码
cd frontend
npm run lint -- --fix
npx prettier --write .

# 类型检查
npm run type-check
```

### 命名规范

#### Python 命名

- **文件名**: `snake_case.py`
- **类名**: `PascalCase`
- **函数名**: `snake_case`
- **变量名**: `snake_case`
- **常量名**: `UPPER_SNAKE_CASE`

#### TypeScript 命名

- **文件名**: `PascalCase.tsx` (组件) 或 `camelCase.ts` (工具)
- **组件名**: `PascalCase`
- **函数名**: `camelCase`
- **变量名**: `camelCase`
- **常量名**: `UPPER_SNAKE_CASE`
- **类型名**: `PascalCase`

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI/CD 相关

### 提交示例

```bash
# 新功能
git commit -m "feat(auth): add JWT token refresh mechanism"

# Bug 修复
git commit -m "fix(upload): resolve image compression issue"

# 文档更新
git commit -m "docs: update API documentation"

# 代码重构
git commit -m "refactor(database): optimize query performance"
```

## 分支策略

我们使用 Git Flow 分支模型：

- `main`: 主分支，包含稳定的生产代码
- `develop`: 开发分支，包含最新的开发代码
- `feature/*`: 功能分支，用于开发新功能
- `fix/*`: 修复分支，用于修复 Bug
- `release/*`: 发布分支，用于准备新版本发布
- `hotfix/*`: 热修复分支，用于紧急修复生产问题

## Pull Request 流程

### 1. 准备工作

- 确保您的分支是从最新的 `main` 或 `develop` 分支创建的
- 运行所有测试并确保通过
- 运行代码检查工具并修复所有问题

```bash
# 同步上游更改
git fetch upstream
git rebase upstream/main

# 运行测试
make test

# 代码检查
make lint
```

### 2. 创建 Pull Request

1. 推送您的分支到 GitHub：
```bash
git push origin feature/your-feature-name
```

2. 在 GitHub 上创建 Pull Request

3. 填写 PR 模板（见下文）

### 3. PR 模板

```markdown
## 描述
简要描述这个 PR 的目的和实现的功能。

## 相关 Issue
- Closes #123
- Relates to #456

## 更改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构
- [ ] 其他（请说明）

## 测试
- [ ] 现有测试通过
- [ ] 添加了新的测试
- [ ] 手动测试通过

## 截图（如适用）
添加截图来说明您的更改。

## 检查清单
- [ ] 代码遵循项目的代码规范
- [ ] 自我审查了代码
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有新的警告
- [ ] 添加了测试以证明修复有效或功能可工作
- [ ] 新的和现有的单元测试都通过
```

## 代码审查

### 审查要点

1. **功能性**: 代码是否实现了预期功能？
2. **可读性**: 代码是否易于理解？
3. **性能**: 是否有性能问题？
4. **安全性**: 是否存在安全漏洞？
5. **测试**: 是否有足够的测试覆盖？
6. **文档**: 是否更新了相关文档？

### 审查流程

1. **自动检查**: CI/CD 系统会自动运行测试和代码检查
2. **人工审查**: 至少需要一名维护者的批准
3. **修改完善**: 根据审查意见修改代码
4. **合并**: 审查通过后合并到目标分支

## 测试指南

### 后端测试

```bash
cd backend

# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_auth.py

# 生成覆盖率报告
pytest --cov=. --cov-report=html
```

### 前端测试

```bash
cd frontend

# 运行单元测试
npm test

# 运行 E2E 测试
npm run test:e2e

# 生成覆盖率报告
npm run test:coverage
```

### 测试最佳实践

1. **单元测试**: 测试单个函数或方法
2. **集成测试**: 测试多个组件的交互
3. **端到端测试**: 测试完整的用户流程
4. **测试命名**: 使用描述性的测试名称
5. **测试数据**: 使用独立的测试数据
6. **模拟依赖**: 适当使用 Mock 和 Stub

## 文档贡献

### 文档类型

- **API 文档**: 自动生成，需要更新代码注释
- **用户指南**: 面向最终用户的使用说明
- **开发者文档**: 面向开发者的技术文档
- **部署指南**: 部署和运维相关文档

### 文档编写规范

1. **清晰简洁**: 使用简单明了的语言
2. **结构合理**: 使用合适的标题层级
3. **示例丰富**: 提供充分的代码示例
4. **及时更新**: 保持文档与代码同步

## Bug 报告

### 报告模板

```markdown
## Bug 描述
清晰简洁地描述这个 Bug。

## 复现步骤
1. 访问 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 期望行为
描述您期望发生什么。

## 实际行为
描述实际发生了什么。

## 截图
如果适用，添加截图来帮助解释您的问题。

## 环境信息
- 操作系统: [如 Windows 10]
- 浏览器: [如 Chrome 91]
- 版本: [如 v1.0.0]

## 附加信息
添加任何其他有关问题的上下文信息。
```

## 功能建议

### 建议模板

```markdown
## 功能描述
简洁描述您希望添加的功能。

## 问题背景
这个功能要解决什么问题？

## 解决方案
描述您希望如何实现这个功能。

## 替代方案
描述您考虑过的其他替代解决方案。

## 附加信息
添加任何其他相关信息。
```

## 发布流程

### 版本号规范

我们使用 [语义化版本](https://semver.org/lang/zh-CN/)：

- `MAJOR.MINOR.PATCH`
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 发布步骤

1. 更新 CHANGELOG.md
2. 更新版本号
3. 创建发布分支
4. 测试验证
5. 合并到 main 分支
6. 创建 Git Tag
7. 部署到生产环境

## 获得帮助

如果您在贡献过程中遇到任何问题，可以通过以下方式获得帮助：

- 📧 发送邮件到：contact@campusphoto.com
- 💬 在 GitHub Issues 中提问
- 📱 加入我们的微信群（群号：XXX-XXX-XXX）

## 致谢

感谢所有为这个项目做出贡献的开发者！您的贡献让这个项目变得更好。

---

再次感谢您的贡献！🎉



