const STORAGE_KEY = "weeklyResourcePlanningDrafts";
const DELETED_WEEKS_KEY = "weeklyResourcePlanningDeletedWeeks";
const PROJECT_META_KEY = "weeklyResourcePlanningProjects";
const USERS_KEY = "weeklyResourcePlanningUsers";
const SESSION_KEY = "weeklyResourcePlanningSession";
const MAIL_QUEUE_KEY = "weeklyResourcePlanningMailQueue";
const TEAM_MANAGERS_KEY = "weeklyResourcePlanningTeamManagers";
const ROLES_KEY = "weeklyResourcePlanningRoles";
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_ROLES = ["ABAP", "Functional", "Team Lead", "Project Manager", "CEO"];
const DEFAULT_USERS = [
  {
    id: "admin",
    name: "Planning Admin",
    email: "admin@company.local",
    username: "admin",
    password: "admin123",
    admin: true,
    permissions: { read: true, change: true, delete: true }
  }
];

const state = {
  data: null,
  users: [],
  currentUser: null,
  weekId: "",
  search: "",
  role: "All",
  project: "All",
  view: "grid",
  personSummaryName: "",
  personSummaryPeriod: "week",
  projectReportPeriod: "week",
  projectReportRole: "All",
  projectReportStart: "",
  projectReportEnd: "",
  projectReportProjects: [],
  mailQueue: [],
  teamManagers: {},
  notesOpen: false,
  activeSelection: null,
  planningContext: null
};

const el = {
  weekSelect: document.querySelector("#weekSelect"),
  prevWeekButton: document.querySelector("#prevWeekButton"),
  nextWeekButton: document.querySelector("#nextWeekButton"),
  newWeekButton: document.querySelector("#newWeekButton"),
  clearWeekButton: document.querySelector("#clearWeekButton"),
  searchInput: document.querySelector("#searchInput"),
  roleSelect: document.querySelector("#roleSelect"),
  projectSelect: document.querySelector("#projectSelect"),
  resourceCount: document.querySelector("#resourceCount"),
  resourceMetric: document.querySelector("#resourceMetric"),
  assignmentCount: document.querySelector("#assignmentCount"),
  projectCount: document.querySelector("#projectCount"),
  projectMetric: document.querySelector("#projectMetric"),
  updatedText: document.querySelector("#updatedText"),
  pageTitle: document.querySelector("#pageTitle"),
  planningHead: document.querySelector("#planningHead"),
  planningBody: document.querySelector("#planningBody"),
  gridTab: document.querySelector("#gridTab"),
  summaryTab: document.querySelector("#summaryTab"),
  personSummaryTab: document.querySelector("#personSummaryTab"),
  projectReportTab: document.querySelector("#projectReportTab"),
  orgTab: document.querySelector("#orgTab"),
  gridView: document.querySelector("#gridView"),
  summaryView: document.querySelector("#summaryView"),
  personSummaryView: document.querySelector("#personSummaryView"),
  projectReportView: document.querySelector("#projectReportView"),
  orgView: document.querySelector("#orgView"),
  orgChart: document.querySelector("#orgChart"),
  orgManageButton: document.querySelector("#orgManageButton"),
  orgAddButton: document.querySelector("#orgAddButton"),
  projectBars: document.querySelector("#projectBars"),
  roleBars: document.querySelector("#roleBars"),
  personSummarySelect: document.querySelector("#personSummarySelect"),
  personPeriodSelect: document.querySelector("#personPeriodSelect"),
  personPie: document.querySelector("#personPie"),
  personSummaryMeta: document.querySelector("#personSummaryMeta"),
  personSummaryTitle: document.querySelector("#personSummaryTitle"),
  personSummaryTotal: document.querySelector("#personSummaryTotal"),
  personLegend: document.querySelector("#personLegend"),
  projectReportPeriod: document.querySelector("#projectReportPeriod"),
  projectReportStart: document.querySelector("#projectReportStart"),
  projectReportEnd: document.querySelector("#projectReportEnd"),
  projectReportRole: document.querySelector("#projectReportRole"),
  projectReportProjectToggle: document.querySelector("#projectReportProjectToggle"),
  projectReportProjectMenu: document.querySelector("#projectReportProjectMenu"),
  projectReportProjectSearch: document.querySelector("#projectReportProjectSearch"),
  projectReportSelectAll: document.querySelector("#projectReportSelectAll"),
  projectReportClearProjects: document.querySelector("#projectReportClearProjects"),
  projectReportProjects: document.querySelector("#projectReportProjects"),
  projectReportPie: document.querySelector("#projectReportPie"),
  projectReportMeta: document.querySelector("#projectReportMeta"),
  projectReportTotal: document.querySelector("#projectReportTotal"),
  projectReportLegend: document.querySelector("#projectReportLegend"),
  projectModal: document.querySelector("#projectModal"),
  modalClose: document.querySelector("#modalClose"),
  modalTitle: document.querySelector("#modalTitle"),
  modalMeta: document.querySelector("#modalMeta"),
  modalBody: document.querySelector("#modalBody"),
  loginScreen: document.querySelector("#loginScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  loginIdentity: document.querySelector("#loginIdentity"),
  loginPassword: document.querySelector("#loginPassword"),
  loginMessage: document.querySelector("#loginMessage"),
  forgotPasswordButton: document.querySelector("#forgotPasswordButton"),
  changePasswordButton: document.querySelector("#changePasswordButton"),
  adminTab: document.querySelector("#adminTab"),
  approveWeekButton: document.querySelector("#approveWeekButton"),
  currentUserButton: document.querySelector("#currentUserButton"),
  logoutButton: document.querySelector("#logoutButton")
};

fetch("model/planning.json")
  .then((response) => response.json())
  .then((data) => {
    state.data = normalizeData(mergeSavedDrafts(data));
    state.data.roles = loadRoleDefinitions(state.data.roles);
    state.users = loadUsers();
    state.mailQueue = loadMailQueue();
    state.teamManagers = loadTeamManagers();
    state.weekId = state.data.weeks[0]?.id || "";
    hydrateFilters();
    hydrateAuth();
  });

function hydrateFilters() {
  renderFilterOptions();

  el.weekSelect.addEventListener("change", (event) => {
    state.weekId = event.target.value;
    render();
  });
  el.prevWeekButton.addEventListener("click", () => moveWeek(1));
  el.nextWeekButton.addEventListener("click", () => moveWeek(-1));
  el.newWeekButton.addEventListener("click", createBlankWeek);
  el.clearWeekButton.addEventListener("click", clearCurrentWeek);
  el.searchInput.addEventListener("input", (event) => {
    state.search = normalizeSearchTerm(event.target.value);
    render();
  });
  el.roleSelect.addEventListener("change", (event) => {
    state.role = event.target.value;
    render();
  });
  el.projectSelect.addEventListener("change", (event) => {
    state.project = event.target.value;
    render();
  });
  el.resourceMetric.addEventListener("click", openResourceManager);
  el.projectMetric.addEventListener("click", openProjectManager);
  el.gridTab.addEventListener("click", () => setView("grid"));
  el.summaryTab.addEventListener("click", () => setView("summary"));
  el.personSummaryTab.addEventListener("click", () => setView("person"));
  el.projectReportTab.addEventListener("click", () => setView("projectReport"));
  el.orgTab.addEventListener("click", () => setView("org"));
  el.personSummarySelect.addEventListener("change", (event) => {
    state.personSummaryName = event.target.value;
    render();
  });
  el.personPeriodSelect.addEventListener("change", (event) => {
    state.personSummaryPeriod = event.target.value;
    render();
  });
  el.projectReportPeriod.addEventListener("change", (event) => {
    state.projectReportPeriod = event.target.value;
    syncProjectReportDates();
    render();
  });
  el.projectReportStart.addEventListener("change", (event) => {
    state.projectReportStart = event.target.value;
    state.projectReportPeriod = "custom";
    el.projectReportPeriod.value = "custom";
    render();
  });
  el.projectReportEnd.addEventListener("change", (event) => {
    state.projectReportEnd = event.target.value;
    state.projectReportPeriod = "custom";
    el.projectReportPeriod.value = "custom";
    render();
  });
  el.projectReportRole.addEventListener("change", (event) => {
    state.projectReportRole = event.target.value;
    render();
  });
  el.projectReportProjectToggle.addEventListener("click", () => {
    el.projectReportProjectMenu.classList.toggle("hidden");
    el.projectReportProjectSearch.focus();
  });
  el.projectReportProjectSearch.addEventListener("input", renderProjectPickerOptions);
  el.projectReportProjects.addEventListener("click", onProjectPickerClick);
  el.projectReportSelectAll.addEventListener("click", selectAllVisibleReportProjects);
  el.projectReportClearProjects.addEventListener("click", () => {
    state.projectReportProjects = [];
    render();
  });
  el.loginForm.addEventListener("submit", loginUser);
  el.forgotPasswordButton.addEventListener("click", openForgotPassword);
  el.changePasswordButton.addEventListener("click", openChangePassword);
  el.currentUserButton.addEventListener("click", openProfileModal);
  el.logoutButton.addEventListener("click", logoutUser);
  el.adminTab?.addEventListener("click", openAdminPanel);
  el.approveWeekButton.addEventListener("click", approveCurrentWeek);
  el.orgManageButton.addEventListener("click", openResourceManager);
  el.orgAddButton?.addEventListener("click", () => openTeamMemberPicker(""));
  el.orgChart.addEventListener("click", onOrgChartClick);
  el.planningHead.addEventListener("click", onPlanningHeaderClick);
  el.planningBody.addEventListener("click", onPlanningClick);
  el.modalClose.addEventListener("click", closeModal);
  el.projectModal.addEventListener("click", (event) => {
    if (event.target === el.projectModal) closeModal();
  });
  el.modalBody.addEventListener("click", onModalAction);
  el.modalBody.addEventListener("input", onModalInput);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
    if (event.key === "Escape") el.projectReportProjectMenu.classList.add("hidden");
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#projectReportProjectPicker")) {
      el.projectReportProjectMenu.classList.add("hidden");
    }
  });
}

function renderFilterOptions() {
  el.weekSelect.innerHTML = state.data.weeks
    .map((week) => `<option value="${escapeAttr(week.id)}">${escapeHtml(week.title)}</option>`)
    .join("");
  el.roleSelect.innerHTML = optionList(["All", ...state.data.roles]);
  el.projectSelect.innerHTML = optionList(["All", ...activeProjects()]);
  el.weekSelect.value = state.weekId;
  el.roleSelect.value = state.role;
  el.projectSelect.value = state.project;
  const people = uniquePeople();
  if (!state.personSummaryName && people.length) state.personSummaryName = people[0];
  el.personSummarySelect.innerHTML = people
    .map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)
    .join("");
  el.personSummarySelect.value = state.personSummaryName;
  el.personPeriodSelect.value = state.personSummaryPeriod;
  syncReportProjectSelection();
  syncProjectReportDates();
}

function optionList(values) {
  return values.map((value) => `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`).join("");
}

function hydrateAuth() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  state.currentUser = state.users.find((user) => user.id === sessionId) || null;
  if (state.currentUser) {
    showApp();
  } else {
    showLogin();
  }
}

function showLogin(message = "") {
  el.loginScreen.classList.remove("hidden");
  el.appShell.classList.add("hidden");
  const adminUser = state.users.find((user) => user.admin) || DEFAULT_USERS[0];
  el.loginIdentity.value = adminUser.email || adminUser.username || "";
  el.loginPassword.value = "";
  el.loginPassword.disabled = true;
  el.loginPassword.placeholder = "Password disabled for now";
  el.loginMessage.textContent = message;
  el.loginIdentity.focus();
}

function showApp() {
  el.loginScreen.classList.add("hidden");
  el.appShell.classList.remove("hidden");
  syncUserChrome();
  renderFilterOptions();
  render();
}

function syncUserChrome() {
  const user = state.currentUser;
  el.currentUserButton.textContent = user ? `${user.name}${user.admin ? " (Admin)" : ""}` : "";
  el.adminTab?.classList.add("hidden");
  el.orgManageButton.classList.toggle("hidden", !user?.admin);
  el.orgAddButton?.classList.toggle("hidden", !user?.admin);
  if (state.view === "admin") setView("grid");
  el.newWeekButton.disabled = !canChange();
  el.clearWeekButton.disabled = !canDelete();
  updateApprovalButton();
}

function loginUser(event) {
  event.preventDefault();
  const identity = el.loginIdentity.value.trim().toLowerCase();
  const user = state.users.find((item) =>
    [item.username, item.email].filter(Boolean).some((value) => value.toLowerCase() === identity)
  );
  if (!user || user.active === false) {
    el.loginMessage.textContent = "User name or email is incorrect.";
    return;
  }
  state.currentUser = user;
  localStorage.setItem(SESSION_KEY, user.id);
  el.loginPassword.value = "";
  showApp();
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  state.currentUser = null;
  closeModal();
  showLogin();
}

function canRead() {
  return Boolean(state.currentUser?.permissions?.read || state.currentUser?.admin);
}

function canChange() {
  return Boolean(state.currentUser?.permissions?.change || state.currentUser?.admin);
}

function canDelete() {
  return Boolean(state.currentUser?.permissions?.delete || state.currentUser?.admin);
}

function requirePermission(permission, message) {
  const allowed = permission === "delete" ? canDelete() : permission === "change" ? canChange() : canRead();
  if (allowed) return true;
  openInfoModal("Permission required", message || "Your user is not authorized for this action.");
  return false;
}

