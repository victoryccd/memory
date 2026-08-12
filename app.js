/* ================= 저장소 ================= */
const KEYS = {
  tasks: "work-dashboard-tasks",
  projects: "wd-projects",
  pipeline: "wd-pipeline",
  personas: "wd-personas",
  activity: "wd-activity",
};

function load(key, seedFn) {
  const raw = localStorage.getItem(key);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* 손상된 데이터는 시드로 대체 */ }
  }
  const seed = seedFn();
  save(key, seed);
  return seed;
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const uid = () => crypto.randomUUID();

function inDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const todayStr = () => new Date().toISOString().slice(0, 10);

/* ================= 시드 데이터 ================= */
function seedTasks() {
  return [
    { id: uid(), title: "로켓그로스 2차 입고 수량 확정", assignee: "대표", description: "판매 속도 보고 SKU별 수량 결정", status: "progress", priority: "high", due: inDays(1), createdAt: Date.now() },
    { id: uid(), title: "리뷰 의뢰 리스트 정리", assignee: "직원", description: "이번 주 의뢰 대상 상품 목록 취합", status: "progress", priority: "medium", due: inDays(0), createdAt: Date.now() },
    { id: uid(), title: "블로그 초안 2건 검수", assignee: "직원", description: "검수 후 직접 업로드", status: "todo", priority: "medium", due: inDays(2), createdAt: Date.now() },
    { id: uid(), title: "신상품 소싱 후보 비교표 작성", assignee: "대표", description: "", status: "todo", priority: "low", due: inDays(5), createdAt: Date.now() },
    { id: uid(), title: "쓰레드 예약 발행 세팅 확인", assignee: "직원", description: "", status: "done", priority: "medium", due: inDays(-1), createdAt: Date.now() },
  ];
}

function seedProjects() {
  return [
    { id: uid(), name: "로켓그로스 입고 진행", cat: "로켓그로스", owner: "대표", progress: 65, status: "progress" },
    { id: uid(), name: "신상품 소싱 검토", cat: "상품 관리", owner: "대표", progress: 40, status: "progress" },
    { id: uid(), name: "리뷰 의뢰 캠페인", cat: "마케팅", owner: "직원", progress: 80, status: "progress" },
    { id: uid(), name: "블로그 주간 발행 (3/5)", cat: "콘텐츠", owner: "직원", progress: 60, status: "progress" },
    { id: uid(), name: "쓰레드 예약 발행 자동화", cat: "콘텐츠", owner: "대표", progress: 20, status: "wait" },
  ];
}

function seedPipeline() {
  return [
    { id: "blog", icon: "✍️", name: "블로그", view: "blog", stages: { "초안": 2, "검수": 1, "발행대기": 1 } },
    { id: "reels", icon: "🎬", name: "릴스", view: "reels", stages: { "기획": 1, "편집": 1 } },
    { id: "shorts", icon: "📱", name: "쇼츠", view: "shorts", stages: { "아이디어": 3, "편집": 1 } },
    { id: "threads", icon: "🧵", name: "쓰레드", view: "threads", stages: { "작성": 2, "예약": 2 } },
  ];
}

function seedPersonas() {
  return [
    { id: uid(), emoji: "🧑‍🏫", name: "전문가형", desc: "데이터와 근거 중심. 신뢰감 있는 존댓말로 결론부터 제시합니다.", sample: "결론부터 말씀드리면, 이 방법이 비용 대비 효율이 가장 높습니다. 그 이유는 세 가지입니다.", builtin: true },
    { id: uid(), emoji: "🎯", name: "직설형", desc: "군더더기 없는 단문. 핵심만 빠르게 짚고 넘어갑니다.", sample: "이거 하나만 기억하세요. 나머지는 전부 부차적인 문제입니다.", builtin: true },
    { id: uid(), emoji: "🏡", name: "친근한 이웃형", desc: "편안한 구어체와 공감 위주. 옆집 사람이 알려주는 듯한 말투입니다.", sample: "저도 처음엔 진짜 막막했거든요. 근데 이 순서대로 하니까 되더라고요.", builtin: true },
    { id: uid(), emoji: "📖", name: "스토리텔러형", desc: "경험담으로 시작해 자연스럽게 정보로 연결합니다.", sample: "3년 전 첫 상품이 반품 폭탄을 맞았을 때, 저는 이 사실을 몰랐습니다.", builtin: true },
  ];
}

