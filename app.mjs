import {
  symptoms,
  questions,
  validatePet,
  createRecord,
  saveRecord,
  createStore,
} from "./model.mjs";

const app = document.querySelector("#app");
let storage;
try {
  storage = localStorage;
} catch {
  /* blocked storage uses memory */
}
const store = createStore(storage);
const e = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const petRead = store.read("pet", {});
let pet =
  petRead && typeof petRead === "object" && !Array.isArray(petRead)
    ? petRead
    : {};
const historyRead = store.read("history", []);
let history = Array.isArray(historyRead) ? historyRead.filter(isRecord) : [];
let draft = store.read("draft", null);
if (!validDraft(draft)) draft = null;
let current = store.read("current", null);
if (!isRecord(current)) current = null;
let toastTimer;
function isRecord(r) {
  return (
    r &&
    typeof r.id === "string" &&
    typeof r.date === "string" &&
    !Number.isNaN(Date.parse(r.date)) &&
    r.demo === true &&
    r.pet &&
    validatePet(r.pet).length === 0 &&
    symptoms.some((s) => s.id === r.symptomId) &&
    Array.isArray(r.answers) &&
    r.answers.length === questions.length &&
    r.answers.every(
      (a, i) =>
        a &&
        a.question === questions[i].title &&
        questions[i].options.includes(a.value),
    )
  );
}
function validDraft(d) {
  return (
    d &&
    symptoms.some((s) => s.id === d.symptomId) &&
    Array.isArray(d.answers) &&
    d.answers.length === questions.length &&
    d.answers.every((a, i) => a === null || questions[i].options.includes(a)) &&
    Number.isInteger(d.step) &&
    d.step >= 0 &&
    d.step < questions.length
  );
}
const speciesName = (value) => (value === "cat" ? "猫咪" : "狗狗");
const symptomName = (id) =>
  symptoms.find((s) => s.id === id)?.name || "观察记录";
const icon = (name) =>
  `<svg viewBox="0 0 32 32" aria-hidden="true">${name === "wave" ? '<path d="M4 12c4-8 8 8 12 0s8 8 12 0M4 21c4-8 8 8 12 0s8 8 12 0"/>' : name === "drop" ? '<path d="M16 4s-9 11-9 17a9 9 0 0 0 18 0c0-6-9-17-9-17Z"/><path d="M11 21c0 3 2 5 5 5"/>' : '<path d="M26 5C9 3 3 11 8 21s20 4 18-16Z"/><path d="m5 28 15-16M11 22v-8m0 8h8"/>'}</svg>`;
