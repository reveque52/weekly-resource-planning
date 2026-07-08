const STORAGE_KEY = "weeklyResourcePlanningDrafts";
const DELETED_WEEKS_KEY = "weeklyResourcePlanningDeletedWeeks";
const PROJECT_META_KEY = "weeklyResourcePlanningProjects";
const USERS_KEY = "weeklyResourcePlanningUsers";
const SESSION_KEY = "weeklyResourcePlanningSession";
const MAIL_QUEUE_KEY = "weeklyResourcePlanningMailQueue";
const TEAM_MANAGERS_KEY = "weeklyResourcePlanningTeamManagers";
const ROLES_KEY = "weeklyResourcePlanningRoles";
const SEARCH_VARIANTS_KEY = "weeklyResourcePlanningSearchVariants";
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_ROLES = ["ABAP", "Functional", "Team Lead", "Project Manager", "CEO"];
const DEFAULT_USERS = [
  {
    id: "admin",
    name: "Planning Admin",
    email: "selcuk.dere@fit-global.com",
    username: "admin",
    password: "admin123",
    admin: true,
    isResource: true,
    role: "Project Manager",
    resourceName: "Planning Admin",
    active: true,
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
  view: "home",
  consultantProfileName: "",
  personSummaryName: "",
  personSummaryPeriod: "week",
  projectReportPeriod: "week",
  projectReportRole: "All",
  projectReportStart: "",
  projectReportEnd: "",
  projectReportProjects: [],
  mailQueue: [],
  teamManagers: {},
  weather: {
    loading: false,
    loaded: false,
    location: "Istanbul",
    temperature: "",
    summary: "Konum izni bekleniyor",
    kind: "loading"
  },
  notesOpen: false,
  activeSelection: null,
  planningContext: null
};

const persistence = {
  apiAvailable: false,
  serverState: {}
};

const el = {
  weekSelect: document.querySelector("#weekSelect"),
  prevWeekButton: document.querySelector("#prevWeekButton"),
  nextWeekButton: document.querySelector("#nextWeekButton"),
  newWeekButton: document.querySelector("#newWeekButton"),
  clearWeekButton: document.querySelector("#clearWeekButton"),
  searchInput: document.querySelector("#searchInput"),
  searchVariantSelect: document.querySelector("#searchVariantSelect"),
  saveSearchVariantButton: document.querySelector("#saveSearchVariantButton"),
  deleteSearchVariantButton: document.querySelector("#deleteSearchVariantButton"),
  clearSearchVariantButton: document.querySelector("#clearSearchVariantButton"),
  roleSelect: document.querySelector("#roleSelect"),
  projectSelect: document.querySelector("#projectSelect"),
  resourceCount: document.querySelector("#resourceCount"),
  resourceMetric: document.querySelector("#resourceMetric"),
  assignmentCount: document.querySelector("#assignmentCount"),
  projectCount: document.querySelector("#projectCount"),
  projectMetric: document.querySelector("#projectMetric"),
  updatedText: document.querySelector("#updatedText"),
  pageTitle: document.querySelector("#pageTitle"),
  welcomeText: document.querySelector("#welcomeText"),
  welcomeSubtext: document.querySelector("#welcomeSubtext"),
  weatherTemp: document.querySelector("#weatherTemp"),
  weatherLocation: document.querySelector("#weatherLocation"),
  weatherSummary: document.querySelector("#weatherSummary"),
  weatherScene: document.querySelector("#weatherScene"),
  planningHead: document.querySelector("#planningHead"),
  planningBody: document.querySelector("#planningBody"),
  homeTab: document.querySelector("#homeTab"),
  gridTab: document.querySelector("#gridTab"),
  assistantTab: document.querySelector("#assistantTab"),
  consultantProfileTab: document.querySelector("#consultantProfileTab"),
  personSummaryTab: document.querySelector("#personSummaryTab"),
  projectReportTab: document.querySelector("#projectReportTab"),
  orgTab: document.querySelector("#orgTab"),
  gridView: document.querySelector("#gridView"),
  consultantProfileView: document.querySelector("#consultantProfileView"),
  personSummaryView: document.querySelector("#personSummaryView"),
  projectReportView: document.querySelector("#projectReportView"),
  orgView: document.querySelector("#orgView"),
  homeView: document.querySelector("#homeView"),
  assistantView: document.querySelector("#assistantView"),
  dashboardTitle: document.querySelector("#dashboardTitle"),
  dashboardMeta: document.querySelector("#dashboardMeta"),
  dashboardStatus: document.querySelector("#dashboardStatus"),
  dashboardResourceCount: document.querySelector("#dashboardResourceCount"),
  dashboardSlotCount: document.querySelector("#dashboardSlotCount"),
  dashboardOpenSlotCount: document.querySelector("#dashboardOpenSlotCount"),
  dashboardProjectCount: document.querySelector("#dashboardProjectCount"),
  dashboardAttentionCount: document.querySelector("#dashboardAttentionCount"),
  dashboardAttentionList: document.querySelector("#dashboardAttentionList"),
  dashboardAvailableCount: document.querySelector("#dashboardAvailableCount"),
  dashboardAvailableList: document.querySelector("#dashboardAvailableList"),
  dashboardDemandList: document.querySelector("#dashboardDemandList"),
  dashboardTopProjectCount: document.querySelector("#dashboardTopProjectCount"),
  dashboardTopProjectPie: document.querySelector("#dashboardTopProjectPie"),
  dashboardTopProjectLegend: document.querySelector("#dashboardTopProjectLegend"),
  dashboardRoleCount: document.querySelector("#dashboardRoleCount"),
  dashboardRolePie: document.querySelector("#dashboardRolePie"),
  dashboardRoleLegend: document.querySelector("#dashboardRoleLegend"),
  assistantTitle: document.querySelector("#assistantTitle"),
  assistantMeta: document.querySelector("#assistantMeta"),
  assistantRefreshButton: document.querySelector("#assistantRefreshButton"),
  assistantGapCount: document.querySelector("#assistantGapCount"),
  assistantGapList: document.querySelector("#assistantGapList"),
  assistantSuggestionCount: document.querySelector("#assistantSuggestionCount"),
  assistantSuggestionList: document.querySelector("#assistantSuggestionList"),
  assistantAvailableCount: document.querySelector("#assistantAvailableCount"),
  assistantAvailableList: document.querySelector("#assistantAvailableList"),
  orgChart: document.querySelector("#orgChart"),
  orgManageButton: document.querySelector("#orgManageButton"),
  orgAddButton: document.querySelector("#orgAddButton"),
  personSummarySelect: document.querySelector("#personSummarySelect"),
  consultantProfileSelect: document.querySelector("#consultantProfileSelect"),
  consultantProfileName: document.querySelector("#consultantProfileName"),
  consultantProfileRole: document.querySelector("#consultantProfileRole"),
  consultantProfileEditButton: document.querySelector("#consultantProfileEditButton"),
  consultantProfileDetails: document.querySelector("#consultantProfileDetails"),
  consultantWeekLoad: document.querySelector("#consultantWeekLoad"),
  consultantOpenSlots: document.querySelector("#consultantOpenSlots"),
  consultantYearLoad: document.querySelector("#consultantYearLoad"),
  consultantWeekMeta: document.querySelector("#consultantWeekMeta"),
  consultantWeekPlan: document.querySelector("#consultantWeekPlan"),
  consultantProjectMixMeta: document.querySelector("#consultantProjectMixMeta"),
  consultantProjectPie: document.querySelector("#consultantProjectPie"),
  consultantProjectLegend: document.querySelector("#consultantProjectLegend"),
  consultantHistoryMeta: document.querySelector("#consultantHistoryMeta"),
  consultantHistoryList: document.querySelector("#consultantHistoryList"),
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

Promise.all([
  fetch("model/planning.json").then((response) => response.json()),
  loadServerState()
])
  .then(([data]) => {
    state.data = normalizeData(mergeSavedDrafts(data));
    state.data.roles = loadRoleDefinitions(state.data.roles);
    state.users = loadUsers();
    saveUsers();
    state.mailQueue = loadMailQueue();
    state.teamManagers = loadTeamManagers();
    state.weekId = state.data.weeks[0]?.id || "";
    syncResourceUsers();
    hydrateFilters();
    hydrateAuth();
  });

async function loadServerState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error(`State API ${response.status}`);
    persistence.serverState = await response.json();
    persistence.apiAvailable = true;
    migrateLocalStorageToServer();
  } catch {
    persistence.serverState = {};
    persistence.apiAvailable = false;
  }
}

function readJsonStore(key, fallback) {
  if (persistence.apiAvailable && Object.prototype.hasOwnProperty.call(persistence.serverState, key)) {
    return persistence.serverState[key];
  }
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJsonStore(key, value) {
  persistence.serverState[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local mirror is best-effort; SQLite remains the source when API is available.
  }
  if (!persistence.apiAvailable) return;
  fetch("/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: value })
  }).catch(() => {
    persistence.apiAvailable = false;
  });
}

function migrateLocalStorageToServer() {
  if (!persistence.apiAvailable) return;
  const keys = [
    STORAGE_KEY,
    DELETED_WEEKS_KEY,
    PROJECT_META_KEY,
    USERS_KEY,
    MAIL_QUEUE_KEY,
    TEAM_MANAGERS_KEY,
    ROLES_KEY,
    SEARCH_VARIANTS_KEY
  ];
  const migration = {};
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(persistence.serverState, key)) return;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const value = JSON.parse(raw);
      persistence.serverState[key] = value;
      migration[key] = value;
    } catch {
      // Ignore invalid old browser state.
    }
  });
  if (Object.keys(migration).length) {
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(migration)
    }).catch(() => {
      persistence.apiAvailable = false;
    });
  }
}

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
    syncSearchVariantSelection();
    render();
  });
  el.roleSelect.addEventListener("change", (event) => {
    state.role = event.target.value;
    syncSearchVariantSelection();
    render();
  });
  el.projectSelect.addEventListener("change", (event) => {
    state.project = event.target.value;
    syncSearchVariantSelection();
    render();
  });
  el.searchVariantSelect.addEventListener("change", applySearchVariant);
  el.saveSearchVariantButton.addEventListener("click", saveCurrentSearchVariant);
  el.deleteSearchVariantButton.addEventListener("click", deleteCurrentSearchVariant);
  el.clearSearchVariantButton.addEventListener("click", clearSearchFilters);
  el.resourceMetric.addEventListener("click", openResourceManager);
  el.projectMetric.addEventListener("click", openProjectManager);
  el.homeView.addEventListener("click", onDashboardAction);
  el.assistantView.addEventListener("click", onAssistantAction);
  el.assistantRefreshButton.addEventListener("click", render);
  el.homeTab.addEventListener("click", () => setView("home"));
  el.gridTab.addEventListener("click", () => setView("grid"));
  el.assistantTab.addEventListener("click", () => setView("assistant"));
  el.consultantProfileTab.addEventListener("click", () => setView("consultantProfile"));
  el.personSummaryTab.addEventListener("click", () => setView("person"));
  el.projectReportTab.addEventListener("click", () => setView("projectReport"));
  el.orgTab.addEventListener("click", () => setView("org"));
  el.personSummarySelect.addEventListener("change", (event) => {
    state.personSummaryName = event.target.value;
    render();
  });
  el.consultantProfileSelect.addEventListener("change", (event) => {
    state.consultantProfileName = event.target.value;
    render();
  });
  el.consultantProfileEditButton.addEventListener("click", () => {
    if (!state.consultantProfileName) return;
    openResourceLinkedUser(state.consultantProfileName);
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
  el.approveWeekButton.addEventListener("click", openApproveWeekConfirmation);
  el.orgManageButton.addEventListener("click", openResourceManager);
  el.orgAddButton?.addEventListener("click", () => openTeamMemberPicker(""));
  el.orgChart.addEventListener("click", onOrgChartClick);
  el.planningHead.addEventListener("click", onPlanningHeaderClick);
  el.planningBody.addEventListener("click", onPlanningClick);
  el.modalClose.addEventListener("click", closeModal);
  el.projectModal.addEventListener("click", (event) => {
    if (isModalCloseLocked()) return;
    if (event.target === el.projectModal) closeModal();
  });
  el.modalBody.addEventListener("click", onModalAction);
  el.modalBody.addEventListener("input", onModalInput);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isModalCloseLocked()) return;
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
  el.searchInput.value = state.search;
  el.roleSelect.value = state.role;
  el.projectSelect.value = state.project;
  renderSearchVariants();
  const people = uniquePeople();
  if (!state.personSummaryName && people.length) state.personSummaryName = people[0];
  if (!state.consultantProfileName && people.length) state.consultantProfileName = people[0];
  el.personSummarySelect.innerHTML = people
    .map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)
    .join("");
  el.consultantProfileSelect.innerHTML = people
    .map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)
    .join("");
  el.personSummarySelect.value = state.personSummaryName;
  el.consultantProfileSelect.value = state.consultantProfileName;
  el.personPeriodSelect.value = state.personSummaryPeriod;
  syncReportProjectSelection();
  syncProjectReportDates();
}