function seedActivity() {
  return [
    { id: uid(), who: "직원", text: "리뷰 의뢰 리스트 정리 업무를 시작했습니다", time: Date.now() - 1000 * 60 * 40 },
    { id: uid(), who: "대표", text: "로켓그로스 2차 입고 업무를 등록했습니다", time: Date.now() - 1000 * 60 * 60 * 3 },
    { id: uid(), who: "직원", text: "쓰레드 예약 발행 세팅 확인을 완료했습니다", time: Date.now() - 1000 * 60 * 60 * 5 },
  ];
}

/* ================= 상태 ================= */
let tasks = load(KEYS.tasks, seedTasks);
let projects = load(KEYS.projects, seedProjects);
let pipeline = load(KEYS.pipeline, seedPipeline);
let personas = load(KEYS.personas, seedPersonas);
let activity = load(KEYS.activity, seedActivity);

let boardFilters = { search: "", assignee: "", priority: "" };
let editingId = null;

const STATUS_LABELS = { todo: "할 일", progress: "진행중", done: "완료" };
const PRIORITY_LABELS = { high: "높음", medium: "보통", low: "낮음" };

function logActivity(who, text) {
  activity.unshift({ id: uid(), who, text, time: Date.now() });
  activity = activity.slice(0, 30);
  save(KEYS.activity, activity);
}

