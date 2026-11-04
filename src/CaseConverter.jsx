
import { useMemo, useState } from "react";
import "./CaseConverter.css";

const caseOptions = [
  {
    id: "upper",
    name: "UPPERCASE",
    icon: "AA",
    description: "CONVERT ALL TEXT TO CAPITAL LETTERS",
  },
  {
    id: "lower",
    name: "lowercase",
    icon: "aa",
    description: "convert all text to small letters",
  },
  {
    id: "title",
    name: "Title Case",
    icon: "Aa",
    description: "Capitalize The First Letter Of Each Word",
  },
  {
    id: "sentence",
    name: "Sentence case",
    icon: "A.",
    description: "Capitalize the beginning of sentences.",
  },
  {
    id: "capitalize",
    name: "Capitalize Words",
    icon: "Ab",
    description: "Capitalize each word, keep other letters",
  },
  {
    id: "alternating",
    name: "aLtErNaTiNg CaSe",
    icon: "aA",
    description: "Alternate between lowercase and uppercase",
  },
  {
    id: "inverse",
    name: "iNVERSE cASE",
    icon: "↕",
    description: "Swap uppercase and lowercase letters",
  },
];

function convertCase(text, mode) {
  switch (mode) {
    case "upper":
      return text.toUpperCase();

    case "lower":
      return text.toLowerCase();

    case "title":
      return text.toLowerCase().replace(
        /(^|[^\p{L}\p{N}])(\p{L})/gu,
        (_, prefix, letter) => prefix + letter.toUpperCase()
      );

    case "sentence":
      return text
        .toLowerCase()
        .replace(
          /(^|[.!?。！？]\s*|\n\s*)(\p{L})/gu,
          (_, prefix, letter) => prefix + letter.toUpperCase()
        );

    case "capitalize":
      return text.replace(
        /(^|[^\p{L}\p{N}])(\p{L})/gu,
        (_, prefix, letter) => prefix + letter.toUpperCase()
      );

    case "alternating": {
      let index = 0;

      return Array.from(text)
        .map((character) => {
          if (!/\p{L}/u.test(character)) return character;

          const result =
            index % 2 === 0
              ? character.toLowerCase()
              : character.toUpperCase();

          index++;
          return result;
        })
        .join("");
    }

    case "inverse":
      return Array.from(text)
        .map((character) =>
          character === character.toUpperCase()
            ? character.toLowerCase()
            : character.toUpperCase()
        )
        .join("");

    default:
      return text;
  }
}

function CaseConverter({ onBack }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("upper");
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => convertCase(input, mode),
    [input, mode]
  );

  const stats = useMemo(() => {
    const trimmed = input.trim();

    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      characters: Array.from(input).length,
      lines: input ? input.split(/\r\n|\r|\n/).length : 0,
    };
  }, [input]);

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadOutput = () => {
    if (!output) return;

    const blob = new Blob([output], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "freekit-converted-text.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearAll = () => {
    setInput("");
    setCopied(false);
  };

  return (
    <main className="cc-page">
      <div className="cc-container">
        <button
          className="cc-back"
          onClick={() => onBack?.()}
        >
          ← Back to all tools
        </button>

        <header className="cc-header">
          <div className="cc-header-icon">Aa</div>

          <span className="cc-eyebrow">
            FREE TEXT TOOL
          </span>

          <h1>
            Case <span>Converter</span>
          </h1>

          <p>
            Transform your text into uppercase, lowercase,
            title case and more. Fast, simple and completely free.
          </p>

          <div className="cc-trust">
            <span>✓ 100% Free</span>
            <span>✓ Instant conversion</span>
            <span>✓ No registration</span>
          </div>
        </header>

        <div className="cc-workspace">
          <section className="cc-card">
            <div className="cc-card-heading">
              <div>
                <span className="cc-step">
                  01 / INPUT TEXT
                </span>

                <h2>Your text</h2>

                <p>
                  Type or paste the text you want to convert.
                </p>
              </div>

              <span className="cc-live">
                ● LIVE
              </span>
            </div>

            <textarea
              className="cc-textarea"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCopied(false);
              }}
              placeholder="Start typing or paste your text here..."
              spellCheck
            />

            <div className="cc-input-footer">
              <div className="cc-count">
                <span>{stats.words} words</span>
                <span>·</span>
                <span>{stats.characters} characters</span>
                <span>·</span>
                <span>{stats.lines} lines</span>
              </div>

              <button
                className="cc-clear"
                onClick={clearAll}
                disabled={!input}
              >
                ↺ Clear text
              </button>
            </div>
          </section>

          <section className="cc-card">
            <span className="cc-step">
              02 / CHOOSE CASE
            </span>

            <h2>Conversion style</h2>

            <p className="cc-description">
              Select how you want your text formatted.
            </p>

            <div className="cc-options">
              {caseOptions.map((option) => (
                <button
                  key={option.id}
                  className={`cc-option ${
                    mode === option.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setMode(option.id);
                    setCopied(false);
                  }}
                >
                  <span className="cc-option-icon">
                    {option.icon}
                  </span>

                  <span className="cc-option-text">
                    <strong>{option.name}</strong>
                    <small>{option.description}</small>
                  </span>

                  <span className="cc-radio" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="cc-card cc-output-card">
          <div className="cc-card-heading">
            <div>
              <span className="cc-step">
                03 / CONVERTED TEXT
              </span>

              <h2>Your result</h2>

              <p>
                Your converted text appears here automatically.
              </p>
            </div>

            <span className="cc-ready">
              ✓ INSTANT RESULT
            </span>
          </div>

          <textarea
            className="cc-output"
            value={output}
            readOnly
            placeholder="Your converted text will appear here..."
          />

          <div className="cc-output-footer">
            <div className="cc-count">
              {output.length.toLocaleString()} characters
            </div>

            <div className="cc-actions">
              <button
                className="cc-download"
                onClick={downloadOutput}
                disabled={!output}
              >
                ↓ Download TXT
              </button>

              <button
                className="cc-copy"
                onClick={copyOutput}
                disabled={!output}
              >
                {copied ? "✓ Copied!" : "▢ Copy Result"}
              </button>
            </div>
          </div>
        </section>

        <div className="cc-privacy">
          🔒 Your text stays private. Everything is processed
          directly in your browser.
        </div>

        <footer className="cc-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default CaseConverter;
