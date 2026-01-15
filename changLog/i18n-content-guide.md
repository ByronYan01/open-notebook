# 国际化(i18n)内容填充指南

> **本文档用途**: 指导前端国际化词条的提取、命名、组织和填充工作
>
> **使用方式**: 当工作中断时，告诉 AI "按照 `changLog/i18n-content-guide.md` 继续执行"

---

## 📋 目录

- [一、命名规范](#一命名规范)
- [二、文件结构](#二文件结构)
- [三、分类规则](#三分类规则)
- [四、代码示例](#四代码示例)
- [五、执行计划](#五执行计划)
- [六、常见错误与避坑指南](#六常见错误与避坑指南-)
- [七、验收标准](#七验收标准)

---

## 一、命名规范

### 1.1 命名空间划分原则

| 命名空间 | 用途 | 示例 |
|---------|------|------|
| `common` | 全局通用词条（按钮、状态、提示） | `common.actions.save` |
| `nav` | 导航菜单、侧边栏 | `nav.items.notebooks` |
| `components` | **全局可复用组件** (`src/components/`) | `components.emptyState.title` |
| `{pageName}` | 页面及其**专属组件** (`app/.../xxx/components/`) | `notebooks.card.menu.edit` |

### 1.2 Key 命名规范

- ✅ **使用 camelCase**：`searchPlaceholder` 而非 `search_placeholder`
- ✅ **语义化命名**：按用途命名，而非按位置
  - ✅ `searchPlaceholder`、`emptyState.title`
  - ❌ `topInputText`、`messageWhenNoData`
- ✅ **层级扁平化**：避免超过 3 层嵌套

### 1.3 特殊语法

```typescript
// 插值变量
t("greeting", { name: "John" })  // "Hello, {name}!"

// 复数形式
t("itemCount", { count: 5 })  // "5 items" / "1 item"
```

### 1.4 JSON 转义规则 ⚠️ 重要

在 JSON 文件中，字符串内如果包含双引号 `"`，**必须使用反斜杠 `\` 进行转义**。

#### ✅ 正确示例

```json
{
  "notebooks": {
    "card": {
      "deleteDialog": {
        "description": "确定要删除\"{name}\"吗？此操作无法撤销。"
      }
    }
  }
}
```

#### ❌ 错误示例（会导致 JSON 解析失败）

```json
{
  "notebooks": {
    "card": {
      "deleteDialog": {
        "description": "确定要删除"{name}"吗？此操作无法撤销。"
      }
    }
  }
}
```

#### 常见需要转义的字符

| 字符 | 转义后 | 说明 |
|-----|--------|------|
| `"` | `\"` | 双引号（JSON 字符串定界符） |
| `\` | `\\` | 反斜杠本身 |
| `/` | `\/` | 斜杠（可选，通常不需要） |
| 换行 | `\n` | 换行符 |
| 制表符 | `\t` | Tab 字符 |

#### 检查工具

建议使用 VS Code 等编辑器的 JSON 验证功能，确保文件格式正确：

```bash
# 验证 JSON 文件格式
cat frontend/messages/zh.json | jq .
```

---

## 二、文件结构

### 2.1 目录组织

```
frontend/
├── messages/
│   ├── en.json    # 英文翻译（基准语言）
│   └── zh.json    # 中文翻译
└── src/
    ├── components/                    → 命名空间: components.{ComponentName}
    │   ├── common/EmptyState.tsx      → components.emptyState.*
    │   ├── common/ConfirmDialog.tsx   → components.confirmDialog.*
    │   └── common/LoadingSpinner.tsx  → components.loadingSpinner.*
    │
    └── app/[locale]/(dashboard)/
        ├── notebooks/                  → 命名空间: notebooks.*
        │   ├── page.tsx               → notebooks.page.*
        │   └── components/
        │       ├── NotebookList.tsx   → notebooks.list.*
        │       └── NotebookCard.tsx   → notebooks.card.*
        │
        ├── sources/                    → 命名空间: sources.*
        │   ├── page.tsx               → sources.page.*
        │   └── components/
        │       └── SourceCard.tsx     → sources.card.*
        │
        └── search/                     → 命名空间: search.*
            ├── page.tsx               → search.page.*
            └── components/
                └── StreamingResponse.tsx → search.streaming.*
```

### 2.2 JSON 结构模板

```json
{
  "common": {
    "actions": {
      "create": "Create",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "search": "Search",
      "refresh": "Refresh",
      "confirm": "Confirm",
      "close": "Close",
      "copy": "Copy",
      "archive": "Archive",
      "unarchive": "Unarchive"
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "success": "Success",
      "error": "Error",
      "empty": "No data"
    },
    "validation": {
      "required": "{field} is required",
      "invalid": "Invalid {field}",
      "minLength": "{field} must be at least {min} characters"
    }
  },

  "nav": {
    "create": "Create",
    "quickActions": "Quick actions",
    "signOut": "Sign Out",
    "theme": "Theme",
    "sections": {
      "collect": "Collect",
      "process": "Process",
      "create": "Create",
      "manage": "Manage"
    },
    "items": {
      "sources": "Sources",
      "notebooks": "Notebooks",
      "search": "Ask and Search",
      "podcasts": "Podcasts",
      "models": "Models",
      "transformations": "Transformations",
      "settings": "Settings",
      "advanced": "Advanced"
    },
    "createMenu": {
      "source": "Source",
      "notebook": "Notebook",
      "podcast": "Podcast"
    }
  },

  "components": {
    "emptyState": {
      "title": "No items found",
      "description": "Get started by creating a new item."
    },
    "confirmDialog": {
      "title": "Are you sure?",
      "message": "This action cannot be undone.",
      "confirm": "Confirm",
      "cancel": "Cancel"
    },
    "loadingSpinner": {
      "loading": "Loading..."
    }
  },

  "notebooks": {
    "page": {
      "title": "Notebooks",
      "searchPlaceholder": "Search notebooks...",
      "newNotebook": "New Notebook",
      "refresh": "Refresh"
    },
    "list": {
      "activeTitle": "Active Notebooks",
      "archivedTitle": "Archived Notebooks",
      "noResults": "No notebooks match your search",
      "noResultsHint": "Try using a different notebook name.",
      "noArchivedResults": "No archived notebooks match your search",
      "noArchivedResultsHint": "Modify your search to find archived notebooks."
    },
    "card": {
      "menu": {
        "edit": "Edit",
        "archive": "Archive",
        "unarchive": "Unarchive",
        "delete": "Delete"
      },
      "sourcesCount": "{count} sources",
      "notesCount": "{count} notes"
    },
    "createDialog": {
      "title": "Create New Notebook",
      "description": "Start organizing your research with a dedicated space for related sources and notes.",
      "name": "Name",
      "namePlaceholder": "Enter notebook name",
      "description": "Description",
      "descriptionPlaceholder": "Describe the purpose and scope of this notebook...",
      "creating": "Creating…",
      "confirm": "Create Notebook"
    },
    "deleteDialog": {
      "title": "Delete Notebook",
      "message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "confirm": "Delete Notebook"
    }
  }
}
```

---

## 三、分类规则

### 3.1 决策树

```
组件是否跨页面复用？
├── 是 → 使用 components.{ComponentName}
│         例：components.EmptyState.title
│
└── 否 → 归属到页面命名空间
          └── 仅被一个页面使用 → {pageName}.{subComponent}
            例：notebooks.card.menu.edit
```

### 3.2 判断"跨页面复用"的标准

- ✅ **位于 `src/components/`** → 跨页面复用
- ✅ **被 2+ 个页面引用** → 跨页面复用
- ❌ **仅位于 `app/.../xxx/components/` 且只被 xxx 页面使用** → 页面专属

### 3.3 页面专属组件的子命名空间

| 组件文件路径 | 子命名空间 | 示例 Key |
|------------|----------|---------|
| `notebooks/components/NotebookList.tsx` | `list` | `notebooks.list.activeTitle` |
| `notebooks/components/NotebookCard.tsx` | `card` | `notebooks.card.menu.edit` |
| `notebooks/components/CreateNotebookDialog.tsx` | `createDialog` | `notebooks.createDialog.title` |
| `sources/components/SourceCard.tsx` | `card` | `sources.card.menu.download` |

---

## 四、代码示例

### 4.1 页面级组件

```tsx
// app/[locale]/(dashboard)/notebooks/page.tsx
import { useTranslations } from "next-intl"

export default function NotebooksPage() {
  const t = useTranslations("notebooks.page")
  const tList = useTranslations("notebooks.list")

  return (
    <>
      <h1>{t("title")}</h1>
      <Input placeholder={t("searchPlaceholder")} />
      <Button>{t("newNotebook")}</Button>
      <NotebookList title={tList("activeTitle")} />
    </>
  )
}
```

### 4.2 页面专属组件

```tsx
// app/[locale]/(dashboard)/notebooks/components/NotebookCard.tsx
import { useTranslations } from "next-intl"

interface NotebookCardProps {
  notebookName: string
}

export function NotebookCard({ notebookName }: NotebookCardProps) {
  const t = useTranslations("notebooks.card")

  return (
    <DropdownMenuItem>{t("menu.edit")}</DropdownMenuItem>
    <DropdownMenuItem>{t("menu.archive")}</DropdownMenuItem>
  )
}
```

### 4.3 全局可复用组件

```tsx
// src/components/common/EmptyState.tsx
import { useTranslations } from "next-intl"

interface EmptyStateProps {
  namespace?: string  // 可选：允许覆盖默认命名空间
}

export function EmptyState({ namespace = "components.emptyState" }: EmptyStateProps) {
  const t = useTranslations(namespace)

  return (
    <div>
      <h3>{t("title")}</h3>
      <p>{t("description")}</p>
    </div>
  )
}

// 使用默认命名空间
<EmptyState />  // 使用 components.emptyState.*

// 覆盖命名空间
<EmptyState namespace="notebooks.list.empty" />  // 使用 notebooks.list.empty.*
```

### 4.4 表单验证错误国际化

```tsx
// app/[locale]/(dashboard)/notebooks/components/CreateNotebookDialog.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"

// 动态生成验证 schema
export function CreateNotebookDialog() {
  const t = useTranslations("notebooks.createDialog")

  const createNotebookSchema = z.object({
    name: z.string().min(1, t("validation.nameRequired")),
  })

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(createNotebookSchema),
  })

  // ...
}
```

### 4.5 插值用法

```json
// messages/en.json
{
  "notebooks": {
    "card": {
      "sourcesCount": "{count} sources"
    }
  }
}
```

```tsx
<Badge>{t("card.sourcesCount", { count: notebook.sources.length })}</Badge>
// 显示: "5 sources"
```

---

## 五、执行计划

### Phase 1: 基础词条 (P0 - 约 65 个词条)

- [ ] `common` - 通用词条（actions, status, validation）
- [ ] `nav` - 导航相关（sections, items, sidebar）

### Phase 2: 核心页面 (P1 - 约 100 个词条)

- [ ] `notebooks` - 笔记本页面及组件
- [ ] `sources` - 资源页面及组件

### Phase 3: 次要页面 (P2 - 约 80 个词条)

- [ ] `search` - 搜索页面及组件
- [ ] `podcasts` - 播客页面及组件
- [ ] `models` - 模型页面及组件

### Phase 4: 配置页面 (P2 - 约 50 个词条)

- [ ] `settings` - 设置页面及组件
- [ ] `transformations` - 转换页面及组件
- [ ] `advanced` - 高级设置页面及组件

### Phase 5: 全局组件 (P3 - 约 50 个词条)

- [ ] `components.emptyState`
- [ ] `components.confirmDialog`
- [ ] `components.loadingSpinner`
- [ ] 其他全局组件

### Phase 6: 认证页面 (P3 - 约 20 个词条)

- [ ] `auth` - 登录页面

---

## 六、常见错误与避坑指南 ⚠️

> **重要**: 本章节记录实际开发中发现的问题，避免重复踩坑

### 6.1 翻译路径错误（相对路径问题）

#### ❌ 错误示例

```tsx
// 文件: SourceTypeStep.tsx
const t = useTranslations('sources.steps.sourceType')

// 错误：路径不完整
<Label>{t('link.url.label')}</Label>
<Label>{t('upload.file.label')}</Label>
<Label>{t('text.content.label')}</Label>
```

```json
// messages/zh.json
{
  "sources": {
    "steps": {
      "sourceType": {
        "types": {           // ← 注意这里是 types，不是直接 link
          "link": {
            "url": {
              "label": "URL *"
            }
          }
        }
      }
    }
  }
}
```

**问题**: 组件中使用 `t('link.url.label')`，但实际路径应该是 `t('types.link.url.label')`，因为命名空间是 `sources.steps.sourceType`，相对路径应该从 `types` 开始。

#### ✅ 正确示例

```tsx
// 文件: SourceTypeStep.tsx
const t = useTranslations('sources.steps.sourceType')

// 正确：使用完整的相对路径
<Label>{t('types.link.url.label')}</Label>
<Label>{t('types.upload.file.label')}</Label>
<Label>{t('types.text.content.label')}</Label>
```

#### 验证方法

1. **在组件中确定命名空间**:
   ```tsx
   const t = useTranslations('sources.steps.sourceType')
   ```

2. **在 JSON 文件中查找完整路径**:
   ```json
   sources.steps.sourceType.types.link.url.label
   ```

3. **计算相对路径** (去掉命名空间部分):
   ```
   完整路径: sources.steps.sourceType.types.link.url.label
   命名空间: sources.steps.sourceType
   相对路径: types.link.url.label
   ```

4. **验证代码中的调用**:
   ```tsx
   t('types.link.url.label')  // ✅ 正确
   ```

### 6.2 JSON 对象中的重复键冲突

#### ❌ 错误示例

```json
// messages/zh.json
{
  "sources": {
    "steps": {
      "sourceType": {
        "title": "资源类型",           // ❌ 第一个 title
        "description": "选择您想要添加内容的方式",
        "types": { ... },
        "title": {                    // ❌ 第二个 title - 覆盖了第一个！
          "optional": "标题（可选）",
          "required": "标题 *"
        },
        "batch": { ... }
      }
    }
  }
}
```

**问题**: JSON 对象中同一个层级不能有两个相同的键。第二个 `"title"` 会完全覆盖第一个 `"title"`，导致 `"资源类型"` 这个翻译丢失。

#### ✅ 正确示例

```json
// messages/zh.json
{
  "sources": {
    "steps": {
      "sourceType": {
        "stepTitle": "资源类型",           // ✅ 重命名为 stepTitle
        "stepDescription": "选择您想要添加内容的方式",
        "types": { ... },
        "title": {                        // ✅ 保留 title 用于标题输入字段
          "optional": "标题（可选）",
          "required": "标题 *",
          "optionalDescription": "如果留空，将从内容生成标题",
          "requiredDescription": "文本内容需要标题",
          "placeholder": "为您的资源提供一个描述性标题"
        },
        "batch": { ... }
      }
    }
  }
}
```

```tsx
// 对应的组件代码也要修改
<FormSection
  title={t('stepTitle')}              // ✅ 使用重命名后的键
  description={t('stepDescription')}
>

// 标题输入字段仍然使用 title
<Label>{t('title.optional')}</Label>  // ✅ 路径正确
<Label>{t('title.required')}</Label>
```

#### 避免方法

1. **添加新键前先检查**:
   ```bash
   # 在添加新键之前，搜索目标对象中是否已存在同名键
   grep -n '"title"' frontend/messages/zh.json
   ```

2. **使用更具体的命名**:
   - 步骤标题: `stepTitle`, `stepDescription`
   - 表单字段: `title`, `description`, `content`
   - 按钮文本: `buttonTitle`, `buttonLabel`

3. **验证 JSON 有效性**:
   ```bash
   # 使用 Python 验证是否有重复键
   python -c "
   import json
   with open('frontend/messages/zh.json', 'r', encoding='utf-8') as f:
       data = json.load(f)
   print('JSON is valid')
   "
   ```

4. **使用工具检测**:
   ```bash
   # jq 工具会报错如果 JSON 格式不对
   cat frontend/messages/zh.json | jq . > /dev/null
   ```

### 6.3 Zod 表单验证错误国际化 ⚠️ 重要

#### 问题描述

使用 Zod 的内置验证方法（如 `.min(1)`）配合 `.refine()` 添加自定义翻译时，自定义错误不会生效，而是显示 Zod 的默认英文错误：

```
Too small: expected string to have >= 1 characters
```

#### 根本原因

**Zod 验证执行顺序问题**：当内置验证（如 `.min(1)`）失败时，Zod 会立即返回默认错误，不会继续执行后续的 `.refine()` 验证。

#### ❌ 错误做法

```tsx
// ❌ 错误：内置验证会优先执行并返回默认错误
const schema = z.object({
  name: z.string().min(1),  // ← 这个先执行，返回 "Too small..."
})

const validationSchema = schema.refine(
  (data) => data.name.trim().length > 0,
  { path: ['name'], message: tErrors('nameRequired') }  // ← 不会执行
)
```

#### ✅ 正确做法：使用 superRefine 完全接管验证

**步骤 1**: 移除内置验证，只保留类型声明

```tsx
// ✅ 正确：移除 .min()、.max() 等内置验证
const speakerProfileSchema = z.object({
  name: z.string(),        // ← 只声明类型，不添加验证
  tts_provider: z.string(),
  tts_model: z.string(),
  speakers: z.array(speakerConfigSchema),  // ← 移除 .min(1).max(4)
})
```

**步骤 2**: 使用 `superRefine()` 统一处理所有验证

```tsx
const validationSchema = useMemo(
  () =>
    speakerProfileSchema.superRefine((data, ctx) => {
      // 字符串字段验证
      if (!data.name || data.name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tErrors('nameRequired'),
          path: ['name'],
        })
      }

      // 数字字段验证
      if (!Number.isInteger(data.num_segments)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tErrors('segmentsInteger'),
          path: ['num_segments'],
        })
      } else if (data.num_segments < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tErrors('segmentsMin'),
          path: ['num_segments'],
        })
      } else if (data.num_segments > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tErrors('segmentsMax'),
          path: ['num_segments'],
        })
      }

      // 数组字段验证
      if (data.speakers.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tErrors('atLeastOneSpeaker'),
          path: ['speakers'],
        })
      }

      // 嵌套对象验证
      data.speakers.forEach((speaker, index) => {
        if (!speaker.name || speaker.name.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('speakerNameRequired'),
            path: ['speakers', index, 'name'],
          })
        }
      })
    }),
  [tErrors]  // ← 重要：将 tErrors 加入依赖数组
)
```

**步骤 3**: 确保 `tErrors` 在依赖数组中

```tsx
// ❌ 错误：缺少依赖
const validationSchema = useMemo(
  () => speakerProfileSchema.superRefine(...),
  []  // ← 缺少 tErrors，翻译不会更新
)