function isOverdue(t) {
  return t.due && t.status !== "done" && t.due < todayStr();
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* ================= 라우터 ================= */
const VIEW_TITLES = {
  home: "홈", board: "업무 보드", rocket: "로켓그로스", products: "상품 관리",
  marketing: "마케팅 · 리뷰", blog: "블로그 글쓰기", reels: "릴스", shorts: "쇼츠",
  threads: "쓰레드", personas: "페르소나", settings: "설정",
};

function currentView() {
  const v = location.hash.replace("#", "");
  return VIEW_TITLES[v] ? v : "home";
}

function navigate() {
  const view = currentView();
  document.getElementById("page-title").textContent = VIEW_TITLES[view];
  document.querySelectorAll(".nav-item").forEach((a) => {
    a.classList.toggle("active", a.dataset.view === view);
  });
  closeSidebar();

  const root = document.getElementById("view");
  root.innerHTML = "";
  if (view === "home") renderHome(root);
  else if (view === "board") renderBoard(root);
  else if (view === "personas") renderPersonas(root);
  else renderPlaceholder(root, view);

  document.getElementById("nav-badge-board").textContent =
    tasks.filter((t) => t.status !== "done").length || "";
}

window.addEventListener("hashchange", navigate);

/* ================= 홈 ================= */
function renderHome(root) {
  const hello = el("div", "hello");
  const hour = new Date().getHours();
  const greet = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : "수고 많으셨어요";
  hello.appendChild(el("h2", null, `${greet} 👋`));
  const doing = tasks.filter((t) => t.status === "progress").length;
  const dueToday = tasks.filter((t) => t.due === todayStr() && t.status !== "done").length;
  hello.appendChild(el("p", null, `진행중인 업무 ${doing}건, 오늘 마감 ${dueToday}건이 있어요.`));
  root.appendChild(hello);

  /* KPI */
  const overdue = tasks.filter(isOverdue).length;
  const done = tasks.filter((t) => t.status === "done").length;
  const scheduled = pipeline.reduce((sum, p) => sum + (p.stages["예약"] || 0) + (p.stages["발행대기"] || 0), 0);

  const kpis = el("div", "kpis");
  const kpiData = [
    { label: "진행중 업무", value: doing, view: "board" },
    { label: "오늘 마감", value: dueToday, view: "board" },
    { label: "기한 초과", value: overdue, warn: overdue > 0, view: "board" },
    { label: "발행 대기 콘텐츠", value: scheduled },
    { label: "완료", value: done, view: "board" },
  ];
  kpiData.forEach((k) => {
    const tile = el("div", "kpi" + (k.warn ? " kpi-warn" : "") + (k.view ? " clickable" : ""));
    tile.appendChild(el("div", "kpi-label", k.label));
    const v = el("div", "kpi-value", String(k.value));
    v.appendChild(el("span", "kpi-unit", "건"));
    tile.appendChild(v);
    if (k.view) tile.addEventListener("click", () => (location.hash = k.view));
    kpis.appendChild(tile);
  });
  root.appendChild(kpis);

  /* 2단 그리드 */
  const grid = el("div", "grid");
  const colL = el("div", "grid-col");
  const colR = el("div", "grid-col");
  grid.append(colL, colR);
  root.appendChild(grid);

  /* — 프로젝트 진행 현황 — */
  const projCard = el("div", "card");
  projCard.appendChild(cardHead("프로젝트 진행 현황"));
  const statusChip = { progress: ["chip chip-progress", "진행중"], wait: ["chip chip-wait", "대기"], done: ["chip chip-done", "완료"], late: ["chip chip-late", "지연"] };
  projects.forEach((p) => {
    const row = el("div", "proj");
    const top = el("div", "proj-top");
    top.appendChild(el("span", "proj-name", p.name));
    top.appendChild(el("span", "proj-cat", `${p.cat} · ${p.owner}`));
    const [cls, label] = statusChip[p.status] || statusChip.progress;
    top.appendChild(el("span", cls, label));
    row.appendChild(top);
    const barRow = el("div", "proj-bar-row");
    const meter = el("div", "meter");
    const fill = el("div", "meter-fill");
    fill.style.width = `${p.progress}%`;
    meter.appendChild(fill);
    barRow.appendChild(meter);
    barRow.appendChild(el("span", "proj-pct", `${p.progress}%`));
    row.appendChild(barRow);
    projCard.appendChild(row);
  });
  colL.appendChild(projCard);

  /* — 오늘의 업무 — */
  const todayCard = el("div", "card");
  todayCard.appendChild(cardHead("오늘의 업무", "전체 보기", () => (location.hash = "board")));
  const todays = tasks
    .filter((t) => t.status !== "done" && (isOverdue(t) || t.due === todayStr() || t.status === "progress"))
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))
    .slice(0, 6);
  if (todays.length === 0) {
    todayCard.appendChild(el("div", "empty-hint", "오늘 처리할 업무가 없어요 🎉"));
  }
  todays.forEach((t) => {
    const item = el("div", "today-item");
    const check = el("div", "today-check" + (t.status === "done" ? " done" : ""), t.status === "done" ? "✓" : "");
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      t.status = t.status === "done" ? "todo" : "done";
      save(KEYS.tasks, tasks);
      logActivity(t.assignee, `${t.title} 업무를 ${t.status === "done" ? "완료했습니다" : "다시 열었습니다"}`);
      navigate();
    });
    item.appendChild(check);
    const body = el("div", "today-body");
    body.appendChild(el("div", "today-title" + (t.status === "done" ? " done" : ""), t.title));
    const meta = el("div", "today-meta");
    meta.append(`${t.assignee} · ${PRIORITY_LABELS[t.priority]}`);
    if (t.due) {
      meta.append(" · ");
      const d = el("span", isOverdue(t) ? "overdue" : "", isOverdue(t) ? `기한 초과 (${t.due})` : t.due === todayStr() ? "오늘 마감" : t.due);
      meta.appendChild(d);
    }
    body.appendChild(meta);
    item.appendChild(body);
    item.addEventListener("click", () => openModal(t));
    todayCard.appendChild(item);
  });
  colL.appendChild(todayCard);

  /* — 팀원별 현황 — */
  const teamCard = el("div", "card");
  teamCard.appendChild(cardHead("팀원별 업무 현황"));
  const byMember = {};
  tasks.forEach((t) => {
    byMember[t.assignee] = byMember[t.assignee] || { doing: 0, todo: 0, done: 0 };
    if (t.status === "progress") byMember[t.assignee].doing++;
    else if (t.status === "todo") byMember[t.assignee].todo++;
    else byMember[t.assignee].done++;
  });
  Object.entries(byMember).forEach(([name, c]) => {
    const m = el("div", "member");
    m.appendChild(el("div", "avatar", name.slice(0, 1)));
    const body = el("div", "member-body");
    body.appendChild(el("div", "member-name", name));
    body.appendChild(el("div", "member-load", `진행중 ${c.doing} · 할 일 ${c.todo} · 완료 ${c.done}`));
    m.appendChild(body);
    teamCard.appendChild(m);
  });
  colL.appendChild(teamCard);

  /* — 콘텐츠 파이프라인 — */
  const pipeCard = el("div", "card");
  pipeCard.appendChild(cardHead("콘텐츠 파이프라인"));
  pipeline.forEach((p) => {
    const row = el("div", "pipe");
    row.appendChild(el("div", "pipe-icon", p.icon));
    const body = el("div", "pipe-body");
    body.appendChild(el("div", "pipe-name", p.name));
    body.appendChild(el("div", "pipe-stages", Object.entries(p.stages).map(([k, v]) => `${k} ${v}`).join(" · ")));
    row.appendChild(body);
    const total = Object.values(p.stages).reduce((a, b) => a + b, 0);
    row.appendChild(el("div", "pipe-total", String(total)));
    row.addEventListener("click", () => (location.hash = p.view));
    pipeCard.appendChild(row);
  });
  colR.appendChild(pipeCard);

  /* — 빠른 작업 — */
  const quickCard = el("div", "card");
  quickCard.appendChild(cardHead("빠른 작업"));
  const quick = el("div", "quick-grid");
  [
    ["➕", "새 업무 등록", () => openModal(null)],
    ["✍️", "블로그 글쓰기", () => (location.hash = "blog")],
    ["🧵", "쓰레드 작성", () => (location.hash = "threads")],
    ["🎭", "페르소나 관리", () => (location.hash = "personas")],
  ].forEach(([icon, label, fn]) => {
    const b = el("button", "quick-btn");
    b.append(el("span", null, icon), label);
    b.addEventListener("click", fn);
    quick.appendChild(b);
  });
  quickCard.appendChild(quick);
  colR.appendChild(quickCard);

  /* — 최근 활동 — */
  const feedCard = el("div", "card");
  feedCard.appendChild(cardHead("최근 활동"));
  if (activity.length === 0) feedCard.appendChild(el("div", "empty-hint", "아직 활동이 없어요"));
  activity.slice(0, 8).forEach((a) => {
    const f = el("div", "feed-item");
    f.appendChild(el("span", "feed-dot", "•"));
    const body = el("div", "feed-body");
    const b = el("b", null, a.who);
    body.append(b, ` ${a.text}`);
    f.appendChild(body);
    f.appendChild(el("span", "feed-time", timeAgo(a.time)));
    feedCard.appendChild(f);
  });
  colR.appendChild(feedCard);
}

