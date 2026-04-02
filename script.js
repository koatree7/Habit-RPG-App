let state = JSON.parse(localStorage.getItem("lifeRPG")) || {
  xp: 0,
  gold: 0,
  weekly: {},
  daily: {},
};

function save() {
  localStorage.setItem("lifeRPG", JSON.stringify(state));
}

const TASK_POOL = {
  mental: [
    { name: "📚 Read", goal: 20, difficulty: "easy" },
    { name: "🧠 Study", goal: 30, difficulty: "medium" }
  ],
  physical: [
    { name: "🏋️ Strength Training", goal: 30, difficulty: "hard" },
    { name: "🤸 Mobility", goal: 15, difficulty: "easy" }
  ],
  explore: [
    { name: "🗺️ Go Outside", goal: 1, difficulty: "easy" }
  ]
};

function generateDaily() {
  const today = new Date().toDateString();
  if (state.daily.date === today) return;

  state.daily = {
    date: today,
    tasks: [
      ...TASK_POOL.mental,
      ...TASK_POOL.physical,
      ...TASK_POOL.explore
    ].map(t => ({ ...t, progress: 0, done: false }))
  };

  save();
}

function render() {
  const el = document.getElementById("dailyFocus");
  el.innerHTML = "";

  state.daily.tasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "quest";

    const percent = Math.min(t.progress / t.goal, 1) * 100;

    div.innerHTML = `
      ${t.done ? "✅" : ""} ${t.name} (${t.progress}/${t.goal})
      <div class="progress-bar" style="width:${percent}%"></div>
    `;

    el.appendChild(div);
  });

  document.getElementById("stats").innerText =
    `XP: ${state.xp} | Gold: ${state.gold}`;
}

let timer = 0;
let interval;

function startSession() {
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").innerText = timer + "s";
  }, 1000);
}

function endSession() {
  clearInterval(interval);

  state.xp += timer;
  state.gold += Math.floor(timer / 2);

  const today = new Date().toDateString();
  state.weekly[today] = state.weekly[today] || { xp: 0 };
  state.weekly[today].xp += timer;

  state.daily.tasks.forEach(t => {
    if (!t.done) {
      t.progress += timer;
      if (t.progress >= t.goal) t.done = true;
    }
  });

  timer = 0;
  save();
  render();
}

function logExplore() {
  alert("🗺️ Exploration logged!");
}

let graphMode = "xp";
let graphRange = "weekly";

function toggleGraph() {
  graphMode = graphMode === "xp" ? "minutes" : "xp";
  drawChart();
}

function toggleRange() {
  graphRange = graphRange === "weekly" ? "monthly" : "weekly";
  drawChart();
}

function drawChart() {
  const canvas = document.getElementById("weeklyChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,300,150);

  const days = graphRange === "weekly" ? 7 : 30;

  for (let i = 0; i < days; i++) {
    const val = Math.random() * 100;
    ctx.fillRect(i * 10, 150 - val, 8, val);
  }
}

let insight = false;

function toggleInsight() {
  insight = !insight;
  document.getElementById("insight").style.display =
    insight ? "block" : "none";
}

window.onload = () => {
  generateDaily();
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
};