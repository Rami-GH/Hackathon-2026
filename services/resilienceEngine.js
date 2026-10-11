/**
 * AmanNation - Autonomous AI Multi-Agent Cyber Resilience Engine
 * Simulates critical infrastructure defense, agentic orchestration, and automated playbooks.
 */

const SECTORS = [
  {
    id: "telecom",
    name: "Telecommunications & Core Gateway",
    nameAr: "الاتصالات وبوابة النفاذ الوطنية",
    leadEntity: "TDRA (e& / du FedNet)",
    status: "HEALTHY",
    uptime: "99.999%",
    activeTrafficGbps: 842.5,
    threatBlockRate: "99.98%",
    agentsAssigned: ["Agent Sentinel-01", "Agent ZeroTrust-02"]
  },
  {
    id: "gov_portals",
    name: "Federal & Emirate Digital Government",
    nameAr: "الخدمات الحكومية الرقمية الاتحادية والمحلية",
    leadEntity: "TAMM, DubaiNow, ICP, MOHAP",
    status: "HEALTHY",
    uptime: "99.994%",
    activeTrafficGbps: 412.0,
    threatBlockRate: "99.94%",
    agentsAssigned: ["Agent Identity-04", "Agent AutoHealer-01"]
  },
  {
    id: "finance_sca",
    name: "Financial Markets & Banking Clearing",
    nameAr: "الأسواق المالية والمقاصة المصرفية",
    leadEntity: "CBUAE, SCA, ADX, DFM",
    status: "HEALTHY",
    uptime: "100.00%",
    activeTrafficGbps: 630.2,
    threatBlockRate: "99.99%",
    agentsAssigned: ["Agent Sentinel-03", "Agent Audit-01"]
  },
  {
    id: "utilities",
    name: "Water, Electricity & Energy Grids",
    nameAr: "شبكات الكهرباء والمياه والطاقة",
    leadEntity: "DEWA, TAQA, EWEC, ADNOC",
    status: "HEALTHY",
    uptime: "100.00%",
    activeTrafficGbps: 185.4,
    threatBlockRate: "99.97%",
    agentsAssigned: ["Agent SCADA-Guard", "Agent ZeroTrust-05"]
  },
  {
    id: "logistics",
    name: "Logistics, Transport & Ports",
    nameAr: "اللوجستيات والموانئ والنقل العام",
    leadEntity: "RTA, Etihad Rail, DP World, Emirates Post",
    status: "HEALTHY",
    uptime: "99.991%",
    activeTrafficGbps: 220.8,
    threatBlockRate: "99.91%",
    agentsAssigned: ["Agent Sentinel-05", "Agent AutoHealer-03"]
  }
];

