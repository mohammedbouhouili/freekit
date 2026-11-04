
import { useMemo, useRef, useState } from "react";
import "./CSVToJSON.css";

const sampleCSV = `name,email,age,city
Sarah,sarah@example.com,28,London
James,james@example.com,34,New York
Emma,emma@example.com,25,Paris`;

function parseCSV(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;

  const source = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (afterQuote) {
      if (char === delimiter) {
        row.push(field);
        field = "";
        afterQuote = false;
      } else if (char === "\n" || char === "\r") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        afterQuote = false;
        if (char === "\r" && source[i + 1] === "\n") i++;
      } else if (char !== " " && char !== "\t") {
        throw new Error("Unexpected character after a closing quote.");
      }
      continue;
    }

    if (char === '"') {
      if (field === "") {
        inQuotes = true;
      } else {
        throw new Error("Unexpected quote inside an unquoted field.");
      }
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (char === "\r" && source[i + 1] === "\n") i++;
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    throw new Error("Unclosed quoted field in CSV data.");
  }

  if (field !== "" || row.length > 0 || afterQuote) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function uniqueHeaders(headers) {
  const used = new Set();

  return headers.map((header, index) => {
    const base = header.trim() || `column_${index + 1}`;
    let name = base;
    let suffix = 2;

    while (used.has(name)) {
      name = `${base}_${suffix++}`;
    }

    used.add(name);
    return name;
  });
}