function cardHead(title, linkText, linkFn) {
  const head = el("div", "card-head");
  head.appendChild(el("h3", null, title));
  if (linkText) {
    const link = el("button", "card-link", linkText);
    link.addEventListener("click", linkFn);
    head.appendChild(link);
  }
  return head;
}

/* ================= 업무 보드 (칸반) ================= */
function renderBoard(root) {
  const filters = el("div", "board-filters");
  const search = el("input");
  search.placeholder = "업무 검색...";
  search.value = boardFilters.search;
  search.addEventListener("input", (e) => { boardFilters.search = e.target.value; drawColumns(); });

  const assigneeSel = el("select");
  const prioritySel = el("select");
  prioritySel.innerHTML = `<option value="">전체 우선순위</option><option value="high">높음</option><option value="medium">보통</option><option value="low">낮음</option>`;
  prioritySel.value = boardFilters.priority;
  prioritySel.addEventListener("change", (e) => { boardFilters.priority = e.target.value; drawColumns(); });
  assigneeSel.addEventListener("change", (e) => { boardFilters.assignee = e.target.value; drawColumns(); });

  filters.append(search, assigneeSel, prioritySel);
  root.appendChild(filters);

  const board = el("div", "board");
  const lists = {};
  ["todo", "progress", "done"].forEach((status) => {
    const col = el("div", "board-column");
    const h = el("h2", null, STATUS_LABELS[status] + " ");
    const cnt = el("span", "count", "0");
    cnt.id = `count-${status}`;
    h.appendChild(cnt);
    col.appendChild(h);
    const list = el("div", "card-list");
    lists[status] = { list, cnt };
    col.appendChild(list);
    board.appendChild(col);

    list.addEventListener("dragover", (e) => e.preventDefault());
    list.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".task-card.dragging");
      if (!dragging) return;
      const task = tasks.find((t) => t.id === dragging.dataset.id);
      if (task && task.status !== status) {
        task.status = status;
        save(KEYS.tasks, tasks);
        logActivity(task.assignee, `${task.title} 상태를 '${STATUS_LABELS[status]}'(으)로 변경했습니다`);
        drawColumns();
      }
    });
  });
  root.appendChild(board);

  function drawColumns() {
    const assignees = [...new Set(tasks.map((t) => t.assignee))].sort();
    const cur = boardFilters.assignee;
    assigneeSel.innerHTML = `<option value="">전체 담당자</option>` + assignees.map((a) => `<option>${a}</option>`).join("");
    assigneeSel.value = assignees.includes(cur) ? cur : "";

    const filtered = tasks.filter((t) => {
      if (boardFilters.search) {
        const q = boardFilters.search.toLowerCase();
        if (!`${t.title} ${t.assignee} ${t.description || ""}`.toLowerCase().includes(q)) return false;
      }
      if (boardFilters.assignee && t.assignee !== boardFilters.assignee) return false;
      if (boardFilters.priority && t.priority !== boardFilters.priority) return false;
      return true;
    });

    ["todo", "progress", "done"].forEach((status) => {
      const { list, cnt } = lists[status];
      list.innerHTML = "";
      const items = filtered
        .filter((t) => t.status === status)
        .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
      cnt.textContent = items.length;
      if (items.length === 0) {
        list.appendChild(el("div", "empty-hint", "업무가 없습니다"));
        return;
      }
      items.forEach((t) => list.appendChild(taskCard(t)));
    });
  }

  drawColumns();
}

