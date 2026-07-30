const signals = [
  {
    icon: "⚠",
    title: "Airport traffic",
    lineOne: "Traffic is 34 min slower than usual.",
    lineTwo: "Leave by 12:40 PM to arrive on time.",
    priority: "HIGH PRIORITY",
    accent: "#ff7b4d",
    category: "travel",
    action: "Travel plan adjusted. Departure moved to 12:40 PM."
  },
  {
    icon: "✉",
    title: "Reply draft",
    lineOne: "A partner sent an important message.",
    lineTwo: "A concise reply draft is ready.",
    priority: "HIGH PRIORITY",
    accent: "#65a8ff",
    category: "inbox",
    action: "Reply draft placed at the top of the inbox."
  },
  {
    icon: "✈",
    title: "Gate changed",
    lineOne: "Your gate changed to D12.",
    lineTwo: "Terminal 2, 18 min walk.",
    priority: "HIGH PRIORITY",
    accent: "#b268ff",
    category: "travel",
    action: "Gate change added to the travel plan."
  },
  {
    icon: "▣",
    title: "Calendar optimization",
    lineOne: "Swap Meeting A and B.",
    lineTwo: "Better flow and less context switching.",
    priority: "MEDIUM PRIORITY",
    accent: "#5ce0db",
    category: "calendar",
    action: "Meetings reordered for better context."
  },
  {
    icon: "▤",
    title: "Contract pending",
    lineOne: "Signature needed.",
    lineTwo: "Blocks tomorrow's launch.",
    priority: "HIGH PRIORITY",
    accent: "#ffc857",
    category: "documents",
    action: "Final contract prepared for signature."
  },
  {
    icon: "🎁",
    title: "Investor birthday",
    lineOne: "A key investor's birthday is tomorrow.",
    lineTwo: "Consider a quick note.",
    priority: "LOW PRIORITY",
    accent: "#ff75c9",
    category: "people",
    action: "A thoughtful birthday note is ready."
  }
];

let handledSignals = new Set();
let activeCategory = "today";

const signalGrid = document.getElementById("signalGrid");
const toast = document.getElementById("toast");
const signalMetric = document.getElementById("signalMetric");
const actionMetric = document.getElementById("actionMetric");
const timeMetric = document.getElementById("timeMetric");
const drawer = document.getElementById("copilotDrawer");
const backdrop = document.getElementById("drawerBackdrop");
const message = document.getElementById("ghostMessage");
const typing = document.getElementById("typingIndicator");
const sidebar = document.querySelector(".sidebar");

