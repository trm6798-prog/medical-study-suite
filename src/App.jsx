import { useState, useRef } from "react";

const TABS = [
  { id: "quiz", label: "Case & Quiz", icon: "🩺", desc: "Generate clinical vignettes & board-style MCQs", model: "claude-haiku-4-5-20251001", speed: "Fast" },
  { id: "notes", label: "Study Guide", icon: "📄", desc: "Turn raw notes into structured study guides", model: "claude-haiku-4-5-20251001", speed: "Fast" },
  { id: "ddx", label: "DDx Coach", icon: "🧠", desc: "Build your differential diagnosis step by step", model: "claude-haiku-4-5-20251001", speed: "Fast" },
  { id: "deep", label: "Deep Dive", icon: "🔬", desc: "Full clinical rundown on any condition — definition to board pearls", model: "claude-sonnet-4-20250514", speed: "Thorough" },
];

const SOURCES = {
  quiz: [
    { name: "First Aid for the USMLE Step 1, 2 & 3", type: "Board Review" },
    { name: "PANCE Prep Pearls (Dwayne Williams)", type: "Board Review" },
    { name: "Harrison's Principles of Internal Medicine", type: "Textbook" },
    { name: "NCCPA PANCE/PANRE Blueprint", type: "Exam Guide" },
    { name: "USMLE Rx & Amboss Question Banks", type: "Q-Bank" },
    { name: "UpToDate Clinical Topics", type: "Clinical Reference" },
  ],
  notes: [
    { name: "First Aid for the USMLE Step 1, 2 & 3", type: "Board Review" },
    { name: "PANCE Prep Pearls (Dwayne Williams)", type: "Board Review" },
    { name: "Robbins & Cotran Pathologic Basis of Disease", type: "Textbook" },
    { name: "Sketchy Medical (Micro, Pharm, Path)", type: "Visual Learning" },
    { name: "Pathoma (Fundamentals of Pathology)", type: "Textbook" },
    { name: "UpToDate Clinical Topics", type: "Clinical Reference" },
  ],
  ddx: [
    { name: "UpToDate Differential Diagnosis Topics", type: "Clinical Reference" },
    { name: "Symptom to Diagnosis (Stern et al.)", type: "Textbook" },
    { name: "Harrison's Principles of Internal Medicine", type: "Textbook" },
    { name: "PANCE Prep Pearls (Dwayne Williams)", type: "Board Review" },
    { name: "AAPA & AAP Clinical Practice Guidelines", type: "Guidelines" },
    { name: "Tintinalli's Emergency Medicine", type: "Textbook" },
  ],
  deep: [
    { name: "First Aid for the USMLE Step 1, 2 & 3", type: "Board Review" },
    { name: "PANCE Prep Pearls (Dwayne Williams)", type: "Board Review" },
    { name: "Harrison's Principles of Internal Medicine", type: "Textbook" },
    { name: "Robbins & Cotran Pathologic Basis of Disease", type: "Textbook" },
    { name: "UpToDate Clinical Topics", type: "Clinical Reference" },
    { name: "Pathoma (Fundamentals of Pathology)", type: "Textbook" },
    { name: "Current Medical Diagnosis & Treatment (CMDT)", type: "Textbook" },
  ],
};