function taskCard(t) {
  const card = el("div", "task-card");
  card.draggable = true;
  card.dataset.id = t.id;
  card.appendChild(el("div", "task-card-title", t.title));
  const meta = el("div", "task-card-meta");
  meta.appendChild(el("span", `badge badge-${t.priority}`, PRIORITY_LABELS[t.priority]));
  meta.appendChild(el("span", null, t.assignee));
  meta.appendChild(el("span", "spacer"));
  if (t.due) meta.appendChild(el("span", isOverdue(t) ? "due-overdue" : "", isOverdue(t) ? `⚠ ${t.due}` : t.due));
  card.appendChild(meta);
  card.addEventListener("click", () => openModal(t));
  card.addEventListener("dragstart", () => card.classList.add("dragging"));
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  return card;
}

/* ================= 준비중 페이지 ================= */
const PLACEHOLDERS = {
  rocket: {
    icon: "🚀", title: "로켓그로스",
    desc: "쿠팡 로켓그로스 상품의 입고부터 판매까지 진행 과정을 관리하는 탭입니다.",
    features: ["상품별 입고 요청 · 진행 단계 관리", "재고 현황과 판매 속도 추적", "입고 일정 캘린더", "SKU별 메모와 히스토리"],
  },
  products: {
    icon: "📦", title: "상품 관리",
    desc: "신상품 소싱부터 등록까지 상품 라이프사이클을 관리하는 탭입니다.",
    features: ["소싱 후보 리스트와 비교표", "상품 등록 진행 단계 체크리스트", "옵션 · 가격 관리", "공급처 연락처 기록"],
  },
  marketing: {
    icon: "⭐", title: "마케팅 · 리뷰",
    desc: "리뷰 의뢰와 각종 마케팅 캠페인의 진행 현황을 관리하는 탭입니다.",
    features: ["리뷰 의뢰 진행 현황 (의뢰 → 작성 → 완료)", "체험단 · 인플루언서 일정 관리", "캠페인별 성과 기록", "반복 업무 리마인더"],
  },
  blog: {
    icon: "✍️", title: "블로그 글쓰기",
    desc: "주제를 입력하면 선택한 페르소나의 말투로 초안을 작성해 주는 탭입니다. 업로드는 검수 후 직접 진행합니다.",
    features: ["주제 입력 → 페르소나 선택 → 초안 자동 작성", "초안 목록과 검수 상태 관리 (초안 → 검수 → 발행대기 → 발행완료)", "발행 기록 아카이브"],
    personas: true,
  },
  reels: {
    icon: "🎬", title: "릴스",
    desc: "인스타그램 릴스 기획과 제작 과정을 관리하는 탭입니다.",
    features: ["기획 아이디어 보드", "페르소나 기반 대본 자동 작성", "제작 단계 관리 (기획 → 촬영 → 편집 → 업로드)"],
  },
  shorts: {
    icon: "📱", title: "쇼츠",
    desc: "유튜브 쇼츠 기획과 제작 과정을 관리하는 탭입니다.",
    features: ["아이디어 수집함", "대본 자동 작성", "제작 단계 관리 (아이디어 → 대본 → 편집 → 업로드)"],
  },
  threads: {
    icon: "🧵", title: "쓰레드",
    desc: "쓰레드 글을 페르소나 말투로 작성하고 예약 발행까지 관리하는 탭입니다.",
    features: ["주제 입력 → 페르소나 선택 → 글 자동 작성", "예약 발행 큐 관리", "발행 기록과 반응 메모"],
    personas: true,
  },
  settings: {
    icon: "⚙️", title: "설정",
    desc: "팀원 관리, 데이터 백업, 알림 설정 등을 관리하는 탭입니다.",
    features: ["팀원 추가 · 수정", "데이터 내보내기 / 가져오기 (백업)", "탭 구성 커스터마이즈"],
  },
};