function optionList(values) {
  return values.map((value) => `<option value="${escapeAttr(value)}">${escapeHtml(value)}</option>`).join("");
}

function currentSearchVariantUserKey() {
  return state.currentUser?.id || "anonymous";
}

function loadSearchVariants() {
  const stored = readJsonStore(SEARCH_VARIANTS_KEY, {});
  return stored && typeof stored === "object" ? stored : {};
}

function saveSearchVariants(allVariants) {
  writeJsonStore(SEARCH_VARIANTS_KEY, allVariants);
}

function userSearchVariants() {
  const allVariants = loadSearchVariants();
  const variants = allVariants[currentSearchVariantUserKey()];
  return Array.isArray(variants) ? variants : [];
}

function renderSearchVariants() {
  if (!el.searchVariantSelect) return;
  const variants = userSearchVariants();
  el.searchVariantSelect.innerHTML = `<option value="">Unsaved search</option>` + variants
    .map((variant) => `<option value="${escapeAttr(variant.name)}">${escapeHtml(variant.name)}</option>`)
    .join("");
  syncSearchVariantSelection();
}

function syncSearchVariantSelection() {
  if (!el.searchVariantSelect) return;
  const matched = userSearchVariants().find((variant) =>
    normalizeSearchTerm(variant.search || "") === state.search &&
    (variant.role || "All") === state.role &&
    (variant.project || "All") === state.project
  );
  el.searchVariantSelect.value = matched?.name || "";
}

function applySearchVariant() {
  const name = el.searchVariantSelect.value;
  const variant = userSearchVariants().find((item) => item.name === name);
  if (!variant) return;
  state.search = normalizeSearchTerm(variant.search || "");
  state.role = variant.role || "All";
  state.project = activeProjects().includes(variant.project) ? variant.project : "All";
  renderFilterOptions();
  render();
}

function saveCurrentSearchVariant() {
  const proposed = el.searchVariantSelect.value || searchVariantDefaultName();
  const name = prompt("Search variant name", proposed);
  if (!name?.trim()) return;
  const cleanName = name.trim();
  const allVariants = loadSearchVariants();
  const userKey = currentSearchVariantUserKey();
  const variants = Array.isArray(allVariants[userKey]) ? allVariants[userKey] : [];
  const nextVariant = {
    name: cleanName,
    search: state.search,
    role: state.role,
    project: state.project
  };
  const index = variants.findIndex((variant) => variant.name.toLowerCase() === cleanName.toLowerCase());
  if (index >= 0) {
    variants[index] = nextVariant;
  } else {
    variants.push(nextVariant);
  }
  allVariants[userKey] = variants.sort((a, b) => a.name.localeCompare(b.name));
  saveSearchVariants(allVariants);
  renderSearchVariants();
}

function deleteCurrentSearchVariant() {
  const name = el.searchVariantSelect.value;
  if (!name) return;
  const allVariants = loadSearchVariants();
  const userKey = currentSearchVariantUserKey();
  allVariants[userKey] = (allVariants[userKey] || []).filter((variant) => variant.name !== name);
  saveSearchVariants(allVariants);
  el.searchVariantSelect.value = "";
  renderSearchVariants();
}

function clearSearchFilters() {
  state.search = "";
  state.role = "All";
  state.project = "All";
  renderFilterOptions();
  render();
}

function searchVariantDefaultName() {
  const parts = [];
  if (state.search) parts.push(el.searchInput.value.trim());
  if (state.role !== "All") parts.push(state.role);
  if (state.project !== "All") parts.push(state.project);
  return parts.filter(Boolean).join(" / ") || "My search";
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
  refreshWelcomeCard();
  loadWelcomeWeather();
  renderFilterOptions();
  setView(state.view);
  render();
}

function syncUserChrome() {
  const user = state.currentUser;
  el.currentUserButton.textContent = user ? `${user.name}${user.admin ? " (Admin)" : ""}` : "";
  refreshWelcomeCard();
  el.adminTab?.classList.add("hidden");
  el.orgManageButton.classList.toggle("hidden", !user?.admin);
  el.orgAddButton?.classList.toggle("hidden", !user?.admin);
  if (state.view === "admin") setView("home");
  el.newWeekButton.disabled = !canChange();
  el.clearWeekButton.disabled = !canDelete();
  updateApprovalButton();
}

function refreshWelcomeCard() {
  if (!el.welcomeText) return;
  const userName = state.currentUser?.name || "there";
  el.welcomeText.textContent = `${greetingForNow()}, ${userName}`;
  el.welcomeSubtext.textContent = "Planlama ekranı hazır.";
  el.weatherTemp.textContent = state.weather.temperature || "--";
  el.weatherLocation.textContent = state.weather.location || "Konum yükleniyor";
  el.weatherSummary.textContent = state.weather.summary || "Hava durumu yükleniyor";
  el.weatherScene.className = `weather-scene weather-${state.weather.kind || "loading"}`;
}

function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

async function loadWelcomeWeather() {
  if (state.weather.loading || state.weather.loaded) return;
  state.weather.loading = true;
  refreshWelcomeCard();
  try {
    const coords = await currentBrowserPosition();
    const weather = await fetchWeatherForCoords(coords.latitude, coords.longitude);
    state.weather = { ...state.weather, ...weather, loaded: true, loading: false };
  } catch {
    try {
      const weather = await fetchWeatherForCoords(41.0082, 28.9784, "Istanbul");
      state.weather = { ...state.weather, ...weather, loaded: true, loading: false };
    } catch {
      state.weather = {
        ...state.weather,
        location: "Istanbul",
        temperature: "--",
        summary: "Hava durumu alınamadı",
        kind: "cloudy",
        loaded: true,
        loading: false
      };
    }
  }
  refreshWelcomeCard();
}

function currentBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      reject,
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 900000 }
    );
  });
}

async function fetchWeatherForCoords(latitude, longitude, fallbackLocation = "Mevcut konum") {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: "temperature_2m,weather_code",
    timezone: "auto"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) throw new Error("Weather request failed");
  const payload = await response.json();
  const location = await reverseGeocode(latitude, longitude).catch(() => fallbackLocation);
  const temperature = payload.current?.temperature_2m;
  return {
    location,
    temperature: Number.isFinite(temperature) ? `${Math.round(temperature)}°C` : "--",
    summary: weatherCodeLabel(payload.current?.weather_code),
    kind: weatherCodeKind(payload.current?.weather_code)
  };
}