const EXAMPLES = {
  quiz: [
    { label: "Shoulder Dystocia", value: "shoulder dystocia" },
    { label: "Septic Arthritis", value: "septic arthritis" },
    { label: "Pulmonary Embolism", value: "pulmonary embolism" },
    { label: "Appendicitis", value: "appendicitis" },
    { label: "Diabetic Ketoacidosis", value: "diabetic ketoacidosis" },
  ],
  notes: [
    { label: "PPH Notes", value: `Postpartum Hemorrhage (PPH)\n- Definition: blood loss >500mL vaginal delivery, >1000mL C-section\n- Most common cause: uterine atony (4 T's: Tone, Trauma, Tissue, Thrombin)\n- Uterine atony tx: uterine massage, oxytocin, methergine, misoprostol, carboprost\n- Risk factors: prolonged labor, macrosomia, polyhydramnios, grand multiparity\n- Can lead to Sheehan syndrome (pituitary ischemia/necrosis)\n- Management: bimanual compression, bakri balloon, surgical options` },
    { label: "Pancreatitis Notes", value: `Acute Pancreatitis\n- Causes: I GET SMASHED (Idiopathic, Gallstones, EtOH, Trauma, Steroids, Mumps, Autoimmune, Scorpion, Hyperlipidemia/Hypercalcemia, ERCP, Drugs)\n- Presentation: epigastric pain radiating to back, nausea/vomiting, elevated lipase\n- Diagnosis: lipase >3x upper limit of normal\n- Ranson criteria: predicts severity at admission and 48hrs\n- Complications: pseudocyst, abscess, ARDS, AKI\n- Management: NPO, aggressive IVF, pain control, treat underlying cause` },
    { label: "Heart Failure Notes", value: `Heart Failure\n- HFrEF (systolic): EF <40%, dilated ventricle, reduced contractility\n- HFpEF (diastolic): EF >50%, stiff ventricle, impaired relaxation\n- Symptoms: dyspnea on exertion, orthopnea, PND, peripheral edema\n- Signs: S3 gallop (systolic HF), JVD, crackles, displaced PMI\n- BNP elevated in both types; used for diagnosis and prognosis\n- Treatment HFrEF: ACE-I/ARB, beta-blocker, spironolactone, SGLT2i, loop diuretics\n- NYHA Classification: I (no sx) → IV (sx at rest)` },
  ],
  ddx: [
    { label: "Chest Pain + Dyspnea", value: "28-year-old male with sudden onset pleuritic chest pain, dyspnea, and tachycardia. Recently flew back from Europe. O2 sat 92% on room air." },
    { label: "Pediatric Joint + Fever", value: "6-year-old child with 2 days of fever, refusal to bear weight on the right leg, and a swollen, warm, erythematous right knee. WBC elevated." },
    { label: "RLQ Abdominal Pain", value: "19-year-old female with 24 hours of periumbilical pain migrating to the RLQ, anorexia, low-grade fever, and rebound tenderness at McBurney's point." },
    { label: "Altered Mental Status", value: "72-year-old male with acute onset confusion, fever of 38.9°C, urinary incontinence, and WBC of 14,000. Family reports he was normal yesterday." },
  ],
  deep: [
    { label: "Pulmonary Embolism", value: "pulmonary embolism" },
    { label: "Type 2 Diabetes", value: "type 2 diabetes mellitus" },
    { label: "Community-Acquired Pneumonia", value: "community-acquired pneumonia" },
    { label: "Atrial Fibrillation", value: "atrial fibrillation" },
    { label: "Crohn's Disease", value: "Crohn's disease" },
  ],
};

