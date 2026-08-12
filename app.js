const STORAGE_KEY = "work-dashboard-tasks";

const STATUS_LABELS = { todo: "할 일", progress: "진행중", done: "완료" };
const PRIORITY_LABELS = { high: "높음", medium: "보통", low: "낮음" };

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedTasks();
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function seedTasks() {
  const today = new Date();
  const inDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const seed = [
    {
      id: crypto.randomUUID(),
      title: "대시보드 초안 기획",
      assignee: "김지은",
      description: "업무 공유 대시보드 요구사항 정리",
      status: "done",
      priority: "medium",
      due: inDays(-2),
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      title: "API 명세 작성",
      assignee: "박서준",
      description: "",
      status: "progress",
      priority: "high",
      due: inDays(3),
      createdAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      title: "디자인 리뷰 준비",
      assignee: "이하늘",
      description: "",
      status: "todo",
      priority: "low",
      due: inDays(7),
      createdAt: Date.now(),
    },
  ];
  saveTasks(seed);
  return seed;
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks();
let filters = { search: "", assignee: "", priority: "" };
let editingId = null;

const listEls = {
  todo: document.getElementById("list-todo"),
  progress: document.getElementById("list-progress"),
  done: document.getElementById("list-done"),
};

function isOverdue(task) {
  if (!task.due || task.status === "done") return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.due < today;
}

function applyFilters(list) {
  return list.filter((t) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${t.title} ${t.assignee} ${t.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.assignee && t.assignee !== filters.assignee) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });
}

function render() {
  const filtered = applyFilters(tasks);

  Object.values(listEls).forEach((el) => (el.innerHTML = ""));

  ["todo", "progress", "done"].forEach((status) => {
    const items = filtered.filter((t) => t.status === status);
    document.getElementById(`count-${status}`).textContent = items.length;
    if (items.length === 0) {
      const hint = document.createElement("div");
      hint.className = "empty-hint";
      hint.textContent = "업무가 없습니다";
      listEls[status].appendChild(hint);
      return;
    }
    items
      .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))
      .forEach((task) => listEls[status].appendChild(renderCard(task)));
  });

  renderStats();
  renderAssigneeOptions();
}

function renderCard(task) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = task.id;

  const overdue = isOverdue(task);
  card.innerHTML = `
    <div class="card-title"></div>
    <div class="card-meta">
      <span class="badge badge-${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
      <span></span>
      <span class="${overdue ? "due-overdue" : ""}"></span>
    </div>
  `;
  card.querySelector(".card-title").textContent = task.title;
  const spans = card.querySelectorAll(".card-meta span");
  spans[1].textContent = task.assignee;
  spans[2].textContent = task.due ? (overdue ? `⚠ ${task.due}` : task.due) : "";

  card.addEventListener("click", () => openModal(task));
  card.addEventListener("dragstart", () => card.classList.add("dragging"));
  card.addEventListener("dragend", () => card.classList.remove("dragging"));

  return card;
}

function renderStats() {
  document.getElementById("stat-total").textContent = tasks.length;
  document.getElementById("stat-todo").textContent = tasks.filter((t) => t.status === "todo").length;
  document.getElementById("stat-progress").textContent = tasks.filter((t) => t.status === "progress").length;
  document.getElementById("stat-done").textContent = tasks.filter((t) => t.status === "done").length;
  document.getElementById("stat-overdue").textContent = tasks.filter(isOverdue).length;
}

function renderAssigneeOptions() {
  const select = document.getElementById("assignee-filter");
  const current = select.value;
  const assignees = [...new Set(tasks.map((t) => t.assignee))].sort();
  select.innerHTML = '<option value="">전체 담당자</option>';
  assignees.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  select.value = assignees.includes(current) ? current : "";
}

function setupDragAndDrop() {
  Object.entries(listEls).forEach(([status, el]) => {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".card.dragging");
      if (!dragging) return;
      const id = dragging.dataset.id;
      const task = tasks.find((t) => t.id === id);
      if (task && task.status !== status) {
        task.status = status;
        saveTasks(tasks);
        render();
      }
    });
  });
}

function openModal(task) {
  editingId = task ? task.id : null;
  document.getElementById("modal-title").textContent = task ? "업무 수정" : "새 업무";
  document.getElementById("task-id").value = task ? task.id : "";
  document.getElementById("task-title").value = task ? task.title : "";
  document.getElementById("task-assignee").value = task ? task.assignee : "";
  document.getElementById("task-description").value = task ? task.description || "" : "";
  document.getElementById("task-status").value = task ? task.status : "todo";
  document.getElementById("task-priority").value = task ? task.priority : "medium";
  document.getElementById("task-due").value = task ? task.due || "" : "";
  document.getElementById("delete-task-btn").classList.toggle("hidden", !task);
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("task-title").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("task-form").reset();
  editingId = null;
}

function handleSubmit(e) {
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
    const task = tasks.find((t) => t.id === editingId);
    Object.assign(task, data);
  } else {
    tasks.push({ id: crypto.randomUUID(), createdAt: Date.now(), ...data });
  }
  saveTasks(tasks);
  closeModal();
  render();
}

function handleDelete() {
  if (!editingId) return;
  tasks = tasks.filter((t) => t.id !== editingId);
  saveTasks(tasks);
  closeModal();
  render();
}

document.getElementById("add-task-btn").addEventListener("click", () => openModal(null));
document.getElementById("cancel-btn").addEventListener("click", closeModal);
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target.id === "modal-overlay") closeModal();
});
document.getElementById("task-form").addEventListener("submit", handleSubmit);
document.getElementById("delete-task-btn").addEventListener("click", handleDelete);

document.getElementById("search-input").addEventListener("input", (e) => {
  filters.search = e.target.value;
  render();
});
document.getElementById("assignee-filter").addEventListener("change", (e) => {
  filters.assignee = e.target.value;
  render();
});
document.getElementById("priority-filter").addEventListener("change", (e) => {
  filters.priority = e.target.value;
  render();
});

setupDragAndDrop();
render();
