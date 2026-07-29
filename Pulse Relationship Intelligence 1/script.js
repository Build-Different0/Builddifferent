const STORAGE_KEY = "pulse_relationship_intelligence_v1";

const seedData = {
  people: [
    { id: 1, name: "Sara Lindberg", company: "Northstar Ventures", role: "Partner", type: "Investor", importance: 5, lastContact: daysAgo(47), health: 54, momentum: "down", notes: "Sara was excited about the product vision. She asked for a sharper enterprise story before the next conversation." },
    { id: 2, name: "Marcus Chen", company: "Orbit Systems", role: "VP Product", type: "Customer", importance: 5, lastContact: daysAgo(18), health: 62, momentum: "down", notes: "Marcus is a strategic customer. Recent messages became shorter after a delayed integration milestone." },
    { id: 3, name: "Emily Harper", company: "Pulse Labs", role: "Head of Operations", type: "Employee", importance: 5, lastContact: daysAgo(2), health: 92, momentum: "up", notes: "Emily owns key operating rhythms and has strong context across the team." },
    { id: 4, name: "Jonas Berg", company: "Aster AI", role: "Founder", type: "Partner", importance: 4, lastContact: daysAgo(9), health: 78, momentum: "up", notes: "Partnership discussions are moving well. Jonas offered to introduce two enterprise design partners." },
    { id: 5, name: "Leila Ahmed", company: "Independent", role: "AI Engineer", type: "Candidate", importance: 4, lastContact: daysAgo(12), health: 73, momentum: "steady", notes: "Leila is highly aligned with the mission but is also speaking with two other companies." },
    { id: 6, name: "David Rosen", company: "Rosen Capital", role: "Managing Director", type: "Investor", importance: 4, lastContact: daysAgo(5), health: 86, momentum: "up", notes: "David regularly shares useful market context and responds quickly." },
    { id: 7, name: "Maya Nilsson", company: "Bright Studio", role: "CEO", type: "Customer", importance: 3, lastContact: daysAgo(28), health: 58, momentum: "down", notes: "Maya completed onboarding but has not invited the rest of her team yet." },
    { id: 8, name: "Oscar Reed", company: "Foundry Collective", role: "Community Lead", type: "Partner", importance: 3, lastContact: daysAgo(3), health: 82, momentum: "steady", notes: "Oscar is planning a founder event in Stockholm and wants Pulse represented." }
  ],
  interactions: [
    { id: 101, personId: 3, date: daysAgo(2), channel: "Meeting", sentiment: "positive", summary: "Reviewed operating priorities and agreed on the top three decisions for the week." },
    { id: 102, personId: 8, date: daysAgo(3), channel: "Message", sentiment: "positive", summary: "Confirmed interest in the Stockholm founder event and discussed a live product demo." },
    { id: 103, personId: 6, date: daysAgo(5), channel: "Call", sentiment: "positive", summary: "Shared company progress. David offered two warm introductions." },
    { id: 104, personId: 4, date: daysAgo(9), channel: "Meeting", sentiment: "positive", summary: "Mapped a partnership concept and agreed to identify design partners." },
    { id: 105, personId: 5, date: daysAgo(12), channel: "Email", sentiment: "neutral", summary: "Sent role context and next interview steps. Leila replied with availability." },
    { id: 106, personId: 2, date: daysAgo(18), channel: "Email", sentiment: "negative", summary: "Marcus asked for a revised integration timeline after a missed milestone." },
    { id: 107, personId: 7, date: daysAgo(28), channel: "Message", sentiment: "neutral", summary: "Checked in after onboarding. Maya said the team was busy with a client launch." },
    { id: 108, personId: 1, date: daysAgo(47), channel: "Meeting", sentiment: "positive", summary: "Presented the vision. Sara requested a stronger enterprise narrative before reconnecting." }
  ]
};

function daysAgo(number) {
  const date = new Date();
  date.setDate(date.getDate() - number);
  return date.toISOString().slice(0, 10);
}

