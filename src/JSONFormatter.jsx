
import { useMemo, useState } from "react";
import "./JSONFormatter.css";

const example = `{
  "name": "FreeKit",
  "version": 1,
  "free": true,
  "tools": ["PDF", "Images", "Text"],
  "settings": {
    "theme": "light",
    "language": "en"
  }
}`;

function JSONFormatter({ onBack }) {
  const [input, setInput] = useState(example);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => {
    if (!input.trim()) return { valid: false, empty: true };

    try {
      const data = JSON.parse(input);
      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }, [input]);

  const stats = useMemo(() => {
    const text = output || input;
    return {
      characters: text.length,
      lines: text ? text.split("\n").length : 0,
      size: new Blob([text]).size,
    };
  }, [input, output]);

  const processJSON = (action) => {
    setCopied(false);

    if (!input.trim()) {
      setStatus("error");
      setMessage("Please enter some JSON first.");
      setOutput("");
      return;
    }

    try {
      const data = JSON.parse(input);

      if (action === "format") {
        setOutput(JSON.stringify(data, null, indent));
        setMessage("JSON formatted successfully!");
      } else if (action === "minify") {
        setOutput(JSON.stringify(data));
        setMessage("JSON minified successfully!");
      } else {
        setOutput(JSON.stringify(data, null, indent));
        setMessage("Your JSON is valid!");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Could not copy. Please select the text manually.");
      setStatus("error");
    }
  };

  const downloadOutput = () => {
    if (!output) return;

    const blob = new Blob([output], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "freekit-formatted.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setMessage("");
    setStatus("ready");
    setCopied(false);
  };

  const loadExample = () => {
    setInput(example);
    setOutput("");
    setMessage("");
    setStatus("ready");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <main className="jf-page">
      <div className="jf-container">
        <button className="jf-back" onClick={() => onBack?.()}>
          ← Back to all tools
        </button>

        <header className="jf-header">
          <div className="jf-icon">{"{ }"}</div>
          <span className="jf-eyebrow">FREE DEVELOPER TOOL</span>
          <h1>JSON <span>Formatter</span></h1>
          <p>
            Format, validate and minify JSON data instantly.
            Clean, readable JSON in just one click.
          </p>
          <div className="jf-trust">
            <span>✓ 100% Free</span>
            <span>✓ Instant processing</span>
            <span>✓ Browser-based</span>
          </div>
        </header>

        <section className="jf-workspace">
          <div className="jf-panel">
            <div className="jf-panel-top">
              <div>
                <span className="jf-step">01 / INPUT</span>
                <h2>Input JSON</h2>
                <p>Paste your JSON data below.</p>
              </div>
              <button className="jf-small-btn" onClick={loadExample}>
                Load example
              </button>
            </div>

            <div className="jf-editor-header">
              <span><span className="jf-editor-dot" /> JSON INPUT</span>
              <span>{formatSize(new Blob([input]).size)}</span>
            </div>

            <textarea
              className="jf-editor"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOutput("");
                setStatus("ready");
                setMessage("");
              }}
              placeholder='{"message": "Paste JSON here"}'
              spellCheck={false}
              aria-label="JSON input"
            />

            <div className="jf-input-bottom">
              <span className={validation.valid ? "jf-valid" : "jf-invalid"}>
                {validation.empty
                  ? "○ Waiting for JSON"
                  : validation.valid
                  ? "✓ Valid JSON"
                  : "✕ Invalid JSON"}
              </span>
              <button onClick={clearAll}>Clear all</button>
            </div>
          </div>

          <div className="jf-panel">
            <div className="jf-panel-top">
              <div>
                <span className="jf-step">02 / OUTPUT</span>
                <h2>Formatted JSON</h2>
                <p>Your processed JSON will appear here.</p>
              </div>
              <span className="jf-output-tag">RESULT</span>
            </div>

            <div className="jf-editor-header">
              <span><span className="jf-editor-dot" /> JSON OUTPUT</span>
              <span>{formatSize(new Blob([output]).size)}</span>
            </div>

            <textarea
              className="jf-editor jf-output"
              value={output}
              readOnly
              placeholder="Your formatted JSON will appear here..."
              spellCheck={false}
              aria-label="JSON output"
            />

            <div className="jf-output-actions">
              <button disabled={!output} onClick={copyOutput}>
                {copied ? "✓ Copied!" : "▢ Copy"}
              </button>
              <button disabled={!output} onClick={downloadOutput}>
                ↓ Download JSON
              </button>
            </div>
          </div>
        </section>

        <section className="jf-controls">
          <div className="jf-controls-info">
            <span className="jf-step">03 / ACTIONS</span>
            <h2>Process your JSON</h2>
            <p>Choose an action to transform or validate your data.</p>
          </div>

          <div className="jf-controls-right">
            <label htmlFor="jf-indent">Indentation</label>
            <select
              id="jf-indent"
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={8}>8 Spaces</option>
            </select>

            <button className="jf-action jf-primary" onClick={() => processJSON("format")}>
              ✨ Format JSON
            </button>
            <button className="jf-action" onClick={() => processJSON("minify")}>
              Minify
            </button>
            <button className="jf-action" onClick={() => processJSON("validate")}>
              Validate
            </button>
          </div>
        </section>

        {status !== "ready" && (
          <div
            className={`jf-message ${status === "success" ? "success" : "error"}`}
            role="status"
          >
            <span>{status === "success" ? "✓" : "✕"}</span>
            <div>
              <strong>{status === "success" ? "Success" : "JSON Error"}</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        <section className="jf-stats">
          <div>
            <span>CHARACTERS</span>
            <strong>{stats.characters.toLocaleString()}</strong>
          </div>
          <div>
            <span>LINES</span>
            <strong>{stats.lines.toLocaleString()}</strong>
          </div>
          <div>
            <span>FILE SIZE</span>
            <strong>{formatSize(stats.size)}</strong>
          </div>
          <div>
            <span>VALIDATION</span>
            <strong className={validation.valid ? "jf-green" : ""}>
              {validation.valid ? "Valid" : "Invalid"}
            </strong>
          </div>
        </section>

        <div className="jf-privacy">
          🔒 Your JSON is processed locally in your browser. No data is uploaded.
        </div>

        <footer className="jf-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default JSONFormatter;