const illustration = `<div class="illustration"><span class="float-label">♡ 每一点变化，都值得被看见</span><svg viewBox="0 0 520 385" role="img" aria-label="一只狗狗和猫咪依偎在绿色庭院里的插画"><defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#d9e4d2" stroke-width=".5"/></pattern></defs><path d="M78 289C21 213 75 62 203 51c95-30 229 26 251 122 27 103-74 157-191 155-76 4-146 6-185-39Z" fill="#e4ecdb"/><path d="M78 289C21 213 75 62 203 51c95-30 229 26 251 122 27 103-74 157-191 155-76 4-146 6-185-39Z" fill="url(#grid)"/><circle cx="374" cy="87" r="27" fill="#f5eccb"/><g stroke="#94ac85" fill="none" stroke-width="2"><path d="M99 302c-3-43-16-74-41-102m31 64c-26-3-33-17-34-32 20-1 28 13 34 32Zm-9-26c2-24 14-27 19-29 8 18 0 30-13 38M422 300c4-44 13-72 35-103m-20 62c24-3 31-16 32-30-20-1-27 13-32 30Zm8-28c-4-19-13-24-21-25-5 17 0 29 15 36"/></g><ellipse cx="265" cy="313" rx="144" ry="17" fill="#cddcbf"/><path d="M170 284c-28-1-37-20-28-38" fill="none" stroke="#b88d62" stroke-width="19" stroke-linecap="round"/><path d="M189 199c-21 24-29 71-19 108 13 10 33 11 44 2l9-1c13 12 36 9 45-1 5-38-1-81-18-109Z" fill="#dfbd8e"/><path d="M204 220c-10 30-9 61-2 88h38c7-24 1-63-8-88" fill="#f8e9cf"/><path d="m191 122-26 8c-21 16-34 54-18 68 14 12 30-19 40-29m63-47 23 8c24 20 30 54 15 66-16 10-29-19-37-29" fill="#af8159"/><path d="M175 151c-1-34 79-46 92 0 10 37-4 67-44 70-40 2-55-31-48-70Z" fill="#e5c398"/><ellipse cx="221" cy="187" rx="28" ry="22" fill="#f9e9cf"/><g fill="#3e4636"><ellipse cx="194" cy="163" rx="3.5" ry="5"/><ellipse cx="244" cy="163" rx="3.5" ry="5"/><path d="M214 179c0-5 15-5 15 0 0 5-7 8-7 8s-8-3-8-8Z"/></g><path d="M222 187v7m-8 0q8 8 16 0" fill="none" stroke="#715b41" stroke-width="2" stroke-linecap="round"/><path d="M188 217q33 15 62-1" stroke="#547b58" stroke-width="10" fill="none"/><circle cx="222" cy="225" r="7" fill="#eac679"/><path d="M349 293c40 5 42-29 26-39" fill="none" stroke="#94a38a" stroke-width="16" stroke-linecap="round"/><path d="M298 227c-22 23-29 57-19 79 18 11 61 12 76-2 7-33-4-60-15-78Z" fill="#9eae93"/><path d="M307 247c-5 17-7 41-3 63h27c5-26-3-46-6-63" fill="#edf0de"/><path d="m281 190 3-47 32 23 26-5 23-19 0 47c12 28-4 54-40 57-40 0-57-28-44-56Z" fill="#aab99f"/><path d="m289 167 2-14 16 16m42-1 10-15v16" fill="none" stroke="#d8c4b4" stroke-width="5" stroke-linecap="round"/><path d="M307 191q5-6 10 0m23 0q5-6 10 0" fill="none" stroke="#44533f" stroke-width="2.5" stroke-linecap="round"/><path d="m324 205 7 0-3 5Z" fill="#9e7e71"/><path d="M328 210q-3 7-9 3m9-3q3 7 9 3" fill="none" stroke="#65705b" stroke-width="1.5"/><path d="m302 209-19-4m19 11-20 3m66-10 20-4m-20 11 20 3" stroke="#7f8f75" stroke-width="1.5" stroke-linecap="round"/><path d="M191 295v16m51-16v16m62-14v13m28-13v13" stroke="#a98b63" stroke-width="1.5"/><g fill="#76956b"><path d="M134 90c0-13 20-13 20 0 0 10-10 17-10 17s-10-7-10-17Z" transform="rotate(-18 144 97) scale(.8)"/><path d="m415 151 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z"/></g><g fill="#bdccad"><circle cx="147" cy="286" r="3"/><circle cx="389" cy="310" r="3"/><circle cx="107" cy="176" r="3"/></g></svg><span class="float-label bottom">慢慢说，我们一起记录 ✧</span></div>`;
function toast(message) {
  clearTimeout(toastTimer);
  const t = document.querySelector("#toast");
  t.textContent = message;
  t.hidden = false;
  toastTimer = setTimeout(() => (t.hidden = true), 4000);
}
function go(route) {
  if (location.hash === `#/${route}`) render();
  else location.hash = "/" + route;
}
function side() {
  return `<aside class="sidebar"><div class="card"><span class="eyebrow">A LITTLE MORE CARE</span><h3>它不会说，<br>但你能看见。</h3><p>从日常的小变化开始，把观察到的事情慢慢整理清楚。</p><div class="side-line"><b>1</b><span>认识它，填写基本资料</span></div><div class="side-line"><b>2</b><span>选症状，记录你的观察</span></div><div class="side-line"><b>3</b><span>看摘要，保存这次记录</span></div></div><p class="section-caption">本次为界面演示，不进行真实诊断。<br>AI 尚未接入，资料只保存在当前浏览器。</p></aside>`;
}
function heading(title, subtitle, back = "", badge = true) {
  return `<a class="back" href="#/${back}">← ${back ? "返回上一步" : "回到首页"}</a><div class="page-heading">${badge ? '<span class="badge">交互演示 · 非真实问诊</span>' : ""}<h1>${title}</h1><p>${subtitle}</p></div>`;
}
function shell(content, sidebar = true) {
  return sidebar
    ? `<div class="layout"><div>${content}</div>${side()}</div>`
    : content;
}
function symptomCards() {
  return symptoms
    .map(
      (s) =>
        `<button class="symptom-card" data-symptom="${s.id}"><span class="icon-tile">${icon(s.icon)}</span><span><h3>${s.name}</h3><p>${s.description}</p></span><span class="arrow">↗</span></button>`,
    )
    .join("");
}
function home() {
  return `<div class="home"><section class="hero"><div class="hero-copy"><div class="eyebrow">为每一个毛孩子，多一点在意</div><h1>它的变化，<br><em>一起慢慢说清楚。</em></h1><p>有些不舒服，藏在日常的小变化里。<br>从你观察到的情况开始，一步步记录，<br>让每一份关心，都更有方向。</p><div class="hero-actions"><a class="primary" href="#/symptoms">开始记录 <span>↗</span></a><button class="outline" data-action="ai">✧ 告诉 AI <span class="muted">· 即将开放</span></button></div><div class="tiny-note"><span>◉</span> 网页体验版 · 可体验完整流程，结果为演示内容</div></div>${illustration}</section><section><div class="section-heading"><h2>今天，它哪里不太对劲？</h2><span>从一个小小的观察开始</span></div><div class="symptom-grid">${symptomCards()}</div></section><section class="home-bottom"><div class="pet-card"><span class="icon-tile">♡</span><div><h3>${pet.name ? `${e(pet.name)}的小档案` : "先认识一下你的小伙伴"}</h3><p>${pet.name ? `${speciesName(pet.species)} · ${e(pet.breed)} · ${e(pet.age)}` : "记下它的基本信息，让每次记录更完整。"}</p></div><a class="text-link" href="#/pet">${pet.name ? "查看资料" : "建立档案"} ↗</a></div><div class="principles"><div><span>⌁</span>先记录观察，再慢慢了解每一点变化</div><div><span>♧</span>资料仅存当前浏览器，你可以随时删除</div><div><span>✧</span>AI 还在准备，先把使用体验做好</div></div></section></div>`;
}
function inputField(key, label, placeholder, required = true) {
  return `<div class="field"><label for="${key}">${label}${required ? ' <span class="muted">*</span>' : ""}</label><input id="${key}" name="${key}" value="${e(pet[key])}" placeholder="${placeholder}" maxlength="100" ${required ? "required" : ""}>${key === "weight" ? "<small>填写 kg 数值，或明确填写“不清楚”</small>" : ""}</div>`;
}
function selectField(key, label, items, required = true) {
  return `<div class="field"><label for="${key}">${label}${required ? ' <span class="muted">*</span>' : ""}</label><select id="${key}" name="${key}" ${required ? "required" : ""}><option value="">请选择</option>${items.map(([value, text]) => `<option value="${value}" ${pet[key] === value ? "selected" : ""}>${text}</option>`).join("")}</select></div>`;
}
function petPage() {
  const next = new URLSearchParams(location.hash.split("?")[1] || "").get(
    "next",
  );
  return `<div class="page">${heading("认识一下它", "留下一份小档案，让每次记录都有熟悉的起点。", "", false)}${shell(
    `<form id="pet-form" data-next="${next === "symptoms" ? "symptoms" : ""}"><div class="card"><h2>01 <span class="muted">/</span> 基本资料</h2><p>带 * 的项目必填。年龄、品种和体重不知道时，可以填写“不清楚”。</p><div class="fields">${inputField("name", "宠物昵称", "怎么称呼它？")}${selectField(
      "species",
      "它是",
      [
        ["dog", "狗狗"],
        ["cat", "猫咪"],
      ],
    )}${inputField("breed", "品种", "例如：中华田园犬")}${inputField("age", "年龄", "例如：2 岁")}${selectField(
      "sex",
      "性别",
      [
        ["male", "男孩子"],
        ["female", "女孩子"],
        ["unknown", "不清楚"],
      ],
    )}${inputField("weight", "体重", "例如：5.2")}${selectField(
      "neutered",
      "是否绝育",
      [
        ["yes", "已绝育"],
        ["no", "未绝育"],
        ["unknown", "不清楚"],
      ],
      false,
    )}${inputField("housing", "生活环境", "例如：室内饲养", false)}</div></div><div class="card"><h2>02 <span class="muted">/</span> 日常照护 <span class="badge">选填</span></h2><div class="fields">${inputField("vaccination", "疫苗记录", "例如：接种时间，或不清楚", false)}${inputField("deworming", "驱虫记录", "例如：最近一次驱虫时间", false)}${inputField("origin", "它从哪里来", "例如：领养、自家出生", false)}<div class="field full"><label for="notes">想补充的事情</label><textarea id="notes" name="notes" maxlength="500" placeholder="记下一些它的小习惯…">${e(pet.notes)}</textarea></div></div><p id="form-error" class="field-error" role="alert"></p><div class="actions"><button class="primary" type="submit">${next ? "保存资料，继续 →" : "保存小档案 →"}</button><a class="text-link" href="#/">暂时返回首页</a></div></div></form>`,
  )}</div>`;
}
function symptomsPage() {
  return `<div class="page">${heading("你看到了什么？", "选择最接近的描述，我们一起把这次观察整理下来。")}${shell(`<div class="card"><div class="section-caption">${pet.name ? `${e(pet.name)} · ${speciesName(pet.species)}` : "还没有宠物档案 · 选择后先填写资料"} / 选择本次主要症状</div><div class="symptom-grid">${symptomCards()}</div><div class="notice">这三个入口都用于演示观察记录流程。此版本不运行书籍诊断，也不会根据回答判断疾病。</div></div><div class="card"><h3>想直接描述它的情况？</h3><p>自然语言对话会在接入 AI 后开放。</p><button class="secondary" data-action="ai">✧ 了解 AI 助手</button></div>`)}</div>`;
}
function consultationPage() {
  if (!draft || validatePet(pet).length)
    return emptyPage(
      "先选择一个观察入口",
      "填好宠物资料并选择症状后，就可以体验三轮观察记录。",
      "symptoms",
      "选择症状",
    );
  const q = questions[draft.step];
  return `<div class="page">${heading("一点点，把变化说清楚", `${e(pet.name)} · ${symptomName(draft.symptomId)}观察记录`, "symptoms")}${shell(`<div class="card question-card"><div class="progress-top"><span>观察 ${draft.step + 1} / ${questions.length}</span><span>只需记录你看到的</span></div><div class="progress"><span style="width:${((draft.step + 1) / questions.length) * 100}%"></span></div><h2>${q.title}</h2><p>${q.note} 不确定也没关系。</p><div class="options" role="group" aria-label="${q.title}">${q.options.map((option) => `<button class="option ${draft.answers[draft.step] === option ? "selected" : ""}" aria-pressed="${draft.answers[draft.step] === option}" data-answer="${option}">${option}</button>`).join("")}</div><div class="actions">${draft.step ? '<button class="outline" data-action="previous">← 上一题</button>' : ""}<button class="primary" data-action="next" ${draft.answers[draft.step] === null ? "disabled" : ""}>${draft.step === questions.length - 1 ? "查看观察摘要" : "下一步"} →</button></div></div><div class="notice">演示流程只整理观察，不做疾病判断。“不清楚”会原样记录，不会被当成“没有”。</div>`)}</div>`;
}
function emptyPage(title, text, target = "symptoms", label = "开始记录") {
  return `<div class="page">${heading(title, text)}<div class="card empty"><span class="icon-tile">♧</span><h2>${title}</h2><p>${text}</p><a class="primary" href="#/${target}">${label} →</a></div></div>`;
}
function recordFromRoute() {
  const id = new URLSearchParams(location.hash.split("?")[1] || "").get("id");
  return id ? history.find((r) => r.id === id) : current;
}
function resultPage() {
  const r = recordFromRoute();
  if (!r)
    return emptyPage(
      "还没有这次记录",
      "先完成三轮观察，就能在这里看到整理好的摘要。",
    );
  const saved = history.some((h) => h.id === r.id);
  return `<div class="page">${heading("把线索，整理在一起", "这是一份观察摘要，方便你回看刚才的记录。", "history")}${shell(`<div class="card"><div class="section-heading" style="margin-top:0"><h2>${e(r.pet.name)}的观察摘要</h2><span class="badge">演示记录</span></div><div class="summary"><div><small>本次观察</small>${symptomName(r.symptomId)}</div><div><small>小伙伴</small>${speciesName(r.pet.species)} · ${e(r.pet.age)}</div><div><small>记录时间</small>${formatDate(r.date)}</div></div>${r.answers.map((a) => `<div class="observation"><span>${e(a.question)}</span><strong>${e(a.value)}</strong></div>`).join("")}<div class="actions"><button class="primary" data-action="save" ${saved ? "disabled" : ""}>${saved ? "✓ 已保存到历史" : "保存这次记录"}</button><a class="outline" href="#/symptoms">再记一次</a></div></div><div class="card"><h2>接下来，页面会呈现什么？</h2><p>以下入口用于查看详情页的设计。当前没有实际疾病判断、书籍检索或治疗结果。</p><a class="detail-link" href="#/disease${location.hash.includes("?") ? "?" + location.hash.split("?")[1] : ""}"><div><h3>疾病详情 <span class="badge">示例布局</span></h3><p>了解可能方向、判断依据和书籍出处如何展示</p></div><span>↗</span></a><a class="detail-link" href="#/treatment${location.hash.includes("?") ? "?" + location.hash.split("?")[1] : ""}"><div><h3>治疗详情 <span class="badge">示例布局</span></h3><p>查看原文、核对状态和方案字段的页面结构</p></div><span>↗</span></a></div><div class="notice">AI 尚未接入。这份摘要由你选择的答案直接整理，不包含诊断或治疗建议。</div>`)}</div>`;
}
function detailPage(treatment = false) {
  const title = treatment ? "治疗详情" : "疾病详情";
  const back =
    "result" +
    (location.hash.includes("?") ? "?" + location.hash.split("?")[1] : "");
  const fields = treatment
    ? ["原书治疗方案", "药物与剂量字段", "原文出处与核对状态"]
    : ["疾病名称与概述", "相关症状与判断依据", "鉴别方向与书籍出处"];
  return `<div class="page">${heading(title, "这里展示详情页的结构，实际内容将在连接后端并核对来源后显示。", back)}${shell(`<div class="card"><div class="section-heading" style="margin-top:0"><h2>${treatment ? "原书治疗方案" : "书籍中的可能方向"}</h2><span class="badge">仅布局演示</span></div><p>尚未加载真实${treatment ? "治疗" : "疾病"}资料。下方为字段占位，不代表本次观察的结论。</p>${fields.map((field, i) => `<section class="detail-placeholder"><strong>0${i + 1} / ${field}</strong><div class="placeholder-line" aria-hidden="true"></div><div class="placeholder-line short" aria-hidden="true"></div><p class="muted">尚未接入 · 无实际${treatment ? "方案" : "资料"}</p></section>`).join("")}<div class="notice">${treatment ? "本演示不提供药品名称、剂量或用药指导。" : "本演示不生成疾病候选，也不虚构原书内容或来源页码。"}</div><div class="actions"><a class="primary" href="#/${back}">返回观察摘要</a><a class="text-link" href="#/${treatment ? "disease" : "treatment"}${location.hash.includes("?") ? "?" + location.hash.split("?")[1] : ""}">看看${treatment ? "疾病" : "治疗"}详情 →</a></div></div>`)}</div>`;
}
function formatDate(date) {
  return e(
    new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(date)),
  );
}
function historyPage() {
  return `<div class="page">${heading("每一次在意，都有迹可循", "保存你的小观察，慢慢了解它的日常。记录仅保存在当前浏览器。", "", false)}${shell(`${history.length ? `<div class="section-heading"><span>共 ${history.length} 条演示记录 · 最多保留最近 50 条</span><button class="danger" data-action="clear-history">清空记录</button></div>${history.map((r) => `<article class="history-item"><div><h3>${e(r.pet.name)} · ${symptomName(r.symptomId)}观察</h3><p>${formatDate(r.date)} <span class="badge">演示</span></p></div><div class="actions"><a class="text-link" href="#/result?id=${encodeURIComponent(r.id)}">查看摘要 →</a><button class="danger" data-delete="${e(r.id)}" aria-label="删除${e(r.pet.name)}的记录">删除</button></div></article>`).join("")}` : `<div class="card empty"><span class="icon-tile">⌁</span><h2>故事，从第一次记录开始</h2><p>现在还没有保存的观察。完成一次演示流程，再把摘要保存在这里。</p><a class="primary" href="#/symptoms">开始第一次记录 →</a></div>`}<div class="card"><h3>你的资料，由你管理</h3><p>此版本不登录、不上传资料。更换浏览器或设备，不会同步这些记录。</p><button class="danger" data-action="clear-all">删除本机演示资料与记录</button></div>`)}</div>`;
}
function render() {
  const route = location.hash.replace(/^#\/?/, "").split("?")[0];
  const pages = {
    "": home,
    pet: petPage,
    symptoms: symptomsPage,
    consultation: consultationPage,
    result: resultPage,
    disease: () => detailPage(false),
    treatment: () => detailPage(true),
    history: historyPage,
  };
  app.innerHTML = (
    pages[route] ||
    (() => emptyPage("这一页走丢了", "回到首页，重新开始吧。", "", "回到首页"))
  )();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const active =
      a.dataset.nav ===
      (route === ""
        ? "home"
        : [
              "symptoms",
              "consultation",
              "result",
              "disease",
              "treatment",
            ].includes(route)
          ? "symptoms"
          : route);
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (!store.persistent)
    app.insertAdjacentHTML(
      "afterbegin",
      '<div class="notice storage-warning">浏览器暂时无法保存资料，本次记录只在当前页面会话中保留。</div>',
    );
  document.title = `${{ "": "首页", pet: "宠物档案", symptoms: "选择症状", consultation: "观察记录", result: "观察摘要", disease: "疾病详情", treatment: "治疗详情", history: "历史记录" }[route] || "页面未找到"} · 宠物社体验版`;
}
function persistDraft() {
  store.write("draft", draft);
}
function start(symptomId) {
  draft = { symptomId, answers: questions.map(() => null), step: 0 };
  persistDraft();
  if (validatePet(pet).length) go("pet?next=symptoms");
  else go("consultation");
}
function openAI() {
  document.querySelector("#ai-dialog").showModal();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.symptom) {
    start(button.dataset.symptom);
    return;
  }
  if (button.dataset.answer && draft) {
    draft.answers[draft.step] = button.dataset.answer;
    persistDraft();
    render();
    app.querySelector(`[data-answer="${button.dataset.answer}"]`)?.focus();
    return;
  }
  if (button.dataset.delete) {
    if (confirm("删除这条演示记录？")) {
      history = history.filter((r) => r.id !== button.dataset.delete);
      store.write("history", history);
      if (current?.id === button.dataset.delete) {
        current = null;
        store.write("current", null);
      }
      render();
      toast("已删除这条记录");
    }
    return;
  }
  switch (button.dataset.action) {
    case "ai":
      openAI();
      break;
    case "demo-from-dialog":
      document.querySelector("#ai-dialog").close();
      go("symptoms");
      break;
    case "previous":
      if (draft && draft.step > 0) {
        draft.step--;
        persistDraft();
        render();
      }
      break;
    case "next":
      if (!draft || draft.answers[draft.step] === null) break;
      if (draft.step < questions.length - 1) {
        draft.step++;
        persistDraft();
        render();
        app.querySelector("h2")?.scrollIntoView({ block: "center" });
      } else {
        current = createRecord(pet, draft.symptomId, draft.answers);
        store.write("current", current);
        draft = null;
        persistDraft();
        go("result");
      }
      break;
    case "save": {
      const r = recordFromRoute();
      if (r) {
        history = saveRecord(history, r);
        store.write("history", history);
        render();
        toast(
          store.persistent
            ? "已保存，可以在历史记录里找到它"
            : "已保存在当前会话，关闭页面后将丢失",
        );
      }
      break;
    }
    case "clear-history":
      if (confirm("清空全部演示历史记录？")) {
        history = [];
        current = null;
        store.write("history", []);
        store.write("current", null);
        render();
        toast("历史记录已清空");
      }
      break;
    case "clear-all":
      if (confirm("删除当前浏览器里的宠物资料、草稿和全部演示记录？")) {
        pet = {};
        history = [];
        draft = null;
        current = null;
        for (const [key, value] of Object.entries({
          pet,
          history,
          draft,
          current,
        }))
          store.write(key, value);
        render();
        toast("本机演示资料已删除");
      }
      break;
  }
});
document.addEventListener("submit", (event) => {
  if (event.target.id !== "pet-form") return;
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(
    [...new FormData(form)].map(([k, v]) => [k, String(v).trim()]),
  );
  const invalid = validatePet(values);
  if (invalid.length) {
    document.querySelector("#form-error").textContent =
      "请补全必填资料；体重需填写正数或“不清楚”。";
    document.getElementById(invalid[0])?.focus();
    return;
  }
  pet = values;
  store.write("pet", pet);
  go(form.dataset.next ? (draft ? "consultation" : "symptoms") : "");
  toast(
    store.persistent ? "小档案已保存" : "已保存到当前会话；浏览器无法持久保存",
  );
});
document
  .querySelector("#ai-dialog .close")
  .addEventListener("click", () =>
    document.querySelector("#ai-dialog").close(),
  );
document.querySelector("#ai-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      event.currentTarget.close();
  }
});
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
});
render();