function renderPlaceholder(root, view) {
  const cfg = PLACEHOLDERS[view];
  const box = el("div", "placeholder");
  box.appendChild(el("div", "placeholder-icon", cfg.icon));
  box.appendChild(el("h2", null, cfg.title));
  box.appendChild(el("div", "soon", "준비중"));
  box.appendChild(el("p", null, cfg.desc));
  const ul = el("ul");
  cfg.features.forEach((f) => ul.appendChild(el("li", null, f)));
  box.appendChild(ul);
  if (cfg.personas) {
    const chips = el("div", "persona-chips");
    personas.forEach((p) => chips.appendChild(el("span", "persona-chip", `${p.emoji} ${p.name}`)));
    box.appendChild(chips);
  }
  root.appendChild(box);
}

/* ================= 페르소나 관리 ================= */
function renderPersonas(root) {
  const intro = el("p", null, "글쓰기에 사용할 말투(페르소나)를 관리합니다. 블로그 · 쓰레드 · 릴스 대본 작성 시 여기서 선택한 말투가 적용됩니다.");
  intro.style.color = "var(--text-2)";
  root.appendChild(intro);

  const grid = el("div", "persona-grid");

  personas.forEach((p) => {
    const card = el("div", "persona-card");
    const head = el("div", "persona-head");
    head.appendChild(el("div", "persona-emoji", p.emoji));
    head.appendChild(el("div", "persona-name", p.name));
    const del = el("button", "persona-del", "✕");
    del.title = "삭제";
    del.addEventListener("click", () => {
      if (!confirm(`'${p.name}' 페르소나를 삭제할까요?`)) return;
      personas = personas.filter((x) => x.id !== p.id);
      save(KEYS.personas, personas);
      logActivity("대표", `페르소나 '${p.name}'을(를) 삭제했습니다`);
      navigate();
    });
    head.appendChild(del);
    card.appendChild(head);
    card.appendChild(el("div", "persona-desc", p.desc));
    card.appendChild(el("div", "persona-sample", `"${p.sample}"`));
    if (p.builtin) card.appendChild(el("div", "persona-builtin", "기본 제공"));
    grid.appendChild(card);
  });

  /* 추가 폼 */
  const addBox = el("div", "persona-add");
  addBox.appendChild(el("div", "persona-name", "➕ 새 페르소나 추가"));
  const nameInput = el("input");
  nameInput.placeholder = "이름 (예: 유머형)";
  nameInput.maxLength = 20;
  const descInput = el("textarea");
  descInput.placeholder = "말투 설명 (예: 가벼운 농담을 섞은 캐주얼한 말투)";
  descInput.rows = 2;
  descInput.maxLength = 120;
  const sampleInput = el("textarea");
  sampleInput.placeholder = "예시 문장 (선택)";
  sampleInput.rows = 2;
  sampleInput.maxLength = 150;
  const addBtn = el("button", "btn btn-primary btn-sm", "추가");
  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    if (!name || !desc) { alert("이름과 말투 설명을 입력해 주세요."); return; }
    personas.push({ id: uid(), emoji: "🗣️", name, desc, sample: sampleInput.value.trim() || "예시 문장 없음", builtin: false });
    save(KEYS.personas, personas);
    logActivity("대표", `페르소나 '${name}'을(를) 추가했습니다`);
    navigate();
  });
  addBox.append(nameInput, descInput, sampleInput, addBtn);
  grid.appendChild(addBox);

  root.appendChild(grid);
}