function activeProjects() {
  return state.data.projects.filter((project) => {
    const definition = projectDefinition(project);
    return !definition.inactive && !definition.deleted;
  });
}

function projectDefinition(project) {
  if (!state.data.projectMeta) state.data.projectMeta = {};
  if (!state.data.projectMeta[project]) {
    state.data.projectMeta[project] = {
      manager: "",
      budgetDays: "",
      inactive: false,
      deleted: false
    };
  }
  return state.data.projectMeta[project];
}

function setView(view) {
  state.view = view;
  el.gridTab.classList.toggle("active", view === "grid");
  el.summaryTab.classList.toggle("active", view === "summary");
  el.personSummaryTab.classList.toggle("active", view === "person");
  el.projectReportTab.classList.toggle("active", view === "projectReport");
  el.orgTab.classList.toggle("active", view === "org");
  el.adminTab?.classList.toggle("active", view === "admin");
  el.gridView.classList.toggle("hidden", view !== "grid");
  el.summaryView.classList.toggle("hidden", view !== "summary");
  el.personSummaryView.classList.toggle("hidden", view !== "person");
  el.projectReportView.classList.toggle("hidden", view !== "projectReport");
  el.orgView.classList.toggle("hidden", view !== "org");
  if (view === "org") renderOrgChart();
}

function currentWeek() {
  return state.data.weeks.find((week) => week.id === state.weekId) || state.data.weeks[0];
}

function currentWeekIndex() {
  return state.data.weeks.findIndex((week) => week.id === state.weekId);
}

function moveWeek(delta) {
  const index = currentWeekIndex();
  const nextIndex = Math.min(Math.max(index + delta, 0), state.data.weeks.length - 1);
  state.weekId = state.data.weeks[nextIndex].id;
  render();
}

function createBlankWeek() {
  if (!requirePermission("change", "You need change authorization to create a new week.")) return;
  const source = state.data.weeks[0];
  const nextMonday = addDays(parseWeekDate(source.title), 7);
  const id = formatWeekId(nextMonday);

  const week = {
    id,
    title: id,
    days: DAY_NAMES.map((label, index) => ({
      key: label.toLowerCase(),
      label,
      date: formatDisplayDate(addDays(nextMonday, index))
    })),
    updated: "Draft",
    updatedTime: "",
    draft: true,
    approved: false,
    approvedAt: "",
    resources: source.resources.map((resource) => ({
      name: resource.name,
      jiraName: resource.jiraName,
      role: resource.role,
      inactive: Boolean(resource.inactive),
      notes: "",
      assignments: cloneAssignments(resource.assignments)
    })),
    projectSummary: [...(source.projectSummary || [])]
  };

  const existingIndex = state.data.weeks.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    state.data.weeks[existingIndex] = week;
    state.data.weeks.sort((a, b) => parseWeekDate(b.title) - parseWeekDate(a.title));
  } else {
    state.data.weeks.unshift(week);
  }
  state.weekId = id;
  saveDrafts();
  renderFilterOptions();
  render();
}

