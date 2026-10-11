/**
 * AegisOS - Frontend Application Logic
 * Autonomous Public Trust & Digital Defense
 */

let chartsInitialized = false;
let chartEmiratesInstance = null;
let chartVectorsInstance = null;
let chartProgressionInstance = null;
let lastScanResult = null;
let lastDispatchReceipt = null;

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupScanner();
  setupResilience();
  setupOpenData();
  setupAgentGuard();
  setupAcademy();
  setupDispatchesFeed();
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

// --- 2. Live Incident Feed in Right-Hand Panel ---
async function setupDispatchesFeed() {
  const container = document.getElementById("dispatchesList");
  try {
    const res = await fetch("/api/dispatches");
    const data = await res.json();
    if (!data || !data.dispatches) return;

    container.innerHTML = "";
    data.dispatches.forEach(item => {
      const row = document.createElement("div");
      row.className = "p-2.5 rounded surface-inset border border-white/[0.04] space-y-1 hover:border-white/[0.08] transition";
      row.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-200">${item.ticketId}</span>
          <span class="text-[10px] text-slate-500">${item.timestamp}</span>
        </div>
        <div class="text-[11px] text-slate-400 line-clamp-1">
          <span class="text-brand">${item.targetBrand}:</span> ${item.evidenceDomain}
        </div>
        <div class="flex items-center justify-between text-[10px] pt-1 border-t border-white/[0.03]">
          <span class="text-slate-500 font-mono">Hash: ${item.hash}</span>
          <span class="text-slate-400">${item.status}</span>
        </div>
      `;
      container.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load dispatches feed:", err);
  }
}

// --- 3. Scanner Module & Interactive Dispatch ---
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

  // Dispatch Terminal Modal elements
  const dispatchModal = document.getElementById("dispatchModal");
  const btnCloseDispatch = document.getElementById("btnCloseDispatch");
  const terminalLogs = document.getElementById("dispatchTerminalLogs");
  const actionGrid = document.getElementById("dispatchActionGrid");
  const receiptBox = document.getElementById("dispatchReceiptBox");
  const caseIdDisplay = document.getElementById("dispatchCaseId");
  const btnDownloadReceipt = document.getElementById("btnDownloadReceipt");

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
    lastScanResult = null;
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
      lastScanResult = data;
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
      btnReport.classList.add("hidden");
    } else if (data.verdict === "CRITICAL_THREAT") {
      verdictBadge.textContent = "CRITICAL PHISHING THREAT";
      verdictBadge.className = "px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-rose-950/80 border border-rose-800 text-rose-300";
      riskScore.className = "font-display text-2xl font-bold font-mono text-signalCrit";
      btnReport.classList.remove("hidden");
    } else {
      verdictBadge.textContent = "SUSPICIOUS ANOMALY";
      verdictBadge.className = "px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-amber-950/80 border border-amber-800 text-amber-300";
      riskScore.className = "font-display text-2xl font-bold font-mono text-signalWarn";
      btnReport.classList.remove("hidden");
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
  }

  // DISPATCH FORENSIC TELEMETRY & TRIGGER SINKHOLE
  btnReport.addEventListener("click", async () => {
    dispatchModal.classList.remove("hidden");
    terminalLogs.innerHTML = "";
    actionGrid.classList.add("hidden");
    receiptBox.classList.add("hidden");

    function addLog(msg, color = "text-slate-300") {
      const p = document.createElement("div");
      p.className = `${color} leading-relaxed`;
      p.innerHTML = `<span class="text-slate-600">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
      terminalLogs.appendChild(p);
      terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    addLog("Initializing secure forensic payload packaging...", "text-brand");

    try {
      setTimeout(() => {
        addLog("Generating SHA-256 evidence fingerprint & timestamp signature...", "text-slate-400");
      }, 250);

      setTimeout(() => {
        addLog("Performing mTLS handshake with National Incident Gateway...", "text-slate-400");
      }, 500);

      const res = await fetch("/api/report-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scanInput.value,
          type: (lastScanResult && lastScanResult.brandSpoofed) || "Deceptive Smishing",
          riskScore: (lastScanResult && lastScanResult.riskScore) || 85,
          brandSpoofed: (lastScanResult && lastScanResult.brandSpoofed) || "Government Entity"
        })
      });

      const data = await res.json();
      lastDispatchReceipt = data;

      setTimeout(() => {
        addLog(`Fingerprint confirmed: SHA-256 // ${data.evidenceHash}`, "text-slate-300");
        addLog("Injecting DNS blackhole rule into national recursive resolvers...", "text-slate-300");
      }, 850);

      setTimeout(() => {
        addLog("Distributing SMS regex signature to e& and du core gateway scrubbers...", "text-slate-300");
      }, 1200);

      setTimeout(() => {
        addLog(`SUCCESS: Case filed. Incident Reference: #${data.ticketId}`, "text-brand font-bold");
        caseIdDisplay.textContent = data.ticketId;
        actionGrid.classList.remove("hidden");
        receiptBox.classList.remove("hidden");
        setupDispatchesFeed(); // Refresh live table
      }, 1500);

    } catch (err) {
      console.error(err);
      addLog("ERROR: Connection timeout during gateway dispatch.", "text-rose-400");
    }
  });

  btnCloseDispatch.addEventListener("click", () => {
    dispatchModal.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dispatchModal.classList.contains("hidden")) {
      dispatchModal.classList.add("hidden");
    }
  });

  // Download Evidence JSON
  btnDownloadReceipt.addEventListener("click", () => {
    if (!lastDispatchReceipt) return;
    const blob = new Blob([JSON.stringify(lastDispatchReceipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AegisOS_${lastDispatchReceipt.ticketId}_Forensic_Evidence.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// --- 4. Critical Infrastructure Resilience ---
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

// --- 5. Open Data Charts ---
async function setupOpenData() {}

async function initCharts() {
  chartsInitialized = true;
  try {
    const res = await fetch("/api/opendata");
    const data = await res.json();
    if (!data) return;

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

// --- 6. Securing Agentic AI ---
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

// --- 7. Resident Cyber Drills ---
function setupAcademy() {
  document.querySelectorAll(".quiz-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.getAttribute("data-correct") === "true";
      const parent = btn.closest(".surface-panel");
      const feedback = parent.querySelector(".quiz-feedback");

      feedback.classList.remove("hidden");
      if (isCorrect) {
        feedback.className = "quiz-feedback text-xs font-mono p-3 rounded surface-inset border border-emerald-800 text-emerald-300";
        feedback.textContent = "✓ CORRECT DECISION: Verified safe protocol. Official bodies never solicit credentials over untrusted channels.";
      } else {
        feedback.className = "quiz-feedback text-xs font-mono p-3 rounded surface-inset border border-rose-800 text-rose-300";
        feedback.textContent = "✗ CRITICAL RISK: Answering exposes identity and card details to adversaries.";
      }
    });
  });
}
