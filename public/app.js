/**
 * CyberTrust Nation - Frontend Application Logic
 * UAE Hackathon 2026 - Theme 4: Digital Trust & Cyber-Secure Nation
 */

// --- Global State ---
let chartsInitialized = false;
let chartEmiratesInstance = null;
let chartVectorsInstance = null;
let chartProgressionInstance = null;

// Pitch Deck Data (PDF Guidelines: 5 Slides, 3-minute presentation, speaker assignments)
const PITCH_SLIDES = [
  {
    number: 1,
    title: "1. The Problem: The Rising Fragility of Digital Trust",
    speaker: "Speaker 1: Problem & Impact (0:00 - 0:30)",
    timeSlot: "0:00 - 0:30",
    bullets: [
      "The UAE leads the world in digital government adoption (98%+ citizen engagement via TAMM, DubaiNow, UAE PASS).",
      "However, sophisticated attacks threaten this foundation: 38% rise in spoofed government SMS smishing and automated credential harvesting targeting residents.",
      "A single high-profile critical infrastructure outage or citizen data scam undermines public confidence and risks millions in national economic disruption."
    ],
    highlight: "Core Challenge: How do we safeguard public trust while ensuring critical digital services remain 100% resilient against large-scale cyber incidents?"
  },
  {
    number: 2,
    title: "2. Our Solution: CyberTrust Nation Autonomous Ecosystem",
    speaker: "Speaker 2: Solution & AI (0:30 - 1:15)",
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
    speaker: "Speaker 1: Impact & Data (1:15 - 2:00)",
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
    speaker: "Speaker 3: Feasibility & Closing (2:00 - 2:40)",
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
    speaker: "Speaker 3: Feasibility & Closing (2:40 - 3:00)",
    timeSlot: "2:40 - 3:00",
    bullets: [
      "Directly embodies the UAE National Cybersecurity Strategy 2025-2031 vision.",
      "Bridges the gap between technical infrastructure resilience and everyday citizen trust.",
      "Join us in transforming cyber defense into an autonomous, transparent, and resilient national shield."
    ],
    highlight: "Call to Action: Protecting every citizen, securing every service, elevating national trust."
  }
];

let currentSlideIndex = 0;
let pitchTimerInterval = null;
let pitchTimeRemaining = 180; // 3 minutes in seconds