function renderSignals() {
  const visibleSignals = activeCategory === "today" || activeCategory === "signals"
    ? signals
    : signals.filter(signal => signal.category === activeCategory);

  signalGrid.innerHTML = visibleSignals.map((signal) => {
    const originalIndex = signals.indexOf(signal);
    const isHandled = handledSignals.has(originalIndex);

    return `
      <article
        class="signalCard ${isHandled ? "handled" : ""}"
        style="--cardAccent:${signal.accent}"
        dataIndex="${originalIndex}"
        tabindex="0"
        role="button"
        aria-label="${isHandled ? "Handled" : "Handle"} ${signal.title}"
      >
        <div class="signalInner">
          <div class="signalIcon">${signal.icon}</div>
          <div class="signalContent">
            <div class="signalTopline">
              <h3>${signal.title}</h3>
              <span class="priorityBadge">${isHandled ? "HANDLED" : signal.priority}</span>
            </div>
            <p>${signal.lineOne}</p>
            <p>${signal.lineTwo}</p>
          </div>
          <div class="signalArrow">${isHandled ? "✓" : "›"}</div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".signalCard").forEach((card, cardIndex) => {
    const originalIndex = Number(card.getAttribute("dataIndex"));

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--y", `${event.clientY - rect.top}px`);
    });

    card.addEventListener("click", () => handleSignal(originalIndex));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSignal(originalIndex);
      }
    });

    window.setTimeout(() => card.classList.add("visible"), 90 + cardIndex * 75);
  });

  if (!visibleSignals.length) {
    signalGrid.innerHTML = `
      <div class="signalCard visible" style="grid-column:1 / -1; --cardAccent:#ff75c9;">
        <div class="signalInner">
          <div class="signalIcon">✦</div>
          <div class="signalContent">
            <div class="signalTopline"><h3>Nothing urgent here</h3></div>
            <p>Ghost is still watching quietly.</p>
            <p>Everything else can wait.</p>
          </div>
        </div>
      </div>
    `;
  }

  updateMetrics();
}

function handleSignal(index) {
  if (handledSignals.has(index)) {
    showToast("This signal is already handled.");
    return;
  }

  handledSignals.add(index);
  showToast(signals[index].action);
  renderSignals();
}

function updateMetrics() {
  const remaining = signals.length - handledSignals.size;
  const completed = 3 + handledSignals.size;
  const protectedMinutes = 252 + handledSignals.size * 11;
  const hours = Math.floor(protectedMinutes / 60);
  const minutes = protectedMinutes % 60;

  animateText(signalMetric, `${remaining} signal${remaining === 1 ? "" : "s"}`);
  animateText(actionMetric, `${completed} actions`);
  animateText(timeMetric, `${hours}h ${String(minutes).padStart(2, "0")}m`);
}

function animateText(element, value) {
  element.animate(
    [
      { opacity: .35, transform: "translateY(4px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration: 280, easing: "ease-out" }
  );
  element.textContent = value;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function openDrawer() {
  drawer.classList.add("open");
  backdrop.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function ghostReply(text) {
  typing.classList.add("show");
  message.style.opacity = ".35";

  window.setTimeout(() => {
    message.textContent = text;
    message.style.opacity = "1";
    typing.classList.remove("show");
  }, 750);
}

document.getElementById("askGhostButton").addEventListener("click", openDrawer);
document.getElementById("closeDrawer").addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);

document.querySelectorAll(".promptChips button").forEach(button => {
  button.addEventListener("click", () => {
    const prompt = button.getAttribute("dataPrompt");

    if (prompt === "priority") {
      ghostReply("Protect the flight first. Then close the contract and send the partner reply. Those three actions remove the biggest time, launch, and relationship risks.");
    }

    if (prompt === "wait") {
      ghostReply("The birthday note can wait until the travel and launch blockers are closed. It matters, but it is not urgent yet.");
    }

    if (prompt === "handle") {
      ghostReply("Handle the travel plan, meeting order, reply draft, and contract preparation without escalating. The available context is already enough.");
    }
  });
});

function submitCustomPrompt() {
  const input = document.getElementById("customPromptInput");
  const value = input.value.trim();

  if (!value) return;

  ghostReply("I would reduce the open loops first, then protect one uninterrupted focus block. The strongest next move is the one that removes future decisions.");
  input.value = "";
}

document.getElementById("sendPromptButton").addEventListener("click", submitCustomPrompt);
document.getElementById("customPromptInput").addEventListener("keydown", event => {
  if (event.key === "Enter") submitCustomPrompt();
});

document.getElementById("refreshSignals").addEventListener("click", () => {
  showToast("Ghost scanned the day again. No new urgent signals.");
  document.querySelector(".ghostOrb").animate(
    [
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(1.04) rotate(3deg)" },
      { transform: "scale(1) rotate(0deg)" }
    ],
    { duration: 700, easing: "ease-in-out" }
  );
});

document.querySelectorAll(".navItem").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".navItem").forEach(button => button.classList.remove("active"));
    item.classList.add("active");

    activeCategory = item.getAttribute("dataView");
    renderSignals();

    document.getElementById("signalSection").scrollIntoView({ behavior: "smooth", block: "start" });
    sidebar.classList.remove("open");
  });
});

document.getElementById("mobileMenuButton").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeDrawer();
    sidebar.classList.remove("open");
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      window.setTimeout(() => entry.target.classList.add("visible"), index * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll(".reveal").forEach(section => revealObserver.observe(section));

const cursorGlow = document.getElementById("cursorGlow");
document.addEventListener("mousemove", event => {
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});

document.addEventListener("mouseleave", () => {
  cursorGlow.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  cursorGlow.style.opacity = ".08";
});

renderSignals();
