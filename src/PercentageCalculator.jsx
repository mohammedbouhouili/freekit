
import { useMemo, useState } from "react";
import "./PercentageCalculator.css";

const modes = [
  { id: "basic", icon: "%", title: "Basic Percentage", desc: "Find a percentage of a number" },
  { id: "what", icon: "÷", title: "What Percentage?", desc: "Find what percent one number is of another" },
  { id: "change", icon: "↗", title: "Percentage Change", desc: "Calculate increase or decrease" },
  { id: "adjust", icon: "±", title: "Increase / Decrease", desc: "Add or subtract a percentage" },
];

function formatNumber(number) {
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(number);
}

function PercentageCalculator({ onBack }) {
  const [mode, setMode] = useState("basic");
  const [first, setFirst] = useState("20");
  const [second, setSecond] = useState("500");
  const [adjustment, setAdjustment] = useState("increase");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (first.trim() === "" || second.trim() === "") return null;

    const a = Number(first);
    const b = Number(second);

    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

    if (mode === "basic") {
      const value = (a / 100) * b;
      return {
        value,
        suffix: "",
        label: `${formatNumber(a)}% of ${formatNumber(b)}`,
        formula: `(${formatNumber(a)} ÷ 100) × ${formatNumber(b)}`,
        detail: `${formatNumber(a)}% of ${formatNumber(b)} is ${formatNumber(value)}`,
      };
    }

    if (mode === "what") {
      if (b === 0) return { error: "The total cannot be zero." };
      const value = (a / b) * 100;
      return {
        value,
        suffix: "%",
        label: `${formatNumber(a)} out of ${formatNumber(b)}`,
        formula: `(${formatNumber(a)} ÷ ${formatNumber(b)}) × 100`,
        detail: `${formatNumber(a)} is ${formatNumber(value)}% of ${formatNumber(b)}`,
      };
    }

    if (mode === "change") {
      if (a === 0) return { error: "The original value cannot be zero." };
      const value = ((b - a) / Math.abs(a)) * 100;
      return {
        value,
        suffix: "%",
        label: value > 0 ? "Percentage increase" : value < 0 ? "Percentage decrease" : "No change",
        formula: `((${formatNumber(b)} − ${formatNumber(a)}) ÷ |${formatNumber(a)}|) × 100`,
        detail: `Difference: ${formatNumber(b - a)}`,
        change: true,
      };
    }

    const difference = (a * b) / 100;
    const value = adjustment === "increase" ? a + difference : a - difference;

    return {
      value,
      suffix: "",
      label: `${adjustment === "increase" ? "Increased" : "Decreased"} by ${formatNumber(b)}%`,
      formula: `${formatNumber(a)} ${adjustment === "increase" ? "+" : "−"} (${formatNumber(a)} × ${formatNumber(b)} ÷ 100)`,
      detail: `Adjustment amount: ${formatNumber(difference)}`,
    };
  }, [first, second, mode, adjustment]);

  const selectMode = (id) => {
    setMode(id);
    setCopied(false);
    if (id === "basic") {
      setFirst("20");
      setSecond("500");
    } else if (id === "what") {
      setFirst("50");
      setSecond("200");
    } else if (id === "change") {
      setFirst("100");
      setSecond("125");
    } else {
      setFirst("500");
      setSecond("15");
    }
  };

  const copyResult = async () => {
    if (!result || result.error) return;
    try {
      await navigator.clipboard.writeText(`${formatNumber(result.value)}${result.suffix}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const firstLabel =
    mode === "basic" ? "PERCENTAGE (%)" :
    mode === "what" ? "PART VALUE" :
    mode === "change" ? "ORIGINAL VALUE" : "ORIGINAL AMOUNT";

  const secondLabel =
    mode === "basic" ? "TOTAL VALUE" :
    mode === "what" ? "TOTAL VALUE" :
    mode === "change" ? "NEW VALUE" : "PERCENTAGE (%)";

  return (
    <main className="pc-page">
      <div className="pc-container">
        <button className="pc-back" onClick={() => onBack?.()}>
          ← Back to all tools
        </button>

        <header className="pc-header">
          <div className="pc-header-icon">%</div>
          <span className="pc-eyebrow">FREE ONLINE CALCULATOR</span>
          <h1>Percentage <span>Calculator</span></h1>
          <p>
            Calculate percentages, changes, increases and decreases
            instantly. Simple, accurate and completely free.
          </p>
          <div className="pc-trust">
            <span>✓ 100% Free</span>
            <span>✓ Instant results</span>
            <span>✓ No registration</span>
          </div>
        </header>

        <div className="pc-workspace">
          <section className="pc-card">
            <span className="pc-step">01 / CALCULATION TYPE</span>
            <h2>Choose your calculation</h2>
            <p className="pc-muted">Select what you'd like to calculate.</p>

            <div className="pc-modes">
              {modes.map((item) => (
                <button
                  key={item.id}
                  className={`pc-mode ${mode === item.id ? "active" : ""}`}
                  onClick={() => selectMode(item.id)}
                >
                  <span className="pc-mode-icon">{item.icon}</span>
                  <span className="pc-mode-info">
                    <strong>{item.title}</strong>
                    <small>{item.desc}</small>
                  </span>
                  <span className="pc-radio" />
                </button>
              ))}
            </div>

            <div className="pc-divider" />

            <span className="pc-step">02 / ENTER VALUES</span>
            <h2>Enter your numbers</h2>
            <p className="pc-muted">Results update automatically as you type.</p>

            {mode === "adjust" && (
              <div className="pc-adjust-switch">
                <button
                  className={adjustment === "increase" ? "active" : ""}
                  onClick={() => setAdjustment("increase")}
                >
                  ↗ Increase
                </button>
                <button
                  className={adjustment === "decrease" ? "active" : ""}
                  onClick={() => setAdjustment("decrease")}
                >
                  ↘ Decrease
                </button>
              </div>
            )}

            <div className="pc-inputs">
              <div className="pc-field">
                <label htmlFor="pc-first">{firstLabel}</label>
                <input
                  id="pc-first"
                  type="number"
                  step="any"
                  value={first}
                  onChange={(e) => {
                    setFirst(e.target.value);
                    setCopied(false);
                  }}
                  placeholder="Enter value"
                />
              </div>

              <div className="pc-field">
                <label htmlFor="pc-second">{secondLabel}</label>
                <input
                  id="pc-second"
                  type="number"
                  step="any"
                  value={second}
                  onChange={(e) => {
                    setSecond(e.target.value);
                    setCopied(false);
                  }}
                  placeholder="Enter value"
                />
              </div>
            </div>

            <button
              className="pc-reset"
              onClick={() => selectMode(mode)}
            >
              ↺ Reset calculation
            </button>
          </section>

          <aside className="pc-card pc-result-card">
            <div className="pc-result-heading">
              <div>
                <span className="pc-step">03 / YOUR RESULT</span>
                <h2>Calculation result</h2>
                <p className="pc-muted">Your answer, calculated instantly.</p>
              </div>
              <span className="pc-live">● LIVE</span>
            </div>

            <div className="pc-result-display">
              {result && !result.error ? (
                <>
                  <span className="pc-result-label">{result.label}</span>
                  <strong className="pc-result-number">
                    {result.change && result.value > 0 ? "+" : ""}
                    {formatNumber(result.value)}{result.suffix}
                  </strong>
                  <span className="pc-result-check">✓ Calculation complete</span>
                </>
              ) : (
                <>
                  <span className="pc-result-placeholder">%</span>
                  <strong>{result?.error || "Enter values to calculate"}</strong>
                </>
              )}
            </div>

            {result && !result.error && (
              <div className="pc-breakdown">
                <span className="pc-step">CALCULATION BREAKDOWN</span>

                <div className="pc-breakdown-row">
                  <span>Formula</span>
                  <strong>{result.formula}</strong>
                </div>

                <div className="pc-breakdown-row">
                  <span>Explanation</span>
                  <strong>{result.detail}</strong>
                </div>
              </div>
            )}

            <button
              className="pc-copy"
              onClick={copyResult}
              disabled={!result || !!result.error}
            >
              {copied ? "✓ Copied!" : "▢ Copy Result"}
            </button>

            <div className="pc-privacy">
              🔒 All calculations happen directly in your browser.
            </div>
          </aside>
        </div>

        <footer className="pc-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default PercentageCalculator;