let state = loadState();
let currentFilter = "all";
let currentSort = "priority";
let toastTimer;

const el = id => document.getElementById(id);

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedData);
  try { return JSON.parse(saved); } catch { return structuredClone(seedData); }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initials(name) {
  return name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
}

function daysSince(dateString) {
  const start = new Date(dateString + "T12:00:00");
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / 86400000));
}

function contactLabel(dateString) {
  const days = daysSince(dateString);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function healthLabel(score) {
  if (score >= 75) return { label: "Warm", className: "warm" };
  if (score >= 60) return { label: "Watch", className: "watch" };
  return { label: "Cooling", className: "cool" };
}

function avatarStyle(name) {
  const palettes = [
    ["#e6e0ff", "#5039a8"], ["#dff4e7", "#19795b"], ["#ffe7da", "#a34d22"],
    ["#dcecff", "#315d97"], ["#f3def8", "#793e85"], ["#fff0c8", "#846000"]
  ];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return `background:${palettes[index][0]};color:${palettes[index][1]}`;
}

function priorityScore(person) {
  const recencyPenalty = Math.min(daysSince(person.lastContact), 60);
  return person.importance * 20 + recencyPenalty + (100 - person.health) + (person.momentum === "down" ? 20 : 0);
}

function peopleNeedingAttention() {
  return state.people.filter(person => person.health < 65 || (person.importance >= 4 && daysSince(person.lastContact) > 14)).sort((a, b) => priorityScore(b) - priorityScore(a));
}

function generateSignals() {
  const signals = [];
  const cooling = state.people.filter(p => p.momentum === "down").sort((a, b) => a.health - b.health);
  const overdue = state.people.filter(p => daysSince(p.lastContact) > 21).sort((a, b) => daysSince(b.lastContact) - daysSince(a.lastContact));
  const strong = state.people.filter(p => p.health >= 80).sort((a, b) => b.health - a.health);
  const candidates = state.people.filter(p => p.type === "Candidate" && daysSince(p.lastContact) > 7);

  if (cooling[0]) signals.push({ icon: "↓", title: `${cooling[0].name} is cooling`, text: `Momentum has dropped and the last interaction was ${contactLabel(cooling[0].lastContact).toLowerCase()}. A personal follow up could restore trust.`, personId: cooling[0].id, priority: "High" });
  if (overdue[0]) signals.push({ icon: "⌛", title: `Relationship gap detected`, text: `You have not spoken with ${overdue[0].name} in ${daysSince(overdue[0].lastContact)} days, despite their ${overdue[0].importance >= 4 ? "high" : "active"} importance.`, personId: overdue[0].id, priority: "High" });
  if (strong[0]) signals.push({ icon: "✦", title: `${strong[0].name} has strong momentum`, text: `This relationship is healthy. Now may be the right moment to ask for an introduction, feedback, or a bigger commitment.`, personId: strong[0].id, priority: "Opportunity" });
  if (candidates[0]) signals.push({ icon: "◎", title: `Candidate attention window`, text: `${candidates[0].name} may be moving through other processes. Reconnect while interest is still active.`, personId: candidates[0].id, priority: "Medium" });
  signals.push({ icon: "↗", title: `Your investor network is active`, text: `${state.people.filter(p => p.type === "Investor" && p.health >= 70).length} investor relationships currently show healthy momentum.`, personId: null, priority: "Positive" });
  return signals;
}

function networkScore() {
  if (!state.people.length) return 0;
  return Math.round(state.people.reduce((sum, person) => sum + person.health, 0) / state.people.length);
}

function renderAll() {
  renderDate();
  renderMetrics();
  renderAttention();
  renderSignals();
  renderTable();
  renderRelationshipGrid();
  renderSignalFeed();
  renderTimeline();
  populatePersonSelect();
}

function renderDate() {
  el("dateLabel").textContent = "SUNDAY, JULY 26";
}

function renderMetrics() {
  const score = networkScore();
  const attention = peopleNeedingAttention();
  const recentInteractions = state.interactions.filter(item => daysSince(item.date) <= 30).length;
  const warm = state.people.filter(person => person.health >= 75).length;
  el("networkScore").textContent = score;
  el("networkScoreRing").style.setProperty("--score", score);
  el("scoreChange").textContent = `↑ ${Math.max(1, Math.round(recentInteractions / 4))} this week`;
  el("peopleTracked").textContent = state.people.length;
  el("needsAttention").textContent = attention.length;
  el("sidebarActionCount").textContent = attention.length;
  el("monthlyInteractions").textContent = recentInteractions;
  el("warmPercent").textContent = state.people.length ? `${Math.round((warm / state.people.length) * 100)}%` : "0%";
}

function renderAttention() {
  const items = peopleNeedingAttention().slice(0, 4);
  el("attentionList").innerHTML = items.length ? items.map(person => `
    <div class="attention-item">
      <div class="avatar" style="${avatarStyle(person.name)}">${initials(person.name)}</div>
      <div class="person-copy"><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.role)} at ${escapeHtml(person.company)}</span></div>
      <div class="action-copy"><strong>${daysSince(person.lastContact)} days quiet</strong><button onclick="openInteraction(${person.id})">Reconnect →</button></div>
    </div>`).join("") : `<div class="empty-state">Your network looks healthy.</div>`;
}

function renderSignals() {
  el("signalList").innerHTML = generateSignals().slice(0, 4).map(signal => `
    <div class="signal-item">
      <div class="signal-symbol">${signal.icon}</div>
      <div><strong>${escapeHtml(signal.title)}</strong><p>${escapeHtml(signal.text)}</p></div>
    </div>`).join("");
}

function filteredPeople() {
  const query = el("globalSearch").value.trim().toLowerCase();
  return state.people.filter(person => {
    const filterMatch = currentFilter === "all" || person.type === currentFilter;
    const searchMatch = !query || [person.name, person.company, person.role, person.type, person.notes].some(value => value.toLowerCase().includes(query));
    return filterMatch && searchMatch;
  });
}

function renderTable() {
  const people = filteredPeople();
  el("relationshipTableBody").innerHTML = people.length ? people.map(person => {
    const status = healthLabel(person.health);
    const momentumText = person.momentum === "up" ? "↗ Growing" : person.momentum === "down" ? "↘ Cooling" : "→ Stable";
    return `<tr>
      <td><div class="person-cell"><div class="avatar" style="${avatarStyle(person.name)}">${initials(person.name)}</div><div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.role)} at ${escapeHtml(person.company)}</span></div></div></td>
      <td><span class="type-badge">${person.type}</span></td>
      <td>${contactLabel(person.lastContact)}</td>
      <td><span class="momentum ${person.momentum}">${momentumText}</span></td>
      <td><span class="health-badge ${status.className}">${status.label} · ${person.health}</span></td>
      <td><button class="row-button" onclick="openPerson(${person.id})" aria-label="Open ${escapeHtml(person.name)}">›</button></td>
    </tr>`;
  }).join("") : `<tr><td colspan="6" class="empty-state">No relationships match this view.</td></tr>`;
}

function renderRelationshipGrid() {
  let people = filteredPeople().slice();
  if (currentSort === "priority") people.sort((a, b) => priorityScore(b) - priorityScore(a));
  if (currentSort === "health") people.sort((a, b) => b.health - a.health);
  if (currentSort === "recent") people.sort((a, b) => new Date(b.lastContact) - new Date(a.lastContact));
  el("relationshipGrid").innerHTML = people.length ? people.map(person => {
    const status = healthLabel(person.health);
    const insight = person.momentum === "down" ? `Momentum is cooling. Reach out with something personal, not a generic check in.` : person.momentum === "up" ? `Trust is growing. This is a good moment to deepen the relationship.` : `The relationship is stable. Keep the current interaction rhythm.`;
    return `<article class="relationship-card">
      <div class="relationship-card-top"><div class="avatar" style="${avatarStyle(person.name)}">${initials(person.name)}</div><div class="health-score">${person.health}<small>/100</small></div></div>
      <h3>${escapeHtml(person.name)}</h3><div class="role">${escapeHtml(person.role)} at ${escapeHtml(person.company)}</div>
      <div class="card-tags"><span class="type-badge">${person.type}</span><span class="health-badge ${status.className}">${status.label}</span></div>
      <div class="card-insight">${insight}</div>
      <div class="card-footer"><span>Last contact ${contactLabel(person.lastContact).toLowerCase()}</span><button onclick="openPerson(${person.id})">Open →</button></div>
    </article>`;
  }).join("") : `<div class="empty-state">No relationships found.</div>`;
}

function renderSignalFeed() {
  el("signalFeed").innerHTML = generateSignals().map(signal => `
    <article class="feed-card">
      <div class="feed-icon">${signal.icon}</div>
      <div><h3>${escapeHtml(signal.title)}</h3><p>${escapeHtml(signal.text)}</p></div>
      ${signal.personId ? `<button onclick="openInteraction(${signal.personId})">Take action</button>` : `<button onclick="switchView('relationships')">Explore network</button>`}
    </article>`).join("");
}

function renderTimeline() {
  const sorted = state.interactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  el("activityTimeline").innerHTML = sorted.length ? sorted.map(item => {
    const person = state.people.find(person => person.id === item.personId);
    if (!person) return "";
    const icon = item.channel === "Meeting" ? "◎" : item.channel === "Email" ? "✉" : item.channel === "Call" ? "☎" : "↗";
    return `<div class="timeline-item">
      <div class="timeline-dot">${icon}</div>
      <div class="timeline-card"><div class="timeline-card-head"><strong>${escapeHtml(item.channel)} with ${escapeHtml(person.name)}</strong><time>${contactLabel(item.date)}</time></div><p>${escapeHtml(item.summary)}</p></div>
    </div>`;
  }).join("") : `<div class="empty-state">No interactions logged yet.</div>`;
}

function populatePersonSelect() {
  el("interactionPersonSelect").innerHTML = state.people.map(person => `<option value="${person.id}">${escapeHtml(person.name)} · ${escapeHtml(person.company)}</option>`).join("");
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === viewName));
  el(`${viewName}View`).classList.add("active");
  const titles = { dashboard: "Good morning", relationships: "Relationship graph", signals: "Intelligence signals", activity: "Interaction memory" };
  el("pageTitle").textContent = titles[viewName];
  el("sidebar").classList.remove("open");
}

