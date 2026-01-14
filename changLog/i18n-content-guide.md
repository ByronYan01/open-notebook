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
- [六、验收标准](#六验收标准)

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

## 六、验收标准

### 6.1 覆盖率

- ✅ 所有用户可见文本均已国际化
- ❌ **排除**：日志、调试信息、API 路径、技术常量

### 6.2 代码质量

- ✅ 无 TypeScript 类型错误
- ✅ 无遗漏的硬编码英文字符串
- ✅ 命名规范符合本文档要求

### 6.3 翻译质量

- ✅ 中英文对应 key 数量一致
- ✅ 插值变量（如 `{count}`）在两种语言中都存在
- ✅ 术语翻译一致性（如 Notebook → 笔记本）

### 6.4 功能测试

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

**文档版本**: 1.1.0
**创建时间**: 2026-01-14
**最后更新**: 2026-01-14
**更新日志**:
- v1.1.0: 新增 JSON 转义规则说明（1.4 节）
- v1.0.0: 初始版本
