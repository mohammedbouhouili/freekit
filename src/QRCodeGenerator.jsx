
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import "./QRCodeGenerator.css";

const types = [
  { id: "url", name: "Website URL", icon: "🔗" },
  { id: "text", name: "Plain Text", icon: "📝" },
  { id: "wifi", name: "Wi-Fi", icon: "📶" },
];

function QRCodeGenerator({ onBack }) {
  const [type, setType] = useState("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [foreground, setForeground] = useState("#172820");
  const [background, setBackground] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const escapeWifi = (value) =>
    value.replace(/([\\;,:"'])/g, "\\$1");

  let qrContent = "";

  if (type === "url") {
    qrContent = url.trim();
    if (
      qrContent &&
      !/^[a-z][a-z0-9+.-]*:/i.test(qrContent)
    ) {
      qrContent = `https://${qrContent}`;
    }
  } else if (type === "text") {
    qrContent = text;
  } else if (ssid.trim()) {
    qrContent =
      `WIFI:T:${security};` +
      `S:${escapeWifi(ssid)};` +
      `P:${security === "nopass" ? "" : escapeWifi(password)};` +
      `H:${hidden ? "true" : "false"};;`;
  }

  useEffect(() => {
    let cancelled = false;

    if (!qrContent) {
      setQrUrl("");
      setError("");
      return;
    }

    QRCode.toDataURL(qrContent, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: foreground,
        light: background,
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrUrl(dataUrl);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrUrl("");
          setError("Could not generate QR code. Try shorter text.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [qrContent, size, foreground, background]);

  const downloadPNG = () => {
    if (!qrUrl) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "freekit-qr-code.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadSVG = async () => {
    if (!qrContent || !qrUrl) return;

    try {
      const svg = await QRCode.toString(qrContent, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: foreground,
          light: background,
        },
      });

      const blob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8",
      });

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = "freekit-qr-code.svg";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError("Could not download SVG.");
    }
  };

  const reset = () => {
    setUrl("");
    setText("");
    setSsid("");
    setPassword("");
    setSecurity("WPA");
    setHidden(false);
    setForeground("#172820");
    setBackground("#ffffff");
    setSize(512);
    setError("");
  };

  return (
    <main className="qr-page">
      <div className="qr-container">
        <button className="qr-back" onClick={() => onBack?.()}>
          ← Back to all tools
        </button>

        <header className="qr-header">
          <div className="qr-header-icon">▦</div>
          <span className="qr-eyebrow">FREE ONLINE TOOL</span>
          <h1>
            QR Code <span>Generator</span>
          </h1>
          <p>
            Create beautiful QR codes for websites, text and Wi-Fi.
            Customize your design and download instantly.
          </p>
          <div className="qr-trust">
            <span>✓ 100% Free</span>
            <span>✓ No registration</span>
            <span>✓ Instant download</span>
          </div>
        </header>

        <div className="qr-workspace">
          <section className="qr-card">
            <span className="qr-step">01 / QR CONTENT</span>
            <h2>What would you like to share?</h2>
            <p className="qr-muted">
              Select the type of QR code you want to create.
            </p>

            <div className="qr-types">
              {types.map((item) => (
                <button
                  key={item.id}
                  className={`qr-type ${type === item.id ? "active" : ""}`}
                  onClick={() => setType(item.id)}
                >
                  <span>{item.icon}</span>
                  <strong>{item.name}</strong>
                </button>
              ))}
            </div>

            <div className="qr-fields">
              {type === "url" && (
                <>
                  <label>WEBSITE URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <small>Enter the link you want people to open.</small>
                </>
              )}

              {type === "text" && (
                <>
                  <label>YOUR TEXT</label>
                  <textarea
                    placeholder="Enter any text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                  />
                  <small>{text.length} characters</small>
                </>
              )}

              {type === "wifi" && (
                <>
                  <label>NETWORK NAME (SSID)</label>
                  <input
                    placeholder="My Wi-Fi Network"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                  />

                  <label>SECURITY TYPE</label>
                  <select
                    value={security}
                    onChange={(e) => setSecurity(e.target.value)}
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No password</option>
                  </select>

                  {security !== "nopass" && (
                    <>
                      <label>WI-FI PASSWORD</label>
                      <input
                        type="text"
                        placeholder="Enter Wi-Fi password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </>
                  )}

                  <label className="qr-checkbox">
                    <input
                      type="checkbox"
                      checked={hidden}
                      onChange={(e) => setHidden(e.target.checked)}
                    />
                    Hidden network
                  </label>
                </>
              )}
            </div>

            <div className="qr-divider" />

            <span className="qr-step">02 / CUSTOMIZE</span>
            <h2>Customize your QR code</h2>
            <p className="qr-muted">
              Make it match your style.
            </p>

            <div className="qr-colors">
              <div>
                <label>QR COLOR</label>
                <div className="qr-color-input">
                  <input
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                  />
                  <span>{foreground.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label>BACKGROUND</label>
                <div className="qr-color-input">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                  />
                  <span>{background.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="qr-size">
              <label>IMAGE SIZE</label>
              <div className="qr-size-options">
                {[256, 512, 1024].map((value) => (
                  <button
                    key={value}
                    className={size === value ? "active" : ""}
                    onClick={() => setSize(value)}
                  >
                    {value} px
                  </button>
                ))}
              </div>
            </div>

            <button className="qr-reset" onClick={reset}>
              ↺ Reset settings
            </button>
          </section>

          <aside className="qr-card qr-preview-card">
            <div className="qr-preview-heading">
              <div>
                <span className="qr-step">03 / PREVIEW</span>
                <h2>Your QR code</h2>
                <p className="qr-muted">
                  Your QR code updates automatically.
                </p>
              </div>
              <span className="qr-live">● LIVE</span>
            </div>

            <div className="qr-preview">
              {qrUrl ? (
                <img src={qrUrl} alt="Generated QR code" />
              ) : (
                <div className="qr-placeholder">
                  <div className="qr-placeholder-icon">▦</div>
                  <strong>Your QR code will appear here</strong>
                  <span>Enter your content to get started.</span>
                </div>
              )}
            </div>

            {qrUrl && (
              <div className="qr-ready">
                <span>✓</span>
                <div>
                  <strong>QR code ready!</strong>
                  <small>Scan with your phone to test it.</small>
                </div>
              </div>
            )}

            {error && <div className="qr-error">{error}</div>}

            <div className="qr-downloads">
              <button
                className="qr-download-primary"
                onClick={downloadPNG}
                disabled={!qrUrl}
              >
                ↓ Download PNG
              </button>

              <button
                className="qr-download-secondary"
                onClick={downloadSVG}
                disabled={!qrUrl}
              >
                ↓ Download SVG
              </button>
            </div>

            <div className="qr-privacy">
              🔒 Generated directly in your browser.
            </div>
          </aside>
        </div>

        <footer className="qr-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default QRCodeGenerator;
