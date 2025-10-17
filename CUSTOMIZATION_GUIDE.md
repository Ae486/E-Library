# 🎨 项目自定义指南

本指南将帮助你快速修改项目名称和主题颜色。

---

## 📝 批量修改项目名称

### 方法 1: 使用 VSCode 全局查找替换（推荐）

1. **打开 VSCode**
2. 按 `Ctrl + Shift + H` (Windows) 或 `Cmd + Shift + H` (Mac) 打开全局替换
3. 在"查找"框输入：`云端书舍`
4. 在"替换"框输入：你的新名称，例如 `智慧图书馆`
5. 点击"全部替换"按钮

### 方法 2: 手动修改关键文件

如果你想更精确控制，可以只修改这些关键文件：

#### 前端显示相关
1. **[frontend/index.html:6](frontend/index.html#L6)** - 浏览器标签页标题
   ```html
   <title>你的项目名称 - E-Librarian</title>
   ```

2. **[frontend/src/pages/Login.tsx:60](frontend/src/pages/Login.tsx#L60)** - 登录页标题
   ```tsx
   <h1>你的项目名称</h1>
   ```

3. **[frontend/src/pages/Dashboard.tsx:80](frontend/src/pages/Dashboard.tsx#L80)** - 主页标题
   ```tsx
   <h1>你的项目名称</h1>
   ```

#### 文档相关
4. **[README.md](README.md)** - 项目说明文档
5. **[README_REACT.md](README_REACT.md)** - React 版本说明
6. **[BUILD_SUCCESS.md](BUILD_SUCCESS.md)** - 构建报告

#### 后端相关（可选）
7. **[backend/app.py](backend/app.py)** - 仅在注释中出现

### 需要修改的英文名称

如果你也想修改 "E-Librarian"，同样使用全局查找替换：
- 查找：`E-Librarian`
- 替换：`YourProjectName`

---

## 🎨 修改主题颜色

### 当前主题色

项目当前使用 **紫色-蓝色** 渐变主题：
- 主色：紫色 (Purple) → 蓝色 (Blue)
- 登录页渐变：`from-purple-600 via-blue-600 to-blue-800`
- 按钮颜色：`from-purple-500 to-blue-500`

### 快速修改主题色

#### 步骤 1: 修改 Tailwind 主题配置

编辑 **[frontend/tailwind.config.js](frontend/tailwind.config.js)**:

```javascript
theme: {
  extend: {
    colors: {
      // 方案 1: 改为绿色主题
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',  // 主色
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },

      // 方案 2: 改为橙色主题
      // primary: {
      //   500: '#f97316',
      //   600: '#ea580c',
      //   700: '#c2410c',
      // },

      // 方案 3: 改为粉色主题
      // primary: {
      //   500: '#ec4899',
      //   600: '#db2777',
      //   700: '#be185d',
      // },
    },
  },
}
```

#### 步骤 2: 修改页面渐变色

##### 登录页面 [frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx)

查找并替换背景渐变（第 55-60 行左右）：

```tsx
{/* 当前：紫色-蓝色 */}
<div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-800">

{/* 改为绿色主题 */}
<div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700">

{/* 改为橙色主题 */}
<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">

{/* 改为深蓝主题 */}
<div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
```

##### 主页面 [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx)

查找并替换渐变背景（第 75-80 行左右）：

```tsx
{/* 当前：紫色-蓝色 */}
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">

{/* 改为绿色主题 */}
<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">

{/* 改为橙色主题 */}
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
```

##### 图书卡片 [frontend/src/components/BookCard.tsx](frontend/src/components/BookCard.tsx)

查找图标背景渐变（第 62 行左右）：

```tsx
{/* 当前：紫色-蓝色 */}
<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">

{/* 改为绿色主题 */}
<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">

{/* 改为橙色主题 */}
<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
```

#### 步骤 3: 修改按钮颜色

如果你想修改所有按钮的默认颜色，编辑 **[frontend/src/components/ui/button.tsx](frontend/src/components/ui/button.tsx)**:

查找 `default` 变体（第 10-15 行左右）：

```tsx
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600",
        // 改为绿色
        // default: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600",
      }
    }
  }
)
```

### 步骤 4: 重新构建

修改完成后，需要重新构建 React 应用：

```bash
cd frontend
npm run build
```

或者使用开发模式实时预览：

```bash
cd frontend
npm run dev
```

然后访问 http://localhost:3000 查看效果。

---

## 🎨 预设主题配色方案

### 方案 1: 绿色生态主题
```
背景渐变: from-green-500 via-emerald-600 to-teal-700
按钮: from-green-500 to-emerald-500
适合: 环保、自然、健康类项目
```

### 方案 2: 橙色活力主题
```
背景渐变: from-orange-500 via-red-500 to-pink-600
按钮: from-orange-500 to-red-500
适合: 活力、创意、社交类项目
```

### 方案 3: 深蓝专业主题
```
背景渐变: from-blue-900 via-indigo-800 to-purple-900
按钮: from-blue-600 to-indigo-600
适合: 企业、专业、科技类项目
```

### 方案 4: 粉色温馨主题
```
背景渐变: from-pink-400 via-rose-400 to-red-400
按钮: from-pink-500 to-rose-500
适合: 温馨、艺术、女性向项目
```

### 方案 5: 灰色简约主题
```
背景渐变: from-gray-700 via-slate-800 to-zinc-900
按钮: from-gray-600 to-slate-600
适合: 极简、专业、文档类项目
```

---

## 📋 完整修改清单

### 修改项目名称需要编辑的文件

✅ 前端核心文件（必改）:
- [ ] [frontend/index.html](frontend/index.html) - 第 6 行
- [ ] [frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx) - 第 60 行
- [ ] [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx) - 第 80 行

✅ 文档文件（建议改）:
- [ ] [README.md](README.md)
- [ ] [README_REACT.md](README_REACT.md)
- [ ] [BUILD_SUCCESS.md](BUILD_SUCCESS.md)

⚠️ 编译文件（会自动重新生成，无需手动修改）:
- `frontend/dist/index.html`
- `frontend/dist/assets/*.js`

### 修改主题颜色需要编辑的文件

✅ 核心配置（必改）:
- [ ] [frontend/tailwind.config.js](frontend/tailwind.config.js) - 主题色定义

✅ 页面样式（建议改）:
- [ ] [frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx) - 登录页渐变
- [ ] [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx) - 主页渐变
- [ ] [frontend/src/components/BookCard.tsx](frontend/src/components/BookCard.tsx) - 卡片图标
- [ ] [frontend/src/components/ui/button.tsx](frontend/src/components/ui/button.tsx) - 按钮样式

---

## 🔧 使用 VSCode 进行批量替换的技巧

### 技巧 1: 使用正则表达式

如果你想同时替换多个颜色：

1. 打开全局替换 (`Ctrl + Shift + H`)
2. 启用"使用正则表达式" (点击 `.*` 图标)
3. 查找：`from-purple-(\d+)`
4. 替换：`from-green-$1`

这会将所有 `from-purple-500`, `from-purple-600` 等替换为绿色。

### 技巧 2: 限制搜索范围

只在特定文件夹中替换：

1. 在"要包含的文件"框输入：`frontend/src/**/*.tsx`
2. 这样只会在 React 组件中进行替换

### 技巧 3: 预览更改

在点击"全部替换"之前：
1. 点击单个结果旁边的"替换"图标
2. 预览效果是否符合预期
3. 确认无误后再点击"全部替换"

---

## ⚡ 快速命令

### 一键查找所有需要修改的文件

在项目根目录运行：

```bash
# 查找所有包含"云端书舍"的文件
grep -r "云端书舍" frontend/src --include="*.tsx" --include="*.html"

# 查找所有包含紫色渐变的文件
grep -r "from-purple" frontend/src --include="*.tsx"
```

### 批量替换命令（高级用户）

如果你熟悉命令行，可以使用 sed 批量替换：

```bash
# 替换项目名称（Mac/Linux）
find frontend/src -name "*.tsx" -exec sed -i 's/云端书舍/智慧图书馆/g' {} +

# 替换颜色（Mac/Linux）
find frontend/src -name "*.tsx" -exec sed -i 's/from-purple/from-green/g' {} +
```

**注意**: Windows 用户请使用 VSCode 的图形界面替换功能。

---

## 📖 相关 Tailwind CSS 文档

- 颜色系统: https://tailwindcss.com/docs/customizing-colors
- 渐变背景: https://tailwindcss.com/docs/gradient-color-stops
- 主题配置: https://tailwindcss.com/docs/theme

---

## ❓ 常见问题

**Q: 修改后没有生效？**
A: 需要重新构建 React 应用：`cd frontend && npm run build`

**Q: 开发模式下实时预览？**
A: 使用 `npm run dev`，修改会自动刷新

**Q: 如何恢复默认主题？**
A: 使用 Git 还原：`git checkout frontend/src/` (如果你使用了 Git)

**Q: 我不会编程，只想改名称怎么办？**
A: 使用 VSCode 的全局查找替换功能（方法 1），非常简单！

---

**需要帮助？** 如果在自定义过程中遇到问题，可以查看 [README_REACT.md](README_REACT.md) 或提出问题。
