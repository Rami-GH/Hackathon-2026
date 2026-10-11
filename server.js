/**
 * AegisOS - Backend Server
 * Autonomous National Digital Verification & Critical Infrastructure Resilience Platform
 */

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { analyzeContent } = require("./services/scannerService");
const { getSectorTelemetry, simulateIncident } = require("./services/resilienceEngine");
const { getOpenData, exportCsv } = require("./services/openDataService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Live Telemetry Community Dispatches
const liveDispatches = [
  {
    ticketId: "INC-8941",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: "SMS Smishing",
    targetBrand: "Emirates Post",
    evidenceDomain: "epst-uae-track.biz",
    riskScore: 90,
    status: "DNS Sinkholed (TDRA)",
    hash: "a4f89c02...e319"
  },
  {
    ticketId: "INC-8940",
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: "Spoofed Gov Fine",
    targetBrand: "Dubai Police",
    evidenceDomain: "dubaipolice-portal.net",
    riskScore: 85,
    status: "Carrier Filter Deployed",
    hash: "7b2e11d9...f402"
  },
  {
    ticketId: "INC-8939",
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: "Credential Harvester",
    targetBrand: "Central Bank of UAE",
    evidenceDomain: "cbu-security-verification.org",
    riskScore: 95,
    status: "Under Forensic Inspection",
    hash: "99cb3401...88a2"
  }
];

// 1. Phishing & Scan Inspection
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

// 2. Critical Infrastructure Telemetry
app.get("/api/infrastructure", (req, res) => {
  const telemetry = getSectorTelemetry();
  res.json({
    timestamp: new Date().toISOString(),
    posture: "ACTIVE-DEFENDING",
    sectors: telemetry
  });
});

// 3. Autonomous Incident Simulation
app.post("/api/simulate-incident", (req, res) => {
  const { preset } = req.body;
  const drillResult = simulateIncident(preset);
  res.json(drillResult);
});

// 4. Open Data Telemetry
app.get("/api/opendata", (req, res) => {
  const data = getOpenData();
  res.json(data);
});

// 5. Open Data CSV Export
app.get("/api/opendata/csv", (req, res) => {
  const csv = exportCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="National_Cyber_Telemetry_2026.csv"');
  res.send(csv);
});

// 6. Report & Incident Dispatch API
app.post("/api/report-scam", (req, res) => {
  const { text, type, riskScore, brandSpoofed } = req.body;
  const ticketId = `INC-${Math.floor(8950 + Math.random() * 900)}`;
  const hash = crypto.createHash("sha256").update(text || "telemetry").digest("hex").substring(0, 16);
  
  let domain = "unspecified";
  try {
    const match = text.match(/(https?:\/\/[^\s]+)/i);
    if (match) {
      domain = new URL(match[0].startsWith("http") ? match[0] : `https://${match[0]}`).hostname;
    }
  } catch (e) {
    domain = text.substring(0, 24);
  }

  const dispatchRecord = {
    ticketId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: type || "Deceptive Smishing",
    targetBrand: brandSpoofed || "Government Service",
    evidenceDomain: domain,
    riskScore: riskScore || 85,
    status: "Sinkhole Sync Active",
    hash: `${hash.substring(0, 8)}...${hash.substring(8, 12)}`
  };

  liveDispatches.unshift(dispatchRecord);
  if (liveDispatches.length > 8) liveDispatches.pop();

  res.json({
    success: true,
    ticketId,
    evidenceHash: hash,
    timestamp: new Date().toISOString(),
    status: "DISPATCHED_TO_NATIONAL_HONEYNET",
    mitigationActions: [
      { action: "DNS Sinkhole", detail: `Injected ${domain} into national recursive resolvers.` },
      { action: "Carrier Filter Rule", detail: "SMS payload pattern pushed to e& and du upstream scrubbers." },
      { action: "Registry Escalation", detail: "Abuse notice queued to registrar and upstream hosting provider." },
      { action: "Public Alert Signal", detail: "Pattern indexed in community scam radar feed." }
    ],
    record: dispatchRecord
  });
});

app.get("/api/dispatches", (req, res) => {
  res.json({ dispatches: liveDispatches });
});

// 7. Agentic AI Governance Framework
app.get("/api/agentic-ai-framework", (req, res) => {
  res.json({
    frameworkName: "Aegis-AgentEnclave v2.4",
    standard: "Federal Autonomous AI Governance Standard",
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
        cryptographicAttestation: "0x33e1a...f881 [HARDWARE ENCLAVE]",
        privilegeTier: "Level 4 (Transaction Settlement with Multi-Sig)",
        sandboxBoundary: "Double-blind Cryptographic Audit, Max Spend AED 50,000 auto-cap",
        status: "ACTIVE_AUTHENTICATED"
      },
      {
        id: "AGT-HEALTH-02",
        name: "Unified Patient Record Sync Agent",
        authority: "MOHAP (Ministry of Health)",
        cryptographicAttestation: "0x55bc2...a901 [ZERO-KNOWLEDGE PROOF]",
        privilegeTier: "Level 3 (Differential Privacy Anonymizer)",
        sandboxBoundary: "UAE Health Data Law Compliant, Zero-Exfiltration Rule",
        status: "ACTIVE_AUTHENTICATED"
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`AegisOS Platform running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
