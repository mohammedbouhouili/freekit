
import { useMemo, useState } from "react";
import "./WordCounter.css";

function WordCounter({ onBack }) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const characters = Array.from(text).length;
    const charactersNoSpaces = Array.from(text.replace(/\s/g, "")).length;
    const sentences = trimmed
      ? (trimmed.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g) || [])
          .filter((s) => s.trim()).length
      : 0;
    const paragraphs = trimmed
      ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length
      : 0;

    const readingMinutes = words.length / 225;
    const speakingMinutes = words.length / 130;

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingMinutes,
      speakingMinutes,
      averageWordLength: words.length
        ? (charactersNoSpaces / words.length).toFixed(1)
        : "0.0",
    };
  }, [text]);

  const formatTime = (minutes) => {
    if (minutes === 0) return "0 sec";
    const seconds = Math.ceil(minutes * 60);
    if (seconds < 60) return `${seconds} sec`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs ? `${mins} min ${secs} sec` : `${mins} min`;
  };

  const copyText = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const cards = [
    { label: "Words", value: stats.words, icon: "📝", color: "green" },
    { label: "Characters", value: stats.characters, icon: "🔤", color: "blue" },
    { label: "Sentences", value: stats.sentences, icon: "✍️", color: "orange" },
    { label: "Paragraphs", value: stats.paragraphs, icon: "📄", color: "purple" },
  ];

  return (
    <main className="wc-page">
      <div className="wc-container">
        <button className="wc-back" onClick={() => onBack?.()}>
          ← Back to all tools
        </button>

        <header className="wc-header">
          <div className="wc-header-icon">📝</div>
          <span className="wc-eyebrow">FREE TEXT TOOL</span>
          <h1>
            Word <span>Counter</span>
          </h1>
          <p>
            Count words, characters, sentences and paragraphs instantly.
            A simple, accurate tool for everyday writing.
          </p>
          <div className="wc-trust">
            <span>✓ 100% Free</span>
            <span>✓ Real-time results</span>
            <span>✓ No registration</span>
          </div>
        </header>

        <div className="wc-stats">
          {cards.map((card) => (
            <div className="wc-stat-card" key={card.label}>
              <div className={`wc-stat-icon ${card.color}`}>
                {card.icon}
              </div>
              <span>{card.label}</span>
              <strong>{card.value.toLocaleString()}</strong>
              <div className="wc-stat-line" />
            </div>
          ))}
        </div>

        <div className="wc-workspace">
          <section className="wc-editor-card">
            <div className="wc-card-heading">
              <div>
                <span className="wc-step">01 / YOUR TEXT</span>
                <h2>Text editor</h2>
                <p>Start typing or paste your text below.</p>
              </div>
              <span className="wc-live">● LIVE COUNT</span>
            </div>

            <textarea
              className="wc-textarea"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setCopied(false);
              }}
              placeholder="Start typing or paste your text here...

Your word count and writing statistics will appear automatically as you type."
              spellCheck
            />

            <div className="wc-editor-footer">
              <div className="wc-editor-count">
                <span>{stats.words.toLocaleString()} words</span>
                <span>·</span>
                <span>{stats.characters.toLocaleString()} characters</span>
              </div>

              <div className="wc-actions">
                <button
                  className="wc-clear"
                  onClick={() => {
                    setText("");
                    setCopied(false);
                  }}
                  disabled={!text}
                >
                  ↺ Clear
                </button>
                <button
                  className="wc-copy"
                  onClick={copyText}
                  disabled={!text}
                >
                  {copied ? "✓ Copied!" : "▢ Copy Text"}
                </button>
              </div>
            </div>
          </section>

          <aside className="wc-analysis-card">
            <span className="wc-step">02 / TEXT ANALYSIS</span>
            <h2>Writing insights</h2>
            <p className="wc-description">
              A closer look at your text.
            </p>

            <div className="wc-insight">
              <div className="wc-insight-icon">◷</div>
              <div>
                <small>Reading time</small>
                <strong>{formatTime(stats.readingMinutes)}</strong>
              </div>
            </div>

            <div className="wc-insight">
              <div className="wc-insight-icon">🎙</div>
              <div>
                <small>Speaking time</small>
                <strong>{formatTime(stats.speakingMinutes)}</strong>
              </div>
            </div>

            <div className="wc-divider" />

            <div className="wc-detail">
              <span>Characters without spaces</span>
              <strong>{stats.charactersNoSpaces.toLocaleString()}</strong>
            </div>

            <div className="wc-detail">
              <span>Average word length</span>
              <strong>{stats.averageWordLength}</strong>
            </div>

            <div className="wc-detail">
              <span>Words per minute (reading)</span>
              <strong>225</strong>
            </div>

            <div className="wc-detail">
              <span>Words per minute (speaking)</span>
              <strong>130</strong>
            </div>

            <div className="wc-privacy">
              <span>🔒</span>
              <div>
                <strong>Your text stays private</strong>
                <p>
                  Everything is processed directly in your browser.
                  Nothing is uploaded to a server.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="wc-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default WordCounter;
