/**
 * AmanNation - UAE Open Data Service (Bayanat.ae integration)
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "bayanat_cyber_opendata.json");

function getOpenData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading open data file:", err);
    return null;
  }
}

function exportCsv() {
  const data = getOpenData();
  if (!data || !data.emirates_telemetry) return "";

  const headers = ["Emirate", "Services_Monitored", "Threats_Mitigated_2026", "Digital_Trust_Score", "Top_Attack_Vector"];
  const rows = data.emirates_telemetry.map(e => [
    `"${e.emirate}"`,
    e.digital_gov_services_monitored,
    e.threats_mitigated,
    e.trust_score,
    `"${e.top_vector}"`
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

module.exports = {
  getOpenData,
  exportCsv
};