function clearCurrentWeek() {
  if (!requirePermission("delete", "You need delete authorization to remove a week.")) return;
  const week = currentWeek();
  if (!week) return;

  if (currentWeekIndex() !== 0) {
    openInfoModal("Week cannot be deleted", "Only the latest defined week can be deleted.");
    return;
  }

  state.planningContext = { action: "delete-week", weekId: week.id };
  el.modalTitle.textContent = "Delete latest week";
  el.modalMeta.textContent = week.title;
  el.modalBody.innerHTML = `
    <div class="modal-summary danger-summary">
      <strong>This week will be removed from the plan.</strong>
      <span>Only the latest defined week can be deleted. This action will remove the full week from the current app data.</span>
    </div>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="close-modal">Cancel</button>
      <button class="danger" type="button" data-action="confirm-delete-week">Delete week</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function blankAssignments() {
  return Object.fromEntries(DAY_NAMES.map((label) => [label.toLowerCase(), { am: "", pm: "" }]));
}

function cloneAssignments(assignments) {
  const cloned = blankAssignments();
  DAY_NAMES.forEach((label) => {
    const key = label.toLowerCase();
    cloned[key] = { ...(assignments?.[key] || { am: "", pm: "" }) };
  });
  return cloned;
}

function filteredResources(week) {
  return week.resources.filter((resource) => {
    if (resource.inactive) return false;
    const haystack = resourceSearchText(resource);
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesRole = state.role === "All" || resource.role === state.role;
    const matchesProject = state.project === "All" || Object.values(resource.assignments)
      .some((day) => day.am === state.project || day.pm === state.project);
    return matchesSearch && matchesRole && matchesProject;
  });
}

function resourceSearchText(resource, linkedUser = null) {
  return normalizeSearchTerm([
    resource.name,
    resource.jiraName,
    resource.role,
    resource.notes,
    linkedUser?.name,
    linkedUser?.username,
    linkedUser?.email,
    ...Object.values(resource.assignments || {}).flatMap((day) => [
      day.am,
      day.pm,
      day.amNote,
      day.pmNote
    ])
  ].filter(Boolean).join(" "));
}

function normalizeSearchTerm(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function render() {
  if (!canRead()) {
    el.pageTitle.textContent = "No read authorization";
    el.updatedText.textContent = "Ask an admin to grant read access";
    el.planningHead.innerHTML = "";
    el.planningBody.innerHTML = "";
    return;
  }
  const week = currentWeek();
  const resources = filteredResources(week);
  const projectLoads = countProjects(resources);
  const roleLoads = countRoles(resources);
  const weekIndex = currentWeekIndex();

  el.pageTitle.textContent = `${week.title} Weekly Resource Plan`;
  el.updatedText.textContent = week.draft
    ? "Draft week - changes are saved in this browser"
    : `Updated ${week.updated || "-"} ${week.updatedTime || ""}`.trim();
  el.weekSelect.value = week.id;
  el.nextWeekButton.disabled = weekIndex === 0;
  el.prevWeekButton.disabled = weekIndex === state.data.weeks.length - 1;
  el.newWeekButton.disabled = !canChange();
  el.clearWeekButton.disabled = !canDelete();
  el.resourceCount.textContent = resources.length;
  el.assignmentCount.textContent = Object.values(projectLoads).reduce((sum, value) => sum + value, 0);
  el.projectCount.textContent = Object.keys(projectLoads).length;

  renderGrid(week, resources);
  renderBars(el.projectBars, projectLoads, 18);
  renderBars(el.roleBars, roleLoads, 10);
  renderPersonSummary();
  renderProjectReport();
  if (state.view === "org") renderOrgChart();
  updateApprovalButton();
}

function renderGrid(week, resources) {
  const notesHeader = state.notesOpen
    ? `<th class="notes-header"><button type="button" data-action="toggle-notes-column" title="Hide notes">Notes &lt;</button></th>`
    : `<th class="notes-header collapsed"><button type="button" data-action="toggle-notes-column" title="Show notes">Notes &gt;</button></th>`;
  el.planningHead.innerHTML = `
    <tr>
      <th>Resource</th>
      ${week.days.map((day) => `<th>${escapeHtml(day.label)}<br><span>${escapeHtml(day.date)}</span></th>`).join("")}
      ${notesHeader}
    </tr>
  `;

  el.planningBody.innerHTML = resources.map((resource) => {
    const hasNote = Boolean(resource.notes);
    const noteTitle = resource.notes || "";
    return `
      <tr>
        <td class="person">
          <strong>${escapeHtml(resource.name)}</strong>
          <span>${escapeHtml(resource.role)} - ${escapeHtml(resource.jiraName || "-")}</span>
        </td>
        ${week.days.map((day) => renderDay(resource, day, resource.assignments[day.key])).join("")}
        ${state.notesOpen ? `
          <td class="notes">
            <button class="resource-note-button ${resource.notes ? "has-note" : ""}" type="button" data-action="edit-resource-note" data-resource="${escapeAttr(resource.name)}" title="${escapeAttr(noteTitle)}">
              ${resource.notes ? `<span>${escapeHtml(resource.notes)}</span>` : `<em>Add note</em>`}
            </button>
          </td>
        ` : `<td class="notes notes-collapsed ${hasNote ? "has-note" : ""}" title="${escapeAttr(noteTitle)}">${hasNote ? `<button class="note-dot" type="button" data-action="edit-resource-note" data-resource="${escapeAttr(resource.name)}">!</button>` : ""}</td>`}
      </tr>
    `;
  }).join("");
}

function renderAuditSummary(audit) {
  if (!audit?.createdBy && !audit?.changedBy) return "";
  return `
    <div class="audit-cell">
      ${audit.createdBy ? `<span>Created: ${escapeHtml(audit.createdBy)} - ${escapeHtml(formatAuditDate(audit.createdAt))}</span>` : ""}
      ${audit.changedBy ? `<span>Changed: ${escapeHtml(audit.changedBy)} - ${escapeHtml(formatAuditDate(audit.changedAt))}</span>` : ""}
    </div>
  `;
}

function renderDay(resource, dayInfo, day) {
  return `
    <td class="day-cell">
      ${renderSlot(resource, dayInfo, "am", "AM", day?.am, day?.amRoom, day?.amNote, day?.amAudit)}
      ${renderSlot(resource, dayInfo, "pm", "PM", day?.pm, day?.pmRoom, day?.pmNote, day?.pmAudit)}
    </td>
  `;
}

function renderSlot(resource, dayInfo, period, label, value = "", roomReserved = false, note = "", audit = null) {
  const normalized = value.toLowerCase();
  const classes = ["pill"];
  if (!value) classes.push("empty");
  if (normalized === "off") classes.push("off");
  if (normalized.includes("support")) classes.push("blocked");
  if (isHighlightedProject(value)) classes.push("highlight");
  if (
    state.activeSelection &&
    state.activeSelection.project === value &&
    state.activeSelection.dayKey === dayInfo.key &&
    state.activeSelection.period === period
  ) {
    classes.push("selected-project");
  }

  return `
    <div class="slot">
      <span class="slot-label">${label}</span>
      <button
        class="${classes.join(" ")}"
        type="button"
        data-project="${escapeAttr(value)}"
        data-day="${escapeAttr(dayInfo.key)}"
        data-day-label="${escapeAttr(dayInfo.label)}"
        data-date="${escapeAttr(dayInfo.date)}"
        data-period="${escapeAttr(period)}"
        data-resource="${escapeAttr(resource.name)}">
        ${escapeHtml(value || "+ Add")}
        ${roomReserved ? `<span class="room-badge">Room</span>` : ""}
        ${note ? `<span class="room-badge note-badge" title="${escapeAttr(note)}" data-note="${escapeAttr(note)}">Note</span>` : ""}
      </button>
      ${(audit?.createdBy || audit?.changedBy) ? `<span class="slot-audit" title="${escapeAttr(auditTooltip(audit))}">i</span>` : ""}
    </div>
  `;
}

function isHighlightedProject(project) {
  return ["DOKA", "NCD", "Cloud Rent", "Product", "NCD Migration"].includes(project);
}

function countProjects(resources) {
  const counts = {};
  resources.forEach((resource) => {
    Object.values(resource.assignments).forEach((day) => {
      [day.am, day.pm].forEach((project) => {
        if (!project) return;
        counts[project] = (counts[project] || 0) + 1;
      });
    });
  });
  return sortObject(counts);
}

function countRoles(resources) {
  const counts = {};
  resources.forEach((resource) => {
    counts[resource.role || "Unknown"] = (counts[resource.role || "Unknown"] || 0) + 1;
  });
  return sortObject(counts);
}

function sortObject(source) {
  return Object.fromEntries(Object.entries(source).sort((a, b) => b[1] - a[1]));
}

function renderBars(target, data, limit) {
  const entries = Object.entries(data).slice(0, limit);
  const max = Math.max(1, ...entries.map((entry) => entry[1]));
  target.innerHTML = entries.map(([label, value]) => `
    <div class="bar-row">
      <span class="bar-label" title="${escapeAttr(label)}">${escapeHtml(label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width: ${(value / max) * 100}%"></span></span>
      <span class="bar-value">${value}</span>
    </div>
  `).join("") || `<p class="eyebrow">No data</p>`;
}

function renderPersonSummary() {
  const personName = state.personSummaryName || uniquePeople()[0] || "";
  if (!personName) return;

  const weeks = weeksForPersonPeriod();
  const distribution = countPersonTime(personName, weeks);
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const totalDays = entries.reduce((sum, entry) => sum + entry[1], 0);
  const colors = ["#0b6bcb", "#2aa876", "#e0a019", "#c0392b", "#6f42c1", "#00838f", "#8d6e63", "#455a64"];

  el.personSummarySelect.value = personName;
  el.personPeriodSelect.value = state.personSummaryPeriod;
  el.personSummaryTitle.textContent = personName;
  el.personSummaryMeta.textContent = periodLabel();
  el.personSummaryTotal.textContent = `${formatDays(totalDays)} days planned`;

  if (!entries.length) {
    el.personPie.style.background = "#e6edf3";
    el.personLegend.innerHTML = `<p class="eyebrow">No planning data for this period</p>`;
    return;
  }

  let cursor = 0;
  const slices = entries.map(([label, value], index) => {
    const start = cursor;
    const end = cursor + (value / totalDays) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });
  el.personPie.style.background = `conic-gradient(${slices.join(", ")})`;
  el.personLegend.innerHTML = entries.map(([label, value], index) => `
    <div class="legend-row">
      <span class="legend-swatch" style="background:${colors[index % colors.length]}"></span>
      <span class="legend-label">${escapeHtml(label)}</span>
      <strong>${formatDays(value)}d</strong>
      <span>${Math.round((value / totalDays) * 100)}%</span>
    </div>
  `).join("");
}

function renderProjectReport() {
  const range = projectReportRange();
  const distribution = countProjectReport(range);
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const totalDays = entries.reduce((sum, entry) => sum + entry[1], 0);
  const colors = ["#0b6bcb", "#2aa876", "#e0a019", "#c0392b", "#6f42c1", "#00838f", "#8d6e63", "#455a64", "#ad1457", "#546e7a"];

  el.projectReportPeriod.value = state.projectReportPeriod;
  el.projectReportRole.value = state.projectReportRole;
  el.projectReportStart.value = state.projectReportStart;
  el.projectReportEnd.value = state.projectReportEnd;
  el.projectReportMeta.textContent = `${formatInputDate(range.start)} - ${formatInputDate(range.end)} · ${roleReportLabel()}`;
  el.projectReportTotal.textContent = `${formatDays(totalDays)} days planned`;
  syncReportProjectSelection();

  if (!entries.length) {
    el.projectReportPie.style.background = "#e6edf3";
    el.projectReportPie.innerHTML = "";
    el.projectReportLegend.innerHTML = `<p class="eyebrow">No project data for this filter</p>`;
    return;
  }

  let cursor = 0;
  const labelItems = [];
  const slices = entries.map(([label, value], index) => {
    const start = cursor;
    const end = cursor + (value / totalDays) * 100;
    const percent = Math.round((value / totalDays) * 100);
    const mid = start + ((end - start) / 2);
    cursor = end;
    labelItems.push({ label, value, percent, mid });
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  el.projectReportPie.style.background = `conic-gradient(${slices.join(", ")})`;
  el.projectReportPie.innerHTML = labelItems.map((item) => renderPieSliceLabel(item)).join("");
  el.projectReportLegend.innerHTML = entries.map(([label, value], index) => `
    <div class="legend-row">
      <span class="legend-swatch" style="background:${colors[index % colors.length]}"></span>
      <span class="legend-label">${escapeHtml(label)}</span>
      <strong>${formatDays(value)}d</strong>
      <span>${Math.round((value / totalDays) * 100)}%</span>
    </div>
  `).join("");
}

function renderPieSliceLabel(item) {
  const angle = (item.mid / 100) * 360 - 90;
  const radius = item.percent < 8 ? 43 : 34;
  const x = 50 + radius * Math.cos(angle * Math.PI / 180);
  const y = 50 + radius * Math.sin(angle * Math.PI / 180);
  const compact = item.percent < 8 ? "compact" : "";
  return `
    <span
      class="pie-slice-label ${compact}"
      style="left:${x}%; top:${y}%"
      data-tooltip="${escapeAttr(item.label)} - ${item.percent}% - ${formatDays(item.value)} days">
      <strong>${escapeHtml(shortLabel(item.label))}</strong>
      <em>${item.percent}%</em>
      <small>${formatDays(item.value)}d</small>
    </span>
  `;
}

function shortLabel(label) {
  return label.length > 14 ? `${label.slice(0, 12)}...` : label;
}

function countProjectReport(range) {
  const counts = {};
  state.data.weeks.forEach((week) => {
    week.days.forEach((day) => {
      const dayDate = parseDisplayDate(day.date);
      if (dayDate < range.start || dayDate > range.end) return;
      week.resources.forEach((resource) => {
        if (!matchesReportRole(resource.role)) return;
        const assignment = resource.assignments[day.key];
        [assignment?.am, assignment?.pm].forEach((project) => {
          if (!project) return;
          const category = personCategory(project);
          if (!matchesReportProject(category)) return;
          counts[category] = (counts[category] || 0) + 0.5;
        });
      });
    });
  });
  return counts;
}

function syncProjectReportDates() {
  if (state.projectReportPeriod === "custom" && state.projectReportStart && state.projectReportEnd) return;
  const range = projectReportRange();
  state.projectReportStart = toInputDate(range.start);
  state.projectReportEnd = toInputDate(range.end);
  if (el.projectReportStart) el.projectReportStart.value = state.projectReportStart;
  if (el.projectReportEnd) el.projectReportEnd.value = state.projectReportEnd;
  if (el.projectReportPeriod) el.projectReportPeriod.value = state.projectReportPeriod;
}

function projectReportRange() {
  if (state.projectReportPeriod === "custom" && state.projectReportStart && state.projectReportEnd) {
    const start = parseInputDate(state.projectReportStart);
    const end = parseInputDate(state.projectReportEnd);
    return {
      start: start <= end ? start : end,
      end: start <= end ? end : start
    };
  }

  const week = currentWeek();
  const selectedDate = parseWeekDate(week.title);
  if (state.projectReportPeriod === "month") {
    return {
      start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      end: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    };
  }
  if (state.projectReportPeriod === "year") {
    return {
      start: new Date(selectedDate.getFullYear(), 0, 1),
      end: new Date(selectedDate.getFullYear(), 11, 31)
    };
  }
  return {
    start: selectedDate,
    end: addDays(selectedDate, 4)
  };
}

function matchesReportRole(role) {
  if (state.projectReportRole === "All") return true;
  if (state.projectReportRole === "Func") return role === "Func";
  if (state.projectReportRole === "Abap") return role === "Abap";
  return true;
}

function roleReportLabel() {
  if (state.projectReportRole === "Func") return "Functional";
  if (state.projectReportRole === "Abap") return "ABAP";
  return "All roles";
}

function matchesReportProject(category) {
  return !state.projectReportProjects.length || state.projectReportProjects.includes(category);
}

function syncReportProjectSelection() {
  const reportProjects = uniqueReportProjects();
  state.projectReportProjects = state.projectReportProjects.filter((project) => reportProjects.includes(project));
  renderProjectPickerOptions();
  if (!state.projectReportProjects.length) {
    el.projectReportProjectToggle.textContent = "All projects";
  } else if (state.projectReportProjects.length === 1) {
    el.projectReportProjectToggle.textContent = state.projectReportProjects[0];
  } else {
    el.projectReportProjectToggle.textContent = `${state.projectReportProjects.length} projects selected`;
  }
}

function renderProjectPickerOptions() {
  const term = (el.projectReportProjectSearch?.value || "").trim().toLowerCase();
  const projects = uniqueReportProjects().filter((project) => project.toLowerCase().includes(term));
  el.projectReportProjects.innerHTML = projects.map((project) => `
    <button class="project-option ${state.projectReportProjects.includes(project) ? "selected" : ""}" type="button" data-project="${escapeAttr(project)}">
      <span>${escapeHtml(project)}</span>
      <strong>${state.projectReportProjects.includes(project) ? "Selected" : "Select"}</strong>
    </button>
  `).join("") || `<p class="eyebrow">No matching project</p>`;
}

function onProjectPickerClick(event) {
  const option = event.target.closest(".project-option");
  if (!option) return;
  const project = option.dataset.project;
  if (state.projectReportProjects.includes(project)) {
    state.projectReportProjects = state.projectReportProjects.filter((item) => item !== project);
  } else {
    state.projectReportProjects = [...state.projectReportProjects, project];
  }
  render();
}

function selectAllVisibleReportProjects() {
  const visible = Array.from(el.projectReportProjects.querySelectorAll(".project-option"))
    .map((option) => option.dataset.project);
  state.projectReportProjects = Array.from(new Set([...state.projectReportProjects, ...visible]));
  render();
}

function uniqueReportProjects() {
  const projects = new Set();
  state.data.weeks.forEach((week) => {
    week.resources.forEach((resource) => {
      Object.values(resource.assignments).forEach((day) => {
        [day.am, day.pm].forEach((project) => {
          if (project) projects.add(personCategory(project));
        });
      });
    });
  });
  return Array.from(projects).sort();
}

function uniquePeople() {
  const names = new Set();
  state.data.weeks.forEach((week) => {
    week.resources.forEach((resource) => names.add(resource.name));
  });
  return Array.from(names).sort();
}

function weeksForPersonPeriod() {
  const selectedDate = parseWeekDate(currentWeek().title);
  return state.data.weeks.filter((week) => {
    const weekDate = parseWeekDate(week.title);
    if (state.personSummaryPeriod === "week") return week.id === currentWeek().id;
    if (state.personSummaryPeriod === "month") {
      return weekDate.getFullYear() === selectedDate.getFullYear() && weekDate.getMonth() === selectedDate.getMonth();
    }
    return weekDate.getFullYear() === selectedDate.getFullYear();
  });
}

function countPersonTime(personName, weeks) {
  const counts = {};
  weeks.forEach((week) => {
    const resource = week.resources.find((item) => item.name === personName);
    if (!resource) return;
    Object.values(resource.assignments).forEach((day) => {
      [day.am, day.pm].forEach((project) => {
        if (!project) return;
        const category = personCategory(project);
        counts[category] = (counts[category] || 0) + 0.5;
      });
    });
  });
  return counts;
}

function personCategory(project) {
  const normalized = project.toLowerCase();
  if (normalized === "off" || normalized.includes("izin") || normalized.includes("leave")) return "Leave / Off";
  if (normalized.includes("product")) return "Product";
  return project;
}

function periodLabel() {
  const week = currentWeek();
  const date = parseWeekDate(week.title);
  if (state.personSummaryPeriod === "week") return `Week of ${week.title}`;
  if (state.personSummaryPeriod === "month") return `${date.toLocaleString("en", { month: "long" })} ${date.getFullYear()}`;
  return `${date.getFullYear()}`;
}

function formatDays(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function onPlanningHeaderClick(event) {
  if (event.target.dataset.action === "toggle-notes-column") toggleNotesColumn();
}

function onPlanningClick(event) {
  const noteButton = event.target.closest("[data-action='edit-resource-note']");
  if (noteButton) {
    openResourceNoteForm(noteButton.dataset.resource);
    return;
  }
  const pill = event.target.closest(".pill");
  if (!pill) return;

  const context = {
    project: pill.dataset.project,
    dayKey: pill.dataset.day,
    day: pill.dataset.dayLabel,
    date: pill.dataset.date,
    period: pill.dataset.period,
    selectedResource: pill.dataset.resource
  };

  if (context.project) {
    state.activeSelection = {
      project: context.project,
      dayKey: context.dayKey,
      period: context.period
    };
    openProjectSummary(context);
    render();
    return;
  }

  if (!requirePermission("change", "You need change authorization to add a plan.")) return;
  openPlanningForm(context);
}

function openProjectSummary(context) {
  const week = currentWeek();
  const people = week.resources
    .filter((resource) => resource.assignments[context.dayKey]?.[context.period] === context.project)
    .map((resource) => ({
      name: resource.name,
      role: resource.role,
      jiraName: resource.jiraName,
      notes: resource.notes,
      planNote: resource.assignments[context.dayKey]?.[`${context.period}Note`] || "",
      audit: resource.assignments[context.dayKey]?.[`${context.period}Audit`] || null
    }));
  const others = people.filter((person) => person.name !== context.selectedResource);

  state.planningContext = context;
  el.modalTitle.textContent = context.project;
  el.modalMeta.textContent = `${context.day} ${context.date} - ${context.period.toUpperCase()} - ${people.length} people planned`;
  el.modalBody.innerHTML = `
    <div class="modal-summary">
      <strong>${escapeHtml(context.selectedResource)}</strong>
      <span>${others.length ? `${others.length} people are planned together` : "Only this person is planned in this slot"}</span>
    </div>
    <div class="modal-list">
      ${people.map((person) => `
        <div class="modal-person ${person.name === context.selectedResource ? "selected" : ""}">
          <div class="modal-person-head">
            <div>
              <strong>${escapeHtml(person.name)}</strong>
              <span>${escapeHtml(person.role || "-")} - ${escapeHtml(person.jiraName || "-")}</span>
            </div>
            ${canDelete() ? `<button class="remove-person" type="button" data-action="remove-person" data-person="${escapeAttr(person.name)}">Remove</button>` : ""}
          </div>
          ${person.planNote ? `<p><strong>Plan note:</strong> ${escapeHtml(person.planNote)}</p>` : ""}
          ${person.notes ? `<p>${escapeHtml(person.notes)}</p>` : ""}
          ${person.audit?.createdBy || person.audit?.changedBy ? `<p>${escapeHtml(auditTooltip(person.audit))}</p>` : ""}
        </div>
      `).join("")}
    </div>
    <div class="modal-actions">
      <label class="delete-together">
        <input id="deleteTogether" type="checkbox">
        <span>Delete from everyone planned together</span>
      </label>
      ${canDelete() ? `<button class="danger" type="button" data-action="delete-plan">Delete plan</button>` : ""}
      ${canChange() ? `<button class="secondary" type="button" data-action="edit-plan">Change</button>` : ""}
      <button type="button" data-action="close-modal">Confirm</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openPlanningForm(context) {
  if (!requirePermission("change", "You need change authorization to edit a plan.")) return;
  const week = currentWeek();
  const selected = week.resources.find((resource) => resource.name === context.selectedResource);
  const existingProject = selected?.assignments[context.dayKey]?.[context.period] || "";
  const existingRoom = Boolean(selected?.assignments[context.dayKey]?.[`${context.period}Room`]);
  const existingNote = selected?.assignments[context.dayKey]?.[`${context.period}Note`] || "";
  const existingPartners = week.resources
    .filter((resource) => resource.name !== context.selectedResource)
    .filter((resource) => resource.assignments[context.dayKey]?.[context.period] === existingProject && existingProject)
    .map((resource) => resource.name);

  state.planningContext = context;
  el.modalTitle.textContent = existingProject ? "Change plan" : "Add plan";
  el.modalMeta.textContent = `${context.selectedResource} - ${context.day} ${context.date} - ${context.period.toUpperCase()}`;
  el.modalBody.innerHTML = `
    <form id="planForm" class="plan-form">
      <label>
        <span>Project</span>
        <input id="planProject" name="project" list="projectOptions" value="${escapeAttr(existingProject)}" placeholder="Project name">
        <datalist id="projectOptions">
          ${activeProjects().map((project) => `<option value="${escapeAttr(project)}"></option>`).join("")}
        </datalist>
      </label>

      <label>
        <span>Who will work together?</span>
        <input id="consultantSearch" type="search" placeholder="Search consultant">
        <div id="planPeople" class="people-picker">
          ${week.resources
            .filter((resource) => resource.name !== context.selectedResource)
            .map((resource) => `
              <label class="person-option">
                <input type="checkbox" value="${escapeAttr(resource.name)}" ${existingPartners.includes(resource.name) ? "checked" : ""}>
                <span>${escapeHtml(resource.name)} (${escapeHtml(resource.role || "-")})</span>
              </label>
            `).join("")}
        </div>
      </label>

      <label class="checkbox-field">
        <input id="planRoom" name="room" type="checkbox" ${existingRoom ? "checked" : ""}>
        <span>Reserve meeting room</span>
      </label>

      <label>
        <span>Plan note</span>
        <textarea id="planNote" rows="3" placeholder="Write a note for this plan">${escapeHtml(existingNote)}</textarea>
      </label>

      <div class="modal-actions">
        ${existingProject ? `
          <label class="delete-together">
            <input id="deleteTogether" type="checkbox">
            <span>Delete from everyone planned together</span>
          </label>
          ${canDelete() ? `<button class="danger" type="button" data-action="delete-plan">Delete plan</button>` : ""}
        ` : ""}
        <button class="secondary" type="button" data-action="reset-plan-form">Change</button>
        <button type="button" data-action="approve-plan">Confirm plan</button>
      </div>
    </form>
  `;
  el.projectModal.classList.remove("hidden");
}

function onModalInput(event) {
  if (event.target.id === "resourceSearch") {
    filterResourceRows(event.target.value);
    return;
  }
  if (event.target.id !== "consultantSearch") return;
  const term = event.target.value.trim().toLowerCase();
  document.querySelectorAll("#planPeople .person-option").forEach((option) => {
    option.classList.toggle("hidden", !option.textContent.toLowerCase().includes(term));
  });
}

function filterResourceRows(value) {
  const term = normalizeSearchTerm(value);
  let visibleCount = 0;
  document.querySelectorAll("#resourceList .resource-row").forEach((row) => {
    const matches = !term || normalizeSearchTerm(row.dataset.search).includes(term);
    row.style.display = matches ? "" : "none";
    if (matches) visibleCount += 1;
  });
  const empty = document.querySelector("#resourceEmpty");
  if (empty) empty.classList.toggle("hidden", visibleCount > 0);
}

function onModalAction(event) {
  const action = event.target.dataset.action;
  if (!action) return;
  if (action === "close-modal") closeModal();
  if (action === "edit-plan") openPlanningForm(state.planningContext);
  if (action === "reset-plan-form") resetPlanForm();
  if (action === "approve-plan") approvePlan();
  if (action === "remove-person") removePersonFromPlan(event.target.dataset.person);
  if (action === "delete-plan") deletePlan();
  if (action === "confirm-delete-week") deleteLatestWeek();
  if (action === "resource-new") openResourceForm("new");
  if (action === "resource-new-user") openUserForm("new", "", "resource-manager");
  if (action === "resource-user") openResourceLinkedUser(event.target.dataset.resource);
  if (action === "resource-edit") openResourceForm("edit", event.target.dataset.resource);
  if (action === "resource-save") saveResource();
  if (action === "resource-note-save") saveResourceNote();
  if (action === "resource-delete") deleteResource(event.target.dataset.resource);
  if (action === "resource-toggle-active") toggleResourceActive(event.target.dataset.resource);
  if (action === "resource-manager") openResourceManager();
  if (action === "role-manager") openRoleManager();
  if (action === "role-edit") editRole(event.target.dataset.role);
  if (action === "role-cancel-edit") { state.planningContext = { action: "role-manager", editingRole: "" }; openRoleManager(); }
  if (action === "role-save") saveRole();
  if (action === "role-delete") deleteRole(event.target.dataset.role);
  if (action === "org-cancel") { closeModal(); renderOrgChart(); }
  if (action === "team-add") addTeamMember(event.target.dataset.name);
  if (action === "team-remove") removeTeamMember(event.target.dataset.name);
  if (action === "org-delete-confirm") deleteOrgNode();
  if (action === "project-new") openProjectForm("new");
  if (action === "project-edit") openProjectForm("edit", event.target.dataset.project);
  if (action === "project-save") saveProject();
  if (action === "project-delete") deleteProject(event.target.dataset.project);
  if (action === "project-toggle-active") toggleProjectActive(event.target.dataset.project);
  if (action === "project-manager") openProjectManager();
  if (action === "admin-edit-user") openAuthorizationForm(event.target.dataset.userId);
  if (action === "admin-save-user") saveUser();
  if (action === "admin-save-authorization") saveAuthorization();
  if (action === "admin-generate-password") generatePasswordForUserForm();
  if (action === "admin-reset-password") resetUserPassword(event.target.dataset.userId);
  if (action === "admin-panel") openAdminPanel();
  if (action === "mail-drafts") openMailDrafts();
  if (action === "mail-view") openMailPreview(event.target.dataset.mailId);
  if (action === "open-change-password") openChangePassword();
  if (action === "password-change-save") savePasswordChange();
  if (action === "password-forgot-save") handleForgotPassword();
  if (action === "toggle-notes-column") toggleNotesColumn();
}

function toggleNotesColumn() {
  state.notesOpen = !state.notesOpen;
  render();
}

function openResourceNoteForm(resourceName) {
  if (!requirePermission("change", "You need change authorization to edit notes.")) return;
  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === resourceName);
  if (!resource) return;
  state.planningContext = { action: "resource-note-form", resourceName };
  el.modalTitle.textContent = "Edit note";
  el.modalMeta.textContent = resource.name;
  el.modalBody.innerHTML = `
    <form class="plan-form">
      <label>
        <span>Note</span>
        <textarea id="resourceNoteText" rows="5" placeholder="Write a manual note">${escapeHtml(resource.notes || "")}</textarea>
      </label>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="close-modal">Cancel</button>
        <button type="button" data-action="resource-note-save">Save</button>
      </div>
    </form>
  `;
  el.projectModal.classList.remove("hidden");
}

function saveResourceNote() {
  if (!requirePermission("change", "You need change authorization to save notes.")) return;
  const context = state.planningContext;
  if (!context || context.action !== "resource-note-form") return;
  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === context.resourceName);
  if (!resource) return;
  resource.notes = document.querySelector("#resourceNoteText").value.trim();
  markWeekDraft(week);
  saveDrafts();
  closeModal();
  render();
}

function openProjectManager() {
  if (!requirePermission("change", "You need change authorization to manage projects.")) return;
  state.planningContext = { action: "project-manager" };
  el.modalTitle.textContent = "Projects";
  const projects = state.data.projects.filter((project) => !projectDefinition(project).deleted);
  el.modalMeta.textContent = `${projects.length} total`;
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <button type="button" data-action="project-new">New project</button>
    </div>
    <div class="resource-list">
      ${projects.map((project) => {
        const definition = projectDefinition(project);
        return `
          <div class="resource-row ${definition.inactive ? "inactive" : ""}">
            <div>
              <strong>${escapeHtml(project)}</strong>
              <span>${escapeHtml(definition.manager || "No manager")} - ${formatProjectBudget(definition.budgetDays)}</span>
              ${definition.inactive ? `<em>Inactive</em>` : ""}
            </div>
            <div class="resource-actions">
              <button type="button" data-action="project-edit" data-project="${escapeAttr(project)}">Edit</button>
              <button type="button" data-action="project-toggle-active" data-project="${escapeAttr(project)}">${definition.inactive ? "Activate" : "Inactivate"}</button>
              <button class="danger" type="button" data-action="project-delete" data-project="${escapeAttr(project)}">Delete</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
    <div class="modal-actions">
      <button type="button" data-action="close-modal">Close</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openProjectForm(mode, projectName = "") {
  const definition = mode === "edit"
    ? projectDefinition(projectName)
    : { manager: "", budgetDays: "", inactive: false };
  const people = uniquePeople();

  state.planningContext = { action: "project-form", mode, originalName: projectName };
  el.modalTitle.textContent = mode === "edit" ? "Edit project" : "New project";
  el.modalMeta.textContent = "Project definition";
  el.modalBody.innerHTML = `
    <form id="projectForm" class="plan-form">
      <label>
        <span>Project</span>
        <input id="definitionProjectName" value="${escapeAttr(projectName)}" placeholder="Project name">
      </label>
      <label>
        <span>Project manager</span>
        <input id="definitionProjectManager" value="${escapeAttr(definition.manager || "")}" list="projectManagerOptions" placeholder="Select manager">
        <datalist id="projectManagerOptions">
          ${people.map((name) => `<option value="${escapeAttr(name)}"></option>`).join("")}
        </datalist>
      </label>
      <label>
        <span>Project budget (days)</span>
        <input id="definitionProjectBudget" type="number" min="0" step="0.5" value="${escapeAttr(definition.budgetDays || "")}" placeholder="0">
      </label>
      <label class="checkbox-field">
        <input id="definitionProjectInactive" type="checkbox" ${definition.inactive ? "checked" : ""}>
        <span>Inactive</span>
      </label>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="project-manager">Cancel</button>
        <button type="button" data-action="project-save">Save</button>
      </div>
    </form>
  `;
}

function saveProject() {
  if (!requirePermission("change", "You need change authorization to save projects.")) return;
  const context = state.planningContext;
  if (!context || context.action !== "project-form") return;

  const name = document.querySelector("#definitionProjectName").value.trim();
  const manager = document.querySelector("#definitionProjectManager").value.trim();
  const budgetDays = document.querySelector("#definitionProjectBudget").value;
  const inactive = document.querySelector("#definitionProjectInactive").checked;
  if (!name) {
    document.querySelector("#definitionProjectName").focus();
    return;
  }

  const duplicate = state.data.projects.some((project) =>
    project === name && project !== context.originalName && !projectDefinition(project).deleted
  );
  if (duplicate) {
    openInfoModal("Project already exists", "A project with this name already exists.");
    return;
  }

  if (context.mode === "new") {
    state.data.projects.push(name);
  } else if (context.originalName !== name) {
    renameProject(context.originalName, name);
  }

  state.data.projects = Array.from(new Set(state.data.projects)).sort();
  state.data.projectMeta[name] = { manager, budgetDays, inactive, deleted: false };
  if (context.originalName && context.originalName !== name) {
    delete state.data.projectMeta[context.originalName];
  }

  saveProjectDefinitions();
  renderFilterOptions();
  render();
  openProjectManager();
}

function renameProject(oldName, newName) {
  state.data.projects = state.data.projects.map((project) => project === oldName ? newName : project);
  state.data.weeks.forEach((week) => {
    let changed = false;
    week.resources.forEach((resource) => {
      Object.values(resource.assignments).forEach((day) => {
        ["am", "pm"].forEach((period) => {
          if (day[period] === oldName) {
            day[period] = newName;
            changed = true;
          }
        });
      });
    });
    if (changed) markWeekDraft(week);
  });
  saveDrafts();
}

function deleteProject(projectName) {
  if (!requirePermission("delete", "You need delete authorization to delete projects.")) return;
  state.data.projects = state.data.projects.filter((project) => project !== projectName);
  state.data.projectMeta[projectName] = {
    ...projectDefinition(projectName),
    deleted: true
  };
  state.data.weeks.forEach((week) => {
    let changed = false;
    week.resources.forEach((resource) => {
      Object.values(resource.assignments).forEach((day) => {
        ["am", "pm"].forEach((period) => {
          if (day[period] === projectName) {
            day[period] = "";
            day[`${period}Room`] = false;
            changed = true;
          }
        });
      });
    });
    if (changed) markWeekDraft(week);
  });
  if (state.project === projectName) state.project = "All";
  state.projectReportProjects = state.projectReportProjects.filter((project) => project !== projectName);
  saveProjectDefinitions();
  saveDrafts();
  renderFilterOptions();
  render();
  openProjectManager();
}

function toggleProjectActive(projectName) {
  if (!requirePermission("change", "You need change authorization to change project status.")) return;
  const definition = projectDefinition(projectName);
  definition.inactive = !definition.inactive;
  if (definition.inactive && state.project === projectName) state.project = "All";
  saveProjectDefinitions();
  renderFilterOptions();
  render();
  openProjectManager();
}

function formatProjectBudget(value) {
  if (value === "" || value === null || value === undefined) return "No budget";
  return `${Number(value).toLocaleString("tr-TR")} days budget`;
}

function openResourceManager() {
  if (!requirePermission("change", "You need change authorization to manage resources.")) return;
  const week = currentWeek();
  state.planningContext = { action: "resource-manager" };
  el.modalTitle.textContent = "Resources";
  el.modalMeta.textContent = `${week.title} - ${week.resources.length} total`;
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <input id="resourceSearch" type="search" placeholder="Search consultant">
      ${state.currentUser?.admin ? `<button type="button" data-action="resource-new-user">Create user</button>` : ""}
      ${state.currentUser?.admin ? `<button type="button" data-action="role-manager">Roles</button>` : ""}
    </div>
    <div id="resourceList" class="resource-list">
      ${week.resources.map((resource) => {
        const linkedUser = userForResource(resource);
        const searchText = resourceSearchText(resource, linkedUser);
        return `
          <div class="resource-row ${resource.inactive ? "inactive" : ""}" data-search="${escapeAttr(searchText)}">
            <div>
              <strong>${escapeHtml(resource.name)}</strong>
              <span>${escapeHtml(resource.role || "-")} - ${escapeHtml(resource.jiraName || "-")}</span>
              <span>User: ${linkedUser ? escapeHtml(linkedUser.name) : "Not linked"}</span>
              <span>Manager: ${resourceManagerName(resource.name) ? escapeHtml(resourceManagerName(resource.name)) : "-"}</span>
              ${resource.inactive ? `<em>Inactive</em>` : ""}
            </div>
            <div class="resource-actions">
              ${state.currentUser?.admin ? `<button type="button" data-action="resource-user" data-resource="${escapeAttr(resource.name)}">Edit</button>` : ""}
              <button type="button" data-action="resource-toggle-active" data-resource="${escapeAttr(resource.name)}">${resource.inactive ? "Activate" : "Inactivate"}</button>
              <button class="danger" type="button" data-action="resource-delete" data-resource="${escapeAttr(resource.name)}">Delete</button>
            </div>
          </div>
        `;
      }).join("")}
      <p id="resourceEmpty" class="eyebrow hidden">No matching resources</p>
    </div>
    <div class="modal-actions">
      <button type="button" data-action="close-modal">Close</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openResourceLinkedUser(resourceName) {
  if (!state.currentUser?.admin) {
    openInfoModal("Admin required", "Only admin users can manage users.");
    return;
  }
  const resource = resourcesForUserDefinition().find((item) => item.name === resourceName);
  if (!resource) return;
  const linkedUser = userForResource(resource);
  if (linkedUser) {
    openUserForm("edit", linkedUser.id, "resource-manager", resource.name);
    return;
  }
  openUserForm("new", "", "resource-manager", resource.name);
}

function openRoleManager() {
  if (!state.currentUser?.admin) {
    openInfoModal("Admin required", "Only admin users can maintain roles.");
    return;
  }
  const editingRole = state.planningContext?.action === "role-manager" ? state.planningContext.editingRole || "" : "";
  state.planningContext = { action: "role-manager", editingRole };
  el.modalTitle.textContent = "Roles";
  el.modalMeta.textContent = editingRole ? `Editing ${editingRole}` : `${state.data.roles.length} defined`;
  el.modalBody.innerHTML = `
    <div class="plan-form">
      <label>
        <span>Role name</span>
        <input id="roleName" list="roleMaintenanceOptions" placeholder="Add role" value="${escapeAttr(editingRole)}">
        <datalist id="roleMaintenanceOptions">
          ${DEFAULT_ROLES.map((role) => `<option value="${escapeAttr(role)}"></option>`).join("")}
        </datalist>
      </label>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="resource-manager">Back</button>
        ${editingRole ? `<button class="secondary" type="button" data-action="role-cancel-edit">Cancel edit</button>` : ""}
        <button type="button" data-action="role-save">${editingRole ? "Save changes" : "Save role"}</button>
      </div>
    </div>
    <div class="resource-list role-list">
      ${state.data.roles.map((role) => `
        <div class="resource-row">
          <div>
            <strong>${escapeHtml(role)}</strong>
            <span>${roleUsageLabel(role)}</span>
          </div>
          <div class="resource-actions">
            <button type="button" data-action="role-edit" data-role="${escapeAttr(role)}">Edit</button>
            <button class="danger" type="button" data-action="role-delete" data-role="${escapeAttr(role)}">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>
`;
}

function editRole(role) {
  if (!state.currentUser?.admin) return;
  state.planningContext = { action: "role-manager", editingRole: role };
  openRoleManager();
}

function saveRole() {
  if (!state.currentUser?.admin) return;
  const input = document.querySelector("#roleName");
  const role = input?.value.trim();
  const editingRole = state.planningContext?.action === "role-manager" ? state.planningContext.editingRole || "" : "";
  if (!role) {
    input?.focus();
    return;
  }
  const exists = state.data.roles.some((item) => item.toLowerCase() === role.toLowerCase() && !sameRole(item, editingRole));
  if (exists) {
    openInfoModal("Role already exists", "This role is already defined.");
    return;
  }
  if (editingRole) {
    renameRole(editingRole, role);
  } else {
    state.data.roles = normalizeRoleList([...state.data.roles, role]);
  }
  saveRoleDefinitions();
  renderFilterOptions();
  render();
  state.planningContext = { action: "role-manager", editingRole: "" };
  openRoleManager();
}

function renameRole(oldRole, newRole) {
  state.data.roles = normalizeRoleList(state.data.roles.map((role) => sameRole(role, oldRole) ? newRole : role));
  state.data.weeks.forEach((week) => {
    let changed = false;
    week.resources.forEach((resource) => {
      if (!sameRole(resource.role, oldRole)) return;
      resource.role = newRole;
      markResourceChanged(resource);
      changed = true;
    });
    if (changed) markWeekDraft(week);
  });
  state.users.forEach((user) => {
    if (sameRole(user.role, oldRole)) user.role = newRole;
  });
  saveDrafts();
  saveUsers();
}

function deleteRole(role) {
  if (!state.currentUser?.admin) return;
  if (isRoleInUse(role)) {
    openInfoModal("Role is in use", "This role is assigned to a consultant or user. Change those records before deleting it.");
    return;
  }
  state.data.roles = state.data.roles.filter((item) => item !== role);
  saveRoleDefinitions();
  renderFilterOptions();
  render();
  openRoleManager();
}

function roleUsageLabel(role) {
  const resourceCount = resourcesForUserDefinition().filter((resource) => sameRole(resource.role, role)).length;
  const userCount = state.users.filter((user) => sameRole(user.role, role)).length;
  return `${resourceCount} consultant${resourceCount === 1 ? "" : "s"} - ${userCount} user${userCount === 1 ? "" : "s"}`;
}

function isRoleInUse(role) {
  return resourcesForUserDefinition().some((resource) => sameRole(resource.role, role)) ||
    state.users.some((user) => sameRole(user.role, role));
}

function sameRole(left, right) {
  return String(left || "").toLowerCase() === String(right || "").toLowerCase();
}

function openResourceForm(mode, resourceName = "") {
  const week = currentWeek();
  const resource = mode === "edit"
    ? week.resources.find((item) => item.name === resourceName)
    : { name: "", jiraName: "", role: "" };
  if (!resource) return;

  state.planningContext = { action: "resource-form", mode, originalName: resourceName };
  el.modalTitle.textContent = mode === "edit" ? "Edit resource" : "New resource";
  el.modalMeta.textContent = week.title;
  el.modalBody.innerHTML = `
    <form id="resourceForm" class="plan-form">
      <label>
        <span>Name</span>
        <input id="resourceName" value="${escapeAttr(resource.name)}" placeholder="Resource name">
      </label>
      <label>
        <span>Name in Jira</span>
        <input id="resourceJiraName" value="${escapeAttr(resource.jiraName || "")}" placeholder="Jira name">
      </label>
      <label>
        <span>Role</span>
        <input id="resourceRole" value="${escapeAttr(resource.role || "")}" list="resourceRoleOptions" placeholder="Role">
        <datalist id="resourceRoleOptions">
          ${state.data.roles.map((role) => `<option value="${escapeAttr(role)}"></option>`).join("")}
        </datalist>
      </label>
      <label>
        <span>Manager</span>
        <input id="resourceManager" value="${escapeAttr(mode === "edit" ? resourceManagerName(resourceName) : "")}" placeholder="No manager" readonly>
      </label>
      <label class="checkbox-field">
        <input id="resourceInactive" type="checkbox" ${resource.inactive ? "checked" : ""}>
        <span>Inactive</span>
      </label>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="resource-manager">Cancel</button>
        <button type="button" data-action="resource-save">Save</button>
      </div>
    </form>
  `;
}

function saveResource() {
  if (!requirePermission("change", "You need change authorization to save resources.")) return;
  const context = state.planningContext;
  if (!context || context.action !== "resource-form") return;

  const week = currentWeek();
  const name = document.querySelector("#resourceName").value.trim();
  const jiraName = document.querySelector("#resourceJiraName").value.trim();
  const role = document.querySelector("#resourceRole").value.trim();
  const inactive = document.querySelector("#resourceInactive").checked;
  if (!name) {
    document.querySelector("#resourceName").focus();
    return;
  }

  const duplicate = week.resources.some((resource) =>
    resource.name === name && resource.name !== context.originalName
  );
  if (duplicate) {
    openInfoModal("Resource already exists", "A resource with this name already exists in the selected week.");
    return;
  }

  if (context.mode === "new") {
    const resource = {
      name,
      jiraName,
      role,
      notes: "",
      inactive,
      assignments: blankAssignments()
    };
    markResourceChanged(resource);
    week.resources.push(resource);
  } else {
    const resource = week.resources.find((item) => item.name === context.originalName);
    if (!resource) return;
    resource.name = name;
    resource.jiraName = jiraName;
    resource.role = role;
    resource.inactive = inactive;
    markResourceChanged(resource);
  }

  if (role && !state.data.roles.includes(role)) {
    state.data.roles = normalizeRoleList([...state.data.roles, role]);
    saveRoleDefinitions();
  }

  markWeekDraft(week);
  saveDrafts();
  renderFilterOptions();
  render();
  openResourceManager();
}

function deleteResource(resourceName) {
  if (!requirePermission("delete", "You need delete authorization to delete resources.")) return;
  const week = currentWeek();
  const index = week.resources.findIndex((resource) => resource.name === resourceName);
  if (index < 0) return;
  week.resources.splice(index, 1);
  markWeekDraft(week);
  saveDrafts();
  renderFilterOptions();
  render();
  openResourceManager();
}

function toggleResourceActive(resourceName) {
  if (!requirePermission("change", "You need change authorization to change resource status.")) return;
  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === resourceName);
  if (!resource) return;
  resource.inactive = !resource.inactive;
  markResourceChanged(resource);
  markWeekDraft(week);
  saveDrafts();
  render();
  openResourceManager();
}

function deleteLatestWeek() {
  if (!requirePermission("delete", "You need delete authorization to remove a week.")) return;
  const context = state.planningContext;
  if (!context || context.action !== "delete-week") return;
  if (currentWeekIndex() !== 0 || currentWeek().id !== context.weekId) {
    openInfoModal("Week cannot be deleted", "Only the latest defined week can be deleted.");
    return;
  }

  const [removed] = state.data.weeks.splice(0, 1);
  if (removed) {
    const deleted = new Set(loadDeletedWeeks());
    deleted.add(removed.id);
    localStorage.setItem(DELETED_WEEKS_KEY, JSON.stringify(Array.from(deleted)));
  }
  state.weekId = state.data.weeks[0]?.id || "";
  state.activeSelection = null;
  saveDrafts();
  closeModal();
  renderFilterOptions();
  render();
}

function openInfoModal(title, message) {
  el.modalTitle.textContent = title;
  el.modalMeta.textContent = "";
  el.modalBody.innerHTML = `
    <div class="modal-summary">
      <strong>${escapeHtml(message)}</strong>
    </div>
    <div class="modal-actions">
      <button type="button" data-action="close-modal">OK</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function deletePlan() {
  if (!requirePermission("delete", "You need delete authorization to delete plans.")) return;
  const context = state.planningContext;
  if (!context) return;

  const week = currentWeek();
  const deleteTogether = Boolean(document.querySelector("#deleteTogether")?.checked);
  const namesToDelete = new Set([context.selectedResource]);

  if (deleteTogether && context.project) {
    week.resources.forEach((resource) => {
      if (resource.assignments[context.dayKey]?.[context.period] === context.project) {
        namesToDelete.add(resource.name);
      }
    });
  }

  week.resources.forEach((resource) => {
    if (!namesToDelete.has(resource.name)) return;
    const slot = resource.assignments[context.dayKey];
    if (!slot) return;
    if (!context.project || slot[context.period] === context.project) {
      slot[context.period] = "";
      slot[`${context.period}Room`] = false;
      slot[`${context.period}Note`] = "";
      markSlotChanged(slot, context.period);
      markResourceChanged(resource);
      queuePlanChangeEmails(week, [resource], context, "Plan removed", "");
    }
  });

  markWeekDraft(week);
  week.approved = false;
  week.approvedAt = "";
  state.activeSelection = null;
  saveDrafts();
  closeModal();
  render();
}

function removePersonFromPlan(personName) {
  if (!requirePermission("delete", "You need delete authorization to remove people from a plan.")) return;
  const context = state.planningContext;
  if (!context || !personName) return;

  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === personName);
  if (!resource) return;

  const slot = resource.assignments[context.dayKey];
  if (slot?.[context.period] !== context.project) return;

  slot[context.period] = "";
  slot[`${context.period}Room`] = false;
  slot[`${context.period}Note`] = "";
  markSlotChanged(slot, context.period);
  markResourceChanged(resource);
  queuePlanChangeEmails(week, [resource], context, "Plan removed", "");
  markWeekDraft(week);
  week.approved = false;
  week.approvedAt = "";
  saveDrafts();
  render();

  const remaining = week.resources.some((item) => item.assignments[context.dayKey]?.[context.period] === context.project);
  if (remaining) {
    openProjectSummary(context);
  } else {
    closeModal();
  }
}

function resetPlanForm() {
  const form = document.querySelector("#planForm");
  if (!form) return;
  form.reset();
  document.querySelector("#planProject").focus();
}

function approvePlan() {
  if (!requirePermission("change", "You need change authorization to approve plans.")) return;
  const context = state.planningContext;
  const project = document.querySelector("#planProject").value.trim();
  const roomReserved = document.querySelector("#planRoom").checked;
  const note = document.querySelector("#planNote").value.trim();
  if (!project) {
    document.querySelector("#planProject").focus();
    return;
  }

  const selectedPeople = Array.from(document.querySelectorAll("#planPeople input:checked"))
    .map((option) => option.value);
  const week = currentWeek();
  const namesToUpdate = new Set([context.selectedResource, ...selectedPeople]);
  const changedResources = [];

  week.resources.forEach((resource) => {
    if (!namesToUpdate.has(resource.name)) return;
    const slot = resource.assignments[context.dayKey];
    slot[context.period] = project;
    slot[`${context.period}Room`] = roomReserved;
    slot[`${context.period}Note`] = note;
    markSlotChanged(slot, context.period);
    markResourceChanged(resource);
    changedResources.push(resource);
  });

  if (!state.data.projects.includes(project)) {
    state.data.projects.push(project);
    state.data.projects.sort();
    projectDefinition(project);
    saveProjectDefinitions();
    state.project = "All";
    renderFilterOptions();
  }

  markWeekDraft(week);
  week.approved = false;
  week.approvedAt = "";
  queuePlanChangeEmails(week, changedResources, context, project, note);
  state.activeSelection = {
    project,
    dayKey: context.dayKey,
    period: context.period
  };
  saveDrafts();
  closeModal();
  render();
}

function closeModal() {
  el.projectModal.classList.add("hidden");
  state.planningContext = null;
}

function mergeSavedDrafts(data) {
  const saved = loadDrafts();
  const deleted = new Set(loadDeletedWeeks());
  const projectMeta = loadProjectDefinitions();
  const sourceWeeks = data.weeks.filter((week) => !deleted.has(week.id));
  const resourceMaster = sourceWeeks.find((week) => week.resources?.length)?.resources || [];
  const alignedSaved = saved.map((week) => alignWeekResourcesToMaster(week, resourceMaster));
  if (!alignedSaved.length) return { ...data, weeks: sourceWeeks, projectMeta };
  const baseWeeks = sourceWeeks.filter((week) => !alignedSaved.some((draft) => draft.id === week.id));
  const weeks = [...alignedSaved, ...baseWeeks].sort((a, b) => parseWeekDate(b.title) - parseWeekDate(a.title));
  const projects = Array.from(new Set([...data.projects, ...alignedSaved.flatMap(weekProjects)])).sort();
  const roles = Array.from(new Set([
    ...data.roles,
    ...alignedSaved.flatMap((week) => week.resources.map((resource) => resource.role).filter(Boolean))
  ])).sort();
  return { ...data, weeks, projects, roles, projectMeta };
}

function alignWeekResourcesToMaster(week, master) {
  if (!master.length || !week.resources?.length) return week;
  return {
    ...week,
    resources: master.map((person, index) => ({
      ...(week.resources[index] || {}),
      name: person.name,
      jiraName: person.jiraName,
      role: person.role,
      assignments: week.resources[index]?.assignments || blankAssignments()
    }))
  };
}

function weekProjects(week) {
  return week.resources.flatMap((resource) =>
    Object.values(resource.assignments).flatMap((day) => [day.am, day.pm]).filter(Boolean)
  );
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadDeletedWeeks() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_WEEKS_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadProjectDefinitions() {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_META_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDrafts() {
  const drafts = state.data.weeks.filter((week) => week.draft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

function markWeekDraft(week) {
  if (!week) return;
  week.draft = true;
  week.approved = false;
  week.approvedAt = "";
}

function saveProjectDefinitions() {
  localStorage.setItem(PROJECT_META_KEY, JSON.stringify(state.data.projectMeta || {}));
}

function loadMailQueue() {
  try {
    return JSON.parse(localStorage.getItem(MAIL_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveMailQueue() {
  localStorage.setItem(MAIL_QUEUE_KEY, JSON.stringify(state.mailQueue));
}

function updateApprovalButton() {
  const week = currentWeek();
  const canApprove = Boolean(week?.draft && canChange());
  el.approveWeekButton.classList.toggle("hidden", !canApprove);
  el.approveWeekButton.disabled = !canApprove;
}

function approveCurrentWeek() {
  if (!requirePermission("change", "You need change authorization to approve the weekly plan.")) return;
  const week = currentWeek();
  if (!week) return;
  week.draft = false;
  week.approved = true;
  week.approvedBy = state.currentUser?.name || "Unknown";
  week.approvedAt = new Date().toISOString();
  queueWeeklyApprovalEmails(week);
  saveDrafts();
  render();
  openMailDrafts("Weekly plan approved. Personal HTML mail drafts were generated.");
}

function queuePlanChangeEmails(week, resources, context, project, note) {
  const uniqueResources = Array.from(new Map(resources.map((resource) => [resource.name, resource])).values());
  uniqueResources.forEach((resource) => {
    const user = userForResource(resource);
    const manager = user?.managerId ? state.users.find((item) => item.id === user.managerId) : null;
    const subject = `Plan change: ${week.title} ${context.day} ${context.period.toUpperCase()}`;
    const html = buildPlanChangeMailHtml({ week, resource, context, project, note, manager });
    addMailDraft({
      type: "change",
      subject,
      to: user?.email || resource.jiraName || "",
      cc: manager?.email || "",
      html
    });
  });
}

function queueWeeklyApprovalEmails(week) {
  week.resources.filter((resource) => !resource.inactive).forEach((resource) => {
    const user = userForResource(resource);
    addMailDraft({
      type: "weekly",
      subject: `Weekly work plan - ${week.title}`,
      to: user?.email || resource.jiraName || "",
      cc: "",
      html: buildWeeklyPlanMailHtml(week, resource)
    });
  });
}

function addMailDraft(draft) {
  state.mailQueue.unshift({
    id: makeId("mail"),
    createdAt: new Date().toISOString(),
    status: "Draft",
    ...draft
  });
  state.mailQueue = state.mailQueue.slice(0, 200);
  saveMailQueue();
}

function openMailDrafts(message = "") {
  el.modalTitle.textContent = "Mail drafts";
  el.modalMeta.textContent = message || `${state.mailQueue.length} generated draft${state.mailQueue.length === 1 ? "" : "s"}`;
  el.modalBody.innerHTML = `
    <div class="mail-draft-list">
      ${state.mailQueue.map((mail) => `
        <div class="mail-draft-row">
          <div>
            <strong>${escapeHtml(mail.subject)}</strong>
            <span>To: ${escapeHtml(mail.to || "-")} ${mail.cc ? `- CC: ${escapeHtml(mail.cc)}` : ""}</span>
            <em>${escapeHtml(formatAuditDate(mail.createdAt))} - ${escapeHtml(mail.type)}</em>
          </div>
          <button type="button" data-action="mail-view" data-mail-id="${escapeAttr(mail.id)}">Preview</button>
        </div>
      `).join("") || `<p class="eyebrow">No mail drafts yet</p>`}
    </div>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="admin-panel">Back</button>
      <button type="button" data-action="close-modal">Close</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openMailPreview(mailId) {
  const mail = state.mailQueue.find((item) => item.id === mailId);
  if (!mail) return;
  el.modalTitle.textContent = mail.subject;
  el.modalMeta.textContent = `To: ${mail.to || "-"}${mail.cc ? ` - CC: ${mail.cc}` : ""}`;
  el.modalBody.innerHTML = `
    <div class="mail-preview">${mail.html}</div>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="mail-drafts">Back</button>
      <button type="button" data-action="close-modal">Close</button>
    </div>
  `;
}

function userForResource(resource) {
  const normalizedName = resource.name.toLowerCase();
  const normalizedJira = String(resource.jiraName || "").toLowerCase();
  return state.users.find((user) =>
    String(user.resourceName || "").toLowerCase() === normalizedName ||
    user.name.toLowerCase() === normalizedName ||
    user.username.toLowerCase() === normalizedJira ||
    String(user.email || "").toLowerCase() === normalizedJira
  );
}

function buildPlanChangeMailHtml({ week, resource, context, project, note, manager }) {
  return `
    <article class="mail-template">
      <h2>Plan Change</h2>
      <p>Hello ${escapeHtml(resource.name)}, your weekly plan was updated.</p>
      <table>
        <tr><th>Week</th><td>${escapeHtml(week.title)}</td></tr>
        <tr><th>Day</th><td>${escapeHtml(context.day)} ${escapeHtml(context.date)} - ${escapeHtml(context.period.toUpperCase())}</td></tr>
        <tr><th>Project</th><td>${escapeHtml(project)}</td></tr>
        <tr><th>Note</th><td>${escapeHtml(note || "-")}</td></tr>
        <tr><th>Changed by</th><td>${escapeHtml(state.currentUser?.name || "-")}</td></tr>
        <tr><th>Manager</th><td>${escapeHtml(manager?.name || "-")}</td></tr>
      </table>
    </article>
  `;
}

function buildWeeklyPlanMailHtml(week, resource) {
  return `
    <article class="mail-template weekly-mail">
      <h2>${escapeHtml(week.title)} Weekly Work Plan</h2>
      <p>Hello ${escapeHtml(resource.name)}, your approved weekly plan is below.</p>
      <table>
        <thead><tr><th>Day</th><th>AM</th><th>PM</th><th>Notes</th></tr></thead>
        <tbody>
          ${week.days.map((day) => {
            const slot = resource.assignments[day.key] || {};
            return `
              <tr>
                <td>${escapeHtml(day.label)}<br><small>${escapeHtml(day.date)}</small></td>
                <td>${escapeHtml(slot.am || "-")}</td>
                <td>${escapeHtml(slot.pm || "-")}</td>
                <td>${escapeHtml([slot.amNote, slot.pmNote].filter(Boolean).join(" / ") || "-")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      <p class="mail-footer">Approved by ${escapeHtml(week.approvedBy || "-")} on ${escapeHtml(formatAuditDate(week.approvedAt))}.</p>
    </article>
  `;
}

function loadUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) return saved.map(normalizeUser);
  } catch {
    // Ignore invalid local demo data and restore defaults.
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS.map(normalizeUser);
}

function normalizeUser(user) {
  return {
    ...user,
    id: user.id || makeId("user"),
    resourceName: user.resourceName || "",
    username: user.username || user.email || "",
    role: user.role || "",
    managerId: user.managerId || "",
    active: user.active !== false,
    permissions: {
      read: Boolean(user.permissions?.read || user.admin),
      change: Boolean(user.permissions?.change || user.admin),
      delete: Boolean(user.permissions?.delete || user.admin)
    }
  };
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
}

function loadTeamManagers() {
  try {
    const stored = JSON.parse(localStorage.getItem(TEAM_MANAGERS_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function saveTeamManagers() {
  localStorage.setItem(TEAM_MANAGERS_KEY, JSON.stringify(state.teamManagers || {}));
}

function loadRoleDefinitions(sourceRoles = []) {
  try {
    const saved = JSON.parse(localStorage.getItem(ROLES_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) {
      return normalizeRoleList([...DEFAULT_ROLES, ...(sourceRoles || []), ...saved]);
    }
  } catch {
    // Ignore invalid role data and restore from source defaults.
  }
  return normalizeRoleList([...DEFAULT_ROLES, ...(sourceRoles || [])]);
}

function saveRoleDefinitions() {
  localStorage.setItem(ROLES_KEY, JSON.stringify(state.data.roles || []));
}

function normalizeRoleList(roles = []) {
  return Array.from(new Map(
    roles
      .map((role) => String(role || "").trim())
      .filter(Boolean)
      .map((role) => [role.toLowerCase(), role])
  ).values()).sort((a, b) => a.localeCompare(b));
}

// --- Team / organization tree (consultant based) ---

function teamManagerMap() {
  if (!state.teamManagers || typeof state.teamManagers !== "object") state.teamManagers = {};
  return state.teamManagers;
}

function orgResourceByName(name) {
  return resourcesForUserDefinition().find((item) => item.name === name) || null;
}

function orgResourceRole(name) {
  return orgResourceByName(name)?.role || "";
}

// Direct reports of a manager name ("" = root level).
function orgChildrenOf(managerName) {
  const map = teamManagerMap();
  const placed = resourcesForUserDefinition().map((item) => item.name);
  const isPlacedManager = (value) => value !== "" && placed.includes(value);
  return placed.filter((name) => {
    if (!Object.prototype.hasOwnProperty.call(map, name)) return false;
    const parent = map[name];
    // A member floats to root when its manager was removed / no longer placed.
    const effectiveParent = isPlacedManager(parent) ? parent : "";
    return effectiveParent === managerName;
  });
}

// Every ancestor (adding an ancestor under a node would create a cycle).
function orgAncestors(name) {
  const result = new Set();
  let current = name;
  const guard = new Set();
  while (current) {
    const parent = orgEffectiveParent(current);
    if (!parent || guard.has(parent)) break;
    result.add(parent);
    guard.add(parent);
    current = parent;
  }
  return result;
}

function renderOrgChart() {
  const roots = orgChildrenOf("");
  const canManage = Boolean(state.currentUser?.admin);
  if (!roots.length && !canManage) {
    el.orgChart.innerHTML = `<p class="eyebrow">No team members yet.</p>`;
    return;
  }
  el.orgChart.innerHTML = roots.map((name) => renderOrgNode(name, 0)).join("")
    + (canManage ? renderOrgAddBox("") : "");
}

function renderOrgAddBox(managerName) {
  return `
    <div class="org-node org-add-node">
      <button class="org-add-box" type="button" data-action="org-add-child" data-manager="${escapeAttr(managerName)}">+ Add</button>
    </div>
  `;
}

function renderOrgNode(name, depth) {
  const children = orgChildrenOf(name);
  const canManage = Boolean(state.currentUser?.admin);
  const role = orgResourceRole(name);
  const childNodes = children.map((child) => renderOrgNode(child, depth + 1)).join("");
  const childrenBlock = (children.length || canManage)
    ? `<div class="org-children">${childNodes}${canManage ? renderOrgAddBox(name) : ""}</div>`
    : "";
  return `
    <div class="org-node depth-${Math.min(depth, 4)}">
      <div class="org-card">
        ${canManage ? `<button class="org-remove" type="button" data-action="org-delete-node" data-name="${escapeAttr(name)}" title="Remove" aria-label="Remove">×</button>` : ""}
        <div class="org-card-body">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(role || "-")}</span>
          <em>${children.length} team member${children.length === 1 ? "" : "s"}</em>
        </div>
      </div>
      ${childrenBlock}
    </div>
  `;
}

function onOrgChartClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button || !el.orgChart.contains(button)) return;
  if (button.dataset.action === "org-add-child") {
    openTeamMemberPicker(button.dataset.manager || "");
  }
  if (button.dataset.action === "org-delete-node") {
    confirmDeleteOrgNode(button.dataset.name);
  }
}

function confirmDeleteOrgNode(name) {
  if (!requirePermission("change", "You need change authorization to manage the organization.")) return;
  const children = orgChildrenOf(name);
  state.planningContext = { action: "org-delete", name };
  el.modalTitle.textContent = "Remove member";
  el.modalMeta.textContent = "Remove from organization";
  el.modalBody.innerHTML = `
    <div class="modal-summary">
      <strong>Remove ${escapeHtml(name)} from the organization?</strong>
      <span>${children.length
        ? `The manager of its ${children.length} direct report${children.length === 1 ? "" : "s"} will be cleared.`
        : "This member will be removed from the team."}</span>
    </div>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="org-cancel">Cancel</button>
      <button class="danger" type="button" data-action="org-delete-confirm">Remove</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function deleteOrgNode() {
  const context = state.planningContext;
  if (!context || context.action !== "org-delete") return;
  if (!requirePermission("change", "You need change authorization to manage the organization.")) return;
  const name = context.name;
  const map = teamManagerMap();
  // Detach direct reports: keep them in the org but blank their manager (become roots).
  orgChildrenOf(name).forEach((child) => {
    map[child] = "";
    applyResourceManager(child, "");
  });
  // Remove the node itself.
  delete map[name];
  applyResourceManager(name, "");
  saveTeamManagers();
  saveUsers();
  closeModal();
  renderOrgChart();
}

// Modal: pick consultants to add under a manager ("" = root level).
function openTeamMemberPicker(managerName = "") {
  if (!requirePermission("change", "You need change authorization to manage the organization.")) return;
  const map = teamManagerMap();
  const placed = resourcesForUserDefinition().map((item) => item.name);
  const isPlacedManager = (value) => value !== "" && placed.includes(value);
  const blocked = managerName ? orgAncestors(managerName) : new Set();

  const candidates = resourcesForUserDefinition().filter((resource) => {
    const name = resource.name;
    if (name === managerName) return false;            // cannot manage self
    if (blocked.has(name)) return false;               // would create a cycle
    const has = Object.prototype.hasOwnProperty.call(map, name);
    const parent = has ? (isPlacedManager(map[name]) ? map[name] : "") : null;
    if (parent === managerName) return true;           // already a member here -> removable
    if (!has) return true;                             // unplaced -> addable
    if (parent === "") return true;                    // root (no manager) -> can move under this one
    return false;                                      // under a different manager -> hidden
  });

  state.planningContext = { action: "team-picker", managerName };
  el.modalTitle.textContent = "Takım üyelerini ekle";
  el.modalMeta.textContent = managerName ? `Yönetici: ${managerName}` : "Üst seviye (yöneticisiz)";
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <input id="resourceSearch" type="search" placeholder="Danışman ara">
    </div>
    <div id="resourceList" class="resource-list">
      ${candidates.map((resource) => {
        const name = resource.name;
        const isMember = orgEffectiveParent(name) === managerName
          && Object.prototype.hasOwnProperty.call(map, name);
        const searchText = resourceSearchText(resource);
        return `
          <div class="resource-row" data-search="${escapeAttr(searchText)}">
            <div>
              <strong>${escapeHtml(name)}</strong>
              <span>${escapeHtml(resource.role || "-")}${resource.jiraName ? ` - ${escapeHtml(resource.jiraName)}` : ""}</span>
            </div>
            <div class="resource-actions">
              ${isMember
                ? `<button class="danger" type="button" data-action="team-remove" data-name="${escapeAttr(name)}">Kaldır</button>`
                : `<button type="button" data-action="team-add" data-name="${escapeAttr(name)}">Ekle</button>`}
            </div>
          </div>
        `;
      }).join("")}
      <p id="resourceEmpty" class="eyebrow ${candidates.length ? "hidden" : ""}">Eklenebilecek danışman yok</p>
    </div>
    <div class="modal-actions">
      <button type="button" data-action="org-cancel">Close</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function orgEffectiveParent(name) {
  const map = teamManagerMap();
  if (!Object.prototype.hasOwnProperty.call(map, name)) return null;
  const placed = resourcesForUserDefinition().map((item) => item.name);
  const parent = map[name];
  return parent !== "" && placed.includes(parent) ? parent : "";
}

function addTeamMember(name) {
  if (!requirePermission("change", "You need change authorization to manage the organization.")) return;
  const context = state.planningContext;
  if (!context || context.action !== "team-picker") return;
  const managerName = context.managerName || "";
  teamManagerMap()[name] = managerName;
  applyResourceManager(name, managerName);
  saveTeamManagers();
  saveUsers();
  renderOrgChart();
  openTeamMemberPicker(managerName);
}

function removeTeamMember(name) {
  if (!requirePermission("change", "You need change authorization to manage the organization.")) return;
  const context = state.planningContext;
  if (!context || context.action !== "team-picker") return;
  const managerName = context.managerName || "";
  delete teamManagerMap()[name];
  applyResourceManager(name, "");
  saveTeamManagers();
  saveUsers();
  renderOrgChart();
  openTeamMemberPicker(managerName);
}

// Manager name shown in a consultant's resource info (derived from the team map).
function resourceManagerName(name) {
  const map = teamManagerMap();
  if (!Object.prototype.hasOwnProperty.call(map, name)) return "";
  const parent = map[name];
  const placed = resourcesForUserDefinition().map((item) => item.name);
  return parent !== "" && placed.includes(parent) ? parent : "";
}

// Apply a manager change to a consultant: update every week's resource entry and
// keep the linked user's managerId in sync (so resource info + mail CC reflect it).
function applyResourceManager(resourceName, managerResourceName) {
  const manager = managerResourceName || "";
  state.data.weeks.forEach((week) => {
    week.resources.forEach((resource) => {
      if (resource.name === resourceName) resource.manager = manager;
    });
  });
  const resource = orgResourceByName(resourceName);
  const memberUser = resource ? userForResource(resource) : null;
  if (memberUser) {
    if (!manager) {
      memberUser.managerId = "";
    } else {
      const managerResource = orgResourceByName(manager);
      const managerUser = managerResource ? userForResource(managerResource) : null;
      memberUser.managerId = managerUser ? managerUser.id : "";
    }
  }
}

function managerLabel(user) {
  const manager = state.users.find((item) => item.id === user.managerId);
  return manager ? `Manager: ${manager.name}` : "No manager";
}

function openAdminPanel() {
  if (!state.currentUser?.admin) {
    openInfoModal("Admin required", "Only admin users can manage authorization.");
    return;
  }
  state.view = "admin";
  setView("admin");
  el.modalTitle.textContent = "User authorization";
  el.modalMeta.textContent = "Read, change, and delete permissions";
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <button class="secondary" type="button" data-action="mail-drafts">Mail drafts (${state.mailQueue.length})</button>
    </div>
    <div class="resource-list user-list">
      ${state.users.map((user) => `
        <div class="resource-row ${user.active === false ? "inactive" : ""}">
          <div>
            <strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(user.username)} - ${escapeHtml(user.email || "-")}</span>
            <span>Resource: ${escapeHtml(user.resourceName || "Not linked")}</span>
            <em>${managerLabel(user)} - ${permissionLabel(user)}${user.active === false ? " - Inactive" : ""}</em>
          </div>
          <div class="resource-actions">
            <button type="button" data-action="admin-edit-user" data-user-id="${escapeAttr(user.id)}">Edit authorization</button>
            <button type="button" data-action="admin-reset-password" data-user-id="${escapeAttr(user.id)}">Reset password</button>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="modal-actions">
      <button type="button" data-action="close-modal">Close</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openAuthorizationForm(userId, returnTo = "admin-panel") {
  if (!state.currentUser?.admin) return;
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  const cancelAction = returnTo === "resource-manager" ? "resource-manager" : "admin-panel";
  state.planningContext = { action: "authorization-form", userId, returnTo };
  el.modalTitle.textContent = "Edit authorization";
  el.modalMeta.textContent = `${user.name} - ${user.username}`;
  el.modalBody.innerHTML = `
    <form id="authorizationForm" class="plan-form">
      <div class="modal-summary">
        <strong>${escapeHtml(user.name)}</strong>
        <span>${escapeHtml(user.email || user.username)}</span>
        <em>${escapeHtml(managerLabel(user))}</em>
      </div>
      <div class="permission-grid">
        ${permissionCheckbox("userRead", "Read", user.permissions?.read)}
        ${permissionCheckbox("userChange", "Change", user.permissions?.change)}
        ${permissionCheckbox("userDelete", "Delete", user.permissions?.delete)}
        ${permissionCheckbox("userAdmin", "Admin", user.admin)}
      </div>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="${cancelAction}">Cancel</button>
        <button type="button" data-action="admin-save-authorization">Save</button>
      </div>
    </form>
  `;
}

function saveAuthorization() {
  if (!state.currentUser?.admin) return;
  const context = state.planningContext;
  if (!context || context.action !== "authorization-form") return;
  let user = state.users.find((item) => item.id === context.userId);
  if (!user && context.resourceName) {
    const resource = resourcesForUserDefinition().find((item) => item.name === context.resourceName);
    if (!resource) return;
    user = { ...defaultUserForResource(resource), id: makeId("user") };
    state.users.push(user);
  }
  if (!user) return;
  user.admin = document.querySelector("#userAdmin").checked;
  user.permissions = user.admin
    ? { read: true, change: true, delete: true }
    : {
      read: document.querySelector("#userRead").checked,
      change: document.querySelector("#userChange").checked,
      delete: document.querySelector("#userDelete").checked
    };
  if (document.querySelector("#userActive")) user.active = document.querySelector("#userActive").checked;
  const password = document.querySelector("#userPassword")?.value;
  if (password) user.password = password;
  if (state.currentUser.id === user.id) state.currentUser = user;
  saveUsers();
  syncUserChrome();
  if (context.returnTo === "resource-manager") {
    openResourceManager();
  } else {
    openAdminPanel();
  }
}

function defaultUserForResource(resource) {
  return {
    name: resource.name,
    username: uniqueUsername(resource.jiraName || resource.name),
    email: String(resource.jiraName || "").includes("@") ? resource.jiraName : "",
    resourceName: resource.name,
    role: resource.role || "",
    managerId: "",
    password: "welcome123",
    admin: false,
    active: true,
    permissions: { read: true, change: false, delete: false }
  };
}

function uniqueUsername(value) {
  const base = normalizeSearchTerm(value)
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "user";
  let candidate = base;
  let index = 2;
  while (state.users.some((user) => String(user.username || "").toLowerCase() === candidate.toLowerCase())) {
    candidate = `${base}.${index}`;
    index += 1;
  }
  return candidate;
}

function openUserForm(mode, userId = "", returnTo = "admin-panel", preselectedResource = "", preselectedManagerId = "") {
  if (!state.currentUser?.admin) return;
  const preselectedResourceItem = preselectedResource
    ? resourcesForUserDefinition().find((item) => item.name === preselectedResource)
    : null;
  const user = mode === "edit"
    ? state.users.find((item) => item.id === userId)
    : preselectedResourceItem
      ? defaultUserForResource(preselectedResourceItem)
      : { name: "", username: "", email: "", resourceName: "", managerId: "", password: "welcome123", admin: false, active: true, permissions: { read: true, change: false, delete: false } };
  if (!user) return;
  if (mode === "new" && preselectedResource) user.resourceName = preselectedResource;
  if (mode === "new" && preselectedManagerId) user.managerId = preselectedManagerId;

  // Feed the Manager field from the organization team assignment.
  const formResourceName = user.resourceName || (mode === "edit" ? user.name : preselectedResource) || "";
  const orgManagerName = formResourceName ? resourceManagerName(formResourceName) : "";
  const orgManagerResource = orgManagerName ? orgResourceByName(orgManagerName) : null;
  const orgManagerUser = orgManagerResource
    ? userForResource(orgManagerResource)
    : (orgManagerName ? state.users.find((item) => item.name === orgManagerName) : null);
  const selectedManagerId = user.managerId || (orgManagerUser ? orgManagerUser.id : "");
  const orgManagerNoUser = Boolean(orgManagerName) && !orgManagerUser;
  const userRoleValue = user.role || preselectedResourceItem?.role || "";

  const cancelAction = returnTo === "resource-manager" ? "resource-manager" : returnTo === "org" ? "org-cancel" : "admin-panel";
  state.planningContext = { action: "user-form", mode, userId, returnTo, resourceName: preselectedResource };
  el.modalTitle.textContent = mode === "edit" ? "Edit user" : "New user";
  el.modalMeta.textContent = "Resource user definition";
  el.modalBody.innerHTML = `
    <form id="userForm" class="plan-form">
      <label>
        <span>Name</span>
        <input id="userName" value="${escapeAttr(user.name)}" placeholder="Name">
      </label>
      <label>
        <span>User name</span>
        <input id="userUsername" value="${escapeAttr(user.username)}" placeholder="User name">
      </label>
      <label>
        <span>Email</span>
        <input id="userEmail" type="email" value="${escapeAttr(user.email || "")}" placeholder="mail@company.com">
      </label>
      <label>
        <span>Role</span>
        <input id="userRole" value="${escapeAttr(userRoleValue)}" list="userRoleOptions" placeholder="Role">
        <datalist id="userRoleOptions">
          ${state.data.roles.map((role) => `<option value="${escapeAttr(role)}"></option>`).join("")}
        </datalist>
      </label>
      <label>
        <span>Manager</span>
        <select id="userManager">
          <option value="" ${!selectedManagerId ? "selected" : ""}>${orgManagerNoUser ? `${escapeHtml(orgManagerName)} (takım yöneticisi)` : "No manager"}</option>
          ${state.users
            .filter((item) => item.id !== user.id)
            .map((item) => `<option value="${escapeAttr(item.id)}" ${item.id === selectedManagerId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
            .join("")}
        </select>
      </label>
      <label>
        <span>Initial password</span>
        <div class="password-generator">
          <input id="userPassword" name="new-password" type="text" autocomplete="new-password" value="${escapeAttr(user.password || generatePassword())}">
          <button type="button" data-action="admin-generate-password">Generate</button>
        </div>
      </label>
      <div class="permission-grid">
        ${permissionCheckbox("userRead", "Read", user.permissions?.read)}
        ${permissionCheckbox("userChange", "Change", user.permissions?.change)}
        ${permissionCheckbox("userDelete", "Delete", user.permissions?.delete)}
        ${permissionCheckbox("userAdmin", "Admin", user.admin)}
        ${permissionCheckbox("userActive", "Active", user.active !== false)}
      </div>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="${cancelAction}">Cancel</button>
        <button type="button" data-action="admin-save-user">Save</button>
      </div>
    </form>
  `;
  el.projectModal.classList.remove("hidden");
}

function permissionCheckbox(id, label, checked) {
  return `
    <label class="checkbox-field permission-check">
      <input id="${id}" type="checkbox" ${checked ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `;
}

function resourcesForUserDefinition() {
  const resources = new Map();
  state.data.weeks.forEach((week) => {
    week.resources.forEach((resource) => {
      if (!resources.has(resource.name)) resources.set(resource.name, resource);
    });
  });
  return Array.from(resources.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function syncResourceRole(resourceName, role) {
  if (!resourceName || !role) return;
  let changed = false;
  state.data.weeks.forEach((week) => {
    week.resources.forEach((resource) => {
      if (resource.name !== resourceName || resource.role === role) return;
      resource.role = role;
      markResourceChanged(resource);
      markWeekDraft(week);
      changed = true;
    });
  });
  if (changed) {
    saveDrafts();
    renderFilterOptions();
  }
}

function generatePasswordForUserForm() {
  const input = document.querySelector("#userPassword");
  if (!input) return;
  input.value = generatePassword();
  input.focus();
  input.select();
}

function generatePassword(length = 14) {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%&*?"
  ];
  const chars = groups.join("");
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  const password = groups.map((group, index) => group[values[index] % group.length]);
  for (let index = password.length; index < length; index += 1) {
    password.push(chars[values[index] % chars.length]);
  }
  return password.sort(() => crypto.getRandomValues(new Uint32Array(1))[0] % 3 - 1).join("");
}

function saveUser() {
  if (!state.currentUser?.admin) return;
  const context = state.planningContext;
  if (!context || context.action !== "user-form") return;
  const name = document.querySelector("#userName").value.trim();
  const username = document.querySelector("#userUsername").value.trim();
  const email = document.querySelector("#userEmail").value.trim();
  const role = document.querySelector("#userRole").value.trim();
  if (!name || !username) {
    openInfoModal("Missing user info", "Name and user name are required.");
    return;
  }
  const duplicate = state.users.some((user) => {
    if (user.id === context.userId) return false;
    const identities = [user.username, user.email].filter(Boolean).map((value) => value.toLowerCase());
    return identities.includes(username.toLowerCase()) || (email && identities.includes(email.toLowerCase()));
  });
  if (duplicate) {
    openInfoModal("User already exists", "This user name is already used.");
    return;
  }
  const permissions = {
    read: document.querySelector("#userRead").checked,
    change: document.querySelector("#userChange").checked,
    delete: document.querySelector("#userDelete").checked
  };
  const payload = {
    name,
    username,
    email,
    resourceName: context.mode === "new" ? context.resourceName || "" : state.users.find((item) => item.id === context.userId)?.resourceName || "",
    role,
    managerId: document.querySelector("#userManager").value,
    admin: document.querySelector("#userAdmin").checked,
    active: document.querySelector("#userActive").checked,
    permissions
  };
  if (payload.admin) payload.permissions = { read: true, change: true, delete: true };
  if (role && !state.data.roles.some((item) => item.toLowerCase() === role.toLowerCase())) {
    state.data.roles = normalizeRoleList([...state.data.roles, role]);
    saveRoleDefinitions();
  }
  syncResourceRole(payload.resourceName || context.resourceName || name, role);
  if (context.mode === "new") {
    state.users.push({ ...payload, id: makeId("user"), password: document.querySelector("#userPassword").value || "welcome123" });
  } else {
    const user = state.users.find((item) => item.id === context.userId);
    Object.assign(user, payload);
    const password = document.querySelector("#userPassword")?.value;
    if (password) user.password = password;
    if (state.currentUser.id === user.id) state.currentUser = user;
  }
  saveUsers();
  syncUserChrome();
  if (context.returnTo === "resource-manager") {
    openResourceManager();
  } else if (context.returnTo === "org") {
    closeModal();
    renderOrgChart();
  } else {
    openAdminPanel();
  }
}

function toggleUser(userId) {
  if (!state.currentUser?.admin) return;
  const user = state.users.find((item) => item.id === userId);
  if (!user || user.id === state.currentUser.id) return;
  user.active = user.active === false;
  saveUsers();
  openAdminPanel();
}

function resetUserPassword(userId, returnTo = "info") {
  if (!state.currentUser?.admin) return;
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  user.password = "welcome123";
  saveUsers();
  if (returnTo === "resource-manager") {
    openResourceManager();
    el.modalMeta.textContent = `${user.name}'s password is now welcome123.`;
    return;
  }
  openInfoModal("Password reset", `${user.name}'s password is now welcome123.`);
}

function openProfileModal() {
  const user = state.currentUser;
  if (!user) return;
  el.modalTitle.textContent = user.name;
  el.modalMeta.textContent = "Current user";
  el.modalBody.innerHTML = `
    <div class="modal-summary">
      <strong>${escapeHtml(permissionLabel(user))}</strong>
      <span>${escapeHtml(user.email || user.username)}</span>
    </div>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="close-modal">Close</button>
      <button type="button" data-action="open-change-password">Change password</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openChangePassword() {
  el.modalTitle.textContent = "Change password";
  el.modalMeta.textContent = state.currentUser ? state.currentUser.name : "Use your user name or email";
  el.modalBody.innerHTML = `
    <form class="plan-form">
      <label><span>User name or email</span><input id="passwordIdentity" value="${escapeAttr(state.currentUser?.username || "")}"></label>
      <label><span>Current password</span><input id="oldPassword" type="password"></label>
      <label><span>New password</span><input id="newPassword" type="password"></label>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="close-modal">Cancel</button>
        <button type="button" data-action="password-change-save">Save password</button>
      </div>
    </form>
  `;
  el.projectModal.classList.remove("hidden");
}

function savePasswordChange() {
  const identity = document.querySelector("#passwordIdentity")?.value.trim().toLowerCase() || state.currentUser?.username?.toLowerCase();
  const oldPassword = document.querySelector("#oldPassword")?.value || "";
  const newPassword = document.querySelector("#newPassword")?.value || "";
  const user = state.users.find((item) =>
    [item.username, item.email].filter(Boolean).some((value) => value.toLowerCase() === identity)
  );
  if (!user || user.password !== oldPassword || newPassword.length < 4) {
    openInfoModal("Password not changed", "Check the current password and use at least 4 characters for the new password.");
    return;
  }
  user.password = newPassword;
  saveUsers();
  localStorage.removeItem(SESSION_KEY);
  state.currentUser = null;
  closeModal();
  showLogin("Password changed. Sign in with the new password.");
}

function openForgotPassword() {
  el.modalTitle.textContent = "Forgot password";
  el.modalMeta.textContent = "Demo recovery";
  el.modalBody.innerHTML = `
    <form class="plan-form">
      <label><span>User name or email</span><input id="forgotIdentity" placeholder="User name or email"></label>
      <div class="modal-summary">
        <strong>Admin assisted reset</strong>
        <span>This local demo does not send email. It shows whether the user exists and asks an admin to reset the password.</span>
      </div>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="close-modal">Cancel</button>
        <button type="button" data-action="password-forgot-save">Check user</button>
      </div>
    </form>
  `;
  el.projectModal.classList.remove("hidden");
}

function handleForgotPassword() {
  const identity = document.querySelector("#forgotIdentity").value.trim().toLowerCase();
  const user = state.users.find((item) =>
    [item.username, item.email].filter(Boolean).some((value) => value.toLowerCase() === identity)
  );
  openInfoModal(
    user ? "User found" : "User not found",
    user ? "Ask an admin user to reset this password from the Admin screen." : "No active user was found for this user name or email."
  );
}

function permissionLabel(user) {
  if (user.admin) return "Admin - read, change, delete";
  const permissions = [];
  if (user.permissions?.read) permissions.push("read");
  if (user.permissions?.change) permissions.push("change");
  if (user.permissions?.delete) permissions.push("delete");
  return permissions.length ? permissions.join(", ") : "no access";
}

function markResourceChanged(resource) {
  resource.audit = {
    ...(resource.audit || {}),
    changedBy: state.currentUser?.name || "Unknown",
    changedAt: new Date().toISOString()
  };
  if (!resource.audit.createdBy) {
    resource.audit.createdBy = state.currentUser?.name || "Unknown";
    resource.audit.createdAt = resource.audit.changedAt;
  }
}

function markSlotChanged(slot, period) {
  const key = `${period}Audit`;
  const now = new Date().toISOString();
  const existing = slot[key] || {};
  slot[key] = {
    ...existing,
    changedBy: state.currentUser?.name || "Unknown",
    changedAt: now
  };
  if (!slot[key].createdBy) {
    slot[key].createdBy = state.currentUser?.name || "Unknown";
    slot[key].createdAt = now;
  }
}

function auditTooltip(audit) {
  return [
    audit.createdBy ? `Created: ${audit.createdBy} - ${formatAuditDate(audit.createdAt)}` : "",
    audit.changedBy ? `Changed: ${audit.changedBy} - ${formatAuditDate(audit.changedAt)}` : ""
  ].filter(Boolean).join("\n");
}

function formatAuditDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseWeekDate(value) {
  const match = String(value).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return new Date(0);
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 2020 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return new Date(0);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return new Date(0);
  return date;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatWeekId(date) {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatDisplayDate(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function parseDisplayDate(value) {
  if (String(value).includes("-")) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function parseInputDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInputDate(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function normalizeData(data) {
  const projectMeta = data.projectMeta || {};
  const seen = new Set();
  const weeks = [];
  data.weeks.forEach((week) => {
    const start = parseWeekDate(week.title);
    if (start.getTime() === 0) return;
    const id = formatWeekId(start);
    if (seen.has(id)) return;
    seen.add(id);
    weeks.push({
      ...week,
      id,
      title: id,
      days: DAY_NAMES.map((label, index) => ({
        key: label.toLowerCase(),
        label,
        date: formatDisplayDate(addDays(start, index))
      }))
    });
  });
  weeks.sort((a, b) => parseWeekDate(b.title) - parseWeekDate(a.title));
  const deletedProjects = Object.entries(projectMeta)
    .filter(([, definition]) => definition?.deleted)
    .map(([project]) => project);
  const projects = Array.from(new Set([
    ...data.projects,
    ...weeks.flatMap(weekProjects),
    ...Object.keys(projectMeta)
  ]))
    .filter((project) => !deletedProjects.includes(project))
    .sort();
  projects.forEach((project) => {
    if (!projectMeta[project]) {
      projectMeta[project] = { manager: "", budgetDays: "", inactive: false, deleted: false };
    }
  });
  return { ...data, weeks, projects, projectMeta };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
