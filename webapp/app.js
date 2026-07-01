const STORAGE_KEY = "weeklyResourcePlanningDrafts";
const DELETED_WEEKS_KEY = "weeklyResourcePlanningDeletedWeeks";
const PROJECT_META_KEY = "weeklyResourcePlanningProjects";
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const state = {
  data: null,
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
  gridView: document.querySelector("#gridView"),
  summaryView: document.querySelector("#summaryView"),
  personSummaryView: document.querySelector("#personSummaryView"),
  projectReportView: document.querySelector("#projectReportView"),
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
  modalBody: document.querySelector("#modalBody")
};

fetch("model/planning.json")
  .then((response) => response.json())
  .then((data) => {
    state.data = normalizeData(mergeSavedDrafts(data));
    state.weekId = state.data.weeks[0]?.id || "";
    hydrateFilters();
    render();
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
    state.search = event.target.value.trim().toLowerCase();
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
  el.gridView.classList.toggle("hidden", view !== "grid");
  el.summaryView.classList.toggle("hidden", view !== "summary");
  el.personSummaryView.classList.toggle("hidden", view !== "person");
  el.projectReportView.classList.toggle("hidden", view !== "projectReport");
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
    const haystack = [
      resource.name,
      resource.jiraName,
      resource.role,
      resource.notes,
      ...Object.values(resource.assignments).flatMap((day) => [day.am, day.pm])
    ].join(" ").toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesRole = state.role === "All" || resource.role === state.role;
    const matchesProject = state.project === "All" || Object.values(resource.assignments)
      .some((day) => day.am === state.project || day.pm === state.project);
    return matchesSearch && matchesRole && matchesProject;
  });
}

function render() {
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
  el.resourceCount.textContent = resources.length;
  el.assignmentCount.textContent = Object.values(projectLoads).reduce((sum, value) => sum + value, 0);
  el.projectCount.textContent = Object.keys(projectLoads).length;

  renderGrid(week, resources);
  renderBars(el.projectBars, projectLoads, 18);
  renderBars(el.roleBars, roleLoads, 10);
  renderPersonSummary();
  renderProjectReport();
}

function renderGrid(week, resources) {
  el.planningHead.innerHTML = `
    <tr>
      <th>Resource</th>
      ${week.days.map((day) => `<th>${escapeHtml(day.label)}<br><span>${escapeHtml(day.date)}</span></th>`).join("")}
      <th>Notes</th>
    </tr>
  `;

  el.planningBody.innerHTML = resources.map((resource) => `
    <tr>
      <td class="person">
        <strong>${escapeHtml(resource.name)}</strong>
        <span>${escapeHtml(resource.role)} - ${escapeHtml(resource.jiraName || "-")}</span>
      </td>
      ${week.days.map((day) => renderDay(resource, day, resource.assignments[day.key])).join("")}
      <td class="notes">${escapeHtml(resource.notes || "")}</td>
    </tr>
  `).join("");
}

function renderDay(resource, dayInfo, day) {
  return `
    <td class="day-cell">
      ${renderSlot(resource, dayInfo, "am", "AM", day?.am, day?.amRoom)}
      ${renderSlot(resource, dayInfo, "pm", "PM", day?.pm, day?.pmRoom)}
    </td>
  `;
}

function renderSlot(resource, dayInfo, period, label, value = "", roomReserved = false) {
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
      </button>
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

function onPlanningClick(event) {
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
      notes: resource.notes
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
            <button class="remove-person" type="button" data-action="remove-person" data-person="${escapeAttr(person.name)}">Remove</button>
          </div>
          ${person.notes ? `<p>${escapeHtml(person.notes)}</p>` : ""}
        </div>
      `).join("")}
    </div>
    <div class="modal-actions">
      <label class="delete-together">
        <input id="deleteTogether" type="checkbox">
        <span>Delete from everyone planned together</span>
      </label>
      <button class="danger" type="button" data-action="delete-plan">Delete plan</button>
      <button class="secondary" type="button" data-action="edit-plan">Change</button>
      <button type="button" data-action="close-modal">Confirm</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openPlanningForm(context) {
  const week = currentWeek();
  const selected = week.resources.find((resource) => resource.name === context.selectedResource);
  const existingProject = selected?.assignments[context.dayKey]?.[context.period] || "";
  const existingRoom = Boolean(selected?.assignments[context.dayKey]?.[`${context.period}Room`]);
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

      <div class="modal-actions">
        ${existingProject ? `
          <label class="delete-together">
            <input id="deleteTogether" type="checkbox">
            <span>Delete from everyone planned together</span>
          </label>
          <button class="danger" type="button" data-action="delete-plan">Delete plan</button>
        ` : ""}
        <button class="secondary" type="button" data-action="reset-plan-form">Change</button>
        <button type="button" data-action="approve-plan">Confirm plan</button>
      </div>
    </form>
  `;
  el.projectModal.classList.remove("hidden");
}

function onModalInput(event) {
  if (event.target.id !== "consultantSearch") return;
  const term = event.target.value.trim().toLowerCase();
  document.querySelectorAll("#planPeople .person-option").forEach((option) => {
    option.classList.toggle("hidden", !option.textContent.toLowerCase().includes(term));
  });
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
  if (action === "resource-edit") openResourceForm("edit", event.target.dataset.resource);
  if (action === "resource-save") saveResource();
  if (action === "resource-delete") deleteResource(event.target.dataset.resource);
  if (action === "resource-toggle-active") toggleResourceActive(event.target.dataset.resource);
  if (action === "resource-manager") openResourceManager();
  if (action === "project-new") openProjectForm("new");
  if (action === "project-edit") openProjectForm("edit", event.target.dataset.project);
  if (action === "project-save") saveProject();
  if (action === "project-delete") deleteProject(event.target.dataset.project);
  if (action === "project-toggle-active") toggleProjectActive(event.target.dataset.project);
  if (action === "project-manager") openProjectManager();
}

function openProjectManager() {
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
    if (changed) week.draft = true;
  });
  saveDrafts();
}