async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    localityLanguage: "en"
  });
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`);
  if (!response.ok) throw new Error("Location request failed");
  const payload = await response.json();
  return payload.city || payload.locality || payload.principalSubdivision || payload.countryName || "Current location";
}

function weatherCodeLabel(code) {
  const labels = {
    0: "Açık",
    1: "Az bulutlu",
    2: "Parçalı bulutlu",
    3: "Bulutlu",
    45: "Sisli",
    48: "Sisli",
    51: "Hafif çisenti",
    53: "Çisenti",
    55: "Yoğun çisenti",
    61: "Hafif yağmur",
    63: "Yağmur",
    65: "Kuvvetli yağmur",
    71: "Hafif kar",
    73: "Kar",
    75: "Yoğun kar",
    80: "Hafif sağanak",
    81: "Sağanak",
    82: "Kuvvetli sağanak",
    95: "Gök gürültülü"
  };
  return labels[code] || "Hava durumu güncel";
}

function weatherCodeKind(code) {
  if ([0, 1].includes(code)) return "sunny";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75].includes(code)) return "snowy";
  if ([95].includes(code)) return "stormy";
  return "cloudy";
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
      demands: {},
      inactive: false,
      deleted: false
    };
  }
  if (!state.data.projectMeta[project].demands || typeof state.data.projectMeta[project].demands !== "object") {
    state.data.projectMeta[project].demands = {};
  }
  return state.data.projectMeta[project];
}

function setView(view) {
  state.view = view;
  el.homeTab.classList.toggle("active", view === "home");
  el.gridTab.classList.toggle("active", view === "grid");
  el.assistantTab.classList.toggle("active", view === "assistant");
  el.consultantProfileTab.classList.toggle("active", view === "consultantProfile");
  el.personSummaryTab.classList.toggle("active", view === "person");
  el.projectReportTab.classList.toggle("active", view === "projectReport");
  el.orgTab.classList.toggle("active", view === "org");
  el.adminTab?.classList.toggle("active", view === "admin");
  el.homeView.classList.toggle("hidden", view !== "home");
  el.assistantView.classList.toggle("hidden", view !== "assistant");
  el.gridView.classList.toggle("hidden", view !== "grid");
  el.consultantProfileView.classList.toggle("hidden", view !== "consultantProfile");
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
    resources: source.resources.filter((resource) => !resource.fromUser).map((resource) => ({
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
  syncResourceUsers();
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
  const plannedSlots = Object.values(projectLoads).reduce((sum, value) => sum + value, 0);
  const plannedProjects = Object.keys(projectLoads).length;
  el.resourceCount.textContent = resources.length;
  el.assignmentCount.textContent = plannedSlots;
  el.projectCount.textContent = plannedProjects;

  renderDashboard(week, resources, projectLoads, roleLoads);
  renderPlanningAssistant(week, resources);
  renderGrid(week, resources);
  renderConsultantProfile();
  renderPersonSummary();
  renderProjectReport();
  if (state.view === "org") renderOrgChart();
  updateApprovalButton();
}

function renderDashboard(week, resources, projectLoads, roleLoads) {
  const plannedSlots = Object.values(projectLoads).reduce((sum, value) => sum + value, 0);
  const totalSlots = resources.length * week.days.length * 2;
  const openSlots = Math.max(0, totalSlots - plannedSlots);
  const roleSlotLoads = countRoleSlots(resources);
  const attentionItems = dashboardAttentionItems(week, resources, openSlots);
  const available = dashboardAvailableResources(resources).slice(0, 8);

  el.dashboardTitle.textContent = `${week.title} Dashboard`;
  el.dashboardMeta.textContent = `${resources.length} visible consultant${resources.length === 1 ? "" : "s"} - ${formatDays(plannedSlots / 2)} days planned`;
  el.dashboardStatus.textContent = week.approved ? "Approved" : week.draft ? "Draft" : "Active";
  el.dashboardStatus.className = `dashboard-status ${week.approved ? "approved" : week.draft ? "draft" : ""}`;
  el.dashboardResourceCount.textContent = resources.length;
  el.dashboardSlotCount.textContent = plannedSlots;
  el.dashboardOpenSlotCount.textContent = openSlots;
  el.dashboardProjectCount.textContent = Object.keys(projectLoads).length;
  el.dashboardAttentionCount.textContent = `${attentionItems.length} item${attentionItems.length === 1 ? "" : "s"}`;
  el.dashboardAttentionList.innerHTML = attentionItems.length
    ? attentionItems.map((item) => `
      <div class="dashboard-list-row ${item.level}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.detail)}</span>
      </div>
    `).join("")
    : `<p class="dashboard-empty">No urgent items for this view.</p>`;
  el.dashboardAvailableCount.textContent = `${available.length} shown`;
  el.dashboardAvailableList.innerHTML = available.length
    ? available.map((item) => `
      <div class="dashboard-list-row">
        <button class="dashboard-link" type="button" data-action="open-consultant-profile" data-person="${escapeAttr(item.resource.name)}">${escapeHtml(item.resource.name)}</button>
        <span>${escapeHtml(item.resource.role || "-")} - ${item.slots}/10 slots planned</span>
      </div>
    `).join("")
    : `<p class="dashboard-empty">No available consultants in the current filter.</p>`;
  renderDashboardDemands(week, resources);
  el.dashboardTopProjectCount.textContent = `${Object.keys(projectLoads).length} projects`;
  renderDashboardPie(el.dashboardTopProjectPie, el.dashboardTopProjectLegend, projectLoads, {
    limit: 7,
    valueSuffix: " slots"
  });
  el.dashboardRoleCount.textContent = `${Object.keys(roleLoads).length} roles`;
  renderDashboardPie(el.dashboardRolePie, el.dashboardRoleLegend, roleSlotLoads, {
    limit: 7,
    valueSuffix: " slots"
  });
}

function renderDashboardDemands(week, resources) {
  const rows = projectDemandRows(week, resources);
  el.dashboardDemandList.innerHTML = rows.length
    ? rows.slice(0, 8).map((row) => {
      const level = row.gap > 0 ? "danger" : row.gap < 0 ? "info" : "";
      const status = row.gap > 0
        ? `${row.gap} open`
        : row.gap < 0
          ? `${Math.abs(row.gap)} extra`
          : "Covered";
      return `
        <div class="dashboard-list-row ${level}">
          <strong>${escapeHtml(row.project)} - ${escapeHtml(row.role)}</strong>
          <span>Needed ${row.required}, planned ${row.planned} · ${status}</span>
        </div>
      `;
    }).join("")
    : `<p class="dashboard-empty">No project demands defined for this week.</p>`;
}

function projectDemandRows(week, resources) {
  return activeProjects()
    .flatMap((project) => {
      const weeklyDemand = projectWeekDemand(project, week.id);
      return Object.entries(weeklyDemand)
        .map(([role, required]) => ({
          project,
          role,
          required: Number(required) || 0,
          planned: plannedProjectRolePeople(resources, project, role)
        }))
        .filter((row) => row.required > 0)
        .map((row) => ({ ...row, gap: row.required - row.planned }));
    })
    .sort((a, b) => b.gap - a.gap || b.required - a.required || a.project.localeCompare(b.project));
}

function projectWeekDemand(project, weekId) {
  const definition = projectDefinition(project);
  if (!definition.demands[weekId] || typeof definition.demands[weekId] !== "object") {
    definition.demands[weekId] = {};
  }
  return definition.demands[weekId];
}

function plannedProjectRolePeople(resources, project, role) {
  return resources.filter((resource) => {
    if ((resource.role || "") !== role) return false;
    return Object.values(resource.assignments || {}).some((day) => day.am === project || day.pm === project);
  }).length;
}

function renderDashboardPie(chart, legend, data, options = {}) {
  const colors = ["#0b6bcb", "#2aa876", "#e0a019", "#c0392b", "#6f42c1", "#00838f", "#8d6e63", "#455a64"];
  const limit = options.limit || 7;
  const entries = Object.entries(data).slice(0, limit);
  const overflow = Object.entries(data).slice(limit).reduce((sum, entry) => sum + entry[1], 0);
  if (overflow) entries.push(["Other", overflow]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);

  if (!total) {
    chart.style.background = "#e6edf3";
    chart.innerHTML = `<span class="dashboard-pie-empty">No data</span>`;
    legend.innerHTML = `<p class="dashboard-empty">No planning data for this view.</p>`;
    return;
  }

  let cursor = 0;
  const slices = entries.map(([, value], index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  chart.style.background = `conic-gradient(${slices.join(", ")})`;
  chart.innerHTML = `<span class="dashboard-pie-total"><strong>${total}</strong><em>Total</em></span>`;
  legend.innerHTML = entries.map(([label, value], index) => {
    const percent = Math.round((value / total) * 100);
    return `
      <div class="dashboard-pie-row">
        <span class="legend-swatch" style="background:${colors[index % colors.length]}"></span>
        <span class="legend-label" title="${escapeAttr(label)}">${escapeHtml(label)}</span>
        <strong>${value}</strong>
        <span>${percent}%</span>
      </div>
    `;
  }).join("");
}

function renderPlanningAssistant(week, resources) {
  const gaps = projectDemandRows(week, resources).filter((row) => row.gap > 0);
  const suggestions = planningAssistantSuggestions(week, resources, gaps);
  const available = dashboardAvailableResources(resources).slice(0, 10);

  el.assistantTitle.textContent = `${week.title} Planning Assistant`;
  el.assistantMeta.textContent = `${gaps.length} demand gap${gaps.length === 1 ? "" : "s"} · ${suggestions.length} actionable suggestion${suggestions.length === 1 ? "" : "s"}`;
  el.assistantGapCount.textContent = `${gaps.length} gap${gaps.length === 1 ? "" : "s"}`;
  el.assistantGapList.innerHTML = gaps.length
    ? gaps.map((row) => `
      <div class="dashboard-list-row danger">
        <strong>${escapeHtml(row.project)} - ${escapeHtml(row.role)}</strong>
        <span>Needed ${row.required}, planned ${row.planned}; ${row.gap} still open</span>
      </div>
    `).join("")
    : `<p class="dashboard-empty">No demand gaps in the current week.</p>`;

  el.assistantSuggestionCount.textContent = `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}`;
  el.assistantSuggestionList.innerHTML = suggestions.length
    ? suggestions.map((item) => `
      <div class="assistant-suggestion">
        <div>
          <strong>${escapeHtml(item.resource.name)} → ${escapeHtml(item.project)}</strong>
          <span>${escapeHtml(item.role)} · ${escapeHtml(item.day.label)} ${escapeHtml(item.period.toUpperCase())} · current load ${item.load}/10</span>
        </div>
        <button type="button" data-action="assistant-apply" data-resource="${escapeAttr(item.resource.name)}" data-project="${escapeAttr(item.project)}" data-day="${escapeAttr(item.day.key)}" data-period="${escapeAttr(item.period)}">Apply</button>
      </div>
    `).join("")
    : `<p class="dashboard-empty">No safe automatic suggestion found. Add demand or free a consultant slot.</p>`;

  el.assistantAvailableCount.textContent = `${available.length} shown`;
  el.assistantAvailableList.innerHTML = available.length
    ? available.map((item) => {
      const openSlot = firstOpenSlot(item.resource, week);
      return `
        <div class="dashboard-list-row">
          <button class="dashboard-link" type="button" data-action="open-consultant-profile" data-person="${escapeAttr(item.resource.name)}">${escapeHtml(item.resource.name)}</button>
          <span>${escapeHtml(item.resource.role || "-")} · ${item.slots}/10 planned · ${openSlot ? `${escapeHtml(openSlot.day.label)} ${escapeHtml(openSlot.period.toUpperCase())} open` : "No open slot"}</span>
        </div>
      `;
    }).join("")
    : `<p class="dashboard-empty">No low-load consultants in the current filter.</p>`;
}

function planningAssistantSuggestions(week, resources, gaps) {
  const usedResources = new Set();
  return gaps.flatMap((gap) => {
    const candidates = resources
      .map((resource) => ({
        resource,
        load: plannedSlotCount(resource),
        openSlot: firstOpenSlot(resource, week)
      }))
      .filter((item) =>
        item.openSlot &&
        item.load < week.days.length * 2 &&
        !usedResources.has(item.resource.name) &&
        (item.resource.role || "") === gap.role &&
        !isResourceOnProject(item.resource, gap.project)
      )
      .sort((a, b) => a.load - b.load || a.resource.name.localeCompare(b.resource.name))
      .slice(0, gap.gap);

    candidates.forEach((item) => usedResources.add(item.resource.name));
    return candidates.map((item) => ({
      project: gap.project,
      role: gap.role,
      resource: item.resource,
      load: item.load,
      day: item.openSlot.day,
      period: item.openSlot.period
    }));
  }).slice(0, 12);
}

function firstOpenSlot(resource, week) {
  for (const day of week.days) {
    const assignment = resource.assignments?.[day.key] || {};
    for (const period of ["am", "pm"]) {
      if (!assignment[period]) return { day, period };
    }
  }
  return null;
}

function isResourceOnProject(resource, project) {
  return Object.values(resource.assignments || {}).some((day) => day.am === project || day.pm === project);
}

function applyAssistantSuggestion(button) {
  if (!requirePermission("change", "You need change authorization to apply planning suggestions.")) return;
  const week = currentWeek();
  const resource = week.resources.find((item) => item.name === button.dataset.resource);
  const day = week.days.find((item) => item.key === button.dataset.day);
  const period = button.dataset.period;
  const project = button.dataset.project;
  if (!resource || !day || !["am", "pm"].includes(period) || !project) return;
  const slot = resource.assignments[day.key] || {};
  if (slot[period]) {
    openInfoModal("Slot already planned", "This slot is no longer empty. Refresh the assistant suggestions.");
    return;
  }
  slot[period] = project;
  slot[`${period}Room`] = false;
  slot[`${period}Note`] = "Assigned by planning assistant";
  resource.assignments[day.key] = slot;
  markSlotChanged(slot, period);
  markResourceChanged(resource);
  markWeekDraft(week);
  saveDrafts();
  state.activeSelection = { project, dayKey: day.key, period };
  render();
}

function dashboardAttentionItems(week, resources, openSlots) {
  const recipients = approvalMailRecipients(week).filter((item) =>
    resources.some((resource) => resource.name === item.resource.name)
  );
  const demandGaps = projectDemandRows(week, resources).filter((row) => row.gap > 0);
  const missingPersonMail = recipients.filter((item) => !item.to).length;
  const missingManagerMail = recipients.filter((item) => item.manager && !item.cc).length;
  const emptyPeople = resources.filter((resource) => plannedSlotCount(resource) === 0).length;
  const items = [];
  if (week.draft) {
    items.push({ level: "warn", title: "Week is still draft", detail: "Approve the week before sending final plans." });
  }
  if (missingPersonMail) {
    items.push({ level: "danger", title: "Missing consultant mail", detail: `${missingPersonMail} consultant${missingPersonMail === 1 ? "" : "s"} need an email address.` });
  }
  if (missingManagerMail) {
    items.push({ level: "warn", title: "Missing manager mail", detail: `${missingManagerMail} manager CC address${missingManagerMail === 1 ? "" : "es"} missing.` });
  }
  if (demandGaps.length) {
    const totalGap = demandGaps.reduce((sum, row) => sum + row.gap, 0);
    items.push({ level: "danger", title: "Project demand gap", detail: `${totalGap} requested consultant${totalGap === 1 ? "" : "s"} not covered by the plan.` });
  }
  if (emptyPeople) {
    items.push({ level: "info", title: "Unplanned consultants", detail: `${emptyPeople} consultant${emptyPeople === 1 ? "" : "s"} have no assignments this week.` });
  }
  if (openSlots) {
    items.push({ level: "info", title: "Open capacity", detail: `${openSlots} half-day slot${openSlots === 1 ? "" : "s"} are still open.` });
  }
  return items;
}

function dashboardAvailableResources(resources) {
  return resources
    .map((resource) => ({ resource, slots: plannedSlotCount(resource) }))
    .filter((item) => item.slots <= 4)
    .sort((a, b) => a.slots - b.slots || a.resource.name.localeCompare(b.resource.name));
}

function plannedSlotCount(resource) {
  return Object.values(resource.assignments || {}).reduce((count, day) => {
    return count + (day.am ? 1 : 0) + (day.pm ? 1 : 0);
  }, 0);
}

function countRoleSlots(resources) {
  const counts = {};
  resources.forEach((resource) => {
    const role = resource.role || "Unknown";
    counts[role] = (counts[role] || 0) + plannedSlotCount(resource);
  });
  return sortObject(counts);
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

function renderConsultantProfile() {
  const personName = state.consultantProfileName || uniquePeople()[0] || "";
  if (!personName || !el.consultantProfileName) return;
  const week = currentWeek();
  const currentResource = week.resources.find((item) => item.name === personName)
    || resourcesForUserDefinition().find((item) => item.name === personName);
  if (!currentResource) return;

  const user = userForResource(currentResource);
  const manager = managerForResource(currentResource, user);
  const weekSlots = plannedSlotCount(currentResource);
  const yearWeeks = consultantYearWeeks();
  const yearDistribution = countPersonTime(personName, yearWeeks);
  const yearDays = Object.values(yearDistribution).reduce((sum, value) => sum + value, 0);
  const history = consultantRecentWeeks(personName).slice(0, 8);

  el.consultantProfileSelect.value = personName;
  el.consultantProfileName.textContent = personName;
  el.consultantProfileRole.textContent = currentResource.role || "-";
  el.consultantProfileDetails.innerHTML = `
    <div><span>Jira</span><strong>${escapeHtml(currentResource.jiraName || "-")}</strong></div>
    <div><span>Email</span><strong>${escapeHtml(cleanMailAddress(user?.email) || "-")}</strong></div>
    <div><span>Manager</span><strong>${escapeHtml(manager?.name || resourceManagerName(personName) || "-")}</strong></div>
    <div><span>Status</span><strong>${currentResource.inactive ? "Inactive" : "Active"}</strong></div>
  `;
  el.consultantWeekLoad.textContent = `${formatDays(weekSlots / 2)}d`;
  el.consultantOpenSlots.textContent = Math.max(0, (week.days.length * 2) - weekSlots);
  el.consultantYearLoad.textContent = `${formatDays(yearDays)}d`;
  el.consultantWeekMeta.textContent = week.title;
  el.consultantWeekPlan.innerHTML = renderConsultantWeekPlan(week, currentResource);
  el.consultantProjectMixMeta.textContent = `${parseWeekDate(week.title).getFullYear()} project distribution`;
  renderProfilePie(el.consultantProjectPie, el.consultantProjectLegend, yearDistribution);
  el.consultantHistoryMeta.textContent = `${history.length} week${history.length === 1 ? "" : "s"}`;
  el.consultantHistoryList.innerHTML = history.length
    ? history.map((item) => `
      <div class="dashboard-list-row">
        <strong>${escapeHtml(item.week.title)}</strong>
        <span>${formatDays(item.days)}d planned · ${escapeHtml(item.projects.join(", ") || "No project")}</span>
      </div>
    `).join("")
    : `<p class="dashboard-empty">No history found for this consultant.</p>`;
}

function renderConsultantWeekPlan(week, resource) {
  return week.days.map((day) => {
    const assignment = resource.assignments?.[day.key] || {};
    return `
      <div class="consultant-day-card">
        <strong>${escapeHtml(day.label)}<span>${escapeHtml(day.date)}</span></strong>
        <div><em>AM</em><span>${escapeHtml(assignment.am || "-")}</span>${assignment.amNote ? `<small>${escapeHtml(assignment.amNote)}</small>` : ""}</div>
        <div><em>PM</em><span>${escapeHtml(assignment.pm || "-")}</span>${assignment.pmNote ? `<small>${escapeHtml(assignment.pmNote)}</small>` : ""}</div>
      </div>
    `;
  }).join("");
}

function consultantYearWeeks() {
  const selectedDate = parseWeekDate(currentWeek().title);
  return state.data.weeks.filter((week) => parseWeekDate(week.title).getFullYear() === selectedDate.getFullYear());
}

function consultantRecentWeeks(personName) {
  return state.data.weeks
    .map((week) => {
      const resource = week.resources.find((item) => item.name === personName);
      if (!resource) return null;
      const distribution = countPersonTime(personName, [week]);
      const days = Object.values(distribution).reduce((sum, value) => sum + value, 0);
      return { week, days, projects: Object.keys(distribution) };
    })
    .filter(Boolean);
}

function renderProfilePie(chart, legend, data) {
  const colors = ["#0b6bcb", "#2aa876", "#e0a019", "#c0392b", "#6f42c1", "#00838f", "#8d6e63", "#455a64"];
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);
  if (!total) {
    chart.style.background = "#e6edf3";
    chart.innerHTML = `<span class="dashboard-pie-empty">No data</span>`;
    legend.innerHTML = `<p class="dashboard-empty">No project data for this year.</p>`;
    return;
  }
  let cursor = 0;
  const slices = entries.map(([, value], index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });
  chart.style.background = `conic-gradient(${slices.join(", ")})`;
  chart.innerHTML = `<span class="dashboard-pie-total"><strong>${formatDays(total)}</strong><em>Days</em></span>`;
  legend.innerHTML = entries.map(([label, value], index) => `
    <div class="dashboard-pie-row">
      <span class="legend-swatch" style="background:${colors[index % colors.length]}"></span>
      <span class="legend-label" title="${escapeAttr(label)}">${escapeHtml(label)}</span>
      <strong>${formatDays(value)}d</strong>
      <span>${Math.round((value / total) * 100)}%</span>
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
  if (action === "users-export") exportUsersToExcel();
  if (action === "users-import") openImportFile("users");
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
  if (action === "project-demand-manager") openProjectDemandManager(event.target.dataset.project || "");
  if (action === "project-demand-save") saveProjectDemand();
  if (action === "project-demand-clear") clearProjectDemand(event.target.dataset.project, event.target.dataset.role);
  if (action === "projects-export") exportProjectsToExcel();
  if (action === "projects-import") openImportFile("projects");
  if (action === "admin-edit-user") openAuthorizationForm(event.target.dataset.userId);
  if (action === "admin-save-user") saveUser();
  if (action === "admin-save-authorization") saveAuthorization();
  if (action === "admin-generate-password") generatePasswordForUserForm();
  if (action === "admin-reset-password") resetUserPassword(event.target.dataset.userId);
  if (action === "admin-panel") openAdminPanel();
  if (action === "mail-drafts") openMailDrafts();
  if (action === "mail-view") openMailPreview(event.target.dataset.mailId);
  if (action === "mail-toggle-sent") toggleMailSent(event.target.dataset.mailId);
  if (action === "approve-week-yes") openWeeklyApprovalMailDialog();
  if (action === "approve-week-no") closeModal();
  if (action === "weekly-mail-select-all") setWeeklyApprovalMailSelection(true);
  if (action === "weekly-mail-clear") setWeeklyApprovalMailSelection(false);
  if (action === "weekly-mail-preview-toggle") toggleWeeklyMailPreview(event.target);
  if (action === "weekly-mail-copy") copyWeeklyMail(event.target);
  if (action === "weekly-mail-send") sendWeeklyApprovalMails();
  if (action === "weekly-mail-edit-address") openWeeklyMailAddressForm(event.target);
  if (action === "weekly-mail-address-save") saveWeeklyMailAddress();
  if (action === "open-change-password") openChangePassword();
  if (action === "password-change-save") savePasswordChange();
  if (action === "password-forgot-save") handleForgotPassword();
  if (action === "toggle-notes-column") toggleNotesColumn();
}

function onDashboardAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "project-demand-manager") openProjectDemandManager(button.dataset.project || "");
  if (button.dataset.action === "open-consultant-profile") {
    state.consultantProfileName = button.dataset.person || "";
    setView("consultantProfile");
    render();
  }
}

function onAssistantAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "assistant-apply") applyAssistantSuggestion(button);
  if (button.dataset.action === "open-consultant-profile") {
    state.consultantProfileName = button.dataset.person || "";
    setView("consultantProfile");
    render();
  }
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

const USER_IMPORT_HEADERS = ["Name", "User Name", "Email", "Role", "Resource Name", "Manager", "Admin", "Active", "Resource", "Read", "Change", "Delete", "Password"];
const PROJECT_IMPORT_HEADERS = ["Project", "Project Manager", "Budget Days", "Inactive"];

function excelActionGroup(exportAction, importAction) {
  return `
    <div class="excel-action-group">
      ${excelActionButton(exportAction, "Export Excel", "Excel'e aktar", "up")}
      ${excelActionButton(importAction, "Import Excel", "Excel'den içe al", "down")}
    </div>
  `;
}

function excelActionButton(action, label, title, direction) {
  return `
    <button class="secondary excel-action" type="button" data-action="${action}" title="${escapeAttr(title)}" aria-label="${escapeAttr(title)}">
      ${excelIcon(direction)}
      <span>${label}</span>
    </button>
  `;
}