// ✅ 正确：包含依赖
const validationSchema = useMemo(
  () => speakerProfileSchema.superRefine(...),
  [tErrors]  // ← 语言切换时重新生成验证 schema
)
```

#### 完整示例对比

```tsx
// ❌ 错误示例
const schema = z.object({
  name: z.string().min(1, 'Required'),  // ← 内置验证
  age: z.number().min(18).max(120),    // ← 内置验证
})

const validationSchema = schema
  .refine((data) => data.name.trim(), { message: t('nameRequired') })
  // ↑ 永远不会执行，因为 .min(1) 已经失败

// ✅ 正确示例
const schema = z.object({
  name: z.string(),  // ← 仅类型声明
  age: z.number(),   // ← 仅类型声明
})

const validationSchema = useMemo(() =>
  schema.superRefine((data, ctx) => {
    if (!data.name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('nameRequired'),
        path: ['name'],
      })
    }
    if (data.age < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('ageMin'),
        path: ['age'],
      })
    }
    if (data.age > 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('ageMax'),
        path: ['age'],
      })
    }
  }),
  [t]  // ← 依赖数组
)
```

#### 关键要点

1. **移除所有内置验证**: `.min()`, `.max()`, `.email()` 等
2. **使用 superRefine**: 统一在一个地方处理所有验证
3. **添加 tErrors 到依赖**: 确保语言切换时验证消息也更新
4. **使用 ctx.addIssue()**: 添加自定义验证错误，指定正确的 path

### 6.4 翻译键命名不一致问题

#### 问题描述

不同组件使用不同的键命名转换逻辑，导致 IntlError 错误。

#### 问题场景

在 `models` 文件夹中发现：
- **ModelTypeSection.tsx** 使用硬编码的 camelCase 键：`textToSpeech`、`speechToText`
- **AddModelForm.tsx** 使用 `modelType.replace(/_/g, '')` 生成全小写键：`texttospeech`、`speechtotext`
- JSON 文件中包含 camelCase 键：`textToSpeech`、`speechToText`

结果：AddModelForm 找不到翻译键，抛出 IntlError。

#### ❌ 错误做法

```tsx
// AddModelForm.tsx
const nameKey = modelType.replace(/_/g, '')  // text_to_speech → texttospeech
return {
  displayName: t(`types.${nameKey}`),        // 查找 types.texttospeech
  placeholder: t(`placeholders.${nameKey}`)   // 但 JSON 中是 textToSpeech
}
```

```tsx
// ModelTypeSection.tsx
return {
  title: tTypes('textToSpeech.title'),  // 使用 camelCase
  description: tTypes('textToSpeech.description')
}
```

#### ✅ 正确做法

**统一命名规范**：所有翻译键使用 camelCase

```tsx
// AddModelForm.tsx - 修复后
const nameKey = modelType.split('_')
  .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
  .join('')
