/**
 * AmanNation (أمان الوطن) - Backend Server
 * UAE Hackathon 2026 - Theme 4: Digital Trust & Cyber-Secure Nation
 */

const express = require("express");
const path = require("path");
const { analyzeContent } = require("./services/scannerService");
const { getSectorTelemetry, simulateIncident, INCIDENT_PRESETS } = require("./services/resilienceEngine");
const { getOpenData, exportCsv } = require("./services/openDataService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory reported scams for live community telemetry
const communityReports = [
  {
    id: "REP-9921",
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    type: "SMS Smishing",
    content: "Emirates Post: Unpaid delivery fee of AED 12.50. Click epst-uae-track.biz/pay",
    status: "Verified Malicious - Blocked by TDRA",
    reportedFrom: "Dubai"
  },
  {
    id: "REP-9922",
    timestamp: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    type: "Traffic Fine Spoof",
    content: "Dubai Police alert: Final warning for overdue fine. dubaipolice-portal.net/fines",
    status: "Verified Malicious - IP Blacklisted",
    reportedFrom: "Abu Dhabi"
  },
  {
    id: "REP-9923",
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    type: "Banking Impersonation",
    content: "Central Bank of UAE: Urgent update your Emirates ID card to prevent card freeze",
    status: "Under Forensic Inspection",
    reportedFrom: "Sharjah"
  }
];

// --- API Endpoints ---

// 1. Phishing & Scam Scanner Endpoint
app.post("/api/scan", (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text or URL to scan is required" });
    }
    const result = analyzeContent(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Critical Infrastructure Sector Telemetry
app.get("/api/infrastructure", (req, res) => {
  const telemetry = getSectorTelemetry();
  res.json({
    timestamp: new Date().toISOString(),
    nationalReadinessLevel: "ALPHA-PROTECTED",
    sectors: telemetry
  });
});

// 3. Autonomous Incident Simulation Endpoint
app.post("/api/simulate-incident", (req, res) => {
  const { preset } = req.body;
  const drillResult = simulateIncident(preset);
  res.json(drillResult);
});

// 4. UAE Open Data (Bayanat.ae) Telemetry
app.get("/api/opendata", (req, res) => {
  const data = getOpenData();
  res.json(data);
});

// 5. Open Data CSV Export
app.get("/api/opendata/csv", (req, res) => {
  const csv = exportCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="UAE_Cyber_OpenData_2026.csv"');
  res.send(csv);
});

// 6. Report Scam (Community Watch)
app.post("/api/report-scam", (req, res) => {
  const { text, type, emirate } = req.body;
  const newReport = {
    id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    type: type || "Suspicious Message / Link",
    content: text ? text.substring(0, 100) : "Unspecified submission",
    status: "Dispatched to UAE eCrime & TDRA National Honeynet",
    reportedFrom: emirate || "United Arab Emirates"
  };
  communityReports.unshift(newReport);
  res.json({ success: true, report: newReport, totalReports: communityReports.length });
});

app.get("/api/reports", (req, res) => {
  res.json({ reports: communityReports.slice(0, 10) });
});

// 7. Agentic AI Security & Identity Framework
app.get("/api/agentic-ai-framework", (req, res) => {
  res.json({
    frameworkName: "Aman-AgentGuard v1.4",
    standard: "UAE National Cybersecurity Strategy 2025-2031 (Agentic Governance)",
    registeredAgents: [
      {
        id: "AGT-TAMM-09",
        name: "Gov Service Synthesizer Agent",
        authority: "Digital Dubai / TAMM Abu Dhabi",
        cryptographicAttestation: "0x89f4b...c3a8 [VALID mTLS]",
        privilegeTier: "Level 2 (Read Public Records, Draft Citizen Actions)",
        sandboxBoundary: "Strict Read-Only SQL, Prompt-Injection Filter Active",
        status: "ACTIVE_AUTHENTICATED"
      },
      {
        id: "AGT-FIN-04",
        name: "Financial Clearing Settlement Agent",
        authority: "SCA / Securities & Commodities Authority",
        cryptographicAttestation: "0x33e1a...f881 [VALID HARDWARE ENCLAVE]",
        privilegeTier: "Level 4 (Transaction Settlement with Multi-Sig)",
        sandboxBoundary: "Double-blind Cryptographic Audit, Max Spend AED 50,000 auto-cap",
        status: "ACTIVE_AUTHENTICATED"
      },
      {
        id: "AGT-HEALTH-02",
        name: "Unified Patient Record Sync Agent",
        authority: "MOHAP (Ministry of Health)",
        cryptographicAttestation: "0x55bc2...a901 [VALID ZERO-KNOWLEDGE PROOF]",
        privilegeTier: "Level 3 (Differential Privacy Anonymizer)",
        sandboxBoundary: "HIPAA/UAE Health Data Law Compliant, Zero-Exfiltration Rule",
        status: "ACTIVE_AUTHENTICATED"
      }
    ],
    guardrailPolicies: [
      { rule: "Identity Attestation", desc: "Every autonomous AI agent must present verifiable cryptographic identity before invoking any federal API." },
      { rule: "Strict Blast-Radius Isolation", desc: "Agents run in ephemeral sub-second microVMs with immutable file systems." },
      { rule: "Human-in-the-Loop Override", desc: "Privileged operations exceeding sensitivity threshold require biometric UAE PASS sign-off." },
      { rule: "Adversarial Prompt Shield", desc: "Real-time semantic vector filtering intercepts prompt injection, jailbreaks, and indirect data leaks." }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🇦🇪 AmanNation CyberTrust Platform running on http://localhost:${PORT}`);
  console.log(`UAE Hackathon 2026 - Theme: Digital Trust & Cyber-Secure Nation`);
  console.log(`=======================================================`);
});
