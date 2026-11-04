
import { useEffect, useRef, useState } from "react";
import "./ImageResizer.css";

const presets = [
  { name: "Instagram Post", size: "1080 × 1080", w: 1080, h: 1080, shape: "square" },
  { name: "Story / Reel", size: "1080 × 1920", w: 1080, h: 1920, shape: "portrait" },
  { name: "YouTube HD", size: "1280 × 720", w: 1280, h: 720, shape: "landscape" },
  { name: "Facebook Post", size: "1200 × 630", w: 1200, h: 630, shape: "landscape" },
];

const formats = [
  { value: "image/webp", name: "WebP", detail: "Optimized for web" },
  { value: "image/jpeg", name: "JPG", detail: "Most compatible" },
  { value: "image/png", name: "PNG", detail: "Lossless quality" },
];

const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
};

function ImageResizer({ onBack }) {
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [original, setOriginal] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState("image/webp");
  const [quality, setQuality] = useState(85);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const ratio = original.h ? original.w / original.h : 1;
  const validDimensions =
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width >= 1 &&
    height >= 1 &&
    width <= 12000 &&
    height <= 12000 &&
    width * height <= 40000000;

  useEffect(() => {
    if (!file) {
      setSourceUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!sourceUrl) return;
    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      setOriginal({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.onerror = () => {
      if (!cancelled) setError("Unable to read this image.");
    };
    img.src = sourceUrl;

    return () => { cancelled = true; };
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceUrl || !validDimensions) {
      setOutputUrl("");
      setOutputSize(0);
      return;
    }

    let cancelled = false;
    let generatedUrl = "";
    const img = new Image();
    setProcessing(true);
    setOutputUrl("");

    img.onload = () => {
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setProcessing(false);
        setError("Canvas is not available.");
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (cancelled) return;
          setProcessing(false);

          if (!blob) {
            setError("Could not generate the resized image.");
            return;
          }

          if (blob.type !== format) {
            setError("This image format is not supported by your browser.");
            return;
          }

          generatedUrl = URL.createObjectURL(blob);
          setOutputSize(blob.size);
          setOutputUrl(generatedUrl);
          setError("");
        },
        format,
        quality / 100
      );
    };

    img.onerror = () => {
      if (!cancelled) {
        setProcessing(false);
        setError("Image processing failed.");
      }
    };

    img.src = sourceUrl;

    return () => {
      cancelled = true;
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [sourceUrl, width, height, format, quality, validDimensions]);

  const handleFile = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    setError("");
    setOriginal({ w: 0, h: 0 });
    setOutputUrl("");
    setFile(selected);
  };

  const changeWidth = (value) => {
    const w = Number(value);
    setWidth(w);
    if (locked && w > 0 && Number.isFinite(w)) {
      setHeight(Math.max(1, Math.round(w / ratio)));
    }
  };

  const changeHeight = (value) => {
    const h = Number(value);
    setHeight(h);
    if (locked && h > 0 && Number.isFinite(h)) {
      setWidth(Math.max(1, Math.round(h * ratio)));
    }
  };

  const usePreset = (preset) => {
    setLocked(false);
    setWidth(preset.w);
    setHeight(preset.h);
  };

  const resetDimensions = () => {
    setWidth(original.w);
    setHeight(original.h);
    setLocked(true);
  };

  const resetAll = () => {
    setFile(null);
    setSourceUrl("");
    setOutputUrl("");
    setOutputSize(0);
    setOriginal({ w: 0, h: 0 });
    setWidth(0);
    setHeight(0);
    setLocked(true);
    setFormat("image/webp");
    setQuality(85);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const download = () => {
    if (!outputUrl || processing) return;

    const extension = format === "image/jpeg" ? "jpg" : format.split("/")[1];
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${baseName}-resized-${width}x${height}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const savings = file && outputSize
    ? Math.round((1 - outputSize / file.size) * 100)
    : 0;

  return (
    <main className="ir-page">
      <div className="ir-shell">
        <button className="ir-back" onClick={() => onBack?.()}>
          <span>←</span> All tools
        </button>

        <header className="ir-hero">
          <div className="ir-hero-icon">↗</div>
          <div className="ir-kicker">IMAGE EDITING TOOL</div>
          <h1>Image <span>Resizer</span></h1>
          <p>
            Resize images with pixel-perfect control.
            Fast, private, and completely free.
          </p>
          <div className="ir-hero-tags">
            <span>✓ No sign-up</span>
            <span>✓ Instant processing</span>
            <span>✓ 100% private</span>
          </div>
        </header>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {!file ? (
          <section
            className={`ir-dropzone ${dragging ? "is-dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="ir-drop-icon">↑</div>
            <h2>Upload your image</h2>
            <p>Drag and drop your image here, or browse from your device.</p>
            <button
              className="ir-button-primary"
              onClick={() => fileInput.current?.click()}
            >
              Choose an image <span>→</span>
            </button>
            <small>Supports JPG, PNG, WebP and browser-compatible images</small>
          </section>
        ) : (
          <div className="ir-workspace">
            <div className="ir-file-strip">
              <div className="ir-file-identity">
                <div className="ir-file-symbol">▧</div>
                <div>
                  <strong title={file.name}>{file.name}</strong>
                  <small>
                    {formatBytes(file.size)} · {original.w} × {original.h} px
                  </small>
                </div>
              </div>
              <button onClick={resetAll} className="ir-text-button">
                Change image ↗
              </button>
            </div>

            <div className="ir-editor-grid">
              <div className="ir-editor-left">
                <section className="ir-panel">
                  <div className="ir-panel-heading">
                    <div>
                      <div className="ir-step">01 / DIMENSIONS</div>
                      <h2>Resize your image</h2>
                      <p>Set the exact dimensions you need.</p>
                    </div>
                    <button className="ir-reset" onClick={resetDimensions}>
                      ↺ Reset
                    </button>
                  </div>

                  <div className="ir-dimension-grid">
                    <label className="ir-field">
                      <span>Width</span>
                      <div className="ir-input-wrap">
                        <input
                          type="number"
                          min="1"
                          max="12000"
                          value={width}
                          onChange={(e) => changeWidth(e.target.value)}
                        />
                        <span className="ir-unit">px</span>
                      </div>
                    </label>

                    <button
                      className={`ir-ratio-button ${locked ? "is-locked" : ""}`}
                      onClick={() => setLocked(!locked)}
                      title="Toggle aspect ratio"
                      aria-label="Toggle aspect ratio"
                    >
                      {locked ? "🔒" : "🔓"}
                    </button>

                    <label className="ir-field">
                      <span>Height</span>
                      <div className="ir-input-wrap">
                        <input
                          type="number"
                          min="1"
                          max="12000"
                          value={height}
                          onChange={(e) => changeHeight(e.target.value)}
                        />
                        <span className="ir-unit">px</span>
                      </div>
                    </label>
                  </div>

                  <div className="ir-ratio-info">
                    <span className={`ir-status-dot ${locked ? "active" : ""}`} />
                    <div>
                      <strong>
                        Aspect ratio {locked ? "locked" : "unlocked"}
                      </strong>
                      <small>
                        {locked
                          ? "Dimensions stay proportional when edited."
                          : "Width and height can be changed independently."}
                      </small>
                    </div>
                  </div>

                  <div className="ir-subheading">
                    <h3>Quick presets</h3>
                    <span>Popular sizes</span>
                  </div>

                  <div className="ir-preset-grid">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        className={`ir-preset ${
                          width === preset.w && height === preset.h
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() => usePreset(preset)}
                      >
                        <span className={`ir-shape ${preset.shape}`} />
                        <strong>{preset.name}</strong>
                        <small>{preset.size}</small>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="ir-panel">
                  <div className="ir-panel-heading">
                    <div>
                      <div className="ir-step">02 / EXPORT</div>
                      <h2>Output settings</h2>
                      <p>Customize your final image.</p>
                    </div>
                  </div>

                  <div className="ir-subheading">
                    <h3>File format</h3>
                  </div>

                  <div className="ir-format-grid">
                    {formats.map((item) => (
                      <button
                        key={item.value}
                        className={`ir-format ${
                          format === item.value ? "is-selected" : ""
                        }`}
                        onClick={() => setFormat(item.value)}
                      >
                        <span className="ir-format-radio" />
                        <strong>{item.name}</strong>
                        <small>{item.detail}</small>
                      </button>
                    ))}
                  </div>

                  {format !== "image/png" && (
                    <div className="ir-quality-block">
                      <div className="ir-quality-head">
                        <div>
                          <strong>Image quality</strong>
                          <small>Balance file size and visual clarity</small>
                        </div>
                        <span>{quality}%</span>
                      </div>
                      <input
                        className="ir-range"
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        style={{ "--range-progress": `${(quality - 10) / 90 * 100}%` }}
                      />
                      <div className="ir-range-labels">
                        <span>Smaller file</span>
                        <span>Higher quality</span>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="ir-preview-panel">
                <div className="ir-preview-heading">
                  <div>
                    <div className="ir-step">03 / PREVIEW</div>
                    <h2>Live preview</h2>
                    <p>See your result before downloading.</p>
                  </div>
                  <span className="ir-live-badge">
                    <span /> LIVE
                  </span>
                </div>

                <div className="ir-preview-box">
                  {outputUrl ? (
                    <img src={outputUrl} alt="Resized preview" />
                  ) : (
                    <div className="ir-preview-wait">
                      {processing ? "Preparing preview..." : "Preview unavailable"}
                    </div>
                  )}
                </div>

                <div className="ir-preview-meta">
                  <span>OUTPUT DIMENSIONS</span>
                  <strong>{width} × {height} px</strong>
                </div>

                <div className="ir-stats">
                  <div>
                    <span>Original file</span>
                    <strong>{formatBytes(file.size)}</strong>
                  </div>
                  <div>
                    <span>Resized file</span>
                    <strong>{outputUrl ? formatBytes(outputSize) : "—"}</strong>
                  </div>
                </div>

                {outputUrl && (
                  <div className="ir-savings">
                    <span>File size change</span>
                    <strong>
                      {savings > 0
                        ? `${savings}% smaller`
                        : savings < 0
                          ? `${Math.abs(savings)}% larger`
                          : "Same size"}
                    </strong>
                  </div>
                )}

                {!validDimensions && (
                  <div className="ir-alert">
                    Dimensions must be 1–12,000 px, with a maximum of 40 million pixels.
                  </div>
                )}
                {error && <div className="ir-alert">{error}</div>}

                <button
                  className="ir-download"
                  disabled={!outputUrl || processing || !validDimensions}
                  onClick={download}
                >
                  <span>↓</span>
                  {processing ? "Processing..." : "Download image"}
                </button>

                <button className="ir-secondary-action" onClick={resetAll}>
                  Resize another image
                </button>

                <div className="ir-private-note">
                  <span>♧</span>
                  Your image is processed locally in your browser.
                </div>
              </aside>
            </div>
          </div>
        )}

        {error && !file && <div className="ir-alert">{error}</div>}

        <footer className="ir-footer">
          <span>FreeKit</span> · Smart tools, made simple.
        </footer>
      </div>
    </main>
  );
}

export default ImageResizer;