const SYSTEM_PROMPTS = {
  quiz: `You are an expert medical educator who creates high-yield board-style clinical cases for medical students, PA students, NP students, and other healthcare providers. When given a topic, generate:
1. A realistic clinical vignette (3-4 sentences: patient demographics, chief complaint, vitals, key findings)
2. A single best-answer multiple choice question with 5 options (A-E)
3. The correct answer with a detailed explanation (3-5 sentences covering teaching points)
4. 3 high-yield board pearls for this topic
Format with clear headers: **Clinical Vignette**, **Question**, **Options**, **Answer & Explanation**, **High-Yield Pearls**. Use markdown. Make it applicable to USMLE Steps 1-3, PANCE/PANRE, and NCLEX-style reasoning.`,
  notes: `You are an expert medical educator and master note-organizer for medical students, PA/NP students, and clinical providers. When given raw lecture notes or text, transform them into a beautifully organized study guide with:
1. A concise overview (2-3 sentences)
2. Key concepts organized under bold headers
3. Any relevant comparison tables (drug classes, classifications, distinguishing features)
4. Mnemonics or memory tricks where applicable
5. 3-5 board-relevant high-yield facts at the end, applicable across USMLE, PANCE, and NCLEX
Use markdown formatting with headers, bullets, and tables. Make it scannable and boards-focused for all health professions learners.`,
  ddx: `You are a clinical reasoning coach helping medical students, PA students, NP students, and early-career providers develop strong differential diagnosis skills. When given a clinical presentation, walk through:
1. **Initial Impression**: What's your gut feeling and why?
2. **Must-Not-Miss Diagnoses**: Life-threatening conditions to rule out first (with key distinguishing features)
3. **Most Likely Diagnoses**: Top 3-5 diagnoses with supporting and opposing features for each
4. **Key Workup**: Essential labs, imaging, or tests to narrow the differential
5. **Clinical Pearl**: One memorable teaching point about this presentation
Be educational, explain your reasoning, and teach the learner HOW to think through cases. Frame your teaching to be useful across medical school, PA school, NP programs, and residency.`,
  deep: `You are a comprehensive medical educator creating a complete clinical reference for health professions students and providers. When given a condition or disease, provide a thorough, well-organized deep dive covering ALL of the following sections:

## Overview
Brief definition and key context (2-3 sentences).

## Epidemiology
Who gets this? Prevalence, incidence, risk factors, demographics.

## Pathophysiology
Mechanistic explanation — what is actually happening at the cellular/organ level?

## Clinical Presentation
- Symptoms (subjective)
- Signs (objective / physical exam findings)
- Classic vs. atypical presentations

## Diagnosis
- Diagnostic criteria (if applicable)
- Key labs and expected findings
- Imaging and other studies
- Gold standard test

## Treatment
- First-line treatment
- Second-line / alternatives
- Pharmacologic details (drug class, mechanism where relevant)
- Non-pharmacologic management
- When to refer or hospitalize

## Complications
Key complications with brief mechanism or significance.

## Prognosis
Expected outcomes, factors affecting prognosis.

## High-Yield Board Pearls
5 must-know facts for USMLE, PANCE/PANRE, NCLEX, and COMLEX. Make these punchy and memorable.

Use markdown formatting throughout. Be thorough but focused.`,
};

const PLACEHOLDERS = {
  quiz: 'Enter a clinical topic (e.g., "shoulder dystocia", "septic arthritis")...',
  notes: "Paste your lecture notes, textbook excerpt, or study material here...",
  ddx: 'Describe the clinical presentation (e.g., "35F with pleuritic chest pain and tachycardia after a long flight")...',
  deep: 'Enter any condition (e.g., "atrial fibrillation", "Crohn\'s disease", "community-acquired pneumonia")...',
};

// Split raw text into sections based on ## or ** headers
function parseSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let current = { header: null, lines: [] };

  for (const line of lines) {
    const isHeader =
      line.startsWith("## ") ||
      line.startsWith("# ") ||
      (line.startsWith("**") && line.endsWith("**") && line.length > 4 && !line.includes(" ") === false);

    if (isHeader && current.lines.some(l => l.trim())) {
      sections.push({ ...current });
      current = { header: null, lines: [] };
    }
    current.lines.push(line);
  }
  if (current.lines.some(l => l.trim())) sections.push(current);
  return sections;
}

function MarkdownRenderer({ text }) {
  const parseBold = (t) => {
    const parts = t.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: "#1e3a5f" }}>{part}</strong> : part
    );
  };
  const renderLine = (line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} style={{ color: "#1e3a5f", fontSize: "1rem", fontWeight: 700, marginTop: "1.4rem", marginBottom: "0.3rem", fontFamily: "'Lora', Georgia, serif" }}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} style={{ color: "#1e3a5f", fontSize: "1.15rem", fontWeight: 700, marginTop: "1.6rem", marginBottom: "0.4rem", fontFamily: "'Lora', Georgia, serif", borderBottom: "1px solid #e2eaf6", paddingBottom: "0.3rem" }}>{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} style={{ color: "#1e3a5f", fontSize: "1.3rem", fontWeight: 700, marginTop: "1.8rem", marginBottom: "0.5rem", fontFamily: "'Lora', Georgia, serif" }}>{line.slice(2)}</h1>;
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) return <p key={i} style={{ fontWeight: 700, color: "#1e3a5f", margin: "0.8rem 0 0.2rem" }}>{line.slice(2, -2)}</p>;
    if (line.startsWith("- ") || line.startsWith("• ")) return <li key={i} style={{ marginLeft: "1.2rem", marginBottom: "0.3rem", color: "#374151", lineHeight: 1.6 }}>{parseBold(line.slice(2))}</li>;
    if (/^\d+\. /.test(line)) return <li key={i} style={{ marginLeft: "1.2rem", marginBottom: "0.3rem", color: "#374151", lineHeight: 1.6, listStyleType: "decimal" }}>{parseBold(line.replace(/^\d+\. /, ""))}</li>;
    if (line.trim() === "") return <div key={i} style={{ height: "0.4rem" }} />;
    return <p key={i} style={{ color: "#374151", lineHeight: 1.7, margin: "0.25rem 0" }}>{parseBold(line)}</p>;
  };
  return <div style={{ fontSize: "0.93rem" }}>{text.split("\n").map((line, i) => renderLine(line, i))}</div>;
}

