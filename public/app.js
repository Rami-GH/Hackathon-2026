/**
 * CyberTrust Nation - Frontend Application Logic
 * Principal Product Designer Standard
 */

let chartsInitialized = false;
let chartEmiratesInstance = null;
let chartVectorsInstance = null;
let chartProgressionInstance = null;

// Pitch Deck Data (PDF Guidelines: 5 Slides, 3-minute presentation, speaker assignments)
const PITCH_SLIDES = [
  {
    number: 1,
    title: "1. The Problem: The Fragility of Digital Trust",
    speaker: "Speaker 1: Problem & Impact",
    timeSlot: "0:00 - 0:30",
    bullets: [
      "The UAE leads the world in digital government adoption (98%+ citizen engagement via TAMM, DubaiNow, UAE PASS).",
      "However, sophisticated attacks threaten this foundation: a 38% rise in spoofed government SMS smishing and automated credential harvesting targeting residents.",
      "A single high-profile critical infrastructure outage or citizen data scam undermines public confidence and risks millions in national economic disruption."
    ],
    highlight: "Core Challenge: How do we safeguard public trust while ensuring critical digital services remain 100% resilient against large-scale cyber incidents?"
  },
  {
    number: 2,
    title: "2. Our Solution: CyberTrust Nation Autonomous Ecosystem",
    speaker: "Speaker 2: Solution & AI",
    timeSlot: "0:30 - 1:15",
    bullets: [
      "Dual-Pillar Architecture: Citizen Trust Shield + Autonomous Critical Infrastructure Sentinel.",
      "Citizen Trust Shield: Real-time NLP threat scanner cross-referencing official TDRA whitelists, exposing typosquatting, and providing verified official government portals.",
      "Autonomous AI Agentic Defense: Multi-agent swarm (Threat Sentinel, Zero-Trust Token Invalidator, Auto-Healer) mitigating ransomware and volumetric DDoS in 1.4 seconds with zero citizen downtime."
    ],
    highlight: "Innovation: Moving from reactive human cybersecurity to sub-second autonomous agentic self-healing."
  },
  {
    number: 3,
    title: "3. Impact & Value Driven by UAE Open Data",
    speaker: "Speaker 1: Impact & Data",
    timeSlot: "1:15 - 2:00",
    bullets: [
      "Effective Use of Open Data: Live ingestion and visualization of Bayanat.ae / TDRA threat telemetry across all 7 Emirates.",
      "Public Awareness at Scale: Proactive scam radar drills educating residents on deepfakes, SMS smishing, and QR code quishing.",
      "Measurable Impact: Over 1.4 million threats deflected in 2026, elevating the National Digital Trust Index to an unprecedented 96.8%."
    ],
    highlight: "Outcome: Empowered citizens, zero credential loss, and complete transparency in national digital health."
  },
  {
    number: 4,
    title: "4. Solution Feasibility & Technical Architecture",
    speaker: "Speaker 3: Feasibility & Closing",
    timeSlot: "2:00 - 2:40",
    bullets: [
      "Production-Ready Architecture: Lightweight microVM containment, Anycast scrubbing, and native UAE PASS identity token attestation.",
      "Securing Agentic AI: Built-in governance framework enforcing cryptographic attestations, strict blast-radius sandboxing, and human-in-the-loop overrides for autonomous agents.",
      "Business Model Canvas (BMC): Scalable national SaaS and public security infrastructure aligned with UAE Cyber Security Council standards."
    ],
    highlight: "Feasibility: Zero new hardware required; integrates seamlessly with existing FedNet and TDRA infrastructure."
  },
  {
    number: 5,
    title: "5. Closing: Building the World's Most Cyber-Secure Nation",
    speaker: "Speaker 3: Feasibility & Closing",
    timeSlot: "2:40 - 3:00",
    bullets: [
      "Directly embodies the UAE National Cybersecurity Strategy 2025–2031 vision.",
      "Bridges the gap between technical infrastructure resilience and everyday citizen trust.",
      "Join us in transforming cyber defense into an autonomous, transparent, and resilient national shield."
    ],
    highlight: "Call to Action: Protecting every citizen, securing every service, elevating national trust."
  }
];

let currentSlideIndex = 0;
let pitchTimerInterval = null;
let pitchTimeRemaining = 180;

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupScanner();
  setupResilience();
  setupOpenData();
  setupAgentGuard();
  setupAcademy();
  setupPitchModal();
});