function excelIcon(direction) {
  const arrow = direction === "up"
    ? `<path d="M12 16V8m0 0-3 3m3-3 3 3" />`
    : `<path d="M12 8v8m0 0-3-3m3 3 3-3" />`;
  return `
    <svg class="excel-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 11.5 11 15m0-3.5L8.5 15" />
      ${arrow}
    </svg>
  `;
}

function exportUsersToExcel() {
  if (!state.currentUser?.admin) return;
  const managerById = new Map(state.users.map((user) => [user.id, user.name]));
  const rows = state.users.map((user) => ({
    "Name": user.name || "",
    "User Name": user.username || "",
    "Email": user.email || "",
    "Role": user.role || "",
    "Resource Name": user.resourceName || "",
    "Manager": managerById.get(user.managerId) || "",
    "Admin": yesNo(user.admin),
    "Active": yesNo(user.active !== false),
    "Resource": yesNo(user.isResource),
    "Read": yesNo(user.permissions?.read),
    "Change": yesNo(user.permissions?.change),
    "Delete": yesNo(user.permissions?.delete),
    "Password": user.password || ""
  }));
  downloadExcelTable("weekly-planning-users.xls", "Users", USER_IMPORT_HEADERS, rows);
}

function exportProjectsToExcel() {
  if (!requirePermission("change", "You need change authorization to manage projects.")) return;
  const rows = state.data.projects
    .filter((project) => !projectDefinition(project).deleted)
    .map((project) => {
      const definition = projectDefinition(project);
      return {
        "Project": project,
        "Project Manager": definition.manager || "",
        "Budget Days": definition.budgetDays || "",
        "Inactive": yesNo(definition.inactive)
      };
    });
  downloadExcelTable("weekly-planning-projects.xls", "Projects", PROJECT_IMPORT_HEADERS, rows);
}

function openImportFile(type) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xls,.xml,.csv,.tsv,.txt,.html";
  input.className = "hidden";
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) importExcelFile(type, file);
    input.remove();
  }, { once: true });
  document.body.appendChild(input);
  input.click();
}

function importExcelFile(type, file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseImportRows(String(reader.result || ""));
      const result = type === "users" ? importUsers(rows) : importProjects(rows);
      openInfoModal("Import completed", `${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`);
    } catch (error) {
      openInfoModal("Import failed", error.message || "The selected file could not be imported.");
    }
  };
  reader.onerror = () => openInfoModal("Import failed", "The selected file could not be read.");
  reader.readAsText(file, "utf-8");
}

function importUsers(rows) {
  if (!state.currentUser?.admin) return { created: 0, updated: 0, skipped: 0 };
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const pendingManagers = [];
  const userByName = () => new Map(state.users.map((user) => [normalizeKey(user.name), user]));
  const userByIdentity = () => new Map(state.users.flatMap((user) => [
    [normalizeKey(user.username), user],
    [normalizeKey(user.email), user]
  ].filter(([key]) => key)));

  rows.forEach((row) => {
    const name = cellValue(row, "Name").trim();
    const username = cellValue(row, "User Name", "Username").trim();
    if (!name || !username) {
      skipped += 1;
      return;
    }
    const email = cleanMailAddress(cellValue(row, "Email"));
    const role = cellValue(row, "Role").trim();
    const managerName = cellValue(row, "Manager").trim();
    const match = userByIdentity().get(normalizeKey(username))
      || (email ? userByIdentity().get(normalizeKey(email)) : null)
      || userByName().get(normalizeKey(name));
    const payload = normalizeUser({
      ...(match || {}),
      name,
      username,
      email,
      role,
      resourceName: cellValue(row, "Resource Name", "Resource").trim(),
      managerId: "",
      admin: parseBoolean(cellValue(row, "Admin"), match?.admin || false),
      active: parseBoolean(cellValue(row, "Active"), match?.active !== false),
      isResource: parseBoolean(cellValue(row, "Resource"), match?.isResource || false),
      password: cellValue(row, "Password").trim() || match?.password || "welcome123",
      permissions: {
        read: parseBoolean(cellValue(row, "Read"), match?.permissions?.read || false),
        change: parseBoolean(cellValue(row, "Change"), match?.permissions?.change || false),
        delete: parseBoolean(cellValue(row, "Delete"), match?.permissions?.delete || false)
      }
    });
    if (payload.admin) payload.permissions = { read: true, change: true, delete: true };
    if (match) {
      Object.assign(match, payload, { id: match.id });
      pendingManagers.push({ user: match, managerName });
      updated += 1;
    } else {
      const user = { ...payload, id: makeId("user") };
      state.users.push(user);
      pendingManagers.push({ user, managerName });
      created += 1;
    }
    if (role && !state.data.roles.some((item) => sameRole(item, role))) {
      state.data.roles = normalizeRoleList([...state.data.roles, role]);
    }
  });

  const managers = userByName();
  pendingManagers.forEach(({ user, managerName }) => {
    user.managerId = managerName ? managers.get(normalizeKey(managerName))?.id || "" : "";
  });

  saveUsers();
  saveRoleDefinitions();
  syncResourceUsers();
  syncUserChrome();
  renderFilterOptions();
  render();
  openResourceManager();
  return { created, updated, skipped };
}

function importProjects(rows) {
  if (!requirePermission("change", "You need change authorization to manage projects.")) return { created: 0, updated: 0, skipped: 0 };
  let created = 0;
  let updated = 0;
  let skipped = 0;
  rows.forEach((row) => {
    const name = cellValue(row, "Project", "Project Name").trim();
    if (!name) {
      skipped += 1;
      return;
    }
    const exists = state.data.projects.some((project) => project === name);
    if (!exists) {
      state.data.projects.push(name);
      created += 1;
    } else {
      updated += 1;
    }
    state.data.projectMeta[name] = {
      ...projectDefinition(name),
      manager: cellValue(row, "Project Manager", "Manager").trim(),
      budgetDays: cellValue(row, "Budget Days", "Budget").trim(),
      inactive: parseBoolean(cellValue(row, "Inactive"), false),
      deleted: false
    };
  });
  state.data.projects = Array.from(new Set(state.data.projects)).sort();
  saveProjectDefinitions();
  renderFilterOptions();
  render();
  openProjectManager();
  return { created, updated, skipped };
}

