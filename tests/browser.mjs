import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const server = createServer(async (req, res) => {
  try {
    const route = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = path.resolve(
      root,
      "." + (route === "/" ? "/index.html" : route),
    );
    if (
      !file.startsWith(root + path.sep) &&
      file !== path.join(root, "index.html")
    ) {
      res.writeHead(403);
      res.end();
      return;
    }
    const mime = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".mjs": "text/javascript; charset=utf-8",
    };
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base =
  process.env.PREVIEW_URL || `http://127.0.0.1:${server.address().port}/`;
await mkdir(path.join(root, "qa"), { recursive: true });
let browser;
const failures = [];
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
  });
  for (const viewport of [
    { width: 1440, height: 1050 },
    { width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on("pageerror", (err) => failures.push(err.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
    });
    page.on("dialog", (d) => d.accept());
    await page.goto(base);
    await page.getByRole("heading", { name: /照顾它的每一天/ }).waitFor();
    await page.screenshot({
      path: path.join(root, `qa/home-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole("link", { name: /建立基础档案/ }).click();
    await page.getByLabel("宠物昵称").fill("豆豆");
    await page.getByLabel("它是").selectOption("dog");
    await page.getByRole("button", { name: "保存基础档案" }).click();
    await page.getByRole("heading", { name: /豆豆的每一天/ }).waitFor();
    await page.getByRole("button", { name: /食欲/ }).click();
    await page.getByLabel("正常").check();
    await page.getByRole("button", { name: "保存记录" }).click();
    await page.getByRole("link", { name: /添加事项/ }).click();
    await page.getByLabel("事项名称").fill("买粮");
    await page.getByRole("button", { name: "保存事项" }).click();
    await page.locator("#toast").waitFor({ state: "hidden" });
    await page.screenshot({
      path: path.join(root, `qa/home-filled-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole("link", { name: /查看全部日常/ }).first().click();
    await page.getByText("食欲 · 正常").waitFor();
    await page.getByRole("button", { name: "完成买粮" }).click();
    await page.reload();
    await page.getByText("买粮 · 已完成").waitFor();
    await page.getByRole("button", { name: "删除这条食欲记录" }).click();
    assert.equal(await page.getByText("食欲 · 正常").count(), 0);
    await page.getByRole("button", { name: "删除买粮" }).click();
    assert.equal(await page.getByText("买粮 · 已完成").count(), 0);
    await page.goto(base);
    await page.getByRole("button", { name: /告诉 AI/ }).click();
    await page.getByRole("heading", { name: "AI 助手，还在准备中" }).waitFor();
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await page.locator('[data-symptom="vomiting"]').click();
    await page.getByLabel("宠物昵称").fill("豆豆");
    await page.getByLabel("它是").selectOption("dog");
    await page.getByLabel("品种").fill("中华田园犬");
    await page.getByLabel("年龄").fill("2 岁");
    await page.getByLabel("性别").selectOption("unknown");
    await page.getByLabel("体重").fill("5.2");
    await page.getByRole("button", { name: "保存资料，继续" }).click();
    await page
      .getByRole("heading", { name: "你是什么时候开始注意到的？" })
      .waitFor();
    await page.getByRole("button", { name: "不清楚", exact: true }).click();
    await page.reload();
    assert.equal(
      await page.locator('[data-answer="不清楚"]').getAttribute("aria-pressed"),
      "true",
    );
    await page.getByRole("button", { name: "下一步" }).click();
    await page.getByRole("button", { name: "和平时一样", exact: true }).click();
    await page.getByRole("button", { name: "下一步" }).click();
    await page.getByRole("button", { name: "吃得少了", exact: true }).click();
    await page.getByRole("button", { name: "查看观察摘要" }).click();
    await page.getByRole("heading", { name: "豆豆的观察摘要" }).waitFor();
    assert.ok((await page.locator("main").innerText()).includes("不清楚"));
    await page
      .getByRole("button", { name: "保存这次记录", exact: true })
      .click();
    await page.screenshot({
      path: path.join(root, `qa/result-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole("link", { name: /疾病详情 示例布局/ }).click();
    await page
      .getByRole("heading", { name: "疾病详情", exact: true })
      .waitFor();
    await page.getByRole("link", { name: "看看治疗详情" }).click();
    await page
      .getByRole("heading", { name: "治疗详情", exact: true })
      .waitFor();
    await page.getByRole("link", { name: "返回观察摘要" }).click();
    await page.getByRole("link", { name: "问诊历史", exact: true }).click();
    await page.locator('.history-item').waitFor();
    assert.equal(await page.locator(".history-item").count(), 1);
    await page.getByRole("link", { name: "查看摘要" }).click();
    await page.reload();
    await page.getByRole("heading", { name: "豆豆的观察摘要" }).waitFor();
    for (const route of [
      "",
      "daily-pet",
      "daily-record",
      "daily-task",
      "daily-history",
      "pet",
      "symptoms",
      "consultation",
      "result",
      "disease",
      "treatment",
      "history",
    ]) {
      await page.goto(base + "#/" + route);
      await page.locator("main h1").waitFor();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      assert.equal(
        overflow,
        false,
        `No horizontal overflow at ${viewport.width}, ${route}`,
      );
    }
    await page.goto(base + "#/daily-pet");
    await page.getByLabel("它是").selectOption("cat");
    await page.getByRole("button", { name: "保存基础档案" }).click();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("pet-society-demo-v1:pet")).species), "dog");
    await page.goto(base + "#/daily-pet");
    await page.getByRole("link", { name: /修改问诊演示资料/ }).click();
    assert.equal(await page.getByLabel("品种").inputValue(), "");
    assert.equal(await page.getByLabel("它是").inputValue(), "cat");
    await page.goto(base + "#/history");
    await page.getByRole("button", { name: "删除豆豆的记录" }).click();
    assert.equal(await page.locator(".history-item").count(), 0);
    await page.getByRole("button", { name: "删除本机演示资料与记录" }).click();
    await page.goto(base + "#/daily-pet");
    assert.equal(await page.getByLabel("宠物昵称").inputValue(), "");
    await page.goto(base + "#/pet");
    assert.equal(await page.getByLabel("宠物昵称").inputValue(), "");
    await page.evaluate(() => {
      localStorage.setItem(
        "pet-society-demo-v1:history",
        JSON.stringify([null, {}, { id: "bad" }]),
      );
      localStorage.setItem(
        "pet-society-demo-v1:draft",
        JSON.stringify({ step: 999, answers: [] }),
      );
      localStorage.setItem("pet-society-demo-v1:pet", "null");
    });
    await page.reload();
    await page.getByRole("heading", { name: "认识一下它" }).waitFor();
    await page.evaluate(() =>
      localStorage.setItem(
        "pet-society-demo-v1:pet",
        JSON.stringify({ name: { toString: null } }),
      ),
    );
    await page.goto(base);
    await page.reload();
    await page
      .getByRole("heading", { name: /照顾它的每一天/ })
      .waitFor({ timeout: 3000 });
    for (const route of ["__proto__", "toString"]) {
      await page.goto(base + "#/" + route);
      await page
        .locator("h1")
        .filter({ hasText: "这一页走丢了" })
        .waitFor({ timeout: 3000 });
    }
    await page.evaluate(() => {
      localStorage.setItem(
        "pet-society-demo-v1:pet",
        JSON.stringify({
          name: "豆豆",
          species: "dog",
          breed: "不清楚",
          age: "2岁",
          sex: "unknown",
          weight: "不清楚",
        }),
      );
      localStorage.setItem(
        "pet-society-demo-v1:draft",
        JSON.stringify({
          symptomId: "vomiting",
          answers: [null, null, "不清楚"],
          step: 2,
        }),
      );
    });
    await page.goto(base + "#/consultation");
    await page.reload();
    await page
      .locator("h1")
      .filter({ hasText: "先选择一个观察入口" })
      .waitFor({ timeout: 3000 });
    await context.close();
    console.log(
      `PASS: ${viewport.width}px, 12 routes, full flow, refresh, history, deletion, corrupted storage`,
    );
  }
  const blocked = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await blocked.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    }),
  );
  const page = await blocked.newPage();
  page.on("pageerror", (err) => failures.push(err.message));
  await page.goto(base);
  await page.locator(".storage-warning").waitFor();
  await blocked.close();
  assert.deepEqual(failures, []);
  console.log(
    "PASS: unavailable storage fallback; no browser errors or missing resources",
  );
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