// --- DOM Ready Initialization ---
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
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");
      
      tabs.forEach(t => {
        t.classList.remove("active", "border-emerald-500", "text-emerald-400");
        t.classList.add("border-transparent", "text-slate-400");
      });
      tab.classList.add("active", "border-emerald-500", "text-emerald-400");
      tab.classList.remove("border-transparent", "text-slate-400");

      contents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove("hidden");
        } else {
          content.classList.add("hidden");
        }
      });

      // Lazy init charts when Open Data tab is selected
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

  // Sample Presets
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
      alert("Please enter a link, SMS message, or notification to inspect.");
      return;
    }

    btnScan.disabled = true;
    btnScan.innerHTML = `<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Analyzing...`;

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
      alert("Failed to analyze text. Please ensure the local server is running.");
    } finally {
      btnScan.disabled = false;
      btnScan.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Analyze Trust & Threat Level`;
    }
  }

  function renderScanResult(data) {
    placeholder.classList.add("hidden");
    resultContainer.classList.remove("hidden");

    riskScore.textContent = `${data.riskScore}/100`;

    // Verdict Badge styling
    if (data.verdict === "VERIFIED_OFFICIAL") {
      verdictBadge.textContent = "VERIFIED OFFICIAL SERVICE";
      verdictBadge.className = "px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
      riskScore.className = "text-2xl font-extrabold font-mono text-emerald-400";
    } else if (data.verdict === "CRITICAL_THREAT") {
      verdictBadge.textContent = "CRITICAL PHISHING THREAT";
      verdictBadge.className = "px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40";
      riskScore.className = "text-2xl font-extrabold font-mono text-rose-400";
    } else {
      verdictBadge.textContent = "SUSPICIOUS ANOMALY";
      verdictBadge.className = "px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40";
      riskScore.className = "text-2xl font-extrabold font-mono text-amber-400";
    }

    // Flags
    flagsList.innerHTML = "";
    if (data.flags && data.flags.length > 0) {
      data.flags.forEach(f => {
        const item = document.createElement("div");
        item.className = "p-2 rounded bg-slate-900/80 border border-slate-800 flex items-start gap-2";
        let iconColor = f.type === "CRITICAL" || f.type === "DANGER" ? "text-rose-400" : (f.type === "SUCCESS" ? "text-emerald-400" : "text-amber-400");
        item.innerHTML = `
          <span class="${iconColor} font-bold">•</span>
          <span class="text-slate-300">${f.en}</span>
        `;
        flagsList.appendChild(item);
      });
    }

    // Official alternative box
    if (data.officialAlternative) {
      officialBox.classList.remove("hidden");
      officialName.textContent = data.officialAlternative.name;
      officialUrl.textContent = data.officialAlternative.url;
      officialUrl.href = data.officialAlternative.url;
    } else {
      officialBox.classList.add("hidden");
    }

    // Report Incident action
    btnReport.onclick = async () => {
      btnReport.disabled = true;
      btnReport.textContent = "Submitting Report to National Authorities...";
      try {
        await fetch("/api/report-scam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: scanInput.value,
            type: data.brandSpoofed || "Phishing Scam",
            emirate: "Dubai / Abu Dhabi"
          })
        });
        btnReport.className = "w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 transition flex items-center justify-center gap-1.5";
        btnReport.innerHTML = `✓ Dispatched & Logged with National eCrime (Ticket: ${data.reportToken})`;
      } catch (err) {
        console.error(err);
      }
    };
  }
}

// --- 3. Critical Infrastructure Resilience Module ---
function setupResilience() {
  const sectorGrid = document.getElementById("sectorGrid");
  const drillSelect = document.getElementById("drillPresetSelect");
  const btnRunDrill = document.getElementById("btnRunDrill");
  const timelineContainer = document.getElementById("drillTimelineContainer");
  const drillSubtitle = document.getElementById("drillSubtitle");

  // Load Sector Telemetry
  async function loadSectors() {
    try {
      const res = await fetch("/api/infrastructure");
      const data = await res.json();
      sectorGrid.innerHTML = "";

      data.sectors.forEach(sec => {
        const card = document.createElement("div");
        card.className = "glass-panel p-4 space-y-2 glass-card-hover border-slate-800";
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">${sec.id}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-indicator"></span>
          </div>
          <h4 class="text-sm font-bold text-white line-clamp-1">${sec.name}</h4>
          <div class="text-[11px] text-slate-400">
            <div>Lead: <span class="text-slate-200 font-medium">${sec.leadEntity}</span></div>
            <div>Uptime: <span class="text-emerald-400 font-mono font-semibold">${sec.uptime}</span></div>
          </div>
          <div class="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Threat Block:</span>
            <span class="font-mono text-cyan-400">${sec.threatBlockRate}</span>
          </div>
        `;
        sectorGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Failed to load sectors:", err);
    }
  }

  loadSectors();

  // Run Drill Action
  btnRunDrill.addEventListener("click", async () => {
    const preset = drillSelect.value;
    btnRunDrill.disabled = true;
    btnRunDrill.textContent = "Executing Autonomous Drill...";
    timelineContainer.innerHTML = `<div class="text-center py-4 text-xs text-cyan-400 animate-pulse font-mono">Simulating real-time cyber incident and autonomous multi-agent playbook response...</div>`;

    try {
      const res = await fetch("/api/simulate-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset })
      });
      const data = await res.json();

      drillSubtitle.textContent = `Active Drill: ${data.details.title} (${data.details.severity})`;
      
      // Step-by-step playback
      timelineContainer.innerHTML = "";
      const steps = data.details.steps;

      steps.forEach((st, idx) => {
        setTimeout(() => {
          const stepRow = document.createElement("div");
          stepRow.className = "timeline-step p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs";
          
          let badgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
          if (st.status === "TRIGGERED") badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
          if (st.status === "RESOLVED") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

          stepRow.innerHTML = `
            <span class="font-mono font-bold text-slate-400 pt-0.5">${st.time}</span>
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-200">${st.agent}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}">${st.status}</span>
              </div>
              <p class="text-slate-400 leading-relaxed">${st.action}</p>
            </div>
          `;
          timelineContainer.appendChild(stepRow);

          if (idx === steps.length - 1) {
            btnRunDrill.disabled = false;
            btnRunDrill.textContent = "Execute Drill";
          }
        }, idx * 600);
      });

    } catch (err) {
      console.error(err);
      btnRunDrill.disabled = false;
      btnRunDrill.textContent = "Execute Drill";
    }
  });
}

// --- 4. Open Data Intelligence & Charts ---
async function setupOpenData() {
  // Chart initialization occurs in initCharts()
}