function downloadExcelTable(filename, sheetName, headers, rows) {
  const table = `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? "")}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><h1>${escapeHtml(sheetName)}</h1>${table}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseImportRows(content) {
  const trimmed = content.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("<")) return parseHtmlOrXmlRows(trimmed);
  const delimiter = trimmed.includes("\t") ? "\t" : ",";
  return tableRowsToObjects(parseDelimitedRows(trimmed, delimiter));
}

function parseHtmlOrXmlRows(content) {
  const doc = new DOMParser().parseFromString(content, "text/html");
  const rows = Array.from(doc.querySelectorAll("tr")).map((row) =>
    Array.from(row.children).map((cell) => cell.textContent.trim())
  );
  if (rows.length) return tableRowsToObjects(rows);
  const xml = new DOMParser().parseFromString(content, "application/xml");
  const xmlRows = Array.from(xml.getElementsByTagName("Row")).map((row) =>
    Array.from(row.getElementsByTagName("Data")).map((cell) => cell.textContent.trim())
  );
  return tableRowsToObjects(xmlRows);
}

function parseDelimitedRows(content, delimiter) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value.trim());
  rows.push(row);
  return rows.filter((item) => item.some(Boolean));
}

function tableRowsToObjects(rows) {
  const cleanRows = rows.filter((row) => row.some(Boolean));
  if (cleanRows.length < 2) return [];
  const headers = cleanRows[0].map(normalizeHeader);
  return cleanRows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      if (header) item[header] = row[index] || "";
    });
    return item;
  });
}

function cellValue(row, ...headers) {
  for (const header of headers) {
    const value = row[normalizeHeader(header)];
    if (value !== undefined) return String(value);
  }
  return "";
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function parseBoolean(value, fallback = false) {
  const normalized = normalizeKey(value);
  if (!normalized) return Boolean(fallback);
  return ["yes", "true", "1", "x", "active", "evet", "var"].includes(normalized);
}

function yesNo(value) {
  return value ? "Yes" : "No";
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
      ${excelActionGroup("projects-export", "projects-import")}
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
              <button type="button" data-action="project-demand-manager" data-project="${escapeAttr(project)}">Demand</button>
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

function openProjectDemandManager(selectedProject = "") {
  if (!requirePermission("change", "You need change authorization to manage project demands.")) return;
  const week = currentWeek();
  const projects = activeProjects();
  const roles = state.data.roles?.length ? state.data.roles : DEFAULT_ROLES;
  const project = selectedProject && projects.includes(selectedProject) ? selectedProject : projects[0] || "";
  const resources = week.resources.filter((resource) => !resource.inactive);
  const rows = projectDemandRows(week, resources);
  state.planningContext = { action: "project-demand-manager", weekId: week.id };
  el.modalTitle.textContent = "Project demands";
  el.modalMeta.textContent = `${week.title} weekly demand`;
  el.modalBody.innerHTML = `
    <div class="plan-form">
      <div class="modal-summary">
        <strong>Weekly project demand</strong>
        <span>Enter how many consultants are needed for a project and role. Dashboard compares this demand with the current plan.</span>
      </div>
      <label>
        <span>Project</span>
        <select id="demandProject">
          ${projects.map((item) => `<option value="${escapeAttr(item)}" ${item === project ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Role</span>
        <select id="demandRole">
          ${roles.map((role) => `<option value="${escapeAttr(role)}">${escapeHtml(role)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>Needed consultants</span>
        <input id="demandPeople" type="number" min="0" step="1" placeholder="0">
      </label>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="project-manager">Projects</button>
        <button type="button" data-action="project-demand-save" ${projects.length && roles.length ? "" : "disabled"}>Save demand</button>
      </div>
      <div class="demand-list">
        ${rows.length ? rows.map((row) => `
          <div class="demand-row ${row.gap > 0 ? "danger" : row.gap < 0 ? "info" : ""}">
            <div>
              <strong>${escapeHtml(row.project)} - ${escapeHtml(row.role)}</strong>
              <span>Needed ${row.required}, planned ${row.planned}</span>
            </div>
            <div class="resource-actions">
              <span>${row.gap > 0 ? `${row.gap} open` : row.gap < 0 ? `${Math.abs(row.gap)} extra` : "Covered"}</span>
              <button class="danger" type="button" data-action="project-demand-clear" data-project="${escapeAttr(row.project)}" data-role="${escapeAttr(row.role)}">Clear</button>
            </div>
          </div>
        `).join("") : `<p class="eyebrow">No demands defined for this week.</p>`}
      </div>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function saveProjectDemand() {
  if (!requirePermission("change", "You need change authorization to save project demands.")) return;
  const week = currentWeek();
  const project = document.querySelector("#demandProject")?.value || "";
  const role = document.querySelector("#demandRole")?.value || "";
  const value = Math.max(0, Math.floor(Number(document.querySelector("#demandPeople")?.value || 0)));
  if (!project || !role) return;
  const demand = projectWeekDemand(project, week.id);
  if (value > 0) {
    demand[role] = value;
  } else {
    delete demand[role];
  }
  saveProjectDefinitions();
  render();
  openProjectDemandManager(project);
}

function clearProjectDemand(project, role) {
  if (!requirePermission("change", "You need change authorization to clear project demands.")) return;
  const week = currentWeek();
  if (!project || !role) return;
  const demand = projectWeekDemand(project, week.id);
  delete demand[role];
  saveProjectDefinitions();
  render();
  openProjectDemandManager(project);
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
  const previousDefinition = context.originalName ? projectDefinition(context.originalName) : projectDefinition(name);
  state.data.projectMeta[name] = {
    ...previousDefinition,
    manager,
    budgetDays,
    inactive,
    deleted: false,
    demands: previousDefinition.demands || {}
  };
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
      ${state.currentUser?.admin ? `
        <div class="resource-toolbar-actions">
          <button type="button" data-action="resource-new-user">Create user</button>
          <button type="button" data-action="role-manager">Roles</button>
          ${excelActionGroup("users-export", "users-import")}
        </div>
      ` : ""}
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
    writeJsonStore(DELETED_WEEKS_KEY, Array.from(deleted));
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

function isModalCloseLocked() {
  return state.planningContext?.action === "weekly-mail-approval";
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
  return readJsonStore(STORAGE_KEY, []);
}

function loadDeletedWeeks() {
  return readJsonStore(DELETED_WEEKS_KEY, []);
}

function loadProjectDefinitions() {
  return readJsonStore(PROJECT_META_KEY, {});
}

function saveDrafts() {
  const drafts = state.data.weeks.filter((week) => week.draft);
  writeJsonStore(STORAGE_KEY, drafts);
}

function markWeekDraft(week) {
  if (!week) return;
  week.draft = true;
  week.approved = false;
  week.approvedAt = "";
}

function saveProjectDefinitions() {
  writeJsonStore(PROJECT_META_KEY, state.data.projectMeta || {});
}

function loadMailQueue() {
  return readJsonStore(MAIL_QUEUE_KEY, []);
}

function saveMailQueue() {
  writeJsonStore(MAIL_QUEUE_KEY, state.mailQueue);
}

function updateApprovalButton() {
  const week = currentWeek();
  const canApprove = Boolean(week?.draft && canChange());
  el.approveWeekButton.classList.toggle("hidden", !canApprove);
  el.approveWeekButton.disabled = !canApprove;
}

function openApproveWeekConfirmation() {
  if (!requirePermission("change", "You need change authorization to approve the weekly plan.")) return;
  const week = currentWeek();
  if (!week) return;
  state.planningContext = { action: "approve-week", weekId: week.id };
  el.modalTitle.textContent = "Approve draft";
  el.modalMeta.textContent = week.title;
  el.modalBody.innerHTML = `
    <p class="modal-summary">Do you want to approve this weekly draft and prepare notification mails?</p>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="approve-week-no">No</button>
      <button type="button" data-action="approve-week-yes">Yes</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function openWeeklyApprovalMailDialog() {
  if (!requirePermission("change", "You need change authorization to approve the weekly plan.")) return;
  const week = currentWeek();
  if (!week || state.planningContext?.weekId !== week.id) return;

  const recipients = approvalMailRecipients(week);
  state.planningContext = {
    action: "weekly-mail-approval",
    weekId: week.id,
    recipientNames: recipients.map((item) => item.resource.name)
  };
  el.modalTitle.textContent = "Weekly approval mails";
  el.modalMeta.textContent = `From: ${mailSenderAddress()}`;
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <div class="resource-toolbar-actions">
        <button type="button" data-action="weekly-mail-select-all">Select all</button>
        <button class="secondary" type="button" data-action="weekly-mail-clear">Clear</button>
      </div>
    </div>
    <div class="resource-list mail-recipient-list">
      ${recipients.map((item) => `
        <div class="resource-row mail-recipient-row">
          <div class="mail-recipient-content">
            <div class="mail-recipient-head">
              <div>
                <strong>${escapeHtml(item.resource.name)}</strong>
                ${item.to ? `<span class="mail-address-line">Mail: ${formatMailAddress(item.to)}</span>` : ""}
                <em>${item.manager ? `Manager: ${escapeHtml(item.manager.name || "-")}${item.cc ? ` - ${formatMailAddress(item.cc)}` : ""}` : "No manager CC"}</em>
                ${mailRecipientWarningButtons(item)}
              </div>
              <div class="mail-row-actions">
                <button type="button" data-action="weekly-mail-preview-toggle" data-resource="${escapeAttr(item.resource.name)}">Preview</button>
                <button type="button" data-action="weekly-mail-copy" data-resource="${escapeAttr(item.resource.name)}">Copy</button>
                <label class="mail-send-toggle">
                  <input class="weekly-mail-recipient" type="checkbox" value="${escapeAttr(item.resource.name)}" checked>
                  <span class="mail-switch" aria-hidden="true"></span>
                </label>
              </div>
            </div>
            <div id="weeklyMailPreview-${escapeAttr(item.resource.name)}" class="mail-preview compact hidden">${buildWeeklyPlanMailHtml(week, item.resource)}</div>
          </div>
        </div>
      `).join("") || `<p class="eyebrow">No active resources found for mail sending</p>`}
    </div>
    <p id="weeklyMailError" class="form-error"></p>
    <p id="weeklyMailSuccess" class="form-success"></p>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="close-modal">Cancel</button>
      <button type="button" data-action="weekly-mail-send" ${recipients.length ? "" : "disabled"}>Create EML</button>
    </div>
  `;
  el.projectModal.classList.remove("hidden");
}

function setWeeklyApprovalMailSelection(checked) {
  document.querySelectorAll(".weekly-mail-recipient").forEach((input) => {
    input.checked = checked;
  });
}

function formatMailAddress(value) {
  const email = cleanMailAddress(value);
  return escapeHtml(email);
}

function cleanMailAddress(value) {
  const email = String(value || "").trim();
  return email.includes("@") ? email : "";
}

function mailRecipientWarnings(item) {
  const warnings = [];
  if (!item.to) warnings.push("Kişi maili eksik.");
  if (item.manager && !item.cc) warnings.push("Yönetici maili eksik.");
  return warnings;
}

function mailRecipientWarningButtons(item) {
  const buttons = [];
  if (!item.to) {
    buttons.push(`
      <button class="mail-warning" type="button" data-action="weekly-mail-edit-address" data-user-id="${escapeAttr(item.user?.id || "")}" data-resource="${escapeAttr(item.resource.name)}" data-address-kind="person">
        Kişi maili eksik
      </button>
    `);
  }
  if (item.manager && !item.cc) {
    buttons.push(`
      <button class="mail-warning" type="button" data-action="weekly-mail-edit-address" data-user-id="${escapeAttr(item.manager.id || "")}" data-resource="${escapeAttr(item.resource.name)}" data-address-kind="manager">
        Yönetici maili eksik
      </button>
    `);
  }
  return buttons.join("");
}

function openWeeklyMailAddressForm(button) {
  const week = currentWeek();
  if (!week || state.planningContext?.action !== "weekly-mail-approval") return;
  const resourceName = button.dataset.resource || "";
  const kind = button.dataset.addressKind || "person";
  const userId = button.dataset.userId || "";
  const user = state.users.find((item) => item.id === userId);
  const displayName = user?.name || resourceName;
  state.planningContext = {
    ...state.planningContext,
    addressEdit: { userId: user?.id || "", resourceName, kind }
  };
  el.modalTitle.textContent = kind === "manager" ? "Manager mail" : "Person mail";
  el.modalMeta.textContent = `${displayName} - ${resourceName}`;
  el.modalBody.innerHTML = `
    <form class="plan-form">
      <label>
        <span>Email</span>
        <input id="weeklyMailAddressInput" type="email" value="${escapeAttr(user?.email || "")}" placeholder="mail@company.com">
      </label>
      <p id="weeklyMailAddressError" class="form-error"></p>
      <div class="modal-actions">
        <button class="secondary" type="button" data-action="approve-week-yes">Cancel</button>
        <button type="button" data-action="weekly-mail-address-save">Save</button>
      </div>
    </form>
  `;
}

function saveWeeklyMailAddress() {
  const edit = state.planningContext?.addressEdit;
  if (!edit) return;
  const input = document.querySelector("#weeklyMailAddressInput");
  const email = input?.value.trim() || "";
  if (!email || !input.validity.valid) {
    const error = document.querySelector("#weeklyMailAddressError");
    if (error) error.textContent = "Geçerli bir mail adresi gir.";
    input?.focus();
    return;
  }
  let user = state.users.find((item) => item.id === edit.userId);
  if (!user && edit.kind === "person") {
    const resource = resourcesForUserDefinition().find((item) => item.name === edit.resourceName);
    if (!resource) return;
    user = { ...defaultUserForResource(resource), id: makeId("user") };
    state.users.push(user);
  }
  if (!user) return;
  user.email = email;
  saveUsers();
  syncResourceUsers();
  state.planningContext.addressEdit = null;
  openWeeklyApprovalMailDialog();
}

function toggleWeeklyMailPreview(button) {
  const row = button.closest(".mail-recipient-row");
  const preview = row?.querySelector(".mail-preview");
  if (!preview) return;
  preview.classList.toggle("hidden");
}

function copyWeeklyMail(button) {
  const row = button.closest(".mail-recipient-row");
  if (!row) return;
  const name = row.querySelector(".weekly-mail-recipient")?.value || "";
  const week = currentWeek();
  const recipient = week ? approvalMailRecipients(week).find((item) => item.resource.name === name) : null;
  const to = recipient?.to || "";
  const cc = recipient?.cc || "";
  const text = [
    `To: ${to || "-"}`,
    `CC: ${cc || "-"}`,
    `Subject: Weekly work plan - ${week?.title || ""}`,
    "",
    week && recipient ? buildWeeklyPlanMailText(week, recipient.resource) : ""
  ].join("\n");

  navigator.clipboard?.writeText(text)
    .then(() => {
      const success = document.querySelector("#weeklyMailSuccess");
      if (success) success.textContent = `${name} mail content copied.`;
    })
    .catch(() => {
      const success = document.querySelector("#weeklyMailSuccess");
      if (success) success.textContent = "Copy was blocked by the browser. Select the preview text and press Ctrl+C.";
      row.querySelector(".mail-preview")?.classList.remove("hidden");
    });
}

function sendWeeklyApprovalMails() {
  if (!requirePermission("change", "You need change authorization to approve the weekly plan.")) return;
  const week = currentWeek();
  if (!week || state.planningContext?.action !== "weekly-mail-approval" || state.planningContext.weekId !== week.id) return;

  const selectedNames = Array.from(document.querySelectorAll(".weekly-mail-recipient:checked"))
    .map((input) => input.value);
  if (!selectedNames.length) {
    openInfoModal("No recipients selected", "Select at least one person before sending.");
    return;
  }

  const missing = [];
  const addressByName = new Map();
  const ccByName = new Map();
  approvalMailRecipients(week).forEach((item) => {
    if (!selectedNames.includes(item.resource.name)) return;
    addressByName.set(item.resource.name, item.to || "");
    ccByName.set(item.resource.name, item.cc || "");
    if (!item.to) missing.push(`${item.resource.name} kişi maili`);
    if (item.manager && !item.cc) missing.push(`${item.resource.name} yönetici maili`);
  });
  if (missing.length) {
    const error = document.querySelector("#weeklyMailError");
    if (error) error.textContent = `Eksik mail adresleri var: ${missing.join(", ")}`;
    return;
  }

  const selectedResources = week.resources.filter((resource) => selectedNames.includes(resource.name));
  week.draft = false;
  week.approved = true;
  week.approvedBy = state.currentUser?.name || "Unknown";
  week.approvedByEmail = mailSenderAddress();
  week.approvedAt = new Date().toISOString();
  queueWeeklyApprovalEmails(week, selectedResources, addressByName, ccByName);
  downloadWeeklyApprovalEmlFiles(week, selectedResources, addressByName, ccByName);
  saveDrafts();
  render();
  const success = document.querySelector("#weeklyMailSuccess");
  if (success) {
    success.textContent = `${selectedResources.length} EML file prepared. Open the downloaded files with Outlook and send after review.`;
  }
  selectedNames.forEach((name) => {
    const row = Array.from(document.querySelectorAll(".mail-recipient-row"))
      .find((item) => item.querySelector(".weekly-mail-recipient")?.value === name);
    row?.classList.add("mail-row-sent");
  });
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
      from: mailSenderAddress(),
      to: cleanMailAddress(user?.email) || cleanMailAddress(resource.jiraName),
      cc: cleanMailAddress(manager?.email),
      html
    });
  });
}

function approvalMailRecipients(week) {
  return week.resources
    .filter((resource) => !resource.inactive)
    .map((resource) => {
      const user = userForResource(resource);
      const manager = managerForResource(resource, user);
      return {
        resource,
        user,
        manager,
        to: cleanMailAddress(user?.email) || cleanMailAddress(resource.jiraName),
        cc: cleanMailAddress(manager?.email)
      };
    });
}

function managerForResource(resource, user = userForResource(resource)) {
  if (user?.managerId) return state.users.find((item) => item.id === user.managerId) || null;
  if (resource.manager) {
    const managerResource = resourcesForUserDefinition().find((item) => item.name === resource.manager);
    return managerResource ? userForResource(managerResource) : null;
  }
  return null;
}

function mailSenderAddress() {
  return state.currentUser?.email || state.currentUser?.username || "no-reply@company.local";
}

function queueWeeklyApprovalEmails(
  week,
  resources = week.resources.filter((resource) => !resource.inactive),
  addressByName = new Map(),
  ccByName = new Map()
) {
  resources.forEach((resource) => {
    const user = userForResource(resource);
    const manager = managerForResource(resource, user);
    addMailDraft({
      type: "weekly",
      subject: `Weekly work plan - ${week.title}`,
      from: mailSenderAddress(),
      to: cleanMailAddress(addressByName.get(resource.name)) || cleanMailAddress(user?.email) || cleanMailAddress(resource.jiraName),
      cc: cleanMailAddress(ccByName.get(resource.name)) || cleanMailAddress(manager?.email),
      html: buildWeeklyPlanMailHtml(week, resource)
    });
  });
}

function downloadWeeklyApprovalEmlFiles(week, resources, addressByName = new Map(), ccByName = new Map()) {
  resources.forEach((resource, index) => {
    const user = userForResource(resource);
    const manager = managerForResource(resource, user);
    const mail = {
      subject: `Weekly work plan - ${week.title}`,
      from: mailSenderAddress(),
      to: cleanMailAddress(addressByName.get(resource.name)) || cleanMailAddress(user?.email) || cleanMailAddress(resource.jiraName),
      cc: cleanMailAddress(ccByName.get(resource.name)) || cleanMailAddress(manager?.email),
      plainText: buildWeeklyPlanMailText(week, resource),
      html: buildWeeklyPlanMailHtml(week, resource)
    };
    setTimeout(() => downloadEmlFile(mail, `${week.title}-${resource.name}.eml`), index * 250);
  });
}

function downloadEmlFile(mail, filename) {
  const boundary = `weekly-plan-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const headers = [
    `From: ${formatEmlAddress(mail.from)}`,
    `To: ${formatEmlAddress(mail.to)}`,
    mail.cc ? `Cc: ${formatEmlAddress(mail.cc)}` : null,
    `Subject: ${encodeEmlHeader(mail.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ].filter(Boolean);
  const eml = [
    ...headers,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    mail.plainText || htmlToPlainText(mail.html),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    buildEmlHtmlDocument(mail.html),
    "",
    `--${boundary}--`,
    ""
  ].join("\r\n");
  const blob = new Blob([eml], { type: "message/rfc822;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = safeFilename(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatEmlAddress(value) {
  return String(value || "").replace(/[\r\n]/g, "").trim();
}

function encodeEmlHeader(value) {
  const text = String(value || "").replace(/[\r\n]/g, " ").trim();
  return /^[\x00-\x7F]*$/.test(text) ? text : `=?UTF-8?B?${btoa(unescape(encodeURIComponent(text)))}?=`;
}

function buildEmlHtmlDocument(html) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; background: #f4f7fb; font-family: Arial, sans-serif; color: #1f2933; }
      .mail-template { max-width: 920px; margin: 0; background: #ffffff; border: 1px solid #dce4ee; border-radius: 10px; overflow: hidden; font-size: 13px; }
      .mail-hero { background: #10233f; border-top: 4px solid #d71920; color: #ffffff; padding: 10px 16px; }
      .mail-brand-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
      .mail-brand-copy { min-width: 0; }
      .mail-logo-block { flex: 0 0 190px; text-align: right; }
      .mail-logo { width: 150px; max-width: 100%; height: auto; border: 0; padding: 0; }
      .mail-logo-caption { display: block; margin-top: 3px; color: #dce6f3; font-size: 9px; line-height: 1.2; white-space: nowrap; }
      .mail-kicker { margin: 0 0 3px; color: #b9c7da; font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
      .mail-hero h2 { margin: 0; color: #ffffff; font-size: 17px; line-height: 1.18; }
      .mail-hero p { margin: 4px 0 0; color: #e8eef7; font-size: 11px; }
      .mail-body { padding: 14px 16px 18px; }
      .mail-greeting { margin: 0 0 10px; color: #334e68; font-size: 12px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #d8e0e7; padding: 7px; text-align: left; vertical-align: top; font-size: 12px; }
      th { background: #eef3f8; color: #10233f; }
      .weekly-plan-table thead th { background: #10233f; color: #ffffff; border-color: #10233f; }
      .weekly-plan-table tbody th { background: #f7f9fc; color: #d71920; }
      .weekly-plan-table strong { color: #10233f; }
      .mail-cell-detail { display: block; margin-top: 5px; color: #334e68; font-size: 11px; line-height: 1.35; }
      .mail-cell-label { display: inline-block; margin-right: 4px; color: #d71920; font-weight: 700; }
      .mail-note-list { display: grid; gap: 6px; color: #334e68; font-size: 12px; line-height: 1.35; }
      .mail-footer { border-top: 1px solid #e2e8f0; color: #66788a; font-size: 11px; margin: 14px 0 0; padding-top: 10px; }
    </style>
  </head>
  <body>${html}</body>
</html>`;
}

function safeFilename(value) {
  return String(value || "weekly-plan.eml")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
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
            <span>From: ${escapeHtml(mail.from || "-")} - To: ${escapeHtml(mail.to || "-")} ${mail.cc ? `- CC: ${escapeHtml(mail.cc)}` : ""}</span>
            <em>${escapeHtml(formatAuditDate(mail.createdAt))} - ${escapeHtml(mail.type)} - ${mail.status === "Sent" ? "Sent" : "Prepared"}</em>
          </div>
          <div class="resource-actions">
            <button type="button" data-action="mail-view" data-mail-id="${escapeAttr(mail.id)}">Preview</button>
            <button type="button" data-action="mail-toggle-sent" data-mail-id="${escapeAttr(mail.id)}">${mail.status === "Sent" ? "Sent ✓" : "Mark sent"}</button>
          </div>
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
  el.modalMeta.textContent = `From: ${mail.from || "-"} - To: ${mail.to || "-"}${mail.cc ? ` - CC: ${mail.cc}` : ""}`;
  el.modalBody.innerHTML = `
    <div class="mail-preview-screen">
      <label class="sent-inline">
        <input type="checkbox" ${mail.status === "Sent" ? "checked" : ""} data-action="mail-toggle-sent" data-mail-id="${escapeAttr(mail.id)}">
        <span>Sent</span>
      </label>
      <div class="mail-preview">${mail.html}</div>
    </div>
    <div class="modal-actions">
      <button class="secondary" type="button" data-action="mail-drafts">Back</button>
      <button type="button" data-action="close-modal">Close</button>
    </div>
  `;
}

function toggleMailSent(mailId) {
  const mail = state.mailQueue.find((item) => item.id === mailId);
  if (!mail) return;
  mail.status = mail.status === "Sent" ? "Draft" : "Sent";
  mail.sentAt = mail.status === "Sent" ? new Date().toISOString() : "";
  saveMailQueue();
  openMailPreview(mailId);
}

function htmlToPlainText(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent.replace(/\n{3,}/g, "\n\n").trim();
}

function buildWeeklyPlanMailText(week, resource) {
  const lines = [
    `${week.title} Weekly Work Plan`,
    "",
    `Hello ${resource.name}, your approved weekly plan is below.`,
    "",
    ["Period", ...week.days.map((day) => `${day.label} ${day.date}`), "Notes"].join(" | "),
    ["---", ...week.days.map(() => "---"), "---"].join(" | ")
  ];
  ["am", "pm"].forEach((period) => {
    const cells = week.days.map((day) => weeklyPlanSlotText(week, resource, day, period));
    lines.push([period.toUpperCase(), ...cells, period === "am" ? weeklyPlanGeneralNoteText(resource) : "-"].join(" | "));
  });
  lines.push("");
  lines.push(`Approved by ${week.approvedBy || "-"} on ${formatAuditDate(week.approvedAt)}.`);
  return lines.join("\n");
}

function weeklyPlanSlotText(week, resource, day, period) {
  const slot = resource.assignments[day.key] || {};
  const project = slot[period] || "-";
  const note = slot[`${period}Note`];
  const together = weeklyPlanTogetherPeople(week, resource, day, period, project);
  const details = [
    together.length ? `Together: ${together.join(", ")}` : "",
    note ? `Note: ${note}` : ""
  ].filter(Boolean);
  return details.length ? `${project} (${details.join("; ")})` : project;
}

function weeklyPlanGeneralNoteText(resource) {
  return resource.notes || "-";
}

function weeklyPlanTogetherPeople(week, resource, day, period, project) {
  if (!project || project === "-") return [];
  return week.resources
    .filter((item) => item.name !== resource.name && item.assignments?.[day.key]?.[period] === project)
    .map((item) => item.name);
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
      <div class="mail-hero">
        <div class="mail-brand-row">
          <div class="mail-brand-copy">
            <p class="mail-kicker">FIT Global Weekly Planning</p>
            <h2>${escapeHtml(week.title)} Weekly Work Plan</h2>
            <p>Approved planning summary for ${escapeHtml(resource.name)}</p>
          </div>
          <div class="mail-logo-block">
            <img class="mail-logo" src="${escapeAttr(mailLogoSrc())}" alt="FIT Global">
            <span class="mail-logo-caption">SAP Silver Partner - Resource Planning</span>
          </div>
        </div>
      </div>
      <div class="mail-body">
        <p class="mail-greeting">Hello ${escapeHtml(resource.name)}, your approved weekly plan is below.</p>
        <table class="weekly-plan-table">
          <thead>
            <tr>
              <th>Period</th>
              ${week.days.map((day) => `<th>${escapeHtml(day.label)}<br><small>${escapeHtml(day.date)}</small></th>`).join("")}
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${["am", "pm"].map((period) => `
              <tr>
                <th>${period.toUpperCase()}</th>
                ${week.days.map((day) => weeklyPlanSlotHtml(week, resource, day, period)).join("")}
                ${period === "am" ? `<td rowspan="2">${weeklyPlanGeneralNoteHtml(resource)}</td>` : ""}
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p class="mail-footer">Approved by ${escapeHtml(week.approvedBy || "-")} on ${escapeHtml(formatAuditDate(week.approvedAt))}.</p>
      </div>
    </article>
  `;
}

function mailLogoSrc() {
  return new URL("assets/fit-global-logo.jpg", window.location.href).href;
}

function weeklyPlanSlotHtml(week, resource, day, period) {
  const slot = resource.assignments[day.key] || {};
  const project = slot[period] || "-";
  const note = slot[`${period}Note`];
  const together = weeklyPlanTogetherPeople(week, resource, day, period, project);
  return `
    <td>
      <strong>${escapeHtml(project)}</strong>
      ${together.length ? `<span class="mail-cell-detail"><span class="mail-cell-label">Together</span>${escapeHtml(together.join(", "))}</span>` : ""}
      ${note ? `<span class="mail-cell-detail"><span class="mail-cell-label">Note</span>${escapeHtml(note)}</span>` : ""}
    </td>
  `;
}

function weeklyPlanGeneralNoteHtml(resource) {
  return resource.notes ? `<div class="mail-note-list">${escapeHtml(resource.notes)}</div>` : "-";
}

function loadUsers() {
  const saved = readJsonStore(USERS_KEY, []);
  if (Array.isArray(saved) && saved.length) {
    const normalized = saved.map(normalizeUser);
    writeJsonStore(USERS_KEY, normalized);
    return normalized;
  }
  writeJsonStore(USERS_KEY, DEFAULT_USERS);
  return DEFAULT_USERS.map(normalizeUser);
}

function normalizeUser(user) {
  const isAdminUser = user.id === "admin" || user.username === "admin";
  const normalized = {
    ...user,
    id: user.id || makeId("user"),
    resourceName: user.resourceName || "",
    username: user.username || user.email || "",
    email: cleanMailAddress(user.email),
    role: user.role || "",
    managerId: user.managerId || "",
    active: user.active !== false,
    isResource: user.isResource !== undefined ? Boolean(user.isResource) : Boolean(user.resourceName),
    permissions: {
      read: Boolean(user.permissions?.read || user.admin),
      change: Boolean(user.permissions?.change || user.admin),
      delete: Boolean(user.permissions?.delete || user.admin)
    }
  };
  if (isAdminUser) {
    normalized.email = "selcuk.dere@fit-global.com";
    normalized.username = normalized.username || "admin";
    normalized.resourceName = normalized.resourceName || normalized.name || "Planning Admin";
    normalized.role = normalized.role || "Project Manager";
    normalized.active = true;
    normalized.isResource = true;
  }
  return normalized;
}

function saveUsers() {
  writeJsonStore(USERS_KEY, state.users);
}

function loadTeamManagers() {
  const stored = readJsonStore(TEAM_MANAGERS_KEY, {});
  return stored && typeof stored === "object" ? stored : {};
}

function saveTeamManagers() {
  writeJsonStore(TEAM_MANAGERS_KEY, state.teamManagers || {});
}

function loadRoleDefinitions(sourceRoles = []) {
  const saved = readJsonStore(ROLES_KEY, []);
  if (Array.isArray(saved) && saved.length) {
    return normalizeRoleList([...DEFAULT_ROLES, ...(sourceRoles || []), ...saved]);
  }
  return normalizeRoleList([...DEFAULT_ROLES, ...(sourceRoles || [])]);
}

function saveRoleDefinitions() {
  writeJsonStore(ROLES_KEY, state.data.roles || []);
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
  el.modalTitle.textContent = "Add team member";
  el.modalMeta.textContent = managerName ? `Manager: ${managerName}` : "Top level (no manager)";
  el.modalBody.innerHTML = `
    <div class="resource-toolbar">
      <input id="resourceSearch" type="search" placeholder="Search consultant">
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
                ? `<button class="danger" type="button" data-action="team-remove" data-name="${escapeAttr(name)}">Remove</button>`
                : `<button type="button" data-action="team-add" data-name="${escapeAttr(name)}">Add</button>`}
            </div>
          </div>
        `;
      }).join("")}
      <p id="resourceEmpty" class="eyebrow ${candidates.length ? "hidden" : ""}">No consultants to add</p>
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
      ${excelActionGroup("users-export", "users-import")}
    </div>
    <div class="resource-list user-list">
      ${state.users.map((user) => `
        <div class="resource-row ${user.active === false ? "inactive" : ""}">
          <div>
            <strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(user.username)} - ${escapeHtml(user.email || "-")}</span>
            ${user.resourceName ? `<span>Resource: ${escapeHtml(user.resourceName)}</span>` : ""}
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
  syncResourceUsers();
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
  state.planningContext = {
    action: "user-form",
    mode,
    userId,
    returnTo,
    resourceName: preselectedResource,
    originalUsername: user.username || "",
    originalEmail: user.email || ""
  };
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
        ${permissionCheckbox("userIsResource", "Resource", user.isResource)}
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

function assignmentsAreEmpty(assignments) {
  return Object.values(assignments || {}).every((day) => !day || (!day.am && !day.pm));
}

// Project every "Resource"-flagged user into each week's resource list so they
// appear on the planning grid. Rows are tagged with `fromUser` (the user id) so
// renames stay linked and non-resource users can be pruned safely.
function syncResourceUsers() {
  if (!state.data?.weeks?.length) return;
  const resourceUsers = state.users.filter((user) => user.isResource === true);
  const byId = new Map(resourceUsers.map((user) => [user.id, user]));
  let changed = false;

  state.data.weeks.forEach((week) => {
    // 1) Ensure a row exists for each resource user and keep it in sync.
    resourceUsers.forEach((user) => {
      let row = week.resources.find((resource) => resource.fromUser === user.id);
      if (!row && user.resourceName) {
        row = week.resources.find((resource) => !resource.fromUser && resource.name === user.resourceName);
        if (row) row.fromUser = user.id;
      }
      if (!row) {
        row = week.resources.find((resource) => !resource.fromUser && resource.name === user.name);
        if (row) row.fromUser = user.id;
      }
      if (!row) {
        // Do not duplicate an existing (planning-data) resource with the same name.
        if (week.resources.some((resource) => !resource.fromUser && resource.name === user.name)) return;
        week.resources.push({
          name: user.resourceName || user.name,
          jiraName: user.email || "",
          role: user.role || "",
          inactive: !user.active,
          notes: "",
          assignments: blankAssignments(),
          fromUser: user.id
        });
        changed = true;
        return;
      }
      const desiredInactive = !user.active;
      const desiredJiraName = user.email || "";
      const desiredName = user.resourceName || user.name;
      if (
        row.name !== desiredName ||
        row.jiraName !== desiredJiraName ||
        row.role !== (user.role || "") ||
        row.inactive !== desiredInactive
      ) {
        row.name = desiredName;
        row.jiraName = desiredJiraName;
        row.role = user.role || "";
        row.inactive = desiredInactive;
        changed = true;
      }
    });

    // 2) Prune rows whose user is gone / no longer a resource, but only when the
    //    row has no assignment data (avoid losing real planning entries).
    for (let index = week.resources.length - 1; index >= 0; index -= 1) {
      const resource = week.resources[index];
      if (!resource.fromUser) continue;
      if (byId.has(resource.fromUser)) continue;
      if (assignmentsAreEmpty(resource.assignments)) {
        week.resources.splice(index, 1);
        changed = true;
      }
    }
  });

  if (changed) {
    saveDrafts();
    renderFilterOptions();
  }
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
  const email = cleanMailAddress(document.querySelector("#userEmail").value);
  const role = document.querySelector("#userRole").value.trim();
  const editingUser = context.mode === "edit"
    ? state.users.find((item) => item.id === context.userId) ||
      state.users.find((item) =>
        [item.username, item.email].filter(Boolean).some((value) =>
          [context.originalUsername, context.originalEmail].filter(Boolean)
            .map((original) => original.toLowerCase())
            .includes(value.toLowerCase())
        )
      )
    : null;
  if (!name || !username) {
    openInfoModal("Missing user info", "Name and user name are required.");
    return;
  }
  const duplicate = state.users.some((user) => {
    if (editingUser && user.id === editingUser.id) return false;
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
    resourceName: context.mode === "new" ? context.resourceName || "" : editingUser?.resourceName || "",
    role,
    managerId: document.querySelector("#userManager").value,
    admin: document.querySelector("#userAdmin").checked,
    active: context.mode === "new"
      ? true
      : editingUser?.active !== false,
    isResource: document.querySelector("#userIsResource").checked,
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
    const user = editingUser;
    if (!user) {
      openInfoModal("User not found", "This user could not be found. Please reopen the user list and try again.");
      return;
    }
    Object.assign(user, payload);
    const password = document.querySelector("#userPassword")?.value;
    if (password) user.password = password;
    if (state.currentUser.id === user.id) state.currentUser = user;
  }
  saveUsers();
  syncResourceUsers();
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
      projectMeta[project] = { manager: "", budgetDays: "", demands: {}, inactive: false, deleted: false };
    }
    if (!projectMeta[project].demands || typeof projectMeta[project].demands !== "object") {
      projectMeta[project].demands = {};
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