function deleteProject(projectName) {
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
    if (changed) week.draft = true;
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
  const week = currentWeek();
  state.planningContext = { action: "resource-manager" };
  el.modalTitle.textContent = "Resources";
  el.modalMeta.textContent = `${week.title} - ${week.resources.length} total`;
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <button type="button" data-action="resource-new">New resource</button>
    </div>
    <div class="resource-list">
      ${week.resources.map((resource) => `
        <div class="resource-row ${resource.inactive ? "inactive" : ""}">
          <div>
            <strong>${escapeHtml(resource.name)}</strong>
            <span>${escapeHtml(resource.role || "-")} - ${escapeHtml(resource.jiraName || "-")}</span>
            ${resource.inactive ? `<em>Inactive</em>` : ""}
          </div>
          <div class="resource-actions">
            <button type="button" data-action="resource-edit" data-resource="${escapeAttr(resource.name)}">Edit</button>
            <button type="button" data-action="resource-toggle-active" data-resource="${escapeAttr(resource.name)}">${resource.inactive ? "Activate" : "Inactivate"}</button>
            <button class="danger" type="button" data-action="resource-delete" data-resource="${escapeAttr(resource.name)}">Delete</button>
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
    week.resources.push({
      name,
      jiraName,
      role,
      notes: "",
      inactive,
      assignments: blankAssignments()
    });
  } else {
    const resource = week.resources.find((item) => item.name === context.originalName);
    if (!resource) return;
    resource.name = name;
    resource.jiraName = jiraName;
    resource.role = role;
    resource.inactive = inactive;
  }

  if (role && !state.data.roles.includes(role)) {
    state.data.roles.push(role);
    state.data.roles.sort();
  }

  week.draft = true;
  saveDrafts();
  renderFilterOptions();
  render();
  openResourceManager();
}

function deleteResource(resourceName) {
  const week = currentWeek();
  const index = week.resources.findIndex((resource) => resource.name === resourceName);
  if (index < 0) return;
  week.resources.splice(index, 1);
  week.draft = true;
  saveDrafts();
  renderFilterOptions();
  render();
  openResourceManager();
}

function toggleResourceActive(resourceName) {
  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === resourceName);
  if (!resource) return;
  resource.inactive = !resource.inactive;
  week.draft = true;
  saveDrafts();
  render();
  openResourceManager();
}

function deleteLatestWeek() {
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
    }
  });

  week.draft = true;
  state.activeSelection = null;
  saveDrafts();
  closeModal();
  render();
}

function removePersonFromPlan(personName) {
  const context = state.planningContext;
  if (!context || !personName) return;

  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === personName);
  if (!resource) return;

  const slot = resource.assignments[context.dayKey];
  if (slot?.[context.period] !== context.project) return;

  slot[context.period] = "";
  slot[`${context.period}Room`] = false;
  week.draft = true;
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
  const context = state.planningContext;
  const project = document.querySelector("#planProject").value.trim();
  const roomReserved = document.querySelector("#planRoom").checked;
  if (!project) {
    document.querySelector("#planProject").focus();
    return;
  }

  const selectedPeople = Array.from(document.querySelectorAll("#planPeople input:checked"))
    .map((option) => option.value);
  const week = currentWeek();
  const namesToUpdate = new Set([context.selectedResource, ...selectedPeople]);

  week.resources.forEach((resource) => {
    if (!namesToUpdate.has(resource.name)) return;
    resource.assignments[context.dayKey][context.period] = project;
    resource.assignments[context.dayKey][`${context.period}Room`] = roomReserved;
  });

  if (!state.data.projects.includes(project)) {
    state.data.projects.push(project);
    state.data.projects.sort();
    projectDefinition(project);
    saveProjectDefinitions();
    state.project = "All";
    renderFilterOptions();
  }

  week.draft = true;
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
  if (!saved.length) return { ...data, weeks: sourceWeeks, projectMeta };
  const baseWeeks = sourceWeeks.filter((week) => !saved.some((draft) => draft.id === week.id));
  const weeks = [...saved, ...baseWeeks].sort((a, b) => parseWeekDate(b.title) - parseWeekDate(a.title));
  const projects = Array.from(new Set([...data.projects, ...saved.flatMap(weekProjects)])).sort();
  const roles = Array.from(new Set([
    ...data.roles,
    ...saved.flatMap((week) => week.resources.map((resource) => resource.role).filter(Boolean))
  ])).sort();
  return { ...data, weeks, projects, roles, projectMeta };
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

function saveProjectDefinitions() {
  localStorage.setItem(PROJECT_META_KEY, JSON.stringify(state.data.projectMeta || {}));
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