function openInteraction(personId) {
  if (personId) el("interactionPersonSelect").value = String(personId);
  el("interactionModal").showModal();
}

function openPerson(personId) {
  const person = state.people.find(item => item.id === personId);
  if (!person) return;
  const status = healthLabel(person.health);
  const latest = state.interactions.filter(item => item.personId === person.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  el("personModalContent").innerHTML = `
    <div class="modal-header"><div><span class="eyebrow">RELATIONSHIP PROFILE</span></div><button class="close-button" onclick="document.getElementById('personModal').close()">×</button></div>
    <div class="person-hero"><div><span class="type-badge">${person.type}</span><h2>${escapeHtml(person.name)}</h2><p>${escapeHtml(person.role)} at ${escapeHtml(person.company)}</p></div><div class="person-score"><strong>${person.health}</strong><span>HEALTH SCORE</span></div></div>
    <div class="person-details"><div class="detail-box"><span>LAST CONTACT</span><strong>${contactLabel(person.lastContact)}</strong></div><div class="detail-box"><span>MOMENTUM</span><strong>${person.momentum === "up" ? "Growing" : person.momentum === "down" ? "Cooling" : "Stable"}</strong></div><div class="detail-box"><span>STATUS</span><strong>${status.label}</strong></div></div>
    <p class="person-note">${escapeHtml(person.notes)}</p>
    ${latest ? `<div class="detail-box"><span>LATEST MEMORY</span><strong>${escapeHtml(latest.summary)}</strong></div>` : ""}
    <div class="modal-actions"><button class="secondary-button" onclick="document.getElementById('personModal').close()">Close</button><button class="primary-button" onclick="document.getElementById('personModal').close(); openInteraction(${person.id})">Log interaction</button></div>`;
  el("personModal").showModal();
}

function showToast(message) {
  el("toast").textContent = message;
  el("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el("toast").classList.remove("show"), 2400);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
}

document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
document.querySelectorAll("[data-view-jump]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.viewJump)));
document.querySelectorAll(".filter-chip").forEach(button => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll(".filter-chip").forEach(item => item.classList.toggle("active", item === button));
  renderTable(); renderRelationshipGrid();
}));
document.querySelectorAll("[data-sort]").forEach(button => button.addEventListener("click", () => {
  currentSort = button.dataset.sort;
  document.querySelectorAll("[data-sort]").forEach(item => item.classList.toggle("active", item === button));
  renderRelationshipGrid();
}));

el("globalSearch").addEventListener("input", () => { renderTable(); renderRelationshipGrid(); });
el("globalSearch").addEventListener("keydown", event => { if (event.key === "Enter") switchView("relationships"); });
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); el("globalSearch").focus(); }
});
el("mobileMenuButton").addEventListener("click", () => el("sidebar").classList.toggle("open"));
el("addPersonButton").addEventListener("click", () => {
  const dateInput = el("addPersonForm").elements.lastContact;
  dateInput.value = new Date().toISOString().slice(0, 10);
  el("addPersonModal").showModal();
});
el("logInteractionButton").addEventListener("click", () => openInteraction());
el("reviewNowButton").addEventListener("click", () => switchView("relationships"));
el("resetButton").addEventListener("click", () => {
  state = structuredClone(seedData); saveState(); renderAll(); showToast("Demo data reset");
});

