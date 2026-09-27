import { useState } from "react";
import {
  Beaker,
  Bell,
  ChevronDown,
  FileText,
  Upload,
  Sparkles,
  Send,
  RotateCcw,
  Save,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";

import "./index.css";

function App() {
  const [form, setForm] = useState({
    site: "",
    date: "",
    title: "",
    source: "",
    product: "",
    batch: "",
    description: "",
    impact: "",
    severity: "",
  });

  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [fileName, setFileName] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const processDeviation = () => {
    if (!message.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: message,
      },
    ]);

    setProcessing(true);

    setTimeout(() => {
      const extractedData = {
        site: "API Manufacturing Unit",
        date: "27-09-2026",
        title: "Reactor temperature exceeded approved range",
        source: "Manufacturing",
        product: "Metformin API",
        batch: "MET-260925-01",
        description:
          "During manufacturing of Metformin API batch MET-260925-01, the reactor temperature exceeded the approved range of 75°C and reached 82°C for approximately 12 minutes. The deviation was detected by the production operator during routine monitoring.",
        impact: "High",
        severity: "Major",
      };

      setForm(extractedData);

      setChatMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Deviation parsed successfully. I extracted the product, batch, source, event details and generated an initial impact and severity recommendation.",
        },
      ]);

      setProcessing(false);
      setProcessed(true);
      setMessage("");
    }, 2200);
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    setChatMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: `Uploaded document: ${file.name}`,
      },
    ]);

    setProcessing(true);

    setTimeout(() => {
      setForm({
        site: "API Manufacturing Unit",
        date: "27-09-2026",
        title: "Reactor temperature exceeded approved range",
        source: "Manufacturing",
        product: "Metformin API",
        batch: "MET-260925-01",
        description:
          "During manufacturing of Metformin API batch MET-260925-01, the reactor temperature exceeded the approved range of 75°C and reached 82°C for approximately 12 minutes. The deviation was detected by the production operator during routine monitoring.",
        impact: "High",
        severity: "Major",
      });

      setChatMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Document processed successfully. I extracted the deviation information and generated an initial risk assessment.",
        },
      ]);

      setProcessing(false);
      setProcessed(true);
    }, 2500);
  };

  const sendChat = () => {
    if (!message.trim()) return;

    const text = message.trim();

    setChatMessages((prev) => [
      ...prev,
      {
        type: "user",
        text,
      },
    ]);

    setMessage("");

    setTimeout(() => {
      const lower = text.toLowerCase();

      if (lower.includes("critical")) {
        updateField("severity", "Critical");

        setChatMessages((prev) => [
          ...prev,
          {
            type: "ai",
            text: "Updated the initial severity recommendation to Critical.",
          },
        ]);

        return;
      }

      if (lower.includes("major")) {
        updateField("severity", "Major");

        setChatMessages((prev) => [
          ...prev,
          {
            type: "ai",
            text: "Updated the severity to Major.",
          },
        ]);

        return;
      }

      if (lower.includes("high impact")) {
        updateField("impact", "High");

        setChatMessages((prev) => [
          ...prev,
          {
            type: "ai",
            text: "Updated the initial impact to High.",
          },
        ]);

        return;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "I can update deviation fields such as batch number, product, impact, severity and description.",
        },
      ]);
    }, 600);
  };

  const resetForm = () => {
    setForm({
      site: "",
      date: "",
      title: "",
      source: "",
      product: "",
      batch: "",
      description: "",
      impact: "",
      severity: "",
    });

    setChatMessages([]);
    setProcessed(false);
    setFileName("");
    setMessage("");
  };

  const saveDeviation = () => {
    alert("Deviation saved successfully.");
  };

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">
            <Beaker size={20} />
          </div>

          <div>
            <div className="brand-name">AIVOA</div>
            <div className="brand-subtitle">
              QUALITY MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        <nav className="navigation">
          <span>QMS</span>
          <span>Dashboard</span>
          <span className="active">Deviations</span>
          <span>CAPAs</span>
          <span>Change Control</span>
          <span>Audits</span>
          <span>Documents</span>
          <span>Reports</span>
        </nav>

        <div className="header-right">

          <button className="site-selector">
            <span>API Manufacturing Unit</span>
            <ChevronDown size={15} />
          </button>

          <Bell size={18} className="bell" />

          <div className="avatar">DK</div>

          <span className="username">Debasis Kumar</span>

          <ChevronDown size={15} />

        </div>

      </header>

      {/* ================= PAGE HEADER ================= */}

      <section className="page-header">

        <div>
          <div className="breadcrumb">
            Quality event intake&nbsp; / &nbsp;New record
          </div>

          <h1>Log deviation</h1>

          <p>
            Record an unexpected event, out-of-specification result
            or non-conformance.
          </p>
        </div>

        <div className="draft-badge">
          <span></span>
          Draft
        </div>

      </section>

      {/* ================= MAIN CONTENT ================= */}

      <main className="workspace">

        {/* ================= LEFT FORM ================= */}

        <section className="form-panel">

          <div className="section-top">

            <div>
              <div className="eyebrow">
                STRUCTURED OUTPUT
              </div>

              <h2>Deviation record</h2>
            </div>

            <span className="required-note">
              Required fields marked *
            </span>

          </div>

          {/* SECTION 01 */}

          <div className="form-section">

            <div className="section-heading">
              <span>SECTION 01</span>
              <h3>Deviation information</h3>
            </div>

            <div className="form-grid">

              <Field
                label="Site / Plant"
                required
                ai={processed}
              >
                <select
                  value={form.site}
                  onChange={(e) =>
                    updateField("site", e.target.value)
                  }
                >
                  <option value="">Select site</option>
                  <option value="API Manufacturing Unit">
                    API Manufacturing Unit
                  </option>
                  <option value="Finished Dosage Unit">
                    Finished Dosage Unit
                  </option>
                  <option value="R&D Facility">
                    R&D Facility
                  </option>
                </select>
              </Field>

              <Field
                label="Date of occurrence"
                required
                ai={processed}
              >
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={form.date}
                  onChange={(e) =>
                    updateField("date", e.target.value)
                  }
                />
              </Field>

              <div className="full-field">

                <Field
                  label="Title / short description"
                  required
                  ai={processed}
                >
                  <input
                    type="text"
                    placeholder="e.g. OOS result for Assay"
                    value={form.title}
                    onChange={(e) =>
                      updateField("title", e.target.value)
                    }
                  />
                </Field>

              </div>

              <Field
                label="Source"
                required
                ai={processed}
              >
                <select
                  value={form.source}
                  onChange={(e) =>
                    updateField("source", e.target.value)
                  }
                >
                  <option value="">Select source</option>
                  <option value="Manufacturing">
                    Manufacturing
                  </option>
                  <option value="Quality Control">
                    Quality Control
                  </option>
                  <option value="Quality Assurance">
                    Quality Assurance
                  </option>
                  <option value="Warehouse">
                    Warehouse
                  </option>
                </select>
              </Field>

              <Field
                label="Related product / material"
                ai={processed}
              >
                <input
                  type="text"
                  placeholder="Search product or material..."
                  value={form.product}
                  onChange={(e) =>
                    updateField("product", e.target.value)
                  }
                />
              </Field>

              <Field
                label="Batch / lot number"
                ai={processed}
              >
                <input
                  type="text"
                  placeholder="Enter batch / lot number"
                  value={form.batch}
                  onChange={(e) =>
                    updateField("batch", e.target.value)
                  }
                />
              </Field>

            </div>

          </div>

          {/* SECTION 02 */}

          <div className="form-section">

            <div className="section-heading">
              <span>SECTION 02</span>
              <h3>Deviation details</h3>
            </div>

            <Field
              label="Detailed description"
              required
              ai={processed}
            >

              <textarea
                maxLength={2000}
                placeholder="Describe what happened, where, when and how it was detected..."
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
              />

              <div className="character-count">
                {form.description.length} / 2000
              </div>

            </Field>

          </div>

          {/* SECTION 03 */}

          <div className="form-section">

            <div className="section-heading">
              <span>SECTION 03</span>
              <h3>Impact & severity</h3>
            </div>

            <div className="form-grid">

              <Field
                label="Initial impact"
                required
                ai={processed}
              >

                <select
                  value={form.impact}
                  onChange={(e) =>
                    updateField("impact", e.target.value)
                  }
                >
                  <option value="">Select impact</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>

              </Field>

              <Field
                label="Initial severity"
                required
                ai={processed}
              >

                <select
                  value={form.severity}
                  onChange={(e) =>
                    updateField("severity", e.target.value)
                  }
                >
                  <option value="">Select severity</option>
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>

              </Field>

            </div>

          </div>

          {/* AI RISK CARD */}

          {processed && (
            <div className="risk-card">

              <div className="risk-header">

                <div className="risk-icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h3>AI Risk Assessment</h3>
                  <p>
                    Initial recommendation generated from the
                    deviation details.
                  </p>
                </div>

                <span className="confidence">
                  87% confidence
                </span>

              </div>

              <div className="risk-grid">

                <div>
                  <label>Impact</label>
                  <strong className="high">
                    {form.impact || "High"}
                  </strong>
                </div>

                <div>
                  <label>Severity</label>
                  <strong className="major">
                    {form.severity || "Major"}
                  </strong>
                </div>

              </div>

              <div className="risk-reason">

                <label>Reason</label>

                <p>
                  The reactor temperature exceeded the approved
                  process range and may affect product quality.
                  QA investigation is recommended.
                </p>

              </div>

              <button
                className="accept-button"
                onClick={() => {
                  updateField("impact", "High");
                  updateField("severity", "Major");
                }}
              >
                <CheckCircle2 size={16} />
                Accept recommendation
              </button>

            </div>
          )}

          {/* FOOTER */}

          <div className="form-footer">

            <span>
              AI-generated fields remain editable.
            </span>

            <div className="footer-buttons">

              <button
                className="reset-button"
                onClick={resetForm}
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <button
                className="save-button"
                onClick={saveDeviation}
              >
                <Save size={16} />
                Save deviation
              </button>

            </div>

          </div>

        </section>

        {/* ================= AI PANEL ================= */}

        <aside className="ai-panel">

          {/* AI HEADER */}

          <div className="ai-header">

            <div className="ai-title-row">

              <div className="ai-logo">
                <Sparkles size={20} />
              </div>

              <div>
                <div className="ai-title">
                  AI Deviation Assistant

                  <span className="beta">
                    BETA
                  </span>
                </div>

                <div className="online">
                  <span></span>
                  Online
                </div>
              </div>

            </div>

            <p>
              Upload a deviation report or paste details.
              I'll extract the information and assist with
              impact and severity.
            </p>

          </div>

          {/* AI CONTENT */}

          <div className="ai-content">

            {!processed && !processing && (
              <>
                <div className="source-title">
                  Start with a source document
                </div>

                <label className="upload-box">

                  <div className="upload-icon">
                    <Upload size={21} />
                  </div>

                  <strong>
                    Drag & drop supporting document here
                  </strong>

                  <span>
                    or click to browse
                  </span>

                  <small>
                    PDF, DOCX, TXT, XLS, XLSX, JPG, PNG · Max 10MB
                  </small>

                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFile}
                  />

                </label>

                <div className="supported">
                  <FileText size={15} />
                  Supported formats: PDF, DOCX, TXT, XLS, XLSX,
                  JPG, PNG
                </div>

                <div className="or">
                  OR
                </div>

                <div className="ready-message">
                  Ready for a new deviation. Paste the event
                  details or upload a document.
                </div>
              </>
            )}

            {processing && (
              <div className="processing-card">

                <div className="processing-icon">
                  <Loader2 size={26} className="spin" />
                </div>

                <h3>
                  Analyzing deviation...
                </h3>

                <p>
                  Extracting information and assessing
                  impact and severity.
                </p>

                <div className="progress">
                  <div></div>
                </div>

                <div className="processing-steps">
                  <span>✓ Reading input</span>
                  <span>● Extracting fields</span>
                  <span>○ Assessing risk</span>
                </div>

              </div>
            )}

            {processed && (
              <div className="extraction-result">

                <div className="success-heading">
                  <CheckCircle2 size={18} />
                  Deviation extracted
                </div>

                <p>
                  AI identified the following information:
                </p>

                <div className="extracted-grid">

                  <div>
                    <span>Product</span>
                    <strong>{form.product}</strong>
                  </div>

                  <div>
                    <span>Batch</span>
                    <strong>{form.batch}</strong>
                  </div>

                  <div>
                    <span>Source</span>
                    <strong>{form.source}</strong>
                  </div>

                  <div>
                    <span>Severity</span>
                    <strong>{form.severity}</strong>
                  </div>

                </div>

              </div>
            )}

            {/* CHAT */}

            <div className="chat-area">

              {chatMessages.map((chat, index) => (
                <div
                  key={index}
                  className={
                    chat.type === "user"
                      ? "chat-message user-message"
                      : "chat-message ai-message"
                  }
                >
                  {chat.type === "ai" && (
                    <div className="chat-ai-icon">
                      <Sparkles size={14} />
                    </div>
                  )}

                  <div>
                    {chat.text}
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* CHAT INPUT */}

          <div className="chat-footer">

            <div className="chat-input">

              <input
                type="text"
                placeholder="Ask anything about this deviation..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!processed) {
                      processDeviation();
                    } else {
                      sendChat();
                    }
                  }
                }}
              />

              {message && (
                <button
                  className="clear-input"
                  onClick={() => setMessage("")}
                >
                  <X size={15} />
                </button>
              )}

              <button
                className="send-button"
                onClick={() => {
                  if (!processed) {
                    processDeviation();
                  } else {
                    sendChat();
                  }
                }}
              >
                <Send size={17} />
              </button>

            </div>

            <div className="chat-hint">
              Try: "Change severity to Critical"
            </div>

            <div className="powered">
              ✨ POWERED BY LANGGRAPH
            </div>

            <div className="disclaimer">
              AI responses may contain errors. Please verify
              information before finalizing your deviation.
            </div>

          </div>

        </aside>

      </main>

    </div>
  );
}


/* ================= FIELD COMPONENT ================= */

function Field({
  label,
  required,
  ai,
  children,
}) {
  return (
    <div className="field">

      <label>

        {label}

        {required && (
          <span className="required">
            *
          </span>
        )}

        {ai && (
          <span className="ai-badge">
            ✨ AI
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

export default App;