// --- 1. Tab Navigation ---
function setupNavigation() {
  const tabs = document.querySelectorAll(".workbench-tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");

      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      contents.forEach(c => {
        if (c.id === targetId) {
          c.classList.remove("hidden");
        } else {
          c.classList.add("hidden");
        }
      });

      if (targetId === "tab-opendata" && !chartsInitialized) {
        initCharts();
      }
    });
  });
}

// --- 2. Scanner Module ---
function setupScanner() {
  const scanInput = document.getElementById("scanInput");
  const btnScan = document.getElementById("btnScan");
  const btnClear = document.getElementById("btnClear");
  const placeholder = document.getElementById("scanResultPlaceholder");
  const resultContainer = document.getElementById("scanResultContainer");

  const verdictBadge = document.getElementById("resVerdictBadge");
  const riskScore = document.getElementById("resRiskScore");
  const flagsList = document.getElementById("resFlagsList");
  const officialBox = document.getElementById("resOfficialBox");
  const officialName = document.getElementById("resOfficialName");
  const officialUrl = document.getElementById("resOfficialUrl");
  const btnReport = document.getElementById("btnReportIncident");

  const presets = {
    epost: "Emirates Post: Your parcel AED-9021 delivery fee of AED 12.50 is unpaid. Click epst-uae-track.biz/pay immediately to avoid return.",
    police: "Dubai Police traffic notification: Overdue speeding fine AED 400. Pay within 24 hours at dubaipolice-portal.net/fines to prevent impound.",
    bank: "Central Bank of UAE: Urgent notice! Your bank card will be suspended due to outdated Emirates ID. Verify OTP at cbu-security-verification.org",
    official: "https://www.tamm.abudhabi/en/services/housing"
  };

  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pKey = btn.getAttribute("data-preset");
      if (presets[pKey]) {
        scanInput.value = presets[pKey];
        runScan();
      }
    });
  });

  btnClear.addEventListener("click", () => {
    scanInput.value = "";
    placeholder.classList.remove("hidden");
    resultContainer.classList.add("hidden");
  });

  btnScan.addEventListener("click", () => {
    runScan();
  });

  async function runScan() {
    const text = scanInput.value.trim();
    if (!text) {
      alert("Please enter a link or notification text to analyze.");
      return;
    }

    btnScan.disabled = true;
    btnScan.innerHTML = `<span class="animate-pulse">ANALYZING HEURISTICS...</span>`;

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      renderScanResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze payload. Ensure server is active.");
    } finally {
      btnScan.disabled = false;
      btnScan.innerHTML = `<span>EXECUTE DEEP INSPECTION</span> <span>→</span>`;
    }
  }

  function renderScanResult(data) {
    placeholder.classList.add("hidden");
    resultContainer.classList.remove("hidden");

    riskScore.textContent = `${data.riskScore} / 100`;

    if (data.verdict === "VERIFIED_OFFICIAL") {
      verdictBadge.textContent = "VERIFIED OFFICIAL ENTITY";
      verdictBadge.className = "px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-emerald-950/80 border border-emerald-700 text-emerald-300";
      riskScore.className = "font-display text-2xl font-bold font-mono text-emerald-400";
    } else if (data.verdict === "CRITICAL_THREAT") {
      verdictBadge.textContent = "CRITICAL PHISHING THREAT";
      verdictBadge.className = "px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-rose-950/80 border border-rose-800 text-rose-300";
      riskScore.className = "font-display text-2xl font-bold font-mono text-signalCrit";
    } else {
      verdictBadge.textContent = "SUSPICIOUS ANOMALY";
      verdictBadge.className = "px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-amber-950/80 border border-amber-800 text-amber-300";
      riskScore.className = "font-display text-2xl font-bold font-mono text-signalWarn";
    }

    flagsList.innerHTML = "";
    if (data.flags && data.flags.length > 0) {
      data.flags.forEach(f => {
        const item = document.createElement("div");
        item.className = "p-2.5 rounded surface-inset border border-white/[0.04] flex items-start gap-2.5 text-xs";
        let pipClass = f.type === "CRITICAL" || f.type === "DANGER" ? "text-rose-400" : (f.type === "SUCCESS" ? "text-brand" : "text-amber-400");
        item.innerHTML = `
          <span class="${pipClass} font-bold font-mono">▸</span>
          <span class="text-slate-300 font-mono">${f.en}</span>
        `;
        flagsList.appendChild(item);
      });
    }

    if (data.officialAlternative) {
      officialBox.classList.remove("hidden");
      officialName.textContent = data.officialAlternative.name;
      officialUrl.textContent = data.officialAlternative.url;
      officialUrl.href = data.officialAlternative.url;
    } else {
      officialBox.classList.add("hidden");
    }

    btnReport.onclick = async () => {
      btnReport.disabled = true;
      btnReport.innerHTML = `<span>DISPATCHING TELEMETRY...</span>`;
      try {
        await fetch("/api/report-scam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: scanInput.value,
            type: data.brandSpoofed || "Phishing Scam",
            emirate: "Abu Dhabi / Dubai"
          })
        });
        btnReport.innerHTML = `<span class="text-brand font-mono">✓ TELEMETRY LOGGED WITH NATIONAL eCRIME (${data.reportToken})</span>`;
      } catch (err) {
        console.error(err);
      }
    };
  }
}