const INCIDENT_PRESETS = {
  "gov_ransomware": {
    title: "Large-Scale Ransomware & Supply-Chain Infiltration Attempt",
    titleAr: "محاولة تسلل برمجيات فدية واختراق لسلاسل التوريد الحكومية",
    targetSector: "gov_portals",
    severity: "CRITICAL (Level 5)",
    steps: [
      {
        time: "T+0.00s",
        agent: "Agent Sentinel-01 (Threat Detection AI)",
        agentAr: "الوكيل الراصد (Sentinel-01)",
        action: "Spike detected: Anomalous process executions and encrypted file headers identified across 3 edge node workers.",
        actionAr: "رصد شذوذ: تشغيل عمليات مشبوهة ورؤوس ملفات مشفرة عبر 3 خوادم طرفية.",
        status: "TRIGGERED"
      },
      {
        time: "T+0.28s",
        agent: "Agent ZeroTrust-04 (Identity Sentinel)",
        agentAr: "وكيل الثقة الصفرية (ZeroTrust-04)",
        action: "Compromised service token invalidated immediately. UAE PASS session tokens revoked on tainted nodes.",
        actionAr: "إلغاء فوري لمفاتيح الخدمة المخترقة وتجميد جلسات الهوية الرقمية في النطاقات المشبوهة.",
        status: "CONTAINED"
      },
      {
        time: "T+0.85s",
        agent: "Agent AutoHealer-01 (Autonomous Playbook Engine)",
        agentAr: "الوكيل المعالج ذاتياً (AutoHealer-01)",
        action: "Quarantined 3 tainted nodes into sandboxed honey-cluster. Spun up 6 clean immutable microVMs on sovereign cloud.",
        actionAr: "عزل الخوادم المصابة في بيئة مصيدة مغلقة وتشغيل 6 نسخ نظيفة فورية على السحابة السيادية.",
        status: "REMEDIATED"
      },
      {
        time: "T+1.40s",
        agent: "Agent PublicLiaison (Citizen Trust Shield)",
        agentAr: "وكيل التواصل العام وشفافية المواطن",
        action: "Broadcasted verified digital telemetry to National Cyber Dashboard. 100% service uptime preserved, 0 citizen downtime.",
        actionAr: "نشر تقرير الشفافية المعتمد على لوحة البيانات الوطنية. استمرارية الخدمات بنسبة 100% دون انقطاع للمواطنين.",
        status: "RESOLVED"
      }
    ]
  },
  "finance_ddos": {
    title: "Multi-Vector 4.2 Tbps DDoS Flood on Financial Clearing Gateways",
    titleAr: "هجوم حجب خدمة متعدد النواقل بحجم 4.2 تيرابت على بوابات المقاصة المالية",
    targetSector: "finance_sca",
    severity: "HIGH (Level 4)",
    steps: [
      {
        time: "T+0.00s",
        agent: "Agent Sentinel-03 (Telecom Telemetry AI)",
        agentAr: "الوكيل الراصد للاتصالات (Sentinel-03)",
        action: "Volumetric SYN flood and DNS amplification surge hitting Securities & Brokerage gateway.",
        actionAr: "تدفق سيبراني ضخم وهجمات تضخيم DNS تستهدف بوابات التداول والوساطة المالية.",
        status: "TRIGGERED"
      },
      {
        time: "T+0.18s",
        agent: "Agent BGP-Shield (Autonomous Routing AI)",
        agentAr: "وكيل التوجيه الذاتي وحماية BGP",
        action: "Triggered dynamic Anycast scrubbing and deep packet inspection (DPI) via national TDRA scrubbing centers.",
        actionAr: "تفعيل التنقية التلقائية عبر Anycast والفحص العميق للحزم في مراكز التنقية الوطنية لهيئة TDRA.",
        status: "FILTERED"
      },
      {
        time: "T+0.62s",
        agent: "Agent AutoHealer-02 (Resilience Orchestrator)",
        agentAr: "الوكيل المعالج ذاتياً (AutoHealer-02)",
        action: "Absorbed 99.98% malicious packets. Financial transaction latency stabilized at 2.4ms.",
        actionAr: "امتصاص 99.98% من الحزم الخبيثة واستقرار زمن معالجة الصفقات المالية عند 2.4 ملي ثانية.",
        status: "STABILIZED"
      },
      {
        time: "T+1.10s",
        agent: "Agent Regulator-Link (SCA & Central Bank Sync)",
        agentAr: "وكيل التنسيق الرقابي (المصرف المركزي وهيئة الأوراق المالية)",
        action: "Automated cryptographic incident compliance filing submitted to SCA & CBUAE cyber command.",
        actionAr: "إيداع تقرير الامتثال المشفر تلقائياً لغرفة العمليات المشتركة بالمصرف المركزي وهيئة الأوراق المالية.",
        status: "RESOLVED"
      }
    ]
  },
  "mass_smishing": {
    title: "Nationwide Fake Parcel Delivery SMS Scam Campaign Deflected",
    titleAr: "إحباط حملة احتيال وطنية واسعة لرسائل شحنات الطرود الزائفة",
    targetSector: "telecom",
    severity: "MEDIUM (Level 3)",
    steps: [
      {
        time: "T+0.00s",
        agent: "Agent CitizenShield-01 (NLP Scam Intelligence)",
        agentAr: "وكيل حماية المواطن (CitizenShield-01)",
        action: "Crowdsourced reports and telecom honeypots flagged 1,200 SMS messages mimicking Emirates Post tracking numbers.",
        actionAr: "رصد 1200 رسالة احتيالية عبر مصائد الاتصالات وبلاغات المجتمع تنتحل أرقام تتبع بريد الإمارات.",
        status: "TRIGGERED"
      },
      {
        time: "T+0.32s",
        agent: "Agent DomainBlocker (TDRA Gateway Sync)",
        agentAr: "وكيل الحظر اللحظي (DomainBlocker)",
        action: "Domain epst-ae-track.biz classified as hostile typosquat. Injected into TDRA national DNS blocklist.",
        actionAr: "تصنيف النطاق epst-ae-track.biz كنطاق احتيالي خبيث وإدراجه فوراً في القائمة الوطنية الموحدة للحجب.",
        status: "BLOCKED"
      },
      {
        time: "T+0.75s",
        agent: "Agent PublicAlert (Proactive Citizen Awareness)",
        agentAr: "وكيل التوعية الاستباقية للجمهور",
        action: "Pushed bilingual advisory on AmanNation Citizen Radar. Zero resident credentials compromised.",
        actionAr: "إرسال تنبيه توعوي فوري ثنائي اللغة عبر درع أمان. صفر اختراقات لبيانات المواطنين والمقيمين.",
        status: "RESOLVED"
      }
    ]
  }
};

function getSectorTelemetry() {
  return SECTORS;
}

function simulateIncident(presetKey = "gov_ransomware") {
  const incident = INCIDENT_PRESETS[presetKey] || INCIDENT_PRESETS["gov_ransomware"];
  return {
    incidentId: `INC-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    presetKey,
    details: incident,
    resolutionTimeSeconds: 1.4,
    impact: {
      dataLoss: "0.00%",
      serviceAvailability: "100.0%",
      citizenTrustImpact: "PRESERVED_EXCELLENT"
    }
  };
}

module.exports = {
  getSectorTelemetry,
  simulateIncident,
  INCIDENT_PRESETS
};
