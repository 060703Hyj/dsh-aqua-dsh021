# 变更声明 / NOTICE

本仓库是 **Aqua 玻璃主题** 的兼容性分支，不是原创项目。

## 上游

| 项 | 值 |
|---|---|
| 项目 | `@deepseek-ai/dsh-client-ui-aqua`（Aqua） |
| 作者 | WYH66666666 |
| 仓库 | https://github.com/WYH66666666/DSH-Transparent-UI-Plugin |
| 本分支基于 | **v1.3.1** |
| 许可证 | **AGPL-3.0**（本分支同样以 AGPL-3.0 发布） |

上游 `LICENSE` 全文已随本仓库分发（见 `LICENSE`）。原作者的版权声明保留在源码与本文档中。

## 本分支改了什么

**只做兼容性修复，不改变主题的任何视觉设计。** 上游面向 DSH 0.1.x，在 0.2.1-rc.2 上无法运行。

### 1. 替换已移除的客户端模块

```diff
- require("@deepseek-ai/dsh-client-runtime/client")
+ require("@deepseek-ai/dsh-client-store")
```

DSH 0.2.1 把 `dsh-client-runtime` 拆掉了，`defineStore` 现在由 `dsh-client-store` 导出。宿主平台模块表里只有后者。

对应上游文件：`src/client/settings-store.ts`

### 2. 图标重命名

```diff
- import { IconCheckOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
+ import { IconCheckOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
```

0.2.1 的 primitives 共 289 个导出，**没有任何 `*16` 后缀的图标**，改用 `*Regular` / `*Medium`。共 6 处（`AquaAppearanceRow.tsx` 5 处、`AquaPluginCard.tsx` 1 处）。

### 3. 设置卡片换插槽

```diff
- ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
-   name: 'settings.plugin.item',
-   id: 'aqua',
+ ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
+   name: 'settings.plugins.tab',
+   id: 'aqua',
+   label: () => '玻璃主题 / Glass theme',
```

`settings.plugin.item` 在 0.2.1 已完全移除（全 `app.asar` 0 次命中）。当前版本的插件配置页签是 `settings.plugins.tab`（list 插槽）。

对应上游文件：`src/client/index.ts`

### 4. 更新 `dsh.client.inject`

```diff
 "inject": [
-  "@deepseek-ai/dsh-client-runtime",
+  "@deepseek-ai/dsh-client-store",
   "@deepseek-ai/dsh-client-locale",
   "@deepseek-ai/dsh-client-ui-theme",
-  "@deepseek-ai/dsh-client-ui-settings",
   "@deepseek-ai/dsh-client-ui-slots",
   "@deepseek-ai/dsh-client-ui-primitives"
 ]
```

`dsh-client-runtime` 与 `dsh-client-ui-settings` 都不在 0.2.1 的平台模块表里。

### 5. 新增布局补丁（本分支新增代码，非上游）

上游清背景用的是 0.1.x 的属性选择器：

```css
[data-dsh-aqua] [data-dsh-frame],
[data-dsh-aqua] [data-dsh-details] { background: 0 0 }
```

0.2.1 把这些 `data-*` 标记全删了，布局改用 CSS Module 类名。结果是**侧边栏和背景层正常，但会话区被不透明底色盖住**（`[class*=sidebarCol]` 恰好还能匹配新类名，`[data-dsh-frame]` 则一条都不匹配）。

本分支新增 `dsh021-layout.css`（内联在 `lib/client.js` 里，见 `DSH021_LAYOUT_CSS`），把这几层改成透明：

```css
[data-dsh-aqua] .BynINW_frame,
[data-dsh-aqua] .BynINW_centerCol,
[data-dsh-aqua] .BynINW_rightbarCol,
[data-dsh-aqua] .BynINW_bottomRow,
[data-dsh-aqua] .Dc7zOa_root { background: transparent }
```

并带一条兜底：既没有流体也没有壁纸时，退回原生底色。

## 未改动的部分

- 主题渲染、CSS、流体背景着色器、粒子鲸鱼、小鱼、鼠标辉光、悬停下压
- 设置项的语义与默认值
- `localStorage` 持久化
- 关闭开关后回到原生界面的行为

## 已知限制

1. **只测过 DSH `0.2.1-rc.2`**（Windows x64，Electron 44 / Node 24）。其他 0.2.x 版本未验证。
2. **布局补丁依赖 CSS Module 类名哈希**（`BynINW_*`、`Dc7zOa_*`）。DSH 升级后哈希会重新生成，补丁失效的表现是「会话背景又被盖住」。届时按 DevTools 里的新类名替换即可。
3. **不含 `src/`**。本仓库只发布构建产物（`lib/`）。上游的构建链依赖 DSH monorepo 里的 `tsdown.client.ts`，无法在本仓库独立构建。
4. 上游作者在 README 中说明「DSH 更新后没空跟进」，本分支不保证跟进后续 DSH 版本。

## 商标与归属

「DeepSeek Harness」「DSH」归其各自所有者。「Aqua」「Glass theme」的设计与实现归原作者 WYH66666666。本分支仅做兼容性修复。