async function initCharts() {
  chartsInitialized = true;
  try {
    const res = await fetch("/api/opendata");
    const data = await res.json();
    if (!data) return;

    // 1. Emirates Bar Chart
    const ctxEmirates = document.getElementById("chartEmirates").getContext("2d");
    const emiratesLabels = data.emirates_telemetry.map(e => e.emirate);
    const emiratesValues = data.emirates_telemetry.map(e => e.threats_mitigated);

    if (chartEmiratesInstance) chartEmiratesInstance.destroy();
    chartEmiratesInstance = new Chart(ctxEmirates, {
      type: "bar",
      data: {
        labels: emiratesLabels,
        datasets: [{
          label: "Threats Mitigated (2026)",
          data: emiratesValues,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "#10B981",
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    // 2. Vectors Doughnut Chart
    const ctxVectors = document.getElementById("chartVectors").getContext("2d");
    const vectorLabels = data.threat_vectors_distribution.map(v => v.name);
    const vectorValues = data.threat_vectors_distribution.map(v => v.percentage);

    if (chartVectorsInstance) chartVectorsInstance.destroy();
    chartVectorsInstance = new Chart(ctxVectors, {
      type: "doughnut",
      data: {
        labels: vectorLabels,
        datasets: [{
          data: vectorValues,
          backgroundColor: ["#EF4444", "#F59E0B", "#06B6D4", "#3B82F6", "#8B5CF6"],
          borderColor: "#070B14",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd5e1", font: { size: 10 }, boxWidth: 12, padding: 8 }
          }
        }
      }
    });

    // 3. Trust Progression Line Chart
    const ctxProg = document.getElementById("chartProgression").getContext("2d");
    const progYears = data.historical_trust_progression.map(p => p.year);
    const progTrust = data.historical_trust_progression.map(p => p.trust_index);

    if (chartProgressionInstance) chartProgressionInstance.destroy();
    chartProgressionInstance = new Chart(ctxProg, {
      type: "line",
      data: {
        labels: progYears,
        datasets: [{
          label: "Digital Trust Confidence Score (%)",
          data: progTrust,
          borderColor: "#06B6D4",
          backgroundColor: "rgba(6, 182, 212, 0.15)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#10B981",
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: "#94a3b8", font: { size: 11 } }, grid: { display: false } },
          y: { min: 70, max: 100, ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } }
        },
        plugins: {
          legend: { labels: { color: "#cbd5e1", font: { size: 11 } } }
        }
      }
    });

  } catch (err) {
    console.error("Failed to load chart data:", err);
  }
}

// --- 5. Securing Agentic AI Module ---
async function setupAgentGuard() {
  const container = document.getElementById("agentRegistryGrid");
  try {
    const res = await fetch("/api/agentic-ai-framework");
    const data = await res.json();
    container.innerHTML = "";

    data.registeredAgents.forEach(agt => {
      const card = document.createElement("div");
      card.className = "glass-panel p-5 space-y-3 glass-card-hover border-slate-800";
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold text-cyan-400">${agt.id}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">VALID ATTESTATION</span>
        </div>
        <h4 class="text-sm font-bold text-white">${agt.name}</h4>
        <div class="space-y-1.5 text-xs text-slate-400">
          <div>Authority: <span class="text-slate-200">${agt.authority}</span></div>
          <div>Privilege: <span class="text-amber-400 font-medium">${agt.privilegeTier}</span></div>
          <div class="font-mono text-[11px] text-slate-500 break-all">Attestation: ${agt.cryptographicAttestation}</div>
        </div>
        <div class="p-2 rounded bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300">
          <strong>Sandbox Boundary:</strong> ${agt.sandboxBoundary}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load agent framework:", err);
  }
}

// --- 6. Public Cyber Safety Academy & Drills ---
function setupAcademy() {
  document.querySelectorAll(".quiz-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.getAttribute("data-correct") === "true";
      const parent = btn.closest(".glass-panel");
      const feedback = parent.querySelector(".quiz-feedback");

      feedback.classList.remove("hidden");
      if (isCorrect) {
        feedback.className = "quiz-feedback text-xs font-semibold p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40";
        feedback.textContent = "✓ Correct! Excellent cyber awareness instinct. You've earned a Cyber Safety Point!";
      } else {
        feedback.className = "quiz-feedback text-xs font-semibold p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40";
        feedback.textContent = "✗ Caution! This choice exposes credentials to attackers. Official UAE entities never solicit sensitive OTPs or payments via untrusted channels.";
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
    slideIndicator.textContent = `Slide ${s.number} of 5`;

    slideViewport.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-xs font-mono font-bold text-emerald-400">${s.speaker}</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">${s.timeSlot}</span>
        </div>
        <h3 class="text-xl font-bold text-white tracking-tight">${s.title}</h3>
        <ul class="space-y-2 text-sm text-slate-300">
          ${s.bullets.map(b => `<li class="flex items-start gap-2"><span class="text-emerald-400 font-bold">•</span><span>${b}</span></li>`).join("")}
        </ul>
      </div>
      <div class="mt-6 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
        💡 ${s.highlight}
      </div>
    `;
  }

  // Timer logic
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
          timerDisplay.textContent = "00:00 (TIME'S UP)";
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
