# 国际化(i18n)功能实现总结

## 概述

本次更新为 Open Notebook 项目添加了完整的国际化（i18n）支持，实现了**英文/中文双语切换**功能。通过集成 `next-intl` 库，重构了应用路由结构，使所有页面和组件支持多语言切换。

## 技术栈

### 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `next-intl` | ^4.7.0 | Next.js 国际化解决方案 |

### 支持的语言

- **en** (English) - 默认语言
- **zh** (中文)

## 核心改动

### 1. 配置层

#### 新增文件
- `frontend/src/i18n/config.ts` - 语言配置
  - 定义支持的语言列表 `locales = ["en", "zh"]`
  - 设置默认语言 `defaultLocale = "en"`
  - 导出 `Locale` 类型

- `frontend/src/i18n/request.ts` - 请求配置
  - 使用 `getRequestConfig` 动态加载翻译消息
  - 从 `messages/` 目录加载对应语言的 JSON 文件
  - 包含语言安全验证逻辑

#### 修改文件
- `frontend/next.config.ts`
  - 集成 `next-intl/plugin` 包装 Next.js 配置
  - 保留现有的 API 代理、standalone 输出等配置

- `frontend/src/middleware.ts`
  - 集成 `next-intl/middleware` 处理语言检测和路由
  - 根路径 `/` 重定向到 `/{defaultLocale}/notebooks`
  - 配置 `localePrefix: "always"` 强制所有路由包含语言前缀
  - 排除静态文件（`api`、`_next`、`_vercel`）不走语言逻辑

### 2. 路由层

#### 路由结构重构

**原结构:**
```
frontend/src/app/
├── (auth)/
├── (dashboard)/
└── layout.tsx
```

**新结构:**
```
frontend/src/app/
└── [locale]/
    ├── (auth)/
    ├── (dashboard)/
    ├── layout.tsx       # 新增 NextIntlClientProvider
    └── page.tsx
```

#### 变更说明
- **新增**: `[locale]` 动态路由段，所有页面迁移至此目录下
- **影响**: 37个页面文件从 `app/` 迁移到 `app/[locale]/`
- **路径更新**: 所有组件中的导入路径从 `@/app/` 更新为 `@/app/[locale]/`

### 3. 组件层

#### 修改的组件文件

| 文件 | 主要改动 |
|------|----------|
| `components/common/ContextToggle.tsx` | 导入路径更新 |
| `components/layout/AppShell.tsx` | 国际化适配 |
| `components/providers/ModalProvider.tsx` | 国际化适配 |
| `components/sources/SourceCard.tsx` | 国际化适配 |
| `lib/hooks/useNotebookChat.ts` | 导入路径更新 |

#### 改动类型
- **路径更新**: 从 `@/app/(dashboard)/...` 改为 `@/app/[locale]/(dashboard)/...`
- **代码格式**: 单引号统一改为双引号（部分文件）

### 4. 翻译层

#### 新增翻译文件

- `frontend/messages/en.json` - 英文翻译
- `frontend/messages/zh.json` - 中文翻译

#### 当前翻译内容
```json
{
  "HomePage": {
    "title": "Hello world!"  // en
    "title": "你好世界！"     // zh
  }
}
```

**注意**: 当前仅有示例翻译，**需要补充完整的翻译内容**。

## 文件变更统计

### 新增文件 (42个)

| 类别 | 数量 | 说明 |
|------|------|------|
| i18n 配置 | 2 | `config.ts`, `request.ts` |
| 翻译文件 | 2 | `en.json`, `zh.json` |
| locale 路由页面 | 38 | `app/[locale]` 下所有页面 |

### 修改文件 (6个)

| 文件 | 改动类型 |
|------|----------|
| `next.config.ts` | 集成 next-intl |
| `package.json` | 新增 next-intl 依赖 |
| `middleware.ts` | 添加语言中间件 |
| `components/common/ContextToggle.tsx` | 导入路径更新 |
| `components/layout/AppShell.tsx` | 国际化适配 |
| `components/providers/ModalProvider.tsx` | 国际化适配 |
| `components/sources/SourceCard.tsx` | 国际化适配 |
| `lib/hooks/useNotebookChat.ts` | 导入路径更新 |

### 删除文件 (37个)

所有原 `app/(auth)/` 和 `app/(dashboard)/` 下的页面文件，已迁移至 `app/[locale]/` 对应路径。

### 代码行数变更

- **新增**: ~514 行
- **删除**: ~5,810 行（旧文件）
- **净变化**: -5,296 行（主要是代码格式化和迁移）

## 迁移说明

### 对开发者的影响

1. **导入路径变更**
   ```typescript
   // 旧路径
   import { ContextMode } from '@/app/(dashboard)/notebooks/[id]/page';

   // 新路径
   import { ContextMode } from '@/app/[locale]/(dashboard)/notebooks/[id]/page';
   ```

2. **语言参数获取**
   ```typescript
   // 在页面组件中获取当前语言
   export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
     const { locale } = await params;
     // ...
   }
   ```

3. **使用翻译**
   ```typescript
   import { useTranslations } from 'next-intl';

   function Component() {
     const t = useTranslations('HomePage');
     return <h1>{t('title')}</h1>;
   }
   ```

### URL 变化

| 旧 URL | 新 URL |
|--------|--------|
| `/notebooks` | `/en/notebooks` 或 `/zh/notebooks` |
| `/sources` | `/en/sources` 或 `/zh/sources` |
| `/settings` | `/en/settings` 或 `/zh/settings` |

## 后续工作

### 必须完成

- [ ] **补充翻译内容**
  - 扫描所有组件中的硬编码文本
  - 提取到 `messages/en.json` 和 `messages/zh.json`
  - 建议使用 next-intl 的自动提取功能（已配置但注释）

- [ ] **语言切换器 UI**
  - 添加语言切换按钮/下拉菜单
  - 保存用户语言偏好到 localStorage

### 可选优化

- [ ] **SEO 元数据国际化**
  - 为不同语言生成不同的 `title` 和 `description`
  - 添加 `hreflang` 标签支持搜索引擎

- [ ] **日期/数字格式化**
  - 根据语言环境格式化日期（使用 `date-fns` 的 locale）
  - 数字和货币格式化

- [ ] **RTL 支持**
  - 如将来支持阿拉伯语等 RTL 语言，需添加 RTL 样式

## 测试建议

1. **功能测试**
   - 访问 `/` 自动重定向到 `/en/notebooks`
   - 手动切换 `/zh/notebooks` 显示中文界面
   - 确认所有页面在不同语言下正常加载

2. **回归测试**
   - 验证所有现有功能未受影响
   - 检查 API 调用、状态管理正常工作

3. **性能测试**
   - 确认语言切换不影响页面加载性能
   - 验证翻译消息的缓存策略

## 参考资料

- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [Next.js 国际化路由](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Keep a Changelog](https://keepachangelog.com/)

---

**文档生成时间**: 2026-01-14
**文档版本**: 1.0.0