el("addPersonForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const person = {
    id: Date.now(), name: form.get("name").trim(), company: form.get("company").trim(), role: form.get("role").trim(), type: form.get("type"),
    importance: Number(form.get("importance")), lastContact: form.get("lastContact"), health: 72, momentum: "steady", notes: form.get("notes").trim() || "No context added yet."
  };
  state.people.push(person); saveState(); event.currentTarget.reset(); el("addPersonModal").close(); renderAll(); showToast(`${person.name} added to Pulse`);
});

el("interactionForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const personId = Number(form.get("personId"));
  const person = state.people.find(item => item.id === personId);
  const sentiment = form.get("sentiment");
  state.interactions.push({ id: Date.now(), personId, date: new Date().toISOString().slice(0, 10), channel: form.get("channel"), sentiment, summary: form.get("summary").trim() });
  if (person) {
    person.lastContact = new Date().toISOString().slice(0, 10);
    person.health = Math.min(100, Math.max(0, person.health + (sentiment === "positive" ? 8 : sentiment === "negative" ? -8 : 3)));
    person.momentum = sentiment === "positive" ? "up" : sentiment === "negative" ? "down" : "steady";
  }
  saveState(); event.currentTarget.reset(); el("interactionModal").close(); renderAll(); showToast("Interaction saved and relationship score updated");
});