// Renders completed sections with fade-in animation + a pulsing "loading next" indicator
function SectionReveal({ completedSections, isStreaming, pendingLabel }) {
  return (
    <div>
      {completedSections.map((section, idx) => (
        <div
          key={idx}
          style={{
            animation: "sectionIn 0.4s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0ms",
          }}
        >
          <MarkdownRenderer text={section.lines.join("\n")} />
        </div>
      ))}
      {isStreaming && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginTop: "1.25rem",
          padding: "0.75rem 1rem",
          background: "#f0f6ff",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
        }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#2d5fa6",
                animation: "dotBounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: "0.82rem", color: "#1e40af", fontWeight: 500 }}>
            {pendingLabel ? `Building: ${pendingLabel}` : "Generating next section..."}
          </span>
        </div>
      )}
    </div>
  );
}

export default function MedicalStudySuite() {
  const [activeTab, setActiveTab] = useState("quiz");
  const [inputs, setInputs] = useState({ quiz: "", notes: "", ddx: "", deep: "" });
  const [completedSections, setCompletedSections] = useState({ quiz: [], notes: [], ddx: [], deep: [] });
  const [fullText, setFullText] = useState({ quiz: "", notes: "", ddx: "", deep: "" });
  const [pendingLabel, setPendingLabel] = useState({ quiz: "", notes: "", ddx: "", deep: "" });
  const [loading, setLoading] = useState({ quiz: false, notes: false, ddx: false, deep: false });
  const [streaming, setStreaming] = useState({ quiz: false, notes: false, ddx: false, deep: false });
  const [done, setDone] = useState({ quiz: false, notes: false, ddx: false, deep: false });
  const [error, setError] = useState({ quiz: "", notes: "", ddx: "", deep: "" });
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);
  const abortRef = useRef(null);
  const bufferRef = useRef({ quiz: "", notes: "", ddx: "", deep: "" });

  // Extract the next-section header from raw buffered text (to show "Building: X")
  const extractPendingLabel = (raw) => {
    const match = raw.match(/(?:^|\n)(#{1,3} .+|(?<=\n)\*\*[^*]+\*\*)(?=\n|$)/);
    if (!match) return "";
    return match[1].replace(/^#+\s*/, "").replace(/\*\*/g, "");
  };

  const handleGenerate = async () => {
    const tab = activeTab;
    const input = inputs[tab].trim();
    if (!input) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    bufferRef.current[tab] = "";
    setLoading(prev => ({ ...prev, [tab]: true }));
    setStreaming(prev => ({ ...prev, [tab]: false }));
    setDone(prev => ({ ...prev, [tab]: false }));
    setError(prev => ({ ...prev, [tab]: "" }));
    setCompletedSections(prev => ({ ...prev, [tab]: [] }));
    setFullText(prev => ({ ...prev, [tab]: "" }));
    setPendingLabel(prev => ({ ...prev, [tab]: "" }));

    const tabConfig = TABS.find(t => t.id === tab);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: tabConfig.model,
          max_tokens: tab === "deep" ? 2000 : 1000,
          stream: true,
          system: SYSTEM_PROMPTS[tab],
          messages: [{ role: "user", content: input }],
        }),
      });

      if (!response.ok) throw new Error("API error");

      setLoading(prev => ({ ...prev, [tab]: false }));
      setStreaming(prev => ({ ...prev, [tab]: true }));
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              bufferRef.current[tab] += parsed.delta.text;
              const raw = bufferRef.current[tab];

              // Split into sections — only "commit" sections that are followed by another header
              const sectionBreaks = [];
              const headerRegex = /\n(?=#{1,3} |\*\*[^*\n]+\*\*\n)/g;
              let match;
              while ((match = headerRegex.exec(raw)) !== null) {
                sectionBreaks.push(match.index);
              }

              // All sections except the last (in-progress) one are "complete"
              if (sectionBreaks.length > 0) {
                const lastBreak = sectionBreaks[sectionBreaks.length - 1];
                const completedRaw = raw.slice(0, lastBreak);
                const inProgressRaw = raw.slice(lastBreak + 1);
                const sections = parseSections(completedRaw);

                setCompletedSections(prev => ({ ...prev, [tab]: sections }));
                setFullText(prev => ({ ...prev, [tab]: raw }));

                // Show what section is being built
                const label = extractPendingLabel(inProgressRaw);
                setPendingLabel(prev => ({ ...prev, [tab]: label }));
              }
            }
          } catch {}
        }
      }

      // Stream done — commit everything
      const finalRaw = bufferRef.current[tab];
      const allSections = parseSections(finalRaw);
      setCompletedSections(prev => ({ ...prev, [tab]: allSections }));
      setFullText(prev => ({ ...prev, [tab]: finalRaw }));
      setStreaming(prev => ({ ...prev, [tab]: false }));
      setDone(prev => ({ ...prev, [tab]: true }));

    } catch (err) {
      if (err.name !== "AbortError") {
        setError(prev => ({ ...prev, [tab]: "Connection error. Please try again." }));
        setLoading(prev => ({ ...prev, [tab]: false }));
        setStreaming(prev => ({ ...prev, [tab]: false }));
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (val) => {
    setInputs(prev => ({ ...prev, [activeTab]: val }));
    setCompletedSections(prev => ({ ...prev, [activeTab]: [] }));
    setFullText(prev => ({ ...prev, [activeTab]: "" }));
    setDone(prev => ({ ...prev, [activeTab]: false }));
  };

  const tab = activeTab;
  const tabConfig = TABS.find(t => t.id === tab);
  const isDeep = tab === "deep";
  const currentSections = completedSections[tab];
  const currentLoading = loading[tab];
  const currentStreaming = streaming[tab];
  const currentDone = done[tab];
  const currentError = error[tab];
  const hasContent = currentSections.length > 0;

  const accentLight = isDeep ? "#f0fdf4" : "#eff6ff";
  const accentBorder = isDeep ? "#bbf7d0" : "#bfdbfe";
  const accentText = isDeep ? "#166534" : "#1e40af";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f6ff 0%, #ffffff 50%, #e8f0fe 100%)", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #94a3b8; }
        .tab-btn:hover { background: #e8f0fe !important; }
        .generate-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .generate-btn, .tab-btn, .example-btn, .source-toggle { transition: all 0.2s ease; }
        .example-btn:hover { background: #dbeafe !important; border-color: #93c5fd !important; color: #1e3a5f !important; }
        .source-toggle:hover { background: #fef3c7 !important; }
        @keyframes sectionIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5fa6 100%)", padding: "2rem 2rem 1.5rem", textAlign: "center", boxShadow: "0 4px 24px rgba(30,58,95,0.2)" }}>
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#93c5fd", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: 500 }}>AI-Powered Study Suite</div>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", color: "#ffffff", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Medical Study Suite</h1>
        <p style={{ color: "#bfdbfe", fontSize: "0.9rem", marginTop: "0.5rem", fontWeight: 300 }}>For medical students · PA students · NP students · Residents & providers</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {["USMLE Step 1–3", "PANCE / PANRE", "NCLEX", "COMLEX"].map(badge => (
            <span key={badge} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#e0eaff", fontWeight: 500 }}>{badge}</span>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "0.75rem 1.5rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "1px" }}>⚠️</span>
        <div style={{ fontSize: "0.82rem", color: "#92400e", lineHeight: 1.5 }}>
          <strong>Educational use only.</strong> Content is AI-generated and intended as a study aid — not a clinical reference. Always verify with <strong>UpToDate</strong>, <strong>First Aid</strong>, <strong>PANCE Prep Pearls</strong>, or your program faculty before applying clinically.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", padding: "1.25rem 1rem", background: "#ffffff", borderBottom: "1px solid #e2eaf6", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => { setActiveTab(t.id); setShowSources(false); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: "10px", border: activeTab === t.id ? "2px solid #2d5fa6" : "2px solid transparent", background: activeTab === t.id ? "#e8f0fe" : "#f8fafc", color: activeTab === t.id ? "#1e3a5f" : "#64748b", fontWeight: activeTab === t.id ? 600 : 400, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span style={{ fontSize: "0.68rem", background: t.speed === "Fast" ? "#dcfce7" : "#ede9fe", color: t.speed === "Fast" ? "#15803d" : "#6d28d9", borderRadius: "4px", padding: "0.1rem 0.4rem", fontWeight: 600 }}>
              {t.speed === "Fast" ? "⚡ Fast" : "🔬 Deep"}
            </span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* Tab description */}
        <div style={{ background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem", color: accentText, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{tabConfig?.icon}</span>
          <span>{tabConfig?.desc}</span>
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap" }}>
            {isDeep ? "Claude Sonnet · comprehensive" : "Claude Haiku · optimized for speed"}
          </span>
        </div>

        {/* Deep Dive tags */}
        {isDeep && (
          <div className="fade-in" style={{ background: "#f8fffe", border: "1px solid #d1fae5", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#065f46", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>What you'll get</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {["Overview", "Epidemiology", "Pathophysiology", "Clinical Presentation", "Diagnosis", "Treatment", "Complications", "Prognosis", "Board Pearls"].map(s => (
                <span key={s} style={{ background: "#ffffff", border: "1px solid #a7f3d0", borderRadius: "6px", padding: "0.25rem 0.6rem", fontSize: "0.78rem", color: "#047857", fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Source toggle */}
        <div style={{ marginBottom: "1.25rem" }}>
          <button className="source-toggle" onClick={() => setShowSources(!showSources)} style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.5rem 1rem", fontSize: "0.82rem", color: "#854d0e", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            📚 {showSources ? "Hide" : "View"} knowledge sources for this tool
          </button>
          {showSources && (
            <div className="fade-in" style={{ marginTop: "0.6rem", background: "#fffdf0", border: "1px solid #fde68a", borderRadius: "10px", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: "0.82rem", color: "#78350f", margin: "0 0 0.75rem 0", lineHeight: 1.5 }}>This AI was trained on a broad corpus of medical literature. For this tab, content is most closely aligned with:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {SOURCES[tab].map((s, i) => (
                  <div key={i} style={{ background: "#ffffff", border: "1px solid #fcd34d", borderRadius: "8px", padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                    <span style={{ fontWeight: 600, color: "#92400e" }}>{s.name}</span>
                    <span style={{ color: "#a16207", marginLeft: "0.4rem" }}>· {s.type}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#a16207", margin: 0 }}>⚠️ The AI does not pull live data from these sources — it reflects patterns learned from similar material during training.</p>
            </div>
          )}
        </div>

        {/* Examples */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.5rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚡ Try an example</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {EXAMPLES[tab].map((ex, i) => (
              <button key={i} className="example-btn" onClick={() => loadExample(ex.value)} style={{ background: "#f0f6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "0.4rem 0.85rem", fontSize: "0.82rem", color: "#1e40af", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2eaf6", boxShadow: "0 2px 16px rgba(30,58,95,0.06)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <textarea value={inputs[tab]} onChange={e => setInputs(prev => ({ ...prev, [tab]: e.target.value }))} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }} placeholder={PLACEHOLDERS[tab]} rows={tab === "notes" ? 8 : 4} style={{ width: "100%", padding: "1.25rem", border: "none", resize: "vertical", fontSize: "0.93rem", lineHeight: 1.7, color: "#1e293b", fontFamily: "'DM Sans', sans-serif", background: "transparent", minHeight: tab === "notes" ? "180px" : "100px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderTop: "1px solid #f1f5f9", background: "#fafcff" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>⌘ + Enter to generate</span>
            <button className="generate-btn" onClick={handleGenerate} disabled={currentLoading || currentStreaming || !inputs[tab].trim()} style={{ background: isDeep ? "#065f46" : "#1e3a5f", color: "#ffffff", border: "none", borderRadius: "10px", padding: "0.65rem 1.75rem", fontSize: "0.93rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: `0 4px 12px rgba(${isDeep ? "6,95,70" : "30,58,95"},0.25)` }}>
              {currentLoading ? (
                <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Connecting...</>
              ) : currentStreaming ? (
                <><span style={{ display: "flex", gap: "3px", alignItems: "center" }}>{[0,1,2].map(i => <span key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff", animation: "dotBounce 1.2s ease-in-out infinite", animationDelay: `${i*0.2}s`, display: "inline-block" }} />)}</span> Generating...</>
              ) : (
                <>{isDeep ? "🔬 Deep Dive" : "✨ Generate"}</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {currentError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "0.85rem 1rem", color: "#dc2626", fontSize: "0.88rem", marginBottom: "1.25rem" }}>⚠️ {currentError}</div>}

        {/* Connecting spinner (no sections yet) */}
        {currentLoading && (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2eaf6", padding: "2.5rem", boxShadow: "0 2px 16px rgba(30,58,95,0.06)", textAlign: "center" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid #e2eaf6", borderTopColor: "#2d5fa6", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 1rem" }} />
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>Connecting to AI...</div>
          </div>
        )}

        {/* Section-by-section output */}
        {(hasContent || currentStreaming) && !currentLoading && (
          <div ref={outputRef} className="fade-in" style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2eaf6", boxShadow: "0 2px 16px rgba(30,58,95,0.06)", overflow: "hidden" }}>
            <div style={{ background: isDeep ? "linear-gradient(135deg, #065f46, #059669)" : "linear-gradient(135deg, #1e3a5f, #2d5fa6)", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {tabConfig?.icon} {isDeep ? "Full Clinical Deep Dive" : "Result"}
                {currentStreaming && (
                  <span style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.2)", borderRadius: "4px", padding: "0.1rem 0.5rem" }}>
                    {currentSections.length} section{currentSections.length !== 1 ? "s" : ""} ready
                  </span>
                )}
              </span>
              {currentDone && (
                <button onClick={handleCopy} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "6px", color: "#ffffff", fontSize: "0.78rem", padding: "0.3rem 0.75rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div style={{ padding: "1.5rem 1.5rem 1.25rem" }}>
              <SectionReveal
                completedSections={currentSections}
                isStreaming={currentStreaming}
                pendingLabel={pendingLabel[tab]}
              />
            </div>
            {currentDone && (
              <div style={{ background: "#fffbeb", borderTop: "1px solid #fde68a", padding: "0.65rem 1.25rem", fontSize: "0.78rem", color: "#92400e", display: "flex", gap: "0.4rem", alignItems: "flex-start" }}>
                <span>📚</span>
                <span>Cross-reference with <strong>UpToDate</strong>, <strong>First Aid</strong>, <strong>PANCE Prep Pearls</strong>, or program faculty before applying clinically.</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasContent && !currentLoading && !currentStreaming && !currentError && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{tabConfig?.icon}</div>
            <div style={{ fontSize: "1rem", fontWeight: 500, color: "#64748b", marginBottom: "0.4rem" }}>Ready when you are</div>
            <div style={{ fontSize: "0.85rem" }}>Pick an example above or type your own {isDeep ? "condition" : "topic"}</div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.8rem", borderTop: "1px solid #e2eaf6", marginTop: "2rem" }}>
        Medical Study Suite · AI-generated content for educational use only · Not a substitute for clinical judgment
      </div>
    </div>
  );
}