// --- 3. Critical Infrastructure Resilience ---
function setupResilience() {
  const sectorGrid = document.getElementById("sectorGrid");
  const drillSelect = document.getElementById("drillPresetSelect");
  const btnRunDrill = document.getElementById("btnRunDrill");
  const timelineContainer = document.getElementById("drillTimelineContainer");
  const drillSubtitle = document.getElementById("drillSubtitle");

  async function loadSectors() {
    try {
      const res = await fetch("/api/infrastructure");
      const data = await res.json();
      sectorGrid.innerHTML = "";

      data.sectors.forEach(sec => {
        const card = document.createElement("div");
        card.className = "surface-panel p-4 space-y-2 border border-white/[0.07]";
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase tracking-widest text-slate-500">${sec.id}</span>
            <span class="status-pip"></span>
          </div>
          <h4 class="font-display text-xs font-bold text-white line-clamp-1">${sec.name}</h4>
          <div class="space-y-1 text-[11px] font-mono text-slate-400">
            <div>Uptime: <span class="text-brand font-semibold">${sec.uptime}</span></div>
            <div>Scrubbing: <span class="text-slate-200">${sec.threatBlockRate}</span></div>
          </div>
        `;
        sectorGrid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  }

  loadSectors();

  btnRunDrill.addEventListener("click", async () => {
    const preset = drillSelect.value;
    btnRunDrill.disabled = true;
    btnRunDrill.innerHTML = `<span>EXECUTING PLAYBOOK...</span>`;
    timelineContainer.innerHTML = `<div class="p-6 text-center text-xs font-mono text-brand animate-pulse">Running autonomous playbooks: Anomaly detection -> Session Revocation -> MicroVM Failover...</div>`;

    try {
      const res = await fetch("/api/simulate-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset })
      });
      const data = await res.json();
      drillSubtitle.textContent = `${data.details.title} [${data.details.severity}]`;

      timelineContainer.innerHTML = "";
      const steps = data.details.steps;

      steps.forEach((st, idx) => {
        setTimeout(() => {
          const row = document.createElement("div");
          row.className = "drill-step-row";
          
          let tagColor = "text-slate-400 border-white/10";
          if (st.status === "TRIGGERED") tagColor = "text-rose-400 border-rose-800 bg-rose-950/40";
          if (st.status === "RESOLVED") tagColor = "text-brand border-emerald-800 bg-emerald-950/40";

          row.innerHTML = `
            <span class="font-mono text-xs text-slate-500 pt-0.5">${st.time}</span>
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-slate-200">${st.agent}</span>
                <span class="px-2 py-0.5 text-[10px] font-mono uppercase border rounded ${tagColor}">${st.status}</span>
              </div>
              <p class="text-xs text-slate-400 font-mono leading-relaxed">${st.action}</p>
            </div>
          `;
          timelineContainer.appendChild(row);

          if (idx === steps.length - 1) {
            btnRunDrill.disabled = false;
            btnRunDrill.innerHTML = `<span>TRIGGER AUTONOMOUS DRILL</span> <span>⚡</span>`;
          }
        }, idx * 550);
      });

    } catch (err) {
      console.error(err);
      btnRunDrill.disabled = false;
      btnRunDrill.innerHTML = `<span>TRIGGER AUTONOMOUS DRILL</span> <span>⚡</span>`;
    }
  });
}

// --- 4. Open Data Charts ---
async function setupOpenData() {}

async function initCharts() {
  chartsInitialized = true;
  try {
    const res = await fetch("/api/opendata");
    const data = await res.json();
    if (!data) return;

    // Emirates Bar Chart (Deliberate high-contrast palette)
    const ctxEmirates = document.getElementById("chartEmirates").getContext("2d");
    if (chartEmiratesInstance) chartEmiratesInstance.destroy();
    chartEmiratesInstance = new Chart(ctxEmirates, {
      type: "bar",
      data: {
        labels: data.emirates_telemetry.map(e => e.emirate),
        datasets: [{
          label: "Threats Mitigated",
          data: data.emirates_telemetry.map(e => e.threats_mitigated),
          backgroundColor: "#10B981",
          borderWidth: 0,
          borderRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: "#64748B", font: { family: "IBM Plex Mono", size: 10 } }, grid: { display: false } },
          y: { ticks: { color: "#64748B", font: { family: "IBM Plex Mono", size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } }
        },
        plugins: { legend: { display: false } }
      }
    });

    // Threat Vectors Doughnut Chart
    const ctxVectors = document.getElementById("chartVectors").getContext("2d");
    if (chartVectorsInstance) chartVectorsInstance.destroy();
    chartVectorsInstance = new Chart(ctxVectors, {
      type: "doughnut",
      data: {
        labels: data.threat_vectors_distribution.map(v => v.name),
        datasets: [{
          data: data.threat_vectors_distribution.map(v => v.percentage),
          backgroundColor: ["#E11D48", "#D97706", "#0284C7", "#059669", "#64748B"],
          borderColor: "#0E1422",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#94A3B8", font: { family: "IBM Plex Mono", size: 10 }, boxWidth: 10, padding: 8 }
          }
        }
      }
    });

    // Trust Progression Line Chart
    const ctxProg = document.getElementById("chartProgression").getContext("2d");
    if (chartProgressionInstance) chartProgressionInstance.destroy();
    chartProgressionInstance = new Chart(ctxProg, {
      type: "line",
      data: {
        labels: data.historical_trust_progression.map(p => p.year),
        datasets: [{
          label: "Digital Trust Confidence Score (%)",
          data: data.historical_trust_progression.map(p => p.trust_index),
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.05)",
          fill: true,
          tension: 0.2,
          pointBackgroundColor: "#F8FAFC",
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: "#64748B", font: { family: "IBM Plex Mono", size: 10 } }, grid: { display: false } },
          y: { min: 70, max: 100, ticks: { color: "#64748B", font: { family: "IBM Plex Mono", size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } }
        },
        plugins: { legend: { display: false } }
      }
    });

  } catch (err) {
    console.error(err);
  }
}

// --- 5. Securing Agentic AI ---
async function setupAgentGuard() {
  const container = document.getElementById("agentRegistryGrid");
  try {
    const res = await fetch("/api/agentic-ai-framework");
    const data = await res.json();
    container.innerHTML = "";

    data.registeredAgents.forEach(agt => {
      const card = document.createElement("div");
      card.className = "surface-panel p-5 space-y-3 border border-white/[0.07]";
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/[0.05] pb-2">
          <span class="text-xs font-mono font-bold text-brand">${agt.id}</span>
          <span class="text-[10px] font-mono uppercase text-slate-500">DID VALID</span>
        </div>
        <h4 class="font-display text-sm font-bold text-white">${agt.name}</h4>
        <div class="space-y-1 text-xs font-mono text-slate-400">
          <div>Authority: <span class="text-slate-200">${agt.authority}</span></div>
          <div>Privilege: <span class="text-slate-300 font-semibold">${agt.privilegeTier}</span></div>
          <div class="text-[10px] text-slate-500 break-all font-mono">Proof: ${agt.cryptographicAttestation}</div>
        </div>
        <div class="p-3 rounded surface-inset border border-white/[0.04] text-[11px] font-mono text-slate-400">
          <strong>Sandbox Boundary:</strong> ${agt.sandboxBoundary}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// --- 6. Resident Cyber Drills ---
function setupAcademy() {
  document.querySelectorAll(".quiz-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.getAttribute("data-correct") === "true";
      const parent = btn.closest(".surface-panel");
      const feedback = parent.querySelector(".quiz-feedback");

      feedback.classList.remove("hidden");
      if (isCorrect) {
        feedback.className = "quiz-feedback text-xs font-mono p-3 rounded surface-inset border border-emerald-800 text-emerald-300";
        feedback.textContent = "✓ CORRECT DECISION: Verified safe protocol. Official UAE bodies never solicit credentials over untrusted channels.";
      } else {
        feedback.className = "quiz-feedback text-xs font-mono p-3 rounded surface-inset border border-rose-800 text-rose-300";
        feedback.textContent = "✗ CRITICAL RISK: Answering exposes identity and card details to adversaries.";
      }
    });
  });
}

// --- 7. Pitch Deck Modal & Timer ---
function setupPitchModal() {
  const modal = document.getElementById("pitchModal");
  const btnOpen = document.getElementById("btnOpenPitch");
  const btnClose = document.getElementById("btnClosePitch");

  const slideViewport = document.getElementById("slideViewport");
  const slideIndicator = document.getElementById("slideIndicator");
  const btnPrev = document.getElementById("btnPrevSlide");
  const btnNext = document.getElementById("btnNextSlide");

  const timerDisplay = document.getElementById("pitchTimer");
  const btnToggleTimer = document.getElementById("btnToggleTimer");
  const btnResetTimer = document.getElementById("btnResetTimer");

  btnOpen.addEventListener("click", () => {
    modal.classList.remove("hidden");
    renderCurrentSlide();
  });

  btnClose.addEventListener("click", () => {
    modal.classList.add("hidden");
    clearInterval(pitchTimerInterval);
    pitchTimerInterval = null;
    btnToggleTimer.textContent = "Start Timer";
  });

  // ESC key to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderCurrentSlide();
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentSlideIndex < PITCH_SLIDES.length - 1) {
      currentSlideIndex++;
      renderCurrentSlide();
    }
  });

  function renderCurrentSlide() {
    const s = PITCH_SLIDES[currentSlideIndex];
    slideIndicator.textContent = `SLIDE ${s.number} OF 5`;

    slideViewport.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-white/[0.08] pb-2">
          <span class="text-xs font-mono font-bold text-brand uppercase">${s.speaker}</span>
          <span class="text-xs font-mono text-slate-500">${s.timeSlot}</span>
        </div>
        <h3 class="font-display text-2xl font-bold text-white tracking-tight">${s.title}</h3>
        <ul class="space-y-2 text-sm text-slate-300 font-body">
          ${s.bullets.map(b => `<li class="flex items-start gap-2.5"><span class="text-brand font-mono font-bold">▸</span><span>${b}</span></li>`).join("")}
        </ul>
      </div>
      <div class="mt-6 p-3.5 rounded surface-inset border border-white/[0.08] text-xs font-mono text-slate-400">
        <strong class="text-white">STRATEGIC TAKEAWAY:</strong> ${s.highlight}
      </div>
    `;
  }

  btnToggleTimer.addEventListener("click", () => {
    if (pitchTimerInterval) {
      clearInterval(pitchTimerInterval);
      pitchTimerInterval = null;
      btnToggleTimer.textContent = "Resume Timer";
    } else {
      btnToggleTimer.textContent = "Pause Timer";
      pitchTimerInterval = setInterval(() => {
        if (pitchTimeRemaining > 0) {
          pitchTimeRemaining--;
          updateTimerDisplay();
        } else {
          clearInterval(pitchTimerInterval);
          pitchTimerInterval = null;
          timerDisplay.textContent = "00:00 (TIME)";
          btnToggleTimer.textContent = "Finished";
        }
      }, 1000);
    }
  });

  btnResetTimer.addEventListener("click", () => {
    clearInterval(pitchTimerInterval);
    pitchTimerInterval = null;
    pitchTimeRemaining = 180;
    updateTimerDisplay();
    btnToggleTimer.textContent = "Start Timer";
  });

  function updateTimerDisplay() {
    const mins = Math.floor(pitchTimeRemaining / 60).toString().padStart(2, "0");
    const secs = (pitchTimeRemaining % 60).toString().padStart(2, "0");
    timerDisplay.textContent = `${mins}:${secs}`;
  }
}