window.openInteraction = openInteraction;
window.openPerson = openPerson;
window.switchView = switchView;

renderAll();

// Pulse Copilot and premium interactions
const aiDrawer = el("aiDrawer");
const aiConversation = el("aiConversation");
const aiInput = el("aiInput");

function toggleAiDrawer(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !aiDrawer.classList.contains("open");
  aiDrawer.classList.toggle("open", shouldOpen);
  aiDrawer.setAttribute("aria-hidden", String(!shouldOpen));
  if (shouldOpen) setTimeout(() => aiInput.focus(), 250);
}

function addAiMessage(text, role = "assistant") {
  const message = document.createElement("div");
  message.className = `ai-message ${role}`;
  message.textContent = text;
  aiConversation.appendChild(message);
  aiConversation.scrollTop = aiConversation.scrollHeight;
}

function pulseAnswer(prompt) {
  const query = prompt.toLowerCase();
  const attention = peopleNeedingAttention();
  const strongest = [...state.people].sort((a, b) => b.health - a.health)[0];
  const cooling = [...state.people].filter(person => person.momentum === "down").sort((a, b) => priorityScore(b) - priorityScore(a))[0];

  if (query.includes("today") || query.includes("contact") || query.includes("attention")) {
    const person = attention[0];
    return person ? `${person.name} should be your first move today. You have been quiet for ${daysSince(person.lastContact)} days, their importance is ${person.importance}/5, and their health is ${person.health}. Send a specific, personal update rather than a generic check in.` : "Your network is currently healthy. Focus on deepening one warm relationship instead of chasing overdue follow ups.";
  }
  if (query.includes("cool") || query.includes("risk") || query.includes("cold")) {
    return cooling ? `${cooling.name} is cooling fastest. The signal combines declining momentum, ${daysSince(cooling.lastContact)} days since contact, and a health score of ${cooling.health}. The next best action is a direct conversation with clear context.` : "I do not see a meaningful cooling pattern right now.";
  }
  if (query.includes("strong") || query.includes("opportunity") || query.includes("momentum")) {
    return strongest ? `${strongest.name} is your strongest current opportunity at ${strongest.health}/100. Trust is high, so this is the moment to ask for feedback, an introduction, or a deeper commitment.` : "Add a few relationships first and I will identify your strongest opportunity.";
  }
  if (query.includes("investor")) {
    const investors = state.people.filter(person => person.type === "Investor").sort((a, b) => priorityScore(b) - priorityScore(a));
    return investors.length ? `Your investor priority is ${investors[0].name}. Their current health is ${investors[0].health}, with ${daysSince(investors[0].lastContact)} days since the last interaction.` : "You do not have any investors in Pulse yet.";
  }
  if (query.includes("customer")) {
    const customers = state.people.filter(person => person.type === "Customer").sort((a, b) => priorityScore(b) - priorityScore(a));
    return customers.length ? `${customers[0].name} at ${customers[0].company} deserves the most customer attention right now. Their health is ${customers[0].health} and momentum is ${customers[0].momentum}.` : "You do not have any customers in Pulse yet.";
  }
  return `I scanned ${state.people.length} people and ${state.interactions.length} interactions. Ask me who needs attention today, which relationship is cooling, your strongest opportunity, or a specific relationship type.`;
}

el("askPulseButton").addEventListener("click", () => toggleAiDrawer(true));
el("aiFab").addEventListener("click", () => toggleAiDrawer(true));
el("closeAiDrawer").addEventListener("click", () => toggleAiDrawer(false));
document.querySelectorAll("[data-ai-prompt]").forEach(button => button.addEventListener("click", () => {
  const prompt = button.dataset.aiPrompt;
  addAiMessage(prompt, "user");
  setTimeout(() => addAiMessage(pulseAnswer(prompt)), 260);
}));
el("aiForm").addEventListener("submit", event => {
  event.preventDefault();
  const prompt = aiInput.value.trim();
  if (!prompt) return;
  addAiMessage(prompt, "user");
  aiInput.value = "";
  setTimeout(() => addAiMessage(pulseAnswer(prompt)), 300);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && aiDrawer.classList.contains("open")) toggleAiDrawer(false);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll(".hero-panel, .metric-card, .panel, .relationship-card, .feed-card, .timeline-item").forEach((node, index) => {
  node.classList.add("reveal");
  node.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
  revealObserver.observe(node);
});