/* ================= 업무 모달 ================= */
function openModal(task) {
  editingId = task ? task.id : null;
  document.getElementById("modal-title").textContent = task ? "업무 수정" : "새 업무";
  document.getElementById("task-title").value = task ? task.title : "";
  document.getElementById("task-assignee").value = task ? task.assignee : "";
  document.getElementById("task-description").value = task ? task.description || "" : "";
  document.getElementById("task-status").value = task ? task.status : "todo";
  document.getElementById("task-priority").value = task ? task.priority : "medium";
  document.getElementById("task-due").value = task ? task.due || "" : "";
  document.getElementById("delete-task-btn").classList.toggle("hidden", !task);

  const dl = document.getElementById("assignee-list");
  dl.innerHTML = [...new Set(tasks.map((t) => t.assignee))].map((a) => `<option value="${a}">`).join("");

  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("task-title").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("task-form").reset();
  editingId = null;
}

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById("task-title").value.trim(),
    assignee: document.getElementById("task-assignee").value.trim(),
    description: document.getElementById("task-description").value.trim(),
    status: document.getElementById("task-status").value,
    priority: document.getElementById("task-priority").value,
    due: document.getElementById("task-due").value,
  };
  if (!data.title || !data.assignee) return;

  if (editingId) {
    Object.assign(tasks.find((t) => t.id === editingId), data);
    logActivity(data.assignee, `${data.title} 업무를 수정했습니다`);
  } else {
    tasks.push({ id: uid(), createdAt: Date.now(), ...data });
    logActivity(data.assignee, `${data.title} 업무를 등록했습니다`);
  }
  save(KEYS.tasks, tasks);
  closeModal();
  navigate();
});

document.getElementById("delete-task-btn").addEventListener("click", () => {
  if (!editingId) return;
  const t = tasks.find((x) => x.id === editingId);
  tasks = tasks.filter((x) => x.id !== editingId);
  save(KEYS.tasks, tasks);
  if (t) logActivity(t.assignee, `${t.title} 업무를 삭제했습니다`);
  closeModal();
  navigate();
});

document.getElementById("add-task-btn").addEventListener("click", () => openModal(null));
document.getElementById("cancel-btn").addEventListener("click", closeModal);
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") closeModal();
});

/* ================= 사이드바 (모바일) ================= */
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-dim").classList.remove("show");
}

document.getElementById("menu-btn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebar-dim").classList.toggle("show");
});

document.getElementById("sidebar-dim").addEventListener("click", closeSidebar);

/* ================= 시작 ================= */
document.getElementById("topbar-date").textContent = new Date().toLocaleDateString("ko-KR", {
  year: "numeric", month: "long", day: "numeric", weekday: "long",
});

navigate();
