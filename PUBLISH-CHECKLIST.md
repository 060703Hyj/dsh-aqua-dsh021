# 发布检查清单

发布前逐条打勾。全部完成后再 `git push`。

## 一、包本身

- [ ] 跑过 `node verify.mjs`，输出「全部通过」
- [ ] 跑过 `node rename.mjs --pkg ... --repo ...`，包名/仓库名已换成自己的
- [ ] `npm pack --dry-run` 看过内容，没有多余文件
- [ ] `lib/client.js` 里 `__ModuleLoader__.load({ id: "..." })` 与 `package.json` 的 `name` 一致
- [ ] `cordis.patch.yml` 里的 `name:` 与 `package.json` 的 `name` 一致
- [ ] `cordis.patch.yml` 里没有 `C:\...` 这类绝对路径

## 二、本地实测

- [ ] `dsh plugin --profile web add /本仓库绝对路径` 装得上
- [ ] 重启 dsh 后设置里出现「玻璃主题 / Glass theme」页签
- [ ] 主题生效（侧边栏、顶栏是玻璃）
- [ ] **会话区背景是透的**，能看到流体/壁纸
- [ ] 关掉总开关，界面回到原生
- [ ] 卸载干净：`dsh plugin --profile web remove <包名>`

## 三、法务

- [ ] `LICENSE` 是 AGPL-3.0 全文
- [ ] `NOTICE.md` 列清了 5 处改动
- [ ] `README.md` 顶部写明「基于 WYH66666666 的上游项目」
- [ ] `README.md` 写明「AGPL-3.0」

## 四、仓库

- [ ] GitHub 仓库是 **Public**
- [ ] 建仓库时**没有**勾选自动生成 README / .gitignore / license
- [ ] `git push` 成功，网页上能看到所有文件
- [ ] 仓库 description 写明「仅适配 DSH 0.2.1-rc.2」
- [ ] 打了 tag（可选）

## 五、发布后

- [ ] 用另一台机器（或让朋友）跑 `dsh plugin --profile web add github:用户名/仓库名` 验证
- [ ] 在 README 里补一句「实测环境：DSH 0.2.1-rc.2 / Windows x64」