function CSVToJSON({ onBack }) {
  const [csv, setCsv] = useState(sampleCSV);
  const [delimiter, setDelimiter] = useState(",");
  const [firstRowHeader, setFirstRowHeader] = useState(true);
  const [pretty, setPretty] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [converted, setConverted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  const parsed = useMemo(() => {
    try {
      if (!csv.trim()) return { rows: [], headers: [], error: "" };

      const rows = parseCSV(csv, delimiter);

      if (!rows.length) return { rows: [], headers: [], error: "" };

      const width = Math.max(...rows.map((r) => r.length));

      const headers = firstRowHeader
        ? uniqueHeaders(rows[0])
        : Array.from({ length: width }, (_, i) => `column_${i + 1}`);

      const dataRows = firstRowHeader ? rows.slice(1) : rows;

      if (dataRows.some((r) => r.length > headers.length)) {
        return {
          rows: [],
          headers: [],
          error: "Some rows contain more columns than the header row.",
        };
      }

      const objects = dataRows.map((row) =>
        Object.fromEntries(
          headers.map((header, i) => [header, row[i] ?? ""])
        )
      );

      return {
        rows: objects,
        headers,
        error: "",
      };
    } catch (err) {
      return {
        rows: [],
        headers: [],
        error: err.message,
      };
    }
  }, [csv, delimiter, firstRowHeader]);

  const resetResult = () => {
    setOutput("");
    setError("");
    setConverted(false);
    setCopied(false);
  };

  const convert = () => {
    setCopied(false);

    if (!csv.trim()) {
      setError("Please enter or upload CSV data first.");
      setConverted(false);
      setOutput("");
      return;
    }

    if (parsed.error) {
      setError(parsed.error);
      setConverted(false);
      setOutput("");
      return;
    }

    if (!parsed.headers.length) {
      setError("No CSV columns were found.");
      setConverted(false);
      setOutput("");
      return;
    }

    setOutput(JSON.stringify(parsed.rows, null, pretty ? 2 : 0));
    setConverted(true);
    setError("");
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError("Please upload a .csv or .txt file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose a file smaller than 10 MB.");
      return;
    }

    try {
      const text = await file.text();
      setCsv(text);
      setFileName(file.name);
      resetResult();
    } catch {
      setError("Could not read this file.");
    }
  };

  const copyJSON = async () => {
    if (!converted) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Please select the output manually.");
    }
  };

  const downloadJSON = () => {
    if (!converted) return;

    const blob = new Blob([output], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName
      ? fileName.replace(/\.(csv|txt)$/i, "") + ".json"
      : "freekit-converted.json";

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCsv("");
    setFileName("");
    resetResult();
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="cj-page">
      <div className="cj-container">
        <button className="cj-back" onClick={() => onBack?.()}>
          ← Back to all tools
        </button>

        <header className="cj-header">
          <div className="cj-header-icon">{"{ }"}</div>
          <span className="cj-eyebrow">FREE DEVELOPER TOOL</span>
          <h1>CSV to <span>JSON</span></h1>
          <p>
            Convert CSV files into clean, structured JSON in seconds.
            Upload a file or paste your data to get started.
          </p>
          <div className="cj-trust">
            <span>✓ 100% Free</span>
            <span>✓ Instant conversion</span>
            <span>✓ Private & secure</span>
          </div>
        </header>

        <div className="cj-workspace">
          <section className="cj-panel">
            <div className="cj-panel-heading">
              <div>
                <span className="cj-step">01 / SOURCE DATA</span>
                <h2>Input CSV</h2>
                <p>Upload a CSV file or paste your data.</p>
              </div>
              <button
                className="cj-secondary"
                onClick={() => {
                  setCsv(sampleCSV);
                  setFileName("");
                  resetResult();
                }}
              >
                Load example
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <button
              className="cj-upload"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <span className="cj-upload-icon">↑</span>
              <strong>
                {fileName || "Click to upload a CSV file"}
              </strong>
              <small>Supports .csv and .txt · Max 10 MB</small>
            </button>

            <div className="cj-editor-title">
              <span>● CSV INPUT</span>
              <span>{csv.length.toLocaleString()} characters</span>
            </div>

            <textarea
              className="cj-editor"
              value={csv}
              spellCheck={false}
              placeholder="name,email,city&#10;Sarah,sarah@example.com,London"
              onChange={(e) => {
                setCsv(e.target.value);
                setFileName("");
                resetResult();
              }}
              aria-label="CSV input"
            />

            <div className="cj-editor-bottom">
              <span>
                {parsed.error
                  ? "✕ Invalid CSV"
                  : csv.trim()
                  ? "✓ CSV ready"
                  : "○ Waiting for CSV"}
              </span>
              <button onClick={clearAll}>Clear all</button>
            </div>
          </section>

          <section className="cj-panel">
            <div className="cj-panel-heading">
              <div>
                <span className="cj-step">02 / CONVERTED DATA</span>
                <h2>JSON Output</h2>
                <p>Your converted JSON appears here.</p>
              </div>
              <span className="cj-result-tag">RESULT</span>
            </div>

            <div className="cj-output-stats">
              <div>
                <span>ROWS</span>
                <strong>{parsed.rows.length.toLocaleString()}</strong>
              </div>
              <div>
                <span>COLUMNS</span>
                <strong>{parsed.headers.length.toLocaleString()}</strong>
              </div>
              <div>
                <span>FORMAT</span>
                <strong>JSON</strong>
              </div>
            </div>

            <div className="cj-editor-title">
              <span>● JSON OUTPUT</span>
              <span>{output.length.toLocaleString()} characters</span>
            </div>

            <textarea
              className="cj-editor cj-output"
              value={output}
              readOnly
              spellCheck={false}
              placeholder="Your converted JSON will appear here..."
              aria-label="JSON output"
            />

            <div className="cj-output-actions">
              <button disabled={!converted} onClick={copyJSON}>
                {copied ? "✓ Copied!" : "▢ Copy JSON"}
              </button>
              <button disabled={!converted} onClick={downloadJSON}>
                ↓ Download JSON
              </button>
            </div>
          </section>
        </div>

        <section className="cj-settings">
          <div>
            <span className="cj-step">03 / CONVERSION SETTINGS</span>
            <h2>Customize your conversion</h2>
            <p>Choose how your CSV data should be processed.</p>
          </div>

          <div className="cj-settings-controls">
            <div className="cj-setting">
              <label htmlFor="cj-delimiter">DELIMITER</label>
              <select
                id="cj-delimiter"
                value={delimiter}
                onChange={(e) => {
                  setDelimiter(e.target.value);
                  resetResult();
                }}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value={"\t"}>Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <label className="cj-check">
              <input
                type="checkbox"
                checked={firstRowHeader}
                onChange={(e) => {
                  setFirstRowHeader(e.target.checked);
                  resetResult();
                }}
              />
              First row is header
            </label>

            <label className="cj-check">
              <input
                type="checkbox"
                checked={pretty}
                onChange={(e) => {
                  setPretty(e.target.checked);
                  resetResult();
                }}
              />
              Pretty print JSON
            </label>

            <button className="cj-convert" onClick={convert}>
              Convert to JSON →
            </button>
          </div>
        </section>

        {error && (
          <div className="cj-alert" role="alert">
            <strong>✕ Conversion error</strong>
            <p>{error}</p>
          </div>
        )}

        {converted && !error && (
          <div className="cj-success" role="status">
            ✓ Successfully converted {parsed.rows.length} rows to JSON!
          </div>
        )}

        <div className="cj-privacy">
          🔒 Your files are processed locally in your browser.
          Nothing is uploaded to a server.
        </div>

        <footer className="cj-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default CSVToJSON;