// text_to_speech → textToSpeech ✅
// speech_to_text → speechToText ✅
```

#### 避免方法

1. **统一命名转换函数**：
   ```tsx
   // 创建工具函数
   function toCamelCase(str: string): string {
     return str.split('_')
       .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
       .join('')
   }
   ```

2. **命名规范**：
   - ✅ 使用 camelCase：`textToSpeech`、`speechToText`、`textToSpeechModel`
   - ❌ 避免全小写：`texttospeech`、`speechtotext`
   - ❌ 避免混合命名：部分 camelCase、部分 lowercase

3. **验证检查清单**：
   - [ ] 检查所有组件的翻译键命名转换逻辑
   - [ ] 确保 JSON 文件中的键命名与代码一致
   - [ ] 跨组件验证相同类型的键是否使用相同命名

#### 受影响的键对照表

| 原始值 (snake_case) | 错误转换 (全小写) | 正确转换 (camelCase) |
|-------------------|-----------------|-------------------|
| `text_to_speech` | `texttospeech` ❌ | `textToSpeech` ✅ |
| `speech_to_text` | `speechtotext` ❌ | `speechToText` ✅ |
| `text_to_speech_model` | `texttospeechmodel` ❌ | `textToSpeechModel` ✅ |
| `speech_to_text_model` | `speechtotextmodel` ❌ | `speechToTextModel` ✅ |

### 6.5 修改翻译键时的检查清单

---

## 七、验收标准

### 7.1 覆盖率

- ✅ 所有用户可见文本均已国际化
- ❌ **排除**：日志、调试信息、API 路径、技术常量

### 7.2 代码质量

- ✅ 无 TypeScript 类型错误
- ✅ 无遗漏的硬编码英文字符串
- ✅ 命名规范符合本文档要求

### 7.3 翻译质量

- ✅ 中英文对应 key 数量一致
- ✅ 插值变量（如 `{count}`）在两种语言中都存在
- ✅ 术语翻译一致性（如 Notebook → 笔记本）

### 7.4 功能测试

- ✅ 切换语言后所有页面显示正确
- ✅ URL 从 `/en/xxx` 切换到 `/zh/xxx` 显示中文
- ✅ 表单验证错误信息显示正确

---

## 附录 A: 快速参考

### 常用命名空间速查

| 文件路径 | 命名空间 | 示例 |
|---------|---------|------|
| `src/components/common/EmptyState.tsx` | `components.emptyState` | `components.emptyState.title` |
| `app/.../notebooks/page.tsx` | `notebooks.page` | `notebooks.page.title` |
| `app/.../notebooks/components/NotebookList.tsx` | `notebooks.list` | `notebooks.list.activeTitle` |
| `app/.../notebooks/components/NotebookCard.tsx` | `notebooks.card` | `notebooks.card.menu.edit` |
| `app/.../sources/page.tsx` | `sources.page` | `sources.page.title` |
| `app/.../search/page.tsx` | `search.page` | `search.page.title` |

### 常用通用词条

```json
{
  "common": {
    "actions": {
      "create": "Create / 创建",
      "save": "Save / 保存",
      "cancel": "Cancel / 取消",
      "delete": "Delete / 删除",
      "edit": "Edit / 编辑"
    },
    "status": {
      "loading": "Loading... / 加载中...",
      "empty": "No data / 暂无数据"
    }
  }
}
```

---

**文档版本**: 1.2.0
**创建时间**: 2026-01-14
**最后更新**: 2026-01-15
**更新日志**:
- v1.2.0: 新增"常见错误与避坑指南"章节（第六节），记录翻译路径错误和 JSON 重复键问题
- v1.1.0: 新增 JSON 转义规则说明（1.4 节）
- v1.0.0: 初始版本
