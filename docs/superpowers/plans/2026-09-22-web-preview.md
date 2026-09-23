# 宠物社 Web Preview Implementation Plan

> Execute inline using executing-plans; review the implementation using requesting-code-review.

**Goal:** 发布可直接打开的 8 页面网页演示，AI 明确未接入。

**Architecture:** 原生 JS hash router，纯函数负责资料校验和演示记录，浏览器本地存储负责资料和历史。GitHub Pages 从 main 的根目录发布。

**Tech Stack:** HTML / CSS / JavaScript ES modules / Node test runner / Playwright browser verification.

- [x] `tests/model.test.mjs`：先测试空资料拒绝、完成三轮观察、未知答案保留、历史按 ID 去重、存储损坏恢复；运行 `node --test` 确认缺少实现。
- [x] `model.mjs`：实现资料校验、演示问题与无诊断的观察摘要、带内存降级的版本化存储。
- [x] `index.html`, `styles.css`, `app.mjs`：实现 8 个 hash 页面、表单、前后导航、进度、详情与删除记录；所有用户文本转义；不引用外部素材。
- [x] `tests/browser.mjs`：用真实 Chromium 检查 8 页、表单、刷新与手机布局、AI 未接入提示；保留桌面和手机截图在本地 QA 目录。
- [x] `README.md`, `.gitignore`, `.nojekyll`：说明演示范围、启动和后续 AI 接口边界；排除依赖和 QA 文件。
- [x] 完成独立审查、修复问题，执行 `node --test tests/model.test.mjs` 与浏览器验证。
- [x] 初始化独立仓库，审查待提交文件，创建 GitHub 仓库 `pet-society-preview`，启用 Pages，验证公网。
